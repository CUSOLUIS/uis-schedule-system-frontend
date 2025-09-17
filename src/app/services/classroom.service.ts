import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import mockClassrooms from '../data/mock-classrooms.json';
import {
  Classroom,
  ClassroomSchedule,
} from '../interfaces/classroom.interface';

@Injectable({
  providedIn: 'root',
})
export class ClassroomService {
  private classrooms = signal<Classroom[]>(mockClassrooms.classrooms);

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData() {
    // Importa los datos mock directamente
    import('../data/mock-classrooms.json')
      .then((data) => {
        this.classrooms.set(data.classrooms);
      })
      .catch((error) => {
        console.error('Error loading mock data:', error);
        this.classrooms.set([]);
      });
  }

  getAllClassrooms(): Observable<Classroom[]> {
    return of(this.classrooms());
  }

  getClassroomById(id: string): Observable<Classroom | undefined> {
    const classroom = this.classrooms().find((c) => c.id === id);
    return of(classroom);
  }

  createClassroom(classroom: Omit<Classroom, 'id'>): Observable<Classroom> {
    const newClassroom: Classroom = {
      ...classroom,
      id: Date.now().toString(),
    };
    this.classrooms.update((rooms) => [...rooms, newClassroom]);
    return of(newClassroom);
  }

  updateClassroom(
    id: string,
    updates: Partial<Classroom>
  ): Observable<Classroom | undefined> {
    let updatedClassroom: Classroom | undefined;

    this.classrooms.update((rooms) =>
      rooms.map((room) => {
        if (room.id === id) {
          updatedClassroom = { ...room, ...updates };
          return updatedClassroom;
        }
        return room;
      })
    );

    return of(updatedClassroom);
  }

  deleteClassroom(id: string): Observable<void> {
    this.classrooms.update((rooms) => rooms.filter((room) => room.id !== id));
    return of(void 0);
  }

  assignSchedule(
    classroomId: string,
    schedule: ClassroomSchedule
  ): Observable<Classroom | undefined> {
    let updatedClassroom: Classroom | undefined;

    this.classrooms.update((rooms) =>
      rooms.map((room) => {
        if (room.id === classroomId) {
          updatedClassroom = {
            ...room,
            schedule: [...room.schedule, schedule],
          };
          return updatedClassroom;
        }
        return room;
      })
    );

    return of(updatedClassroom);
  }

  removeSchedule(
    classroomId: string,
    scheduleId: string
  ): Observable<Classroom | undefined> {
    let updatedClassroom: Classroom | undefined;

    this.classrooms.update((rooms) =>
      rooms.map((room) => {
        if (room.id === classroomId) {
          updatedClassroom = {
            ...room,
            schedule: room.schedule.filter((s) => s.day !== scheduleId),
          };
          return updatedClassroom;
        }
        return room;
      })
    );

    return of(updatedClassroom);
  }

  getAvailableClassrooms(
    day: string,
    startTime: string,
    endTime: string,
    capacity?: number
  ): Observable<Classroom[]> {
    const availableRooms = this.classrooms().filter(
      (classroom) =>
        this.isTimeSlotAvailable(classroom, day, startTime, endTime) &&
        (!capacity || classroom.capacity >= capacity)
    );
    return of(availableRooms);
  }

  private isTimeSlotAvailable(
    classroom: Classroom,
    day: string,
    startTime: string,
    endTime: string
  ): boolean {
    if (!classroom.isAvailable) return false;

    const conflictingSchedule = classroom.schedule.find(
      (s) =>
        s.day === day &&
        this.hasTimeOverlap(s.startTime, s.endTime, startTime, endTime)
    );

    return !conflictingSchedule;
  }

  private hasTimeOverlap(
    start1: string,
    end1: string,
    start2: string,
    end2: string
  ): boolean {
    return (
      this.timeToMinutes(start1) < this.timeToMinutes(end2) &&
      this.timeToMinutes(end1) > this.timeToMinutes(start2)
    );
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Métodos para solicitudes de cambio con verificación de capacidad
  getAvailableClassroomsForGroup(
    day: string,
    startTime: string,
    endTime: string,
    requiredCapacity: number
  ): Observable<Classroom[]> {
    const availableClassrooms = this.classrooms().filter((classroom) => {
      // Verifica la capacidad
      if (classroom.capacity < requiredCapacity) {
        return false;
      }

      // Verifica la disponibilidad en el horario solicitado
      return this.isTimeSlotAvailable(classroom, day, startTime, endTime);
    });

    return of(availableClassrooms);
  }

  getAvailableTimeSlots(
    classroomId: string,
    day: string,
    duration: number = 120
  ): Observable<{ startTime: string; endTime: string }[]> {
    const classroom = this.classrooms().find((c) => c.id === classroomId);
    if (!classroom) {
      return of([]);
    }

    const availableSlots: { startTime: string; endTime: string }[] = [];

    // Genera bloques de tiempo cada 2 horas desde las 6:00 hasta las 22:00
    for (let hour = 6; hour < 22; hour += 2) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endTime = `${(hour + 2).toString().padStart(2, '0')}:00`;

      if (this.isTimeSlotAvailable(classroom, day, startTime, endTime)) {
        availableSlots.push({ startTime, endTime });
      }
    }

    return of(availableSlots);
  }
}
