import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  inject,
  OnInit,
  signal
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { finalize } from 'rxjs';

import {
  TableColumn,
  TableCustomComponent
} from '../../../components/table-custom/table-custom';

import {
  ModalComponent
} from '../../../components/modal-component/modal-component';
import { ObjetoRequest, ObjetoResponse, ObjetoServices, ObjetoTipo } from '../../../service/seguridad/objeto-services';


type ModoFormulario = 'crear' | 'editar';

@Component({
  selector: 'app-objeto-component',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableCustomComponent,
    ModalComponent
  ],
  templateUrl: './objeto-component.html',
  styleUrl: './objeto-component.css',
})
export class ObjetoComponent implements OnInit {

  private readonly objetoService = inject(ObjetoServices);
  private readonly formBuilder = inject(FormBuilder);

  // Lista de objetos
  objetos = signal<ObjetoResponse[]>([]);

  // Estados
  cargando = signal<boolean>(false);
  guardando = signal<boolean>(false);

  // Modal
  showModal = signal<boolean>(false);
  modoFormulario = signal<ModoFormulario>('crear');

  objetoSeleccionado =
    signal<ObjetoResponse | null>(null);

  // Mensajes
  mensaje = signal<string>('');
  errorPagina = signal<string>('');
  errorModal = signal<string>('');

  // Tipos disponibles
  tiposObjeto: ObjetoTipo[] = [
    'Pagina',
    'Modulo',
    'Boton'
  ];

  // Formulario
  objetoForm = this.formBuilder.nonNullable.group({
    nombre: [
      '',
      [
        Validators.required,
        Validators.maxLength(100)
      ]
    ],

    tipo: [
      'Pagina' as ObjetoTipo,
      Validators.required
    ]
  });

  // Columnas de la tabla
  columnasObjetos: TableColumn[] = [
    {
      key: 'nombre',
      label: 'Nombre'
    },
    {
      key: 'tipoVista',
      label: 'Tipo'
    }
  ];

