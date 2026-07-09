import { point, estaciones } from './../../../types/cce/incidente.interface';
import { User } from './../../../auth/auth.interface.ts';
import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
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

  @ViewChild('mapa_detalle')
  mapaDetalle!: MapPickerComponent;

  // servicios
  svrIncidente    = inject(IncidenteService);
  svFormData      = inject(DataFormService);
  scrAuth         = inject(AuthServiceService);
  User            = signal<User>(this.scrAuth.getUser);

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
    this.cambiarPasoWizard(0);
  }

  abrirModal_creacion() {
    this.showModal.set(true);
  }

  cerrarModal_creacion() {
    console.log("g");
    setTimeout(() => {
      this.incidente_reset();
      this.showModal.set(false);
    }, 200);
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

    this.incidente_create.departamento = this.User().region;
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
    if (!data.status) return;
    if (this.timer_index() !== 6) {
      console.log("ingrea los tiempos");
      return
    }

    const cleanData = this.removeEmptyValues(data.data);

    if (!this.incidente_create?.id) {
      console.log("no hay id del incidente");
      return;
    }
    console.log(cleanData)
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
    console.log(formData.values);



    this.svrIncidente.addEvidencia(formData).subscribe({
      next: () => {
        console.log('Evidencia guardada');
        console.log('Voy a cerrar modal');

        this.cerrarModal_creacion();

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
    false
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
  /*,
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
    */
];
onTableAction(event: any): void {
  console.log(event.action);
  console.log(event.row);

  if (event.action === 'view') {
    this.abrirModal_detalles(event.row);
  }
}

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
    if (row.estado !== "Finalizado") return;

    this.incidente_selection = {
      ...row
    };



    let json = null;
    if (this.incidente_selection?.point){
      json = JSON.parse(this.incidente_selection?.point);
      this.mapaDetalle.pointDefault = json;
    }
    this.showModal_detalles = true;
    console.log(json);
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
}
