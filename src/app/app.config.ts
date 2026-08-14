import {
  APP_INITIALIZER,
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { USER_SERVICE_TOKEN } from './services/user-service.token';
import { userServiceFactory } from './services/user-service.factory';
import { UserHttpService } from './services/user-http.service';
import { UserMockService } from './services/user-mock.service';
import { SessionActivityService } from './services/session-activity.service';

import { routes } from './app.routes';

export function initializeSessionActivity(sessionActivityService: SessionActivityService) {
  return () => sessionActivityService.init();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    // Configuración condicional del servicio de usuario
    UserHttpService,
    UserMockService,
    {
      provide: USER_SERVICE_TOKEN,
      useFactory: userServiceFactory,
      deps: [UserHttpService, UserMockService],
    },
    // Monitoreo proactivo de sesión e inactividad
    SessionActivityService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeSessionActivity,
      deps: [SessionActivityService],
      multi: true,
    },
  ],
};
