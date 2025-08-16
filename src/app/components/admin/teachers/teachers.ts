import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Teacher {
  id: number;
  name: string;
  universityCareer: string;
  office: string;
  email: string;
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
  imports: [CommonModule],
  templateUrl: './teachers.html',
  styleUrl: './teachers.css'
})
export class Teachers {
  selectedTeacher: Teacher | null = null;
  showGroups = false;

  // Datos de ejemplo para los profesores
  teachers: Teacher[] = [
    {
      id: 1,
      name: 'Dr. María González',
      universityCareer: 'Ingeniería de Sistemas',
      office: 'Oficina 301 - Bloque 15',
      email: 'maria.gonzalez@uis.edu.co',
      groups: [
        { id: 1, name: 'Grupo A', subject: 'Programación Orientada a Objetos', schedule: 'Lunes 8:00-10:00, Miércoles 8:00-10:00', studentCount: 25, classroom: 'Aula 101' },
        { id: 2, name: 'Grupo B', subject: 'Estructuras de Datos', schedule: 'Martes 10:00-12:00, Jueves 10:00-12:00', studentCount: 20, classroom: 'Aula 102' }
      ]
    },
    {
      id: 2,
      name: 'Prof. Carlos Rodríguez',
      universityCareer: 'Ingeniería de Sistemas',
      office: 'Oficina 205 - Bloque 12',
      email: 'carlos.rodriguez@uis.edu.co',
      groups: [
        { id: 3, name: 'Grupo C', subject: 'Bases de Datos', schedule: 'Viernes 14:00-16:00', studentCount: 30, classroom: 'Aula 103' },
        { id: 4, name: 'Grupo D', subject: 'Ingeniería de Software', schedule: 'Lunes 14:00-16:00, Miércoles 14:00-16:00', studentCount: 18, classroom: 'Aula 104' }
      ]
    },
    {
      id: 3,
      name: 'Dra. Ana Martínez',
      universityCareer: 'Ingeniería de Sistemas',
      office: 'Oficina 408 - Bloque 18',
      email: 'ana.martinez@uis.edu.co',
      groups: [
        { id: 5, name: 'Grupo E', subject: 'Redes de Computadores', schedule: 'Martes 14:00-16:00, Jueves 14:00-16:00', studentCount: 22, classroom: 'Aula 105' },
        { id: 6, name: 'Grupo F', subject: 'Sistemas Operativos', schedule: 'Viernes 8:00-10:00', studentCount: 28, classroom: 'Aula 106' }
      ]
    },
    {
      id: 4,
      name: 'Prof. Luis Pérez',
      universityCareer: 'Ingeniería de Sistemas',
      office: 'Oficina 112 - Bloque 10',
      email: 'luis.perez@uis.edu.co',
      groups: [
        { id: 7, name: 'Grupo G', subject: 'Inteligencia Artificial', schedule: 'Lunes 10:00-12:00, Miércoles 10:00-12:00', studentCount: 24, classroom: 'Aula 107' },
        { id: 8, name: 'Grupo H', subject: 'Desarrollo Web', schedule: 'Martes 8:00-10:00, Jueves 8:00-10:00', studentCount: 26, classroom: 'Aula 108' }
      ]
    }
  ];

  selectTeacher(teacher: Teacher) {
    this.selectedTeacher = teacher;
    this.showGroups = true;
  }

  backToTeachers() {
    this.selectedTeacher = null;
    this.showGroups = false;
  }

  getTotalStudents(teacher: Teacher): number {
    return teacher.groups.reduce((total, group) => total + group.studentCount, 0);
  }
}
