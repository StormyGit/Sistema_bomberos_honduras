import {
  AfterViewChecked,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { incidente } from '../../../types/cce/incidente.interface';
import { CardComponent } from "../../../components/card-component/card-component";
import { ImageViewerComponent } from "../../../components/image-viewer-component/image-viewer-component";
import { BadgeComponent } from "../../../components/badge-component/badge-component";

interface PuntoIncidente {
  crs?: string;
  type?: string;
  cordenadas: {
    lat: number;
    lng: number;
  };
}

@Component({
  selector: 'app-incidente-info-components',
  standalone: true,
  imports: [CommonModule, CardComponent, ImageViewerComponent, BadgeComponent],
  templateUrl: './incidente-info-components.html',
  styleUrl: './incidente-info-components.css',
})
export class IncidenteInfoComponents implements OnChanges, AfterViewChecked, OnDestroy {

  @Input() dataIncidente: incidente | null = null;
  @Input() showImage: boolean = false;
  @Input() showTimer: boolean = false;
  @Input() showRecurso: boolean = false;
  @Input() showMap: boolean = false;
  @Input() alturaMapa: string = '300px';

  @ViewChild('incidenteMapContainer') mapContainer?: ElementRef<HTMLDivElement>;

  tiempoMision: string = '-';

  private map?: L.Map;
  private marker?: L.CircleMarker;
  private puntoActual: PuntoIncidente | null = null;
  private mapaInicializado = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataIncidente']) {
      this.calcularTiempoMision();
      this.puntoActual = this.parsearPoint(this.dataIncidente?.point);
      this.actualizarMapa();
    }
  }

  /**
   * Como el mapa está dentro de un @if del template, el ViewChild
   * no existe hasta que Angular lo renderiza. AfterViewChecked
   * nos permite detectar cuándo ya está disponible en el DOM.
   */
  ngAfterViewChecked(): void {
    if (!this.mapaInicializado && this.showMap && this.mapContainer) {
      this.mapaInicializado = true;
      this.initMap();
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }
  }

  // ===================== MAPA =====================

  private parsearPoint(raw: any): PuntoIncidente | null {
    if (!raw) return null;

    try {
      const data = typeof raw === 'string' ? JSON.parse(raw) : raw;

      const lat = Number(data?.cordenadas?.lat);
      const lng = Number(data?.cordenadas?.lng);

      if (Number.isNaN(lat) || Number.isNaN(lng)) {
        return null;
      }

      return {
        crs: data.crs,
        type: data.type,
        cordenadas: { lat, lng }
      };
    } catch (error) {
      console.error('Point inválido en incidente:', raw, error);
      return null;
    }
  }

  private initMap(): void {
    if (!this.mapContainer || this.map) return;

    const centro: [number, number] = this.puntoActual
      ? [this.puntoActual.cordenadas.lat, this.puntoActual.cordenadas.lng]
      : [14.0723, -87.1921]; // Tegucigalpa por defecto si no hay punto

    this.map = L.map(this.mapContainer.nativeElement, {
      center: centro,
      zoom: 15,
      zoomControl: true,
      preferCanvas: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    if (this.puntoActual) {
      this.pintarMarcador(this.puntoActual);
    }

    // Por si el contenedor tenía tamaño 0 al montar (dentro de tabs, modales, etc.)
    setTimeout(() => this.map?.invalidateSize(), 0);
    setTimeout(() => this.map?.invalidateSize(), 200);
  }

  private actualizarMapa(): void {
    if (!this.map) return;

    if (this.puntoActual) {
      this.pintarMarcador(this.puntoActual);
      this.map.setView(
        [this.puntoActual.cordenadas.lat, this.puntoActual.cordenadas.lng],
        this.map.getZoom() ?? 15
      );
    } else if (this.marker) {
      this.map.removeLayer(this.marker);
      this.marker = undefined;
    }
  }

  private pintarMarcador(punto: PuntoIncidente): void {
    if (!this.map) return;

    const { lat, lng } = punto.cordenadas;

    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
    } else {
      this.marker = L.circleMarker([lat, lng], {
        radius: 10,
        color: '#dc2626',
        fillColor: '#ef4444',
        fillOpacity: 0.9,
        weight: 2
      }).addTo(this.map);
    }

    this.marker.bindPopup(`
      <div style="min-width: 160px">
        <strong>Ubicación del incidente</strong><br>
        <span>Latitud: ${lat}</span><br>
        <span>Longitud: ${lng}</span>
      </div>
    `);
  }

  // ===================== TIEMPOS (igual que antes) =====================

  getNombreTiempo(tipo?: string): string {
    switch (tipo) {
      case 'REPORTE': return 'Reporte';
      case 'DESPACHO': return 'Despacho';
      case 'SALIDA_ESTACION': return 'Salida de estación';
      case 'LLEGADA': return 'Llegada';
      case 'CONTROLADO': return 'Controlado';
      case 'FINALIZACION': return 'Finalización';
      default: return tipo ?? '-';
    }
  }

  convertirStringAFecha(fechaString?: string): Date | null {
    if (!fechaString) return null;
    const fechaNormalizada = fechaString.replace(/\.(\d{3})\d+/, '.$1');
    const fecha = new Date(fechaNormalizada);
    return isNaN(fecha.getTime()) ? null : fecha;
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

    if (horas > 0) return `${horas} h ${minutos} min ${segundos} seg`;
    if (minutos > 0) return `${minutos} min ${segundos} seg`;
    return `${segundos} seg`;
  }
}
