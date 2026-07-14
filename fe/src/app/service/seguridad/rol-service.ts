import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface RolRequest {
  codigo: string;
  nombre: string;
  descripcion?: string | null;
}

export interface RolResponse {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class RolService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.serve_usersApplication}/roles`;

  getAll(): Observable<RolResponse[]> {
    return this.http.get<RolResponse[]>(this.apiUrl);
  }

  getById(id: string): Observable<RolResponse | null> {
    return this.http.get<RolResponse | null>(
      `${this.apiUrl}/${id}`
    );
  }

  create(rol: RolRequest): Observable<RolResponse | null> {
    return this.http.post<RolResponse | null>(
      this.apiUrl,
      rol
    );
  }

  update(
    id: string,
    rol: RolRequest
  ): Observable<RolResponse | null> {

    return this.http.put<RolResponse | null>(
      `${this.apiUrl}/${id}`,
      rol
    );
  }

  delete(id: string): Observable<boolean> {
    return this.http.delete<boolean>(
      `${this.apiUrl}/${id}`
    );
  }
}
