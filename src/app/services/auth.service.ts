import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  LoginRequest,
  LoginResponse,
  User,
} from '../interfaces/user.interface';
import { RoleService } from './role.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isAuthenticated = signal<boolean>(false);
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private roleService: RoleService,
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
    return this.http
      .post<any>(`${this.apiUrl}/login`, {
        usernameOrEmail: credentials.username,
        password: credentials.password,
      })
      .pipe(
        map((response) => {
          // Backend retorna ApiResponse<AuthResponse> -> Data.token
          const data = response?.Data ?? response?.data ?? null;
          const token = data?.token ?? response?.token ?? response?.jwt ?? null;

          if (token) {
            const claims = this.decodeJwt(token);

            // 'roles' claim puede ser un array o un string. Preferimos el primer role.
            let roleAuthority: string = 'guest';
            if (
              claims?.roles &&
              Array.isArray(claims.roles) &&
              claims.roles.length > 0
            ) {
              roleAuthority = String(claims.roles[0]);
            } else if (claims?.roles) {
              roleAuthority = String(claims.roles);
            } else if (claims?.role) {
              roleAuthority = String(claims.role);
            }

            const role =
              this.roleService.getRoleById(roleAuthority) ||
              this.roleService.getDefaultRole();

            const rawId = claims?.id ?? null;
            const username =
              claims?.username ?? claims?.sub ?? claims?.email ?? 'unknown';
            const authenticatedUser: User = {
              id: rawId !== null ? String(rawId) : String(username),
              username: username,
              fullName: username,
              email: claims?.email ?? claims?.sub ?? username,
              role,
            };

            this.userService.setCurrentUser(authenticatedUser);
            this.isAuthenticated.set(true);
            this.saveSession(authenticatedUser, token);

            return {
              success: true,
              user: authenticatedUser,
              token,
            };
          }

          return {
            success: false,
            message:
              data?.message ??
              response?.Message ??
              response?.message ??
              'Credenciales incorrectas',
          };
        }),
        catchError((error) => {
          console.error('Error en login:', error);
          return of({
            success: false,
            message:
              error.error?.Message ??
              error.error?.message ??
              'Error en el servidor',
          });
        }),
      );
  }

  requestPasswordReset(
    email: string,
  ): Observable<{ success: boolean; message: string }> {
    return this.http
      .post<any>(`${this.apiUrl}/password/forgot`, { email })
      .pipe(
        map((response) => ({
          success: true,
          message:
            response?.Message ??
            response?.message ??
            'Si el correo está registrado, recibirás instrucciones para recuperar tu contraseña',
        })),
        catchError((error) =>
          of({
            success: false,
            message:
              error.error?.Message ??
              error.error?.message ??
              'No fue posible enviar la solicitud. Intenta nuevamente.',
          }),
        ),
      );
  }

  resetPassword(
    token: string,
    newPassword: string,
  ): Observable<{ success: boolean; message: string }> {
    return this.http
      .post<any>(`${this.apiUrl}/password/reset/${encodeURIComponent(token)}`, {
        newPassword,
      })
      .pipe(
        map((response) => ({
          success: true,
          message:
            response?.Message ??
            response?.message ??
            'Contraseña restablecida correctamente',
        })),
        catchError((error) =>
          of({
            success: false,
            message:
              error.error?.Message ??
              error.error?.message ??
              'No fue posible restablecer la contraseña.',
          }),
        ),
      );
  }

  changePassword(
    currentPassword: string,
    newPassword: string,
  ): Observable<{ success: boolean; message: string }> {
    return this.http
      .put<any>(`${this.apiUrl}/password/change`, {
        currentPassword,
        newPassword,
      })
      .pipe(
        map((response) => ({
          success: true,
          message:
            response?.Message ??
            response?.message ??
            'Contraseña actualizada correctamente',
        })),
        catchError((error) =>
          of({
            success: false,
            message:
              error.error?.Message ??
              error.error?.message ??
              'No fue posible cambiar la contraseña.',
          }),
        ),
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
        if (payload && payload.exp && payload.exp * 1000 > Date.now()) {
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
