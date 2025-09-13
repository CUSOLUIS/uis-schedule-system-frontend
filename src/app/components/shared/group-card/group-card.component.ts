import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface GroupCardData {
  id: number;
  name: string;
  subject: string;
  schedule: string;
  studentCount: number;
  classroom: string;
  groupNumber?: string;
  teacherName?: string;
  maxStudents?: number;
}

export interface GroupCardConfig {
  showTeacher?: boolean;
  showSubject?: boolean;
  showMaxStudents?: boolean;
  showViewButton?: boolean;
  showEditButton?: boolean;
  showDeleteButton?: boolean;
  compactMode?: boolean;
}

@Component({
  selector: 'app-group-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './group-card.component.html',
  styleUrl: './group-card.component.css'
})
export class GroupCardComponent {
  @Input() group!: GroupCardData;
  @Input() config: GroupCardConfig = {
    showTeacher: true,
    showSubject: true,
    showMaxStudents: false,
    showViewButton: true,
    showEditButton: false,
    showDeleteButton: false,
    compactMode: false
  };

  @Output() onView = new EventEmitter<GroupCardData>();
  @Output() onEdit = new EventEmitter<GroupCardData>();
  @Output() onDelete = new EventEmitter<GroupCardData>();
  @Output() onCardClick = new EventEmitter<GroupCardData>();

  onViewClick(event: Event): void {
    event.stopPropagation();
    this.onView.emit(this.group);
  }

  onEditClick(event: Event): void {
    event.stopPropagation();
    this.onEdit.emit(this.group);
  }

  onDeleteClick(event: Event): void {
    event.stopPropagation();
    this.onDelete.emit(this.group);
  }

  onCardClicked(): void {
    this.onCardClick.emit(this.group);
  }

  getStudentText(): string {
    if (this.config.showMaxStudents && this.group.maxStudents) {
      return `${this.group.studentCount}/${this.group.maxStudents} estudiantes`;
    }
    return `${this.group.studentCount} estudiantes`;
  }

  hasActions(): boolean {
    return !!(this.config.showViewButton || this.config.showEditButton || this.config.showDeleteButton);
  }
}
