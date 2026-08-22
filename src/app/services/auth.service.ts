import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
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
  private router = inject(Router);

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

  private isJwtValid(token: string | null): boolean {
    if (!token) {
      return false;
    }
    const payload = this.decodeJwt(token);
    return !!(payload && payload.exp && payload.exp * 1000 > Date.now());
  }

  private buildAuthenticatedUser(token: string): User {
    const claims = this.decodeJwt(token);

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

    const frontendRoleId = this.roleService.toFrontendRoleId(roleAuthority);
    const role =
      this.roleService.getRoleById(frontendRoleId) ||
      this.roleService.getDefaultRole();

    const rawId = claims?.id ?? null;
    const username =
      claims?.username ?? claims?.sub ?? claims?.email ?? 'unknown';

    return {
      id: rawId !== null ? String(rawId) : String(username),
      username: username,
      fullName: username,
      email: claims?.email ?? claims?.sub ?? username,
      role,
    };
  }

  login(
    credentials: LoginRequest,
    rememberMe: boolean = false,
  ): Observable<LoginResponse> {
    const isRemember = credentials.rememberMe ?? rememberMe;

    return this.http
      .post<any>(`${this.apiUrl}/login`, {
        usernameOrEmail: credentials.username,
        password: credentials.password,
      })
      .pipe(
        map((response) => {
          const data = response?.Data ?? response?.data ?? null;
          const token = data?.token ?? response?.token ?? response?.jwt ?? null;
          const refreshToken =
            data?.refreshToken ?? response?.refreshToken ?? null;

          if (token) {
            const authenticatedUser = this.buildAuthenticatedUser(token);
            const expMs = this.getTokenExpirationMs();

            this.userService.setCurrentUser(authenticatedUser);
            this.isAuthenticated.set(true);
            this.saveSession(
              authenticatedUser,
              token,
              refreshToken,
              isRemember,
            );

            return {
              success: true,
              user: authenticatedUser,
              token,
              refreshToken,
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
          console.error('[AuthService] Error en login:', error);
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

  /**
   * Cierra la sesión. Notifica al backend y limpia el estado local de
   * inmediato, redirigiendo a la pantalla de login.
   */
  logout(): void {
    const token = this.getToken();
    const refreshToken = this.getRefreshToken();

    if (token) {
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      const body = refreshToken ? { refreshToken } : {};
      this.http.post(`${this.apiUrl}/logout`, body, { headers }).subscribe({
        error: () => {},
      });
    }

    this.userService.logout();
    this.isAuthenticated.set(false);
    this.clearSession();
    this.router.navigate(['/login']);
  }

  /**
   * Solicita un nuevo access token usando el refresh token almacenado.
   * Solo procede si la opción 'Recuérdame' está activa y existe un refresh token.
   */
  refreshAccessToken(): Observable<string | null> {
    const rememberMe = this.isRememberMeEnabled();
    const refreshToken = this.getRefreshToken();

    if (!rememberMe || !refreshToken) {
      console.warn(
        `[AuthService] refreshAccessToken() rechazado: Recuérdame=${rememberMe}, refreshToken=${!!refreshToken}. Cerrando sesión.`,
      );
      this.logout();
      return of(null);
    }

    return this.http.post<any>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
      map((response) => {
        const data = response?.Data ?? response?.data ?? null;
        const newToken = data?.token ?? null;
        const newRefreshToken = data?.refreshToken ?? null;

        if (!newToken || !newRefreshToken) {
          throw new Error('Respuesta de refresh inválida');
        }

        localStorage.setItem('token', newToken);
        if (rememberMe) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }
        this.isAuthenticated.set(true);
        const expMs = this.getTokenExpirationMs();

        return newToken;
      }),
      catchError((err) => {
        console.error('[AuthService] Error al renovar token:', err);
        this.logout();
        return of(null);
      }),
    );
  }

  getIsAuthenticated() {
    return this.isAuthenticated.asReadonly();
  }

  /**
   * Indica si el usuario seleccionó la opción 'Recuérdame' para la sesión actual.
   */
  isRememberMeEnabled(): boolean {
    return localStorage.getItem('rememberMe') === 'true';
  }

  getTokenExpirationMs(): number | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }
    const payload = this.decodeJwt(token);
    if (payload && typeof payload.exp === 'number') {
      return payload.exp * 1000;
    }
    return null;
  }

  getTokenRemainingMs(): number | null {
    const expMs = this.getTokenExpirationMs();
    if (expMs === null) {
      return null;
    }
    return expMs - Date.now();
  }

  isTokenExpiringSoon(bufferMs: number = 2 * 60 * 1000): boolean {
    const remaining = this.getTokenRemainingMs();
    if (remaining === null) {
      return false;
    }
    return remaining <= bufferMs;
  }

  private saveSession(
    user: User,
    token: string,
    refreshToken?: string | null,
    rememberMe: boolean = false,
  ): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('token', token);
    if (rememberMe && refreshToken) {
      localStorage.setItem('rememberMe', 'true');
      localStorage.setItem('refreshToken', refreshToken);
    } else {
      localStorage.removeItem('rememberMe');
      localStorage.removeItem('refreshToken');
    }
  }

  private checkStoredSession(): void {
    const storedUser = localStorage.getItem('currentUser');
    const isAuth = localStorage.getItem('isAuthenticated');
    const token = localStorage.getItem('token');
    const rememberMe = this.isRememberMeEnabled();
    const refreshToken = this.getRefreshToken();

    if (!storedUser || isAuth !== 'true' || !token) {
      return;
    }

    try {
      const user: User = JSON.parse(storedUser);

      if (this.isJwtValid(token)) {
        const remainingMs = this.getTokenRemainingMs();
        this.userService.setCurrentUser(user);
        this.isAuthenticated.set(true);
        return;
      }

      // El access token expiró: solo se mantiene viva la sesión
      // si 'Recuérdame' está activo Y existe un refresh token válido.
      if (rememberMe && refreshToken && this.isJwtValid(refreshToken)) {
        this.userService.setCurrentUser(user);
        this.isAuthenticated.set(true);
        return;
      }

      console.warn(
        '[AuthService] Sesión expirada: token inválido y Recuérdame no está activo o refreshToken inválido. Limpiando.',
      );
      this.clearSession();
    } catch {
      console.error(
        '[AuthService] Error al parsear sesión almacenada. Limpiando.',
      );
      this.clearSession();
    }
  }

  private clearSession(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('rememberMe');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }
}
