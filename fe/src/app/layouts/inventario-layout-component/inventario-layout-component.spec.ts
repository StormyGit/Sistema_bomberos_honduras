import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventarioLayoutComponent } from './inventario-layout-component';

describe('InventarioLayoutComponent', () => {
  let component: InventarioLayoutComponent;
  let fixture: ComponentFixture<InventarioLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventarioLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventarioLayoutComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
