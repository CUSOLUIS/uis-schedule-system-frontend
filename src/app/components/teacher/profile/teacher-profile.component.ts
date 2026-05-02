import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import mockTeachersInfo from '../../../data/mock-teachers-info.json';
import { Subject } from '../../../interfaces/subject.interface';
import { User } from '../../../interfaces/user.interface';
import { SubjectService } from '../../../services/subject.service';
import { UserService } from '../../../services/user.service';

interface TeacherExtraInfo {
  universityCareer: string;
  office: string;
  department: string;
  phone: string;
  academicTitle: string;
  specialization: string;
  yearsOfExperience: number;
  education: string[];
  researchAreas: string[];
  publications: number;
  projects: string[];
}

@Component({
  selector: 'app-teacher-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './teacher-profile.component.html',
  styleUrls: ['./teacher-profile.component.css'],
})
export class TeacherProfileComponent implements OnInit {
  private userService = inject(UserService);
  private subjectService = inject(SubjectService);
  private router = inject(Router);

  currentUser: User | null = null;
  teacherInfo: TeacherExtraInfo | null = null;
  assignedSubjects: Subject[] = [];
  totalStudents = 0;
  totalGroups = 0;

  ngOnInit() {
    this.currentUser = this.userService.getCurrentUser()();
    if (!this.currentUser || this.currentUser.role.id !== 'teacher') {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.loadTeacherData();
  }

  private loadTeacherData() {
    if (!this.currentUser) return;

    // Carga información extra del profesor
    const teachersExtraInfo = (mockTeachersInfo as any).teachersExtraInfo;
    const defaultInfo = (mockTeachersInfo as any).defaultInfo;

    this.teacherInfo = teachersExtraInfo[this.currentUser.id] || defaultInfo;

    // Carga materias asignadas
    this.assignedSubjects = this.subjectService.getSubjectsByTeacher(
      this.currentUser.id,
    );

    // Calcula estadísticas
    this.totalGroups = this.assignedSubjects.reduce(
      (total, subject) =>
        total +
        subject.groups.filter(
          (group) => group.teacherId === this.currentUser!.id,
        ).length,
      0,
    );

    this.totalStudents = this.assignedSubjects.reduce(
      (total, subject) =>
        total +
        subject.groups
          .filter((group) => group.teacherId === this.currentUser!.id)
          .reduce(
            (groupTotal, group) => groupTotal + group.studentIds.length,
            0,
          ),
      0,
    );
  }

  goToSchedule() {
    this.router.navigate(['/teacher/schedule']);
  }

  goToSubjects() {
    this.router.navigate(['/teacher/subjects']);
  }

  editProfile() {
    // TODO: Implementar edición de perfil
    console.log('Editar perfil del profesor');
  }

  goToChangePassword() {
    this.router.navigate(['/cambiar-contrasena']);
  }

  getExperienceLevel(): string {
    if (!this.teacherInfo) return 'Principiante';

    const years = this.teacherInfo.yearsOfExperience;
    if (years >= 15) return 'Experto Senior';
    if (years >= 10) return 'Experto';
    if (years >= 5) return 'Experimentado';
    return 'Junior';
  }

  getExperienceColor(): string {
    if (!this.teacherInfo) return '#666';

    const years = this.teacherInfo.yearsOfExperience;
    if (years >= 15) return '#1B5E20';
    if (years >= 10) return '#2E7D32';
    if (years >= 5) return '#388E3C';
    return '#66BB6A';
  }
}
