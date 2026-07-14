import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export type ObjetoTipo =
  | 'Pagina'
  | 'Modulo'
  | 'Boton';

export interface ObjetoRequest {
  nombre: string;
  tipo: ObjetoTipo;
}

export interface ObjetoResponse {
  id: string;
  nombre: string;
  tipo: ObjetoTipo;
}

@Injectable({
  providedIn: 'root',
})
export class ObjetoServices {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.serve_usersApplication}/objetos`;

  getAll(): Observable<ObjetoResponse[]> {
    return this.http.get<ObjetoResponse[]>(
      this.apiUrl
    );
  }

  getById(
    id: string
  ): Observable<ObjetoResponse | null> {

    return this.http.get<ObjetoResponse | null>(
      `${this.apiUrl}/${id}`
    );
  }

  create(
    objeto: ObjetoRequest
  ): Observable<ObjetoResponse | null> {

    return this.http.post<ObjetoResponse | null>(
      this.apiUrl,
      objeto
    );
  }

  update(
    id: string,
    objeto: ObjetoRequest
  ): Observable<ObjetoResponse | null> {

    return this.http.put<ObjetoResponse | null>(
      `${this.apiUrl}/${id}`,
      objeto
    );
  }

  delete(
    id: string
  ): Observable<boolean> {

    return this.http.delete<boolean>(
      `${this.apiUrl}/${id}`
    );
  }
}
