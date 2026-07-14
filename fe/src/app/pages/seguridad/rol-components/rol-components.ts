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

import { finalize } from 'rxjs';
import { TableColumn, TableCustomComponent } from '../../../components/table-custom/table-custom';
import { ModalComponent } from '../../../components/modal-component/modal-component';
import { RolRequest, RolResponse, RolService } from '../../../service/seguridad/rol-service';

import { Router } from '@angular/router';

type FormMode = 'create' | 'edit';

@Component({
  selector: 'app-rol-components',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ModalComponent,
    TableCustomComponent
],
  templateUrl: './rol-components.html',
  styleUrl: './rol-components.css',
})
export class RolComponents implements OnInit {

  private readonly router = inject(Router);
  private readonly rolService = inject(RolService);
  private readonly formBuilder = inject(FormBuilder);

  // Tabla
  roles = signal<RolResponse[]>([]);
  loading = signal<boolean>(false);

  columnasRoles: TableColumn[] = [
    {
      key: 'codigo',
      label: 'Código'
    },
    {
      key: 'nombre',
      label: 'Nombre'
    },
    {
      key: 'descripcion',
      label: 'Descripción'
    }
  ];

  actions = [
    {
      key: 'permisos',
      label: 'Permisos',
      class: 'btn btn-sm btn-yellow'
    },
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

  // Modal y formulario
  showModal = signal<boolean>(false);
  formMode = signal<FormMode>('create');
  rolSeleccionado = signal<RolResponse | null>(null);
  guardando = signal<boolean>(false);

  mensaje = signal<string>('');
  mensajeError = signal<string>('');

  rolForm = this.formBuilder.nonNullable.group({
    codigo: [
      '',
      [
        Validators.required,
        Validators.maxLength(100)
      ]
    ],
    nombre: [
      '',
      [
        Validators.required
      ]
    ],
    descripcion: ['']
  });

  ngOnInit(): void {
    this.recargarRoles();
  }

  recargarRoles(): void {
    this.loading.set(true);
    this.mensajeError.set('');

    this.rolService.getAll()
      .pipe(
        finalize(() => {
          this.loading.set(false);
        })
      )
      .subscribe({
        next: (roles) => {
          this.roles.set(roles ?? []);
        },
        error: (error) => {
          console.error('Error al obtener los roles', error);

          this.mensajeError.set(
            'No se pudieron cargar los roles.'
          );
        }
      });
  }

  abrirModalCreacion(): void {
    this.formMode.set('create');
    this.rolSeleccionado.set(null);

    this.rolForm.reset({
      codigo: '',
      nombre: '',
      descripcion: ''
    });

    this.limpiarMensajes();
    this.showModal.set(true);
  }

  abrirModalEdicion(rol: RolResponse): void {
    this.formMode.set('edit');
    this.rolSeleccionado.set(rol);

    this.rolForm.reset({
      codigo: rol.codigo,
      nombre: rol.nombre,
      descripcion: rol.descripcion ?? ''
    });

    this.limpiarMensajes();
    this.showModal.set(true);
  }

  cerrarModal(): void {
    if (this.guardando()) {
      return;
    }

    this.showModal.set(false);
    this.rolSeleccionado.set(null);

    this.rolForm.reset({
      codigo: '',
      nombre: '',
      descripcion: ''
    });

    this.limpiarMensajes();
  }

  guardarRol(): void {
    this.limpiarMensajes();

    if (this.rolForm.invalid) {
      this.rolForm.markAllAsTouched();

      this.mensajeError.set(
        'Complete correctamente los campos obligatorios.'
      );

      return;
    }

    const formValue = this.rolForm.getRawValue();

    const rolRequest: RolRequest = {
      codigo: formValue.codigo.trim().toUpperCase(),
      nombre: formValue.nombre.trim(),
      descripcion: formValue.descripcion.trim() || null
    };

    this.guardando.set(true);

    if (this.formMode() === 'create') {
      this.crearRol(rolRequest);
      return;
    }

    this.actualizarRol(rolRequest);
  }

  private crearRol(rolRequest: RolRequest): void {
    this.rolService.create(rolRequest)
      .pipe(
        finalize(() => {
          this.guardando.set(false);
        })
      )
      .subscribe({
        next: (rolCreado) => {
          if (rolCreado === null) {
            this.mensajeError.set(
              'Ya existe un rol con ese código.'
            );

            return;
          }

          this.roles.update((rolesActuales) => [
            ...rolesActuales,
            rolCreado
          ]);

          this.mensaje.set('Rol creado correctamente.');

          setTimeout(() => {
            this.cerrarModal();
          }, 500);
        },
        error: (error) => {
          console.error('Error al crear el rol', error);

          this.mensajeError.set(
            'Ocurrió un error al crear el rol.'
          );
        }
      });
  }

  private actualizarRol(rolRequest: RolRequest): void {
    const rol = this.rolSeleccionado();

    if (!rol?.id) {
      this.guardando.set(false);

      this.mensajeError.set(
        'No se encontró el rol seleccionado.'
      );

      return;
    }

    this.rolService.update(rol.id, rolRequest)
      .pipe(
        finalize(() => {
          this.guardando.set(false);
        })
      )
      .subscribe({
        next: (rolActualizado) => {
          if (rolActualizado === null) {
            this.mensajeError.set(
              'El rol no existe o el código ya está registrado.'
            );

            return;
          }

          this.roles.update((rolesActuales) =>
            rolesActuales.map((item) =>
              item.id === rolActualizado.id
                ? rolActualizado
                : item
            )
          );

          this.mensaje.set('Rol actualizado correctamente.');

          setTimeout(() => {
            this.cerrarModal();
          }, 500);
        },
        error: (error) => {
          console.error('Error al actualizar el rol', error);

          this.mensajeError.set(
            'Ocurrió un error al actualizar el rol.'
          );
        }
      });
  }

  eliminarRol(rol: RolResponse): void {
    const confirmar = window.confirm(
      `¿Está seguro de eliminar el rol "${rol.nombre}"?`
    );

    if (!confirmar) {
      return;
    }

    this.rolService.delete(rol.id).subscribe({
      next: (eliminado) => {
        if (!eliminado) {
          this.mensajeError.set(
            'No se encontró el rol que desea eliminar.'
          );

          return;
        }

        this.roles.update((rolesActuales) =>
          rolesActuales.filter((item) => item.id !== rol.id)
        );

        this.mensaje.set('Rol eliminado correctamente.');

        setTimeout(() => {
          this.mensaje.set('');
        }, 2500);
      },
      error: (error) => {
        console.error('Error al eliminar el rol', error);

        this.mensajeError.set(
          'No se pudo eliminar el rol. Puede estar asignado a un usuario.'
        );
      }
    });
  }

  onTableAction(event: {
    action: string;
    row: RolResponse;
  }): void {

    if (event.action === 'permisos') {
      this.abrirPermisos(event.row);
      return;
    }

    if (event.action === 'edit') {
      this.abrirModalEdicion(event.row);
      return;
    }

    if (event.action === 'delete') {
      this.eliminarRol(event.row);
    }
  }

  abrirPermisos(rol: RolResponse): void {

    if (!rol.id) {
      console.error('El rol no tiene un ID válido');
      return;
    }
    console.log(`roles/${rol.id}/permisos`)
    this.router.navigate([
      'seguridad/roles',
      rol.id,
      'permisos'
    ]);
  }

  limpiarMensajes(): void {
    this.mensaje.set('');
    this.mensajeError.set('');
  }

  get tituloModal(): string {
    return this.formMode() === 'create'
      ? 'Registrar rol'
      : 'Editar rol';
  }

  get textoBotonGuardar(): string {
    if (this.guardando()) {
      return 'Guardando...';
    }

    return this.formMode() === 'create'
      ? 'Crear rol'
      : 'Actualizar rol';
  }
}
