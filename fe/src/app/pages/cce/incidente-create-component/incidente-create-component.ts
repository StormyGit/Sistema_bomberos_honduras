import { point, estaciones, Recurso } from './../../../types/cce/incidente.interface';
import { User } from './../../../auth/auth.interface.ts';
import { Component, inject, NgZone, OnInit, signal, ViewChild } from '@angular/core';
import { TableColumn, TableCustomComponent } from "../../../components/table-custom/table-custom"
import { CardComponent } from "../../../components/card-component/card-component";
import { ModalComponent } from "../../../components/modal-component/modal-component";
import { WizardComponent } from "../../../components/wizard-component/wizard-component";
import { WizardStepComponent } from '../../../components/wizard-step-component/wizard-step-component';
import { FormComponent } from "../../../components/form-component/form-component";
import { DataFormService } from '../../../utils/data-form-service';
import { EstacionCercana, MapPickerComponent, MapPoint } from "../../../components/map-picker/map-picker";
import { IncidenteInfoComponents } from "../../components/incidente-info-components/incidente-info-components";
import { BadgeComponent } from "../../../components/badge-component/badge-component";
import { incidente, IncidenteEstado, Tiempo, TiempoTipo } from '../../../types/cce/incidente.interface';
import { IncidenteService } from '../services/incidente-service';
import { AuthServiceService } from '../../../auth/authService.service';
import { IncidenteTiempoComponent } from "../../components/incidente-tiempo-component/incidente-tiempo-component";
import { Router } from '@angular/router';
import { CatalogoLugaresServices } from '../../../service/catalogo-lugares-services';
import { ToastService } from '../../../components/toast-service';
import { UnidadService } from '../../../service/unidad-service';



@Component({
  selector: 'app-incidente-create-component',
  imports: [CardComponent, TableCustomComponent, ModalComponent, WizardComponent, WizardStepComponent, FormComponent, IncidenteInfoComponents, BadgeComponent, IncidenteTiempoComponent, MapPickerComponent],
  templateUrl: './incidente-create-component.html',
  styleUrl: './incidente-create-component.css',
})
export class IncidenteCreateComponent implements OnInit {
  @ViewChild(WizardComponent)
  wizard!: WizardComponent;

  @ViewChild('formCreate') formCreate!: FormComponent;
  @ViewChild('formInfo') formInfo!: FormComponent;

  @ViewChild('mapa_detalle')
  mapaDetalle!: MapPickerComponent;

  // servicios
  svrIncidente    = inject(IncidenteService);
  svrCatalogo     = inject(CatalogoLugaresServices);
  svrUnidad     = inject(UnidadService);
  svFormData      = inject(DataFormService);
  scrAuth         = inject(AuthServiceService);
  private scrToast = inject(ToastService);
  private zone = inject(NgZone);

  router =
    inject(Router);
  User            = signal<User | null>(this.scrAuth.getUser);

  //data Table
  tableList = signal<any[]>([]);
  columnasUsuarios: TableColumn[] = [
    { key: 'estado', label: 'Estado', type: 'badge' },
    { key: 'colonia', label: 'Lugar' },
    { key: 'incidente', label: 'Incidente' },
    { key: 'fecha', label: 'Fecha' },
    { key: 'departamento', label: 'Departamento' },
  ];
  incidente_selection : incidente | null  = null;
  horaRecarga: string = '';

  mostrarTimers: boolean = false;


  // modales
  showModal = signal<boolean>(false);
  incidente_create    : incidente | null  = null;
  timer_index = signal<number>(-1);

incidente_reset(): void {
  this.incidente_create = null;
  this.timer_index.set(-1);
  this.mostrarTimers = false;
  this.tiemposPorTipo = {};
  this.formCreate?.resetForm();   // <-- nuevo
  this.formInfo?.resetForm();   // <-- nuevo
  this.cambiarPasoWizard(0);
  this.recargarList();
}

  abrirModal_creacion() {
    this.showModal.set(true);
  }

  cerrarModal_creacion() {
    console.log("g");
    this.showModal.set(false);
    this.incidente_reset();
  }

  guardarWizard() {
    console.log('Wizard finalizado');
    this.cerrarModal_creacion();
  }

  private cambiarPasoWizard(index: number): void {
    setTimeout(() => {
      this.wizard.setActiveStep(index);
    }, 0);
  }

