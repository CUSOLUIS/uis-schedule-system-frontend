import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  SectionHeaderComponent,
  SectionHeaderConfig,
  StatisticCard,
} from '../../shared/section-header';
import { SearchBoxComponent } from '../../shared/search-box/search-box.component';
import {
  GroupCardComponent,
  GroupCardData,
  GroupCardConfig,
} from '../../shared/group-card';
import { SearchService } from '../../../services/search.service';
import mockUserData from '../../../data/mock-user.json';
import mockSubjectsData from '../../../data/mock-subjects.json';
import mockClassroomsData from '../../../data/mock-classrooms.json';
import mockTeachersInfo from '../../../data/mock-teachers-info.json';

interface User {
  id: string;
  username: string;
  password: string;
  role: string;
  fullName: string;
  email: string;
}

interface Teacher extends User {
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
  groups: Group[];
}

interface Group {
  id: number;
  name: string;
  subject: string;
  schedule: string;
  studentCount: number;
  classroom: string;
}

@Component({
  selector: 'app-teachers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SectionHeaderComponent,
    SearchBoxComponent,
    GroupCardComponent,
  ],
  templateUrl: './teachers.html',
  styleUrl: './teachers.css',
})
export default class TeachersComponent {
  selectedTeacher: Teacher | null = null;
  selectedGroup: Group | null = null;
  showGroups = false;
  searchTerm = '';

  // Datos de ejemplo para los profesores basados en mock-user.json
  teachers: Teacher[] = [];

  // Configuración para el header y estadísticas
  sectionConfig: SectionHeaderConfig = {
    title: 'Gestión de Profesores',
    description: 'Administra los profesores y sus asignaciones',
    icon: 'fa-chalkboard-teacher',
    buttonText: 'Nuevo Profesor',
    statistics: [], // Inicialmente vacío, se actualiza en el constructor
  };

  // Getter para profesores filtrados
  get filteredTeachers(): Teacher[] {
    if (!this.teachers || !this.searchTerm) {
      return this.teachers || [];
    }

    return this.searchService.filterArray(
      this.teachers,
      this.searchTerm,
      (teacher) => [
        teacher.fullName,
        teacher.email,
        teacher.universityCareer,
        teacher.office,
        teacher.department,
        teacher.specialization,
        teacher.academicTitle,
        ...teacher.researchAreas,
        ...teacher.groups.map((group) => `${group.subject} ${group.name}`),
      ]
    );
  }

  constructor(private searchService: SearchService) {
    // Inicializa profesores desde mock data
    this.initializeTeachers();
    // Inicializa estadísticas
    this.updateStatistics();
  }

  onSearchChange(searchTerm: string) {
    this.searchTerm = searchTerm;
  }

  private initializeTeachers(): void {
    const teacherUsers = mockUserData.users.filter(
      (user) => user.role === 'teacher'
    );

    this.teachers = teacherUsers.map((user) => {
      // Obtiene todos los grupos de todas las materias asignados a este profesor
      const teacherGroups = this.getTeacherGroups(user.id);

      // Información adicional del profesor
      const extraInfo = this.getTeacherExtraInfo(user.id);

      return {
        ...user,
        ...extraInfo,
        groups: teacherGroups,
      };
    });
  }

  private getTeacherGroups(teacherId: string): Group[] {
    const groups: Group[] = [];

    // Busca en todas las materias los grupos asignados a este profesor
    mockSubjectsData.subjects.forEach((subject) => {
      subject.groups.forEach((group) => {
        if (group.teacherId === teacherId) {
          // Obtiene información del aula desde mock-classrooms
          const classroom = this.getClassroomInfo(
            group.schedule[0]?.classroomId
          );

          groups.push({
            id: parseInt(group.id.replace('g', '')),
            name: `${subject.name} - Grupo ${group.groupNumber}`,
            subject: subject.name,
            schedule: this.formatSchedule(group.schedule),
            studentCount: group.studentIds.length,
            classroom: classroom?.name || group.classroom,
          });
        }
      });
    });

    return groups;
  }

  private getTeacherExtraInfo(teacherId: string) {
    // Obtiene información desde el mock
    const teacherInfo =
      mockTeachersInfo.teachersExtraInfo[
        teacherId as keyof typeof mockTeachersInfo.teachersExtraInfo
      ];

    if (teacherInfo) {
      return {
        universityCareer: teacherInfo.universityCareer,
        office: teacherInfo.office,
        department: teacherInfo.department,
        phone: teacherInfo.phone,
        academicTitle: teacherInfo.academicTitle,
        specialization: teacherInfo.specialization,
        yearsOfExperience: teacherInfo.yearsOfExperience,
        education: teacherInfo.education,
        researchAreas: teacherInfo.researchAreas,
        publications: teacherInfo.publications,
        projects: teacherInfo.projects,
      };
    }

    // Información por defecto si no se encuentra en el mock
    const defaultInfo = mockTeachersInfo.defaultInfo;
    return {
      universityCareer: defaultInfo.universityCareer,
      office: `Oficina ${100 + parseInt(teacherId)} - Bloque ${
        10 + parseInt(teacherId)
      }`,
      department: defaultInfo.department,
      phone: defaultInfo.phone,
      academicTitle: defaultInfo.academicTitle,
      specialization: defaultInfo.specialization,
      yearsOfExperience: defaultInfo.yearsOfExperience,
      education: defaultInfo.education,
      researchAreas: defaultInfo.researchAreas,
      publications: defaultInfo.publications,
      projects: defaultInfo.projects,
    };
  }

