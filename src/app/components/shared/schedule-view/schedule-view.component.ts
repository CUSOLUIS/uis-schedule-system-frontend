import { Component, Input, OnInit, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SystemConfigService } from '../../../services/system-config.service';
import { UserService } from '../../../services/user.service';
import { RoleService } from '../../../services/role.service';

export interface ScheduleSlot {
  day: string;
  startTime: string;
  endTime: string;
  classroom: string;
  classroomId?: string;
  subjectName?: string;
  teacherName?: string;
  groupNumber?: string;
  subjectCode?: string;
  building?: string;
  floor?: string;
}

export interface ScheduleViewConfig {
  title: string;
  subtitle?: string;
  showWeekView?: boolean;
  allowViewToggle?: boolean;
  highlightCurrentTime?: boolean;
  isStudentView?: boolean;
}

@Component({
  selector: 'app-schedule-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './schedule-view.component.html',
  styleUrls: ['./schedule-view.component.css'],
})
export class ScheduleViewComponent implements OnInit {
  private userService = inject(UserService);
  private roleService = inject(RoleService);

  @Input() scheduleSlots: ScheduleSlot[] = [];
  @Input() config: ScheduleViewConfig = {
    title: 'Horario',
    showWeekView: true,
    allowViewToggle: true,
    highlightCurrentTime: true,
  };

  isWeekView = true;
  selectedDayIndex = 0;
  isMobileDevice = false;

  days: string[] = [];
  timeSlots: string[] = [];

  constructor(private systemConfigService: SystemConfigService) {
    this.isMobileDevice = this.checkIfMobile();
  }

  ngOnInit() {
    // Carga la configuración desde el servicio
    this.days = this.systemConfigService.getWorkDayNames();
    this.timeSlots = this.systemConfigService.getTimeSlotDisplayTimes();

    // En móvil, vista diaria por defecto
    this.isWeekView = this.isMobileDevice
      ? false
      : this.config.showWeekView ?? true;

    // Selecciona el día actual por defecto
    const today = new Date().getDay();
    this.selectedDayIndex = today === 0 ? 5 : today - 1; // Domingo = 5 (Sábado), otros días -1
  }

  private checkIfMobile(): boolean {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768;
    }
    return false;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    const wasMobile = this.isMobileDevice;
    this.isMobileDevice = this.checkIfMobile();

