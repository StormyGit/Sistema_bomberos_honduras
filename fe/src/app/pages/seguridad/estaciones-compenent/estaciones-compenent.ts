import { CommonModule } from '@angular/common';
import {
  Component,
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
  finalize,
  forkJoin
} from 'rxjs';

import {
  TableColumn,
  TableCustomComponent
} from '../../../components/table-custom/table-custom';

import {
  ModalComponent
} from '../../../components/modal-component/modal-component';

import {
  CatalogoLugaresServices,
  Departamento,
  Estacion,
  EstacionUpdateRequest,
  Municipio
} from '../../../service/catalogo-lugares-services';

@Component({
  selector: 'app-estaciones-compenent',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableCustomComponent,
    ModalComponent
  ],
  templateUrl: './estaciones-compenent.html',
  styleUrl: './estaciones-compenent.css',
})
export class EstacionesCompenent implements OnInit {

  private readonly catalogoService =
    inject(CatalogoLugaresServices);

  private readonly formBuilder =
    inject(FormBuilder);

  // =====================================================
  // LISTAS
  // =====================================================

  departamentos = signal<Departamento[]>([]);

  municipiosFiltro = signal<Municipio[]>([]);

  municipiosEdicion = signal<Municipio[]>([]);

  estaciones = signal<Estacion[]>([]);

  // =====================================================
  // ESTADOS
  // =====================================================

  cargando = signal<boolean>(false);

  cargandoMunicipiosFiltro =
    signal<boolean>(false);

  cargandoMunicipiosEdicion =
    signal<boolean>(false);

  guardando = signal<boolean>(false);

  mensaje = signal<string>('');

  errorPagina = signal<string>('');

  errorModal = signal<string>('');

  // =====================================================
  // MODAL
  // =====================================================

  showModalEdicion = signal<boolean>(false);

  estacionSeleccionada =
    signal<Estacion | null>(null);

  // =====================================================
  // FORMULARIO DE FILTROS
  // =====================================================

  filtroForm = this.formBuilder.nonNullable.group({
    departamentoId: [''],
    municipioId: ['']
  });

  // =====================================================
  // FORMULARIO DE EDICIÓN
  // =====================================================

  estacionForm = this.formBuilder.nonNullable.group({
    nombre: [
      '',
      [
        Validators.required,
        Validators.maxLength(80)
      ]
    ],

    departamentoId: [
      '',
      Validators.required
    ],

    municipioId: [
      '',
      Validators.required
    ],

    central: [false],

    point: ['']
  });

  // =====================================================
  // TABLA
  // =====================================================

  columnasEstaciones: TableColumn[] = [
    {
      key: 'nombre',
      label: 'Estación'
    },
    {
      key: 'departamento',
      label: 'Departamento'
    },
    {
      key: 'municipio',
      label: 'Municipio'
    },
    {
      key: 'centralVista',
      label: 'Tipo'
    }
  ];

  actions = [
    {
      key: 'edit',
      label: 'Editar',
      class: 'btn btn-sm btn-yellow'
    }
  ];

  ngOnInit(): void {
    this.cargarInformacionInicial();
    this.configurarCambiosFiltros();
    this.configurarCambioDepartamentoEdicion();
  }

  // =====================================================
  // CARGA INICIAL
  // =====================================================

  cargarInformacionInicial(): void {
    this.cargando.set(true);
    this.errorPagina.set('');

    forkJoin({
      departamentos:
        this.catalogoService.obtenerDepartamentos(),

      estaciones:
        this.catalogoService
          .obtenerEstacionesPorDepartamento(
            null,
            null
          )
    })
      .pipe(
        finalize(() => {
          this.cargando.set(false);
        })
      )
      .subscribe({
        next: response => {
          this.departamentos.set(
            response.departamentos ?? []
          );

          this.asignarEstaciones(
            response.estaciones ?? []
          );
        },
        error: error => {
          console.error(
            'Error al cargar estaciones:',
            error
          );

          this.errorPagina.set(
            'No se pudieron cargar las estaciones.'
          );
        }
      });
  }

