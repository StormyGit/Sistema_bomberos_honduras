import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeguridadLayoutComponent } from './seguridad-layout-component';

describe('SeguridadLayoutComponent', () => {
  let component: SeguridadLayoutComponent;
  let fixture: ComponentFixture<SeguridadLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeguridadLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeguridadLayoutComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
