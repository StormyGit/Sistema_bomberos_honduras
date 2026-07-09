import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal-component',
  imports: [],
  templateUrl: './modal-component.html',
  styleUrl: './modal-component.css',
})
export class ModalComponent {

  @Input() show: boolean = false;
  @Input() titulo: string = 'Modal';
  @Input() width: string = '500px';
  @Input() height: string = '500px';

  @Input() showHeader: boolean = true;
  @Input() showCloseButton: boolean = true;
  @Input() closeOnBackdrop: boolean = true;

  @Output() closed = new EventEmitter<void>();

  fullscreen: boolean = false;

  closeModal() {
    this.closed.emit();
  }

  clickBackdrop() {
    if (this.closeOnBackdrop) {
      this.closeModal();
    }
  }

  stopPropagation(event: MouseEvent) {
    event.stopPropagation();
  }
}
