import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SubjectService } from '../../../services/subject.service';
import { UserService } from '../../../services/user.service';
import { SearchService } from '../../../services/search.service';
import { Subject } from '../../../interfaces/subject.interface';
import { 
  AdminSectionHeaderComponent, 
  AdminSectionConfig, 
  StatisticCard 
} from '../../shared/admin-section-header';
import { SearchBoxComponent } from '../../shared/search-box/search-box.component';

@Component({
  selector: 'app-admin-subjects',
  standalone: true,
  imports: [CommonModule, AdminSectionHeaderComponent, SearchBoxComponent, FormsModule],
  templateUrl: './subjects.component.html',
  styleUrls: ['./subjects.component.css'],
})
export default class AdminSubjectsComponent {
  private subjectService = inject(SubjectService);
  private userService = inject(UserService);
  private searchService = inject(SearchService);
  private router = inject(Router);

  subjects = this.subjectService.getAllSubjects();
  searchTerm = '';
  
  // Configuración para el header y estadísticas
  sectionConfig: AdminSectionConfig = {
    title: 'Gestión de Asignaturas',
    description: 'Administra las asignaturas y sus configuraciones',
    icon: 'fa-book-open',
    buttonText: 'Nueva Asignatura',
    statistics: this.getStatistics()
  };

  // Getter para asignaturas filtradas
  get filteredSubjects() {
    if (!this.searchTerm) {
      return this.subjects();
    }

    return this.searchService.filterArray(this.subjects(), this.searchTerm, (subject) => [
      subject.name,
      subject.description,
      subject.code,
      subject.semester.toString(),
      ...subject.groups.map(group => `${group.groupNumber} ${group.classroom} ${group.teacherName}`)
    ]);
  }

  onSearchChange(searchTerm: string) {
    this.searchTerm = searchTerm;
  }

  private getStatistics(): StatisticCard[] {
    return [
      {
        icon: 'fa-list',
        value: this.subjects().length,
        label: 'Asignaturas',
        color: '#4A148C'
      },
      {
        icon: 'fa-layer-group',
        value: this.getTotalGroups(),
        label: 'Grupos Totales',
        color: '#1976D2'
      },
      {
        icon: 'fa-graduation-cap',
        value: this.getTotalCredits(),
        label: 'Créditos Totales',
        color: '#2E7D32'
      }
    ];
  }

  viewSubjectDetail(subjectId: string): void {
    this.router.navigate(['/admin/subjects', subjectId]);
  }

  createSubject(): void {
    // TODO: Implementar modal o navegación para crear asignatura
    console.log('Crear nueva asignatura');
  }

  onCreateButtonClick(): void {
    this.createSubject();
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
      // Actualizar estadísticas después de eliminar
      this.updateStatistics();
    }
  }

  private updateStatistics(): void {
    this.sectionConfig.statistics = this.getStatistics();
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
