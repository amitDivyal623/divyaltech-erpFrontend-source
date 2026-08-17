import { TestBed } from '@angular/core/testing';

import { LabourService } from './labour.service';

describe('LabourService', () => {
  let service: LabourService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LabourService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
