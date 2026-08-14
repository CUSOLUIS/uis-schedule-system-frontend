import { Injectable, DestroyRef, inject, effect } from '@angular/core';
import { fromEvent, merge, Subscription, timer } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import { AuthService } from './auth.service';

/**
 * Servicio encargado del monitoreo de la actividad del usuario,
 * renovación proactiva del access token y cierre automático de sesión por inactividad/expiración.
 */
@Injectable({
  providedIn: 'root',
})
export class SessionActivityService {
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  /** Tiempo máximo de inactividad permitido para renovar proactivamente (15 minutos) */
  private readonly IDLE_TIMEOUT_MS = 15 * 60 * 1000;

  /** Margen de anticipación para refrescar el token antes de que expire (2 minutos) */
  private readonly REFRESH_BUFFER_MS = 2 * 60 * 1000;

  /** Frecuencia del chequeo periódico de expiración e inactividad (cada 30 segundos) */
  private readonly CHECK_INTERVAL_MS = 30 * 1000;

  private lastActivityTimestamp = Date.now();
  private activitySubscription: Subscription | null = null;
  private timerSubscription: Subscription | null = null;
  private isRefreshingProactively = false;

  constructor() {
    effect(() => {
      const isAuthenticated = this.authService.getIsAuthenticated()();
      if (isAuthenticated) {
        this.startMonitoring();
      } else {
        this.stopMonitoring();
      }
    });

    this.destroyRef.onDestroy(() => {
      this.stopMonitoring();
    });
  }

  public init(): void {
    if (this.authService.getIsAuthenticated()()) {
      this.startMonitoring();
    }
  }

  private startMonitoring(): void {
    this.stopMonitoring();
    this.updateActivity();

    const userEvents$ = merge(
      fromEvent(window, 'mousemove'),
      fromEvent(window, 'keydown'),
      fromEvent(window, 'click'),
      fromEvent(window, 'scroll'),
      fromEvent(window, 'touchstart'),
    ).pipe(throttleTime(3000));

    this.activitySubscription = userEvents$.subscribe(() => {
      this.onUserActivity();
    });

    this.timerSubscription = timer(0, this.CHECK_INTERVAL_MS).subscribe(() => {
      this.checkAndRefreshProactively();
    });
  }

  private stopMonitoring(): void {
    if (this.activitySubscription) {
      this.activitySubscription.unsubscribe();
      this.activitySubscription = null;
    }
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;
    }
    this.isRefreshingProactively = false;
  }

  private updateActivity(): void {
    this.lastActivityTimestamp = Date.now();
  }

  private onUserActivity(): void {
    this.updateActivity();
    this.checkAndRefreshProactively();
  }

  public isUserIdle(): boolean {
    const idleMs = Date.now() - this.lastActivityTimestamp;
    const idle = idleMs > this.IDLE_TIMEOUT_MS;
    return idle;
  }

  /**
   * Revisa el token actual en cada intervalo o interacción.
   *
   * Reglas de cierre automático:
   * 1. Si el access token expiró (remainingMs <= 0) y 'Recuérdame' NO está activo
   *    o el usuario está inactivo: se cierra la sesión de inmediato.
   * 2. Si el access token va a expirar (remainingMs <= REFRESH_BUFFER_MS) y
   *    'Recuérdame' está activo y usuario está activo: se ejecuta la renovación proactiva.
   */
  private checkAndRefreshProactively(): void {
    if (
      !this.authService.getIsAuthenticated()() ||
      this.isRefreshingProactively
    ) {
      return;
    }

    const remainingMs = this.authService.getTokenRemainingMs();
    if (remainingMs === null) {
      return;
    }

    const rememberMe = this.authService.isRememberMeEnabled();
    const idle = this.isUserIdle();

    // CASO 1: El access token ya expiró
    if (remainingMs <= 0) {
      if (!rememberMe || idle) {
        console.warn(
          `[SessionActivityService] Token EXPIRADO y no se puede renovar (rememberMe=${rememberMe}, idle=${idle}). Cerrando sesión automáticamente.`,
        );
        this.authService.logout();
        return;
      }
      // Recuérdame activo y usuario activo: intentar renovar
      this.triggerProactiveRefresh();
      return;
    }

    // CASO 2: El access token está próximo a expirar
    if (remainingMs <= this.REFRESH_BUFFER_MS) {
      if (rememberMe && !idle) {
        this.triggerProactiveRefresh();
      }
    }
  }

  private triggerProactiveRefresh(): void {
    if (this.isRefreshingProactively) {
      return;
    }
    this.isRefreshingProactively = true;

    this.authService.refreshAccessToken().subscribe({
      next: (newToken) => {
        this.isRefreshingProactively = false;
        if (newToken) {
          this.updateActivity();
        } else {
          console.warn(
            '[SessionActivityService] Refresh proactivo devolvió null. Cerrando sesión.',
          );
          this.authService.logout();
        }
      },
      error: (err) => {
        this.isRefreshingProactively = false;
        console.error(
          '[SessionActivityService] Error en refresh proactivo:',
          err,
        );
        this.authService.logout();
      },
    });
  }
}
