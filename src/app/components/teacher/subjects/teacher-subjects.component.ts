import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { SubjectService } from '../../../services/subject.service';
import { User } from '../../../interfaces/user.interface';
import { Subject, Group } from '../../../interfaces/subject.interface';
import {
  SectionHeaderComponent,
  SectionHeaderConfig,
  StatisticCard,
} from '../../shared/section-header/section-header.component';
import mockUsers from '../../../data/mock-user.json';

interface TeacherSubjectInfo {
  subject: Subject;
  groups: Group[];
  totalStudents: number;
  averageOccupancy: number;
}

interface StudentInfo {
  id: string;
  fullName: string;
  email: string;
}

@Component({
  selector: 'app-teacher-subjects',
  standalone: true,
  imports: [CommonModule, SectionHeaderComponent],
  templateUrl: './teacher-subjects.component.html',
  styleUrls: ['./teacher-subjects.component.css'],
})
export class TeacherSubjectsComponent implements OnInit {
  private userService = inject(UserService);
  private subjectService = inject(SubjectService);

  currentUser: User | null = null;
  teacherSubjects: TeacherSubjectInfo[] = [];
  selectedSubject: TeacherSubjectInfo | null = null;
  selectedGroup: Group | null = null;
  showSubjectDetails = false;
  showStudentsList = false;
  students: StudentInfo[] = [];
  headerConfig!: SectionHeaderConfig;

  ngOnInit() {
    this.currentUser = this.userService.getCurrentUser()();
    if (this.currentUser) {
      this.loadTeacherSubjects();
      this.setupHeaderConfig();
    }
  }

  private setupHeaderConfig() {
    if (!this.currentUser) return;

    const statistics: StatisticCard[] = [
      {
        icon: 'fa-book',
        value: this.teacherSubjects.length,
        label: 'Materias Asignadas',
        color: '#1976D2',
      },
      {
        icon: 'fa-users',
        value: this.teacherSubjects.reduce(
          (sum, s) => sum + s.totalStudents,
          0
        ),
        label: 'Total Estudiantes',
        color: '#2E7D32',
      },
      {
        icon: 'fa-chart-line',
        value: `${Math.round(
          this.teacherSubjects.reduce((sum, s) => sum + s.averageOccupancy, 0) /
            this.teacherSubjects.length || 0
        )}%`,
        label: 'Ocupación Promedio',
        color: '#F57C00',
      },
    ];

    this.headerConfig = {
      title: 'Mis Materias',
      description: `Gestiona las materias asignadas para el profesor ${this.currentUser.fullName}`,
      icon: 'fa-chalkboard-teacher',
      gradient: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
      showStatistics: true,
      statistics,
    };
  }

  private loadTeacherSubjects() {
    if (!this.currentUser) return;

    const subjects = this.subjectService.getSubjectsByTeacher(
      this.currentUser.id
    );

    this.teacherSubjects = subjects.map((subject) => {
      const teacherGroups = subject.groups.filter(
        (group) => group.teacherId === this.currentUser!.id
      );

      const totalStudents = teacherGroups.reduce(
        (sum, group) => sum + group.studentIds.length,
        0
      );

      const averageOccupancy =
        teacherGroups.length > 0
          ? (teacherGroups.reduce(
              (sum, group) => sum + group.studentIds.length / group.maxStudents,
              0
            ) /
              teacherGroups.length) *
            100
          : 0;

      return {
        subject,
        groups: teacherGroups,
        totalStudents,
        averageOccupancy,
      };
    });
  }

  onSubjectClick(subjectInfo: TeacherSubjectInfo) {
    this.selectedSubject = subjectInfo;
    this.showSubjectDetails = true;
  }

  onGroupClick(group: Group) {
    this.selectedGroup = group;
    this.loadGroupStudents(group);
    this.showStudentsList = true;
  }

  private loadGroupStudents(group: Group) {
    const allUsers = mockUsers.users;
    this.students = group.studentIds
      .map((studentId) => {
        const user = allUsers.find((u) => u.id === studentId);
        return user
          ? {
              id: user.id,
              fullName: user.fullName,
              email: user.email,
            }
          : null;
      })
      .filter((student) => student !== null) as StudentInfo[];
  }

  closeSubjectDetails() {
    this.showSubjectDetails = false;
    this.selectedSubject = null;
  }

  closeStudentsList() {
    this.showStudentsList = false;
    this.selectedGroup = null;
    this.students = [];
  }

  getOccupancyColor(percentage: number): string {
    if (percentage >= 90) return '#E53E3E';
    if (percentage >= 75) return '#F56500';
    if (percentage >= 50) return '#38A169';
    return '#3182CE';
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

  exportStudentsList() {
    if (this.selectedGroup && this.students.length > 0) {
      const csvContent = this.generateCSV();
      this.downloadCSV(
        csvContent,
        `estudiantes_${this.selectedGroup.groupNumber}_${this.selectedSubject?.subject.code}.csv`
      );
    }
  }

  private generateCSV(): string {
    const headers = ['ID', 'Nombre Completo', 'Email'];
    const rows = this.students.map((student) => [
      student.id,
      student.fullName,
      student.email,
    ]);

    return [headers, ...rows]
      .map((row) => row.map((field) => `"${field}"`).join(','))
      .join('\n');
  }

  private downloadCSV(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  getTotalGroups(): number {
    return this.teacherSubjects.reduce(
      (sum, subject) => sum + subject.groups.length,
      0
    );
  }

  getTotalStudents(): number {
    return this.teacherSubjects.reduce(
      (sum, subject) => sum + subject.totalStudents,
      0
    );
  }
}
