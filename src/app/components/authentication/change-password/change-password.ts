import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './change-password.html',
  styleUrl: './change-password.css',
})
export default class ChangePasswordComponent {
  private authService = inject(AuthService);

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  onSubmit(): void {
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'Todos los campos son obligatorios.';
      return;
    }

    if (this.newPassword.length < 8) {
      this.errorMessage =
        'La nueva contraseña debe tener al menos 8 caracteres.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService
      .changePassword(this.currentPassword, this.newPassword)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = response.message;
            this.currentPassword = '';
            this.newPassword = '';
            this.confirmPassword = '';
          } else {
            this.errorMessage = response.message;
          }
        },
        error: () => {
          this.errorMessage = 'No fue posible cambiar la contraseña.';
        },
      });
  }
}
