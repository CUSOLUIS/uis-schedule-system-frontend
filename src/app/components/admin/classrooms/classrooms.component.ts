import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClassroomService } from '../../../services/classroom.service';
import { SubjectService } from '../../../services/subject.service';
import { UserService } from '../../../services/user.service';
import {
  Classroom,
  ClassroomSchedule,
} from '../../../interfaces/classroom.interface';
import { Subject } from '../../../interfaces/subject.interface';
import { User } from '../../../interfaces/user.interface';

@Component({
  selector: 'app-classrooms',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './classrooms.component.html',
  styleUrls: ['./classrooms.component.css'],
})
export default class ClassroomsComponent implements OnInit {
  private classroomService = inject(ClassroomService);
  private subjectService = inject(SubjectService);
  private userService = inject(UserService);

  classrooms: Classroom[] = [];
  subjects: Subject[] = [];
  teachers: User[] = [];
  selectedClassroom: Classroom | null = null;
  currentDay: string;
  currentTime: string;
  showDetail: boolean = false;

  // Propiedades para vista responsive
  isWeekView: boolean = true;
  selectedDayIndex: number = 0;
  isMobileView: boolean = false;

  days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  timeSlots = [
    '06:00',
    '07:00',
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
    '19:00',
    '20:00',
  ];

  constructor() {
    const date = new Date();
    this.currentDay = [
      'Domingo',
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
    ][date.getDay()];
    this.currentTime = date.getHours().toString().padStart(2, '0') + ':00';

    // Establecer el día actual como seleccionado
    this.selectedDayIndex = this.days.indexOf(this.currentDay);
    if (this.selectedDayIndex === -1) this.selectedDayIndex = 0;

    // Asegurar que siempre se muestre la lista al inicializar
    this.showDetail = false;
    this.selectedClassroom = null;

    // Detectar vista móvil
    this.checkMobileView();
    window.addEventListener('resize', () => this.checkMobileView());
  }

  ngOnInit() {
    // Asegurar que siempre inicie mostrando la lista
    this.showDetail = false;
    this.selectedClassroom = null;
    this.loadData();
  }

  private loadData() {
    // Asegurar que esté en modo lista
    this.showDetail = false;
    this.selectedClassroom = null;

    this.classroomService.getAllClassrooms().subscribe({
      next: (classrooms) => {
        this.classrooms = classrooms;
        console.log('Aulas cargadas:', classrooms);
      },
      error: (error) => {
        console.error('Error al cargar aulas:', error);
      },
    });

    // Obtener materias usando signals
    this.subjects = this.subjectService.getAllSubjects()();
    console.log('Materias cargadas:', this.subjects);

    this.teachers = this.userService
      .getUsers()
      .filter((user) => user.role.id === 'teacher');
  }

  selectClassroom(classroom: Classroom) {
    this.selectedClassroom = classroom;
    this.showDetail = true;
  }

  goBackToList() {
    this.showDetail = false;
    this.selectedClassroom = null;
  }

  // Métodos para vista responsive
  checkMobileView() {
    this.isMobileView = window.innerWidth <= 768;
    // En móvil, forzar vista diaria siempre
    if (this.isMobileView) {
      this.isWeekView = false;
    }
  }

  toggleScheduleView() {
    // Solo permitir cambio de vista en desktop
    if (!this.isMobileView) {
      this.isWeekView = !this.isWeekView;
    }
  }

  selectDay(dayIndex: number) {
    this.selectedDayIndex = dayIndex;
  }

  getSelectedDay(): string {
    return this.days[this.selectedDayIndex];
  }

  isTimeSlotAvailable(
    classroom: Classroom,
    day: string,
    time: string
  ): boolean {
    return !classroom.schedule.some(
      (s) => s.day === day && s.startTime <= time && s.endTime > time
    );
  }

  async createClassroom() {
    // TODO: Implementar modal de creación
    console.log('Crear nueva aula');
  }

  async editClassroom(event: Event, classroom: Classroom) {
    event.stopPropagation();
    // TODO: Implementar modal de edición
    console.log('Editar aula:', classroom);
  }

  async deleteClassroom(event: Event, id: string) {
    event.stopPropagation();
    if (!confirm('¿Está seguro de eliminar esta aula?')) return;

    this.classroomService.deleteClassroom(id).subscribe({
      next: () => {
        this.loadData();
        if (this.selectedClassroom?.id === id) {
          this.selectedClassroom = null;
          this.showDetail = false;
        }
      },
      error: (error) => {
        console.error('Error al eliminar aula:', error);
      },
    });
  }

  async assignSchedule(classroom: Classroom, day?: string, time?: string) {
    // TODO: Implementar modal de asignación de horario
    const params = {
      classroomId: classroom.id,
      classroomName: classroom.name,
      dayToAssign: day || '',
      timeToAssign: time || '',
    };
    console.log('Asignar horario:', params);
  }

  getCurrentSchedule(classroom: Classroom): ClassroomSchedule | null {
    return (
      classroom.schedule.find(
        (s) =>
          s.day === this.currentDay &&
          s.startTime <= this.currentTime &&
          s.endTime > this.currentTime
      ) || null
    );
  }

  getNextAvailableTime(classroom: Classroom): string {
    const currentSchedule = this.getCurrentSchedule(classroom);
    if (!currentSchedule) {
      return 'Disponible ahora';
    }

    return `Disponible desde ${currentSchedule.endTime}`;
  }

  isCurrentlyAvailable(classroom: Classroom): boolean {
    return !this.getCurrentSchedule(classroom);
  }

  getScheduleForTimeSlot(
    classroom: Classroom,
    day: string,
    time: string
  ): ClassroomSchedule | null {
    return (
      classroom.schedule.find(
        (s) => s.day === day && s.startTime <= time && s.endTime > time
      ) || null
    );
  }
}
