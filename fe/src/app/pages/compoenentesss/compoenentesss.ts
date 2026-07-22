import {
  Component,
  inject,
  signal,
  ViewChild
} from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { ReportComponent } from '../../components/reporte-component/reporte-component';
import { FormComponent } from '../../components/form-component/form-component';
import { reporteIncendio, reporteRescate } from '../../mocks/formReportes';
import { IncidenteService } from '../cce/services/incidente-service';
import { incidente, reporteIncidente, Tiempo, TiempoTipo } from '../../types/cce/incidente.interface';
import { AuthServiceService } from '../../auth/authService.service';
import { User } from '../../auth/auth.interface.ts';
import { Location } from '@angular/common';

@Component({
  selector: 'app-compoenentesss',
  imports: [
    ReportComponent,
    FormComponent
  ],
  templateUrl: './compoenentesss.html',
  styleUrl: './compoenentesss.css'
})
export class Compoenentesss {

  /*
   * Usa ? porque al inicio todavía no existe.
   */
  @ViewChild('formReporte') formReporte?: FormComponent;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly svrIncidente = inject(IncidenteService);
  private readonly scrAuth = inject(AuthServiceService);
  readonly idIncidente = signal<string>('');
  readonly incidente = signal<incidente | null>(null);

  readonly User = signal<User | null>( this.scrAuth.getUser );

  reporteStructure = signal<iFormGroup>(reporteIncendio());
  reporteValues = signal<Record<string, any>>({});

  ngOnInit(): void {

    const id = this.route.snapshot.paramMap.get('idincidente');

    if (!id) {
      console.error( 'No se recibió el ID del incidente');
      return;
    }

    this.idIncidente.set(id);

    console.log( 'ID del incidente:', this.idIncidente() );


    this.svrIncidente.getById(id).subscribe({
        next: (res) => {
          this.incidente.set(res);
          console.log( 'Incidente:', this.incidente());
          this.setStructure(this.incidente() ?? null);
          //this.reporteStructure.set(reporteRescate());

          setTimeout(() => { this.setDataForm(); }, 0);
        },
        error: (error) => {
          this.incidente.set(null);
          console.error( 'Error obteniendo incidente:', error );
        }
      });


    this.svrIncidente.getReporteIncidente(id).subscribe({
      next: res => this.cargarValoresReporte(res.dataForm),
      error: error => console.error('Error:', error)
    });


  }

  setDataForm(): void {

    const form = this.formReporte;
    const incidenteActual = this.incidente();

    if (!form || !incidenteActual) return;

    const lugar   = incidenteActual.departamento;
    const denu_nombre  = incidenteActual.denuncianteNombre;
    const denu_telefo  = incidenteActual.denuncianteTelefono;
    const horaServicio  = incidenteActual.fechaCreacion;
    const claseIncendio  = incidenteActual.incidente;


    const tiempoFinalizacion = this.obtenerTiempoPorTipo( incidenteActual.tiempos, TiempoTipo.Finalizacion)?.horaCreacion?.split('T')[1].slice(0, 5);

    const estaciones  = this.formatearLista( incidenteActual.recursos, recurso => recurso.estacion );
    const Unidades    = this.formatearLista( incidenteActual.recursos, recurso => recurso.unidad );

    form.setFieldValue('lugar', lugar);
    form.setFieldValue('telefonoReportante', denu_telefo);
    form.setFieldValue('nombreReportante', denu_nombre);
    form.setFieldValue('horaServicio', horaServicio?.split('T')[1].slice(0, 5) );
    form.setFieldValue('claseIncendio', claseIncendio);
    form.setFieldValue('horaRegreso', tiempoFinalizacion);

    console.log( 'Datos colocados en el formulario' );
  }

  sudmit(data: any){
    console.log(data.data);
    const body: reporteIncidente = {
      idIncidente: this.idIncidente(),
      estructuraForm: JSON.stringify(this.reporteStructure()),
      dataForm: JSON.stringify(data.data)
    }
    this.svrIncidente.reporteIncidente(body).subscribe({
        next: (res) => {
          console.log( 'reporte: ', res);
          this.location.back();

        },
        error: (error) => {
          console.error( 'Error obteniendo reporte:', error );
        }
    });
  }


  setStructure(incidente: incidente | null){
    if (!incidente) return;

    switch(incidente.reportByIncidente){
      case "reporteIncendio":
        this.reporteStructure.set(reporteIncendio());
      break;

      default:
        this.reporteStructure.set(reporteRescate());
      break;
    }
  }
  // {
  //   value: 'reporteIncendio',
  //   label: 'Reporte de incendio'
  // },
  // {
  //   value: 'reporteRescate',
  //   label: 'Reporte de rescate'
  // }

  cargarDataForm(dataForm: string | null | undefined): void {
    const form = this.formReporte;

    if (!form || !dataForm) return;

    try {
      const datos = JSON.parse(dataForm) as Record<string, any>;

      Object.entries(datos).forEach(([campo, valor]) => {
        form.setFieldValue(campo, valor);
      });

      console.log('Datos del reporte cargados:', datos);
    } catch (error) {
      console.error('El dataForm no contiene un JSON válido:', error);
    }
  }

  cargarValoresReporte(dataForm: string | Record<string, any> | null | undefined): void {
    try {
      const valores = typeof dataForm === 'string' ? JSON.parse(dataForm) : dataForm ?? {};

      this.reporteValues.set(valores);
      this.cargarDataForm(dataForm as string);

      console.log('Valores cargados:', valores);
    } catch (error) {
      this.reporteValues.set({});
      console.error('dataForm no contiene un JSON válido:', error);
    }
  }

  formatearLista<T>(
    elementos: T[] | null | undefined,
    obtenerValor: (elemento: T) => unknown,
    valorVacio: string = 'No disponible'
  ): string {

    const valores = (elementos ?? [])
      .map(obtenerValor)
      .filter(valor =>
        valor !== null &&
        valor !== undefined &&
        String(valor).trim() !== ''
      )
      .map(valor => String(valor).trim());

    if (valores.length === 0) {
      return valorVacio;
    }

    if (valores.length === 1) {
      return valores[0];
    }

    if (valores.length === 2) {
      return `${valores[0]} y ${valores[1]}`;
    }

    const ultimo = valores.pop();

    return `${valores.join(', ')} y ${ultimo}`;
  }

  obtenerTiempoPorTipo(
    tiempos: Tiempo[] | null | undefined,
    tipo: TiempoTipo
  ): Tiempo | null {

    return tiempos?.find(
      tiempo => tiempo.tipoTiempo === tipo
    ) ?? null;
  }
}
