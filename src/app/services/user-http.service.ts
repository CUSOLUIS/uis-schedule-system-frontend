import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../interfaces/user.interface';
import {
  IUserService,
  UserApiResponse,
  CreateUserRequest,
  UpdateUserRequest,
} from '../interfaces/user-service.interface';
import { RoleService } from './role.service';


interface PaginatedUsersApiResponse {
  success: boolean;
  data?: { content: any[] };
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserHttpService implements IUserService {
  private apiUrl = `${environment.apiUrl}/api/users`;

  constructor(
    private http: HttpClient,
    private roleService: RoleService
  ) {}

  // Nota: el backend no tiene "traer todos sin filtro"; listAll SIEMPRE pagina.
  // Este método queda solo por compatibilidad de interfaz; para listados reales
  // usar UserPaginatedService (pestañas Docentes/Estudiantes en roles.component).
  getUsers(): Observable<User[]> {
    return this.http
      .get<PaginatedUsersApiResponse>(`${this.apiUrl}?page=0&size=1000`)
      .pipe(
        map((response) => {
          const content = response?.data?.content ?? [];
          return content.map((u: any) => this.mapToUser(u));
        }),
        catchError(this.handleError)
      );
  }

  getUserById(id: string): Observable<User | null> {
    return this.http.get<UserApiResponse>(`${this.apiUrl}/${id}`).pipe(
      map((response) =>
        response.success && response.data ? this.mapToUser(response.data) : null
      ),
      catchError(this.handleError)
    );
  }

  createUser(userData: Omit<User, 'id'>, password: string): Observable<User> {
    const { firstName, lastName } = this.splitFullName(userData.fullName);
    const createRequest: CreateUserRequest = {
      firstName,
      lastName,
      email: userData.email,
      password,
      roles: [this.roleService.toBackendRoleName(userData.role.id)],
    };

    return this.http.post<UserApiResponse>(this.apiUrl, createRequest).pipe(
      map((response) => {
        if (response.success && response.data) {
          return this.mapToUser(response.data);
        }
        throw new Error(response.message || 'Error creating user');
      }),
      catchError(this.handleError)
    );
  }

  updateUser(id: string, updates: Partial<User>): Observable<User> {
    const nameParts = updates.fullName ? this.splitFullName(updates.fullName) : null;

    const updateRequest: UpdateUserRequest = {
      firstName: nameParts?.firstName,
      lastName: nameParts?.lastName,
      email: updates.email,
      roles: updates.role ? [this.roleService.toBackendRoleName(updates.role.id)] : undefined,
    };

    return this.http.put<UserApiResponse>(`${this.apiUrl}/${id}`, updateRequest).pipe(
      map((response) => {
        if (response.success && response.data) {
          return this.mapToUser(response.data);
        }
        throw new Error(response.message || 'Error updating user');
      }),
      catchError(this.handleError)
    );
  }

  deleteUser(id: string): Observable<boolean> {
    return this.http.delete<UserApiResponse>(`${this.apiUrl}/${id}`).pipe(
      map((response) => response.success),
      catchError(this.handleError)
    );
  }

  searchUsers(searchTerm: string): Observable<User[]> {
    // El backend no expone /users/search; el filtro real se hace en el
    // cliente sobre la página actual (ver roles.component.filteredData).
    return this.getUsers();
  }

  private splitFullName(fullName: string): { firstName: string; lastName: string } {
    const parts = fullName.trim().split(/\s+/);
    const firstName = parts[0] ?? '';
    const lastName = parts.slice(1).join(' ') || firstName;
    return { firstName, lastName };
  }

  private mapToUser(userData: any): User {
    const roleNames: string[] = Array.isArray(userData.roles)
      ? userData.roles
      : Array.from(userData.roles ?? []);
    const roleId = roleNames.length
      ? this.roleService.toFrontendRoleId(roleNames[0])
      : 'student';
    const role = this.roleService.getRoleById(roleId);

    if (!role) {
      throw new Error(`Role not found for user: ${userData.username}`);
    }

    return {
      id: userData.id,
      username: userData.username,
      fullName:
        userData.fullName ?? `${userData.firstName ?? ''} ${userData.lastName ?? ''}`.trim(),
      email: userData.email,
      role,
    };
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    console.error('UserHttpService Error:', error);

    let errorMessage = 'Ocurrió un error inesperado';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = error.error?.message || `Error ${error.status}: ${error.message}`;
    }

    return throwError(() => new Error(errorMessage));
  };
}