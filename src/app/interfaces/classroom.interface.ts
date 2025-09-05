export interface Classroom {
  id: string;
  name: string;
  code: string;
  building: string;
  floor: number;
  capacity: number;
  resources: string[];
  isAvailable: boolean;
  schedule: ClassroomSchedule[];
}

export interface ClassroomSchedule {
  day: string;
  startTime: string;
  endTime: string;
  subjectId?: string;
  subjectName?: string;
  teacherId?: string;
  teacherName?: string;
  groupId?: string;
}
