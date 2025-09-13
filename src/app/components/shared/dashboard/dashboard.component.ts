import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export default class DashboardComponent {
  private userService = inject(UserService);
  private router = inject(Router);

  currentUser = this.userService.getCurrentUser();

  // Métodos para obtener colores dinámicos
  getUserRoleColor(): string {
    const roleId = this.currentUser()?.role?.id;
    return this.userService.userRoles[roleId || 'admin']?.backgroundColor || '#4A148C';
  }

  getUserRoleGradient(): string {
    const roleId = this.currentUser()?.role?.id;
    switch (roleId) {
      case 'admin':
        return 'linear-gradient(135deg, #4A148C 0%, #6A1B9A 100%)';
      case 'teacher':
        return 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)';
      case 'student':
        return 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)';
      default:
        return 'linear-gradient(135deg, #4A148C 0%, #6A1B9A 100%)';
    }
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
  const roleId = this.currentUser()?.role?.id || 'student';
  return this.userService.menuItems[roleId] || [];
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
