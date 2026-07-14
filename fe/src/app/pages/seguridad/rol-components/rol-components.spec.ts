import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolComponents } from './rol-components';

describe('RolComponents', () => {
  let component: RolComponents;
  let fixture: ComponentFixture<RolComponents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolComponents]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RolComponents);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
