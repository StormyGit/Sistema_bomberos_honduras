import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  Output,
  ViewChild
} from '@angular/core';

import * as L from 'leaflet';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// AJUSTA ESTOS PATHS a la ubicación real en tu proyecto
import { CatalogoLugaresServices } from '../../service/catalogo-lugares-services';

export interface MapPoint {
  lat: number;
  lng: number;
}

export interface EstacionPunto {
  crs: string;
  type: string;
  cordenadas: MapPoint;
}

export interface Estacion {
  id: string;
  nombre: string;
  central: boolean;
  departamento?: string;
  municipio?: string;
  departamentoId?: string;
  municipioId?: string;
  point: EstacionPunto | null;
}

export interface EstacionCercana {
  estacion: Estacion;
  distanceMeters: number;
  distanceKm: number;
}

export enum pointsMaps {
  estaciones, hidrantes
}

@Component({
  selector: 'app-map-picker',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './map-picker.html',
  styleUrl: './map-picker.css',
})
export class MapPickerComponent implements AfterViewInit, OnDestroy {

  @ViewChild('mapContainer', { static: true })
  mapContainer!: ElementRef<HTMLDivElement>;

  CRS: string = 'WGS84';
  @Input() height: string = '350px';

  @Input() center: MapPoint = {
    lat: 14.0723,
    lng: -87.1921
  };

  @Input() zoom: number = 13;
  @Input() setPoint: boolean = false;

  /** Cantidad de estaciones cercanas a devolver/pintar cuando se coloca un punto (parametrizable) */
  @Input() cantidadEstacionesCercanas: number = 5;

  @Output() pointSelected = new EventEmitter<EstacionPunto>();

  /** Emite la lista ORDENADA (más cercana primero) cada vez que se coloca un punto */
  @Output() estacionesCercanas = new EventEmitter<EstacionCercana[]>();

  private _pointDefault: EstacionPunto | null = null;

  @Input()
  set pointDefault(value: any) {
    this._pointDefault = this.normalizarPunto(value);
    this.aplicarPuntoDefault();
  }

  get pointDefault() {
    return this._pointDefault;
  }

  private svrCatalogoLugares = inject(CatalogoLugaresServices);

  /** Estaciones ya filtradas (con coordenadas válidas) */
  private listEstaciones: Estacion[] = [];

  private map?: L.Map;
  private resizeObserver?: ResizeObserver;
  private refreshTimers: number[] = [];

  private pointsLayer = L.layerGroup();
  private selectedPointLayer = L.layerGroup();
  private nearestStationLayer = L.layerGroup();
  private nearestStationLineLayer = L.layerGroup();

  private handleMapClickFindNearest = (event: L.LeafletMouseEvent): void => {
    this.showSelectedPointAndNearestStation(
      event.latlng.lat,
      event.latlng.lng
    );
  };

  private handleMapClickOnlyPoint = (event: L.LeafletMouseEvent): void => {
    if (this.setPoint) {
      this.showOnlySelectedPoint(
        event.latlng.lat,
        event.latlng.lng
      );
    }
  };

  ngAfterViewInit(): void {
    this.initMap();
    this.observeResize();
    this.cargarEstaciones();

    setTimeout(() => {
      this.aplicarPuntoDefault();
    }, 0);
  }

