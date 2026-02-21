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
    this.checkStoredSession();
  }

  /** Decode JWT payload without external library */
  private decodeJwt(token: string): any {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<any>(`${this.apiUrl}/login`, {
      usernameOrEmail: credentials.username,
      password: credentials.password,
    }).pipe(
      map((response) => {
        // Backend returns: { username, message, jwt, status }
        if (response && response.status === true && response.jwt) {
          const claims = this.decodeJwt(response.jwt);

          // El backend almacena el rol como un string en el campo 'role'
          // Ej. "ADMINISTRADOR", lo comparamos de forma segura
          const roleAuthority = claims?.role || 'guest';

          // Como los IDs en mock-roles.json ahora hacen match con el BAC (ADMINISTRADOR, DOCENTE, etc)
          // en caso contrario retorna el default
          const role = this.roleService.getRoleById(roleAuthority) || this.roleService.getDefaultRole();

          const authenticatedUser: User = {
            id: claims?.sub || response.username,
            username: response.username,
            fullName: response.username,
            email: claims?.sub || response.username,
            role,
          };

          this.userService.setCurrentUser(authenticatedUser);
          this.isAuthenticated.set(true);
          this.saveSession(authenticatedUser, response.jwt);

          return {
            success: true,
            user: authenticatedUser,
            token: response.jwt,
          };
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
        const payload = this.decodeJwt(token);
        // Validar que el token decodificado exista y no haya expirado
        // payload.exp viene en segundos, Date.now() en milisegundos
        if (payload && payload.exp && (payload.exp * 1000 > Date.now())) {
          const user: User = JSON.parse(storedUser);
          this.userService.setCurrentUser(user);
          this.isAuthenticated.set(true);
        } else {
          console.warn('Sesión expirada o token inválido.');
          this.clearSession();
        }
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
