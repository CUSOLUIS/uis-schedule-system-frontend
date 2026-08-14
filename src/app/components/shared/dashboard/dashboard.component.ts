import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { RoleService } from '../../../services/role.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export default class DashboardComponent {
  private userService = inject(UserService);
  private roleService = inject(RoleService);
  private router = inject(Router);

  currentUser = this.userService.getCurrentUser();

  // Métodos para obtener colores dinámicos
  getUserRoleColor(): string {
    const roleId = this.currentUser()?.role?.id;
    const role = this.roleService.getRoleById(roleId || 'admin');
    return role?.colorScheme?.background || '#4A148C';
  }

  getUserRoleGradient(): string {
    const roleId = this.currentUser()?.role?.id;
    const role = this.roleService.getRoleById(roleId || 'admin');
    return (
      role?.colorScheme?.gradient ||
      'linear-gradient(135deg, #4A148C 0%, #6A1B9A 100%)'
    );
  }

  navigateToSchedule(): void {
    const user = this.currentUser();
    if (user) {
      const roleId = user.role.id;
      switch (roleId) {
        case 'admin':
          this.router.navigate(['/admin/schedule']);
          break;
        case 'teacher':
          this.router.navigate(['/teacher/schedule']);
          break;
        case 'student':
          this.router.navigate(['/student/schedule']);
          break;
      }
    }
  }

  navigateToSubjects(): void {
    const user = this.currentUser();
    if (user) {
      const roleId = user.role.id;
      switch (roleId) {
        case 'admin':
          this.router.navigate(['/admin/subjects']);
          break;
        case 'teacher':
          this.router.navigate(['/teacher/subjects']);
          break;
        case 'student':
          this.router.navigate(['/student/subjects']);
          break;
      }
    }
  }

 // Devuelve las opciones del menú según el rol del usuario
  getMenuItems() {
    const roleId = this.currentUser()?.role?.id || 'ESTUDIANTE';
    return this.userService.getMenuItemsForUser(roleId);
  }
  trackByRoute(_: number, item: { route: string }): string {
    return item.route;
  }

  // Navega a la ruta indicada
  navigateTo(route: string) {
    if (route) {
      this.router.navigate([route]);
    }
  }

  navigateToProfile(): void {
    const user = this.currentUser();
    if (user) {
      const roleId = user.role.id;
      switch (roleId) {
        case 'admin':
          this.router.navigate(['/admin/settings']);
          break;
        case 'teacher':
          this.router.navigate(['/teacher/profile']);
          break;
        case 'student':
          this.router.navigate(['/student/profile']);
          break;
      }
    }
  }

  // Nuevo método para navegar a profesores
  navigateToTeachers(): void {
    this.router.navigate(['/admin/teachers']);
  }

  // Nuevo método para navegar a roles
  navigateToRoles(): void {
    this.router.navigate(['/admin/roles']);
  }
}
