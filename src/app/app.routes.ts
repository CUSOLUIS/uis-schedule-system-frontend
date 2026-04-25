import { Routes } from '@angular/router';
import { authGuard, loginGuard, roleGuard } from './guards/auth.guard';

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
    canActivate: [authGuard, roleGuard],
    children: [
      // { path: 'schedule', loadComponent: () => import('./components/admin/schedule/schedule.component') },
      // { path: 'groups', loadComponent: () => import('./components/admin/groups/groups.component') },
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
      {
        path: 'teachers',
        loadComponent: () =>
          import('./components/admin/teachers/teachers').then((m) => m.default),
        title: 'Gestión de Profesores - Admin',
      },
      {
        path: 'roles',
        loadComponent: () =>
          import('./components/admin/roles/roles.component'),
        title: 'Gestión de Roles - Admin',
      },
      {
          path: 'invitations',
          loadComponent: () =>
            import('./components/admin/invitations/invitations.component'),
          title: 'Invitaciones - Admin',
        },
      // { path: 'settings', loadComponent: () => import('./components/admin/settings/settings.component') }
    ],
  },
  {
    path: 'teacher',
    canActivate: [authGuard, roleGuard],
    children: [
      {
        path: 'profile',
        loadComponent: () =>
          import('./components/teacher/profile/teacher-profile.component').then(
            (m) => m.TeacherProfileComponent
          ),
        title: 'Mi Perfil - Profesor',
      },
      {
        path: 'schedule',
        loadComponent: () =>
          import(
            './components/teacher/schedule/teacher-schedule.component'
          ).then((m) => m.TeacherScheduleComponent),
        title: 'Mi Horario - Profesor',
      },
      {
        path: 'subjects',
        loadComponent: () =>
          import('./components/teacher/subjects/index').then(
            (m) => m.TeacherSubjectsComponent
          ),
        title: 'Mis Materias - Profesor',
      },
    ],
  },
  {
    path: 'student',
    canActivate: [authGuard, roleGuard],
    children: [
      {
        path: 'profile',
        loadComponent: () =>
          import('./components/student/profile/student-profile.component').then(
            (m) => m.StudentProfileComponent
          ),
        title: 'Mi Perfil - Estudiante',
      },
      {
        path: 'schedule',
        loadComponent: () =>
          import(
            './components/student/schedule/student-schedule.component'
          ).then((m) => m.StudentScheduleComponent),
        title: 'Mi Horario - Estudiante',
      },
      {
        path: 'subjects',
        loadComponent: () =>
          import(
            './components/student/subjects/student-subjects.component'
          ).then((m) => m.StudentSubjectsComponent),
        title: 'Mis Materias - Estudiante',
      },
    ],
  },
{
    path: 'invitation/:token',
    loadComponent: () =>
      import('./components/invitation/invitation-complete.component'),
    title: 'Completar Registro',
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
