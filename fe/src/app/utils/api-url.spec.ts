import { TestBed } from '@angular/core/testing';

import { ApiUrl } from './api-url';

describe('ApiUrl', () => {
  let service: ApiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiUrl);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
