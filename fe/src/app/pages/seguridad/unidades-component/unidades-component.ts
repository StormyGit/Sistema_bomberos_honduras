import {
  CommonModule,
  Location
} from '@angular/common';

import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute
} from '@angular/router';

import {
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

import {
  finalize
} from 'rxjs';

// Ajusta estas rutas según tu proyecto.
import {
  TableCustomComponent
} from '../../../components/table-custom/table-custom';

import {
  ModalComponent
} from '../../../components/modal-component/modal-component';
import { UnidadDTO, UnidadService } from '../../../service/unidad-service';



interface UnidadTabla extends UnidadDTO {
  disponibilidadVista: string;
}

interface TableActionEvent {
  action: string;
  row: UnidadTabla;
}


@Component({
  selector: 'app-unidades-component',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableCustomComponent,
    ModalComponent
  ],
  templateUrl: './unidades-component.html',
  styleUrl: './unidades-component.css'
})
export class UnidadesComponent implements OnInit {

  private readonly unidadService =
    inject(UnidadService);

  private readonly activatedRoute =
    inject(ActivatedRoute);

  private readonly formBuilder =
    inject(FormBuilder);

  private readonly location =
    inject(Location);

  private readonly destroyRef =
    inject(DestroyRef);


  // =====================================================
  // ESTACIÓN
  // =====================================================

  readonly idEstacion = signal<string>('');


  // =====================================================
  // LISTADO
  // =====================================================

  readonly unidades = signal<UnidadTabla[]>([]);

  readonly unidadesDisponibles = computed(() =>
    this.unidades().filter(
      unidad => unidad.disponible
    ).length
  );

  readonly unidadesNoDisponibles = computed(() =>
    this.unidades().filter(
      unidad => !unidad.disponible
    ).length
  );


  // =====================================================
  // ESTADOS DE LA PÁGINA
  // =====================================================

  readonly cargando = signal<boolean>(false);

  readonly guardando = signal<boolean>(false);

  readonly eliminando = signal<boolean>(false);

  readonly mensaje = signal<string>('');

  readonly errorPagina = signal<string>('');

  readonly errorModal = signal<string>('');


  // =====================================================
  // MODAL
  // =====================================================

  readonly showModal = signal<boolean>(false);

  readonly unidadSeleccionada =
    signal<UnidadTabla | null>(null);

  readonly esEdicion = computed<boolean>(() =>
    this.unidadSeleccionada() !== null
  );


  // =====================================================
  // FORMULARIO DE FILTRO
  // =====================================================

  readonly filtroForm =
    this.formBuilder.nonNullable.group({
      disponibilidad: ['']
    });


  // =====================================================
  // FORMULARIO DE UNIDAD
  // =====================================================

  readonly unidadForm =
    this.formBuilder.nonNullable.group({
      nombre: [
        '',
        [
          Validators.required,
          Validators.maxLength(80)
        ]
      ],

      disponible: [true]
    });


  // =====================================================
  // CONFIGURACIÓN DE TABLA
  // =====================================================

  readonly columnasUnidades = [
    {
      key: 'nombre',
      label: 'Nombre'
    },
    {
      key: 'disponibilidadVista',
      label: 'Disponibilidad'
    }
  ];

  readonly actions = [
    {
      key: 'edit',
      label: 'Editar',
      class: 'btn btn-sm btn-yellow'
    },
    {
      key: 'delete',
      label: 'Eliminar',
      class: 'btn btn-sm btn-red'
    }
  ];


  // =====================================================
  // INICIALIZACIÓN
  // =====================================================

  ngOnInit(): void {
    this.escucharParametroEstacion();
    this.escucharFiltroDisponibilidad();
  }

  private escucharParametroEstacion(): void {
    this.activatedRoute.paramMap
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(parametros => {
        const idEstacion =
          parametros.get('idEstacion');

        if (!idEstacion) {
          this.idEstacion.set('');

          this.errorPagina.set(
            'No se encontró el identificador de la estación en la URL.'
          );

          return;
        }

        this.idEstacion.set(idEstacion);
        this.cargarUnidades();
      });
  }

