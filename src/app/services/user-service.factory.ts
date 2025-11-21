import { environment } from '../../environments/environment';
import { UserHttpService } from './user-http.service';
import { UserMockService } from './user-mock.service';
import { IUserService } from '../interfaces/user-service.interface';

/**
 * Factory function para crear la instancia correcta del servicio de usuario
 * basado en la configuración del environment
 */
export function userServiceFactory(
  httpService: UserHttpService,
  mockService: UserMockService
): IUserService {
  if (environment.useMocks) {
    console.log('🎭 Usando UserMockService para desarrollo');
    return mockService;
  } else {
    console.log('🌐 Usando UserHttpService para backend real');
    return httpService;
  }
}