import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstacionesCompenent } from './estaciones-compenent';

describe('EstacionesCompenent', () => {
  let component: EstacionesCompenent;
  let fixture: ComponentFixture<EstacionesCompenent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstacionesCompenent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstacionesCompenent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
