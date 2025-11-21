import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserRole, User } from '../../../interfaces/user.interface';
import { Role } from '../../../services/role.service';
import { IUserService } from '../../../interfaces/user-service.interface';
import { USER_SERVICE_TOKEN } from '../../../services/user-service.token';
import {
  SectionHeaderComponent,
  SectionHeaderConfig,
} from '../../shared/section-header/section-header.component';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule, SectionHeaderComponent],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css'],
})
export default class RolesComponent implements OnInit {
  users = signal<User[]>([]);
  showCreateForm = signal(false);
  showEditForm = signal(false);
  editingUserId = signal<string | null>(null);
  searchTerm = signal('');

  headerConfig: SectionHeaderConfig = {
    title: 'Gestión de Roles y Usuarios',
    description: 'Administra usuarios del sistema y asigna roles de acceso',
    icon: 'fa-user-friends',
    buttonText: 'Crear Usuario',
    statistics: [],
  };

  // Form data
  newUser = signal({
    username: '',
    fullName: '',
    email: '',
    role: 'student',
  });

  // Edit form data
  editUser = signal({
    username: '',
    fullName: '',
    email: '',
    role: 'student',
  });

  // Validation error signals
  newUserEmailError = signal('');
  editUserEmailError = signal('');

  // Email validation function
  private validateEmail(email: string): string {
    if (!email) {
      return 'El correo electrónico es requerido';
    }
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return 'Por favor, ingresa un correo electrónico válido';
    }

    // Validación específica para dominio UIS (opcional)
    const uisEmailRegex = /^[a-zA-Z0-9._%+-]+@uis\.edu\.co$/;
    if (!uisEmailRegex.test(email)) {
      return 'El correo debe ser del dominio @uis.edu.co';
    }
    
