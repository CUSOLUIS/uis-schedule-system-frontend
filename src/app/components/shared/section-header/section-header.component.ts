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

export interface SectionHeaderConfig {
  title: string;
  description: string;
  icon: string;
  buttonText: string;
  statistics: StatisticCard[];
}

@Component({
  selector: 'app-section-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './section-header.component.html',
  styleUrls: ['./section-header.component.css'],
})
export class SectionHeaderComponent {
  private userService = inject(UserService);
  private roleService = inject(RoleService);

  @Input() config!: SectionHeaderConfig;
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
    if (!roleId) return '#F8F9FA';

    const role = this.roleService.getRoleById(roleId);
    return role?.colorScheme.primary || '#F8F9FA';
  }

  // Obtiene el color secundario del rol
  getUserRoleSecondary(): string {
    const currentUser = this.userService.getCurrentUser()();
    const roleId = currentUser?.role?.id;
    if (!roleId) return '#E9ECEF';

    const role = this.roleService.getRoleById(roleId);
    return role?.colorScheme.secondary || '#E9ECEF';
  }

  // Obtiene el color de acento del rol
  getUserRoleAccent(): string {
    const currentUser = this.userService.getCurrentUser()();
    const roleId = currentUser?.role?.id;
    if (!roleId) return '#6C757D';

    const role = this.roleService.getRoleById(roleId);
    return role?.colorScheme.accent || '#6C757D';
  }

  onCreateClick() {
    this.createButtonClick.emit();
  }
}
