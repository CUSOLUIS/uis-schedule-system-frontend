import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../interfaces/user-list.dto';
import {
  TeacherScheduleEntry,
  TeacherScheduleResponse,
} from '../interfaces/teacher-schedule.interface';
import { ScheduleSlot } from '../components/shared/schedule-view/schedule-view.component';

export const NO_TEACHER_PROFILE_MESSAGE =
  'No se encontró tu perfil docente. Comunícate con la coordinación para que lo registren.';
export const SCHEDULE_LOAD_ERROR_MESSAGE =
  'No se pudo cargar tu horario. Intenta de nuevo en unos minutos.';
export const SERVER_UNREACHABLE_MESSAGE =
  'No se pudo conectar con el servidor. Revisa tu conexión e intenta de nuevo.';

const TIME_PATTERN = /^(\d{2}):(\d{2})/;

@Injectable({
  providedIn: 'root',
})
export class TeacherScheduleService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/teachers`;

  /** Horario del docente autenticado; el backend lo resuelve a partir del token. */
  getMySchedule(): Observable<TeacherScheduleResponse> {
    return this.http
      .get<ApiResponse<TeacherScheduleResponse>>(`${this.apiUrl}/me/schedule`)
      .pipe(
        map((response) => {
          if (response?.Errors && response.Errors.length > 0) {
            throw new Error(SCHEDULE_LOAD_ERROR_MESSAGE);
          }
          return normalizeSchedule(response?.Data);
        }),
        catchError(this.handleError)
      );
  }

  private readonly handleError = (error: unknown): Observable<never> => {
    if (!(error instanceof HttpErrorResponse)) {
      return throwError(() =>
        error instanceof Error ? error : new Error(SCHEDULE_LOAD_ERROR_MESSAGE)
      );
    }
    // Los mensajes del backend están en inglés: la interfaz muestra los suyos en español.
    const messages: Record<number, string> = {
      0: SERVER_UNREACHABLE_MESSAGE,
      404: NO_TEACHER_PROFILE_MESSAGE,
    };
    return throwError(
      () => new Error(messages[error.status] ?? SCHEDULE_LOAD_ERROR_MESSAGE)
    );
  };
}

/** Garantiza una estructura usable aunque el backend responda vacío o incompleto. */
export function normalizeSchedule(
  data: Partial<TeacherScheduleResponse> | null | undefined
): TeacherScheduleResponse {
  return {
    teacherId: data?.teacherId ?? '',
    teacherName: data?.teacherName ?? null,
    department: data?.department ?? null,
    entries: Array.isArray(data?.entries) ? data.entries : [],
  };
}

/**
 * Convierte las franjas del backend al formato de `ScheduleViewComponent`:
 * día con mayúscula inicial ("miércoles" → "Miércoles") y hora "HH:mm".
 * Las franjas sin día u hora válidos se descartan para no romper la grilla.
 */
export function toScheduleSlots(entries: TeacherScheduleEntry[] | null | undefined): ScheduleSlot[] {
  return (entries ?? []).flatMap((entry) => {
    const day = toDisplayDay(entry?.dayName);
    const startTime = toDisplayTime(entry?.startTime);
    const endTime = toDisplayTime(entry?.endTime);
    if (!day || !startTime || !endTime) {
      return [];
    }
    return [
      {
        day,
        startTime,
        endTime,
        classroom: entry.classroomNumber?.trim() || 'Sin aula',
        subjectName: entry.subjectName ?? undefined,
        subjectCode: entry.subjectCode ?? undefined,
        groupNumber: entry.groupName ?? undefined,
        building: entry.building ?? undefined,
      },
    ];
  });
}

export function toDisplayDay(dayName: string | null | undefined): string | null {
  const day = dayName?.trim().toLocaleLowerCase('es');
  return day ? day.charAt(0).toLocaleUpperCase('es') + day.slice(1) : null;
}

export function toDisplayTime(time: string | null | undefined): string | null {
  const match = time ? TIME_PATTERN.exec(time) : null;
  return match ? `${match[1]}:${match[2]}` : null;
}
