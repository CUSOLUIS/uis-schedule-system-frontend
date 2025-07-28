import { Routes } from '@angular/router';
import { authGuard, loginGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./components/authentication/login/login'),
    title: 'Iniciar Sesión - UIS Schedule System',
    canActivate: [loginGuard],
    data: { animation: 'Login' }
  },
  /* {
    path: 'admin',
    canActivate: [authGuard],
    children: [
      { path: 'schedule', loadComponent: () => import('./components/admin/schedule/schedule.component') },
      { path: 'groups', loadComponent: () => import('./components/admin/groups/groups.component') },
      { path: 'subjects', loadComponent: () => import('./components/admin/subjects/subjects.component') },
      { path: 'teachers', loadComponent: () => import('./components/admin/teachers/teachers.component') },
      { path: 'roles', loadComponent: () => import('./components/admin/roles/roles.component') },
      { path: 'settings', loadComponent: () => import('./components/admin/settings/settings.component') }
    ]
  },
  {
    path: 'teacher',
    canActivate: [authGuard],
    children: [
      { path: 'schedule', loadComponent: () => import('./components/teacher/schedule/schedule.component') },
      { path: 'groups', loadComponent: () => import('./components/teacher/groups/groups.component') },
      { path: 'subjects', loadComponent: () => import('./components/teacher/subjects/subjects.component') },
      { path: 'profile', loadComponent: () => import('./components/teacher/profile/profile.component') }
    ]
  },
  {
    path: 'student',
    canActivate: [authGuard],
    children: [
      { path: 'schedule', loadComponent: () => import('./components/student/schedule/schedule.component') },
      { path: 'subjects', loadComponent: () => import('./components/student/subjects/subjects.component') },
      { path: 'group', loadComponent: () => import('./components/student/group/group.component') },
      { path: 'profile', loadComponent: () => import('./components/student/profile/profile.component') }
    ]
  }, */
  {
    path: '**',
    redirectTo: '/login'
  }
];
