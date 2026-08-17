import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrVendorAttendanceComponent } from './hr-vendor-attendance.component';

describe('HrVendorAttendanceComponent', () => {
  let component: HrVendorAttendanceComponent;
  let fixture: ComponentFixture<HrVendorAttendanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HrVendorAttendanceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HrVendorAttendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
