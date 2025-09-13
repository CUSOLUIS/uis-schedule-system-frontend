import { UserRole } from '../interfaces/user.interface';

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

export const MOCK_USERS: User[] = [
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
    username: 'maria.gomez',
    fullName: 'María Gómez',
    email: 'maria.gomez@uis.edu.co',
    role: { id: 'teacher', name: 'Profesor', color: '#1976D2', backgroundColor: '#2196F3' },
    createdAt: new Date('2024-02-20')
  },
  {
    id: '3',
    username: 'admin',
    fullName: 'Administrador del Sistema',
    email: 'admin@uis.edu.co',
    role: { id: 'admin', name: 'Administrador', color: '#4A148C', backgroundColor: '#9C27B0' },
    createdAt: new Date('2023-12-01')
  }
];
