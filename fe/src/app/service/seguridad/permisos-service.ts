import { inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, map, Observable, of, shareReplay, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthServiceService } from '../../auth/authService.service';

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

export interface PermisosObjeto {
  view: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class PermisosService {

  private readonly http = inject(HttpClient);

  private readonly authService =
    inject(AuthServiceService);

  private readonly apiUrl =
    `${environment.serve_usersApplication}/permisos`;

  /*
   * Permisos cargados para el usuario autenticado.
   */
  private readonly permisosUsuarioSignal =
    signal<ObjetoPermisoResponse[]>([]);

  readonly permisosUsuario =
    this.permisosUsuarioSignal.asReadonly();

  private readonly permisosCargadosSignal =
    signal<boolean>(false);

  readonly permisosCargados =
    this.permisosCargadosSignal.asReadonly();

  private rolCargado: string | null = null;

  private cargaEnCurso$?:
    Observable<ObjetoPermisoResponse[]>;

  // =====================================================
  // ENDPOINTS
  // =====================================================

  getPermisosPorRol(
    rolId: string
  ): Observable<ObjetoPermisoResponse[]> {

    return this.http.get<ObjetoPermisoResponse[]>(
      `${this.apiUrl}/rol/${rolId}`
    );
  }

  cambiarPermiso(
    request: CambiarPermisoRequest
  ): Observable<boolean> {

    return this.http.post<boolean>(
      `${this.apiUrl}/cambiar`,
      request
    );
  }

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

    return this.cambiarPermiso(request).pipe(
      tap(resultado => {

        if (!resultado) {
          return;
        }

        const usuario = this.authService.getUser;

        /*
         * Solo actualizamos el caché cuando se modificó
         * el rol del usuario que inició sesión.
         */
        if (usuario?.rolId === rolId) {
          this.actualizarCache(
            objetoId,
            accion,
            permitido
          );
        }
      })
    );
  }

  // =====================================================
  // CARGAR PERMISOS DEL USUARIO ACTUAL
  // =====================================================

  cargarPermisosUsuario(
    forzarRecarga: boolean = false
  ): Observable<ObjetoPermisoResponse[]> {

    /*
     * En tu AuthService getUser parece ser un getter.
     *
     * Si fuera una función, sería:
     * const usuario = this.authService.getUser();
     */
    const usuario = this.authService.getUser;

    const rolId = usuario?.rolId;

    if (!rolId) {
      this.limpiarPermisos();
      return of([]);
    }

    /*
     * El superadministrador siempre tiene acceso.
     * No necesita que cada permiso exista en la tabla.
     */
    if (this.esSuperAdministrador()) {
      this.rolCargado = rolId;
      this.permisosCargadosSignal.set(true);

      return of([]);
    }

    /*
     * Evita consultar nuevamente si los permisos
     * del mismo rol ya están cargados.
     */
    if (
      !forzarRecarga &&
      this.permisosCargadosSignal() &&
      this.rolCargado === rolId
    ) {
      return of(
        this.permisosUsuarioSignal()
      );
    }

    /*
     * Evita hacer dos solicitudes simultáneas.
     */
    if (
      !forzarRecarga &&
      this.cargaEnCurso$ &&
      this.rolCargado === rolId
    ) {
      return this.cargaEnCurso$;
    }

    this.rolCargado = rolId;

    this.cargaEnCurso$ =
      this.getPermisosPorRol(rolId).pipe(

        tap(permisos => {
          this.permisosUsuarioSignal.set(
            permisos ?? []
          );

          this.permisosCargadosSignal.set(true);
        }),

        catchError(error => {
          console.error(
            'Error al cargar permisos del usuario:',
            error
          );

          this.permisosUsuarioSignal.set([]);
          this.permisosCargadosSignal.set(false);
          this.rolCargado = null;

          return of([]);
        }),

        finalize(() => {
          this.cargaEnCurso$ = undefined;
        }),

        shareReplay({
          bufferSize: 1,
          refCount: false
        })
      );

    return this.cargaEnCurso$;
  }

  // =====================================================
  // VERIFICAR PERMISOS
  // =====================================================

  tienePermiso(
    objetoId: string,
    accion: AccionTipo
  ): boolean {

    if (this.esSuperAdministrador()) {
      return true;
    }

    const objeto =
      this.permisosUsuarioSignal()
        .find(item =>
          item.objetoId === objetoId
        );

    if (!objeto) {
      return false;
    }

    const permiso = objeto.acciones.find(
      item => item.accion === accion
    );

    return permiso?.permitido === true;
  }

  /*
   * Devuelve los permisos con el formato:
   *
   * {
   *   view: true,
   *   create: false,
   *   update: false,
   *   delete: false
   * }
   */
  permisosObjeto(
    objetoId: string
  ): PermisosObjeto {

    return {
      view: this.tienePermiso(
        objetoId,
        'View'
      ),

      create: this.tienePermiso(
        objetoId,
        'Create'
      ),

      update: this.tienePermiso(
        objetoId,
        'Update'
      ),

      delete: this.tienePermiso(
        objetoId,
        'Delete'
      )
    };
  }

  /*
   * Se utiliza en los guards porque garantiza
   * que los permisos estén cargados primero.
   */
  verificarPermiso(
    objetoId: string,
    accion: AccionTipo
  ): Observable<boolean> {

    return this.cargarPermisosUsuario().pipe(
      map(() =>
        this.tienePermiso(
          objetoId,
          accion
        )
      )
    );
  }

  // =====================================================
  // UTILIDADES
  // =====================================================

  limpiarPermisos(): void {
    this.permisosUsuarioSignal.set([]);
    this.permisosCargadosSignal.set(false);

    this.rolCargado = null;
    this.cargaEnCurso$ = undefined;
  }

  private esSuperAdministrador(): boolean {

    const usuario = this.authService.getUser;

    return usuario?.rolCodigo?.toUpperCase() === 'SUPER_ADMIN';// || usuario?.rolCodigo?.toUpperCase() === 'ADMIN_PROGRAMER';
  }

  private actualizarCache(
    objetoId: string,
    accion: AccionTipo,
    permitido: boolean
  ): void {

    this.permisosUsuarioSignal.update(
      objetos =>
        objetos.map(objeto => {

          if (objeto.objetoId !== objetoId) {
            return objeto;
          }

          return {
            ...objeto,

            acciones: objeto.acciones.map(
              permiso =>
                permiso.accion === accion
                  ? {
                      ...permiso,
                      permitido
                    }
                  : permiso
            )
          };
        })
    );
  }
}
