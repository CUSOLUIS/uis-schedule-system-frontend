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
   * @param password - Contraseña del usuario (CAMBIO: el backend la exige
   * en CreateUserRequest y no venía en la versión anterior de esta interfaz)
   */
  createUser(user: Omit<User, 'id'>, password: string): Observable<User>;

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

// CAMBIO: antes tenía { username, fullName, email, roleId }.
// El backend real (CreateUserRequest.java) no recibe username (lo genera él)
// ni roleId singular; pide firstName/lastName por separado, password, y
// roles como arreglo (Set<String> en Java).
export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roles: string[];
}

// CAMBIO: antes tenía { username, fullName, roleId }.
// El backend real (UpdateUserRequest.java) usa firstName/lastName por
// separado, roles como arreglo, y además soporta 'active'.
export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  active?: boolean;
  roles?: string[];
}