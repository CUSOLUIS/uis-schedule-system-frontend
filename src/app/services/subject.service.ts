import { Injectable, signal } from '@angular/core';
import { Subject, Group } from '../interfaces/subject.interface';
import mockSubjects from '../data/mock-subjects.json';

@Injectable({
  providedIn: 'root',
})
export class SubjectService {
  private subjects = signal<Subject[]>(mockSubjects.subjects);

  getAllSubjects() {
    return this.subjects.asReadonly();
  }

  getSubjectById(id: string): Subject | undefined {
    return this.subjects().find((subject) => subject.id === id);
  }

  getSubjectsByTeacher(teacherId: string): Subject[] {
    return this.subjects().filter((subject) =>
      subject.groups.some((group) => group.teacherId === teacherId)
    );
  }

  getSubjectsByStudent(studentId: string): Subject[] {
    return this.subjects().filter((subject) =>
      subject.groups.some((group) => group.studentIds.includes(studentId))
    );
  }

  getGroupById(groupId: string): Group | undefined {
    for (const subject of this.subjects()) {
      const group = subject.groups.find((g) => g.id === groupId);
      if (group) return group;
    }
    return undefined;
  }

  getGroupsBySubject(subjectId: string): Group[] {
    const subject = this.getSubjectById(subjectId);
    return subject?.groups || [];
  }

  createSubject(subject: Omit<Subject, 'id'>): void {
    const newSubject: Subject = {
      ...subject,
      id: Date.now().toString(),
      groups: [],
    };
    this.subjects.update((subjects) => [...subjects, newSubject]);
  }

  updateSubject(id: string, updates: Partial<Subject>): void {
    this.subjects.update((subjects) =>
      subjects.map((subject) =>
        subject.id === id ? { ...subject, ...updates } : subject
      )
    );
  }

  deleteSubject(id: string): void {
    this.subjects.update((subjects) =>
      subjects.filter((subject) => subject.id !== id)
    );
  }

  createGroup(subjectId: string, group: Omit<Group, 'id' | 'subjectId'>): void {
    const newGroup: Group = {
      ...group,
      id: Date.now().toString(),
      subjectId,
    };

    this.subjects.update((subjects) =>
      subjects.map((subject) =>
        subject.id === subjectId
          ? { ...subject, groups: [...subject.groups, newGroup] }
          : subject
      )
    );
  }

  updateGroup(groupId: string, updates: Partial<Group>): void {
    this.subjects.update((subjects) =>
      subjects.map((subject) => ({
        ...subject,
        groups: subject.groups.map((group) =>
          group.id === groupId ? { ...group, ...updates } : group
        ),
      }))
    );
  }

  deleteGroup(groupId: string): void {
    this.subjects.update((subjects) =>
      subjects.map((subject) => ({
        ...subject,
        groups: subject.groups.filter((group) => group.id !== groupId),
      }))
    );
  }

  enrollStudentInGroup(groupId: string, studentId: string): void {
    this.subjects.update((subjects) =>
      subjects.map((subject) => ({
        ...subject,
        groups: subject.groups.map((group) =>
          group.id === groupId && !group.studentIds.includes(studentId)
            ? {
                ...group,
                studentIds: [...group.studentIds, studentId],
                currentStudents: group.currentStudents + 1,
              }
            : group
        ),
      }))
    );
  }

  unenrollStudentFromGroup(groupId: string, studentId: string): void {
    this.subjects.update((subjects) =>
      subjects.map((subject) => ({
        ...subject,
        groups: subject.groups.map((group) =>
          group.id === groupId
            ? {
                ...group,
                studentIds: group.studentIds.filter((id) => id !== studentId),
                currentStudents: Math.max(0, group.currentStudents - 1),
              }
            : group
        ),
      }))
    );
  }
}
