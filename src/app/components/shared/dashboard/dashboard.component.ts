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
}
