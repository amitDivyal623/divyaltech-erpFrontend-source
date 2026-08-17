import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorSalaryComponent } from './vendor-salary.component';

describe('VendorSalaryComponent', () => {
  let component: VendorSalaryComponent;
  let fixture: ComponentFixture<VendorSalaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VendorSalaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VendorSalaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
