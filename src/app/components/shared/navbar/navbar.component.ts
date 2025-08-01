import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { MenuItem } from '../../../interfaces/user.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser = this.userService.getCurrentUser();

  menuItems = computed(() => {
    const user = this.currentUser();
    return user ? this.userService.getMenuItemsForUser(user.role.id) : [];
  });

  userRole = computed(() => {
    return this.currentUser()?.role;
  });

  isCollapsed = false;
  isHovered = false;

  toggleNavbar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  trackByRoute(index: number, item: MenuItem): string {
    return item.route;
  }

  onMouseEnter(): void {
    this.isHovered = true;
  }

  onMouseLeave(): void {
    this.isHovered = false;
  }
}
