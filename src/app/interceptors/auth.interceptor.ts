import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(private authService: AuthService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    const authReq = token ? this.addToken(req, token) : req;

    return next.handle(authReq).pipe(
      catchError((error) => {
        if (
          error instanceof HttpErrorResponse &&
          error.status === 401 &&
          !this.isAuthEndpoint(req.url)
        ) {
          console.warn(
            `[AuthInterceptor] 401 recibido en: ${req.url}. Intentando manejar...`,
          );
          return this.handle401(req, next);
        }
        return throwError(() => error);
      }),
    );
  }

  private addToken(req: HttpRequest<any>, token: string): HttpRequest<any> {
    return req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });
  }

  /** Endpoints de auth que nunca deben disparar un intento de refresh. */
  private isAuthEndpoint(url: string): boolean {
    return (
      url.includes('/auth/login') ||
      url.includes('/auth/signup') ||
      url.includes('/auth/refresh') ||
      url.includes('/auth/logout') ||
      url.includes('/auth/password/')
    );
  }

  private handle401(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    const rememberMe = this.authService.isRememberMeEnabled();
    const hasRefreshToken = !!this.authService.getRefreshToken();

    // Si 'Recuérdame' NO está activo o no hay refresh token: cerrar sesión
    if (!rememberMe || !hasRefreshToken) {
      console.warn(
        `[AuthInterceptor] 401 sin posibilidad de refresh (rememberMe=${rememberMe}, refreshToken=${hasRefreshToken}). Cerrando sesión.`,
      );
      this.authService.logout();
      return throwError(() => new Error('Sesión expirada'));
    }

    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshAccessToken().pipe(
        switchMap((newToken) => {
          this.isRefreshing = false;

          if (!newToken) {
            console.warn(
              '[AuthInterceptor] Renovación reactiva fallida. Cerrando sesión.',
            );
            this.authService.logout();
            return throwError(
              () => new Error('No fue posible renovar la sesión'),
            );
          }

          this.refreshTokenSubject.next(newToken);
          return next.handle(this.addToken(req, newToken));
        }),
        catchError((err) => {
          this.isRefreshing = false;
          console.error(
            '[AuthInterceptor] Error al renovar token reactivamente:',
            err,
          );
          this.authService.logout();
          return throwError(() => err);
        }),
      );
    }

    // Ya hay un refresh en curso: esperar y reintentar con el nuevo token
    return this.refreshTokenSubject.pipe(
      filter((token): token is string => token !== null),
      take(1),
      switchMap((token) => next.handle(this.addToken(req, token))),
    );
  }
}
