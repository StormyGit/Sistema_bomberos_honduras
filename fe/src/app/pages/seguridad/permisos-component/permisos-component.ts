import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  inject,
  OnInit,
  signal
} from '@angular/core';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  finalize,
  forkJoin
} from 'rxjs';
import { ObjetoTipo } from '../../../service/seguridad/objeto-services';
import { PermisosService, ObjetoPermisoResponse, AccionTipo, AccionPermiso } from '../../../service/seguridad/permisos-service';
import { RolService, RolResponse } from '../../../service/seguridad/rol-service';

@Component({
  selector: 'app-permisos-component',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './permisos-component.html',
  styleUrl: './permisos-component.css'
})
export class PermisosComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly permisosService =
    inject(PermisosService);

  private readonly rolService =
    inject(RolService);

  rolId = signal<string | null>(null);
  rol = signal<RolResponse | null>(null);

  permisos =
    signal<ObjetoPermisoResponse[]>([]);

  cargando = signal<boolean>(false);

  mensaje = signal<string>('');
  mensajeError = signal<string>('');

  /*
   * Almacena los permisos que están siendo guardados
   * para desactivar temporalmente su checkbox.
   */
  permisosEnProceso =
    signal<Set<string>>(new Set());

  accionesColumnas: AccionTipo[] = [
    'View',
    'Create',
    'Update',
    'Delete'
  ];

  permisosOrdenados = computed(() => {

    const ordenTipo: Record<ObjetoTipo, number> = {
      Modulo: 1,
      Pagina: 2,
      Boton: 3
    };

    return [...this.permisos()].sort((a, b) => {

      const ordenA = ordenTipo[a.tipo] ?? 99;
      const ordenB = ordenTipo[b.tipo] ?? 99;

      if (ordenA !== ordenB) {
        return ordenA - ordenB;
      }

      return a.nombre.localeCompare(b.nombre);
    });
  });

  totalPermisosAsignados = computed(() =>
    this.permisos().reduce(
      (total, objeto) =>
        total +
        objeto.acciones.filter(
          accion => accion.permitido
        ).length,
      0
    )
  );

  totalModulos = computed(() =>
    this.permisos().filter(
      objeto => objeto.tipo === 'Modulo'
    ).length
  );

  totalPaginas = computed(() =>
    this.permisos().filter(
      objeto => objeto.tipo === 'Pagina'
    ).length
  );

  totalBotones = computed(() =>
    this.permisos().filter(
      objeto => objeto.tipo === 'Boton'
    ).length
  );

  ngOnInit(): void {

    const id = this.route.snapshot.paramMap.get(
      'rolId'
    );

    if (!id) {
      this.mensajeError.set(
        'No se recibió el identificador del rol.'
      );

      return;
    }

    this.rolId.set(id);
    this.cargarInformacion(id);
  }

  cargarInformacion(rolId: string): void {

    this.cargando.set(true);
    this.limpiarMensajes();

    forkJoin({
      rol: this.rolService.getById(rolId),

      permisos:
        this.permisosService
          .getPermisosPorRol(rolId)
    })
      .pipe(
        finalize(() => {
          this.cargando.set(false);
        })
      )
      .subscribe({
        next: response => {

          this.rol.set(response.rol);

          this.permisos.set(
            response.permisos ?? []
          );

          if (!response.rol) {
            this.mensajeError.set(
              'No se encontró el rol seleccionado.'
            );
          }
        },
        error: error => {

          console.error(
            'Error al cargar los permisos:',
            error
          );

          this.mensajeError.set(
            'No se pudo cargar la configuración de permisos.'
          );
        }
      });
  }

  recargarPermisos(): void {

    const id = this.rolId();

    if (!id) {
      return;
    }

    this.cargarInformacion(id);
  }

  obtenerAccion(
    objeto: ObjetoPermisoResponse,
    accion: AccionTipo
  ): AccionPermiso | null {

    return objeto.acciones.find(
      item => item.accion === accion
    ) ?? null;
  }

  tieneAccion(
    objeto: ObjetoPermisoResponse,
    accion: AccionTipo
  ): boolean {

    return objeto.acciones.some(
      item => item.accion === accion
    );
  }

  cambiarPermiso(
    objeto: ObjetoPermisoResponse,
    accionTipo: AccionTipo,
    event: Event
  ): void {

    const rolId = this.rolId();

    if (!rolId) {
      return;
    }

    const accion = this.obtenerAccion(
      objeto,
      accionTipo
    );

    if (!accion) {
      return;
    }

    const checkbox =
      event.target as HTMLInputElement;

    const nuevoEstado = checkbox.checked;
    const estadoAnterior = accion.permitido;

    /*
     * Actualización visual inmediata.
     */
    accion.permitido = nuevoEstado;
    this.permisos.update(lista => [...lista]);

    const clave = this.crearClavePermiso(
      objeto.objetoId,
      accionTipo
    );

    this.agregarPermisoEnProceso(clave);
    this.limpiarMensajes();

    this.permisosService
      .actualizarPermiso(
        rolId,
        objeto.objetoId,
        accionTipo,
        nuevoEstado
      )
      .pipe(
        finalize(() => {
          this.quitarPermisoEnProceso(clave);
        })
      )
      .subscribe({
        next: guardado => {

          if (!guardado) {
            this.revertirPermiso(
              accion,
              estadoAnterior
            );

            this.mensajeError.set(
              'No se pudo modificar el permiso.'
            );

            return;
          }

          this.mostrarMensaje(
            nuevoEstado
              ? 'Permiso asignado correctamente.'
              : 'Permiso retirado correctamente.'
          );
        },
        error: error => {

          console.error(
            'Error al modificar permiso:',
            error
          );

          this.revertirPermiso(
            accion,
            estadoAnterior
          );

          this.mensajeError.set(
            'Ocurrió un error al modificar el permiso.'
          );
        }
      });
  }

  estaGuardando(
    objetoId: string,
    accion: AccionTipo
  ): boolean {

    const clave = this.crearClavePermiso(
      objetoId,
      accion
    );

    return this.permisosEnProceso()
      .has(clave);
  }

  private revertirPermiso(
    accion: AccionPermiso,
    estadoAnterior: boolean
  ): void {

    accion.permitido = estadoAnterior;

    this.permisos.update(
      lista => [...lista]
    );
  }

  private crearClavePermiso(
    objetoId: string,
    accion: AccionTipo
  ): string {

    return `${objetoId}-${accion}`;
  }

  private agregarPermisoEnProceso(
    clave: string
  ): void {

    this.permisosEnProceso.update(
      permisosActuales => {

        const nuevosPermisos =
          new Set(permisosActuales);

        nuevosPermisos.add(clave);

        return nuevosPermisos;
      }
    );
  }

  private quitarPermisoEnProceso(
    clave: string
  ): void {

    this.permisosEnProceso.update(
      permisosActuales => {

        const nuevosPermisos =
          new Set(permisosActuales);

        nuevosPermisos.delete(clave);

        return nuevosPermisos;
      }
    );
  }

  nombreAccion(
    accion: AccionTipo
  ): string {

    const nombres: Record<AccionTipo, string> = {
      View: 'Ver',
      Create: 'Crear',
      Update: 'Editar',
      Delete: 'Eliminar'
    };

    return nombres[accion];
  }

  nombreTipo(
    tipo: ObjetoTipo
  ): string {

    const nombres: Record<ObjetoTipo, string> = {
      Modulo: 'Módulo',
      Pagina: 'Página',
      Boton: 'Acción especial'
    };

    return nombres[tipo];
  }

  claseTipo(
    tipo: ObjetoTipo
  ): string {

    const clases: Record<ObjetoTipo, string> = {
      Modulo:
        'bg-purple-500/10 border-purple-400/30 text-purple-200',

      Pagina:
        'bg-blue-500/10 border-blue-400/30 text-blue-200',

      Boton:
        'bg-amber-500/10 border-amber-400/30 text-amber-200'
    };

    return clases[tipo];
  }

  volverRoles(): void {
    this.router.navigate(['seguridad/roles']);
  }

  private limpiarMensajes(): void {
    this.mensaje.set('');
    this.mensajeError.set('');
  }

  private mostrarMensaje(
    texto: string
  ): void {

    this.mensaje.set(texto);
    this.mensajeError.set('');

    setTimeout(() => {
      this.mensaje.set('');
    }, 1800);
  }
}
