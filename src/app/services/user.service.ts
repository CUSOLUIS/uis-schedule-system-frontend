import { Injectable, signal } from '@angular/core';
import {
  User,
  UserRole,
  MenuItem,
  LoginUser,
} from '../interfaces/user.interface';
import mockUsersData from '../data/mock-user.json';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private users = signal<User[]>([]);
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
      /* {
        icon: 'fa-calendar-alt',
        label: 'Horario',
        route: '/admin/schedule',
        visible: true,
      }, */
      {
        icon: 'fa-door-open',
        label: 'Aulas',
        route: '/admin/classrooms',
        visible: true,
      },
      {
        icon: 'fa-book',
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
        icon: 'fa-cog',
        label: 'Configuración',
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
        icon: 'fa-book',
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
        label: 'Mis Asignaturas',
        route: '/student/subjects',
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

  constructor() {
    // Inicializar usuarios después de que userRoles esté definido
    this.initializeUsers();
  }

  private initializeUsers(): void {
    const transformedUsers = this.transformMockUsers();
    this.users.set(transformedUsers);
  }

  private transformMockUsers(): User[] {
    const mockUsers = mockUsersData.users as LoginUser[];
    return mockUsers.map((mockUser) => {
      const role = this.userRoles[mockUser.role];
      if (!role) {
        throw new Error(`Rol no encontrado: ${mockUser.role}`);
      }

      return {
        id: mockUser.id,
        username: mockUser.username,
        role: role,
        fullName: mockUser.fullName,
        email: mockUser.email,
      };
    });
  }

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

  getUsers(): User[] {
    return this.users();
  }

  // Método adicional para obtener usuarios mock en formato LoginUser
  getMockUsers(): LoginUser[] {
    return mockUsersData.users as LoginUser[];
  }
}
