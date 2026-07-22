import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ApiResponse,
  PaginatedResponse,
  UserListDTO,
  UserRole,
} from '../interfaces/user-list.dto';

@Injectable({
  providedIn: 'root',
})
export class UserPaginatedService {
  private readonly apiUrl = `${environment.apiUrl}/api/users`;

  constructor(private http: HttpClient) {}

  getUsersByRole(
    role: UserRole,
    page: number = 0,
    size: number = 10
  ): Observable<PaginatedResponse<UserListDTO>> {
    const params = new HttpParams()
      .set('role', role)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http
      .get<ApiResponse<PaginatedResponse<UserListDTO>>>(this.apiUrl, { params })
      .pipe(
        map((response) => {
          // FIX: el backend usa "Errors" (array) en vez de "success" (boolean).
          // Si tiene elementos, fue un error; si está vacío, fue exitoso.
          if (response.Errors && response.Errors.length > 0) {
            throw new Error(response.Errors.join(', ') || response.Message || 'Error al obtener usuarios');
          }
          return response.Data;
        }),
        catchError(this.handleError)
      );
  }

  getDocentes(page: number = 0, size: number = 10) {
    return this.getUsersByRole('TEACHER', page, size);
  }

  getEstudiantes(page: number = 0, size: number = 10) {
    return this.getUsersByRole('STUDENT', page, size);
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    const msg = error.error?.message || `Error ${error.status}: ${error.statusText}`;
    return throwError(() => new Error(msg));
  };
}