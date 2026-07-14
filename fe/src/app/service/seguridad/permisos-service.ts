import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

export type AccionTipo =
  | 'View'
  | 'Create'
  | 'Update'
  | 'Delete';

export type ObjetoTipo =
  | 'Modulo'
  | 'Pagina'
  | 'Boton';

export interface AccionPermiso {
  accion: AccionTipo;
  permitido: boolean;
}

export interface ObjetoPermisoResponse {
  objetoId: string;
  nombre: string;
  tipo: ObjetoTipo;

  padreId: string | null;
  padreNombre: string | null;

  acciones: AccionPermiso[];
}

export interface CambiarPermisoRequest {
  rolId: string;
  objetoId: string;
  accion: AccionTipo;
  permitido: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class PermisosService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.serve_usersApplication}/permisos`;

  /**
   * Obtiene todos los objetos del sistema junto con
   * los permisos asignados al rol seleccionado.
   */
  getPermisosPorRol(
    rolId: string
  ): Observable<ObjetoPermisoResponse[]> {

    return this.http.get<ObjetoPermisoResponse[]>(
      `${this.apiUrl}/rol/${rolId}`
    );
  }

  /**
   * Marca o desmarca un permiso.
   */
  cambiarPermiso(
    request: CambiarPermisoRequest
  ): Observable<boolean> {

    return this.http.post<boolean>(
      `${this.apiUrl}/cambiar`,
      request
    );
  }

  /**
   * Método auxiliar para no construir manualmente
   * el objeto cada vez que cambia un checkbox.
   */
  actualizarPermiso(
    rolId: string,
    objetoId: string,
    accion: AccionTipo,
    permitido: boolean
  ): Observable<boolean> {

    const request: CambiarPermisoRequest = {
      rolId,
      objetoId,
      accion,
      permitido
    };

    return this.cambiarPermiso(request);
  }
}