    // Si cambió de móvil a desktop o viceversa, ajustar la vista
    if (wasMobile !== this.isMobileDevice) {
      this.isWeekView = this.isMobileDevice ? false : true;
    }
  }

  toggleView(view: 'week' | 'day') {
    this.isWeekView = view === 'week';
  }

  selectDay(index: number) {
    this.selectedDayIndex = index;
  }

  getSelectedDay(): string {
    return this.days[this.selectedDayIndex];
  }

  getFilteredTimeSlots(): string[] {
    // Si es vista de estudiante, solo mostrar horas con clases
    if (this.config.isStudentView) {
      const selectedDay = this.getSelectedDay();
      return this.timeSlots.filter((time) => {
        return this.scheduleSlots.some(
          (slot) =>
            slot.day === selectedDay &&
            this.isTimeInSlot(time, slot.startTime, slot.endTime)
        );
      });
    }
    return this.timeSlots;
  }

  getCurrentDate(): string {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return today.toLocaleDateString('es-ES', options);
  }

  getScheduleForSlot(day: string, time: string): ScheduleSlot | null {
    return (
      this.scheduleSlots.find(
        (slot) =>
          slot.day === day &&
          this.isTimeInSlot(time, slot.startTime, slot.endTime)
      ) || null
    );
  }

  private isTimeInSlot(
    time: string,
    startTime: string,
    endTime: string
  ): boolean {
    const timeMinutes = this.timeToMinutes(time);
    const startMinutes = this.timeToMinutes(startTime);
    const endMinutes = this.timeToMinutes(endTime);

    return timeMinutes >= startMinutes && timeMinutes < endMinutes;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  isCurrentTimeSlot(day: string, time: string): boolean {
    if (!this.config.highlightCurrentTime) return false;

    const now = new Date();
    const currentDayIndex = now.getDay() === 0 ? 5 : now.getDay() - 1; // Domingo = 5 (Sábado), otros días -1
    const currentDay = this.days[currentDayIndex];
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();

    // Convierte la hora del slot a número
    const slotHour = parseInt(time.split(':')[0]);

    // Verifica si es el día correcto y la hora actual está dentro del slot
    return (
      day === currentDay && currentHour === slotHour && currentMinutes < 60
    ); // Dentro de la hora del slot
  }

  // Métodos para obtener colores del rol
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

  getUserRolePrimary(): string {
    const currentUser = this.userService.getCurrentUser()();
    const roleId = currentUser?.role?.id;
    if (!roleId) return '#F8F9FA';

    const role = this.roleService.getRoleById(roleId);
    return role?.colorScheme.primary || '#F8F9FA';
  }

  getUserRoleSecondary(): string {
    const currentUser = this.userService.getCurrentUser()();
    const roleId = currentUser?.role?.id;
    if (!roleId) return '#E9ECEF';

    const role = this.roleService.getRoleById(roleId);
    return role?.colorScheme.secondary || '#E9ECEF';
  }

  getUserRoleAccent(): string {
    const currentUser = this.userService.getCurrentUser()();
    const roleId = currentUser?.role?.id;
    if (!roleId) return '#6C757D';

    const role = this.roleService.getRoleById(roleId);
    return role?.colorScheme.accent || '#6C757D';
  }

  getUserRoleBackground(): string {
    const currentUser = this.userService.getCurrentUser()();
    const roleId = currentUser?.role?.id;
    if (!roleId) return '#FAFAFA';

    const role = this.roleService.getRoleById(roleId);
    return role?.colorScheme.background || '#FAFAFA';
  }

  /**
   * Genera un color pastel suave para la hora actual basado en el rol
   * Utiliza el color primary del rol y lo hace más claro y translúcido
   */
  getCurrentTimePastelColor(): string {
    const currentUser = this.userService.getCurrentUser()();
    const roleId = currentUser?.role?.id;

    if (!roleId) return 'rgba(230, 240, 255, 0.6)'; // Azul pastel por defecto

    const role = this.roleService.getRoleById(roleId);
    if (!role) return 'rgba(230, 240, 255, 0.6)';

    // Convierte el color primario del rol a RGB y crea una versión pastel
    const primaryColor = role.colorScheme.primary;

  // Color en formato hex: conversión a RGB para versión pastel
  if (primaryColor.startsWith('#')) {
      const hex = primaryColor.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);

  // Aplicación de un tono más claro en porcentaje reducido para un resultado suave
      const mixFactor = 0.15; // 0 = color original, 1 = blanco
      const pastelR = Math.min(255, r + (255 - r) * mixFactor);
      const pastelG = Math.min(255, g + (255 - g) * mixFactor);
      const pastelB = Math.min(255, b + (255 - b) * mixFactor);

      // Usar opacidad más alta para un color más sólido
      return `rgba(${Math.round(pastelR)}, ${Math.round(pastelG)}, ${Math.round(
        pastelB
      )}, 0.95)`;
    }

    // Si ya está en formato RGB o similar, usarlo directamente con opacidad más alta
    return primaryColor.replace('rgb', 'rgba').replace(')', ', 0.95)');
  }

  /**
   * Genera un color de borde más intenso para la hora actual
   */
  getCurrentTimeBorderColor(): string {
    const currentUser = this.userService.getCurrentUser()();
    const roleId = currentUser?.role?.id;

    if (!roleId) return 'rgba(100, 150, 255, 0.4)';

    const role = this.roleService.getRoleById(roleId);
    return role?.colorScheme.accent || '#6C757D';
  }
}
