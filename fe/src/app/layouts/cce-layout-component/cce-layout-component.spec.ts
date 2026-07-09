import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CceLayoutComponent } from './cce-layout-component';

describe('CceLayoutComponent', () => {
  let component: CceLayoutComponent;
  let fixture: ComponentFixture<CceLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CceLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CceLayoutComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
