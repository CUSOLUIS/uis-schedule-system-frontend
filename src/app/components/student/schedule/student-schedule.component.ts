import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { RoleService } from '../../../services/role.service';
import { SubjectService } from '../../../services/subject.service';
import { ClassroomService } from '../../../services/classroom.service';
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

@Component({
  selector: 'app-student-schedule',
  standalone: true,
  imports: [CommonModule, SectionHeaderComponent, ScheduleViewComponent],
  templateUrl: './student-schedule.component.html',
  styleUrls: ['./student-schedule.component.css'],
})
export class StudentScheduleComponent implements OnInit {
  private userService = inject(UserService);
  private roleService = inject(RoleService);
  private subjectService = inject(SubjectService);
  private classroomService = inject(ClassroomService);

  currentUser: User | null = null;
  // Campo `scheduleWithLocation` por materia matriculada (horarios con ubicación)
  enrolledSubjects: { subject: Subject; group: Group; scheduleWithLocation?: any[] }[] = [];
  scheduleSlots: ScheduleSlot[] = [];

  sectionConfig: SectionHeaderConfig = {
    title: 'Mi Horario Académico',
    description:
      'Consulta tu horario semanal, materias matriculadas y planifica tu tiempo de estudio',
    icon: 'fa-calendar-alt',
    buttonText: 'Exportar Horario',
    statistics: [],
  };

  scheduleConfig: ScheduleViewConfig = {
    title: 'Horario Semanal',
    subtitle: 'Tu horario de clases',
    showWeekView: true,
    allowViewToggle: true,
    highlightCurrentTime: true,
    isStudentView: true, // Nueva propiedad para filtrar horas
  };

  ngOnInit() {
    this.currentUser = this.userService.getCurrentUser()();
    if (this.currentUser) {
      this.loadStudentSchedule();
      this.setupStatistics();
    }
  }

  private loadStudentSchedule() {
    if (!this.currentUser) return;

  // Listado de materias
    const subjects = this.subjectService.getAllSubjects()();

  // Materias con matrícula del estudiante
    this.enrolledSubjects = [];
    this.scheduleSlots = [];

    subjects.forEach((subject: Subject) => {
      subject.groups.forEach((group: Group) => {
        if (group.studentIds.includes(this.currentUser!.id)) {
          // Schedule del grupo enriquecido con la ubicación del aula
          const scheduleWithLocation = group.schedule.map((scheduleItem) => {
            const classroom = scheduleItem.classroomId
              ? this.classroomService.getClassroomByIdSync(
                  scheduleItem.classroomId
                )
              : undefined;

            // Array global `scheduleSlots` usado por el visor (con ubicación)
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
              building: classroom?.building,
              floor: classroom?.floor?.toString(),
            });

            return {
              ...scheduleItem,
              building: classroom?.building,
              floor: classroom?.floor != null ? String(classroom?.floor) : undefined,
            };
          });

          this.enrolledSubjects.push({ subject, group, scheduleWithLocation });
        }
      });
    });

    this.setupStatistics();
  }

  // Estadísticas de la sección
  private setupStatistics() {
    this.sectionConfig.statistics = [
      {
        icon: 'fa-book',
        value: this.enrolledSubjects.length,
        label: 'Materias Matriculadas',
        color: '#007bff',
      },
      {
        icon: 'fa-graduation-cap',
        value: this.getTotalCredits(),
        label: 'Créditos Totales',
        color: '#28a745',
      },
      {
        icon: 'fa-clock',
        value: this.getTotalHours(),
        label: 'Horas por Semana',
        color: '#ffc107',
      },
      {
        icon: 'fa-calendar-day',
        value: this.getActiveDays(),
        label: 'Días de Clase',
        color: '#dc3545',
      },
    ];
  }

  getCurrentSemester(): number {
    if (this.enrolledSubjects.length === 0) return 0;

    // Semestre máximo entre las materias matriculadas
    return Math.max(
      ...this.enrolledSubjects.map((sub) => sub.subject.semester)
    );
  }

  getTotalCredits(): number {
    return this.enrolledSubjects.reduce(
      (total, sub) => total + sub.subject.credits,
      0
    );
  }

  getTotalHours(): number {
    let totalMinutes = 0;

    this.scheduleSlots.forEach((slot) => {
      const startMinutes = this.timeToMinutes(slot.startTime);
      const endMinutes = this.timeToMinutes(slot.endTime);
      totalMinutes += endMinutes - startMinutes;
    });

    return Math.round(totalMinutes / 60);
  }

  getActiveDays(): number {
    const activeDays = new Set(this.scheduleSlots.map((slot) => slot.day));
    return activeDays.size;
  }

  getBusiestDay(): string {
    const dayCount: { [key: string]: number } = {};

    this.scheduleSlots.forEach((slot) => {
      dayCount[slot.day] = (dayCount[slot.day] || 0) + 1;
    });

    let busiestDay = 'Ninguno';
    let maxCount = 0;

    Object.entries(dayCount).forEach(([day, count]) => {
      if (count > maxCount) {
        maxCount = count;
        busiestDay = day;
      }
    });

    return busiestDay;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  onExportSchedule() {
    // Exportación del horario (generación de datos)
    const scheduleData = {
      student: this.currentUser?.fullName,
      email: this.currentUser?.email,
      subjects: this.enrolledSubjects.map((sub) => ({
        name: sub.subject.name,
        code: sub.subject.code,
        group: sub.group.groupNumber,
        teacher: sub.group.teacherName,
        credits: sub.subject.credits,
        schedule: sub.group.schedule,
      })),
      totalCredits: this.getTotalCredits(),
      totalHours: this.getTotalHours(),
      generatedAt: new Date().toLocaleString('es-ES'),
    };

  // Generación y descarga del archivo JSON
    const dataStr = JSON.stringify(scheduleData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `horario_${
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
    if (!roleId) return '#F8F9FA';

    const role = this.roleService.getRoleById(roleId);
    return role?.colorScheme.primary || '#F8F9FA';
  }

  getUserRoleSecondary(): string {
    const roleId = this.currentUser?.role?.id;
    if (!roleId) return '#E9ECEF';

    const role = this.roleService.getRoleById(roleId);
    return role?.colorScheme.secondary || '#E9ECEF';
  }
}
