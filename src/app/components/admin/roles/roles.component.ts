import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserRole } from '../../../interfaces/user.interface';
import { MOCK_USERS, User } from '../../../mocks/mock-users';
import {
  SectionHeaderComponent,
  SectionHeaderConfig,
} from '../../shared/section-header/section-header.component';
import { RoleService, Role } from '../../../services/role.service';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule, SectionHeaderComponent],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css'],
})
export class RolesComponent implements OnInit {
  users = signal<User[]>([]);
  showCreateForm = signal(false);
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

  // Helper to update a field on the newUser signal from template bindings
  setNewUserField(field: string, value: any): void {
    this.newUser.update((prev) => ({ ...prev, [field]: value }));
  }

  private roleService = inject(RoleService);
  availableRoles: Role[] = [];

  constructor() {}

  ngOnInit() {
    this.availableRoles = this.roleService.getAllRoles();
    this.loadUsers();
    this.updateHeaderStatistics();
  }

  private loadUsers() {
    // In a real application, this would be an API call
    this.users.set(MOCK_USERS);
    // Ensure header statistics reflect the loaded users
    this.updateHeaderStatistics();
  }

  private updateHeaderStatistics() {
    const stats = this.getRoleStats();
    const studentRole = this.roleService.getRoleById('student');
    const teacherRole = this.roleService.getRoleById('teacher');
    const adminRole = this.roleService.getRoleById('admin');
    
    this.headerConfig.statistics = [
      {
        icon: 'fa-user-graduate',
        value: stats['student'] || 0,
        label: 'Estudiantes',
        color: studentRole?.colorScheme.secondary || '#4CAF50',
      },
      {
        icon: 'fa-user-tie',
        value: stats['teacher'] || 0,
        label: 'Profesores',
        color: teacherRole?.colorScheme.secondary || '#2196F3',
      },
      {
        icon: 'fa-user-shield',
        value: stats['admin'] || 0,
        label: 'Administradores',
        color: adminRole?.colorScheme.secondary || '#9C27B0',
      },
    ];
  }

  toggleCreateForm(): void {
    this.showCreateForm.update((show: boolean) => !show);
  }

  createUser(): void {
    if (
      this.newUser().username &&
      this.newUser().fullName &&
      this.newUser().email
    ) {
      const selectedRole = this.availableRoles.find(
        (r) => r.id === this.newUser().role
      );

      if (selectedRole) {
        const newUser: User = {
          id: Date.now().toString(),
          username: this.newUser().username,
          fullName: this.newUser().fullName,
          email: this.newUser().email,
          role: selectedRole,
          createdAt: new Date(),
        };

        this.users.update((users: User[]) => [newUser, ...users]);
        // Refresh statistics after adding a user
        this.updateHeaderStatistics();

        // Reset form
        this.newUser.set({
          username: '',
          fullName: '',
          email: '',
          role: 'student',
        });

        this.showCreateForm.set(false);
      }
    }
  }

  updateUserRole(userId: string, newRoleId: string): void {
    const selectedRole = this.availableRoles.find((r) => r.id === newRoleId);

    if (selectedRole) {
      this.users.update((users: User[]) =>
        users.map((user: User) =>
          user.id === userId ? { ...user, role: selectedRole } : user
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
    this.users.update((users: User[]) =>
      users.filter((user: User) => user.id !== userId)
    );
    // Refresh statistics after deleting a user
    this.updateHeaderStatistics();
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
}
