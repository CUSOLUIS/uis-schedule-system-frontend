import {
  Component,
  DestroyRef,
  HostListener,
  Input,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { SystemConfigService } from '../../../services/system-config.service';
import { SubjectColor, subjectColor } from './schedule-colors';

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
  /** Leyenda de materias bajo la grilla. Por defecto se muestra. */
  showLegend?: boolean;
}

/** Alto de una hora en la grilla semanal; los bloques se posicionan por minuto con este valor. */
export const HOUR_HEIGHT_PX = 48;

const DEFAULT_START_MIN = 7 * 60;
const DEFAULT_END_MIN = 19 * 60;
/** Bloques más bajos que esto solo muestran el código de la materia. */
const COMPACT_BLOCK_MIN = 45;
const MOBILE_BREAKPOINT_PX = 768;
const WEEKDAY_COUNT = 5;

interface ParsedSlot {
  slot: ScheduleSlot;
  dayKey: string;
  start: number;
  end: number;
  color: SubjectColor;
}

export interface ScheduleBlock {
  slot: ScheduleSlot;
  top: number;
  height: number;
  color: SubjectColor;
  compact: boolean;
  label: string;
}

export interface LegendItem {
  key: string;
  code: string;
  name: string;
  group?: string;
  teacher?: string;
  color: SubjectColor;
}

