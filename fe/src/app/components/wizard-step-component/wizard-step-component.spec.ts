import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WizardStepComponent } from './wizard-step-component';

describe('WizardStepComponent', () => {
  let component: WizardStepComponent;
  let fixture: ComponentFixture<WizardStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WizardStepComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WizardStepComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
