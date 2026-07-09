import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncidenteComponent } from './incidente-component';

describe('IncidenteComponent', () => {
  let component: IncidenteComponent;
  let fixture: ComponentFixture<IncidenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncidenteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncidenteComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
