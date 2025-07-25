import { Injectable, signal } from '@angular/core';
import { User, UserRole, MenuItem } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private currentUser = signal<User | null>(null);

  readonly userRoles: Record<string, UserRole> = {
    admin: {
      id: 'admin',
      name: 'ADMIN',
      color: '#FFFFFF',
      backgroundColor: '#4A148C',
    },
    teacher: {
      id: 'teacher',
      name: 'PROFESOR',
      color: '#FFFFFF',
      backgroundColor: '#1976D2',
    },
    student: {
      id: 'student',
      name: 'ESTUDIANTE',
      color: '#FFFFFF',
      backgroundColor: '#388E3C',
    },
  };

  readonly menuItems: Record<string, MenuItem[]> = {
    admin: [
      {
        icon: 'fa-calendar-alt',
        label: 'Horario',
        route: '/admin/schedule',
        visible: true,
      },
      {
        icon: 'fa-users',
        label: 'Grupos',
        route: '/admin/groups',
        visible: true,
      },
      {
        icon: 'fa-clipboard-list',
        label: 'Asignaturas',
        route: '/admin/subjects',
        visible: true,
      },
      {
        icon: 'fa-user-tie',
        label: 'Profesores',
        route: '/admin/teachers',
        visible: true,
      },
      {
        icon: 'fa-user-friends',
        label: 'Roles',
        route: '/admin/roles',
        visible: true,
      },
      {
        icon: 'fa-cog',
        label: 'Ajustes',
        route: '/admin/settings',
        visible: true,
      },
    ],
    teacher: [
      {
        icon: 'fa-calendar-alt',
        label: 'Mi Horario',
        route: '/teacher/schedule',
        visible: true,
      },
      {
        icon: 'fa-users',
        label: 'Mis Grupos',
        route: '/teacher/groups',
        visible: true,
      },
      {
        icon: 'fa-clipboard-list',
        label: 'Mis Asignaturas',
        route: '/teacher/subjects',
        visible: true,
      },
      {
        icon: 'fa-user-circle',
        label: 'Perfil',
        route: '/teacher/profile',
        visible: true,
      },
    ],
    student: [
      {
        icon: 'fa-calendar-alt',
        label: 'Mi Horario',
        route: '/student/schedule',
        visible: true,
      },
      {
        icon: 'fa-book',
        label: 'Mis Materias',
        route: '/student/subjects',
        visible: true,
      },
      {
        icon: 'fa-users',
        label: 'Mi Grupo',
        route: '/student/group',
        visible: true,
      },
      {
        icon: 'fa-user-circle',
        label: 'Perfil',
        route: '/student/profile',
        visible: true,
      },
    ],
  };

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
    return this.menuItems[roleId] || [];
  }

  getRoleById(roleId: string): UserRole | null {
    return this.userRoles[roleId] || null;
  }
}
