import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import {
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
        if (response && response.success) {
          // El backend debe devolver el usuario completo con rol
          const user = response.user;
          
          if (user && user.role) {
            // Crear el usuario con los datos del backend
            const authenticatedUser: User = {
              id: user.id,
              username: user.username,
              fullName: user.fullName,
              email: user.email,
              role: user.role
            };

            // Guarda usuario en el servicio
            this.userService.setCurrentUser(authenticatedUser);
            this.isAuthenticated.set(true);

            // Guarda token y usuario en localStorage
            this.saveSession(authenticatedUser, response.token);

            return {
              success: true,
              user: authenticatedUser,
              token: response.token,
            };
          } else {
            return {
              success: false,
              message: 'Datos de usuario incompletos',
            };
          }
        } else {
          return {
            success: false,
            message: response?.message || 'Credenciales incorrectas',
          };
        }
      }),
      catchError((error) => {
        console.error('Error en login:', error);
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
