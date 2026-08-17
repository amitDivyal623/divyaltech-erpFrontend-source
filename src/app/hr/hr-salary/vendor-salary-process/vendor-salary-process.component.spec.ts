import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorSalaryProcessComponent } from './vendor-salary-process.component';

describe('VendorSalaryProcessComponent', () => {
  let component: VendorSalaryProcessComponent;
  let fixture: ComponentFixture<VendorSalaryProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VendorSalaryProcessComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VendorSalaryProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
