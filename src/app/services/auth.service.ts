import { HttpClient, HttpHeaders } from '@angular/common/http';
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

  private isJwtValid(token: string | null): boolean {
    if (!token) {
      return false;
    }
    const payload = this.decodeJwt(token);
    return !!(payload && payload.exp && payload.exp * 1000 > Date.now());
  }

  private buildAuthenticatedUser(token: string): User {
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

  login(credentials: LoginRequest): Observable<LoginResponse> {
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

            this.userService.setCurrentUser(authenticatedUser);
            this.isAuthenticated.set(true);
            this.saveSession(authenticatedUser, token, refreshToken);

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

  /**
   * Cierra la sesión. Notifica al backend y limpia el estado local de
   * inmediato para que la UI reaccione sin esperar la respuesta de red.
   */
  logout(): void {
    const token = this.getToken();
    const refreshToken = this.getRefreshToken();

    if (token) {
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      const body = refreshToken ? { refreshToken } : {};
      this.http.post(`${this.apiUrl}/logout`, body, { headers }).subscribe({
        error: () => {
          // La sesión local se cierra de todas formas; ya que
          // un fallo de red o un token ya expirado no debe
          // impedir que el usuario salga.
        },
      });
    }

    this.userService.logout();
    this.isAuthenticated.set(false);
    this.clearSession();
  }

  /**
   * Solicita un nuevo access token usando el refresh token almacenado.
   * Usado por el interceptor HTTP cuando una petición falla con 401.
   * Si el refresh token no es válido, cierra la sesión local.
   */
  refreshAccessToken(): Observable<string | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
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

        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          localStorage.setItem('token', newToken);
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        return newToken;
      }),
      catchError(() => {
        // El refresh token es inválido, expiró o ya fue usado: se fuerza el
        // cierre de sesión local (sin volver a llamar al backend).
        this.userService.logout();
        this.isAuthenticated.set(false);
        this.clearSession();
        return of(null);
      }),
    );
  }

  getIsAuthenticated() {
    return this.isAuthenticated.asReadonly();
  }

  private saveSession(
    user: User,
    token: string,
    refreshToken?: string | null,
  ): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('token', token);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  private checkStoredSession(): void {
    const storedUser = localStorage.getItem('currentUser');
    const isAuth = localStorage.getItem('isAuthenticated');
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');

    if (!storedUser || isAuth !== 'true' || !token) {
      return;
    }

    try {
      const user: User = JSON.parse(storedUser);

      if (this.isJwtValid(token)) {
        this.userService.setCurrentUser(user);
        this.isAuthenticated.set(true);
        return;
      }

      // El access token expiró, pero si el refresh token sigue siendo
      // válido mantenemos la sesión: el interceptor lo renovará
      // automáticamente en la primera petición HTTP que se haga.
      if (this.isJwtValid(refreshToken)) {
        this.userService.setCurrentUser(user);
        this.isAuthenticated.set(true);
        return;
      }

      console.warn('Sesión expirada o token inválido.');
      this.clearSession();
    } catch {
      this.clearSession();
    }
  }

  private clearSession(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }
}