  private initMap(): void {
    if (this.map) return;

    this.map = L.map(this.mapContainer.nativeElement, {
      center: [this.center.lat, this.center.lng],
      zoom: this.zoom,
      zoomControl: true,
      preferCanvas: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.pointsLayer.addTo(this.map);
    this.ensureNearestStationLayers();

    this.map.whenReady(() => {
      this.refreshMap();
    });

    this.enableOnlyPointOnClick();
    //this.enableFindNearestStationOnClick();
  }

  /**
   * Trae TODAS las estaciones desde la API.
   * departamentoId = null y isCentral = null => sin filtros, trae todo.
   */
  private cargarEstaciones(): void {
    this.svrCatalogoLugares.obtenerEstacionesPorDepartamento(null, null)
      .subscribe({
        next: (estaciones) => {
          this.listEstaciones = (estaciones ?? [])
            .map(e => this.normalizarEstacion(e))
            .filter(e => this.tieneCoordenadasValidas(e));
          this.renderEstaciones();
          this.refreshMap();
        },
        error: (err) => {
          console.error('Error al cargar estaciones desde la API:', err);
        }
      });
  }

  /**
   * La API devuelve `point` como STRING JSON (o null). Aquí se parsea
   * una sola vez a objeto, así el resto del componente puede seguir
   * usando estacion.point.cordenadas.lat/lng sin preocuparse por el formato.
   */
  private normalizarEstacion(estacion: any): Estacion {
    let point: EstacionPunto | null = null;

    const rawPoint = estacion?.point;

    if (rawPoint) {
      try {
        point = typeof rawPoint === 'string' ? JSON.parse(rawPoint) : rawPoint;
      } catch (error) {
        console.error(`Point inválido para la estación "${estacion?.nombre}":`, rawPoint, error);
        point = null;
      }
    }

    return {
      ...estacion,
      point
    };
  }

  private tieneCoordenadasValidas(estacion: Estacion): boolean {
    const p = estacion?.point;
    return !!p
      && !!p.cordenadas
      && !Number.isNaN(Number(p.cordenadas.lat))
      && !Number.isNaN(Number(p.cordenadas.lng));
  }

  public refreshMap(): void {
    const delays = [0, 100, 300, 600];

    delays.forEach(delay => {
      const timer = window.setTimeout(() => {
        this.map?.invalidateSize();
      }, delay);

      this.refreshTimers.push(timer);
    });
  }

  private observeResize(): void {
    if (typeof ResizeObserver === 'undefined') return;

    this.resizeObserver = new ResizeObserver(() => {
      this.refreshMap();
    });

    this.resizeObserver.observe(this.mapContainer.nativeElement);
  }

  ngOnDestroy(): void {
    this.refreshTimers.forEach(timer => clearTimeout(timer));
    this.refreshTimers = [];

    this.resizeObserver?.disconnect();

    if (this.map) {
      this.map.off();
      this.map.remove();
      this.map = undefined;
    }
  }

  // ===================== PINTAR ESTACIONES =====================

  private renderEstaciones(): void {
    if (!this.map) return;

    this.pointsLayer.clearLayers();

    this.listEstaciones.forEach(est => {
      const p = est.point!;
      this.addPoint(est, Number(p.cordenadas.lat), Number(p.cordenadas.lng));
    });
  }

  private addPoint(estacion: Estacion, lat: number, lng: number): void {
    if (!this.map) return;

    const esCentral = estacion.central === true;

    const marker = L.circleMarker([lat, lng], {
      radius: esCentral ? 11 : 7,
      color: esCentral ? '#b91c1c' : '#2563eb',
      fillColor: esCentral ? '#ef4444' : '#3b82f6',
      fillOpacity: 0.9,
      weight: 2
    });

    marker.bindPopup(
      this.getPointPopup(estacion.nombre, esCentral ? 'Estación central' : '', lat, lng)
    );

    marker.addTo(this.pointsLayer);
  }

  private getPointPopup(title: string, subtitle: string, lat: number, lng: number): string {
    const _title = this.escapeHtml(title ?? 'Punto');
    const _subtitle = this.escapeHtml(subtitle ?? '');

    return `
      <div style="min-width: 160px">
        <strong>${_title}</strong><br>
        ${_subtitle ? `<span>${_subtitle}</span><br>` : ''}
        <span>Latitud: ${lat}</span><br>
        <span>Longitud: ${lng}</span>
      </div>
    `;
  }

  private escapeHtml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  // ===================== MODO: BUSCAR ESTACIÓN MÁS CERCANA (dibuja línea) =====================

  public enableFindNearestStationOnClick(): void {
    if (!this.map) return;

    this.ensureNearestStationLayers();

    this.map.off('click', this.handleMapClickOnlyPoint);
    this.map.off('click', this.handleMapClickFindNearest);
    this.map.on('click', this.handleMapClickFindNearest);
  }

  public disableFindNearestStationOnClick(): void {
    if (!this.map) return;
    this.map.off('click', this.handleMapClickFindNearest);
  }

  private ensureNearestStationLayers(): void {
    if (!this.map) return;

    if (!this.map.hasLayer(this.selectedPointLayer)) {
      this.selectedPointLayer.addTo(this.map);
    }
    if (!this.map.hasLayer(this.nearestStationLayer)) {
      this.nearestStationLayer.addTo(this.map);
    }
    if (!this.map.hasLayer(this.nearestStationLineLayer)) {
      this.nearestStationLineLayer.addTo(this.map);
    }
  }

  public showSelectedPointAndNearestStation(lat: number, lng: number): void {
    if (!this.map) return;

    this.ensureNearestStationLayers();

    this.selectedPointLayer.clearLayers();
    this.nearestStationLayer.clearLayers();
    this.nearestStationLineLayer.clearLayers();

    const cercanas = this.findNearestStations(lat, lng, this.cantidadEstacionesCercanas);

    const selectedMarker = L.circleMarker([lat, lng], {
      radius: 9,
      color: '#dc2626',
      fillColor: '#ef4444',
      fillOpacity: 1,
      weight: 2
    });

    selectedMarker.bindPopup(`
      <div style="min-width: 160px">
        <strong>Punto seleccionado</strong><br>
        <span>Latitud: ${lat}</span><br>
        <span>Longitud: ${lng}</span>
      </div>
    `);

    selectedMarker.addTo(this.selectedPointLayer);

    if (cercanas.length === 0) {
      selectedMarker.openPopup();
      this.estacionesCercanas.emit([]);
      return;
    }

    const masCercana = cercanas[0];
    const stationLat = masCercana.estacion.point!.cordenadas.lat;
    const stationLng = masCercana.estacion.point!.cordenadas.lng;

    const stationMarker = L.circleMarker([stationLat, stationLng], {
      radius: 30,
      color: '#16a34a',
      fillColor: '#22c55e',
      fillOpacity: 0.2,
      weight: 3
    });

    stationMarker.bindPopup(`
      <div style="min-width: 180px">
        <strong>Estación más cercana</strong><br>
        <span>${this.escapeHtml(masCercana.estacion.nombre)}</span><br>
        <span>Distancia: ${masCercana.distanceKm.toFixed(2)} km</span><br>
        <span>Latitud: ${stationLat}</span><br>
        <span>Longitud: ${stationLng}</span>
      </div>
    `);

    stationMarker.addTo(this.nearestStationLayer);

    const line = L.polyline(
      [
        [lat, lng],
        [stationLat, stationLng]
      ],
      {
        color: '#16a34a',
        weight: 3,
        opacity: 0.8
      }
    );

    line.addTo(this.nearestStationLineLayer);

    const bounds = L.latLngBounds([
      [lat, lng],
      [stationLat, stationLng]
    ]);

    this.map.fitBounds(bounds, {
      padding: [40, 40]
    });

    selectedMarker.openPopup();

    this.estacionesCercanas.emit(cercanas);
  }

  /**
   * Calcula la lista de estaciones ordenadas por cercanía a un punto.
   * `cantidad` es parametrizable (por defecto usa this.cantidadEstacionesCercanas).
   */
  private findNearestStations(lat: number, lng: number, cantidad: number): EstacionCercana[] {
    if (!this.listEstaciones || this.listEstaciones.length === 0) {
      return [];
    }

    const selectedLatLng = L.latLng(lat, lng);
    const cantidadValida = cantidad && cantidad > 0 ? cantidad : this.listEstaciones.length;

    const distancias: EstacionCercana[] = this.listEstaciones.map(estacion => {
      const p = estacion.point!;
      const stationLatLng = L.latLng(Number(p.cordenadas.lat), Number(p.cordenadas.lng));
      const distanceMeters = selectedLatLng.distanceTo(stationLatLng);

      return {
        estacion,
        distanceMeters,
        distanceKm: distanceMeters / 1000
      };
    });

    distancias.sort((a, b) => a.distanceMeters - b.distanceMeters);

    return distancias.slice(0, cantidadValida);
  }

  // ===================== MODO: SOLO COLOCAR PUNTO =====================

  public enableOnlyPointOnClick(): void {
    if (!this.map) return;

    this.ensureNearestStationLayers();

    this.map.off('click', this.handleMapClickFindNearest);
    this.map.off('click', this.handleMapClickOnlyPoint);
    this.map.on('click', this.handleMapClickOnlyPoint);
  }

  public disableOnlyPointOnClick(): void {
    if (!this.map) return;
    this.map.off('click', this.handleMapClickOnlyPoint);
  }

  public showOnlySelectedPoint(lat: number, lng: number): void {
    if (!this.map) return;

    this.ensureNearestStationLayers();

    this.selectedPointLayer.clearLayers();
    this.nearestStationLayer.clearLayers();
    this.nearestStationLineLayer.clearLayers();

    const selectedMarker = L.circleMarker([lat, lng], {
      radius: 9,
      color: '#dc2626',
      fillColor: '#ef4444',
      fillOpacity: 1,
      weight: 2
    });

    selectedMarker.bindPopup(`
      <div style="min-width: 160px">
        <strong>Punto seleccionado</strong><br>
        <span>Latitud: ${lat}</span><br>
        <span>Longitud: ${lng}</span>
      </div>
    `);

    selectedMarker.addTo(this.selectedPointLayer);

    this.map.setView([lat, lng], this.zoom);

    // Calcula y pinta las N estaciones más cercanas (parametrizado)
    const cercanas = this.findNearestStations(lat, lng, this.cantidadEstacionesCercanas);
    this.dibujarEstacionesCercanas(cercanas);

    this.emitPointSelected(lat, lng);
    this.estacionesCercanas.emit(cercanas);

    selectedMarker.openPopup();
  }

  private dibujarEstacionesCercanas(cercanas: EstacionCercana[]): void {
    if (!this.map || cercanas.length === 0) return;

    cercanas.forEach((c, index) => {
      const p = c.estacion.point!;

      const marker = L.circleMarker([p.cordenadas.lat, p.cordenadas.lng], {
        radius: index === 0 ? 14 : 10,
        color: '#16a34a',
        fillColor: '#22c55e',
        fillOpacity: index === 0 ? 0.35 : 0.15,
        weight: index === 0 ? 3 : 2
      });

      marker.bindPopup(`
        <div style="min-width: 180px">
          <strong>#${index + 1} - ${this.escapeHtml(c.estacion.nombre)}</strong><br>
          <span>Distancia: ${c.distanceKm.toFixed(2)} km</span>
        </div>
      `);

      marker.addTo(this.nearestStationLayer);
    });
  }

  private emitPointSelected(lat: number, lng: number): void {
    this.pointSelected.emit({
      crs: this.CRS,
      type: 'point',
      cordenadas: { lat, lng }
    });
  }

  public setpoint(value: any): void {
    this.pointDefault = value;
  }

  private aplicarPuntoDefault(): void {
    if (!this.map) return;
    if (!this._pointDefault?.cordenadas) return;

    const lat = Number(this._pointDefault.cordenadas.lat);
    const lng = Number(this._pointDefault.cordenadas.lng);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      console.error('Punto inválido:', this._pointDefault);
      return;
    }

    this.showOnlySelectedPoint(lat, lng);
    this.refreshMap();
  }

  private normalizarPunto(value: any): EstacionPunto | null {
    if (!value) return null;

    let data = value;

    if (typeof value === 'string') {
      try {
        data = JSON.parse(value);
      } catch (error) {
        console.error('Error al convertir punto JSON:', error);
        return null;
      }
    }

    if (!data.cordenadas) {
      console.error('El punto no tiene cordenadas:', data);
      return null;
    }

    return {
      crs: data.crs ?? this.CRS,
      type: data.type ?? 'point',
      cordenadas: {
        lat: Number(data.cordenadas.lat),
        lng: Number(data.cordenadas.lng)
      }
    };
  }
}
