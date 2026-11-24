import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserService } from '../../../services/user.service';
import { RoleService } from '../../../services/role.service';
import { SystemConfigService } from '../../../services/system-config.service';
import {
  SCHEDULE_LOAD_ERROR_MESSAGE,
  TeacherScheduleService,
  toDisplayDay,
  toDisplayTime,
  toScheduleSlots,
} from '../../../services/teacher-schedule.service';
import { User } from '../../../interfaces/user.interface';
import {
  TeacherScheduleEntry,
  TeacherScheduleResponse,
} from '../../../interfaces/teacher-schedule.interface';
import {
  SectionHeaderComponent,
  SectionHeaderConfig,
} from '../../shared/section-header';
import {
  ScheduleViewComponent,
  ScheduleSlot,
  ScheduleViewConfig,
  displayGroupName,
  formatLocation,
} from '../../shared/schedule-view/schedule-view.component';
import { SubjectColor, subjectColor } from '../../shared/schedule-view/schedule-colors';

interface TeacherGroupSchedule {
  day: string;
  startTime: string;
  endTime: string;
  classroom: string;
  /** "Aula 301, Edificio B" o "Sin aula". */
  location: string;
}

interface TeacherGroupInfo {
  id: string;
  name: string;
  /** Nombre corto para la tarjeta ("Grupo A"); `name` se conserva para el reporte. */
  title: string;
  capacity: number | null;
  schedule: TeacherGroupSchedule[];
}

interface TeacherSubjectInfo {
  key: string;
  code: string;
  name: string;
  credits: number | null;
  groups: TeacherGroupInfo[];
  totalHours: number;
  /** Mismo color que la materia tiene en el calendario. */
  color: SubjectColor;
}

const WEEK_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

@Component({
  selector: 'app-teacher-schedule',
  standalone: true,
  imports: [CommonModule, SectionHeaderComponent, ScheduleViewComponent],
  templateUrl: './teacher-schedule.component.html',
  styleUrls: ['./teacher-schedule.component.css'],
})
export class TeacherScheduleComponent implements OnInit {
  private userService = inject(UserService);
  private roleService = inject(RoleService);
  private systemConfigService = inject(SystemConfigService);
  private teacherScheduleService = inject(TeacherScheduleService);
  private destroyRef = inject(DestroyRef);

  currentUser: User | null = null;

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly schedule = signal<TeacherScheduleResponse | null>(null);

  readonly scheduleSlots = computed<ScheduleSlot[]>(() =>
    toScheduleSlots(this.schedule()?.entries)
  );
  readonly teachingSubjects = computed<TeacherSubjectInfo[]>(() =>
    this.buildTeachingSubjects(this.schedule()?.entries ?? [])
  );
  readonly hasClasses = computed(() => this.scheduleSlots().length > 0);

  readonly sectionConfig = computed<SectionHeaderConfig>(() => ({
    title: 'Mi Horario Docente',
    description:
      'Gestiona tu carga académica, consulta tus horarios y supervisa tus grupos',
    icon: 'fa-chalkboard-teacher',
    buttonText: 'Generar Reporte',
    statistics: [
      {
        icon: 'fa-book-open',
        value: this.teachingSubjects().length,
        label: 'Materias Enseñadas',
        color: '#007bff',
      },
      {
        icon: 'fa-users',
        value: this.getTotalCapacity(),
        label: 'Cupos Totales',
        color: '#28a745',
      },
      {
        icon: 'fa-layer-group',
        value: this.getTotalGroups(),
        label: 'Grupos Asignados',
        color: '#ffc107',
      },
      {
        icon: 'fa-clock',
        value: this.getTotalHours(),
        label: 'Horas Semanales',
        color: '#dc3545',
      },
    ],
  }));

  readonly dailyDistribution = computed(() => this.buildDailyDistribution());
  readonly upcomingClasses = computed(() => this.buildUpcomingClasses());

  scheduleConfig: ScheduleViewConfig = {
    title: 'Horario de Clases',
    subtitle: 'Tu agenda semanal de enseñanza',
    showWeekView: true,
    allowViewToggle: true,
    highlightCurrentTime: true,
    // Las tarjetas de "Materias a Cargo" ya hacen de leyenda.
    showLegend: false,
  };

