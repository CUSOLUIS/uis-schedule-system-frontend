import { Component, computed, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { MenuItem } from '../../../interfaces/user.interface';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export default class NavbarComponent {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser = this.userService.getCurrentUser();
  userRole = () => this.currentUser()?.role;
  menuItems = () =>
    this.userService.getMenuItemsForUser(this.userRole()?.id || '');

  // Método para obtener el color del rol del usuario
  getUserRoleColor(): string {
    const roleId = this.currentUser()?.role?.id;
    return (
      this.userService.userRoles[roleId || 'admin']?.backgroundColor ||
      '#4A148C'
    );
  }

  isCollapsed = true;
  isHovered = false;
  isMobile = false;

  constructor() {
    this.checkScreenSize();
    // Asegura que en móvil inicie colapsado
    if (this.isMobile) {
      this.isCollapsed = true;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
    // Si cambiamos de móvil a desktop, asegurar que el menú esté colapsado
    if (!this.isMobile && !this.isCollapsed) {
      this.isCollapsed = true;
    }
  }

  // Detecta si estamos en móvil
  private checkScreenSize(): void {
    this.isMobile = window.innerWidth <= 768;
  }

  // Cierra el menú al hacer clic fuera (solo en móvil)
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (this.isMobile && !this.isCollapsed) {
      const target = event.target as HTMLElement;
      const navbar = document.querySelector('.navbar');
      const menuButton = document.querySelector('.navbar-toggle');

      // Si el clic no fue en el navbar ni en el botón del menú, cerrar el menú
      if (navbar && !navbar.contains(target) && !menuButton?.contains(target)) {
        this.isCollapsed = true;
      }
    }
  }

  toggleNavbar(): void {
    if (this.isMobile) {
      this.isCollapsed = !this.isCollapsed;
    }
  }

  // Cierra el navbar al hacer clic en un enlace (solo en móvil)
  onNavLinkClick(): void {
    if (this.isMobile && !this.isCollapsed) {
      // Pequeño delay para que la navegación se complete primero
      setTimeout(() => {
        this.isCollapsed = true;
      }, 150);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  trackByRoute(index: number, item: MenuItem): string {
    return item.route;
  }

  onMouseEnter(): void {
    if (!this.isMobile) {
      this.isHovered = true;
    }
  }

  onMouseLeave(): void {
    if (!this.isMobile) {
      this.isHovered = false;
    }
  }

  // Cierra el menú al navegar (solo en móvil)
  onNavigate(): void {
    if (this.isMobile) {
      this.isCollapsed = true;
    }
  }

  // Agrega opción en el menú de admin
  get adminMenuItem(): MenuItem {
    return {
      icon: 'fa-door-open',
      label: 'Aulas',
      route: '/admin/classrooms',
      visible: true,
    };
  }
}
