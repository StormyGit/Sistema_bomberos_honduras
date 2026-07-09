import { estaciones } from './../types/cce/incidente.interface';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})

export class BomberosMantenimiento {
  getAllEstaciones(): estaciones[] {
    return [
      {
        nombre: 'Estación Central CCE',
        point: {
          crs: 'EPSG:4326',
          type: 'Point',
          cordenadas: { lat: 14.09626, lng: -87.20333 }
        }
      },
      {
        nombre: 'Estación #1 - Colonia Granada',
        point: {
          crs: 'EPSG:4326',
          type: 'Point',
          cordenadas: { lat: 14.09605, lng: -87.26129 }
        }
      },
      {
        nombre: 'Estación #2 - Colonia Kennedy',
        point: {
          crs: 'EPSG:4326',
          type: 'Point',
          cordenadas: { lat: 14.06456, lng: -87.17694 }
        }
      },
      {
        nombre: 'Estación #3 - Colonia Las Vegas',
        point: {
          crs: 'EPSG:4326',
          type: 'Point',
          cordenadas: { lat: 14.0900, lng: -87.2200 }
        }
      }
    ];
  }
}
