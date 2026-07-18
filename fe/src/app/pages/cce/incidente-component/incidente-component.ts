import { Component, computed, inject, NgZone, OnInit, signal, ViewChild } from '@angular/core';
import { CardComponent } from "../../../components/card-component/card-component";
import { FormComponent } from "../../../components/form-component/form-component";
import { DataFormService } from '../../../utils/data-form-service';
import { incidente, incidentes_list, TipoResumen } from '../../../types/cce/incidente.interface';

import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import { TableColumn, TableCustomComponent } from "../../../components/table-custom/table-custom"
import { MapPickerComponent } from "../../../components/map-picker/map-picker";
import { CatalogoLugaresServices } from '../../../service/catalogo-lugares-services';
import { AuthServiceService } from '../../../auth/authService.service';
import { User } from '../../../auth/auth.interface.ts';
import { IncidenteService } from '../services/incidente-service';

import { BaseChartDirective } from 'ng2-charts';

import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  DoughnutController,
  ArcElement
} from 'chart.js';

import type {
  ChartConfiguration
} from 'chart.js';
import { IncidenteInfoComponents } from "../../components/incidente-info-components/incidente-info-components";
import { ModalComponent } from "../../../components/modal-component/modal-component";
import { Router } from '@angular/router';
import { ToastService } from '../../../components/toast-service';


export interface TipoMunicipioResumen {
  municipioId: string;
  municipio: string;
  tipoId: string;
  tipoNombre: string;
  total: number;
}

export interface IncidenteMunicipioItem {
  key: string;
  tipoId: string;
  tipoNombre: string;
  total: number;
}

export interface MunicipioIncidenteTablaRow {
  municipioId: string;
  municipio: string;
  total: number;
  totalTexto: string;
  incidentes: IncidenteMunicipioItem[];
}


export interface IncidenteInforme {
  id: number;
  status: 'pendiente' | 'Ejecucion' | 'finalizado' | 'cancelado';
  lugar: string;
  region: string;
  incidente: string;
  unidad: string;
  fecha: string;
  hora: string;
  lat: number;
  lng: number;
}

export interface MarkerInforme {
  key: string;
  lat: number;
  lng: number;
  lugar: string;
  region: string;
  total: number;
  incidentes: IncidenteInforme[];
  unidades: string[];
}


export interface MunicipioResumenTabla {
  key: string;
  municipioId: string;
  municipio: string;
  total: number;
  label: string;
}

export interface TipoMunicipioTablaRow {
  incidente: string;
  incidenteNombre: string;
  total: number;
  totalTexto: string;
  municipios: MunicipioResumenTabla[];
  columnas: MunicipioResumenTabla[][];
}

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend
);
export interface IncidenteEstadoResumen {
  finalizados: number;
  enEjecucion: number;
  falsasAlarmas: number;
}


@Component({
  selector: 'app-incidente-component',
  imports: [MatTableModule, MatPaginatorModule, CardComponent, FormComponent, TableCustomComponent, BaseChartDirective, IncidenteInfoComponents, ModalComponent],
  templateUrl: './incidente-component.html',
  styleUrl: './incidente-component.css',
})
export class IncidenteComponent implements OnInit {
  private scrToast = inject(ToastService);
  private zone = inject(NgZone);
  router = inject(Router);

