import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { RoleService } from '../../../services/role.service';

export interface QuickAccessItem {
  icon: string;
  label: string;
  route: string;
  description: string | null;
}

/**
 * Descripción de cada acceso según el final de su ruta. El menú del rol solo trae
 * "<título> - <rol>", que no aporta nada al usuario.
 */
const QUICK_ACCESS_DESCRIPTIONS: Record<string, string> = {
  schedule: 'Consulta tus clases de la semana',
  subjects: 'Revisa las materias que tienes a cargo o inscritas',
  profile: 'Actualiza tus datos personales',
  'cambiar-contrasena': 'Cambia tu contraseña de acceso',
  classrooms: 'Administra aulas y su disponibilidad',
  teachers: 'Gestiona el cuerpo docente',
  roles: 'Asigna roles y permisos',
  invitations: 'Invita nuevos usuarios',
  settings: 'Ajusta la configuración del sistema',
};

const DASHBOARD_ROUTE = '/dashboard';

function describeRoute(route: string): string | null {
  const last = route.split('/').filter(Boolean).pop() ?? '';
  return QUICK_ACCESS_DESCRIPTIONS[last] ?? null;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export default class DashboardComponent {
  private userService = inject(UserService);
  private roleService = inject(RoleService);
  private router = inject(Router);

  currentUser = this.userService.getCurrentUser();

  /** Colores del rol que el CSS usa como variables; los valores por defecto son los del docente. */
  readonly roleColors = computed(() => {
    const scheme = this.roleService.getRoleById(this.currentUser()?.role?.id || '')?.colorScheme;
    return {
      gradient: scheme?.gradient || 'linear-gradient(135deg, #1E5A9F 0%, #1565C0 100%)',
      primary: scheme?.primary || '#D1E7FB',
      text: scheme?.text || '#1565C0',
    };
  });

  navigateToSchedule(): void {
    const user = this.currentUser();
    if (user) {
      const roleId = user.role.id;
      switch (roleId) {
        case 'admin':
          this.router.navigate(['/admin/schedule']);
          break;
        case 'teacher':
          this.router.navigate(['/teacher/schedule']);
          break;
        case 'student':
          this.router.navigate(['/student/schedule']);
          break;
      }
    }
  }

  navigateToSubjects(): void {
    const user = this.currentUser();
    if (user) {
      const roleId = user.role.id;
      switch (roleId) {
        case 'admin':
          this.router.navigate(['/admin/subjects']);
          break;
        case 'teacher':
          this.router.navigate(['/teacher/subjects']);
          break;
        case 'student':
          this.router.navigate(['/student/subjects']);
          break;
      }
    }
  }

  /** Accesos del rol, sin la página actual y con una descripción útil. */
  readonly quickAccess = computed<QuickAccessItem[]>(() => {
    const roleId = this.currentUser()?.role?.id || 'ESTUDIANTE';
    const current = this.router.url.split('?')[0];
    return (this.userService.getMenuItemsForUser(roleId) ?? [])
      .filter((item) => item.route && item.visible !== false)
      .filter((item) => item.route !== DASHBOARD_ROUTE && item.route !== current)
      .map((item) => ({
        icon: item.icon,
        label: item.label,
        route: item.route,
        description: describeRoute(item.route),
      }));
  });

  navigateToProfile(): void {
    const user = this.currentUser();
    if (user) {
      const roleId = user.role.id;
      switch (roleId) {
        case 'admin':
          this.router.navigate(['/admin/settings']);
          break;
        case 'teacher':
          this.router.navigate(['/teacher/profile']);
          break;
        case 'student':
          this.router.navigate(['/student/profile']);
          break;
      }
    }
  }

  // Nuevo método para navegar a profesores
  navigateToTeachers(): void {
    this.router.navigate(['/admin/teachers']);
  }

  // Nuevo método para navegar a roles
  navigateToRoles(): void {
    this.router.navigate(['/admin/roles']);
  }
}
