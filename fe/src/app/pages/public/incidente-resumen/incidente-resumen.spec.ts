import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncidenteResumen } from './incidente-resumen';

describe('IncidenteResumen', () => {
  let component: IncidenteResumen;
  let fixture: ComponentFixture<IncidenteResumen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncidenteResumen]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncidenteResumen);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
