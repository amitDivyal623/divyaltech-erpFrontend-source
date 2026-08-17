import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCrmEnquiryComponent } from './crm-enquiry-details.component'

describe('AddCrmEnquiryComponent', () => {
  let component: AddCrmEnquiryComponent;
  let fixture: ComponentFixture<AddCrmEnquiryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddCrmEnquiryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCrmEnquiryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
