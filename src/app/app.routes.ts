import { Routes } from '@angular/router';
import { authGuard, loginGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./components/authentication/login/login'),
    title: 'Iniciar Sesión - UIS Schedule System',
    canActivate: [loginGuard],
    data: { animation: 'Login' },
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./components/shared/dashboard/dashboard.component'),
    title: 'Dashboard - UIS Schedule System',
    canActivate: [authGuard],
    data: { animation: 'Dashboard' },
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    children: [
      /* {
        path: 'schedule',
        loadComponent: () =>
          import('./components/admin/schedule/schedule.component'),
        title: 'Horario - Admin',
      }, */
      {
        path: 'subjects',
        loadComponent: () =>
          import('./components/admin/subjects/subjects.component'),
        title: 'Asignaturas - Admin',
      },
      {
        path: 'subjects/:id',
        loadComponent: () =>
          import('./components/admin/subject-detail/subject-detail.component'),
        title: 'Detalle Asignatura - Admin',
      },
      {
        path: 'classrooms',
        loadComponent: () =>
          import('./components/admin/classrooms/classrooms.component').then(
            (m) => m.default
          ),
        title: 'Gestión de Aulas - Admin',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
// other routes can be added here as needed
/*
      {
        path: 'subjects/:id',
        loadComponent: () =>
          import('./components/admin/subject-detail/subject-detail.component'),
        title: 'Detalle Asignatura - Admin',
      }
      {
        path: 'teachers',
        loadComponent: () =>
          import('./components/admin/teachers/teachers.component'),
        title: 'Profesores - Admin',
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./components/admin/settings/settings.component'),
        title: 'Configuración - Admin',
      }, */
/*{
    path: 'teacher',
    canActivate: [authGuard],
    children: [
       {
        path: 'schedule',
        loadComponent: () =>
          import('./components/teacher/schedule/schedule.component'),
        title: 'Mi Horario - Profesor',
      },
      {
        path: 'subjects',
        loadComponent: () =>
          import('./components/teacher/subjects/subjects.component'),
        title: 'Mis Asignaturas - Profesor',
      },
      {
        path: 'subjects/:id',
        loadComponent: () =>
          import(
            './components/teacher/subject-detail/subject-detail.component'
          ),
        title: 'Detalle Asignatura - Profesor',
      }
      {
        path: 'profile',
        loadComponent: () =>
          import('./components/teacher/profile/profile.component'),
        title: 'Mi Perfil - Profesor',
      },
    ],
  },
 {
    path: 'student',
    canActivate: [authGuard],
    children: [
       {
        path: 'schedule',
        loadComponent: () =>
          import('./components/student/schedule/schedule.component'),
        title: 'Mi Horario - Estudiante',
      },
      {
        path: 'subjects',
        loadComponent: () =>
          import('./components/student/subjects/subjects.component'),
        title: 'Mis Asignaturas - Estudiante',
      },
      {
        path: 'subjects/:id',
        loadComponent: () =>
          import(
            './components/student/subject-detail/subject-detail.component'
          ),
        title: 'Detalle Asignatura - Estudiante',
      }
      {
        path: 'profile',
        loadComponent: () =>
          import('./components/student/profile/profile.component'),
        title: 'Mi Perfil - Estudiante',
      },
    ],
  }, */