  submitForm_info(data: iFormEmit) {
    if (!data.status) {
      return;
    }
    const newData = this.removeEmptyValues(data.data);


    this.incidente_create = {
      ...(this.incidente_create ?? {}),
      ...newData
    };

    this.incidente_create.departamento = this.User()?.region;
    this.incidente_create.estado = IncidenteEstado.Pendiente;
    console.log(":->",newData)
    console.log(":->",this.incidente_create);



    this.svrIncidente.create(this.incidente_create).subscribe({
      next: (res) => {
        console.log(res);
        this.incidente_create = {...res}; // <- actualizar el incidente
        console.log('incidente_create:', this.incidente_create);
        this.cambiarPasoWizard(1);
        this.recargarList();
      },
      error: (err) => {
        console.error('Error al obtener incidentes', err);
      }
    });

  }
  cambiosForm_info(data: any){
    console.log(data);
    if (data.name === 'isAnonimo'){
      if (data.value === true){
        this.formInfo.setFieldValue( 'denuncianteNombre', "anonimo" );
        this.formInfo.setFieldDisabled( 'denuncianteNombre', true );
      }else{
        this.formInfo.setFieldValue( 'denuncianteNombre', "" );
        this.formInfo.setFieldDisabled( 'denuncianteNombre', false );
      }
    }

  }

cambiosForm_despacho(data: {
  name: string;
  value: string | null;
}): void {

  if (data.name !== 'idEstacion') {
    return;
  }

  // Limpia las unidades cuando no hay estación seleccionada.
  if (!data.value) {
    this.formCreate.setFieldOptions(
      'idUnidad',
      [],
      false
    );

    return;
  }

  // true = cargar solamente unidades disponibles.
  this.svrUnidad
    .getByEstacion(data.value, true)
    .subscribe({
      next: unidades => {
        const opciones = unidades
        .filter(unidad => unidad.id)
        .map(unidad => ({
          label: unidad.nombre,
          value: unidad.id as string
        }));

        console.log("ops: ", opciones)
        this.formCreate.setFieldOptions(
          'idUnidad',
          opciones,
          false
        );
      },

      error: error => {
        console.error(
          'Error al obtener las unidades:',
          error
        );

        this.formCreate.setFieldOptions(
          'idUnidad',
          [],
          false
        );
      }
    });
}

  submitForm_despacho(data: iFormEmit) {
    if (!data.status) {
      return;
    }
    const newData = this.removeEmptyValues(data.data);
    if (!this.incidente_create?.id){
      console.log("no ay punto o id")
      return;
    }
    if (!this.incidente_create?.punto){
      console.log("no ay punto o id")
      return;
    }

    newData["point"] = this.incidente_create.punto;

    this.incidente_create.estado = IncidenteEstado.Ejecucion;

    console.log(newData);

    this.svrIncidente.addRecurso(this.incidente_create.id ?? '', newData).subscribe({
      next: (res) => {

        this.recargarList();

        setTimeout(() => {
          this.timer_index.set(2);
          this.cambiarPasoWizard(2);
        }, 0);
        setTimeout(()=>{this.mostrarTimers = true;}
        ,10
        )
      },
      error: (err) => {
        console.error('Error al obtener incidentes', err);
      }
    });

  }

  submitForm_seguimineto(data: iFormEmit) {
    console.log(data);

    if (!data.status) return;

    // if (this.timer_index() !== 6) {
    //   console.log("ingrea los tiempos");
    //   return
    // }

    const cleanData = this.removeEmptyValues(data.data);

    if (!this.incidente_create?.id) {
      console.log("no hay id del incidente");
      return;
    }

    const formData = new FormData();

    formData.append("idIncidente", this.incidente_create.id);

    if (cleanData["image_1"]) {
      formData.append("image1", cleanData["image_1"]);
    }

    if (cleanData["image_2"]) {
      formData.append("image2", cleanData["image_2"]);
    }

    if (cleanData["image_3"]) {
      formData.append("image3", cleanData["image_3"]);
    }

    formData.append("observacionGeneral", cleanData["observacionGeneral"]);
    formData.append("falsaAlarma", cleanData["isFalsaAlarma"]);
    console.log("data: ", cleanData)
    console.log("formdata: ",formData.values());



    this.svrIncidente.addEvidencia(formData).subscribe({
      next: () => {
        console.log('Evidencia guardada');
        console.log('Voy a cerrar modal');

        this.cerrarModal_creacion();
        this.recargarList();

        console.log('Ya llamé cerrarModal_creacion');
      },
      error: (err) => console.error('Error al guardar evidencia', err)
    });
  }




  ngOnInit(): void {
    this.recargarList();
  }

