import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { User } from '../interfaces/user.interface';
import { IUserService } from '../interfaces/user-service.interface';
import { MOCK_USERS } from '../mocks/mock-users';
import { RoleService } from './role.service';

@Injectable({
  providedIn: 'root'
})
export class UserMockService implements IUserService {
  private users: User[] = [...MOCK_USERS];
  private readonly NETWORK_DELAY = 800; // Simular delay de red (ms)

  constructor(private roleService: RoleService) {}

  getUsers(): Observable<User[]> {
    return of([...this.users]).pipe(
      delay(this.NETWORK_DELAY)
    );
  }

  getUserById(id: string): Observable<User | null> {
    const user = this.users.find(u => u.id === id);
    return of(user ? { ...user } : null).pipe(
      delay(this.NETWORK_DELAY)
    );
  }

  // El password no se usa en el mock (no hay autenticación real aquí), pero
  // se recibe para respetar la firma de IUserService y no romper el build.
  createUser(userData: Omit<User, 'id'>, _password: string): Observable<User> {
    // Simular validación de email único
    if (this.users.some(u => u.email === userData.email)) {
      return throwError(() => new Error('El correo electrónico ya está en uso')).pipe(
        delay(this.NETWORK_DELAY)
      );
    }

    // Simular validación de username único
    if (userData.username && this.users.some(u => u.username === userData.username)) {
      return throwError(() => new Error('El nombre de usuario ya está en uso')).pipe(
        delay(this.NETWORK_DELAY)
      );
    }

    const newUser: User = {
      ...userData,
      username: userData.username || this.generateUsernameFrom(userData.fullName),
      id: this.generateId()
    };

    this.users.push(newUser);

    return of({ ...newUser }).pipe(
      delay(this.NETWORK_DELAY)
    );
  }

  updateUser(id: string, updates: Partial<User>): Observable<User> {
    const userIndex = this.users.findIndex(u => u.id === id);

    if (userIndex === -1) {
      return throwError(() => new Error('Usuario no encontrado')).pipe(
        delay(this.NETWORK_DELAY)
      );
    }

    if (updates.email && this.users.some(u => u.id !== id && u.email === updates.email)) {
      return throwError(() => new Error('El correo electrónico ya está en uso')).pipe(
        delay(this.NETWORK_DELAY)
      );
    }

    if (updates.username && this.users.some(u => u.id !== id && u.username === updates.username)) {
      return throwError(() => new Error('El nombre de usuario ya está en uso')).pipe(
        delay(this.NETWORK_DELAY)
      );
    }

    this.users[userIndex] = {
      ...this.users[userIndex],
      ...updates
    };

    return of({ ...this.users[userIndex] }).pipe(
      delay(this.NETWORK_DELAY)
    );
  }

  deleteUser(id: string): Observable<boolean> {
    const userIndex = this.users.findIndex(u => u.id === id);

    if (userIndex === -1) {
      return throwError(() => new Error('Usuario no encontrado')).pipe(
        delay(this.NETWORK_DELAY)
      );
    }

    this.users.splice(userIndex, 1);

    return of(true).pipe(
      delay(this.NETWORK_DELAY)
    );
  }

  searchUsers(searchTerm: string): Observable<User[]> {
    if (!searchTerm.trim()) {
      return this.getUsers();
    }

    const term = searchTerm.toLowerCase();
    const filteredUsers = this.users.filter(user =>
      user.username.toLowerCase().includes(term) ||
      user.fullName.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.role.name.toLowerCase().includes(term) ||
      user.role.displayName.toLowerCase().includes(term)
    );

    return of([...filteredUsers]).pipe(
      delay(this.NETWORK_DELAY)
    );
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  private generateUsernameFrom(fullName: string): string {
    return fullName.trim().toLowerCase().replace(/\s+/g, '.');
  }

  resetData(): void {
    this.users = [...MOCK_USERS];
  }

  getUserStats(): Observable<Record<string, number>> {
    const stats: Record<string, number> = {};

    this.users.forEach(user => {
      const roleId = user.role.id;
      stats[roleId] = (stats[roleId] || 0) + 1;
    });

    return of(stats).pipe(
      delay(this.NETWORK_DELAY)
    );
  }

  simulateNetworkError(): Observable<never> {
    return throwError(() => new Error('Error de conexión simulado')).pipe(
      delay(this.NETWORK_DELAY)
    );
  }
}