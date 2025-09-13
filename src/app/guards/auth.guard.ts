import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const userService = inject(UserService);
  const router = inject(Router);

  const isAuthenticated = authService.getIsAuthenticated()();
  const currentUser = userService.getCurrentUser()();

  if (isAuthenticated && currentUser) {
    return true;
  }

  // redirect to login if not authenticated
  router.navigate(['/login']);
  return false;
};

export const loginGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const userService = inject(UserService);
  const router = inject(Router);

  const isAuthenticated = authService.getIsAuthenticated()();
  const currentUser = userService.getCurrentUser()();

  if (!isAuthenticated || !currentUser) {
    return true;
  }

  // if authenticated, redirect to dashboard or role-specific schedule
  const roleId = currentUser.role.id;
  switch (
    roleId /*
    case 'admin':
      router.navigate(['/admin/schedule']);
      break;
    case 'teacher':
      router.navigate(['/teacher/schedule']);
      break;
    case 'student':
      router.navigate(['/student/schedule']);
      break; */
  ) {
    default:
      router.navigate(['/dashboard']);
  }

  return false;
};
