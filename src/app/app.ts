import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { UserService } from './services/user.service';
import { AuthService } from './services/auth.service';
import NavbarComponent from './components/shared/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class AppComponent {
  title = 'UIS Schedule System';

  private userService = inject(UserService);
  private authService = inject(AuthService);

  currentUser = this.userService.getCurrentUser();

  constructor() {
    // Inicialización si es necesaria
  }
}
