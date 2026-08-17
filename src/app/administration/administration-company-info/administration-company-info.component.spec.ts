import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministrationCompanyInfoComponent } from './administration-company-info.component';

describe('AdministrationCompanyInfoComponent', () => {
  let component: AdministrationCompanyInfoComponent;
  let fixture: ComponentFixture<AdministrationCompanyInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdministrationCompanyInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdministrationCompanyInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
