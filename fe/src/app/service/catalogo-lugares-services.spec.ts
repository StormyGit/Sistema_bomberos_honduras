import { TestBed } from '@angular/core/testing';

import { CatalogoLugaresServices } from './catalogo-lugares-services';

describe('CatalogoLugaresServices', () => {
  let service: CatalogoLugaresServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CatalogoLugaresServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
