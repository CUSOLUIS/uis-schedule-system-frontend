export interface Subject {
  id: string;
  name: string;
  code: string;
  description: string;
  credits: number;
  semester: number;
  groups: Group[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Group {
  id: string;
  subjectId: string;
  groupNumber: string;
  schedule: ScheduleSlot[];
  teacherId: string;
  teacherName: string;
  studentIds: string[];
  maxStudents: number;
  currentStudents?: number; // Opcional: se calcula desde studentIds.length
  classroom: string;
  semester: number;
}

export interface ScheduleSlot {
  day: string;
  startTime: string;
  endTime: string;
  classroom: string;
  classroomId?: string;
}

// Función helper para calcular estudiantes actuales
export function getCurrentStudents(group: Group): number {
  return group.studentIds.length;
}

// Función helper para verificar si un grupo está lleno
export function isGroupFull(group: Group): boolean {
  return getCurrentStudents(group) >= group.maxStudents;
}
