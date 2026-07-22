import {
  CommonModule
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
  takeUntilDestroyed
} from '@angular/core/rxjs-interop';

import {
  debounceTime,
  distinctUntilChanged,
  finalize
} from 'rxjs';

import {
  TableCustomComponent
} from '../../../components/table-custom/table-custom';

import {
  ModalComponent
} from '../../../components/modal-component/modal-component';


import {
  environment
} from '../../../../environments/environment';
import { IncidenteTipo, CatalogoLugaresServices, IncidenteTipoRequest } from '../../../service/catalogo-lugares-services';
import { TipoReporte, TIPOS_REPORTES } from '../../../mocks/formReportes';


interface IncidenteTipoTabla extends IncidenteTipo {
  indexReporteVista: string;
  imagenVista: string;
}

interface TableActionEvent {
  action: string;
  row: IncidenteTipoTabla;
}


@Component({
  selector: 'app-incidente-tipos-component',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableCustomComponent,
    ModalComponent
  ],
  templateUrl: './incidentes-tipos-component.html',
  styleUrl: './incidentes-tipos-component.css'
})
export class IncidenteTiposComponent implements OnInit {

  private readonly catalogoService =
    inject(CatalogoLugaresServices);

  private readonly formBuilder =
    inject(FormBuilder);

  private readonly destroyRef =
    inject(DestroyRef);


  // =====================================================
  // LISTADO
  // =====================================================

  readonly tiposIncidente =
    signal<IncidenteTipoTabla[]>([]);

  readonly textoBusqueda =
    signal<string>('');

    readonly tiposReportes: TipoReporte[] =
  TIPOS_REPORTES;

  readonly tiposFiltrados = computed(() => {
    const texto = this.textoBusqueda()
      .trim()
      .toLowerCase();

    if (!texto) {
      return this.tiposIncidente();
    }

    return this.tiposIncidente().filter(tipo => {
      const nombre =
        tipo.nombre?.toLowerCase() ?? '';

      const indexReporte =
        tipo.indexReporte?.toLowerCase() ?? '';

      return nombre.includes(texto)
        || indexReporte.includes(texto);
    });
  });


  readonly totalConImagen = computed(() =>
    this.tiposIncidente().filter(
      tipo => Boolean(tipo.urlImagen)
    ).length
  );


  readonly totalSinIndexReporte = computed(() =>
    this.tiposIncidente().filter(
      tipo => !tipo.indexReporte?.trim()
    ).length
  );


  // =====================================================
  // ESTADOS
  // =====================================================

  readonly cargando =
    signal<boolean>(false);

  readonly guardando =
    signal<boolean>(false);

  readonly eliminando =
    signal<boolean>(false);

  readonly mensaje =
    signal<string>('');

  readonly errorPagina =
    signal<string>('');

  readonly errorModal =
    signal<string>('');


  // =====================================================
  // MODAL
  // =====================================================

  readonly showModal =
    signal<boolean>(false);

  readonly tipoSeleccionado =
    signal<IncidenteTipoTabla | null>(null);

  readonly esEdicion = computed<boolean>(() =>
    this.tipoSeleccionado() !== null
  );


  // =====================================================
  // IMAGEN
  // =====================================================

  readonly imagenSeleccionada =
    signal<File | null>(null);

  readonly imagenActual =
    signal<string | null>(null);

  readonly vistaPreviaImagen =
    signal<string | null>(null);

  readonly nombreImagenSeleccionada = computed(() =>
    this.imagenSeleccionada()?.name ?? ''
  );


  // =====================================================
  // FORMULARIO DE FILTRO
  // =====================================================

  readonly filtroForm =
    this.formBuilder.nonNullable.group({
      buscar: ['']
    });


  // =====================================================
  // FORMULARIO
  // =====================================================

  readonly tipoForm =
    this.formBuilder.nonNullable.group({
      nombre: [
        '',
        [
          Validators.required,
          Validators.maxLength(100)
        ]
      ],

      indexReporte: ['']
    });


  // =====================================================
  // TABLA
  // =====================================================

