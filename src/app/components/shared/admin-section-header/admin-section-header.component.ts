import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  template: `
    <!-- Header -->
    <div class="admin-header">
      <div class="header-content">
        <h1 class="page-title">
          <i [class]="'fas ' + config.icon"></i>
          {{ config.title }}
        </h1>
        <p class="page-description">
          {{ config.description }}
        </p>
      </div>

      <button class="create-btn" (click)="onCreateClick()">
        <i class="fas fa-plus"></i>
        {{ config.buttonText }}
      </button>
    </div>

    <!-- Estadísticas rápidas -->
    <div class="stats-container">
      <div
        class="stat-card"
        *ngFor="let stat of config.statistics; let i = index"
        [style.animation-delay]="(i + 1) * 0.1 + 's'"
      >
        <div class="stat-icon" [style.background-color]="stat.color">
          <i [class]="'fas ' + stat.icon"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-number">{{ stat.value }}</h3>
          <p class="stat-label">{{ stat.label }}</p>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./admin-section-header.component.css'],
})
export class AdminSectionHeaderComponent {
  @Input() config!: AdminSectionConfig;
  @Output() createButtonClick = new EventEmitter<void>();

  onCreateClick() {
    this.createButtonClick.emit();
  }
}
