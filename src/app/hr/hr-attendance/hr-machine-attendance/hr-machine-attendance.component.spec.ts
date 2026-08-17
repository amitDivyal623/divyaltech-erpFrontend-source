import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrMachineAttendanceComponent } from './hr-machine-attendance.component';

describe('HrMachineAttendanceComponent', () => {
  let component: HrMachineAttendanceComponent;
  let fixture: ComponentFixture<HrMachineAttendanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HrMachineAttendanceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HrMachineAttendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
