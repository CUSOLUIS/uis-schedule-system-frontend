import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserRole } from '../../../interfaces/user.interface';

interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css']
})
export class RolesComponent {
  users = signal<User[]>([]);
  showCreateForm = signal(false);
  searchTerm = signal('');
  
  // Form data
  newUser = signal({
    username: '',
    fullName: '',
    email: '',
    role: 'student'
  });

  availableRoles = [
    { id: 'student', name: 'Estudiante', color: '#388E3C', backgroundColor: '#4CAF50' },
    { id: 'teacher', name: 'Profesor', color: '#1976D2', backgroundColor: '#2196F3' },
    { id: 'admin', name: 'Administrador', color: '#4A148C', backgroundColor: '#9C27B0' }
  ];

  constructor() {
    // Datos de ejemplo
    this.users.set([
      {
        id: '1',
        username: 'juan.perez',
        fullName: 'Juan Pérez',
        email: 'juan.perez@uis.edu.co',
        role: { id: 'student', name: 'Estudiante', color: '#388E3C', backgroundColor: '#4CAF50' },
        createdAt: new Date('2024-01-15')
      },
      {
        id: '2',
        username: 'maria.garcia',
        fullName: 'María García',
        email: 'maria.garcia@uis.edu.co',
        role: { id: 'teacher', name: 'Profesor', color: '#1976D2', backgroundColor: '#2196F3' },
        createdAt: new Date('2024-01-10')
      },
      {
        id: '3',
        username: 'carlos.rodriguez',
        fullName: 'Carlos Rodríguez',
        email: 'carlos.rodriguez@uis.edu.co',
        role: { id: 'admin', name: 'Administrador', color: '#4A148C', backgroundColor: '#9C27B0' },
        createdAt: new Date('2024-01-05')
      }
    ]);
  }

  toggleCreateForm(): void {
    this.showCreateForm.update(show => !show);
  }

  createUser(): void {
    if (this.newUser().username && this.newUser().fullName && this.newUser().email) {
      const selectedRole = this.availableRoles.find(r => r.id === this.newUser().role);
      
      if (selectedRole) {
        const newUser: User = {
          id: Date.now().toString(),
          username: this.newUser().username,
          fullName: this.newUser().fullName,
          email: this.newUser().email,
          role: selectedRole,
          createdAt: new Date()
        };

        this.users.update(users => [newUser, ...users]);
        
        // Reset form
        this.newUser.set({
          username: '',
          fullName: '',
          email: '',
          role: 'student'
        });
        
        this.showCreateForm.set(false);
      }
    }
  }

  updateUserRole(userId: string, newRoleId: string): void {
    const selectedRole = this.availableRoles.find(r => r.id === newRoleId);
    
    if (selectedRole) {
      this.users.update(users => 
        users.map(user => 
          user.id === userId 
            ? { ...user, role: selectedRole }
            : user
        )
      );
    }
  }

  onRoleChange(userId: string, event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target) {
      this.updateUserRole(userId, target.value);
    }
  }

  deleteUser(userId: string): void {
    this.users.update(users => users.filter(user => user.id !== userId));
  }

  get filteredUsers(): User[] {
    const term = this.searchTerm().toLowerCase();
    return this.users().filter(user => 
      user.username.toLowerCase().includes(term) ||
      user.fullName.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.role.name.toLowerCase().includes(term)
    );
  }

  getRoleStats(): { [key: string]: number } {
    const stats: { [key: string]: number } = {};
    this.users().forEach(user => {
      stats[user.role.id] = (stats[user.role.id] || 0) + 1;
    });
    return stats;
  }

  getRolePlural(roleName: string): string {
    switch (roleName) {
      case 'Estudiante':
        return 'Estudiantes';
      case 'Profesor':
        return 'Profesores';
      case 'Administrador':
        return 'Administradores';
      default:
        return roleName + 's';
    }
  }
} 