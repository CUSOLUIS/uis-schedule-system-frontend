import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { User } from '../../../interfaces/user.interface';

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-profile.component.html',
  styleUrls: ['./student-profile.component.css'],
})
export class StudentProfileComponent implements OnInit {
  private userService = inject(UserService);
  private router = inject(Router);

  currentUser: User | null = null;
  enrolledSubjectsCount = 0;
  currentSemester = 0;
  totalCredits = 0;

  ngOnInit() {
    this.currentUser = this.userService.getCurrentUser()();
    if (!this.currentUser || this.currentUser.role.id !== 'student') {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.loadStudentData();
  }

  private loadStudentData() {
    // TODO: cargar datos adicionales del estudiante
    // Por ahora usamos datos simulados
    this.enrolledSubjectsCount = 6;
    this.currentSemester = 5;
    this.totalCredits = 18;
  }

  goToSchedule() {
    this.router.navigate(['/student/schedule']);
  }

  goToSubjects() {
    this.router.navigate(['/student/subjects']);
  }

  editProfile() {
    // TODO: Implementar edición de perfil
    console.log('Editar perfil');
  }
}