  ngOnInit(): void {
    const fechaHoy = this.obtenerFechaHoy();
    console.log(fechaHoy);
    const filtros = {
      fecha_Inicio: fechaHoy,
      fecha_Final: fechaHoy,
      isFinalizado: true,
      buscar: null,
      tipoId: null,
      idEstacion: null
    };
    setTimeout(()=>{
          this.formRef.setFieldValue('fecha_Inicio',fechaHoy );
    this.formRef.setFieldValue('fecha_Final',fechaHoy );
    }, 200)
    this.searchIncidente(filtros);
  }
  private obtenerFechaHoy(): string {
    const hoy = new Date();

    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  svFormData      = inject(DataFormService);
  svrIncidente    = inject(IncidenteService);
  svCatalogo    = inject(CatalogoLugaresServices);
  scrAuth         = inject(AuthServiceService);
  User            = signal<User | null>(this.scrAuth.getUser);
  @ViewChild('formRef') formRef!: FormComponent;

  tipoResumenList = signal<TipoResumen[]>([]);
  tipoAndMunicipiosList = signal<TipoMunicipioResumen[]>([]);
  loading = signal(false);

  totalIncidentes = computed(() =>
    this.tipoResumenList().reduce((total, item) => total + Number(item.total || 0), 0)
  );

estadoResumen = signal<IncidenteEstadoResumen>({
  finalizados: 0,
  enEjecucion: 0,
  falsasAlarmas: 0
});

totalEstadoResumen = computed(() => {
  const resumen = this.estadoResumen();

  return (
    Number(resumen.finalizados || 0) +
    Number(resumen.enEjecucion || 0) +
    Number(resumen.falsasAlarmas || 0)
  );
});




    //data Table
  tableList = signal<any[]>([]);
  columnasUsuarios: TableColumn[] = [
    { key: 'estado', label: 'Estado', type: 'badge' },
    { key: 'colonia', label: 'Lugar' },
    { key: 'incidente', label: 'Incidente' },
    { key: 'fecha', label: 'Fecha' },
    { key: 'departamento', label: 'Departamento' },
  ];
  actions = [
    {
      key: 'view',
      label: 'Ver',
      class: 'btn btn-sm btn-blue'
    }
  ];



  onTableAction(event: any): void {
    console.log(event.action);
    console.log(event.row);

    if (event.action === 'view') {
      this.abrirModal_detalles(event.row);
    }
  }


  ngAfterViewInit() {
      this.svCatalogo.obtenerEstacionesPorDepartamento(null).subscribe(estaciones => {
        this.formRef.setFieldOptions(
          'idEstacion',[
            { label: 'Todos', value: null },
            ...estaciones.map(m => ({ label: m.nombre, value: m.id }))
          ],
          false
        );
      });
      this.formRef.setFieldOptions(
        'tipo',[
          { label: 'Todos', value: null },
          ...incidentes_list().map(m => ({ label: m.label, value: m.value }))
        ],
        false
      );
  }

onSubmit(event: any): void {
  const data = event?.data ?? {};
  console.log(data);
  const filtros = {
    buscar: data.buscar?.trim() || null,

    fecha_Inicio:
      data.fecha_Inicio || null,

    fecha_Final:
      data.fecha_Final || null,

    tipoId:
      data.tipoId ??
      data.tipo ??
      null,

    finalizado: data.isFinalizado ?? false,

    idEstacion:
      data.idEstacion ?? null
  };

  console.log('Filtros enviados:', filtros);

  this.searchIncidente(filtros);
}


searchIncidente(data: any): void {
  this.loading.set(true);

  this.svrIncidente
    .buscarIncidentes(data)
    .subscribe({
      next: res => {
        console.log(
          'Respuesta búsqueda:',
          res
        );

        this.tableList.set(
          [...(res.Incidentes ?? [])]
        );

        this.tipoResumenList.set(
          (res.TipoResumen ?? [])
            .map((item: TipoResumen) => ({
              ...item,
              total: Number(item.total ?? 0)
            }))
            .filter(
              (item: TipoResumen) =>
                item.total > 0
            )
        );

        this.tipoAndMunicipiosList.set(
          (res.tipoAndMunicipios ?? [])
            .map(
              (
                item: TipoMunicipioResumen
              ) => ({
                ...item,
                total: Number(
                  item.total ?? 0
                )
              })
            )
            .filter(
              (
                item: TipoMunicipioResumen
              ) => item.total > 0
            )
        );

        console.log(
          'Resumen municipios:',
          this.tipoAndMunicipiosList()
        );

        console.log(
          'Tabla agrupada:',
          this.tablaMunicipiosAndTipos()
        );
        const estadoResumen =
          res.incidenteEstadoResumenDTO ?? {};

        this.estadoResumen.set({
          finalizados: Number(
            estadoResumen.finalizados ?? 0
          ),

          enEjecucion: Number(
            estadoResumen.enEjecucion ?? 0
          ),

          falsasAlarmas: Number(
            estadoResumen.falsasAlarmas ?? 0
          )
        });
        this.loading.set(false);
      },

      error: err => {
        console.error(
          'Error al obtener incidentes',
          err
        );

        this.tableList.set([]);
        this.tipoResumenList.set([]);
        this.tipoAndMunicipiosList.set([]);
        this.estadoResumen.set({
          finalizados: 0,
          enEjecucion: 0,
          falsasAlarmas: 0
        });
        this.loading.set(false);
      }
    });
}


tablaMunicipiosAndTipos =
  computed<MunicipioIncidenteTablaRow[]>(() => {

    const agrupado =
      new Map<string, MunicipioIncidenteTablaRow>();

    for (const item of this.tipoAndMunicipiosList()) {

      const total = Number(item.total ?? 0);

      if (total <= 0) {
        continue;
      }

      const keyMunicipio =
        item.municipioId ||
        item.municipio ||
        'sin-municipio';

      let row = agrupado.get(keyMunicipio);

      if (!row) {
        row = {
          municipioId: item.municipioId,
          municipio: item.municipio || 'Sin municipio',
          total: 0,
          totalTexto: '00',
          incidentes: []
        };

        agrupado.set(keyMunicipio, row);
      }

      row.total += total;

      const incidenteExistente =
        row.incidentes.find(
          incidente =>
            incidente.tipoId === item.tipoId
        );

      if (incidenteExistente) {
        incidenteExistente.total += total;
      } else {
        row.incidentes.push({
          key: `${keyMunicipio}-${item.tipoId}`,
          tipoId: item.tipoId,
          tipoNombre:
            item.tipoNombre || 'Sin identificar',
          total
        });
      }
    }

    return Array.from(agrupado.values())
      .map(row => ({
        ...row,

        totalTexto:
          String(row.total).padStart(2, '0'),

        incidentes: [...row.incidentes].sort(
          (a, b) =>
            a.tipoNombre.localeCompare(
              b.tipoNombre,
              'es',
              {
                sensitivity: 'base'
              }
            )
        )
      }))
      .sort(
        (a, b) =>
          a.municipio.localeCompare(
            b.municipio,
            'es',
            {
              sensitivity: 'base'
            }
          )
      );
  });

private dividirEnColumnas<T>(items: T[], cantidadColumnas: number): T[][] {
  const columnas: T[][] = Array.from({ length: cantidadColumnas }, () => []);

  if (!items.length) {
    return columnas;
  }

  const tamanoColumna = Math.ceil(items.length / cantidadColumnas);

  for (let i = 0; i < cantidadColumnas; i++) {
    const inicio = i * tamanoColumna;
    const fin = inicio + tamanoColumna;

    columnas[i] = items.slice(inicio, fin);
  }

  return columnas;
}

private formatearTotalReporte(total: number): string {
  return String(total).padStart(2, '0');
}

barChartType: 'bar' = 'bar';

barChartData = computed<ChartConfiguration<'bar'>['data']>(() => {
  const resumenOrdenado = [...this.tipoResumenList()]
    .sort((a, b) => Number(b.total) - Number(a.total));

  return {
    labels: resumenOrdenado.map(item => item.nombre),

    datasets: [
      {
        label: 'Cantidad de incidentes',

        data: resumenOrdenado.map(item =>
          Number(item.total ?? 0)
        ),

        backgroundColor: 'rgba(239, 68, 68, 0.75)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
        borderRadius: 7,
        borderSkipped: false,
        barThickness: 25,
        maxBarThickness: 32
      }
    ]
  };
});

barChartOptions: ChartConfiguration<'bar'>['options'] = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y',

  plugins: {
    legend: {
      display: false
    },

    tooltip: {
      callbacks: {
        label: context => {
          const total = Number(context.raw ?? 0);

          return `${total} incidente${total === 1 ? '' : 's'}`;
        }
      }
    }
  },

  scales: {
    x: {
      beginAtZero: true,

      ticks: {
        stepSize: 1,
        precision: 0,
        color: '#cbd5e1'
      },

      grid: {
        color: 'rgba(148, 163, 184, 0.15)'
      }
    },

    y: {
      ticks: {
        color: '#f8fafc',
        autoSkip: false
      },

      grid: {
        display: false
      }
    }
  }
};



doughnutChartType: 'doughnut' = 'doughnut';

doughnutChartData =
  computed<ChartConfiguration<'doughnut'>['data']>(
    () => {

      const resumen = this.estadoResumen();

      return {
        labels: [
          'Finalizados',
          'En ejecución',
          'Falsas alarmas'
        ],

        datasets: [
          {
            label: 'Incidentes',

            data: [
              Number(resumen.finalizados ?? 0),
              Number(resumen.enEjecucion ?? 0),
              Number(resumen.falsasAlarmas ?? 0)
            ],

            backgroundColor: [
              'rgba(34, 197, 94, 0.85)',
              'rgba(249, 115, 22, 0.85)',
              'rgba(239, 68, 68, 0.85)'
            ],

            borderColor: '#0f151d',
            borderWidth: 4,
            hoverOffset: 10
          }
        ]
      };
    }
  );

doughnutChartOptions:
  ChartConfiguration<'doughnut'>['options'] = {

  responsive: true,
  maintainAspectRatio: false,
  cutout: '68%',

  plugins: {
    legend: {
      display: true,
      position: 'bottom',

      labels: {
        color: '#f8fafc',
        padding: 20,
        usePointStyle: true,
        pointStyle: 'circle',
        font: {
          size: 12,
          weight: 'bold'
        }
      }
    },

    tooltip: {
      callbacks: {
        label: context => {
          const label =
            context.label ?? 'Incidentes';

          const cantidad =
            Number(context.raw ?? 0);

          const datos =
            context.dataset.data ?? [];

          const total = datos.reduce(
            (acumulado, valor) =>
              acumulado + Number(valor ?? 0),
            0
          );

          const porcentaje =
            total > 0
              ? (
                  (cantidad / total) * 100
                ).toFixed(1)
              : '0.0';

          return `${label}: ${cantidad} (${porcentaje}%)`;
        }
      }
    }
  }
};


  incidente_selection : incidente | null  = null;
showModal_detalles: boolean = false;
cerrarModal_detalles() {
  this.showModal_detalles = false;
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
abrirModal_detalles(row: any) {

  //console.log(row.estado);
  //if (row.estado !== "Finalizado" && row.estado !== "Cancelado" ) return;

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

}