  // =====================================================
  // FILTROS
  // =====================================================

  private configurarCambiosFiltros(): void {

    this.filtroForm.controls.departamentoId
      .valueChanges
      .subscribe(departamentoId => {
        this.cambiarDepartamentoFiltro(
          departamentoId
        );
      });

    this.filtroForm.controls.municipioId
      .valueChanges
      .subscribe(municipioId => {
        this.cambiarMunicipioFiltro(
          municipioId
        );
      });
  }

private cambiarDepartamentoFiltro(
  departamentoId: string
): void {

  this.filtroForm.controls.municipioId.setValue(
    '',
    {
      emitEvent: false
    }
  );

  this.municipiosFiltro.set([]);

  if (!departamentoId) {
    this.cargarTodasLasEstaciones();
    return;
  }

  this.cargarEstacionesYMunicipiosFiltro(
    departamentoId
  );
}

private cargarEstacionesYMunicipiosFiltro(
  departamentoId: string
): void {

  this.cargando.set(true);
  this.cargandoMunicipiosFiltro.set(true);
  this.errorPagina.set('');

  forkJoin({
    municipios:
      this.catalogoService
        .obtenerMunicipiosPorDepartamento(
          departamentoId
        ),

    estaciones:
      this.catalogoService
        .obtenerEstacionesPorDepartamento(
          departamentoId,
          null
        )
  })
    .pipe(
      finalize(() => {
        this.cargando.set(false);
        this.cargandoMunicipiosFiltro.set(false);
      })
    )
    .subscribe({
      next: response => {

        const estaciones =
          response.estaciones ?? [];

        const municipios =
          response.municipios ?? [];

        /*
         * Guardamos los IDs de los municipios
         * que tienen al menos una estación.
         */
        const municipiosConEstaciones =
          new Set(
            estaciones
              .map(estacion => estacion.municipioId)
              .filter(
                municipioId =>
                  municipioId !== null &&
                  municipioId !== undefined &&
                  municipioId !== ''
              )
          );

        /*
         * Mostramos únicamente municipios
         * que tengan estaciones registradas.
         */
        const municipiosFiltrados =
          municipios.filter(municipio =>
            municipiosConEstaciones.has(
              municipio.id
            )
          );

        this.municipiosFiltro.set(
          municipiosFiltrados
        );

        this.asignarEstaciones(
          estaciones
        );
      },

      error: error => {
        console.error(
          'Error al cargar municipios y estaciones:',
          error
        );

        this.municipiosFiltro.set([]);
        this.estaciones.set([]);

        this.errorPagina.set(
          'No se pudieron cargar los municipios y estaciones del departamento.'
        );
      }
    });
}

  private cambiarMunicipioFiltro(
    municipioId: string
  ): void {

    const departamentoId =
      this.filtroForm.controls
        .departamentoId.value;

    if (!departamentoId) {
      return;
    }

    if (!municipioId) {
      this.cargarEstacionesDepartamento(
        departamentoId
      );

      return;
    }

    this.cargarEstacionesMunicipio(
      departamentoId,
      municipioId
    );
  }

  private cargarMunicipiosFiltro(
    departamentoId: string
  ): void {

    this.cargandoMunicipiosFiltro.set(true);

    this.catalogoService
      .obtenerMunicipiosPorDepartamento(
        departamentoId
      )
      .pipe(
        finalize(() => {
          this.cargandoMunicipiosFiltro.set(false);
        })
      )
      .subscribe({
        next: municipios => {
          this.municipiosFiltro.set(
            municipios ?? []
          );
        },
        error: error => {
          console.error(
            'Error al cargar municipios:',
            error
          );

          this.municipiosFiltro.set([]);

          this.errorPagina.set(
            'No se pudieron cargar los municipios.'
          );
        }
      });
  }

