import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps';

export interface MapLocation {
  lat: number;
  lng: number;
}

@Component({
  selector: 'app-map-picker-component',
  imports: [GoogleMapsModule],
  templateUrl: './map-picker-component.html',
  styleUrl: './map-picker-component.css',
})
export class MapPickerComponent {

  @Input() height: string = '400px';
  @Input() width: string = '100%';

  @Input() zoom: number = 15;

  @Input() center: MapLocation = {
    lat: 14.0723,
    lng: -87.1921
  };

  @Input() markerPosition: MapLocation | null = null;

  @Output() locationSelected = new EventEmitter<MapLocation>();

  mapOptions: google.maps.MapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: true,
  };

  selectLocation(event: google.maps.MapMouseEvent) {
    if (!event.latLng) return;

    const location: MapLocation = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };

    this.markerPosition = location;
    this.locationSelected.emit(location);
  }
}
