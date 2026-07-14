import { inject, Injectable, signal } from '@angular/core';
import { incidentes_list } from '../types/cce/incidente.interface';
import { User } from '../auth/auth.interface.ts';
import { AuthServiceService } from '../auth/authService.service';
import { CatalogoLugaresServices } from '../service/catalogo-lugares-services';

@Injectable({
  providedIn: 'root',
})
export class DataFormService {


  private svrCatalogo = inject(CatalogoLugaresServices);

  scrAuth = inject(AuthServiceService);
  User = signal<User | null>(this.scrAuth.getUser);

  private listEstaciones: { label: string; value: string }[] = [];
  private cargandoEstaciones = false;
  private estacionesCargadas = false;



  public login(): iFormGroup {
    return {
      seccions: [
        {
          title: 'login',
          showTitle: false,
          field: [
            { label: 'Correo', type: 'email', name: 'email', w: 1, placeholder: 'Correo@gmail.com', required: true },
            { label: 'Contraseña', type: 'text', name: 'password', w: 1, required: true }
          ]
        }
      ]
    };
  }

  public filtrosIncidentes(): iFormGroup {
    return {
      seccions: [
        {
          title: 'Filtrar por Fechas',
          showTitle: true,
          w:6,
          field: [
            { label: 'fecha Inicio (00:00)', type: 'date', name: 'fecha_Inicio', w: 1, required: false },
            { label: 'fecha Final (23:59)', type: 'date', name: 'fecha_Final', w: 1, required: false }
          ]
        },
        {
          title: 'Filtrar por Palabra',
          showTitle: true,
          w:2,
          field: [
            { label: 'buscar', type: 'text', name: 'buscar', w: 1, required: false },
            { label: 'Tipo incidente', type: 'select', name: 'tipo', w: 2, required: false },
            { label: 'Estación', type: 'select', name: 'idEstacion', w: 2, required: false },

          ]
        },
        {
          title: 'Filtrar por Fechas',
          showTitle: false,
          w:3,
          field: [
            { label: 'solo Finalizados?', type: 'checkbox', name: 'isFinalizado', w: 1, required: false, value: true },
          ],
        },
      ]
    };
  }


  public incidente(type: 'info' | 'recursos' | 'seguimiento'): iFormGroup {


    const incidente_list = incidentes_list().map((incidente) => ({
      label: incidente.label,
      value: incidente.value,
    }));

    const ahora = new Date();
    const fechaActual = ahora.toISOString().split('T')[0];
    const horaActual = ahora.toTimeString().slice(0, 5);

    switch (type) {
      case 'info':
        return {
          seccions: [
            {
              title: 'Información del incidente',
              showTitle: true,
              w: 1,
              field: [
                { label: 'Incidente', type: 'autocomplete', name: 'incidente', w: 2, required: true, minChars:3, allowFreeText:true },
                { label: 'Ticket', type: 'text', name: 'ticket', w: 2, required: false },
                { label: 'Colonia / Barrio', type: 'text', name: 'colonia', w: 2, required: true },
                { label: 'Punto de referencia', type: 'text', name: 'referencia', w: 2, required: false },
                { label: 'Dirección', type: 'textarea', name: 'direccion', w: 1, required: true },
              ]
            },
            {
              title: 'Datos del denunciante',
              showTitle: true,
              w: 2,
              field: [
                { label: 'Nombre', type: 'text', name: 'denuncianteNombre', w: 1, required: true },
                { label: 'Teléfono', type: 'text', name: 'denuncianteTelefono', w: 1, required: true },
              ]
            },
            {
              title: 'Información de recepción',
              showTitle: true,
              w: 2,
              field: [
                { label: 'Operador', type: 'text', name: 'recepcionNombre', w: 1, required: true, value: this.User()?.nombre, readonly: true },
                { label: 'Hora y fecha', type: 'text', name: 'recepcion_fecha', w: 2, readonly: true, value: fechaActual + ' ' + horaActual },
                { label: 'Tipo', type: 'select', name: 'recepcionTipo', w: 2, required: true, option: [{ label: 'CCE', value: 'OPERADOR_CCE' }, { label: '911', value: 'OPERADOR_911' }] },
              ]
            }
          ]
        };

      case 'recursos':
        return {
          seccions: [
            {
              title: 'Asignación de recursos',
              showTitle: true,
              w: 1,
              field: [
                { label: 'Estación', type: 'select', name: 'idEstacion', w: 3, required: true, option: [{ label: 'Cuartel General', value: '07cc136b-2115-4fa2-8caa-dff35b2dcc1a' }] },
                { label: 'Unidades', type: 'text', name: 'unidad', w: 3, required: true, option: [{ label: 'Opción 1', value: 'opcion 1' }] },
                { label: 'Galones de agua', type: 'number', name: 'galonAgua', w: 3, required: true },
                { label: 'Encargado', type: 'text', name: 'oficialEncargado', w: 2, required: true },
                { label: 'Personal', type: 'number', name: 'numPersonal', w: 5, required: true },
              ]
            },
          ]
        };

      case 'seguimiento':
        return {
          seccions: [
            {
              title: 'Asignación de recursos',
              showTitle: false,
              w: 1,
              field: [
                { label: ' ', type: 'image', name: 'image_1', w: 3, required: false },
                { label: ' ', type: 'image', name: 'image_2', w: 3, required: false },
                { label: ' ', type: 'image', name: 'image_3', w: 3, required: false },
                { label: 'Observaciones', type: 'textarea', name: 'observacionGeneral', w: 1, required: true }
              ]
            },
          ]
        };
    }
  }
}
