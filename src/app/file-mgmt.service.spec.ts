import { TestBed } from '@angular/core/testing';

import { FileMgmtService } from './file-mgmt.service';

describe('FileMgmtService', () => {
  let service: FileMgmtService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileMgmtService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
