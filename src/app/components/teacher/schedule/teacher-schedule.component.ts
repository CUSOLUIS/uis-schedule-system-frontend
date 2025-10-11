import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { RoleService } from '../../../services/role.service';
import { SubjectService } from '../../../services/subject.service';
import { ClassroomService } from '../../../services/classroom.service';
import { SystemConfigService } from '../../../services/system-config.service';
import { User } from '../../../interfaces/user.interface';
import { Subject, Group } from '../../../interfaces/subject.interface';
import {
  SectionHeaderComponent,
  SectionHeaderConfig,
} from '../../shared/section-header';
import {
  ScheduleViewComponent,
  ScheduleSlot,
  ScheduleViewConfig,
} from '../../shared/schedule-view/schedule-view.component';

interface TeacherSubjectInfo {
  subject: Subject;
  groups: Group[];
  totalStudents: number;
  totalHours: number;
}

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
  private subjectService = inject(SubjectService);
  private classroomService = inject(ClassroomService);
  private systemConfigService = inject(SystemConfigService);

  currentUser: User | null = null;
  teachingSubjects: TeacherSubjectInfo[] = [];
  scheduleSlots: ScheduleSlot[] = [];

  sectionConfig: SectionHeaderConfig = {
    title: 'Mi Horario Docente',
    description:
      'Gestiona tu carga académica, consulta tus horarios y supervisa tus grupos',
    icon: 'fa-chalkboard-teacher',
    buttonText: 'Generar Reporte',
    statistics: [],
  };

  scheduleConfig: ScheduleViewConfig = {
    title: 'Horario de Clases',
    subtitle: 'Tu agenda semanal de enseñanza',
    showWeekView: true,
    allowViewToggle: true,
    highlightCurrentTime: true,
  };

  ngOnInit() {
    this.currentUser = this.userService.getCurrentUser()();
    if (this.currentUser) {
      this.loadTeacherSchedule();
      this.setupStatistics();
    }
  }

  private loadTeacherSchedule() {
    if (!this.currentUser) return;

  // Listado de materias
    const subjects = this.subjectService.getAllSubjects()();
    this.teachingSubjects = [];
    this.scheduleSlots = [];

    subjects.forEach((subject: Subject) => {
      const teacherGroups = subject.groups.filter(
        (group: Group) => group.teacherId === this.currentUser!.id
      );

      if (teacherGroups.length > 0) {
        const totalStudents = teacherGroups.reduce(
          (sum: number, group: Group) => sum + group.studentIds.length,
          0
        );

        const totalHours = this.calculateSubjectTotalHours(teacherGroups);

        this.teachingSubjects.push({
          subject,
          groups: teacherGroups,
          totalStudents,
          totalHours,
        });

        // Horarios en formato `ScheduleSlot`
        teacherGroups.forEach((group: Group) => {
          group.schedule.forEach((scheduleItem) => {
            // Información de aula (edificio y piso) desde el servicio, si existe
            const classroomInfo = scheduleItem.classroomId
              ? this.classroomService.getClassroomByIdSync(scheduleItem.classroomId)
              : undefined;

            this.scheduleSlots.push({
              day: scheduleItem.day,
              startTime: scheduleItem.startTime,
              endTime: scheduleItem.endTime,
              classroom: scheduleItem.classroom,
              classroomId: scheduleItem.classroomId,
              subjectName: subject.name,
              subjectCode: subject.code,
              teacherName: group.teacherName,
              groupNumber: group.groupNumber,
              building: classroomInfo?.building,
              floor:
                classroomInfo && classroomInfo.floor != null
                  ? String(classroomInfo.floor)
                  : undefined,
            });
          });
        });
      }
    });

    this.setupStatistics();
  }

  // Cálculo de horas totales por materia
  private calculateSubjectTotalHours(groups: Group[]): number {
    let totalMinutes = 0;

    groups.forEach((group) => {
      group.schedule.forEach((schedule) => {
        const startMinutes = this.timeToMinutes(schedule.startTime);
        const endMinutes = this.timeToMinutes(schedule.endTime);
        totalMinutes += endMinutes - startMinutes;
      });
    });

    return Math.round(totalMinutes / 60);
  }

  // Conversión de hora a minutos
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Construcción de estadísticas para la cabecera
  private setupStatistics() {
    this.sectionConfig.statistics = [
      {
        icon: 'fa-book-open',
        value: this.teachingSubjects.length,
        label: 'Materias Enseñadas',
        color: '#007bff',
      },
      {
        icon: 'fa-users',
        value: this.getTotalStudents(),
        label: 'Estudiantes a Cargo',
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
    ];
  }

  getTotalGroups(): number {
    return this.teachingSubjects.reduce(
      (total, sub) => total + sub.groups.length,
      0
    );
  }

  getTotalStudents(): number {
    return this.teachingSubjects.reduce(
      (total, sub) => total + sub.totalStudents,
      0
    );
  }

  getTotalHours(): number {
    return this.teachingSubjects.reduce(
      (total, sub) => total + sub.totalHours,
      0
    );
  }

  getActiveDays(): number {
    const activeDays = new Set(this.scheduleSlots.map((slot) => slot.day));
    return activeDays.size;
  }

  getDepartment(): string {
    return 'Escuela de Ingeniería de Sistemas e Informática';
  }

  getSemesterDistribution() {
    const semesterCount: { [key: number]: number } = {};

    this.teachingSubjects.forEach((sub) => {
      const semester = sub.subject.semester;
      semesterCount[semester] = (semesterCount[semester] || 0) + 1;
    });

    const totalSubjects = this.teachingSubjects.length;

    return Object.entries(semesterCount)
      .map(([semester, count]) => ({
        number: parseInt(semester),
        count,
        percentage: totalSubjects > 0 ? (count / totalSubjects) * 100 : 0,
      }))
      .sort((a, b) => a.number - b.number);
  }

  getDailyDistribution() {
    const days = this.systemConfigService.getWorkDayNames();
    const dayHours: { [key: string]: number } = {};

    // Inicializa los días
    days.forEach((day) => (dayHours[day] = 0));

    // Calcula las  horas por día
    this.scheduleSlots.forEach((slot) => {
      const startMinutes = this.timeToMinutes(slot.startTime);
      const endMinutes = this.timeToMinutes(slot.endTime);
      const hours = (endMinutes - startMinutes) / 60;
      dayHours[slot.day] = (dayHours[slot.day] || 0) + hours;
    });

    const maxHours = Math.max(...Object.values(dayHours));

    return days.map((day) => ({
      name: day,
      hours: Math.round(dayHours[day] || 0),
      percentage: maxHours > 0 ? ((dayHours[day] || 0) / maxHours) * 100 : 0,
    }));
  }

  getUpcomingClasses() {
    const now = new Date();
    const currentDay = [
      'Domingo',
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
    ][now.getDay()];
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const upcomingClasses = this.scheduleSlots
      .map((slot) => {
        const slotTime = this.timeToMinutes(slot.startTime);
        return {
          day: slot.day,
          time: slot.startTime,
          subject: slot.subjectName,
          group: slot.groupNumber,
          classroom: slot.classroom,
          slotTime,
          dayIndex: [
            'Lunes',
            'Martes',
            'Miércoles',
            'Jueves',
            'Viernes',
            'Sábado',
          ].indexOf(slot.day),
        };
      })
      .filter((item) => {
        // Solo clases futuras
        const nowDayIndex = [
          'Lunes',
          'Martes',
          'Miércoles',
          'Jueves',
          'Viernes',
          'Sábado',
        ].indexOf(currentDay);
        return (
          item.dayIndex > nowDayIndex ||
          (item.dayIndex === nowDayIndex && item.slotTime > currentTime)
        );
      })
      .sort((a, b) => {
        if (a.dayIndex !== b.dayIndex) return a.dayIndex - b.dayIndex;
        return a.slotTime - b.slotTime;
      })
      .slice(0, 5); // Próximas 5 clases

    return upcomingClasses;
  }

  onGenerateReport() {
    const reportData = {
      teacher: this.currentUser?.fullName,
      email: this.currentUser?.email,
      department: this.getDepartment(),
      subjects: this.teachingSubjects.map((sub) => ({
        name: sub.subject.name,
        code: sub.subject.code,
        semester: sub.subject.semester,
        credits: sub.subject.credits,
        groups: sub.groups.map((group) => ({
          number: group.groupNumber,
          students: group.studentIds.length,
          maxStudents: group.maxStudents,
          schedule: group.schedule,
        })),
        totalStudents: sub.totalStudents,
        totalHours: sub.totalHours,
      })),
      summary: {
        totalSubjects: this.teachingSubjects.length,
        totalGroups: this.getTotalGroups(),
        totalStudents: this.getTotalStudents(),
        totalHours: this.getTotalHours(),
        activeDays: this.getActiveDays(),
      },
      distributions: {
        semesters: this.getSemesterDistribution(),
        dailyHours: this.getDailyDistribution(),
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