  private getClassroomInfo(classroomId?: string) {
    if (!classroomId) return null;
    return mockClassroomsData.classrooms.find(
      (classroom) => classroom.id === classroomId
    );
  }

  private formatSchedule(schedule: any[]): string {
    if (!schedule || schedule.length === 0) return 'Sin horario asignado';

    return schedule
      .map((slot) => `${slot.day} ${slot.startTime}-${slot.endTime}`)
      .join(', ');
  }

  getStatistics(): StatisticCard[] {
    return [
      {
        icon: 'fa-chalkboard-teacher',
        value: this.totalTeachers,
        label: 'Total Profesores',
        color: '#1976D2',
      },
      {
        icon: 'fa-user-graduate',
        value: this.totalStudents,
        label: 'Total Estudiantes',
        color: '#2E7D32',
      },
      {
        icon: 'fa-layer-group',
        value: this.totalGroups,
        label: 'Grupos Activos',
        color: '#F57C00',
      },
      {
        icon: 'fa-chart-bar',
        value: this.averageStudentsPerTeacher,
        label: 'Promedio Est/Prof',
        color: '#7B1FA2',
      },
    ];
  }

  updateStatistics(): void {
    this.sectionConfig.statistics = this.getStatistics();
  }

  onCreateButtonClick(): void {
    console.log('Crear nuevo profesor');
    // Aquí iría la lógica para abrir el modal/formulario de creación
  }

  selectTeacher(teacher: Teacher) {
    this.selectedTeacher = teacher;
    this.showGroups = true;
  }

  backToTeachers() {
    this.selectedTeacher = null;
    this.showGroups = false;
  }

  getTotalStudents(teacher: Teacher): number {
    return teacher.groups.reduce(
      (total, group) => total + group.studentCount,
      0
    );
  }

  get totalTeachers(): number {
    return this.teachers?.length || 0;
  }

  get totalGroups(): number {
    return this.teachers?.reduce((sum, t) => sum + t.groups.length, 0) || 0;
  }

  get totalStudents(): number {
    return (
      this.teachers?.reduce((sum, t) => sum + this.getTotalStudents(t), 0) || 0
    );
  }

  get averageStudentsPerTeacher(): number {
    if (this.totalTeachers === 0) return 0;
    return Math.round(this.totalStudents / this.totalTeachers);
  }

  // Métodos para manejar grupos
  viewGroupDetail(group: Group): void {
    this.selectedGroup = group;
  }

  closeGroupDetail(): void {
    this.selectedGroup = null;
  }

  // Configuración para las tarjetas de grupo
  groupCardConfig: GroupCardConfig = {
    showTeacher: false,
    showSubject: true,
    showMaxStudents: false,
    showViewButton: true,
    showEditButton: false,
    showDeleteButton: false,
    compactMode: false,
  };

  // Convierte Group a GroupCardData
  convertToGroupCardData(group: Group): GroupCardData {
    return {
      id: group.id,
      name: group.name,
      subject: group.subject,
      schedule: group.schedule,
      studentCount: group.studentCount,
      classroom: group.classroom,
    };
  }

  // Maneja eventos del componente de tarjeta
  onGroupCardView(groupData: GroupCardData): void {
    const group = this.selectedTeacher?.groups.find(
      (g) => g.id === groupData.id
    );
    if (group) {
      this.viewGroupDetail(group);
    }
  }

  onGroupCardClick(groupData: GroupCardData): void {
    this.onGroupCardView(groupData);
  }

  // Método para obtener los estudiantes de un profesor
  getStudentsForTeacher(teacherId: string): User[] {
    const studentIds = new Set<string>();

    // Recopila todos los IDs de estudiantes de todos los grupos del profesor
    mockSubjectsData.subjects.forEach((subject) => {
      subject.groups.forEach((group) => {
        if (group.teacherId === teacherId) {
          group.studentIds.forEach((id) => studentIds.add(id));
        }
      });
    });

    // Obtiene información completa de los estudiantes desde mock-user
    return mockUserData.users.filter(
      (user) => user.role === 'student' && studentIds.has(user.id)
    );
  }

  // Método para obtener estudiantes de un grupo específico
  getStudentsInGroup(groupId: number): User[] {
    let studentIds: string[] = [];

    // Busca el grupo por ID y obtener sus estudiantes
    mockSubjectsData.subjects.forEach((subject) => {
      subject.groups.forEach((group) => {
        if (parseInt(group.id.replace('g', '')) === groupId) {
          studentIds = group.studentIds;
        }
      });
    });

    // Obtiene información completa de los estudiantes
    return mockUserData.users.filter(
      (user) => user.role === 'student' && studentIds.includes(user.id)
    );
  }
}
