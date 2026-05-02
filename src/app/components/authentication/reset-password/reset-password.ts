import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export default class ResetPasswordComponent {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  token = this.route.snapshot.paramMap.get('token') ?? '';
  newPassword = '';
  confirmPassword = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  onSubmit(): void {
    if (!this.token) {
      this.errorMessage = 'El enlace no es válido.';
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
      .resetPassword(this.token, this.newPassword)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage =
              'Contraseña actualizada correctamente. Serás redirigido al login.';
            setTimeout(() => this.router.navigate(['/login']), 1600);
          } else {
            this.errorMessage = response.message;
          }
        },
        error: () => {
          this.errorMessage = 'No fue posible restablecer la contraseña.';
        },
      });
  }
}
