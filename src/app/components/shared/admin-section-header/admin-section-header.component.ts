import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { RoleService } from '../../../services/role.service';

export interface StatisticCard {
  icon: string;
  value: number | string;
  label: string;
  color: string;
}

export interface AdminSectionConfig {
  title: string;
  description: string;
  icon: string;
  buttonText: string;
  statistics: StatisticCard[];
}

@Component({
  selector: 'app-admin-section-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-section-header.component.html',
  styleUrls: ['./admin-section-header.component.css'],
})
export class AdminSectionHeaderComponent {
  private userService = inject(UserService);
  private roleService = inject(RoleService);

  @Input() config!: AdminSectionConfig;
  @Output() createButtonClick = new EventEmitter<void>();

  // Obtiene el gradiente del rol actual del usuario
  getUserRoleGradient(): string {
    const currentUser = this.userService.getCurrentUser()();
    const roleId = currentUser?.role?.id;
    if (!roleId) return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

    const role = this.roleService.getRoleById(roleId);
    return (
      role?.colorScheme.gradient ||
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    );
  }

  // Obtiene el color primario del rol
  getUserRolePrimary(): string {
    const currentUser = this.userService.getCurrentUser()();
    const roleId = currentUser?.role?.id;
    if (!roleId) return '#E8F5E8';

    const role = this.roleService.getRoleById(roleId);
    return role?.colorScheme.primary || '#E8F5E8';
  }

  // Obtiene el color secundario del rol
  getUserRoleSecondary(): string {
    const currentUser = this.userService.getCurrentUser()();
    const roleId = currentUser?.role?.id;
    if (!roleId) return '#D1F2D1';

    const role = this.roleService.getRoleById(roleId);
    return role?.colorScheme.secondary || '#D1F2D1';
  }

  onCreateClick() {
    this.createButtonClick.emit();
  }
}
