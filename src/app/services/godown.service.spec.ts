import { TestBed } from '@angular/core/testing';

import { GodownService } from './godown.service';

describe('GodownService', () => {
  let service: GodownService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GodownService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