  cargarTodasLasEstaciones(): void {
    this.cargando.set(true);
    this.errorPagina.set('');

    this.catalogoService
      .obtenerEstacionesPorDepartamento(
        null,
        null
      )
      .pipe(
        finalize(() => {
          this.cargando.set(false);
        })
      )
      .subscribe({
        next: estaciones => {
          this.asignarEstaciones(
            estaciones ?? []
          );
        },
        error: error => {
          console.error(
            'Error al cargar las estaciones:',
            error
          );

          this.errorPagina.set(
            'No se pudieron cargar las estaciones.'
          );
        }
      });
  }

  private cargarEstacionesDepartamento(
    departamentoId: string
  ): void {

    this.cargando.set(true);
    this.errorPagina.set('');

    this.catalogoService
      .obtenerEstacionesPorDepartamento(
        departamentoId,
        null
      )
      .pipe(
        finalize(() => {
          this.cargando.set(false);
        })
      )
      .subscribe({
        next: estaciones => {
          this.asignarEstaciones(
            estaciones ?? []
          );
        },
        error: error => {
          console.error(
            'Error al filtrar por departamento:',
            error
          );

          this.errorPagina.set(
            'No se pudieron cargar las estaciones del departamento.'
          );
        }
      });
  }

  private cargarEstacionesMunicipio(
    departamentoId: string,
    municipioId: string
  ): void {

    this.cargando.set(true);
    this.errorPagina.set('');

    this.catalogoService
      .obtenerEstacionesPorDepartamentoYMunicipio(
        departamentoId,
        municipioId,
        null
      )
      .pipe(
        finalize(() => {
          this.cargando.set(false);
        })
      )
      .subscribe({
        next: estaciones => {
          this.asignarEstaciones(
            estaciones ?? []
          );
        },
        error: error => {
          console.error(
            'Error al filtrar por municipio:',
            error
          );

          this.errorPagina.set(
            'No se pudieron cargar las estaciones del municipio.'
          );
        }
      });
  }

  limpiarFiltros(): void {

    this.filtroForm.reset({
      departamentoId: '',
      municipioId: ''
    }, {
      emitEvent: false
    });

    this.municipiosFiltro.set([]);

    this.cargarTodasLasEstaciones();
  }

  private asignarEstaciones(
    estaciones: Estacion[]
  ): void {

    const estacionesTabla = estaciones.map(
      estacion => ({
        ...estacion,

        centralVista:
          estacion.central
            ? 'Estación central'
            : 'Estación local'
      })
    );

    this.estaciones.set(
      estacionesTabla
    );
  }

  // =====================================================
  // EDICIÓN
  // =====================================================

  private configurarCambioDepartamentoEdicion(): void {

    this.estacionForm.controls.departamentoId
      .valueChanges
      .subscribe(departamentoId => {

        this.estacionForm.controls.municipioId
          .setValue('', {
            emitEvent: false
          });

        this.municipiosEdicion.set([]);

        if (!departamentoId) {
          return;
        }

        this.cargarMunicipiosEdicion(
          departamentoId
        );
      });
  }

  abrirModalEdicion(
    estacion: Estacion
  ): void {

    this.estacionSeleccionada.set(
      estacion
    );

    this.errorModal.set('');

    this.estacionForm.reset({
      nombre: estacion.nombre,
      departamentoId:
        estacion.departamentoId,
      municipioId: '',
      central: estacion.central,
      point:
        estacion.point
          ? String(estacion.point)
          : ''
    }, {
      emitEvent: false
    });

    this.showModalEdicion.set(true);

    this.cargarMunicipiosEdicion(
      estacion.departamentoId,
      estacion.municipioId
    );
  }

