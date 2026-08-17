import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportEnquiryComponent } from './report-enquiry.component';

describe('ReportEnquiryComponent', () => {
  let component: ReportEnquiryComponent;
  let fixture: ComponentFixture<ReportEnquiryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportEnquiryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportEnquiryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
