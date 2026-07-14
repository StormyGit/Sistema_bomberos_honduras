import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-viewer-component.html',
})
export class ImageViewerComponent {
  @Input({ required: true }) src!: string;
  @Input() downloadUrl?: string;
  @Input() nombre: string = 'imagen';
  @Input() thumbnailClass: string = 'w-full h-48 object-cover';

  showModal = signal(false);

  abrirModal(): void {
    this.showModal.set(true);
  }

  cerrarModal(): void {
    this.showModal.set(false);
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cerrarModal();
    }
  }

  descargar(): void {
    const url = this.downloadUrl ?? this.src;
    const link = document.createElement('a');
    link.href = url;
    link.download = this.nombre;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
