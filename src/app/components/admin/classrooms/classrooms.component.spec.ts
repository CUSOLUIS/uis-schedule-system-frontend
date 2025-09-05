import { ComponentFixture, TestBed } from '@angular/core/testing';
import ClassroomsComponent from './classrooms.component';
import { ClassroomService } from '../../../services/classroom.service';
import { of } from 'rxjs';

describe('ClassroomsComponent', () => {
  let component: ClassroomsComponent;
  let fixture: ComponentFixture<ClassroomsComponent>;
  let mockClassroomService: jasmine.SpyObj<ClassroomService>;

  beforeEach(async () => {
    mockClassroomService = jasmine.createSpyObj('ClassroomService', [
      'getAllClassrooms',
    ]);
    mockClassroomService.getAllClassrooms.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [ClassroomsComponent],
      providers: [
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

  it('should load classrooms on init', () => {
    const mockClassrooms = [
      {
        id: '1',
        name: 'Aula 101',
        code: 'A101',
        building: 'Edificio A',
        floor: 1,
        capacity: 30,
        resources: ['Proyector'],
        schedule: [],
        isAvailable: true,
      },
    ];

    mockClassroomService.getAllClassrooms.and.returnValue(of(mockClassrooms));
    component.ngOnInit();
    expect(component.classrooms).toEqual(mockClassrooms);
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
