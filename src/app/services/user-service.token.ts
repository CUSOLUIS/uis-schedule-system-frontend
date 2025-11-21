import { InjectionToken } from '@angular/core';
import { IUserService } from '../interfaces/user-service.interface';

// Token para la inyección del servicio de usuario
export const USER_SERVICE_TOKEN = new InjectionToken<IUserService>('UserService');