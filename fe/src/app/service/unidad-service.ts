import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams
} from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

export interface UnidadDTO {
  id?: string;
  nombre: string;
  id_estacion: string;
  disponible: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UnidadService {

  private readonly apiUrl =
    `${environment.serve_incidenteApplication}/unidades`;

  constructor(
    private readonly http: HttpClient
  ) {}

  /**
   * Obtiene las unidades pertenecientes a una estación.
   *
   * true  -> solamente disponibles
   * false -> solamente no disponibles
   * null  -> todas las unidades
   */
  getByEstacion(
    estacionId: string,
    isAvailable: boolean | null = null
  ): Observable<UnidadDTO[]> {

    let params = new HttpParams();

    if (isAvailable !== null) {
      params = params.set(
        'isAvailable',
        String(isAvailable)
      );
    }

    return this.http.get<UnidadDTO[]>(
      `${this.apiUrl}/estacion/${estacionId}`,
      { params }
    );
  }

  /**
   * Obtiene una unidad por su identificador.
   */
  getById(
    id: string
  ): Observable<UnidadDTO> {

    return this.http.get<UnidadDTO>(
      `${this.apiUrl}/${id}`
    );
  }

  /**
   * Crea una nueva unidad.
   */
  create(
    unidad: UnidadDTO
  ): Observable<UnidadDTO> {

    return this.http.post<UnidadDTO>(
      this.apiUrl,
      unidad
    );
  }

  /**
   * Actualiza una unidad existente.
   */
  update(
    id: string,
    unidad: UnidadDTO
  ): Observable<UnidadDTO> {

    return this.http.put<UnidadDTO>(
      `${this.apiUrl}/${id}`,
      unidad
    );
  }

  /**
   * Elimina una unidad.
   */
  delete(
    id: string
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}
