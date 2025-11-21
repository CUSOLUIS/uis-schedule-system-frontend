import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../interfaces/user.interface';
import { 
  IUserService, 
  UserApiResponse, 
  CreateUserRequest, 
  UpdateUserRequest 
} from '../interfaces/user-service.interface';
import { RoleService } from './role.service';

@Injectable({
  providedIn: 'root'
})
export class UserHttpService implements IUserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(
    private http: HttpClient,
    private roleService: RoleService
  ) {}

  getUsers(): Observable<User[]> {
    return this.http.get<UserApiResponse>(this.apiUrl).pipe(
      map(response => {
        if (response.success && Array.isArray(response.data)) {
          return response.data.map(userData => this.mapToUser(userData));
        }
        return [];
      }),
      catchError(this.handleError)
    );
  }

  getUserById(id: string): Observable<User | null> {
    return this.http.get<UserApiResponse>(`${this.apiUrl}/${id}`).pipe(
      map(response => {
        if (response.success && response.data && !Array.isArray(response.data)) {
          return this.mapToUser(response.data);
        }
        return null;
      }),
      catchError(this.handleError)
    );
  }

  createUser(userData: Omit<User, 'id'>): Observable<User> {
    const createRequest: CreateUserRequest = {
      username: userData.username,
      fullName: userData.fullName,
      email: userData.email,
      roleId: userData.role.id
    };

    return this.http.post<UserApiResponse>(this.apiUrl, createRequest).pipe(
      map(response => {
        if (response.success && response.data && !Array.isArray(response.data)) {
          return this.mapToUser(response.data);
        }
        throw new Error(response.message || 'Error creating user');
      }),
      catchError(this.handleError)
    );
  }

  updateUser(id: string, updates: Partial<User>): Observable<User> {
    const updateRequest: UpdateUserRequest = {
      username: updates.username,
      fullName: updates.fullName,
      email: updates.email,
      roleId: updates.role?.id
    };

    return this.http.put<UserApiResponse>(`${this.apiUrl}/${id}`, updateRequest).pipe(
      map(response => {
        if (response.success && response.data && !Array.isArray(response.data)) {
          return this.mapToUser(response.data);
        }
        throw new Error(response.message || 'Error updating user');
      }),
      catchError(this.handleError)
    );
  }

  deleteUser(id: string): Observable<boolean> {
    return this.http.delete<UserApiResponse>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.success),
      catchError(this.handleError)
    );
  }

  searchUsers(searchTerm: string): Observable<User[]> {
    return this.http.get<UserApiResponse>(`${this.apiUrl}/search?q=${encodeURIComponent(searchTerm)}`).pipe(
      map(response => {
        if (response.success && Array.isArray(response.data)) {
          return response.data.map(userData => this.mapToUser(userData));
        }
        return [];
      }),
      catchError(this.handleError)
    );
  }

  private mapToUser(userData: any): User {
    const role = this.roleService.getRoleById(userData.roleId || userData.role?.id);
    
    if (!role) {
      throw new Error(`Role not found for user: ${userData.username}`);
    }

    return {
      id: userData.id,
      username: userData.username,
      fullName: userData.fullName,
      email: userData.email,
      role: role
    };
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    console.error('UserHttpService Error:', error);
    
    let errorMessage = 'Ocurrió un error inesperado';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = error.error?.message || `Error ${error.status}: ${error.message}`;
    }
    
    return throwError(() => new Error(errorMessage));
  };
}