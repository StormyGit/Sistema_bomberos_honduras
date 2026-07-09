import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapPickerComponent } from './map-picker';

describe('MapPicker', () => {
  let component: MapPickerComponent;
  let fixture: ComponentFixture<MapPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapPickerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapPickerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
