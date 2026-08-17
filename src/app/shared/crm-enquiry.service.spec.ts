import { TestBed } from '@angular/core/testing';

import { CrmEnquiryService } from './crm-enquiry.service';

describe('CrmEnquiryService', () => {
  let service: CrmEnquiryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CrmEnquiryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
