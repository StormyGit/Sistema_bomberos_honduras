import { Component, Input, TemplateRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-wizard-step',
  standalone: true,
  imports: [],
  templateUrl: './wizard-step-component.html',
  styleUrl: './wizard-step-component.css',
})
export class WizardStepComponent {
  @Input() titulo: string = '';
  @Input() descripcion: string = '';

  @ViewChild('stepContent', { static: true })
  content!: TemplateRef<unknown>;
}