  recargarList(): void {
    this.svrIncidente.getAll().subscribe({
      next: (res) => {
        console.log(res);
        this.tableList.set([...(res ?? [])]);
      },
      error: (err) => {
        console.error('Error al obtener incidentes', err);
      }
    });
  }

onPointSelected(point: {crs: string; type: string; cordenadas: { lat: number; lng: number }}): void {
  console.log('PUNTO RECIBIDO EN PADRE:', point);

  this.incidente_create = {
    ...(this.incidente_create ?? {}),
    punto: JSON.stringify(point)
  };

  console.log('incidente_create:', this.incidente_create);
}







estaciones_cercanas(data: EstacionCercana[]) {
  console.log("estaciones cercanas: ", data);

  const listEstaciones = data.map(item => item.estacion);

  this.formCreate.setFieldOptions(
    'idEstacion',[
      ...listEstaciones.map(m => ({ label: m.nombre, value: m.id }))
    ],
    true
  );

  console.log("solo estaciones: ", listEstaciones);
}





getListEjecucion() {
  return this.tableList().filter((item: any) => item.estado === 'Ejecucion');
}

getCountByStatus(status: string): number {
  return this.tableList().filter((item: any) => item.estado === status).length;
}

actions = [
  {
    key: 'view',
    label: 'Ver',
    class: 'btn btn-sm btn-blue'
  }
];

listTimer = [
  {
    key: TiempoTipo.Reporte,
    title: 'Hora de reporte',
    description: 'Momento en que se recibe el incidente',
    index:0
  },
  {
    key: TiempoTipo.Despacho,
    title: 'Hora de despacho',
    description: 'Momento en que se asigna la unidad',
    index:1
  },
  {
    key: TiempoTipo.SalidaEstacion,
    title: 'Salida de estación',
    description: 'Unidad sale hacia el lugar',
    index:2
  },
  {
    key: TiempoTipo.Llegada,
    title: 'Llegada al lugar',
    description: 'Unidad llega a la escena',
    index:3
  },
  {
    key: TiempoTipo.Controlado,
    title: 'Incidente controlado',
    description: 'La emergencia queda bajo control',
    index:4
  },
  {
    key: TiempoTipo.Finalizacion,
    title: 'Finalización',
    description: 'Cierre operativo del incidente',
    index:5
  }
];


showModal_detalles: boolean = false;

  tiemposPorTipo: Partial<Record<TiempoTipo, Tiempo | null>> = {};
  guardarTiempo(event: { tipo: TiempoTipo | null; tiempo: Tiempo | null }): void {
    if (!event.tipo) return;

    this.tiemposPorTipo[event.tipo] = event.tiempo;

    setTimeout(() => {
      this.tiempoTotalEjecucionTexto = this.calcularTiempoTotalEjecucionTexto();
    }, 0);
  }

  calcularTiempoTotalEjecucionTexto(): string {
    const inicio = this.tiemposPorTipo[TiempoTipo.Reporte];
    const fin = this.tiemposPorTipo[TiempoTipo.Finalizacion];

    if (!inicio?.horaCreacion || !fin?.horaCreacion) {
      return '';
    }

    const fechaInicio = new Date(inicio.horaCreacion).getTime();
    const fechaFin = new Date(fin.horaCreacion).getTime();

    if (isNaN(fechaInicio) || isNaN(fechaFin)) {
      return '';
    }

    const totalMs = fechaFin - fechaInicio;

    if (totalMs < 0) {
      return '';
    }

    const totalSegundos = Math.floor(totalMs / 1000);

    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segundos = totalSegundos % 60;

    return `${this.pad(horas)}:${this.pad(minutos)}:${this.pad(segundos)}`;
  }

  get tiempoTotalEjecucionMs(): number | null {

    const inicio = this.tiemposPorTipo[TiempoTipo.Reporte];
    const fin = this.tiemposPorTipo[TiempoTipo.Finalizacion];

    if (!inicio?.horaCreacion || !fin?.horaCreacion) {
      return null;
    }

    const fechaInicio = new Date(inicio.horaCreacion).getTime();
    const fechaFin = new Date(fin.horaCreacion).getTime();

    if (isNaN(fechaInicio) || isNaN(fechaFin)) {
      return null;
    }

    return fechaFin - fechaInicio;
  }

  tiempoTotalEjecucionTexto = "";

  private pad(valor: number): string {
    return valor.toString().padStart(2, '0');
  }



  sumaContador(): void {
    console.log("sube contador: ", this.timer_index());

    this.timer_index.update(valor => valor + 1);

    console.log("ya subio: ", this.timer_index());
  }

  abrirModal_detalles(row: any) {

    console.log(row.estado);
    if (row.estado !== "Finalizado" && row.estado !== "Cancelado" ) return;

    this.incidente_selection = {
      ...row
    };



    // let json = null;
    // if (this.incidente_selection?.point){
    //   json = JSON.parse(this.incidente_selection?.point);
    //   //this.mapaDetalle.pointDefault = json;
    // }
    this.showModal_detalles = true;
    //console.log(json);
  }

cerrarModal_detalles() {
  this.showModal_detalles = false;
}






