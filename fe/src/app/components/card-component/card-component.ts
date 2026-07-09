import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card-component',
  imports: [],
  templateUrl: './card-component.html',
  styleUrl: './card-component.css',
})
export class CardComponent {
  @Input() titulo: string = ' - ';
  @Input() Showtitulo: boolean = true;
  @Input() padding_x: number = 8;
}
