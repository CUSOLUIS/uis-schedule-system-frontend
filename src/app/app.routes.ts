import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/authentication/login/login'),
    title: 'Iniciar Sesión - UIS Schedule System',
    data: { animation: 'Login' }
  }
];
