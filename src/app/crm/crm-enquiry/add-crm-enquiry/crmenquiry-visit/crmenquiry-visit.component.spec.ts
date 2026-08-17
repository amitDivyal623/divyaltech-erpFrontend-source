import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CRMEnquiryVisitComponent } from './crmenquiry-visit.component';

describe('CRMEnquiryVisitComponent', () => {
  let component: CRMEnquiryVisitComponent;
  let fixture: ComponentFixture<CRMEnquiryVisitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CRMEnquiryVisitComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CRMEnquiryVisitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
