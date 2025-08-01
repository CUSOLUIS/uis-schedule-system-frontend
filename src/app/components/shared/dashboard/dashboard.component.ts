import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <div class="welcome-card">
        <h1>
          Bienvenido, {{ currentUser()?.fullName || currentUser()?.username }}!
        </h1>
        <p>Sistema de Horarios UIS</p>

        <div class="role-info">
          <span
            class="role-badge"
            [style.background-color]="currentUser()?.role?.backgroundColor"
          >
            {{ currentUser()?.role?.name }}
          </span>
        </div>

        <div class="quick-actions">
          <button
            class="action-btn"
            (click)="navigateToSchedule()"
            [style.background-color]="currentUser()?.role?.backgroundColor"
          >
            <i class="fas fa-calendar-alt"></i>
            Ver Horario
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 80vh;
        padding: 20px;
      }

      .welcome-card {
        background: white;
        padding: 40px;
        border-radius: 15px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        text-align: center;
        max-width: 500px;
        width: 100%;
      }

      .welcome-card h1 {
        color: #004080;
        margin-bottom: 10px;
      }

      .welcome-card p {
        color: #666;
        margin-bottom: 30px;
      }

      .role-info {
        margin: 20px 0;
      }

      .role-badge {
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-weight: bold;
        font-size: 14px;
      }

      .quick-actions {
        margin-top: 30px;
      }

      .action-btn {
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 16px;
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0 auto;
        transition: opacity 0.3s ease;
      }

      .action-btn:hover {
        opacity: 0.9;
      }
    `,
  ],
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
}
