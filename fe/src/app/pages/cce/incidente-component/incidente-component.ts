import { Component, computed, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CardComponent } from "../../../components/card-component/card-component";
import { FormComponent } from "../../../components/form-component/form-component";
import { DataFormService } from '../../../utils/data-form-service';
import { incidentes_list, TipoResumen } from '../../../types/cce/incidente.interface';

import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import { TableColumn, TableCustomComponent } from "../../../components/table-custom/table-custom"
import { MapPickerComponent } from "../../../components/map-picker/map-picker";
import { CatalogoLugaresServices } from '../../../service/catalogo-lugares-services';
import { AuthServiceService } from '../../../auth/authService.service';
import { User } from '../../../auth/auth.interface.ts';
import { IncidenteService } from '../services/incidente-service';
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

export interface TipoMunicipioResumen {
  municipioId: string;
  municipio: string;
  incidente: string;
  incidenteNombre: string;
  total: number;
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

export interface IncidenteMunicipioItem {
  key: string;
  incidente: string;
  incidenteNombre: string;
  total: number;
  label: string;
}

export interface MunicipioIncidenteTablaRow {
  municipioId: string;
  municipio: string;
  total: number;
  totalTexto: string;
  incidentes: IncidenteMunicipioItem[];
}


@Component({
  selector: 'app-incidente-component',
  imports: [MatTableModule, MatPaginatorModule, CardComponent, FormComponent, TableCustomComponent],
  templateUrl: './incidente-component.html',
  styleUrl: './incidente-component.css',
})
export class IncidenteComponent implements OnInit {
  ngOnInit(): void {
    const fechaHoy = this.obtenerFechaHoy();
    console.log(fechaHoy);
    const filtros = {
      fecha_Inicio: fechaHoy,
      fecha_Final: fechaHoy,
      isFinalizado:true,
      buscar: null,
      tipo: null,
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
  ]



  onTableAction(event: any): void {
    console.log(event.action);
    console.log(event.row);

    if (event.action === 'view') {
      //this.abrirModal_detalles(event.row);
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

  onSubmit(data: any){
    console.log(data)
    this.searchIncidente(data.data);
  }
searchIncidente(data: any): void {
  this.loading.set(true);

  this.svrIncidente.buscarIncidentes(data).subscribe({
    next: (res) => {
      console.log(res);

      this.tableList.set([...(res.Incidentes ?? [])]);

      this.tipoResumenList.set(
        (res.TipoResumen ?? []).filter(
          (item: TipoResumen) => Number(item.total) > 0
        )
      );

      this.tipoAndMunicipiosList.set(
        (res.tipoAndMunicipios ?? []).filter(
          (item: TipoMunicipioResumen) => Number(item.total) > 0
        )
      );

      this.loading.set(false);
    },
    error: (err) => {
      console.error('Error al obtener incidentes', err);

      this.tableList.set([]);
      this.tipoResumenList.set([]);
      this.tipoAndMunicipiosList.set([]);

      this.loading.set(false);
    }
  });
}
tablaMunicipiosAndTipos = computed<MunicipioIncidenteTablaRow[]>(() => {
  const agrupado = new Map<string, MunicipioIncidenteTablaRow>();

  for (const item of this.tipoAndMunicipiosList()) {
    const total = Number(item.total || 0);

    if (total <= 0) {
      continue;
    }

    const keyMunicipio = item.municipioId || item.municipio;

    if (!agrupado.has(keyMunicipio)) {
      agrupado.set(keyMunicipio, {
        municipioId: item.municipioId,
        municipio: item.municipio,
        total: 0,
        totalTexto: '00',
        incidentes: []
      });
    }

    const row = agrupado.get(keyMunicipio)!;

    row.total += total;

    const incidenteExistente = row.incidentes.find(
      incidente => incidente.incidente === item.incidente
    );

    if (incidenteExistente) {
      incidenteExistente.total += total;
      incidenteExistente.label =
        incidenteExistente.total > 1
          ? `${incidenteExistente.incidenteNombre} (${incidenteExistente.total})`
          : incidenteExistente.incidenteNombre;
    } else {
      row.incidentes.push({
        key: `${item.municipioId}-${item.incidente}`,
        incidente: item.incidente,
        incidenteNombre: item.incidenteNombre,
        total,
        label: total > 1
          ? `${item.incidenteNombre} (${total})`
          : item.incidenteNombre
      });
    }
  }

  return Array.from(agrupado.values())
    .map(row => {
      row.totalTexto = String(row.total).padStart(2, '0');

      row.incidentes = row.incidentes.sort((a, b) =>
        a.incidenteNombre.localeCompare(b.incidenteNombre, 'es', {
          sensitivity: 'base'
        })
      );

      return row;
    })
    .sort((a, b) =>
      a.municipio.localeCompare(b.municipio, 'es', {
        sensitivity: 'base'
      })
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
  /*
listInformes: IncidenteInforme[] = [
  {
    id: 1,
    status: 'ejecucion',
    lugar: 'Col. Ayestas',
    region: 'Tegucigalpa',
    incidente: 'Incendio estructural',
    unidad: 'B-12',
    fecha: '2026-07-01',
    hora: '08:15',
    lat: 14.0818,
    lng: -87.2068
  },
  {
    id: 2,
    status: 'ejecucion',
    lugar: 'Col. Ayestas',
    region: 'Tegucigalpa',
    incidente: 'Fuga de gas',
    unidad: 'B-04',
    fecha: '2026-07-01',
    hora: '09:30',
    lat: 14.0818,
    lng: -87.2068
  },
  {
    id: 3,
    status: 'pendiente',
    lugar: 'Col. Kennedy',
    region: 'Tegucigalpa',
    incidente: 'Accidente vehicular',
    unidad: 'Pendiente',
    fecha: '2026-07-01',
    hora: '10:10',
    lat: 14.0627,
    lng: -87.1766
  },
  {
    id: 4,
    status: 'finalizado',
    lugar: 'Barrio La Granja',
    region: 'Comayagüela',
    incidente: 'Persona herida',
    unidad: 'A-09',
    fecha: '2026-07-01',
    hora: '11:20',
    lat: 14.0943,
    lng: -87.2209
  },
  {
    id: 5,
    status: 'cancelado',
    lugar: 'Col. Miraflores',
    region: 'Tegucigalpa',
    incidente: 'Falsa alarma',
    unidad: 'N/A',
    fecha: '2026-07-01',
    hora: '12:40',
    lat: 14.0835,
    lng: -87.1871
  }
];


get totalIncidentes(): number {
  return this.listInformes.length;
}

get totalEnEjecucion(): number {
  return this.getTotalPorEstado('ejecucion');
}

get totalPendientes(): number {
  return this.getTotalPorEstado('pendiente');
}

get totalFinalizados(): number {
  return this.getTotalPorEstado('finalizado');
}

get totalCancelados(): number {
  return this.getTotalPorEstado('cancelado');
}

getTotalPorEstado(status: string): number {
  return this.listInformes.filter(item => item.status === status).length;
}

getAgrupadoPor(campo: keyof IncidenteInforme) {
  const result = new Map<string, number>();

  this.listInformes.forEach(item => {
    const key = String(item[campo] ?? 'Sin dato');
    result.set(key, (result.get(key) ?? 0) + 1);
  });

  return Array.from(result.entries())
    .map(([label, total]) => ({ label, total }))
    .sort((a, b) => b.total - a.total);
}
get incidentesPorRegion() {
  return this.getAgrupadoPor('region');
}

get incidentesPorTipo() {
  return this.getAgrupadoPor('incidente');
}

get incidentesPorEstado() {
  return this.getAgrupadoPor('status');
}

get incidentesPorLugar() {
  return this.getAgrupadoPor('lugar');
}
getTopLugares(limit: number = 5) {
  return this.incidentesPorLugar.slice(0, limit);
}

getMarkersMapa(): MarkerInforme[] {
  const markers = new Map<string, MarkerInforme>();

  this.listInformes.forEach(incidente => {
    const key = `${incidente.lat}-${incidente.lng}`;

    const current = markers.get(key);

    if (!current) {
      markers.set(key, {
        key,
        lat: incidente.lat,
        lng: incidente.lng,
        lugar: incidente.lugar,
        region: incidente.region,
        total: 1,
        incidentes: [incidente],
        unidades: [incidente.unidad]
      });

      return;
    }

    current.total += 1;
    current.incidentes.push(incidente);

    if (!current.unidades.includes(incidente.unidad)) {
      current.unidades.push(incidente.unidad);
    }
  });

  return Array.from(markers.values());
}



  svFormData = inject(DataFormService);
  submitForm(data: iFormEmit){
    console.log("data::::: ", data)
    this.list = [...this.list, data.data];
  }
  listTimer = [
    {title: "recibido", time: 0},
    {title: "Despacho", time: 0},
    {title: "Desplazo", time: 0},
    {title: "Llegada", time: 0},
    {title: "finalizacion", time: 0},
    {title: "retorno", time: 0},
  ];



  list: any = [];

  columnasUsuarios: TableColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'incidente_name', label: 'Nombre' },
    { key: 'incidente_dir', label: 'Correo' }
  ];
*/

}
