import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncidenteTiempoComponent } from './incidente-tiempo-component';

describe('IncidenteTiempoComponent', () => {
  let component: IncidenteTiempoComponent;
  let fixture: ComponentFixture<IncidenteTiempoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncidenteTiempoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncidenteTiempoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
