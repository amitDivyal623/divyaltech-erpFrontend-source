import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabourAttendanceDetailsComponent } from './labour-attendance-details.component';

describe('LabourAttendanceDetailsComponent', () => {
  let component: LabourAttendanceDetailsComponent;
  let fixture: ComponentFixture<LabourAttendanceDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabourAttendanceDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabourAttendanceDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
