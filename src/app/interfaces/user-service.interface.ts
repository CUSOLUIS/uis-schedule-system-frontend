import { Observable } from 'rxjs';
import { User } from './user.interface';

export interface IUserService {
  /**
   * Obtener todos los usuarios
   */
  getUsers(): Observable<User[]>;

  /**
   * Obtener usuario por ID
   * @param id - ID del usuario
   */
  getUserById(id: string): Observable<User | null>;

  /**
   * Crear un nuevo usuario
   * @param user - Datos del usuario a crear
   */
  createUser(user: Omit<User, 'id'>): Observable<User>;

  /**
   * Actualizar un usuario existente
   * @param id - ID del usuario
   * @param updates - Datos a actualizar
   */
  updateUser(id: string, updates: Partial<User>): Observable<User>;

  /**
   * Eliminar un usuario
   * @param id - ID del usuario a eliminar
   */
  deleteUser(id: string): Observable<boolean>;

  /**
   * Buscar usuarios por término
   * @param searchTerm - Término de búsqueda
   */
  searchUsers(searchTerm: string): Observable<User[]>;
}

export interface UserApiResponse {
  success: boolean;
  data?: User | User[];
  message?: string;
}

export interface CreateUserRequest {
  username: string;
  fullName: string;
  email: string;
  roleId: string;
}

export interface UpdateUserRequest {
  username?: string;
  fullName?: string;
  email?: string;
  roleId?: string;
}