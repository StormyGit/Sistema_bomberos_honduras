import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { incidente, Recurso, Tiempo, TiempoTipo } from '../types/cce/incidente.interface';
import { environment } from 'src/environments/environment';

export interface SearchIncidenteDTO {
  fecha_Inicio?: string | null;
  fecha_Final?: string | null;
  buscar?: string | null;
  isFinalizado?: boolean
  tipo?: string | null;
  idEstacion?: string | null;
}

export interface Resumen {
  TipoResumen: any[];
  Incidentes: incidente[];
  tipoAndMunicipios: any[];
}

@Injectable({
  providedIn: 'root',
})
export class IncidenteService {
  private apiUrl = environment.serve_incidenteApplication + '/incidente';

  http = inject(HttpClient)

  getAll(): Observable<incidente[]> {
    return this.http.get<incidente[]>(this.apiUrl);
  }

  create(incidente: incidente): Observable<incidente> {
    return this.http.post<incidente>(this.apiUrl, incidente);
  }

  update(id: string, incidente: incidente): Observable<incidente> {
    return this.http.put<incidente>(`${this.apiUrl}/${id}`, incidente);
  }

  addRecurso(id_incidente: string, recurso: Recurso): Observable<Recurso> {
    return this.http.post<Recurso>(`${this.apiUrl}/${id_incidente}/recurso`, recurso);
  }

  addTiempo(id_incidente: string, tiempoTipo: TiempoTipo): Observable<Tiempo> {
    return this.http.post<Tiempo>(`${this.apiUrl}/${id_incidente}/tiempos/${tiempoTipo}`,{});
  }

  getTiempo(id_incidente: string, tiempoTipo: TiempoTipo): Observable<Tiempo | null> {
    return this.http.get<Tiempo | null>(
      `${this.apiUrl}/${id_incidente}/tiempos/${tiempoTipo}`
    );
  }

  addEvidencia(formData: any): Observable<any>{
    return this.http.post<any>(
      `${this.apiUrl}/evidencia`, formData
    );
  }

    buscarIncidentes(data: SearchIncidenteDTO): Observable<Resumen> {
      const body: SearchIncidenteDTO = {
        fecha_Inicio: data.fecha_Inicio || null,
        fecha_Final: data.fecha_Final || null,
        isFinalizado: data.isFinalizado || false,
        buscar: data.buscar?.trim() || null,
        tipo: data.tipo || null,
        idEstacion: data.idEstacion || null
      };

      console.log("body: ", body)
      return this.http.post<Resumen>(
        `${this.apiUrl}/buscar`,
        body
      );
    }

}
