import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { incidente } from '../../../types/cce/incidente.interface';

@Component({
  selector: 'app-incidente-info-components',
  standalone: true,
  imports: [],
  templateUrl: './incidente-info-components.html',
  styleUrl: './incidente-info-components.css',
})
export class IncidenteInfoComponents implements OnChanges {

  @Input() dataIncidente: incidente | null = null;
  @Input() showImage: boolean = false;
  @Input() showTimer: boolean = false;
  @Input() showRecurso: boolean = false;

  tiempoMision: string = '-';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataIncidente']) {
      this.calcularTiempoMision();
    }
  }

  getNombreTiempo(tipo?: string): string {
    switch (tipo) {
      case 'REPORTE':
        return 'Reporte';

      case 'DESPACHO':
        return 'Despacho';

      case 'SALIDA_ESTACION':
        return 'Salida de estación';

      case 'LLEGADA':
        return 'Llegada';

      case 'CONTROLADO':
        return 'Controlado';

      case 'FINALIZACION':
        return 'Finalización';

      default:
        return tipo ?? '-';
    }
  }

  convertirStringAFecha(fechaString?: string): Date | null {
    if (!fechaString) return null;

    const fechaNormalizada = fechaString.replace(
      /\.(\d{3})\d+/,
      '.$1'
    );

    const fecha = new Date(fechaNormalizada);

    if (isNaN(fecha.getTime())) {
      return null;
    }

    return fecha;
  }

  formatearFechaHora(fechaString?: string): string {
    const fecha = this.convertirStringAFecha(fechaString);

    if (!fecha) return '-';

    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();

    return `${dia}/${mes}/${anio}`;
  }

  formatearHora(fechaString?: string): string {
    const fecha = this.convertirStringAFecha(fechaString);

    if (!fecha) return '-';

    const hora = String(fecha.getHours()).padStart(2, '0');
    const minutos = String(fecha.getMinutes()).padStart(2, '0');
    const segundos = String(fecha.getSeconds()).padStart(2, '0');

    return `${hora}:${minutos}:${segundos}`;
  }

  calcularTiempoMision(): void {
    const tiempos = this.dataIncidente?.tiempos ?? [];

    const inicio = tiempos.find((t: any) => t.tipoTiempo === 'REPORTE');
    const final = tiempos.find((t: any) => t.tipoTiempo === 'FINALIZACION');

    if (!inicio?.horaCreacion || !final?.horaCreacion) {
      this.tiempoMision = '-';
      return;
    }

    const fechaInicio = this.convertirStringAFecha(inicio.horaCreacion);
    const fechaFinal = this.convertirStringAFecha(final.horaCreacion);

    if (!fechaInicio || !fechaFinal) {
      this.tiempoMision = '-';
      return;
    }

    const diferenciaMs = fechaFinal.getTime() - fechaInicio.getTime();

    if (diferenciaMs < 0) {
      this.tiempoMision = '-';
      return;
    }

    this.tiempoMision = this.formatearDuracion(diferenciaMs);
  }

  formatearDuracion(milliseconds: number): string {
    const totalSegundos = Math.floor(milliseconds / 1000);

    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segundos = totalSegundos % 60;

    if (horas > 0) {
      return `${horas} h ${minutos} min ${segundos} seg`;
    }

    if (minutos > 0) {
      return `${minutos} min ${segundos} seg`;
    }

    return `${segundos} seg`;
  }
}
