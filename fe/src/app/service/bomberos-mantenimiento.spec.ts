import { TestBed } from '@angular/core/testing';

import { BomberosMantenimiento } from './bomberos-mantenimiento';

describe('BomberosMantenimiento', () => {
  let service: BomberosMantenimiento;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BomberosMantenimiento);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
