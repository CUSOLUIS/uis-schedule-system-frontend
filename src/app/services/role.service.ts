import { Injectable, signal } from '@angular/core';
import mockRoles from '../data/mock-roles.json';

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  order: number;
  visible?: boolean;
}

export interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  permissions: string[];
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    border: string;
    background: string;
    gradient: string;
    shadow: string;
  };
  iconClass: string;
  routes: string[];
  menuItems?: MenuItem[];
}

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private rolesSignal = signal<Role[]>(mockRoles.roles);
  private defaultRoleSignal = signal<Role>(mockRoles.defaultRole);

  getRoles() {
    return this.rolesSignal;
  }

  getRoleById(roleId: string): Role | null {
    const roles = this.rolesSignal();
    return roles.find((role) => role.id === roleId) || null;
  }

  getRoleByName(roleName: string): Role | null {
    const roles = this.rolesSignal();
    return (
      roles.find(
        (role) => role.name.toLowerCase() === roleName.toLowerCase()
      ) || null
    );
  }

  getDefaultRole(): Role {
    return this.defaultRoleSignal();
  }

  getRoleColorScheme(roleId: string) {
    const role = this.getRoleById(roleId);
    return role?.colorScheme || this.getDefaultRole().colorScheme;
  }

  getRolePermissions(roleId: string): string[] {
    const role = this.getRoleById(roleId);
    return role?.permissions || [];
  }

  hasPermission(roleId: string, permission: string): boolean {
    const permissions = this.getRolePermissions(roleId);
    return permissions.includes(permission);
  }

  hasRoutePermission(roleId: string, routePath: string): boolean {
    const role = this.getRoleById(roleId);
    if (!role) return false;

    const allowedRoutes = role.routes || [];

    if (allowedRoutes.includes(routePath)) return true;

    return allowedRoutes.some((route) => {
      if (route.endsWith('/*')) {
        const basePath = route.slice(0, -2);
        return routePath.startsWith(basePath);
      }
      return route === routePath;
    });
  }

  getRoleRoutes(roleId: string): string[] {
    const role = this.getRoleById(roleId);
    return role?.routes || this.getDefaultRole().routes;
  }

  getRoleMenuItems(roleId: string): MenuItem[] {
    const role = this.getRoleById(roleId);
    return role?.menuItems || [];
  }

  getAllRoles(): Role[] {
    return this.rolesSignal();
  }

  updateRole(roleId: string, updates: Partial<Role>): void {
    const currentRoles = this.rolesSignal();
    const updatedRoles = currentRoles.map((role) =>
      role.id === roleId ? { ...role, ...updates } : role
    );
    this.rolesSignal.set(updatedRoles);
  }

  // ── Mapeo entre nombres de rol del backend 
private static readonly TO_FRONTEND: Record<string, string> = {
    ADMINISTRATOR: 'ADMINISTRADOR',
    TEACHER: 'DOCENTE',
    STUDENT: 'ESTUDIANTE',
  };
  private static readonly TO_BACKEND: Record<string, string> = {
    ADMINISTRADOR: 'ADMINISTRATOR',
    DOCENTE: 'TEACHER',
    ESTUDIANTE: 'STUDENT',
  };
  toFrontendRoleId(backendRoleName: string): string {
    return RoleService.TO_FRONTEND[backendRoleName] ?? backendRoleName;
  }
  toBackendRoleName(frontendRoleId: string): string {
    return RoleService.TO_BACKEND[frontendRoleId] ?? frontendRoleId.toUpperCase();
  }
}