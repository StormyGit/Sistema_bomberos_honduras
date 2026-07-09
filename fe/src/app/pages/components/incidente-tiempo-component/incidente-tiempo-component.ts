import {
  Component,
  inject,
  Input,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  output,
  Output,
  EventEmitter
} from '@angular/core';

import { IncidenteService } from '../../cce/services/incidente-service';
import { TiempoTipo, Tiempo } from './../../../types/cce/incidente.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-incidente-tiempo-component',
  imports: [CommonModule],
  templateUrl: './incidente-tiempo-component.html',
  styleUrl: './incidente-tiempo-component.css',
})
export class IncidenteTiempoComponent implements OnChanges {

  svrIncidente = inject(IncidenteService);
  private cdr = inject(ChangeDetectorRef);

  @Input() tipo: TiempoTipo | null = null;
  @Input() descripcion: string = 'prueba';
  @Input() id_incidente: string | null = null;
  @Input() disable: boolean = false;

  @Output() press = new EventEmitter();
  @Output() tiempoChange = new EventEmitter<{
    tipo: TiempoTipo | null;
    tiempo: Tiempo | null;
  }>();


  hora: string = '';
  bloqueado: boolean = false;

  constructor(){
    this.cargarTiempoExistente();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['id_incidente'] || changes['tipo']) {
      this.cargarTiempoExistente();
    }
  }

  cargarTiempoExistente(): void {
    if (!this.id_incidente) return;
    if (!this.tipo) return;

    this.svrIncidente.getTiempo(this.id_incidente, this.tipo).subscribe({
      next: (res) => {
        if (!res) {
          console.log(res)
          this.aplicarTiempo(null);
          return;
        }

        this.aplicarTiempo(res);
      },
      error: (err) => {
        console.error('Error al obtener tiempo', err);
      }
    });
  }

  setTimer(): void {
    console.log(this.id_incidente, this.tipo)
    if (!this.id_incidente) return;
    if (!this.tipo) return;
    if (this.bloqueado) return;

    this.svrIncidente.addTiempo(this.id_incidente, this.tipo).subscribe({
      next: (res) => {
        this.aplicarTiempo(res);
        this.press.emit();
      },
      error: (err) => {
        console.error('Error al marcar tiempo', err);
      }
    });
  }
  tiempoActual: Tiempo | null = null;
  private aplicarTiempo(tiempo: Tiempo | null): void {
    setTimeout(() => {
      if (!tiempo?.horaCreacion) {
        this.hora = '';
        this.bloqueado = false;
      } else {
        this.tiempoActual = tiempo;
        this.hora = this.convertirFechaAHora(tiempo.horaCreacion);
        this.bloqueado = true;
      }
      this.tiempoChange.emit({
        tipo: this.tipo,
        tiempo: this.tiempoActual
      });
      this.cdr.detectChanges();
    }, 0);
  }

  private convertirFechaAHora(fecha?: string): string {
    if (!fecha) return '';

    return fecha.substring(11, 16);
  }


}
