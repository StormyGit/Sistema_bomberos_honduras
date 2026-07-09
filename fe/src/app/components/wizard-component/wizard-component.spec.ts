import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WizardComponent } from './wizard-component';

describe('WizardComponent', () => {
  let component: WizardComponent;
  let fixture: ComponentFixture<WizardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WizardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WizardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