    return '';
  }

  // Check if email already exists
  private emailExists(email: string, excludeUserId?: string): boolean {
    return this.users().some(user => 
      user.email.toLowerCase() === email.toLowerCase() && 
      user.id !== excludeUserId
    );
  }

  // Helper to update a field on the newUser signal from template bindings
  setNewUserField(field: string, value: any): void {
    this.newUser.update((prev) => ({ ...prev, [field]: value }));
    
    // Validate email on change
    if (field === 'email') {
      const emailError = this.validateEmail(value);
      if (emailError) {
        this.newUserEmailError.set(emailError);
      } else if (this.emailExists(value)) {
        this.newUserEmailError.set('Este correo electrónico ya está en uso');
      } else {
        this.newUserEmailError.set('');
      }
    }
  }

  // Helper to update a field on the editUser signal from template bindings
  setEditUserField(field: string, value: any): void {
    this.editUser.update((prev) => ({ ...prev, [field]: value }));
    
    // Validate email on change
    if (field === 'email') {
      const emailError = this.validateEmail(value);
      if (emailError) {
        this.editUserEmailError.set(emailError);
      } else if (this.emailExists(value, this.editingUserId() || undefined)) {
        this.editUserEmailError.set('Este correo electrónico ya está en uso');
      } else {
        this.editUserEmailError.set('');
      }
    }
  }

  availableRoles = [
    { id: 'student', name: 'Estudiante', color: '#388E3C', backgroundColor: '#4CAF50' },
    { id: 'teacher', name: 'Profesor', color: '#1976D2', backgroundColor: '#2196F3' },
    { id: 'admin', name: 'Administrador', color: '#4A148C', backgroundColor: '#9C27B0' },
  ];

  // Inyectar el servicio de usuario usando el token
  private userService = inject(USER_SERVICE_TOKEN);

  constructor() {}

  ngOnInit() {
    this.loadUsers();
    this.updateHeaderStatistics();
  }

  private getFullRoleById(roleId: string): Role {
    const roleMapping: Record<string, Role> = {
      student: {
        id: 'student',
        name: 'Estudiante',
        displayName: 'Estudiante',
        description: 'Usuario con permisos de estudiante',
        permissions: ['view_schedule', 'view_subjects'],
        colorScheme: {
          primary: '#388E3C',
          secondary: '#4CAF50',
          accent: '#2E7D32',
          text: '#FFFFFF',
          border: '#1B5E20',
          background: '#E8F5E9',
          gradient: 'linear-gradient(145deg, #388E3C 0%, #4CAF50 100%)',
          shadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        },
        menuItems: [
          { id: 'schedule', label: 'Mi Horario', icon: 'fa-calendar-alt', route: '/student/schedule', order: 1 },
          { id: 'subjects', label: 'Mis Asignaturas', icon: 'fa-book', route: '/student/subjects', order: 2 }
        ],
        iconClass: 'fa-user-graduate',
        routes: ['/student/schedule', '/student/subjects']
      },
      teacher: {
        id: 'teacher',
        name: 'Profesor',
        displayName: 'Profesor',
        description: 'Usuario con permisos de profesor',
        permissions: ['view_schedule', 'manage_subjects', 'view_students'],
        colorScheme: {
          primary: '#1976D2',
          secondary: '#2196F3',
          accent: '#0D47A1',
          text: '#FFFFFF',
          border: '#0D47A1',
          background: '#E3F2FD',
          gradient: 'linear-gradient(145deg, #1976D2 0%, #2196F3 100%)',
          shadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        },
        menuItems: [
          { id: 'schedule', label: 'Mi Horario', icon: 'fa-calendar-alt', route: '/teacher/schedule', order: 1 },
          { id: 'subjects', label: 'Mis Asignaturas', icon: 'fa-book', route: '/teacher/subjects', order: 2 },
        ],
        iconClass: 'fa-chalkboard-teacher',
        routes: ['/teacher/schedule', '/teacher/subjects']
      },
      admin: {
        id: 'admin',
        name: 'Administrador',
        displayName: 'Administrador del Sistema',
        description: 'Usuario con todos los permisos',
        permissions: ['*'],
        colorScheme: {
          primary: '#4A148C',
          secondary: '#9C27B0',
          accent: '#6A1B9A',
          text: '#FFFFFF',
          border: '#7B1FA2',
          background: '#F3E5F5',
          gradient: 'linear-gradient(145deg, #4A148C 0%, #9C27B0 100%)',
          shadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        },
        menuItems: [
          { id: 'roles', label: 'Asignar Roles', icon: 'fas fa-user-cog', route: '/admin/roles', order: 4 },
        ],
        iconClass: 'fa-user-shield',
        routes: ['/admin/roles']
      }
    };
    return roleMapping[roleId];
  }

  private loadUsers() {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.updateHeaderStatistics();
      },
      error: (error) => {
        console.error('Error loading users:', error);
        // Mostrar mensaje de error al usuario si es necesario
      }
    });
  }

  private updateHeaderStatistics() {
    const stats = this.getRoleStats();
    this.headerConfig.statistics = [
      {
        icon: 'fa-user-graduate',
        value: stats['student'] || 0,
        label: 'Estudiantes',
        color: '#4CAF50',
      },
      {
        icon: 'fa-user-tie',
        value: stats['teacher'] || 0,
        label: 'Profesores',
        color: '#2196F3',
      },
      {
        icon: 'fa-user-shield',
        value: stats['admin'] || 0,
        label: 'Administradores',
        color: '#9C27B0',
      },
    ];
  }

  toggleCreateForm(): void {
    this.showCreateForm.update((show: boolean) => !show);
    if (!this.showCreateForm()) {
      this.newUserEmailError.set('');
    }
  }

  createUser(): void {
    const userData = this.newUser();
    
    // Validate all fields
    if (!userData.username || !userData.fullName || !userData.email) {
      return;
    }

    // Validate email
    const emailError = this.validateEmail(userData.email);
    if (emailError) {
      this.newUserEmailError.set(emailError);
      return;
    }

    // Check if email already exists
    if (this.emailExists(userData.email)) {
      this.newUserEmailError.set('Este correo electrónico ya está en uso');
      return;
    }

    const selectedRole = this.availableRoles.find(
      (r) => r.id === userData.role
    );

    if (selectedRole) {
      const fullRole = this.getFullRoleById(selectedRole.id);
      const newUser: User = {
        id: Date.now().toString(),
        username: userData.username,
        fullName: userData.fullName,
        email: userData.email,
        role: fullRole
      };

      this.userService.createUser(newUser).subscribe({
        next: (createdUser) => {
          this.users.update((users: User[]) => [createdUser, ...users]);
          // Refresh statistics after adding a user
          this.updateHeaderStatistics();
        },
        error: (error) => {
          console.error('Error creating user:', error);
        }
      });

      // Reset form and errors
      this.newUser.set({
        username: '',
        fullName: '',
        email: '',
        role: 'student',
      });
      this.newUserEmailError.set('');

      this.showCreateForm.set(false);
    }
  }

  updateUserRole(userId: string, newRoleId: string): void {
    const selectedRole = this.availableRoles.find((r) => r.id === newRoleId);

    if (selectedRole) {
      const fullRole = this.getFullRoleById(selectedRole.id);
      this.users.update((users: User[]) =>
        users.map((user: User) =>
          user.id === userId ? { ...user, role: fullRole } : user
        )
      );
      // Refresh statistics after role change
      this.updateHeaderStatistics();
    }
  }

  onRoleChange(userId: string, event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target) {
      this.updateUserRole(userId, target.value);
    }
  }

  deleteUser(userId: string): void {
    this.userService.deleteUser(userId).subscribe({
      next: () => {
        this.users.update((users: User[]) =>
          users.filter((user: User) => user.id !== userId)
        );
        // Refresh statistics after deleting a user
        this.updateHeaderStatistics();
      },
      error: (error) => {
        console.error('Error deleting user:', error);
      }
    });
  }

  get filteredUsers(): User[] {
    const term = this.searchTerm().toLowerCase();
    return this.users().filter(
      (user: User) =>
        user.username.toLowerCase().includes(term) ||
        user.fullName.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.role.name.toLowerCase().includes(term)
    );
  }

  getRoleStats(): { [key: string]: number } {
    const stats: { [key: string]: number } = {};
    this.users().forEach((user: User) => {
      stats[user.role.id] = (stats[user.role.id] || 0) + 1;
    });
    return stats;
  }

  getRolePlural(roleName: string): string {
    switch (roleName) {
      case 'Estudiante':
        return 'Estudiantes';
      case 'Profesor':
        return 'Profesores';
      case 'Administrador':
        return 'Administradores';
      default:
        return roleName + 's';
    }
  }

  editUserById(userId: string): void {
    const user = this.users().find((u: User) => u.id === userId);
    if (user) {
      this.editingUserId.set(userId);
      this.editUser.set({
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role.id,
      });
      this.showEditForm.set(true);
      // Cerrar el formulario de creación si está abierto
      this.showCreateForm.set(false);
    }
  }

  updateUser(): void {
    const userId = this.editingUserId();
    const userData = this.editUser();
    
    if (!userId || !userData.username || !userData.fullName || !userData.email) {
      return;
    }

    // Validate email
    const emailError = this.validateEmail(userData.email);
    if (emailError) {
      this.editUserEmailError.set(emailError);
      return;
    }

    // Check if email already exists (excluding current user)
    if (this.emailExists(userData.email, userId)) {
      this.editUserEmailError.set('Este correo electrónico ya está en uso');
      return;
    }

    const selectedRole = this.availableRoles.find(
      (r) => r.id === userData.role
    );

    if (selectedRole) {
      const fullRole = this.getFullRoleById(selectedRole.id);
      const updatedUser: User = {
        id: userId,
        username: userData.username,
        fullName: userData.fullName,
        email: userData.email,
        role: fullRole,
      };

      this.userService.updateUser(userId, updatedUser).subscribe({
        next: (user) => {
          this.users.update((users: User[]) =>
            users.map((u: User) => (u.id === userId ? user : u))
          );
          // Refresh statistics after updating user
          this.updateHeaderStatistics();
          // Reset form and close
          this.closeEditForm();
        },
        error: (error) => {
          console.error('Error updating user:', error);
        }
      });
    }
  }

  closeEditForm(): void {
    this.showEditForm.set(false);
    this.editingUserId.set(null);
    this.editUser.set({
      username: '',
      fullName: '',
      email: '',
      role: 'student',
    });
    this.editUserEmailError.set('');
  }
}
