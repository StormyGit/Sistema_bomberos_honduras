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
import { TableColumn, TableCustomComponent } from '../../../components/table-custom/table-custom';
import { ModalComponent } from '../../../components/modal-component/modal-component';
import { UsersServices } from '../../../service/users-services';
import { RolResponse, RolService } from '../../../service/seguridad/rol-service';
import { CatalogoLugaresServices, Departamento, Estacion } from '../../../service/catalogo-lugares-services';
import { UsuarioCreateRequest, UsuarioResponse, UsuarioTipo, UsuarioUpdateRequest } from '../../../auth/auth.interface.ts';


type ModoFormulario = 'crear' | 'editar';

@Component({
  selector: 'app-usuarios-component',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableCustomComponent,
    ModalComponent
  ],
  templateUrl: './usuarios-component.html',
  styleUrl: './usuarios-component.css',
})
export class UsuariosComponent implements OnInit {

  // Servicios
  private readonly usuarioService =
    inject(UsersServices);

  private readonly rolService =
    inject(RolService);

  private readonly catalogoService =
    inject(CatalogoLugaresServices);

  private readonly formBuilder =
    inject(FormBuilder);

  // Listas
  usuarios = signal<UsuarioResponse[]>([]);
  roles = signal<RolResponse[]>([]);
  departamentos = signal<Departamento[]>([]);
  estaciones = signal<Estacion[]>([]);

  // Estados
  cargandoUsuarios = signal<boolean>(false);
  cargandoCatalogos = signal<boolean>(false);
  cargandoEstaciones = signal<boolean>(false);
  guardando = signal<boolean>(false);

  // Modal
  showModal = signal<boolean>(false);
  modoFormulario = signal<ModoFormulario>('crear');

  usuarioSeleccionado =
    signal<UsuarioResponse | null>(null);

  // Mensajes
  mensaje = signal<string>('');
  errorPagina = signal<string>('');
  errorModal = signal<string>('');


  tipoSeleccionado = signal<UsuarioTipo>('Persona');

  get esComponente(): boolean {
    return this.tipoSeleccionado() === 'Componente';
  }

  get etiquetaCorreoOCodigo(): string {
    return this.esComponente ? 'Código' : 'Correo';
  }

  // Opciones del enum
  tiposUsuario: UsuarioTipo[] = [
    'Persona',
    'Entidad',
    'Componente'
  ];

  // Formulario
  usuarioForm = this.formBuilder.nonNullable.group({
    nombre: [
      '',
      [
        Validators.required,
        Validators.maxLength(100)
      ]
    ],

    apellido: [
      '',
      [
        Validators.required,
        Validators.maxLength(100)
      ]
    ],

    correoOrCodigo: [
      '',
      [
        Validators.required,
        Validators.maxLength(150)
      ]
    ],

    password: [
      '',
      [
        Validators.required,
        Validators.minLength(6)
      ]
    ],

    departamentoId: [
      '',
      Validators.required
    ],

    estacionId: [''],

    rolId: [
      '',
      Validators.required
    ],

    tipo: [
      'Persona' as UsuarioTipo,
      Validators.required
    ]
  });

  // Columnas de la tabla
  columnasUsuarios: TableColumn[] = [
    {
      key: 'nombreCompleto',
      label: 'Usuario'
    },
    {
      key: 'correoOrCodigo',
      label: 'Correo o código'
    },
    {
      key: 'tipo',
      label: 'Tipo'
    },
    {
      key: 'rolVista',
      label: 'Rol'
    },
    {
      key: 'departamentoVista',
      label: 'Departamento'
    },
    {
      key: 'estacionVista',
      label: 'Estación'
    }
  ];

  // Acciones de la tabla
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

  /*
   * Adaptamos los usuarios para mostrar los valores
   * correctamente en la tabla.
   */
  usuariosTabla = computed(() =>
    this.usuarios().map(usuario => ({
      ...usuario,

      nombreCompleto:
        `${usuario.nombre} ${usuario.apellido}`,

      rolVista:
        usuario.rolNombre ??
        usuario.rolCodigo ??
        'Sin rol',

      departamentoVista:
        usuario.departamentoNombre ??
        'Sin departamento',

      estacionVista:
        usuario.estacionNombre ??
        'Sin estación'
    }))
  );

  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarCatalogos();

