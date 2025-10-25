import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { User, MenuItem, LoginUser } from '../interfaces/user.interface';
import { RoleService } from './role.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private roleService = inject(RoleService);
  private http = inject(HttpClient);
  private users = signal<User[]>([]);
  private currentUser = signal<User | null>(null);
  private apiUrl = `${environment.apiUrl}/api/users`;

  readonly menuItems: Record<string, MenuItem[]> = {
    admin: [
      /* {
        icon: 'fa-calendar-alt',
        label: 'Horario',
        route: '/admin/schedule',
        visible: true,
        description: 'Gestiona los horarios académicos',
      }, */
      {
        icon: 'fa-door-open',
        label: 'Aulas',
        route: '/admin/classrooms',
        visible: true,
        description: 'Administrar aulas y espacios',
      },
      {
        icon: 'fa-book',
        label: 'Asignaturas',
        route: '/admin/subjects',
        visible: true,
        description: 'Gestiona materias y programas',
      },
      {
        icon: 'fa-user-tie',
        label: 'Profesores',
        route: '/admin/teachers',
        visible: true,
        description: 'Gestionar docentes del sistema',
      },
      {
        icon: 'fas fa-user-cog',
        label: 'Asignar Roles',
        route: '/admin/roles',
        visible: true,
        description: 'Administrar roles de usuarios',
      },
      {
        icon: 'fa-cog',
        label: 'Configuración',
        route: '/admin/settings',
        visible: true,
        description: 'Configurar el sistema',
      },
    ],
    teacher: [
      {
        icon: 'fa-calendar-alt',
        label: 'Mi Horario',
        route: '/teacher/schedule',
        visible: true,
        description: 'Consulta tu horario académico',
      },
      {
        icon: 'fa-book',
        label: 'Mis Asignaturas',
        route: '/teacher/subjects',
        visible: true,
        description: 'Gestiona tus materias',
      },
      {
        icon: 'fa-user-circle',
        label: 'Perfil',
        route: '/teacher/profile',
        visible: true,
        description: 'Actualiza tu información personal',
      },
    ],
    student: [
      {
        icon: 'fa-calendar-alt',
        label: 'Mi Horario',
        route: '/student/schedule',
        visible: true,
        description: 'Consulta tu horario académico',
      },
      {
        icon: 'fa-book',
        label: 'Mis Asignaturas',
        route: '/student/subjects',
        visible: true,
        description: 'Consulta tus materias inscritas',
      },
      {
        icon: 'fa-user-circle',
        label: 'Perfil',
        route: '/student/profile',
        visible: true,
        description: 'Actualiza tu información personal',
      },
    ],
  };

  constructor() {}

  getCurrentUser() {
    return this.currentUser.asReadonly();
  }

  setCurrentUser(user: User) {
    this.currentUser.set(user);
  }

  logout() {
    this.currentUser.set(null);
  }

  getMenuItemsForUser(roleId: string): MenuItem[] {
    // Primero intentar obtener del RoleService
    const roleMenuItems = this.roleService.getRoleMenuItems(roleId);
    if (roleMenuItems.length > 0) {
      // Convierte MenuItem del RoleService al formato MenuItem del UserService
      return roleMenuItems
        .sort((a, b) => a.order - b.order)
        .map((item) => ({
          icon: item.icon,
          label: item.label,
          route: item.route,
          visible: item.visible !== false, // Default to true si no está especificado
          description: `${item.label} - ${roleId}`,
        }));
    }

    // Fallback al menú estático existente
    return this.menuItems[roleId] || [];
  }

  getUsers(): User[] {
    return this.users();
  }

  // Método para obtener usuarios del backend
  getUsersFromBackend(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Método adicional para obtener usuarios mock (para compatibilidad)
  getMockUsers(): LoginUser[] {
    // Placeholder, ya que ahora usamos backend
    return [];
  }
}
