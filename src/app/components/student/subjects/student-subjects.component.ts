import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { SubjectService } from '../../../services/subject.service';
import { User } from '../../../interfaces/user.interface';
import { Subject, Group } from '../../../interfaces/subject.interface';
import {
  SectionHeaderComponent,
  SectionHeaderConfig,
  StatisticCard,
} from '../../shared/section-header';

interface EnrolledSubjectInfo {
  subject: Subject;
  group: Group;
  classmates: number;
  nextClass?: string;
}

@Component({
  selector: 'app-student-subjects',
  standalone: true,
  imports: [CommonModule, SectionHeaderComponent],
  templateUrl: './student-subjects.component.html',
  styleUrls: ['./student-subjects.component.css'],
})
export class StudentSubjectsComponent implements OnInit {
  private userService = inject(UserService);
  private subjectService = inject(SubjectService);
  private router = inject(Router);

  currentUser: User | null = null;
  enrolledSubjects: EnrolledSubjectInfo[] = [];
  totalCredits = 0;
  currentSemester = 0;
  selectedSubject: EnrolledSubjectInfo | null = null;
  showDetailPanel = false;
  headerConfig!: SectionHeaderConfig;

  ngOnInit() {
    this.currentUser = this.userService.getCurrentUser()();
    if (this.currentUser) {
      this.loadEnrolledSubjects();
      this.setupHeaderConfig();
    }
  }

  private setupHeaderConfig() {
    if (!this.currentUser) return;

    const statistics: StatisticCard[] = [
      {
        icon: 'fa-book',
        value: this.enrolledSubjects.length,
        label: 'Materias Inscritas',
        color: '#1976D2',
      },
      {
        icon: 'fa-credit-card',
        value: this.totalCredits,
        label: 'Créditos Totales',
        color: '#2E7D32',
      },
      {
        icon: 'fa-layer-group',
        value: this.currentSemester,
        label: 'Semestre Actual',
        color: '#F57C00',
      },
    ];

    this.headerConfig = {
      title: 'Mis Materias',
      description: `Materias inscritas para el estudiante ${this.currentUser.fullName}`,
      icon: 'fa-user-graduate',
      buttonText: 'Ver Horario',
      statistics,
    };
  }

  private loadEnrolledSubjects() {
    if (!this.currentUser) return;

    const allSubjects = this.subjectService.getAllSubjects()();

    this.enrolledSubjects = allSubjects
      .filter((subject) =>
        subject.groups.some((group) =>
          group.studentIds.includes(this.currentUser!.id)
        )
      )
      .map((subject) => {
        const enrolledGroup = subject.groups.find((group) =>
          group.studentIds.includes(this.currentUser!.id)
        )!;

        return {
          subject,
          group: enrolledGroup,
          classmates: enrolledGroup.studentIds.length,
          nextClass: this.getNextClass(enrolledGroup),
        };
      });

    this.totalCredits = this.enrolledSubjects.reduce(
      (sum, item) => sum + item.subject.credits,
      0
    );
    this.currentSemester = Math.max(
      ...this.enrolledSubjects.map((item) => item.subject.semester)
    );
  }

  private getNextClass(group: Group): string {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = domingo, 1 = lunes, etc.
    const currentTime = today.getHours() * 100 + today.getMinutes();

    const dayMap: Record<number, string> = {
      1: 'Lunes',
      2: 'Martes',
      3: 'Miércoles',
      4: 'Jueves',
      5: 'Viernes',
    };

    // Buscar próxima clase en la semana
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const checkDay = (currentDay + dayOffset) % 7;
      if (checkDay === 0 || checkDay === 6) continue; // Saltar fin de semana

      const dayName = dayMap[checkDay];
      const classesToday = group.schedule.filter(
        (item) => item.day === dayName
      );

      for (const classItem of classesToday) {
        const classTime = parseInt(classItem.startTime.replace(':', ''));

        if (dayOffset === 0) {
          // Hoy - solo clases futuras
          if (classTime > currentTime) {
            return `${dayName} ${classItem.startTime}`;
          }
        } else {
          // Días futuros - primera clase del día
          return `${dayName} ${classItem.startTime}`;
        }
      }
    }

    return 'No hay clases próximas';
  }

  onSubjectClick(subject: EnrolledSubjectInfo) {
    this.selectedSubject = subject;
    this.showDetailPanel = true;
  }

  closeDetailPanel() {
    this.showDetailPanel = false;
    this.selectedSubject = null;
  }

  goToSchedule() {
    this.router.navigate(['/student/schedule']);
  }

  getSemesterColor(semester: number): string {
    const colors = [
      '#1976D2',
      '#7B1FA2',
      '#388E3C',
      '#F57C00',
      '#E91E63',
      '#00796B',
      '#5D4037',
      '#616161',
    ];
    return colors[(semester - 1) % colors.length];
  }

  onViewSchedule() {
    // Navega a la vista de horario del estudiante
    this.router.navigate(['/student/schedule']);
  }
}
