import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalaryProcessComponent } from './salary-process.component';

describe('SalaryProcessComponent', () => {
  let component: SalaryProcessComponent;
  let fixture: ComponentFixture<SalaryProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SalaryProcessComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SalaryProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
