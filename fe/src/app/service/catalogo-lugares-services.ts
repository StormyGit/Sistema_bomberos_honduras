import { point } from './../types/cce/incidente.interface';
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthServiceService } from '../auth/authService.service';

export interface Departamento {
  id: string;
  nombre: string;
  codigo: number;
}

export interface Municipio {
  id: string;
  nombre: string;
  codigo: number;
  departamentoId: string;
}

export interface Estacion {
  id: string,
  nombre: string,
  central:boolean,
  departamento: string,
  municipio: string,
  point?: any,
  departamentoId: string,
  municipioId: string
}

export interface EstacionUpdateRequest {
  nombre: string;
  regionalId?: string | null;
  departamentoId: string;
  municipioId: string;
  central: boolean;
  point?: string | null;
}

export interface IncidenteTipo {
  id?: string;
  nombre: string;
  indexReporte?: string;
  urlImagen?: string;
}
export interface IncidenteTipoRequest {
  nombre: string;
  indexReporte?: string | null;
  imagen?: File | null;
}


@Injectable({
  providedIn: 'root',
})
export class CatalogoLugaresServices {
  private readonly apiUrl = environment.serve_incidenteApplication + '/catalogos';

  private authsvr = inject(AuthServiceService);
  private user_current = this.authsvr.getUser;

  private departamentos$?: Observable<Departamento[]>;

  private municipiosPorDepartamentoCache = new Map<string, Observable<Municipio[]>>();
  private municipiosCache = new Map<string, Observable<Municipio[]>>();

  private http = inject(HttpClient);


  obtenerEstacionesPorDepartamento(departamentoId?: string | null, isCentral?: boolean | null ): Observable<Estacion[]> {
    let params = new HttpParams();

    if (departamentoId !== null && departamentoId !== undefined && departamentoId !== '') {
      params = params.set('departamentoId', departamentoId);
    }

    if (isCentral !== null && isCentral !== undefined) {
      params = params.set('isCentral', String(isCentral));
    }

    return this.http.get<Estacion[]>(
      `${this.apiUrl}/estacion`,
      { params }
    );
  }

  obtenerDepartamentos(): Observable<Departamento[]> {
    if (!this.departamentos$) {
      this.departamentos$ = this.http
        .get<Departamento[]>(`${this.apiUrl}/departamentos`).pipe(
          shareReplay({ bufferSize: 1, refCount: false })
        );
    }

    return this.departamentos$;
  }

  obtenerMunicipiosPorDepartamento(departamentoId: string): Observable<Municipio[]> {
    const cacheExistente = this.municipiosPorDepartamentoCache.get(departamentoId);

    if (cacheExistente) {
      return cacheExistente;
    }

    const request$ = this.http
      .get<Municipio[]>(`${this.apiUrl}/departamentos/${departamentoId}/municipios`)
      .pipe(
        shareReplay({ bufferSize: 1, refCount: false })
      );

    this.municipiosPorDepartamentoCache.set(departamentoId, request$);

    return request$;
  }

  obtenerMunicipios(departamentoId: string): Observable<Municipio[]> {
    const cacheExistente = this.municipiosCache.get(this.user_current?.idDepartamento ?? '-');

    if (cacheExistente) {
      return cacheExistente;
    }

    const request$ = this.http
      .get<Municipio[]>(`${this.apiUrl}/departamentos/${this.user_current?.idDepartamento  ?? '-'}/municipios`)
      .pipe(
        shareReplay({ bufferSize: 1, refCount: false })
      );

    this.municipiosCache.set(this.user_current?.idDepartamento ?? '-', request$);

    return request$;
  }

  obtenerEstacionesPorDepartamentoYMunicipio( departamentoId: string, municipioId: string, isCentral?: boolean | null ): Observable<Estacion[]> {
    let params = new HttpParams();

    if (isCentral !== null && isCentral !== undefined) {
      params = params.set('isCentral', String(isCentral));
    }

    return this.http.get<Estacion[]>(
      `${this.apiUrl}/estacion/${departamentoId}/municipio/${municipioId}`,
      { params }
    );
  }

  actualizarEstacion( id: string, estacion: EstacionUpdateRequest ): Observable<Estacion | null> {
    return this.http.put<Estacion | null>(
      `${this.apiUrl}/estacion/${id}`,
      estacion
    );
  }

  buscarTiposIncidente( buscar?: string ): Observable<IncidenteTipo[]> {

    let params = new HttpParams();

    const texto = buscar?.trim();

    if (texto) {
      params = params.set('buscar', texto);
    }

    return this.http.get<IncidenteTipo[]>(
      `${this.apiUrl}/buscar_tipo`,
      { params }
    );
  }


  private readonly incidenteTiposUrl = `${this.apiUrl}/incidente-tipos`;
  IncidenteTipo_GetAll(): Observable<IncidenteTipo[]> {
    return this.http.get<IncidenteTipo[]>(
      this.incidenteTiposUrl
    );
  }

  IncidenteTipoById(id: string): Observable<IncidenteTipo> {
    return this.http.get<IncidenteTipo>(
      `${this.incidenteTiposUrl}/${id}`
    );
  }

  IncidenteTipoCrear(request: IncidenteTipoRequest): Observable<IncidenteTipo> {

    if (!request.imagen) {
      throw new Error(
        'La imagen es obligatoria para crear un tipo de incidente.'
      );
    }

    const formData = this.crearFormData(request);

    return this.http.post<IncidenteTipo>( this.incidenteTiposUrl, formData );
  }

  IncidenteTipoUpdate( id: string, request: IncidenteTipoRequest ): Observable<IncidenteTipo> {
    const formData = this.crearFormData(request);
    return this.http.put<IncidenteTipo>( `${this.incidenteTiposUrl}/${id}`, formData );
  }

  IncidenteTipoDelete(id: string): Observable<void> {
    return this.http.delete<void>( `${this.incidenteTiposUrl}/${id}`);
  }


  private limpiarCache(): void {
    this.departamentos$ = undefined;
    this.municipiosPorDepartamentoCache.clear();
  }

  private crearFormData( request: IncidenteTipoRequest ): FormData {
    const formData = new FormData();

    formData.append('nombre', request.nombre.trim());
    if (
      request.indexReporte !== null && request.indexReporte !== undefined && request.indexReporte.trim() !== ''
    ) {
      formData.append( 'indexReporte', request.indexReporte.trim() );
    }

    if (request.imagen) {
      formData.append( 'imagen', request.imagen, request.imagen.name );
    }

    return formData;
  }



}