  private cargarMunicipiosEdicion(
    departamentoId: string,
    municipioSeleccionado?: string | null
  ): void {

    this.cargandoMunicipiosEdicion.set(true);

    this.catalogoService
      .obtenerMunicipiosPorDepartamento(
        departamentoId
      )
      .pipe(
        finalize(() => {
          this.cargandoMunicipiosEdicion.set(false);
        })
      )
      .subscribe({
        next: municipios => {

          const lista = municipios ?? [];

          this.municipiosEdicion.set(lista);

          if (
            municipioSeleccionado &&
            lista.some(
              municipio =>
                municipio.id ===
                municipioSeleccionado
            )
          ) {
            this.estacionForm.controls
              .municipioId
              .setValue(
                municipioSeleccionado,
                {
                  emitEvent: false
                }
              );
          }
        },
        error: error => {
          console.error(
            'Error al cargar municipios:',
            error
          );

          this.errorModal.set(
            'No se pudieron cargar los municipios.'
          );
        }
      });
  }

  guardarEstacion(): void {
    this.errorModal.set('');

    if (this.estacionForm.invalid) {
      this.estacionForm.markAllAsTouched();

      this.errorModal.set(
        'Complete correctamente los campos obligatorios.'
      );

      return;
    }

    const estacion =
      this.estacionSeleccionada();

    if (!estacion?.id) {
      this.errorModal.set(
        'No se encontró la estación seleccionada.'
      );

      return;
    }

    const formValue =
      this.estacionForm.getRawValue();

    const request: EstacionUpdateRequest = {
      nombre:
        formValue.nombre.trim(),

      departamentoId:
        formValue.departamentoId,

      municipioId:
        formValue.municipioId,

      central:
        formValue.central,

      point:
        formValue.point.trim() || null

      /*
       * No enviamos regionalId para conservar
       * la regional actual.
       */
    };

    this.guardando.set(true);

    this.catalogoService
      .actualizarEstacion(
        estacion.id,
        request
      )
      .pipe(
        finalize(() => {
          this.guardando.set(false);
        })
      )
      .subscribe({
        next: estacionActualizada => {

          if (!estacionActualizada) {
            this.errorModal.set(
              'No se pudo actualizar la estación. Revise el departamento y municipio.'
            );

            return;
          }

          this.cerrarModalEdicion();

          this.mostrarMensaje(
            'Estación actualizada correctamente.'
          );

          this.recargarFiltroActual();
        },
        error: error => {
          console.error(
            'Error al actualizar estación:',
            error
          );

          this.errorModal.set(
            'Ocurrió un error al actualizar la estación.'
          );
        }
      });
  }

  cerrarModalEdicion(): void {

    if (this.guardando()) {
      return;
    }

    this.showModalEdicion.set(false);

    this.estacionSeleccionada.set(null);

    this.municipiosEdicion.set([]);

    this.errorModal.set('');

    this.estacionForm.reset({
      nombre: '',
      departamentoId: '',
      municipioId: '',
      central: false,
      point: ''
    }, {
      emitEvent: false
    });
  }

  private recargarFiltroActual(): void {

    const departamentoId =
      this.filtroForm.controls
        .departamentoId.value;

    const municipioId =
      this.filtroForm.controls
        .municipioId.value;

    if (
      departamentoId &&
      municipioId
    ) {
      this.cargarEstacionesMunicipio(
        departamentoId,
        municipioId
      );

      return;
    }

    if (departamentoId) {
      this.cargarEstacionesDepartamento(
        departamentoId
      );

      return;
    }

    this.cargarTodasLasEstaciones();
  }

  // =====================================================
  // ACCIONES DE TABLA
  // =====================================================

  onTableAction(event: {
    action: string;
    row: Estacion;
  }): void {

    if (event.action === 'edit') {
      this.abrirModalEdicion(
        event.row
      );
    }
  }

  // =====================================================
  // MENSAJES
  // =====================================================

  private mostrarMensaje(
    texto: string
  ): void {

    this.mensaje.set(texto);
    this.errorPagina.set('');

    setTimeout(() => {
      this.mensaje.set('');
    }, 3000);
  }
}
