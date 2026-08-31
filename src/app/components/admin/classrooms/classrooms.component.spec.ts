import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import ClassroomsComponent from './classrooms.component';
import { ClassroomService } from '../../../services/classroom.service';
import mockClassroomsData from '../../../data/mock-classrooms.json';

describe('ClassroomsComponent', () => {
  let component: ClassroomsComponent;
  let fixture: ComponentFixture<ClassroomsComponent>;
  let mockClassroomService: jasmine.SpyObj<ClassroomService>;

  beforeEach(async () => {
    mockClassroomService = jasmine.createSpyObj('ClassroomService', [
      'getAllClassrooms',
      'deleteClassroom',
    ]);

    await TestBed.configureTestingModule({
      imports: [ClassroomsComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        { provide: ClassroomService, useValue: mockClassroomService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ClassroomsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load classrooms from local mock data on init', () => {
    const expected = mockClassroomsData.classrooms.map((classroom) => ({
      ...classroom,
      schedule: [],
    }));

    expect(component.classrooms).toEqual(expected);
    expect(component.classrooms.length).toBe(
      mockClassroomsData.classrooms.length,
    );
  });

  it('should select classroom', () => {
    const classroom = {
      id: '1',
      name: 'Aula 101',
      code: 'A101',
      building: 'Edificio A',
      floor: 1,
      capacity: 30,
      resources: ['Proyector'],
      schedule: [],
      isAvailable: true,
    };

    component.selectClassroom(classroom);
    expect(component.selectedClassroom).toEqual(classroom);
  });
});
