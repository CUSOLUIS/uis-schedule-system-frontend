import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export default class LoginComponent {
  username: string = '';
  password: string = '';
  showPassword: boolean = false;

  toggleShowPassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    // @TODO: Aquí implementar la lógica de autenticación
    console.log('Usuario:', this.username);
    console.log('Contraseña:', this.password);
  }
}