  // Acciones
  actions = [
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

  // Datos adaptados para la tabla
  objetosTabla = computed(() =>
    this.objetos().map(objeto => ({
      ...objeto,

      tipoVista:
        objeto.tipo === 'Pagina'
          ? 'Página'
          : objeto.tipo === 'Modulo'
            ? 'Módulo'
            : 'Botón'
    }))
  );

  // Contadores
  totalPaginas = computed(() =>
    this.objetos().filter(
      objeto => objeto.tipo === 'Pagina'
    ).length
  );

  totalBotones = computed(() =>
    this.objetos().filter(
      objeto => objeto.tipo === 'Boton'
    ).length
  );

  ngOnInit(): void {
    this.cargarObjetos();
  }

  // =====================================================
  // CARGAR OBJETOS
  // =====================================================

  cargarObjetos(): void {
    this.cargando.set(true);
    this.errorPagina.set('');

    this.objetoService.getAll()
      .pipe(
        finalize(() => {
          this.cargando.set(false);
        })
      )
      .subscribe({
        next: objetos => {
          this.objetos.set(objetos ?? []);
        },
        error: error => {
          console.error(
            'Error al cargar los objetos:',
            error
          );

          this.errorPagina.set(
            'No se pudieron cargar los objetos.'
          );
        }
      });
  }

  // =====================================================
  // ABRIR Y CERRAR MODAL
  // =====================================================

  abrirModalCreacion(): void {
    this.modoFormulario.set('crear');
    this.objetoSeleccionado.set(null);

    this.objetoForm.reset({
      nombre: '',
      tipo: 'Pagina'
    });

    this.limpiarMensajes();
    this.showModal.set(true);
  }

  abrirModalEdicion(
    objeto: ObjetoResponse
  ): void {

    this.modoFormulario.set('editar');
    this.objetoSeleccionado.set(objeto);

    this.objetoForm.reset({
      nombre: objeto.nombre,
      tipo: objeto.tipo
    });

    this.limpiarMensajes();
    this.showModal.set(true);
  }

  cerrarModal(): void {
    if (this.guardando()) {
      return;
    }

    this.showModal.set(false);
    this.objetoSeleccionado.set(null);
    this.errorModal.set('');

    this.objetoForm.reset({
      nombre: '',
      tipo: 'Pagina'
    });
  }

  // =====================================================
  // GUARDAR
  // =====================================================

  guardarObjeto(): void {
    this.errorModal.set('');

    if (this.objetoForm.invalid) {
      this.objetoForm.markAllAsTouched();

      this.errorModal.set(
        'Complete correctamente los campos obligatorios.'
      );

      return;
    }

    const formValue =
      this.objetoForm.getRawValue();

    const request: ObjetoRequest = {
      nombre: formValue.nombre.trim(),
      tipo: formValue.tipo
    };

    this.guardando.set(true);

    if (this.modoFormulario() === 'crear') {
      this.crearObjeto(request);
      return;
    }

    this.actualizarObjeto(request);
  }

  private crearObjeto(
    request: ObjetoRequest
  ): void {

    this.objetoService.create(request)
      .pipe(
        finalize(() => {
          this.guardando.set(false);
        })
      )
      .subscribe({
        next: objetoCreado => {
          if (!objetoCreado) {
            this.errorModal.set(
              'Ya existe un objeto con el mismo nombre y tipo.'
            );

            return;
          }

          this.objetos.update(
            objetosActuales => [
              ...objetosActuales,
              objetoCreado
            ]
          );

          setTimeout(() => {
            this.cerrarModal();

            this.mostrarMensaje(
              'Objeto creado correctamente.'
            );
          }, 0);
        },
        error: error => {
          console.error(
            'Error al crear el objeto:',
            error
          );

          this.errorModal.set(
            'Ocurrió un error al crear el objeto.'
          );
        }
      });
  }

  private actualizarObjeto(
    request: ObjetoRequest
  ): void {

    const objeto =
      this.objetoSeleccionado();

    if (!objeto?.id) {
      this.guardando.set(false);

      this.errorModal.set(
        'No se encontró el objeto seleccionado.'
      );

      return;
    }

    this.objetoService
      .update(objeto.id, request)
      .pipe(
        finalize(() => {
          this.guardando.set(false);
        })
      )
      .subscribe({
        next: objetoActualizado => {
          if (!objetoActualizado) {
            this.errorModal.set(
              'No se pudo actualizar. Puede existir otro objeto con el mismo nombre y tipo.'
            );

            return;
          }

          this.objetos.update(
            objetosActuales =>
              objetosActuales.map(item =>
                item.id === objetoActualizado.id
                  ? objetoActualizado
                  : item
              )
          );

          setTimeout(() => {
            this.cerrarModal();

            this.mostrarMensaje(
              'Objeto actualizado correctamente.'
            );
          }, 0);
        },
        error: error => {
          console.error(
            'Error al actualizar el objeto:',
            error
          );

          this.errorModal.set(
            'Ocurrió un error al actualizar el objeto.'
          );
        }
      });
  }

  // =====================================================
  // ELIMINAR
  // =====================================================

  eliminarObjeto(
    objeto: ObjetoResponse
  ): void {

    const confirmar = window.confirm(
      `¿Está seguro de eliminar "${objeto.nombre}"?`
    );

    if (!confirmar) {
      return;
    }

    this.errorPagina.set('');

    this.objetoService
      .delete(objeto.id)
      .subscribe({
        next: eliminado => {
          if (!eliminado) {
            this.errorPagina.set(
              'No se encontró el objeto que desea eliminar.'
            );

            return;
          }

          this.objetos.update(
            objetosActuales =>
              objetosActuales.filter(
                item => item.id !== objeto.id
              )
          );

          this.mostrarMensaje(
            'Objeto eliminado correctamente.'
          );
        },
        error: error => {
          console.error(
            'Error al eliminar el objeto:',
            error
          );

          this.errorPagina.set(
            'No se pudo eliminar el objeto. Puede estar relacionado con un permiso.'
          );
        }
      });
  }

  // =====================================================
  // ACCIONES DE LA TABLA
  // =====================================================

  onTableAction(event: {
    action: string;
    row: ObjetoResponse;
  }): void {

    if (event.action === 'edit') {
      this.abrirModalEdicion(event.row);
      return;
    }

    if (event.action === 'delete') {
      this.eliminarObjeto(event.row);
    }
  }

  // =====================================================
  // UTILIDADES
  // =====================================================

  private limpiarMensajes(): void {
    this.mensaje.set('');
    this.errorPagina.set('');
    this.errorModal.set('');
  }

  private mostrarMensaje(
    texto: string
  ): void {

    this.mensaje.set(texto);
    this.errorPagina.set('');

    setTimeout(() => {
      this.mensaje.set('');
    }, 3000);
  }

  get tituloModal(): string {
    return this.modoFormulario() === 'crear'
      ? 'Registrar objeto'
      : 'Editar objeto';
  }

  get textoBotonGuardar(): string {
    if (this.guardando()) {
      return 'Guardando...';
    }

    return this.modoFormulario() === 'crear'
      ? 'Crear objeto'
      : 'Actualizar objeto';
  }
}