  readonly columnasTiposIncidente = [
    {
      key: 'nombre',
      label: 'Nombre'
    },
    {
      key: 'indexReporteVista',
      label: 'Índice de reporte'
    },
    {
      key: 'imagenVista',
      label: 'Imagen'
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
    this.cargarTiposIncidente();
    this.escucharFiltro();
  }


  private escucharFiltro(): void {
    this.filtroForm.controls.buscar.valueChanges
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(valor => {
        this.textoBusqueda.set(valor);
      });
  }


  // =====================================================
  // CARGAR TIPOS
  // =====================================================

  cargarTiposIncidente(): void {
    this.cargando.set(true);
    this.errorPagina.set('');

    this.catalogoService
      .IncidenteTipo_GetAll()
      .pipe(
        finalize(() => {
          this.cargando.set(false);
        })
      )
      .subscribe({
        next: tipos => {
          this.asignarTiposIncidente(
            tipos ?? []
          );
        },

        error: error => {
          console.error(
            'Error al cargar los tipos de incidente:',
            error
          );

          this.tiposIncidente.set([]);

          this.errorPagina.set(
            this.obtenerMensajeError(
              error,
              'No se pudieron cargar los tipos de incidente.'
            )
          );
        }
      });
  }


  private asignarTiposIncidente(
    tipos: IncidenteTipo[]
  ): void {

    const tiposTabla: IncidenteTipoTabla[] =
      tipos
        .map(tipo => ({
          ...tipo,

          indexReporteVista:
            tipo.indexReporte?.trim()
              ? tipo.indexReporte
              : 'Sin asignar',

          imagenVista:
            tipo.urlImagen
              ? 'Sí'
              : 'No'
        }))
        .sort((a, b) =>
          a.nombre.localeCompare(
            b.nombre,
            'es',
            {
              sensitivity: 'base'
            }
          )
        );

    this.tiposIncidente.set(tiposTabla);
  }


  // =====================================================
  // FILTRO
  // =====================================================

  limpiarFiltro(): void {
    this.filtroForm.reset(
      {
        buscar: ''
      },
      {
        emitEvent: false
      }
    );

    this.textoBusqueda.set('');
  }


  // =====================================================
  // CREAR
  // =====================================================

  abrirModalCreacion(): void {
    this.tipoSeleccionado.set(null);

    this.errorModal.set('');

    this.tipoForm.reset({
      nombre: '',
      indexReporte: ''
    });

    this.imagenSeleccionada.set(null);
    this.imagenActual.set(null);
    this.vistaPreviaImagen.set(null);

    this.showModal.set(true);
  }


  // =====================================================
  // EDITAR
  // =====================================================

  abrirModalEdicion(
    tipo: IncidenteTipoTabla
  ): void {

    this.tipoSeleccionado.set(tipo);

    this.errorModal.set('');

    this.tipoForm.reset({
      nombre: tipo.nombre,
      indexReporte: tipo.indexReporte ?? ''
    });

    this.imagenSeleccionada.set(null);

    this.imagenActual.set(
      tipo.urlImagen ?? null
    );

    this.vistaPreviaImagen.set(
      this.resolverUrlImagen(tipo.urlImagen)
    );

    this.showModal.set(true);
  }


  // =====================================================
  // SELECCIÓN DE IMAGEN
  // =====================================================

  seleccionarImagen(event: Event): void {
    const input =
      event.target as HTMLInputElement;

    const archivo =
      input.files?.[0] ?? null;

    if (!archivo) {
      return;
    }

    this.errorModal.set('');

    if (!archivo.type.startsWith('image/')) {
      input.value = '';

      this.errorModal.set(
        'El archivo seleccionado debe ser una imagen.'
      );

      return;
    }

    const limiteBytes =
      5 * 1024 * 1024;

    if (archivo.size > limiteBytes) {
      input.value = '';

      this.errorModal.set(
        'La imagen no puede superar los 5 MB.'
      );

      return;
    }

    this.imagenSeleccionada.set(archivo);

    const lector =
      new FileReader();

    lector.onload = () => {
      this.vistaPreviaImagen.set(
        lector.result as string
      );
    };

    lector.onerror = () => {
      this.imagenSeleccionada.set(null);

      this.vistaPreviaImagen.set(
        this.resolverUrlImagen(
          this.imagenActual()
        )
      );

      this.errorModal.set(
        'No se pudo leer la imagen seleccionada.'
      );
    };

    lector.readAsDataURL(archivo);
  }


  reiniciarInputImagen(event: Event): void {
    const input =
      event.target as HTMLInputElement;

    input.value = '';
  }


  quitarImagenSeleccionada(): void {
    this.imagenSeleccionada.set(null);

    this.vistaPreviaImagen.set(
      this.resolverUrlImagen(
        this.imagenActual()
      )
    );
  }


  // =====================================================
  // GUARDAR
  // =====================================================

  guardarTipoIncidente(): void {
    this.errorModal.set('');

    if (this.tipoForm.invalid) {
      this.tipoForm.markAllAsTouched();

      this.errorModal.set(
        'Complete correctamente los campos obligatorios.'
      );

      return;
    }

    const formValue =
      this.tipoForm.getRawValue();

    const nombre =
      formValue.nombre.trim();

    const indexReporte =
      formValue.indexReporte.trim();

    if (!nombre) {
      this.tipoForm.controls.nombre.setErrors({
        required: true
      });

      this.tipoForm.controls.nombre.markAsTouched();

      this.errorModal.set(
        'El nombre del tipo de incidente es obligatorio.'
      );

      return;
    }

    const tipoActual =
      this.tipoSeleccionado();

    /*
     * El controlador exige imagen en POST.
     * En PUT la imagen es opcional.
     */
    if (
      !tipoActual &&
      !this.imagenSeleccionada()
    ) {
      this.errorModal.set(
        'Debe seleccionar una imagen para crear el tipo de incidente.'
      );

      return;
    }

    const request: IncidenteTipoRequest = {
      nombre,
      indexReporte:
        indexReporte || null,
      imagen:
        this.imagenSeleccionada()
    };

    this.guardando.set(true);

    const peticion =
      tipoActual?.id
        ? this.catalogoService.IncidenteTipoUpdate(
            tipoActual.id,
            request
          )
        : this.catalogoService.IncidenteTipoCrear(
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
            tipoActual
              ? 'Tipo de incidente actualizado correctamente.'
              : 'Tipo de incidente creado correctamente.';

          this.cerrarModal();
          this.mostrarMensaje(texto);
          this.cargarTiposIncidente();
        },

        error: error => {
          console.error(
            'Error al guardar el tipo de incidente:',
            error
          );

          this.errorModal.set(
            this.obtenerMensajeError(
              error,
              tipoActual
                ? 'No se pudo actualizar el tipo de incidente.'
                : 'No se pudo crear el tipo de incidente.'
            )
          );
        }
      });
  }


  // =====================================================
  // ELIMINAR
  // =====================================================

  eliminarTipoIncidente(
    tipo: IncidenteTipoTabla
  ): void {

    if (!tipo.id) {
      this.errorPagina.set(
        'No se encontró el identificador del tipo de incidente.'
      );

      return;
    }

    const confirmar = window.confirm(
      `¿Está seguro de eliminar el tipo de incidente "${tipo.nombre}"?`
    );

    if (!confirmar) {
      return;
    }

    this.eliminando.set(true);
    this.errorPagina.set('');

    this.catalogoService
      .IncidenteTipoDelete(tipo.id)
      .pipe(
        finalize(() => {
          this.eliminando.set(false);
        })
      )
      .subscribe({
        next: () => {
          this.mostrarMensaje(
            'Tipo de incidente eliminado correctamente.'
          );

          this.cargarTiposIncidente();
        },

        error: error => {
          console.error(
            'Error al eliminar el tipo de incidente:',
            error
          );

          this.errorPagina.set(
            this.obtenerMensajeError(
              error,
              'No se pudo eliminar el tipo de incidente.'
            )
          );
        }
      });
  }


  // =====================================================
  // ACCIONES DE TABLA
  // =====================================================

  onTableAction(
    event: TableActionEvent
  ): void {

    switch (event.action) {
      case 'edit':
        this.abrirModalEdicion(event.row);
        break;

      case 'delete':
        this.eliminarTipoIncidente(event.row);
        break;
    }
  }


  // =====================================================
  // MODAL
  // =====================================================

  cerrarModal(): void {
    if (this.guardando()) {
      return;
    }

    this.showModal.set(false);

    this.tipoSeleccionado.set(null);

    this.errorModal.set('');

    this.imagenSeleccionada.set(null);
    this.imagenActual.set(null);
    this.vistaPreviaImagen.set(null);

    this.tipoForm.reset({
      nombre: '',
      indexReporte: ''
    });
  }


  // =====================================================
  // URL DE IMAGEN
  // =====================================================

  resolverUrlImagen(
    imagen?: string | null
  ): string | null {

    const valor =
      imagen?.trim();

    if (!valor) {
      return null;
    }

    if (
      valor.startsWith('http://') ||
      valor.startsWith('https://') ||
      valor.startsWith('data:') ||
      valor.startsWith('blob:')
    ) {
      return valor;
    }

    const baseUrl =
      environment.serve_incidenteApplication
        .replace(/\/+$/, '');

    const ruta =
      valor.replace(/^\/+/, '');

    return `${baseUrl}/${ruta}`;
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

    if (
      typeof error?.error === 'string' &&
      error.error.trim()
    ) {
      return error.error;
    }

    return error?.error?.message
      ?? error?.error?.mensaje
      ?? mensajePredeterminado;
  }
}
