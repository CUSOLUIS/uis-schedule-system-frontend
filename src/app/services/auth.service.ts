import { Injectable, signal } from '@angular/core';
import {
  LoginUser,
  LoginRequest,
  LoginResponse,
  User,
} from '../interfaces/user.interface';
import { UserService } from './user.service';
import mockUsersData from '../data/mock-user.json';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isAuthenticated = signal<boolean>(false);
  private mockUsers: LoginUser[] = mockUsersData.users;

  constructor(private userService: UserService) {
    // Verificar si hay una sesión guardada al inicializar
    this.checkStoredSession();
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      // Simular delay de red
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const foundUser = this.mockUsers.find(
        (user) =>
          user.username === credentials.username &&
          user.password === credentials.password
      );

      if (foundUser) {
        const roleData = this.userService.getRoleById(foundUser.role);

        if (roleData) {
          const authenticatedUser: User = {
            id: foundUser.id,
            username: foundUser.username,
            role: roleData,
            fullName: foundUser.fullName,
            email: foundUser.email,
          };

          // Guardar usuario en el servicio
          this.userService.setCurrentUser(authenticatedUser);
          this.isAuthenticated.set(true);

          // Guardar en localStorage para persistencia
          this.saveSession(authenticatedUser);

          return {
            success: true,
            user: authenticatedUser,
          };
        }
      }

      return {
        success: false,
        message: 'Credenciales incorrectas',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error en el servidor',
      };
    }
  }

  logout(): void {
    this.userService.logout();
    this.isAuthenticated.set(false);
    this.clearSession();
  }

  getIsAuthenticated() {
    return this.isAuthenticated.asReadonly();
  }

  private saveSession(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('isAuthenticated', 'true');
  }

  private checkStoredSession(): void {
    const storedUser = localStorage.getItem('currentUser');
    const isAuth = localStorage.getItem('isAuthenticated');

    if (storedUser && isAuth === 'true') {
      try {
        const user: User = JSON.parse(storedUser);
        this.userService.setCurrentUser(user);
        this.isAuthenticated.set(true);
      } catch (error) {
        this.clearSession();
      }
    }
  }

  private clearSession(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAuthenticated');
  }

  // Método para obtener todos los usuarios (solo para desarrollo)
  getAllMockUsers(): LoginUser[] {
    return this.mockUsers;
  }
}
