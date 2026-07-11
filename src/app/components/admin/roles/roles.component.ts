import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { RoleService } from '../../../services/role.service';
import { IUserService } from '../../../interfaces/user-service.interface';
import { USER_SERVICE_TOKEN } from '../../../services/user-service.token';
import { UserPaginatedService } from '../../../services/user-paginated.service';
import {
  UserListDTO,
  PaginatedResponse,
  UserRole,
} from '../../../interfaces/user-list.dto';
import {
  SectionHeaderComponent,
  SectionHeaderConfig,
} from '../../shared/section-header/section-header.component';

type ActiveTab = 'docentes' | 'estudiantes';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule, SectionHeaderComponent],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css'],
})
export default class RolesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private userService = inject(USER_SERVICE_TOKEN);
  private userPaginatedService = inject(UserPaginatedService);
  private roleService = inject(RoleService);

  
  activeTab = signal<ActiveTab>('docentes');
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  docentesData = signal<PaginatedResponse<UserListDTO> | null>(null);
  estudiantesData = signal<PaginatedResponse<UserListDTO> | null>(null);
  docentesPage = signal(0);
  estudiantesPage = signal(0);
  readonly pageSize = 10;

  // Conteo de administradores solo para la estadística del header
  adminCount = signal(0);

  // ── Estado de formularios ────────────────────────────────────────────────
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

  newUser = signal({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'student',
  });

  editUser = signal({
    firstName: '',
    lastName: '',
    email: '',
    role: 'student',
  });

  newUserEmailError = signal('');
  editUserEmailError = signal('');
  formError = signal('');

  availableRoles = [
    { id: 'student', name: 'Estudiante' },
    { id: 'teacher', name: 'Profesor' },
    { id: 'admin', name: 'Administrador' },
  ];

  ngOnInit(): void {
    this.loadDocentes();
    this.loadAdminCount();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAdminCount(): void {
    this.userPaginatedService
      .getUsersByRole('ADMINISTRADOR' as UserRole, 0, 1)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.adminCount.set(data.totalElements);
          this.updateHeaderStatistics();
        },
        error: () => this.adminCount.set(0),
      });
  }

  // ── Pestañas y paginación ────────────────────────────────────────────────
  switchTab(tab: ActiveTab): void {
    if (this.activeTab() === tab) return;
    this.activeTab.set(tab);
    this.errorMessage.set(null);

    if (tab === 'docentes' && !this.docentesData()) {
      this.loadDocentes();
    } else if (tab === 'estudiantes' && !this.estudiantesData()) {
      this.loadEstudiantes();
    }
  }

  loadDocentes(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.userPaginatedService
      .getDocentes(this.docentesPage(), this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.docentesData.set(data);
          this.isLoading.set(false);
          this.updateHeaderStatistics();
        },
        error: (err: Error) => {
          this.errorMessage.set(err.message);
          this.isLoading.set(false);
        },
      });
  }

  loadEstudiantes(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.userPaginatedService
      .getEstudiantes(this.estudiantesPage(), this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.estudiantesData.set(data);
          this.isLoading.set(false);
          this.updateHeaderStatistics();
        },
        error: (err: Error) => {
          this.errorMessage.set(err.message);
          this.isLoading.set(false);
        },
      });
  }

  retryLoad(): void {
    this.activeTab() === 'docentes' ? this.loadDocentes() : this.loadEstudiantes();
  }

  private reloadCurrentTab(): void {
    this.activeTab() === 'docentes' ? this.loadDocentes() : this.loadEstudiantes();
  }

  get currentData(): PaginatedResponse<UserListDTO> | null {
    return this.activeTab() === 'docentes' ? this.docentesData() : this.estudiantesData();
  }

  get currentPage(): number {
    return this.activeTab() === 'docentes' ? this.docentesPage() : this.estudiantesPage();
  }

  get totalPages(): number {
    return this.currentData?.totalPages ?? 0;
  }

  get isLastPage(): boolean {
    return this.currentData?.last ?? true;
  }

  goToNextPage(): void {
    if (this.isLastPage) return;
    if (this.activeTab() === 'docentes') {
      this.docentesPage.update((p) => p + 1);
      this.loadDocentes();
    } else {
      this.estudiantesPage.update((p) => p + 1);
      this.loadEstudiantes();
    }
  }

  goToPrevPage(): void {
    if (this.currentPage === 0) return;
    if (this.activeTab() === 'docentes') {
      this.docentesPage.update((p) => p - 1);
      this.loadDocentes();
    } else {
      this.estudiantesPage.update((p) => p - 1);
      this.loadEstudiantes();
    }
  }

  // Filtro en cliente, solo sobre la página actual ya cargada.
  get filteredData(): UserListDTO[] {
    const content = this.currentData?.content ?? [];
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return content;

    return content.filter(
      (u) =>
        u.firstName.toLowerCase().includes(term) ||
        u.lastName.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.username.toLowerCase().includes(term)
    );
  }

  getFullName(user: UserListDTO): string {
    return `${user.firstName} ${user.lastName}`.trim();
  }

  getInitials(user: UserListDTO): string {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }

  trackByUserId(_: number, user: UserListDTO): string {
    return user.id;
  }

  private updateHeaderStatistics(): void {
    this.headerConfig.statistics = [
      {
        icon: 'fa-user-graduate',
        value: this.estudiantesData()?.totalElements ?? 0,
        label: 'Estudiantes',
        color: '#4CAF50',
      },
      {
        icon: 'fa-user-tie',
        value: this.docentesData()?.totalElements ?? 0,
        label: 'Profesores',
        color: '#2196F3',
      },
      {
        icon: 'fa-user-shield',
        value: this.adminCount(),
        label: 'Administradores',
        color: '#9C27B0',
      },
    ];
  }

  // ── Crear usuario ─────────────────────────────────────────────────────────
  toggleCreateForm(): void {
    this.showCreateForm.update((v) => !v);
    if (!this.showCreateForm()) {
      this.newUserEmailError.set('');
      this.formError.set('');
    }
  }

  setNewUserField(field: string, value: any): void {
    this.newUser.update((prev) => ({ ...prev, [field]: value }));
    if (field === 'email') {
      this.newUserEmailError.set(this.validateEmail(value));
    }
  }

  createUser(): void {
    const u = this.newUser();
    this.formError.set('');

    if (!u.firstName || !u.lastName || !u.email || !u.password) {
      this.formError.set('Todos los campos son obligatorios');
      return;
    }

    const emailError = this.validateEmail(u.email);
    if (emailError) {
      this.newUserEmailError.set(emailError);
      return;
    }

    const role = this.roleService.getRoleById(u.role);
    if (!role) return;

    this.userService
      .createUser(
        { username: '', fullName: `${u.firstName} ${u.lastName}`, email: u.email, role },
        u.password
      )
      .subscribe({
        next: () => {
          this.newUser.set({ firstName: '', lastName: '', email: '', password: '', role: 'student' });
          this.newUserEmailError.set('');
          this.showCreateForm.set(false);
          this.activeTab.set(u.role === 'teacher' ? 'docentes' : 'estudiantes');
          this.reloadCurrentTab();
        },
        error: (err) => this.formError.set(err.message),
      });
  }

  // ── Editar usuario ────────────────────────────────────────────────────────
  editUserById(user: UserListDTO): void {
    // FIX: user.roles ya viene tipado como string[] en UserListDTO,
    // así que no hace falta Array.isArray/Array.from (eso hacía que
    // TS infiriera {} en la rama "false" y rompiera toFrontendRoleId).
    const roleName = user.roles[0];

    this.editingUserId.set(user.id);
    this.editUser.set({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: roleName ? this.roleService.toFrontendRoleId(roleName) : 'student',
    });
    this.showEditForm.set(true);
    this.showCreateForm.set(false);
    this.formError.set('');
  }

  setEditUserField(field: string, value: any): void {
    this.editUser.update((prev) => ({ ...prev, [field]: value }));
    if (field === 'email') {
      this.editUserEmailError.set(this.validateEmail(value));
    }
  }

  updateUser(): void {
    const id = this.editingUserId();
    const u = this.editUser();
    this.formError.set('');

    if (!id || !u.firstName || !u.lastName || !u.email) {
      this.formError.set('Todos los campos son obligatorios');
      return;
    }

    const emailError = this.validateEmail(u.email);
    if (emailError) {
      this.editUserEmailError.set(emailError);
      return;
    }

    const role = this.roleService.getRoleById(u.role);

    this.userService
      .updateUser(id, {
        fullName: `${u.firstName} ${u.lastName}`,
        email: u.email,
        role: role ?? undefined,
      })
      .subscribe({
        next: () => {
          this.closeEditForm();
          this.reloadCurrentTab();
        },
        error: (err) => this.formError.set(err.message),
      });
  }

  closeEditForm(): void {
    this.showEditForm.set(false);
    this.editingUserId.set(null);
    this.editUser.set({ firstName: '', lastName: '', email: '', role: 'student' });
    this.editUserEmailError.set('');
    this.formError.set('');
  }

  deleteUser(id: string): void {
    this.userService.deleteUser(id).subscribe({
      next: () => this.reloadCurrentTab(),
      error: (err) => console.error('Error deleting user:', err),
    });
  }

  private validateEmail(email: string): string {
    if (!email) {
      return 'El correo electrónico es requerido';
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return 'Por favor, ingresa un correo electrónico válido';
    }

    const uisEmailRegex = /^[a-zA-Z0-9._%+-]+@uis\.edu\.co$/;
    if (!uisEmailRegex.test(email)) {
      return 'El correo debe ser del dominio @uis.edu.co';
    }

    return '';
  }
}