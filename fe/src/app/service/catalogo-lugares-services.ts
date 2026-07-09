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

  constructor(private http: HttpClient) {}


  obtenerEstacionesPorDepartamento(
    departamentoId?: string | null,
    isCentral?: boolean | null
  ): Observable<Estacion[]> {

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
        .get<Departamento[]>(`${this.apiUrl}/departamentos`)
        .pipe(
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
    const cacheExistente = this.municipiosCache.get(this.user_current.idDepartamento);

    if (cacheExistente) {
      return cacheExistente;
    }

    const request$ = this.http
      .get<Municipio[]>(`${this.apiUrl}/departamentos/${this.user_current.idDepartamento}/municipios`)
      .pipe(
        shareReplay({ bufferSize: 1, refCount: false })
      );

    this.municipiosCache.set(this.user_current.idDepartamento, request$);

    return request$;
  }




  obtenerEstacionesPorDepartamentoYMunicipio(
    departamentoId: string,
    municipioId: string,
    isCentral?: boolean | null
  ): Observable<Estacion[]> {

    let params = new HttpParams();

    if (isCentral !== null && isCentral !== undefined) {
      params = params.set('isCentral', String(isCentral));
    }

    return this.http.get<Estacion[]>(
      `${this.apiUrl}/estacion/${departamentoId}/municipio/${municipioId}`,
      { params }
    );
  }

  limpiarCache(): void {
    this.departamentos$ = undefined;
    this.municipiosPorDepartamentoCache.clear();
  }
}
