import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrSalaryComponent } from './hr-salary.component';

describe('HrSalaryComponent', () => {
  let component: HrSalaryComponent;
  let fixture: ComponentFixture<HrSalaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HrSalaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HrSalaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
