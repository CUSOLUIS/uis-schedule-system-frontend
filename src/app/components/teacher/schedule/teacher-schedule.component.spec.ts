import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Subject, of, throwError } from 'rxjs';
import { TeacherScheduleComponent } from './teacher-schedule.component';
import {
  NO_TEACHER_PROFILE_MESSAGE,
  TeacherScheduleService,
} from '../../../services/teacher-schedule.service';
import {
  TeacherScheduleEntry,
  TeacherScheduleResponse,
} from '../../../interfaces/teacher-schedule.interface';

const UUID_PATTERN = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

function entry(overrides: Partial<TeacherScheduleEntry> = {}): TeacherScheduleEntry {
  return {
    classHourId: '1a2b3c4d-5e6f-4789-8abc-def012345679',
    dayName: 'lunes',
    startTime: '08:00:00',
    endTime: '10:00:00',
    groupId: '8f14e45f-ceea-467e-9d6c-8e2b8a3f9c11',
    groupName: 'A1',
    groupCapacity: 35,
    subjectCode: '22966',
    subjectName: 'Bases de Datos',
    subjectCredits: 4,
    classroomNumber: '301',
    building: 'Ingeniería de Sistemas',
    ...overrides,
  };
}

function schedule(entries: TeacherScheduleEntry[]): TeacherScheduleResponse {
  return {
    teacherId: '10000001-0000-0000-0000-000000000001',
    teacherName: 'Ana Pérez',
    department: 'Ingeniería de Sistemas',
    entries,
  };
}

describe('TeacherScheduleComponent', () => {
  let fixture: ComponentFixture<TeacherScheduleComponent>;
  let component: TeacherScheduleComponent;
  let scheduleService: jasmine.SpyObj<TeacherScheduleService>;

  beforeEach(async () => {
    scheduleService = jasmine.createSpyObj('TeacherScheduleService', ['getMySchedule']);

    await TestBed.configureTestingModule({
      imports: [TeacherScheduleComponent],
      providers: [
        provideZonelessChangeDetection(),
        // UserService (usado por el header y la vista) depende de HttpClient.
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TeacherScheduleService, useValue: scheduleService },
      ],
    }).compileComponents();
  });

  async function render(): Promise<HTMLElement> {
    fixture = TestBed.createComponent(TeacherScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('muestra el estado de carga mientras llega la respuesta', async () => {
    scheduleService.getMySchedule.and.returnValue(new Subject<TeacherScheduleResponse>());

    const el = await render();

    expect(component.isLoading()).toBeTrue();
    expect(el.querySelector('[role="status"]')?.textContent).toContain('Cargando tu horario');
    expect(el.querySelector('app-schedule-view')).toBeNull();
  });

  it('muestra el horario y las estadísticas con clases en distintos días', async () => {
    scheduleService.getMySchedule.and.returnValue(
      of(
        schedule([
          entry(),
          entry({ classHourId: 'ch-2', dayName: 'miércoles', startTime: '14:00:00', endTime: '15:30:00' }),
          entry({
            classHourId: 'ch-3',
            dayName: 'viernes',
            groupId: 'g-2',
            groupName: 'B1',
            subjectCode: '20252',
            subjectName: 'Redes',
          }),
        ])
      )
    );

    const el = await render();

    expect(el.querySelector('app-schedule-view')).not.toBeNull();
    expect(component.scheduleSlots().length).toBe(3);
    expect(component.teachingSubjects().length).toBe(2);
    expect(component.getTotalGroups()).toBe(2);
    expect(component.getTotalHours()).toBe(5.5);
    expect(component.getActiveDays()).toBe(3);
    expect(el.textContent).toContain('Ana Pérez');
    expect(el.textContent).toContain('Bases de Datos');
    expect(el.textContent).toContain('Redes');
  });

  it('la tarjeta del docente no repite los totales del encabezado', async () => {
    scheduleService.getMySchedule.and.returnValue(
      of(schedule([entry(), entry({ classHourId: 'ch-2', dayName: 'jueves' })]))
    );

    const el = await render();

    const card = el.querySelector('.teacher-info-card');
    expect(card?.querySelector('.days-badge')?.textContent).toContain('2 días de clase');
    expect(card?.textContent).not.toContain('Resumen de Carga Académica');
    expect(card?.textContent).not.toContain('Materias');
  });

  it('usa el singular cuando hay un solo día de clase', async () => {
    scheduleService.getMySchedule.and.returnValue(of(schedule([entry()])));

    const el = await render();

    expect(el.querySelector('.days-badge')?.textContent).toContain('1 día de clase');
  });

  it('las tarjetas de materias muestran el grupo sin repetir la materia', async () => {
    scheduleService.getMySchedule.and.returnValue(
      of(schedule([entry({ groupName: 'Bases de Datos - Grupo A' })]))
    );

    const el = await render();

    const group = el.querySelector('.subject-card .group-title');
    expect(group?.textContent?.trim()).toContain('Grupo A');
    expect(group?.textContent).not.toContain('Bases de Datos');
  });

  it('las tarjetas de materias muestran el aula con su edificio o "Sin aula"', async () => {
    scheduleService.getMySchedule.and.returnValue(
      of(
        schedule([
          entry(),
          entry({ classHourId: 'ch-2', dayName: 'martes', classroomNumber: null, building: null }),
        ])
      )
    );

    const el = await render();

    const rooms = Array.from(el.querySelectorAll('.subject-card .slot-room')).map((r) =>
      r.textContent?.trim()
    );
    expect(rooms).toContain('Aula 301, Ingeniería de Sistemas');
    expect(rooms).toContain('Sin aula');
  });

  it('las tarjetas de materias no repiten conteos en cajas', async () => {
    scheduleService.getMySchedule.and.returnValue(of(schedule([entry()])));

    const el = await render();

    const card = el.querySelector('.subject-card');
    expect(card?.textContent).not.toContain('Grupos:');
    expect(card?.querySelector('.stat-item')).toBeNull();
    expect(card?.querySelector('.subject-meta')?.textContent).toContain('4 créditos');
  });

  it('nunca muestra ids internos en la interfaz', async () => {
    scheduleService.getMySchedule.and.returnValue(of(schedule([entry()])));

    const el = await render();

    expect(UUID_PATTERN.test(el.textContent ?? '')).toBeFalse();
  });

  it('muestra un mensaje informativo cuando no hay grupos asignados', async () => {
    scheduleService.getMySchedule.and.returnValue(of(schedule([])));

    const el = await render();

    expect(el.textContent).toContain('Aún no tienes grupos asignados');
    expect(el.querySelector('app-schedule-view')).toBeNull();
    expect(el.querySelector('[role="alert"]')).toBeNull();
  });

  it('muestra el error y permite reintentar', async () => {
    scheduleService.getMySchedule.and.returnValue(
      throwError(() => new Error(NO_TEACHER_PROFILE_MESSAGE))
    );

    const el = await render();

    const alert = el.querySelector('[role="alert"]');
    expect(alert?.textContent).toContain(NO_TEACHER_PROFILE_MESSAGE);

    scheduleService.getMySchedule.and.returnValue(of(schedule([entry()])));
    (alert?.querySelector('button') as HTMLButtonElement).click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(scheduleService.getMySchedule).toHaveBeenCalledTimes(2);
    expect(el.querySelector('[role="alert"]')).toBeNull();
    expect(el.querySelector('app-schedule-view')).not.toBeNull();
  });
});
