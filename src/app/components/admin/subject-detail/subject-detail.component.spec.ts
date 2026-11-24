import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import SubjectDetailComponent from './subject-detail.component';

describe('SubjectDetailComponent', () => {
  let component: SubjectDetailComponent;
  let fixture: ComponentFixture<SubjectDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubjectDetailComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SubjectDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    
  });
});
