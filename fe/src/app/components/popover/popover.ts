import { Component, ElementRef, HostListener, Input } from '@angular/core';
import { NgClass } from '@angular/common';

type PopoverPosition = 'top' | 'bottom' | 'left' | 'right';
type PopoverAlign = 'start' | 'center' | 'end';

@Component({
  selector: 'app-popover',
  standalone: true,
  imports: [NgClass],
  templateUrl: './popover.html',
  styleUrl: './popover.css',
})
export class Popover {
  @Input() position: PopoverPosition = 'bottom';
  @Input() align: PopoverAlign = 'end';
  @Input() panelClass = 'w-56';
  @Input() closeOnContentClick = true;

  isOpen = false;

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  close(): void {
    this.isOpen = false;
  }

  onContentClick(): void {
    if (this.closeOnContentClick) {
      this.close();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const clickedInside = this.elementRef.nativeElement.contains(event.target as Node);

    if (!clickedInside) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }

  getPositionClasses(): string {
    const positions: Record<PopoverPosition, string> = {
      top: 'bottom-full mb-2',
      bottom: 'top-full mt-2',
      left: 'right-full mr-2 top-0',
      right: 'left-full ml-2 top-0',
    };

    const aligns: Record<PopoverAlign, string> = {
      start: 'left-0',
      center: 'left-1/2 -translate-x-1/2',
      end: 'right-0',
    };

    if (this.position === 'left' || this.position === 'right') {
      return positions[this.position];
    }

    return `${positions[this.position]} ${aligns[this.align]}`;
  }
}