  ngOnInit() {
    this.currentUser = this.userService.getCurrentUser()();
    this.loadSchedule();
  }

  retryLoad() {
    this.loadSchedule();
  }

  private loadSchedule() {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.teacherScheduleService
      .getMySchedule()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (schedule) => {
          this.schedule.set(schedule);
          this.isLoading.set(false);
        },
        error: (error: unknown) => {
          this.schedule.set(null);
          this.errorMessage.set(
            error instanceof Error && error.message
              ? error.message
              : SCHEDULE_LOAD_ERROR_MESSAGE
          );
          this.isLoading.set(false);
        },
      });
  }

  // Agrupa las franjas por materia y grupo; una franja con varios días llega como varias filas.
  private buildTeachingSubjects(entries: TeacherScheduleEntry[]): TeacherSubjectInfo[] {
    const subjects = new Map<string, TeacherSubjectInfo>();
    const minutesBySubject = new Map<string, number>();

    for (const entry of entries) {
      const day = toDisplayDay(entry?.dayName);
      const startTime = toDisplayTime(entry?.startTime);
      const endTime = toDisplayTime(entry?.endTime);
      if (!day || !startTime || !endTime) continue;

      const key = entry.subjectCode ?? entry.subjectName ?? 'sin-materia';
      let subject = subjects.get(key);
      if (!subject) {
        subject = {
          key,
          code: entry.subjectCode ?? '',
          name: entry.subjectName ?? 'Materia sin nombre',
          credits: entry.subjectCredits ?? null,
          groups: [],
          totalHours: 0,
          color: subjectColor(entry.subjectCode),
        };
        subjects.set(key, subject);
      }

      const groupId = entry.groupId ?? `${key}-${entry.groupName ?? ''}`;
      let group = subject.groups.find((g) => g.id === groupId);
      if (!group) {
        group = {
          id: groupId,
          name: entry.groupName ?? 'Sin nombre',
          title: displayGroupName(entry.groupName, subject.name),
          capacity: entry.groupCapacity ?? null,
          schedule: [],
        };
        subject.groups.push(group);
      }
      const classroom = entry.classroomNumber?.trim() || 'Sin aula';
      group.schedule.push({
        day,
        startTime,
        endTime,
        classroom,
        location: formatLocation({ day, startTime, endTime, classroom, building: entry.building ?? undefined }),
      });

      const minutes = this.durationInMinutes(startTime, endTime);
      minutesBySubject.set(key, (minutesBySubject.get(key) ?? 0) + minutes);
    }

    return [...subjects.values()]
      .map((subject) => ({
        ...subject,
        totalHours: this.minutesToHours(minutesBySubject.get(subject.key) ?? 0),
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'es'));
  }

  // Conversión de hora a minutos
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private durationInMinutes(startTime: string, endTime: string): number {
    return Math.max(0, this.timeToMinutes(endTime) - this.timeToMinutes(startTime));
  }

  // Redondeo a un decimal: las franjas de hora y media son comunes.
  private minutesToHours(minutes: number): number {
    return Math.round((minutes / 60) * 10) / 10;
  }

  getTotalGroups(): number {
    return this.teachingSubjects().reduce(
      (total, sub) => total + sub.groups.length,
      0
    );
  }

  getTotalCapacity(): number {
    return this.teachingSubjects().reduce(
      (total, sub) =>
        total + sub.groups.reduce((sum, group) => sum + (group.capacity ?? 0), 0),
      0
    );
  }

  getTotalHours(): number {
    const minutes = this.scheduleSlots().reduce(
      (total, slot) => total + this.durationInMinutes(slot.startTime, slot.endTime),
      0
    );
    return this.minutesToHours(minutes);
  }

  getActiveDays(): number {
    return new Set(this.scheduleSlots().map((slot) => slot.day)).size;
  }

  getTeacherName(): string {
    return this.schedule()?.teacherName || this.currentUser?.fullName || '';
  }

  getDepartment(): string {
    return this.schedule()?.department || 'Sin departamento registrado';
  }

  private buildDailyDistribution() {
    const days = this.systemConfigService.getWorkDayNames();
    const dayHours: { [key: string]: number } = {};

    // Inicializa los días
    days.forEach((day) => (dayHours[day] = 0));

    // Calcula las horas por día
    this.scheduleSlots().forEach((slot) => {
      const hours = this.durationInMinutes(slot.startTime, slot.endTime) / 60;
      dayHours[slot.day] = (dayHours[slot.day] || 0) + hours;
    });

    const maxHours = Math.max(0, ...Object.values(dayHours));

    return days.map((day) => ({
      name: day,
      hours: Math.round((dayHours[day] || 0) * 10) / 10,
      percentage: maxHours > 0 ? ((dayHours[day] || 0) / maxHours) * 100 : 0,
    }));
  }

  private buildUpcomingClasses() {
    const now = new Date();
    // getDay(): 0 = domingo; el domingo no está en WEEK_DAYS y cuenta como antes del lunes.
    const nowDayIndex = now.getDay() - 1;
    const currentTime = now.getHours() * 60 + now.getMinutes();

    return this.scheduleSlots()
      .map((slot) => ({
        day: slot.day,
        time: slot.startTime,
        subject: slot.subjectName,
        group: slot.groupNumber ? displayGroupName(slot.groupNumber, slot.subjectName) : null,
        classroom: slot.classroom,
        slotTime: this.timeToMinutes(slot.startTime),
        dayIndex: WEEK_DAYS.indexOf(slot.day),
      }))
      .filter(
        (item) =>
          item.dayIndex > nowDayIndex ||
          (item.dayIndex === nowDayIndex && item.slotTime > currentTime)
      )
      .sort((a, b) => {
        if (a.dayIndex !== b.dayIndex) return a.dayIndex - b.dayIndex;
        return a.slotTime - b.slotTime;
      })
      .slice(0, 5); // Próximas 5 clases
  }

  onGenerateReport() {
    // Sin datos cargados no hay nada que reportar (el botón del header no admite deshabilitarse).
    if (this.isLoading() || this.errorMessage() || !this.hasClasses()) return;

    const reportData = {
      teacher: this.getTeacherName(),
      email: this.currentUser?.email,
      department: this.getDepartment(),
      subjects: this.teachingSubjects().map((sub) => ({
        name: sub.name,
        code: sub.code,
        credits: sub.credits,
        groups: sub.groups.map((group) => ({
          name: group.name,
          capacity: group.capacity,
          schedule: group.schedule,
        })),
        totalHours: sub.totalHours,
      })),
      summary: {
        totalSubjects: this.teachingSubjects().length,
        totalGroups: this.getTotalGroups(),
        totalCapacity: this.getTotalCapacity(),
        totalHours: this.getTotalHours(),
        activeDays: this.getActiveDays(),
      },
      distributions: {
        dailyHours: this.dailyDistribution(),
      },
      generatedAt: new Date().toLocaleString('es-ES'),
    };

    // Crea y descarga archivo JSON
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte_docente_${
      this.currentUser?.username
    }_${new Date().getTime()}.json`;
    link.click();

    URL.revokeObjectURL(url);
  }

  // Métodos para obtener colores del rol
  getUserRoleGradient(): string {
    const roleId = this.currentUser?.role?.id;
    if (!roleId) return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

    const role = this.roleService.getRoleById(roleId);
    return (
      role?.colorScheme.gradient ||
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    );
  }

  getUserRolePrimary(): string {
    const roleId = this.currentUser?.role?.id;
    if (!roleId) return '#E8F5E8';

    const role = this.roleService.getRoleById(roleId);
    return role?.colorScheme.primary || '#E8F5E8';
  }

  getUserRoleSecondary(): string {
    const roleId = this.currentUser?.role?.id;
    if (!roleId) return '#D1F2D1';

    const role = this.roleService.getRoleById(roleId);
    return role?.colorScheme.secondary || '#D1F2D1';
  }
}
