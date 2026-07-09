import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncidenteCreateComponent } from './incidente-create-component';

describe('IncidenteCreateComponent', () => {
  let component: IncidenteCreateComponent;
  let fixture: ComponentFixture<IncidenteCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncidenteCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncidenteCreateComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
