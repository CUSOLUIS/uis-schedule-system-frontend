import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { RoleService } from '../services/role.service';

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

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const userService = inject(UserService);
  const roleService = inject(RoleService);
  const router = inject(Router);

  const isAuthenticated = authService.getIsAuthenticated()();
  const currentUser = userService.getCurrentUser()();

  if (!isAuthenticated || !currentUser) {
    router.navigate(['/login']);
    return false;
  }

  // Get current user role
  const userRole = roleService.getRoleById(currentUser.role.id);
  if (!userRole) {
    router.navigate(['/dashboard']);
    return false;
  }

  // Check if the current route is accessible by the user's role
  const currentPath = state.url;
  const hasPermission = roleService.hasRoutePermission(userRole.id, currentPath);

  if (!hasPermission) {
    // Redirect to dashboard if no permission
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
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
