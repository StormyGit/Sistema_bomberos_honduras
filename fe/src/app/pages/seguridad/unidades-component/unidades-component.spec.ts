import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnidadesComponent } from './unidades-component';

describe('UnidadesComponent', () => {
  let component: UnidadesComponent;
  let fixture: ComponentFixture<UnidadesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnidadesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnidadesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
