import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClassroomService } from '../../../services/classroom.service';
import { SubjectService } from '../../../services/subject.service';
import { UserService } from '../../../services/user.service';
import { SearchService } from '../../../services/search.service';
import {
  Classroom,
  ClassroomSchedule,
} from '../../../interfaces/classroom.interface';
import { Subject, Group } from '../../../interfaces/subject.interface';
import { User } from '../../../interfaces/user.interface';
import {
  AdminSectionHeaderComponent,
  AdminSectionConfig,
  StatisticCard,
} from '../../shared/admin-section-header';
import { SearchBoxComponent } from '../../shared/search-box/search-box.component';
import mockClassroomsData from '../../../data/mock-classrooms.json';
import mockSubjectsData from '../../../data/mock-subjects.json';

@Component({
  selector: 'app-classrooms',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AdminSectionHeaderComponent,
    SearchBoxComponent,
  ],
  templateUrl: './classrooms.component.html',
  styleUrls: ['./classrooms.component.css'],
})
export default class ClassroomsComponent implements OnInit {
  private classroomService = inject(ClassroomService);
  private subjectService = inject(SubjectService);
  private userService = inject(UserService);
  private searchService = inject(SearchService);

  classrooms: Classroom[] = [];
  subjects: Subject[] = [];
  teachers: User[] = [];
  selectedClassroom: Classroom | null = null;
  currentDay: string;
  currentTime: string;
  showDetail: boolean = false;
  searchTerm = '';

  // Propiedades para vista responsive
  isWeekView: boolean = true;
  selectedDayIndex: number = 0;
  isMobileView: boolean = false;

  // Getter para aulas filtradas
  get filteredClassrooms(): Classroom[] {
    if (!this.searchTerm) {
      return this.classrooms;
    }

    return this.searchService.filterArray(
      this.classrooms,
      this.searchTerm,
      (classroom) => [
        classroom.name,
        classroom.building,
        classroom.code,
        classroom.capacity.toString(),
        classroom.floor.toString(),
        ...classroom.resources,
      ]
    );
  }

  onSearchChange(searchTerm: string) {
    this.searchTerm = searchTerm;
  }

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

  // Configuración para el header y estadísticas
  sectionConfig: AdminSectionConfig = {
    title: 'Gestión de Aulas',
    description: 'Administra las aulas y sus horarios disponibles',
    icon: 'fa-door-open',
    buttonText: 'Nueva Aula',
    statistics: this.getStatistics(),
  };

  private getStatistics(): StatisticCard[] {
    return [
      {
        icon: 'fa-door-open',
        value: this.classrooms.length,
        label: 'Aulas Totales',
        color: '#4A148C',
      },
      {
        icon: 'fa-calendar-check',
        value: this.getAvailableClassrooms(),
        label: 'Disponibles Hoy',
        color: '#1976D2',
      },
      {
        icon: 'fa-users',
        value: this.getTotalCapacity(),
        label: 'Capacidad Total',
        color: '#2E7D32',
      },
      {
        icon: 'fa-calendar-week',
        value: this.getAverageUsageDaysPerClassroom(),
        label: 'Promedio Días/Aula',
        color: '#F57C00',
      },
    ];
  }

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

    // Carga las aulas directamente desde mock data sin sus schedules hardcodeados
    this.classrooms = mockClassroomsData.classrooms.map((classroom) => ({
      ...classroom,
      schedule: [], // Vaciar el schedule ya que lo generamos dinámicamente
    }));

    this.updateStatistics(); // Actualizar estadísticas cuando se cargan las aulas
    console.log('Aulas cargadas:', this.classrooms);

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
    // Obtiene el horario dinámicamente desde los grupos
    const dynamicSchedule = this.getDynamicScheduleForClassroom(classroom.id);

    return (
      dynamicSchedule.find(
        (s) =>
          s.day === this.currentDay &&
          s.startTime <= this.currentTime &&
          s.endTime > this.currentTime
      ) || null
    );
  }

  // Método para generar horario dinámicamente desde los grupos
  private getDynamicScheduleForClassroom(
    classroomId: string
  ): ClassroomSchedule[] {
    const schedule: ClassroomSchedule[] = [];

    // Busca en todas las materias y grupos
    mockSubjectsData.subjects.forEach((subject) => {
      subject.groups.forEach((group) => {
        group.schedule.forEach((scheduleSlot) => {
          if (scheduleSlot.classroomId === classroomId) {
            schedule.push({
              subjectId: subject.id,
              groupId: group.id,
              subjectName: subject.name,
              teacherId: group.teacherId,
              teacherName: group.teacherName,
              day: scheduleSlot.day,
              startTime: scheduleSlot.startTime,
              endTime: scheduleSlot.endTime,
            });
          }
        });
      });
    });

    return schedule;
  }

  // Método para obtener el horario completo de un aula (para mostrar en vista de detalle)
  getFullScheduleForClassroom(classroomId: string): ClassroomSchedule[] {
    return this.getDynamicScheduleForClassroom(classroomId);
  }

  // Método para verificar si un aula está ocupada en un horario específico
  isClassroomOccupied(
    classroomId: string,
    day: string,
    startTime: string,
    endTime: string
  ): boolean {
    const schedule = this.getDynamicScheduleForClassroom(classroomId);
    return schedule.some(
      (slot) =>
        slot.day === day && slot.startTime < endTime && slot.endTime > startTime
    );
  }

  // Método para calcular los días únicos en que está ocupada un aula
  getClassroomUsageDays(classroomId: string): number {
    const schedule = this.getDynamicScheduleForClassroom(classroomId);
    const uniqueDays = new Set(schedule.map((slot) => slot.day));
    return uniqueDays.size;
  }

  // Método para obtener promedio de días de uso por aula
  getAverageUsageDaysPerClassroom(): number {
    if (this.classrooms.length === 0) return 0;
    const totalUsageDays = this.classrooms.reduce(
      (total, classroom) => total + this.getClassroomUsageDays(classroom.id),
      0
    );
    return Math.round((totalUsageDays / this.classrooms.length) * 10) / 10;
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
    // Obtiene el horario dinámicamente desde los grupos
    const dynamicSchedule = this.getDynamicScheduleForClassroom(classroom.id);

    return (
      dynamicSchedule.find(
        (s) => s.day === day && s.startTime <= time && s.endTime > time
      ) || null
    );
  }

  // Métodos para estadísticas
  getAvailableClassrooms(): number {
    return this.classrooms.filter((classroom) =>
      this.isCurrentlyAvailable(classroom)
    ).length;
  }

  getTotalCapacity(): number {
    return this.classrooms.reduce(
      (total, classroom) => total + classroom.capacity,
      0
    );
  }

  onCreateButtonClick(): void {
    this.createClassroom();
  }

  private updateStatistics(): void {
    this.sectionConfig.statistics = this.getStatistics();
  }
}
