/**
 * Contrato de GET /api/teachers/me/schedule (TeacherScheduleDTO del backend).
 * Los ids solo sirven para `track`; nunca se muestran en la interfaz.
 */
export interface TeacherScheduleEntry {
  classHourId: string;
  /** Nombre del día en minúsculas, tal como está en day_of_week ("lunes", "miércoles"…). */
  dayName: string;
  /** Hora en formato "HH:mm:ss". */
  startTime: string;
  endTime: string;
  groupId: string;
  groupName: string | null;
  groupCapacity: number | null;
  subjectCode: string | null;
  subjectName: string | null;
  subjectCredits: number | null;
  classroomNumber: string | null;
  building: string | null;
}

export interface TeacherScheduleResponse {
  teacherId: string;
  teacherName: string | null;
  department: string | null;
  entries: TeacherScheduleEntry[];
}
