import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface HeaderButtonConfig {
  text: string;
  icon: string;
  visible?: boolean;
  disabled?: boolean;
}

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
  primaryButton?: HeaderButtonConfig;
  secondaryButton?: HeaderButtonConfig;
  statistics?: StatisticCard[];
  showStatistics?: boolean;
  gradient?: string;
}

@Component({
  selector: 'app-section-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Header Principal -->
    <div
      class="section-header"
      [style.background]="
        config.gradient || 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)'
      "
    >
      <div class="header-content">
        <h1 class="page-title">
          <i [class]="'fas ' + config.icon"></i>
          {{ config.title }}
        </h1>
        <p class="page-description">
          {{ config.description }}
        </p>
      </div>

      <div
        class="header-actions"
        *ngIf="config.primaryButton || config.secondaryButton"
      >
        <button
          *ngIf="
            config.secondaryButton && config.secondaryButton.visible !== false
          "
          class="action-btn secondary"
          [disabled]="config.secondaryButton.disabled"
          (click)="onSecondaryButtonClick()"
        >
          <i [class]="'fas ' + config.secondaryButton.icon"></i>
          {{ config.secondaryButton.text }}
        </button>

        <button
          *ngIf="config.primaryButton && config.primaryButton.visible !== false"
          class="action-btn primary"
          [disabled]="config.primaryButton.disabled"
          (click)="onPrimaryButtonClick()"
        >
          <i [class]="'fas ' + config.primaryButton.icon"></i>
          {{ config.primaryButton.text }}
        </button>
      </div>
    </div>

    <!-- Estadísticas -->
    <div
      class="stats-container"
      *ngIf="config.showStatistics && config.statistics"
    >
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
  styleUrls: ['./section-header.component.css'],
})
export class SectionHeaderComponent {
  @Input() config!: SectionHeaderConfig;
  @Output() primaryButtonClick = new EventEmitter<void>();
  @Output() secondaryButtonClick = new EventEmitter<void>();

  onPrimaryButtonClick() {
    this.primaryButtonClick.emit();
  }

  onSecondaryButtonClick() {
    this.secondaryButtonClick.emit();
  }
}
