import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncidentesTiposComponent } from './incidentes-tipos-component';

describe('IncidentesTiposComponent', () => {
  let component: IncidentesTiposComponent;
  let fixture: ComponentFixture<IncidentesTiposComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncidentesTiposComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncidentesTiposComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