    this.usuarioForm.controls.departamentoId
      .valueChanges
      .subscribe(departamentoId => {
        this.cargarEstaciones(departamentoId);
      });

    // NUEVO: cuando cambia el tipo, ajustamos validaciones y etiqueta
    this.usuarioForm.controls.tipo
      .valueChanges
      .subscribe(tipo => {
        this.tipoSeleccionado.set(tipo);
        this.configurarCorreoOCodigo(tipo);
      });
  }

  // =====================================================
  // CARGAR INFORMACIÓN
  // =====================================================

  cargarUsuarios(): void {
    this.cargandoUsuarios.set(true);
    this.errorPagina.set('');

    this.usuarioService.getAll()
      .pipe(
        finalize(() => {
          this.cargandoUsuarios.set(false);
        })
      )
      .subscribe({
        next: usuarios => {
          this.usuarios.set(usuarios ?? []);
        },
        error: error => {
          console.error(
            'Error al cargar usuarios:',
            error
          );

          this.errorPagina.set(
            'No se pudieron cargar los usuarios.'
          );
        }
      });
  }

  cargarCatalogos(): void {
    this.cargandoCatalogos.set(true);

    this.catalogoService
      .obtenerDepartamentos()
      .subscribe({
        next: departamentos => {
          this.departamentos.set(
            departamentos ?? []
          );

          this.verificarCargaCatalogos();
        },
        error: error => {
          console.error(
            'Error al cargar departamentos:',
            error
          );

          this.errorPagina.set(
            'No se pudieron cargar los departamentos.'
          );

          this.verificarCargaCatalogos();
        }
      });

    this.rolService.getAll()
      .subscribe({
        next: roles => {
          this.roles.set(roles ?? []);
          this.verificarCargaCatalogos();
        },
        error: error => {
          console.error(
            'Error al cargar roles:',
            error
          );

          this.errorPagina.set(
            'No se pudieron cargar los roles.'
          );

          this.verificarCargaCatalogos();
        }
      });
  }

  private verificarCargaCatalogos(): void {
    if (
      this.departamentos().length > 0 ||
      this.roles().length > 0
    ) {
      this.cargandoCatalogos.set(false);
    }
  }

  cargarEstaciones(
    departamentoId: string,
    estacionSeleccionada?: string | null
  ): void {

    this.estaciones.set([]);

    this.usuarioForm.controls.estacionId
      .setValue('', {
        emitEvent: false
      });

    if (!departamentoId) {
      return;
    }

    this.cargandoEstaciones.set(true);

    this.catalogoService
      .obtenerEstacionesPorDepartamento(
        departamentoId
      )
      .pipe(
        finalize(() => {
          this.cargandoEstaciones.set(false);
        })
      )
      .subscribe({
        next: estaciones => {
          const lista = estaciones ?? [];

          this.estaciones.set(lista);

          if (
            estacionSeleccionada &&
            lista.some(
              estacion =>
                estacion.id === estacionSeleccionada
            )
          ) {
            this.usuarioForm.controls.estacionId
              .setValue(
                estacionSeleccionada,
                {
                  emitEvent: false
                }
              );
          }
        },
        error: error => {
          console.error(
            'Error al cargar estaciones:',
            error
          );

          this.estaciones.set([]);

          this.errorModal.set(
            'No se pudieron cargar las estaciones.'
          );
        }
      });
  }

  // =====================================================
  // ABRIR Y CERRAR MODAL
  // =====================================================

  abrirModalCreacion(): void {
    this.modoFormulario.set('crear');
    this.usuarioSeleccionado.set(null);

    this.configurarPassword(true);

    this.estaciones.set([]);
    this.limpiarMensajes();

    this.usuarioForm.reset({
      nombre: '',
      apellido: '',
      correoOrCodigo: '',
      password: '',
      departamentoId: '',
      estacionId: '',
      rolId: '',
      tipo: 'Persona'
    }, {
      emitEvent: false
    });

    // NUEVO
    this.tipoSeleccionado.set('Persona');
    this.configurarCorreoOCodigo('Persona');

    this.showModal.set(true);
  }

  abrirModalEdicion(
    usuario: UsuarioResponse
  ): void {

    this.modoFormulario.set('editar');
    this.usuarioSeleccionado.set(usuario);

    this.configurarPassword(false);

    this.limpiarMensajes();

    this.usuarioForm.reset({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correoOrCodigo: usuario.correoOrCodigo,

      /*
       * La contraseña nunca se carga desde el backend.
       * Vacía significa conservar la contraseña actual.
       */
      password: '',

      departamentoId:
        usuario.departamentoId ?? '',

      estacionId: '',

      rolId:
        usuario.rolId ?? '',

      tipo:
        usuario.tipo
    }, {
      emitEvent: false
    });

    this.tipoSeleccionado.set(usuario.tipo);
    this.configurarCorreoOCodigo(usuario.tipo);
    
    this.showModal.set(true);

    if (usuario.departamentoId) {
      this.cargarEstaciones(
        usuario.departamentoId,
        usuario.estacionId
      );
    }
  }

  cerrarModal(): void {
    if (this.guardando()) {
      return;
    }

    this.showModal.set(false);
    this.usuarioSeleccionado.set(null);
    this.errorModal.set('');
    this.estaciones.set([]);

    this.usuarioForm.reset({
      nombre: '',
      apellido: '',
      correoOrCodigo: '',
      password: '',
      departamentoId: '',
      estacionId: '',
      rolId: '',
      tipo: 'Persona'
    }, {
      emitEvent: false
    });
  }

  private configurarPassword(
    requerida: boolean
  ): void {

    const passwordControl =
      this.usuarioForm.controls.password;

    passwordControl.clearValidators();

    if (requerida) {
      passwordControl.setValidators([
        Validators.required,
        Validators.minLength(6)
      ]);
    } else {
      /*
       * Durante la edición es opcional.
       * Si se escribe una nueva, debe tener 6 caracteres.
       */
      passwordControl.setValidators([
        Validators.minLength(6)
      ]);
    }

    passwordControl.updateValueAndValidity({
      emitEvent: false
    });
  }

  // =====================================================
  // GUARDAR
  // =====================================================

  guardarUsuario(): void {
    this.errorModal.set('');

    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();

      this.errorModal.set(
        'Complete correctamente los campos obligatorios.'
      );

      return;
    }

    const formValue =
      this.usuarioForm.getRawValue();

    const datosBase = {
      nombre:
        formValue.nombre.trim(),

      apellido:
        formValue.apellido.trim(),

      correoOrCodigo:
        formValue.correoOrCodigo.trim(),

      departamentoId:
        formValue.departamentoId,

      estacionId:
        formValue.estacionId || null,

      rolId:
        formValue.rolId,

      tipo:
        formValue.tipo
    };

    this.guardando.set(true);

    if (this.modoFormulario() === 'crear') {
      const request: UsuarioCreateRequest = {
        ...datosBase,
        password: formValue.password
      };

      this.crearUsuario(request);
      return;
    }

    const request: UsuarioUpdateRequest = {
      ...datosBase,

      /*
       * Vacío o null permite conservar
       * la contraseña anterior.
       */
      password:
        formValue.password.trim() || null
    };

    this.actualizarUsuario(request);
  }

  private crearUsuario(
    request: UsuarioCreateRequest
  ): void {

    this.usuarioService.create(request)
      .pipe(
        finalize(() => {
          this.guardando.set(false);
        })
      )
      .subscribe({
        next: usuarioCreado => {
          if (!usuarioCreado) {
            this.errorModal.set(
              'No se pudo crear el usuario. El correo o código puede estar registrado.'
            );

            return;
          }

          this.usuarios.update(
            usuariosActuales => [
              ...usuariosActuales,
              usuarioCreado
            ]
          );

          setTimeout(() => {
            this.cerrarModal();

            this.mostrarMensaje(
              'Usuario creado correctamente.'
            );
          }, 0);
        },
        error: error => {
          console.error(
            'Error al crear usuario:',
            error
          );

          this.errorModal.set(
            'Ocurrió un error al crear el usuario.'
          );
        }
      });
  }

  private actualizarUsuario(
    request: UsuarioUpdateRequest
  ): void {

    const usuario =
      this.usuarioSeleccionado();

    if (!usuario?.id) {
      this.guardando.set(false);

      this.errorModal.set(
        'No se encontró el usuario seleccionado.'
      );

      return;
    }

    this.usuarioService
      .update(usuario.id, request)
      .pipe(
        finalize(() => {
          this.guardando.set(false);
        })
      )
      .subscribe({
        next: usuarioActualizado => {
          if (!usuarioActualizado) {
            this.errorModal.set(
              'No se pudo actualizar el usuario. Revise los datos seleccionados.'
            );

            return;
          }

          this.usuarios.update(
            usuariosActuales =>
              usuariosActuales.map(item =>
                item.id === usuarioActualizado.id
                  ? usuarioActualizado
                  : item
              )
          );

          setTimeout(() => {
            this.cerrarModal();

            this.mostrarMensaje(
              'Usuario actualizado correctamente.'
            );
          }, 0);
        },
        error: error => {
          console.error(
            'Error al actualizar usuario:',
            error
          );

          this.errorModal.set(
            'Ocurrió un error al actualizar el usuario.'
          );
        }
      });
  }

  // =====================================================
  // ELIMINAR
  // =====================================================

  eliminarUsuario(
    usuario: UsuarioResponse
  ): void {

    const nombreCompleto =
      `${usuario.nombre} ${usuario.apellido}`;

    const confirmar = window.confirm(
      `¿Está seguro de eliminar al usuario "${nombreCompleto}"?`
    );

    if (!confirmar) {
      return;
    }

    this.usuarioService
      .delete(usuario.id)
      .subscribe({
        next: eliminado => {
          if (!eliminado) {
            this.errorPagina.set(
              'No se encontró el usuario que desea eliminar.'
            );

            return;
          }

          this.usuarios.update(
            usuariosActuales =>
              usuariosActuales.filter(
                item => item.id !== usuario.id
              )
          );

          this.mostrarMensaje(
            'Usuario eliminado correctamente.'
          );
        },
        error: error => {
          console.error(
            'Error al eliminar usuario:',
            error
          );

          this.errorPagina.set(
            'No se pudo eliminar el usuario.'
          );
        }
      });
  }

  // =====================================================
  // ACCIONES DE TABLA
  // =====================================================

  onTableAction(event: {
    action: string;
    row: UsuarioResponse;
  }): void {

    if (event.action === 'edit') {
      this.abrirModalEdicion(event.row);
      return;
    }

    if (event.action === 'delete') {
      this.eliminarUsuario(event.row);
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
    mensaje: string
  ): void {

    this.mensaje.set(mensaje);
    this.errorPagina.set('');

    setTimeout(() => {
      this.mensaje.set('');
    }, 3000);
  }

  get tituloModal(): string {
    return this.modoFormulario() === 'crear'
      ? 'Registrar usuario'
      : 'Editar usuario';
  }

  get textoBotonGuardar(): string {
    if (this.guardando()) {
      return 'Guardando...';
    }

    return this.modoFormulario() === 'crear'
      ? 'Crear usuario'
      : 'Actualizar usuario';
  }

  get editando(): boolean {
    return this.modoFormulario() === 'editar';
  }



  private configurarCorreoOCodigo(tipo: UsuarioTipo): void {
    const control = this.usuarioForm.controls.correoOrCodigo;

    control.clearValidators();

    if (tipo === 'Componente') {
      // Código: solo requerido, sin formato de correo
      control.setValidators([
        Validators.required,
        Validators.maxLength(150)
      ]);
    } else {
      // Persona / Entidad: debe ser un correo válido
      control.setValidators([
        Validators.required,
        Validators.maxLength(150),
        Validators.email
      ]);
    }

    control.updateValueAndValidity({ emitEvent: false });
  }
}
