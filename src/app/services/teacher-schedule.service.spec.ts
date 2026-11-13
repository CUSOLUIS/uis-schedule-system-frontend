import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import {
  NO_TEACHER_PROFILE_MESSAGE,
  SCHEDULE_LOAD_ERROR_MESSAGE,
  SERVER_UNREACHABLE_MESSAGE,
  TeacherScheduleService,
  normalizeSchedule,
  toDisplayDay,
  toDisplayTime,
  toScheduleSlots,
} from './teacher-schedule.service';
import {
  TeacherScheduleEntry,
  TeacherScheduleResponse,
} from '../interfaces/teacher-schedule.interface';

const URL = '/api/teachers/me/schedule';

function entry(overrides: Partial<TeacherScheduleEntry> = {}): TeacherScheduleEntry {
  return {
    classHourId: 'ch-1',
    dayName: 'lunes',
    startTime: '08:00:00',
    endTime: '10:00:00',
    groupId: 'g-1',
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

describe('TeacherScheduleService', () => {
  let service: TeacherScheduleService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(TeacherScheduleService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('consulta el horario del docente autenticado y devuelve Data', () => {
    const data: TeacherScheduleResponse = {
      teacherId: 't-1',
      teacherName: 'Ana Pérez',
      department: 'Ingeniería de Sistemas',
      entries: [entry(), entry({ classHourId: 'ch-2', dayName: 'miércoles' })],
    };
    let result: TeacherScheduleResponse | undefined;

    service.getMySchedule().subscribe((r) => (result = r));
    const req = httpMock.expectOne(URL);
    expect(req.request.method).toBe('GET');
    req.flush({ Data: data, Message: 'Teacher schedule retrieved successfully', Errors: [] });

    expect(result).toEqual(data);
  });

  it('normaliza entries nulos a una lista vacía', () => {
    let result: TeacherScheduleResponse | undefined;

    service.getMySchedule().subscribe((r) => (result = r));
    httpMock.expectOne(URL).flush({
      Data: { teacherId: 't-1', teacherName: null, department: null, entries: null },
      Message: 'The teacher has no assigned classes',
      Errors: [],
    });

    expect(result?.entries).toEqual([]);
  });

  it('traduce un 404 a un mensaje de perfil docente inexistente', () => {
    let error: Error | undefined;

    service.getMySchedule().subscribe({ error: (e: Error) => (error = e) });
    httpMock.expectOne(URL).flush(
      { Data: null, Message: 'The authenticated user is not linked to a teacher profile.', Errors: ['x'] },
      { status: 404, statusText: 'Not Found' }
    );

    expect(error?.message).toBe(NO_TEACHER_PROFILE_MESSAGE);
  });

  it('traduce un 500 a un mensaje genérico', () => {
    let error: Error | undefined;

    service.getMySchedule().subscribe({ error: (e: Error) => (error = e) });
    httpMock.expectOne(URL).flush(null, { status: 500, statusText: 'Server Error' });

    expect(error?.message).toBe(SCHEDULE_LOAD_ERROR_MESSAGE);
  });

  it('informa cuando no hay conexión con el servidor', () => {
    let error: Error | undefined;

    service.getMySchedule().subscribe({ error: (e: Error) => (error = e) });
    httpMock.expectOne(URL).error(new ProgressEvent('error'), { status: 0 });

    expect(error?.message).toBe(SERVER_UNREACHABLE_MESSAGE);
  });
});

describe('mapeo del horario docente', () => {
  it('convierte días con tilde y recorta la hora a HH:mm', () => {
    const slots = toScheduleSlots([
      entry({ dayName: 'miércoles', startTime: '07:00:00', endTime: '09:30:00' }),
      entry({ dayName: 'SÁBADO' }),
    ]);

    expect(slots.map((s) => s.day)).toEqual(['Miércoles', 'Sábado']);
    expect(slots[0].startTime).toBe('07:00');
    expect(slots[0].endTime).toBe('09:30');
  });

  it('mapea varias clases en distintos días con materia, grupo y aula', () => {
    const slots = toScheduleSlots([
      entry(),
      entry({ classHourId: 'ch-2', dayName: 'viernes', subjectName: 'Redes', groupName: 'B2' }),
    ]);

    expect(slots.length).toBe(2);
    expect(slots[1]).toEqual(
      jasmine.objectContaining({
        day: 'Viernes',
        subjectName: 'Redes',
        groupNumber: 'B2',
        classroom: '301',
        building: 'Ingeniería de Sistemas',
      })
    );
  });

  it('descarta entradas incompletas y usa "Sin aula" cuando falta el aula', () => {
    const slots = toScheduleSlots([
      entry({ dayName: '' }),
      entry({ startTime: 'no-hora' }),
      entry({ classroomNumber: null }),
    ]);

    expect(slots.length).toBe(1);
    expect(slots[0].classroom).toBe('Sin aula');
  });

  it('tolera entradas nulas o indefinidas', () => {
    expect(toScheduleSlots(null)).toEqual([]);
    expect(toScheduleSlots(undefined)).toEqual([]);
    expect(normalizeSchedule(null).entries).toEqual([]);
    expect(toDisplayDay(null)).toBeNull();
    expect(toDisplayTime(undefined)).toBeNull();
  });
});
