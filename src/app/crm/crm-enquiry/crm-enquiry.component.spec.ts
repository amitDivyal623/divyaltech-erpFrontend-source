import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrmEnquiryComponent } from './crm-enquiry.component';

describe('CrmEnquiryComponent', () => {
  let component: CrmEnquiryComponent;
  let fixture: ComponentFixture<CrmEnquiryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrmEnquiryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrmEnquiryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
