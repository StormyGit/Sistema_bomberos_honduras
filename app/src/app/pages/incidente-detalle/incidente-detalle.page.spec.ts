import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IncidenteDetallePage } from './incidente-detalle.page';

describe('IncidenteDetallePage', () => {
  let component: IncidenteDetallePage;
  let fixture: ComponentFixture<IncidenteDetallePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(IncidenteDetallePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