  private removeEmptyValues<T extends object>(obj: T): Partial<T> {
    const cleanObject: Partial<T> = {};

    Object.entries(obj).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        cleanObject[key as keyof T] = value as T[keyof T];
      }
    });

    return cleanObject;
  }


onTableAction(event: any): void {
  console.log(event.action);
  console.log(event.row);

  if (event.action === 'view') {
    this.verIncidente(event.row);
  }
}

// Decide qué modal abrir según el estado del incidente
verIncidente(row: any): void {
  if ((row.estado === 'Finalizado' && row.images.length > 0) || row.estado === 'Cancelado') {
    this.abrirModal_detalles(row);
    return;
  }

  // Pendiente o Ejecucion -> reabrir el wizard directo en tiempos/evidencia
  this.abrirModal_seguimiento(row);
}

abrirModal_seguimiento(row: any): void {
  this.incidente_create = { ...row };
  this.tiemposPorTipo = {};

  // Si el incidente ya trae tiempos guardados (ajusta "row.tiempos" al
  // nombre real del campo que te devuelve el backend), los restauramos
  // para saber en qué paso de la bitácora se quedó
  if (row.tiempos && Array.isArray(row.tiempos)) {
    row.tiempos.forEach((t: Tiempo) => {
      if (t.tipoTiempo) {
        this.tiemposPorTipo[t.tipoTiempo as TiempoTipo] = t;
      }
    });
  }
  let stepWizard = 2

  if (row.recursos.length === 0){
    stepWizard = 1;
  }

  this.tiempoTotalEjecucionTexto = this.calcularTiempoTotalEjecucionTexto();

  // Habilita el siguiente timer pendiente (o el primero si no hay ninguno)
  const completados = this.listTimer.filter(t => !!this.tiemposPorTipo[t.key]).length;
  this.timer_index.set(completados);
  this.mostrarTimers = true;

  this.showModal.set(true);
  this.cambiarPasoWizard(stepWizard); // índice 2 = "Bitacora y seguimiento"
}

async compartirPreliminar(data: incidente | null): Promise<void> {
  if (!data?.id) {
    console.error('El incidente no tiene ID');
    return;
  }

  const ruta = this.router.serializeUrl(
    this.router.createUrlTree(['/public', 'incidente', data.id])
  );
  const urlPublica = new URL(ruta, window.location.origin).href;
  const recurso = data.recursos?.[0];

  const texto = [
    'REPORTE PRELIMINAR',
    'CUERPO DE BOMBEROS DE HONDURAS',
    '',
    `FECHA: ${data.fecha ?? 'Pendiente'}`,
    `ESTADO: ${data.estado ?? 'Pendiente'}`,
    `INCIDENTE: ${data.incidente ?? 'Pendiente'}`,
    `DIRECCIÓN: ${data.direccion ?? data.colonia ?? 'Pendiente'}`,
    `UNIDAD: ${recurso?.unidad ?? 'Pendiente'}`,
    `AL MANDO: ${recurso?.oficialEncargado ?? 'Pendiente'}`,
    '',
    'CONSULTAR REPORTE:',
    urlPublica
  ].join('\n');

  try {
    await navigator.clipboard.writeText(texto);
    console.log('Reporte copiado al portapapeles');

    // 👇 esto es lo que corre fuera de la zona, hay que forzarlo de vuelta
    this.zone.run(() => {
      this.buttonPre_text.set('preliminar copiado!');
      this.buttonPre_disable.set(true);
      this.scrToast.info('Reporte preliminar copiado', 6000);

      setTimeout(() => {
        this.buttonPre_text.set('Copiar Preliminar');
        this.buttonPre_disable.set(false);
      }, 3000);
    });
  } catch (error) {
    console.error('No se pudo copiar el reporte:', error);
  }
}
buttonPre_text = signal<string>("Copiar Preliminar");
buttonPre_disable = signal<boolean>(false);
IrPreliminar(data: incidente | null){
  if (!data?.id) {
    console.error('El incidente no tiene ID');
    return;
  }
  this.router.navigate(['/public', 'incidente', data.id])

}


onSearchAutocomplete({ name, search }: { name: string; search: string }) {
  console.log({ name, search });

  this.svrCatalogo.buscarTiposIncidente(search).subscribe(resultados => {
    const options = resultados.map(r => ({ label: r.nombre, value: r.nombre }));
    this.formInfo.setFieldOptions(name, options, false);
  });
}


}
