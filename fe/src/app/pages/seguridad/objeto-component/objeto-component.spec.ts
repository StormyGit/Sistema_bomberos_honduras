import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjetoComponent } from './objeto-component';

describe('ObjetoComponent', () => {
  let component: ObjetoComponent;
  let fixture: ComponentFixture<ObjetoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ObjetoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ObjetoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
