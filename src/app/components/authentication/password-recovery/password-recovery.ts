import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-password-recovery',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './password-recovery.html',
  styleUrl: './password-recovery.css',
})
export default class PasswordRecoveryComponent {
  private authService = inject(AuthService);

  email = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  onSubmit(): void {
    if (!this.email.trim()) {
      this.errorMessage = 'El correo es obligatorio';
      this.successMessage = '';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService
      .requestPasswordReset(this.email.trim())
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = response.message;
          } else {
            this.errorMessage = response.message;
          }
        },
        error: () => {
          this.errorMessage =
            'No fue posible enviar la solicitud. Intenta nuevamente.';
        },
      });
  }
}