  private escucharFiltroDisponibilidad(): void {
    this.filtroForm.controls.disponibilidad
      .valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        if (this.idEstacion()) {
          this.cargarUnidades();
        }
      });
  }


  // =====================================================
  // OBTENER UNIDADES
  // =====================================================

  cargarUnidades(): void {
    const estacionId = this.idEstacion();

    if (!estacionId) {
      this.errorPagina.set(
        'No se encontró el identificador de la estación.'
      );

      return;
    }

    const disponibilidad =
      this.obtenerFiltroDisponibilidad();

    this.cargando.set(true);
    this.errorPagina.set('');

    this.unidadService
      .getByEstacion(
        estacionId,
        disponibilidad
      )
      .pipe(
        finalize(() => {
          this.cargando.set(false);
        })
      )
      .subscribe({
        next: unidades => {
          this.asignarUnidades(
            unidades ?? []
          );
        },

        error: error => {
          console.error(
            'Error al cargar las unidades:',
            error
          );

          this.unidades.set([]);

          this.errorPagina.set(
            this.obtenerMensajeError(
              error,
              'No se pudieron cargar las unidades.'
            )
          );
        }
      });
  }

  private obtenerFiltroDisponibilidad():
    boolean | null {

    const valor =
      this.filtroForm.controls
        .disponibilidad.value;

    if (valor === 'true') {
      return true;
    }

    if (valor === 'false') {
      return false;
    }

    return null;
  }

  private asignarUnidades(
    unidades: UnidadDTO[]
  ): void {

    const unidadesTabla: UnidadTabla[] =
      unidades.map(unidad => ({
        ...unidad,

        disponibilidadVista:
          unidad.disponible
            ? 'Disponible'
            : 'No disponible'
      }));

    this.unidades.set(unidadesTabla);
  }


  // =====================================================
  // FILTRO
  // =====================================================

  limpiarFiltro(): void {
    this.filtroForm.reset(
      {
        disponibilidad: ''
      },
      {
        emitEvent: false
      }
    );

    this.cargarUnidades();
  }


  // =====================================================
  // CREAR UNIDAD
  // =====================================================

  abrirModalCreacion(): void {
    this.unidadSeleccionada.set(null);

    this.errorModal.set('');

    this.unidadForm.reset({
      nombre: '',
      disponible: true
    });

    this.showModal.set(true);
  }


  // =====================================================
  // EDITAR UNIDAD
  // =====================================================

  abrirModalEdicion(
    unidad: UnidadTabla
  ): void {

    this.unidadSeleccionada.set(unidad);

    this.errorModal.set('');

    this.unidadForm.reset({
      nombre: unidad.nombre,
      disponible: unidad.disponible
    });

    this.showModal.set(true);
  }


  // =====================================================
  // GUARDAR UNIDAD
  // =====================================================

  guardarUnidad(): void {
    this.errorModal.set('');

    if (this.unidadForm.invalid) {
      this.unidadForm.markAllAsTouched();

      this.errorModal.set(
        'Complete correctamente los campos obligatorios.'
      );

      return;
    }

    const estacionId = this.idEstacion();

    if (!estacionId) {
      this.errorModal.set(
        'No se encontró la estación seleccionada.'
      );

      return;
    }

    const formValue =
      this.unidadForm.getRawValue();

    const nombre =
      formValue.nombre.trim();

    if (!nombre) {
      this.unidadForm.controls.nombre.setErrors({
        required: true
      });

      this.unidadForm.controls.nombre.markAsTouched();

      this.errorModal.set(
        'El nombre de la unidad es obligatorio.'
      );

      return;
    }

    const request: UnidadDTO = {
      nombre,
      id_estacion: estacionId,
      disponible: formValue.disponible
    };

    const unidadActual =
      this.unidadSeleccionada();

    this.guardando.set(true);

    const peticion =
      unidadActual?.id
        ? this.unidadService.update(
            unidadActual.id,
            request
          )
        : this.unidadService.create(
            request
          );

    peticion
      .pipe(
        finalize(() => {
          this.guardando.set(false);
        })
      )
      .subscribe({
        next: () => {
          const texto =
            unidadActual
              ? 'Unidad actualizada correctamente.'
              : 'Unidad creada correctamente.';

          this.cerrarModal();
          this.mostrarMensaje(texto);
          this.cargarUnidades();
        },

        error: error => {
          console.error(
            'Error al guardar la unidad:',
            error
          );

          this.errorModal.set(
            this.obtenerMensajeError(
              error,
              unidadActual
                ? 'No se pudo actualizar la unidad.'
                : 'No se pudo crear la unidad.'
            )
          );
        }
      });
  }


  // =====================================================
  // ELIMINAR UNIDAD
  // =====================================================

  eliminarUnidad(
    unidad: UnidadTabla
  ): void {

    if (!unidad.id) {
      this.errorPagina.set(
        'No se encontró el identificador de la unidad.'
      );

      return;
    }

    const confirmar = window.confirm(
      `¿Está seguro de eliminar la unidad "${unidad.nombre}"?`
    );

    if (!confirmar) {
      return;
    }

    this.eliminando.set(true);
    this.errorPagina.set('');

    this.unidadService
      .delete(unidad.id)
      .pipe(
        finalize(() => {
          this.eliminando.set(false);
        })
      )
      .subscribe({
        next: () => {
          this.mostrarMensaje(
            'Unidad eliminada correctamente.'
          );

          this.cargarUnidades();
        },

        error: error => {
          console.error(
            'Error al eliminar la unidad:',
            error
          );

          this.errorPagina.set(
            this.obtenerMensajeError(
              error,
              'No se pudo eliminar la unidad.'
            )
          );
        }
      });
  }


  // =====================================================
  // ACCIONES DE LA TABLA
  // =====================================================

  onTableAction(
    event: TableActionEvent
  ): void {

    switch (event.action) {
      case 'edit':
        this.abrirModalEdicion(event.row);
        break;

      case 'delete':
        this.eliminarUnidad(event.row);
        break;
    }
  }


  // =====================================================
  // CERRAR MODAL
  // =====================================================

  cerrarModal(): void {
    if (this.guardando()) {
      return;
    }

    this.showModal.set(false);

    this.unidadSeleccionada.set(null);

    this.errorModal.set('');

    this.unidadForm.reset({
      nombre: '',
      disponible: true
    });
  }


  // =====================================================
  // NAVEGACIÓN
  // =====================================================

  regresar(): void {
    this.location.back();
  }


  // =====================================================
  // MENSAJES
  // =====================================================

  private mostrarMensaje(
    texto: string
  ): void {

    this.mensaje.set(texto);
    this.errorPagina.set('');

    window.setTimeout(() => {
      this.mensaje.set('');
    }, 3000);
  }

  private obtenerMensajeError(
    error: any,
    mensajePredeterminado: string
  ): string {

    return error?.error?.message
      ?? error?.error?.mensaje
      ?? mensajePredeterminado;
  }
}