export function timeToMinutes(time: string | null | undefined): number | null {
  const match = time ? /^(\d{1,2}):(\d{2})/.exec(time.trim()) : null;
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function dayKey(day: string | null | undefined): string {
  return (day ?? '').trim().toLocaleLowerCase('es');
}

/** "Aula 102, Edificio A"; "Sin aula" cuando la franja no tiene aula asignada. */
export function formatLocation(slot: ScheduleSlot): string {
  const room = slot.classroom?.trim();
  if (!room || room.toLowerCase() === 'sin aula') {
    return 'Sin aula';
  }
  const building = slot.building?.trim();
  return building ? `Aula ${room}, ${building}` : `Aula ${room}`;
}

/**
 * Nombre visible del grupo. Los grupos suelen llamarse "<materia> - Grupo A": junto a la materia
 * basta con "Grupo A".
 */
export function displayGroupName(groupName: string | null | undefined, subjectName?: string): string {
  const name = groupName?.trim();
  if (!name) {
    return 'Grupo sin nombre';
  }
  const separator = name.lastIndexOf(' - ');
  const prefix = separator > 0 ? name.slice(0, separator).toLocaleLowerCase('es') : '';
  const subject = subjectName?.trim().toLocaleLowerCase('es');
  const rest = prefix && subject && prefix.includes(subject) ? name.slice(separator + 3).trim() : name;
  return /^grupo\b/i.test(rest) ? rest : `Grupo ${rest}`;
}

@Component({
  selector: 'app-schedule-view',
  standalone: true,
  templateUrl: './schedule-view.component.html',
  styleUrls: ['./schedule-view.component.css'],
})
export class ScheduleViewComponent implements OnInit {
  private readonly systemConfigService = inject(SystemConfigService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly slots = signal<ScheduleSlot[]>([]);
  private readonly viewConfig = signal<ScheduleViewConfig>({ title: 'Horario' });

  @Input() set scheduleSlots(value: ScheduleSlot[] | null | undefined) {
    this.slots.set(Array.isArray(value) ? value : []);
  }

  @Input() set config(value: ScheduleViewConfig | null | undefined) {
    this.viewConfig.set(value ?? { title: 'Horario' });
  }
  get config(): ScheduleViewConfig {
    return this.viewConfig();
  }

  readonly view = signal<'week' | 'day'>('week');
  readonly selectedDayIndex = signal(0);
  readonly now = signal(new Date());

  /** Días configurados; los posteriores al viernes solo aparecen en la semana si tienen clases. */
  readonly days = signal<string[]>([]);

  private readonly parsed = computed<ParsedSlot[]>(() =>
    this.slots().flatMap((slot) => {
      const start = timeToMinutes(slot?.startTime);
      const end = timeToMinutes(slot?.endTime);
      const key = dayKey(slot?.day);
      if (!key || start === null || end === null || end <= start) {
        return [];
      }
      return [{ slot, dayKey: key, start, end, color: subjectColor(slot.subjectCode) }];
    })
  );

  readonly weekDays = computed(() => {
    const busy = new Set(this.parsed().map((p) => p.dayKey));
    return this.days().filter((day, index) => index < WEEKDAY_COUNT || busy.has(dayKey(day)));
  });

  /** Rango visible: el horario configurado, ampliado a horas completas si alguna clase se sale. */
  readonly range = computed(() => {
    const configured = this.systemConfigService
      .getTimeSlotDisplayTimes()
      .map(timeToMinutes)
      .filter((m): m is number => m !== null);
    let start = configured.length ? Math.min(...configured) : DEFAULT_START_MIN;
    let end = configured.length ? Math.max(...configured) + 60 : DEFAULT_END_MIN;
    for (const p of this.parsed()) {
      start = Math.min(start, Math.floor(p.start / 60) * 60);
      end = Math.max(end, Math.ceil(p.end / 60) * 60);
    }
    return { start, end };
  });

  readonly hours = computed(() => {
    const { start, end } = this.range();
    const labels: string[] = [];
    for (let m = start; m < end; m += 60) {
      labels.push(minutesToTime(m));
    }
    return labels;
  });

  readonly gridHeight = computed(() => this.hours().length * HOUR_HEIGHT_PX);

  readonly legend = computed<LegendItem[]>(() => {
    const items = new Map<string, LegendItem>();
    for (const { slot, color } of this.parsed()) {
      const code = slot.subjectCode?.trim() ?? '';
      const key = `${code}|${slot.groupNumber ?? ''}`;
      if (!items.has(key)) {
        items.set(key, {
          key,
          code,
          name: slot.subjectName?.trim() || 'Materia sin nombre',
          group: slot.groupNumber?.trim()
            ? displayGroupName(slot.groupNumber, slot.subjectName)
            : undefined,
          teacher: slot.teacherName?.trim() || undefined,
          color,
        });
      }
    }
    return [...items.values()].sort((a, b) => a.code.localeCompare(b.code, 'es'));
  });

  readonly showLegend = computed(
    () => (this.viewConfig().showLegend ?? true) && this.legend().length > 0
  );

  readonly selectedDay = computed(() => this.days()[this.selectedDayIndex()] ?? '');

  readonly selectedDaySlots = computed(() => {
    const key = dayKey(this.selectedDay());
    return this.parsed()
      .filter((p) => p.dayKey === key)
      .sort((a, b) => a.start - b.start);
  });

  readonly todayName = computed(() => {
    const index = this.now().getDay() - 1; // getDay(): 0 = domingo
    return index >= 0 ? this.days()[index] ?? '' : '';
  });

  /** Posición de la línea de hora actual, o null si está fuera del rango visible. */
  readonly nowLineTop = computed(() => {
    if (!this.viewConfig().highlightCurrentTime) return null;
    const minutes = this.now().getHours() * 60 + this.now().getMinutes();
    const { start, end } = this.range();
    return minutes >= start && minutes < end ? (minutes - start) * (HOUR_HEIGHT_PX / 60) : null;
  });

  ngOnInit(): void {
    this.days.set(this.systemConfigService.getWorkDayNames());
    const todayIndex = this.days().indexOf(this.todayName());
    this.selectedDayIndex.set(todayIndex >= 0 ? todayIndex : 0);
    this.view.set(this.isMobile() ? 'day' : this.config.showWeekView === false ? 'day' : 'week');

    // La línea de hora actual avanza sola sin recargar la vista.
    const timer = setInterval(() => this.now.set(new Date()), 60_000);
    this.destroyRef.onDestroy(() => clearInterval(timer));
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.isMobile() && this.view() === 'week') {
      this.view.set('day');
    }
  }

  setView(view: 'week' | 'day'): void {
    this.view.set(view);
  }

  selectDay(index: number): void {
    if (index >= 0 && index < this.days().length) {
      this.selectedDayIndex.set(index);
    }
  }

  private readonly blocksByDay = computed(() => {
    const { start } = this.range();
    const pxPerMin = HOUR_HEIGHT_PX / 60;
    const byDay = new Map<string, ScheduleBlock[]>();
    for (const p of this.parsed()) {
      const list = byDay.get(p.dayKey) ?? [];
      list.push({
        slot: p.slot,
        top: (p.start - start) * pxPerMin,
        height: (p.end - p.start) * pxPerMin,
        color: p.color,
        compact: p.end - p.start < COMPACT_BLOCK_MIN,
        label: this.describe(p.slot),
      });
      byDay.set(p.dayKey, list);
    }
    return byDay;
  });

  blocksFor(day: string): ScheduleBlock[] {
    return this.blocksByDay().get(dayKey(day)) ?? [];
  }

  /** Texto completo de la clase para lectores de pantalla y tooltip. */
  describe(slot: ScheduleSlot): string {
    return [
      `${slot.subjectName ?? 'Materia'}${slot.subjectCode ? ` (${slot.subjectCode})` : ''}`,
      slot.groupNumber ? displayGroupName(slot.groupNumber, slot.subjectName) : '',
      `${slot.startTime} a ${slot.endTime}`,
      formatLocation(slot),
      slot.teacherName ? `Docente ${slot.teacherName}` : '',
    ]
      .filter(Boolean)
      .join('. ');
  }

  location(slot: ScheduleSlot): string {
    return formatLocation(slot);
  }

  groupLabel(slot: ScheduleSlot): string {
    return displayGroupName(slot.groupNumber, slot.subjectName);
  }

  isToday(day: string): boolean {
    return !!day && day === this.todayName();
  }

  shortDay(day: string): string {
    return day.substring(0, 3);
  }

  private isMobile(): boolean {
    return typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT_PX;
  }
}
