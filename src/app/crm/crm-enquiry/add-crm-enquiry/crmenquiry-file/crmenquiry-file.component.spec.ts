import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CRMEnquiryFileComponent } from './crmenquiry-file.component';

describe('CRMEnquiryFileComponent', () => {
  let component: CRMEnquiryFileComponent;
  let fixture: ComponentFixture<CRMEnquiryFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CRMEnquiryFileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CRMEnquiryFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
