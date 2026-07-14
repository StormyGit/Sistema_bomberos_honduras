import { TestBed } from '@angular/core/testing';

import { ObjetoServices } from './objeto-services';

describe('ObjetoServices', () => {
  let service: ObjetoServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ObjetoServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
