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
  currentStudents: number;
  classroom: string;
  semester: number;
}

export interface ScheduleSlot {
  day: string;
  startTime: string;
  endTime: string;
  classroom: string;
}
