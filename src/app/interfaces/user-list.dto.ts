// src/app/interfaces/user-list.dto.ts

export interface UserListDTO {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  roles: string[];
  active: boolean;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// FIX: el backend responde con "Data" / "Message" / "Errors"
// (mayúscula inicial, sin campo "success"), no con "data"/"message"/"success".
export interface ApiResponse<T> {
  Data: T;
  Message: string;
  Errors: string[];
}

export type UserRole = 'DOCENTE' | 'ESTUDIANTE' | 'ADMINISTRADOR' | 'OPERADOR';