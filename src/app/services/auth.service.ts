import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import {
  LoginUser,
  LoginRequest,
  LoginResponse,
  User,
} from '../interfaces/user.interface';
import { UserService } from './user.service';
import { RoleService } from './role.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isAuthenticated = signal<boolean>(false);
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private roleService: RoleService
  ) {
    // Verificar si hay una sesión guardada al inicializar
    this.checkStoredSession();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<any>(`${this.apiUrl}/log-in`, credentials).pipe(
      map((response) => {
        if (response.status) {
          // Asumiendo que el backend devuelve el usuario completo o necesitamos obtenerlo
          // Por ahora, crear un usuario básico
          const roleData = this.roleService.getRoleById('admin'); // Placeholder, ajustar según lógica

          if (roleData) {
            const authenticatedUser: User = {
              id: '1', // Placeholder
              username: response.username,
              role: roleData,
              fullName: 'Usuario', // Placeholder
              email: response.username,
            };

            // Guarda usuario en el servicio
            this.userService.setCurrentUser(authenticatedUser);
            this.isAuthenticated.set(true);

            // Guarda token y usuario en localStorage
            this.saveSession(authenticatedUser, response.jwt);

            return {
              success: true,
              user: authenticatedUser,
              token: response.jwt,
            };
          } else {
            return {
              success: false,
              message: 'Rol no encontrado',
            };
          }
        } else {
          return {
            success: false,
            message: response.message || 'Credenciales incorrectas',
          };
        }
      }),
      catchError((error) => {
        return of({
          success: false,
          message: error.error?.message || 'Error en el servidor',
        });
      })
    );
  }

  logout(): void {
    this.userService.logout();
    this.isAuthenticated.set(false);
    this.clearSession();
  }

  getIsAuthenticated() {
    return this.isAuthenticated.asReadonly();
  }

  private saveSession(user: User, token: string): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('token', token);
  }

  private checkStoredSession(): void {
    const storedUser = localStorage.getItem('currentUser');
    const isAuth = localStorage.getItem('isAuthenticated');
    const token = localStorage.getItem('token');

    if (storedUser && isAuth === 'true' && token) {
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
    localStorage.removeItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
