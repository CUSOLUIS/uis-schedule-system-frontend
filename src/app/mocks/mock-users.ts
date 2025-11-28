import { Role } from '../services/role.service';
import { User } from '../interfaces/user.interface'; // Usar la interfaz principal

// User ya está definida en user.interface.ts, no redefinir aquí

// Datos de roles de ejemplo que coinciden con la interfaz Role
const MOCK_ROLES: Record<string, Role> = {
  student: {
    id: 'student',
    name: 'Estudiante',
    displayName: 'Estudiante',
    description: 'Usuario con permisos de estudiante',
    permissions: ['view_schedule', 'view_subjects'],
    colorScheme: {
      primary: '#388E3C',
      secondary: '#4CAF50',
      accent: '#2E7D32',
      text: '#FFFFFF',
      border: '#1B5E20',
      background: '#E8F5E9',
      gradient: 'linear-gradient(145deg, #388E3C 0%, #4CAF50 100%)',
      shadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    },
    menuItems: [
      { id: 'schedule', label: 'Mi Horario', icon: 'fa-calendar-alt', route: '/student/schedule', order: 1 },
      { id: 'subjects', label: 'Mis Asignaturas', icon: 'fa-book', route: '/student/subjects', order: 2 }
    ],
    iconClass: 'fa-user-graduate',
    routes: ['/student/schedule', '/student/subjects']
  },
  teacher: {
    id: 'teacher',
    name: 'Profesor',
    displayName: 'Profesor',
    description: 'Usuario con permisos de profesor',
    permissions: ['view_schedule', 'manage_subjects', 'view_students'],
    colorScheme: {
      primary: '#1976D2',
      secondary: '#2196F3',
      accent: '#0D47A1',
      text: '#FFFFFF',
      border: '#0D47A1',
      background: '#E3F2FD',
      gradient: 'linear-gradient(145deg, #1976D2 0%, #2196F3 100%)',
      shadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    },
    menuItems: [
      { id: 'schedule', label: 'Mi Horario', icon: 'fa-calendar-alt', route: '/teacher/schedule', order: 1 },
      { id: 'subjects', label: 'Mis Asignaturas', icon: 'fa-book', route: '/teacher/subjects', order: 2 },
      { id: 'students', label: 'Mis Estudiantes', icon: 'fa-users', route: '/teacher/students', order: 3 }
    ],
    iconClass: 'fa-chalkboard-teacher',
    routes: ['/teacher/schedule', '/teacher/subjects', '/teacher/students']
  },
  admin: {
    id: 'admin',
    name: 'Administrador',
    displayName: 'Administrador del Sistema',
    description: 'Usuario con todos los permisos',
    permissions: ['*'],
    colorScheme: {
      primary: '#4A148C',
      secondary: '#9C27B0',
      accent: '#6A1B9A',
      text: '#FFFFFF',
      border: '#7B1FA2',
      background: '#F3E5F5',
      gradient: 'linear-gradient(145deg, #4A148C 0%, #9C27B0 100%)',
      shadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    },
    menuItems: [
      { id: 'classrooms', label: 'Aulas', icon: 'fa-door-open', route: '/admin/classrooms', order: 1 },
      { id: 'subjects', label: 'Asignaturas', icon: 'fa-book', route: '/admin/subjects', order: 2 },
      { id: 'teachers', label: 'Profesores', icon: 'fa-user-tie', route: '/admin/teachers', order: 3 },
      { id: 'roles', label: 'Asignar Roles', icon: 'fas fa-user-cog', route: '/admin/roles', order: 4 },
      { id: 'settings', label: 'Configuración', icon: 'fa-cog', route: '/admin/settings', order: 5 }
    ],
    iconClass: 'fa-user-shield',
    routes: ['/admin/classrooms', '/admin/subjects', '/admin/teachers', '/admin/roles', '/admin/settings']
  }
};

export const MOCK_USERS: User[] = [
  {
    id: '1',
    username: 'juan.perez',
    fullName: 'Juan Pérez',
    email: 'juan.perez@uis.edu.co',
    role: MOCK_ROLES['student']
  },
  {
    id: '2',
    username: 'maria.gomez',
    fullName: 'María Gómez',
    email: 'maria.gomez@uis.edu.co',
    role: MOCK_ROLES['teacher']
  },
  {
    id: '3',
    username: 'admin',
    fullName: 'Administrador del Sistema',
    email: 'admin@uis.edu.co',
    role: MOCK_ROLES['admin']
  }
];
