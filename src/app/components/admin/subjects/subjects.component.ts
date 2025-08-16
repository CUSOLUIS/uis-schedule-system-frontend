import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SubjectService } from '../../../services/subject.service';
import { Subject } from '../../../interfaces/subject.interface';

@Component({
  selector: 'app-admin-subjects',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subjects.component.html',
  styleUrls: ['./subjects.component.css'],
})
export default class AdminSubjectsComponent {
  private subjectService = inject(SubjectService);
  private router = inject(Router);

  subjects = this.subjectService.getAllSubjects();

  viewSubjectDetail(subjectId: string): void {
    this.router.navigate(['/admin/subjects', subjectId]);
  }

  createSubject(): void {
    // TODO: Implementar modal o navegación para crear asignatura
    console.log('Crear nueva asignatura');
  }

  editSubject(event: Event, subjectId: string): void {
    event.stopPropagation();
    // TODO: Implementar edición
    console.log('Editar asignatura:', subjectId);
  }

  deleteSubject(event: Event, subjectId: string): void {
    event.stopPropagation();
    if (confirm('¿Está seguro de eliminar esta asignatura?')) {
      this.subjectService.deleteSubject(subjectId);
    }
  }

  // Métodos auxiliares para el template
  getTotalGroups(): number {
    return this.subjects().reduce(
      (total, subject) => total + subject.groups.length,
      0
    );
  }

  getTotalCredits(): number {
    return this.subjects().reduce(
      (total, subject) => total + subject.credits,
      0
    );
  }

  trackBySubjectId(index: number, subject: Subject): string {
    return subject.id;
  }
}
