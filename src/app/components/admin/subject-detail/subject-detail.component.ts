import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SubjectService } from '../../../services/subject.service';
import { UserService } from '../../../services/user.service';
import {
  Subject,
  Group,
  getCurrentStudents,
  isGroupFull,
} from '../../../interfaces/subject.interface';
import { User } from '../../../interfaces/user.interface';
import {
  GroupCardComponent,
  GroupCardData,
  GroupCardConfig,
} from '../../shared/group-card';

@Component({
  selector: 'app-subject-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, GroupCardComponent],
  templateUrl: './subject-detail.component.html',
  styleUrls: ['./subject-detail.component.css'],
})
export default class SubjectDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private subjectService = inject(SubjectService);
  private userService = inject(UserService);

  subject = signal<Subject | null>(null);
  teachers = signal<User[]>([]);
  students = signal<User[]>([]);
  selectedGroup = signal<Group | null>(null);
  showCreateGroupModal = signal(false);
  showEditSubjectModal = signal(false);

  // Formularios
  newGroup = {
    groupNumber: '',
    teacherId: '',
    maxStudents: 30,
    classroom: '',
    schedule: [{ day: 'Lunes', startTime: '', endTime: '', classroom: '' }],
  };

  editSubjectForm = {
    name: '',
    code: '',
    description: '',
    credits: 0,
    semester: 1,
  };

  ngOnInit(): void {
    const subjectId = this.route.snapshot.paramMap.get('id');
    if (subjectId) {
      this.loadSubject(subjectId);
    }
    this.loadUsers();
  }

  private loadSubject(id: string): void {
    const subject = this.subjectService.getSubjectById(id);
    if (subject) {
      this.subject.set(subject);
      this.editSubjectForm = {
        name: subject.name,
        code: subject.code,
        description: subject.description,
        credits: subject.credits,
        semester: subject.semester,
      };
    } else {
      this.router.navigate(['/admin/subjects']);
    }
  }

  private loadUsers(): void {
    // Cargar usuarios desde el servicio
    const allUsers = this.userService.getUsers();

    this.teachers.set(allUsers.filter((user) => user.role.id === 'teacher'));
    this.students.set(allUsers.filter((user) => user.role.id === 'student'));
  }

  // Métodos para manejar grupos
  viewGroupDetail(group: Group): void {
    this.selectedGroup.set(group);
  }

  closeGroupDetail(): void {
    this.selectedGroup.set(null);
  }

  openCreateGroupModal(): void {
    this.newGroup = {
      groupNumber: '',
      teacherId: '',
      maxStudents: 30,
      classroom: '',
      schedule: [{ day: 'Lunes', startTime: '', endTime: '', classroom: '' }],
    };
    this.showCreateGroupModal.set(true);
  }

  closeCreateGroupModal(): void {
    this.showCreateGroupModal.set(false);
  }

  addScheduleSlot(): void {
    this.newGroup.schedule.push({
      day: 'Lunes',
      startTime: '',
      endTime: '',
      classroom: '',
    });
  }

  removeScheduleSlot(index: number): void {
    if (this.newGroup.schedule.length > 1) {
      this.newGroup.schedule.splice(index, 1);
    }
  }

  createGroup(): void {
    const subject = this.subject();
    if (!subject) return;

    const teacher = this.teachers().find(
      (t) => t.id === this.newGroup.teacherId
    );
    if (!teacher) {
      alert('Debe seleccionar un profesor');
      return;
    }

    // Agrega validación y asignación de classroomId
    const scheduleWithClassroomId = this.newGroup.schedule
      .filter((s) => s.startTime && s.endTime)
      .map((s) => ({
        ...s,
        classroomId: this.getClassroomIdByName(s.classroom),
      }));

    const newGroup: Omit<Group, 'id' | 'subjectId'> = {
      groupNumber: this.newGroup.groupNumber,
      schedule: scheduleWithClassroomId,
      teacherId: this.newGroup.teacherId,
      teacherName: teacher.fullName ?? '',
      studentIds: [],
      maxStudents: this.newGroup.maxStudents,
      classroom: this.newGroup.classroom,
      semester: subject.semester,
    };

    this.subjectService.createGroup(subject.id, newGroup);
    this.loadSubject(subject.id);
    this.closeCreateGroupModal();
  }

  // Función helper para obtener classroomId por nombre
  private getClassroomIdByName(classroomName: string): string | undefined {
    // Esta función debería buscar en la lista de aulas disponibles
    // Por ahora retornamos undefined, pero se debe implementar la lógica
    return undefined;
  }

  deleteGroup(groupId: string): void {
    if (confirm('¿Está seguro de eliminar este grupo?')) {
      this.subjectService.deleteGroup(groupId);
      const subject = this.subject();
      if (subject) {
        this.loadSubject(subject.id);
      }
    }
  }

  // Métodos para manejar asignatura
  openEditSubjectModal(): void {
    this.showEditSubjectModal.set(true);
  }

  closeEditSubjectModal(): void {
    this.showEditSubjectModal.set(false);
  }

  updateSubject(): void {
    const subject = this.subject();
    if (!subject) return;

    this.subjectService.updateSubject(subject.id, this.editSubjectForm);
    this.loadSubject(subject.id);
    this.closeEditSubjectModal();
  }

  deleteSubject(): void {
    const subject = this.subject();
    if (!subject) return;

    if (
      confirm(
        '¿Está seguro de eliminar esta asignatura? Esta acción eliminará todos los grupos asociados.'
      )
    ) {
      this.subjectService.deleteSubject(subject.id);
      this.router.navigate(['/admin/subjects']);
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/subjects']);
  }

  // Métodos para manejar estudiantes
  enrollStudent(groupId: string, studentId: string): void {
    this.subjectService.enrollStudentInGroup(groupId, studentId);
    const subject = this.subject();
    if (subject) {
      this.loadSubject(subject.id);
    }
  }

  unenrollStudent(groupId: string, studentId: string): void {
    if (confirm('¿Está seguro de desenrolar al estudiante?')) {
      this.subjectService.unenrollStudentFromGroup(groupId, studentId);
      const subject = this.subject();
      if (subject) {
        this.loadSubject(subject.id);
      }
    }
  }

  getStudentName(studentId: string): string {
    const student = this.students().find((s) => s.id === studentId);
    return student?.fullName || 'Estudiante no encontrado';
  }

  getAvailableStudents(group: Group): User[] {
    return this.students().filter(
      (student) => !group.studentIds.includes(student.id)
    );
  }

  // Métodos helper para cálculos dinámicos
  getCurrentStudents(group: Group): number {
    return getCurrentStudents(group);
  }

  isGroupFull(group: Group): boolean {
    return isGroupFull(group);
  }

  getAvailableSpots(group: Group): number {
    return Math.max(0, group.maxStudents - getCurrentStudents(group));
  }

  // Configuración para las tarjetas de grupo en subject-detail
  groupCardConfig: GroupCardConfig = {
    showTeacher: true,
    showSubject: false,
    showMaxStudents: true,
    showViewButton: true,
    showEditButton: false,
    showDeleteButton: true,
    compactMode: false,
  };

  // Convierte Group a GroupCardData para subject-detail
  convertGroupToCardData(group: Group): GroupCardData {
    // Formatea el horario desde slots de schedule
    const scheduleText = group.schedule
      .map((slot) => `${slot.day} ${slot.startTime}-${slot.endTime}`)
      .join(', ');

    return {
      id: parseInt(group.id.replace('g', '')),
      name: `Grupo ${group.groupNumber}`,
      subject: this.subject()?.name || '',
      schedule: scheduleText,
      studentCount: getCurrentStudents(group),
      classroom: group.classroom,
      groupNumber: group.groupNumber,
      teacherName: group.teacherName,
      maxStudents: group.maxStudents,
    };
  }

  // Maneja los eventos del componente de tarjeta
  onGroupCardView(groupData: GroupCardData): void {
    const group = this.subject()?.groups?.find(
      (g) => parseInt(g.id.replace('g', '')) === groupData.id
    );
    if (group) {
      this.viewGroupDetail(group);
    }
  }

  onGroupCardDelete(groupData: GroupCardData): void {
    const groupId = `g${groupData.id}`;
    this.deleteGroup(groupId);
  }

  onGroupCardClick(groupData: GroupCardData): void {
    this.onGroupCardView(groupData);
  }
}
