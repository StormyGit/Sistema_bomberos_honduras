import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncidenteInfoComponents } from './incidente-info-components';

describe('IncidenteInfoComponents', () => {
  let component: IncidenteInfoComponents;
  let fixture: ComponentFixture<IncidenteInfoComponents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncidenteInfoComponents]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncidenteInfoComponents);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
