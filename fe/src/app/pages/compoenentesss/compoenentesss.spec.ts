import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Compoenentesss } from './compoenentesss';

describe('Compoenentesss', () => {
  let component: Compoenentesss;
  let fixture: ComponentFixture<Compoenentesss>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Compoenentesss]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Compoenentesss);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
