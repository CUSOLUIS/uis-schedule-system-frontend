import { Injectable, signal } from '@angular/core';
import mockSystemConfig from '../data/mock-system-config.json';

export interface WorkDay {
  id: string;
  name: string;
  shortName: string;
  active: boolean;
  order: number;
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  displayTime: string;
  active: boolean;
  order: number;
}

export interface SystemConfig {
  academicCalendar: {
    workDays: WorkDay[];
    timeSlots: TimeSlot[];
  };
  ui: {
    animations: {
      defaultDuration: number;
      delayIncrement: number;
      easing: string;
    };
    colors: {
      defaults: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
      };
    };
  };
  schedule: {
    defaultView: string;
    allowViewToggle: boolean;
    highlightCurrentTime: boolean;
    refreshInterval: number;
    maxConcurrentClasses: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class SystemConfigService {
  private configSignal = signal<SystemConfig>(mockSystemConfig.systemConfig);

  getConfig() {
    return this.configSignal.asReadonly();
  }

  getWorkDays(): WorkDay[] {
    return this.configSignal().academicCalendar.workDays.filter(day => day.active)
      .sort((a, b) => a.order - b.order);
  }

  getWorkDayNames(): string[] {
    return this.getWorkDays().map(day => day.name);
  }

  getWorkDayShortNames(): string[] {
    return this.getWorkDays().map(day => day.shortName);
  }

  getTimeSlots(): TimeSlot[] {
    return this.configSignal().academicCalendar.timeSlots.filter(slot => slot.active)
      .sort((a, b) => a.order - b.order);
  }

  getTimeSlotDisplayTimes(): string[] {
    return this.getTimeSlots().map(slot => slot.displayTime);
  }

  getScheduleConfig() {
    return this.configSignal().schedule;
  }

  getUIConfig() {
    return this.configSignal().ui;
  }

  updateConfig(updates: Partial<SystemConfig>): void {
    const currentConfig = this.configSignal();
    this.configSignal.set({ ...currentConfig, ...updates });
  }

  getWorkDayById(dayId: string): WorkDay | null {
    return this.getWorkDays().find(day => day.id === dayId) || null;
  }

  getTimeSlotById(slotId: string): TimeSlot | null {
    return this.getTimeSlots().find(slot => slot.id === slotId) || null;
  }

  isWorkDay(dayName: string): boolean {
    return this.getWorkDayNames().includes(dayName);
  }

  isValidTimeSlot(time: string): boolean {
    return this.getTimeSlotDisplayTimes().includes(time);
  }
}