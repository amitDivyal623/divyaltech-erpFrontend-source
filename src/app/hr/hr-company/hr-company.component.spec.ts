import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrCompanyComponent } from './hr-company.component';

describe('HrCompanyComponent', () => {
  let component: HrCompanyComponent;
  let fixture: ComponentFixture<HrCompanyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HrCompanyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HrCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
