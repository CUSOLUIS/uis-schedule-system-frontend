import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { LoginRequest } from '../../../interfaces/user.interface';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export default class LoginComponent {
  username: string = '';
  password: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';

  private router = inject(Router);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (!this.username || !this.password) {
      this.errorMessage = 'Por favor ingrese usuario y contraseña';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const credentials: LoginRequest = {
      username: this.username,
      password: this.password,
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        if (response.success && response.user) {
          this.redirectToRolePage(response.user.role.id);
        } else {
          this.errorMessage =
            response.message || 'Error en el inicio de sesión';
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = 'Error de conexión. Intente nuevamente.';
        console.error('Error en login:', error);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private redirectToRolePage(roleId: string): void {
    switch (roleId) {
      /* case 'admin':
        this.router.navigate(['/admin/schedule']);
        break;
      case 'teacher':
        this.router.navigate(['/teacher/schedule']);
        break;
      case 'student':
        this.router.navigate(['/student/schedule']);
        break; */
      default:
        this.router.navigate(['dashboard']);
    }
  }
}
