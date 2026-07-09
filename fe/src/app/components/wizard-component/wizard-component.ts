import {
  AfterContentInit,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  Output,
  QueryList
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { WizardStepComponent } from '../wizard-step-component/wizard-step-component';

@Component({
  selector: 'app-wizard-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wizard-component.html',
  styleUrl: './wizard-component.css',
})
export class WizardComponent implements AfterContentInit {

  @ContentChildren(WizardStepComponent)
  steps!: QueryList<WizardStepComponent>;

  @Input() showHeader: boolean = true;
  @Input() disableHeader: boolean = false;
  @Input() showButtons: boolean = true;
  @Input() finishText: string = 'Finalizar';

  @Output() finished = new EventEmitter<void>();
  @Output() stepChange = new EventEmitter<number>();

  currentIndex: number = 0;
  stepsArray: WizardStepComponent[] = [];

  ngAfterContentInit(): void {
    this.stepsArray = this.steps.toArray();

    this.steps.changes.subscribe(() => {
      this.stepsArray = this.steps.toArray();

      if (this.currentIndex >= this.stepsArray.length) {
        this.currentIndex = Math.max(this.stepsArray.length - 1, 0);
      }
    });
  }

  next(): void {
    if (this.isLastStep()) {
      this.finished.emit();
      return;
    }

    this.setActiveStep(this.currentIndex + 1);
  }

  previous(): void {
    this.setActiveStep(this.currentIndex - 1);
  }

  goToStep(index: number): void {
    if (this.disableHeader) return;
    this.setActiveStep(index);
  }

  isFirstStep(): boolean {
    return this.currentIndex === 0;
  }

  isLastStep(): boolean {
    return this.currentIndex === this.stepsArray.length - 1;
  }

  private stepTimer: any = null;

  setActiveStep(index: number): void {
    if (this.stepTimer) {
      clearTimeout(this.stepTimer);
    }

    this.stepTimer = setTimeout(() => {
      this.applyActiveStep(index);
    }, 0);
  }

  private applyActiveStep(index: number): void {
    if (!this.stepsArray.length) return;

    if (index < 0) {
      index = 0;
    }

    if (index >= this.stepsArray.length) {
      index = this.stepsArray.length - 1;
    }

    this.currentIndex = index;
    this.stepChange.emit(index);
  }

  ngOnDestroy(): void {
    if (this.stepTimer) {
      clearTimeout(this.stepTimer);
      this.stepTimer = null;
    }

    this.stepTimer?.unsubscribe();
  }
}
