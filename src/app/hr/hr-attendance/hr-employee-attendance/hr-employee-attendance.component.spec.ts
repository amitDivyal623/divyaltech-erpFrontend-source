import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrEmployeeAttendanceComponent } from './hr-employee-attendance.component';

describe('HrEmployeeAttendanceComponent', () => {
  let component: HrEmployeeAttendanceComponent;
  let fixture: ComponentFixture<HrEmployeeAttendanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HrEmployeeAttendanceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HrEmployeeAttendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
