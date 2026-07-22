export interface incidente {
  id?: string;
  // incidente
  incidente?       : string;
  colonia?         : string;
  referencia?      : string;
  direccion?       : string;
  departamento? : string;
  // denunciante
  denuncianteNombre?: string;
  denuncianteTelefono?: string;
  // operador recepcion
  fechaCreacion?: string;
  fecha?: string;
  observacionGeneral?: string;
  recepcionNombre?: string;
  recepcionTipo?: "cce" | "911";

  tiempos?: Tiempo[];
  recursos?: Recurso[];
  estado?: IncidenteEstado;
  punto?           : string;
  point?: string;
  images?: imagen[];
  reporte?: reporteIncidente[];
}

export interface reporteIncidente {
  idIncidente: string,
  estructuraForm: string,
  dataForm: string
}

export interface imagen{
  id: string,
  urlVisualizacion: string;
  urlDescarga: string;
  tipoArchivo: string;
  nombreOriginal: string;
}


export interface Recurso {
  id?: string;
  idIncidente?: string;
  estacion?: string;
  unidad?: string;
  oficialEncargado?: string;
  numPersonal?: number;
  galonAgua?: number;
  observacion?: string;
}
export interface Tiempo {
  id?: string;
  idIncidente?: string;
  tipoTiempo?: TiempoTipo;
  horaCreacion?: string;
  fechaCreacion?: string;
  observacion?: string;
}

export interface TipoResumen {
  tipoId: string;
  nombre: string;
  total: number;
  urlImagen?: string;
}


export enum TiempoTipo {
  Reporte = 'REPORTE',
  Despacho = 'DESPACHO',
  SalidaEstacion = 'SALIDA_ESTACION',
  Llegada = 'LLEGADA',
  Controlado = 'CONTROLADO',
  Finalizacion = 'FINALIZACION'
}

export enum IncidenteEstado {
    Pendiente="Pendiente",
    Ejecucion="Ejecucion",
    Finalizado="Finalizado",
    Cancelado="Cancelado"
}


export interface point{
  crs?: string;
  type?: string;
  cordenadas: { lat: number; lng: number }
}


export function incidentes_list() {
  return [
    { label: "Incendio estructural", value: "INCENDIO_ESTRUCTURAL" },
    { label: "Incendio vehicular", value: "INCENDIO_VEHICULAR" },
    { label: "Incendio forestal", value: "INCENDIO_FORESTAL" },
    { label: "Incendio de basura", value: "INCENDIO_DE_BASURA" },
    { label: "Rescate vehicular", value: "RESCATE_VEHICULAR" },
    { label: "Rescate en altura", value: "RESCATE_EN_ALTURA" },
    { label: "Rescate acuático", value: "RESCATE_ACUATICO" },
    { label: "Rescate en espacios confinados", value: "RESCATE_EN_ESPACIOS_CONFINADOS" },
    { label: "Emergencia médica", value: "EMERGENCIA_MEDICA" },
    { label: "Atención prehospitalaria", value: "ATENCION_PREHOSPITALARIA" },
    { label: "Fuga de gas", value: "FUGA_DE_GAS" },
    { label: "Derrame de combustible", value: "DERRAME_DE_COMBUSTIBLE" },
    { label: "Materiales peligrosos", value: "MATERIALES_PELIGROSOS" },
    { label: "Explosión", value: "EXPLOSION" },
    { label: "Corto circuito", value: "CORTO_CIRCUITO" },
    { label: "Poste o cable caído", value: "POSTE_O_CABLE_CAIDO" },
    { label: "Árbol caído", value: "ARBOL_CAIDO" },
    { label: "Inundación", value: "INUNDACION" },
    { label: "Derrumbe", value: "DERRUMBE" },
    { label: "Deslizamiento de tierra", value: "DESLIZAMIENTO_DE_TIERRA" },
    { label: "Persona atrapada", value: "PERSONA_ATRAPADA" },
    { label: "Animal atrapado", value: "ANIMAL_ATRAPADA" },
    { label: "Accidente de tránsito", value: "ACCIDENTE_DE_TRANSITO" },
    { label: "Accidente industrial", value: "ACCIDENTE_INDUSTRIAL" },
    { label: "Alarma contra incendios", value: "ALARMA_CONTRA_INCENDIOS" },
    { label: "Inspección preventiva", value: "INSPECCION_PREVENTIVA" },
    { label: "Apoyo a otras instituciones", value: "APOYO_A_OTRAS_INSTITUCIONES" },
    { label: "Falsa alarma", value: "FALSA_ALARMA" },
    { label: "Otro", value: "OTRO" }
  ];
}



export interface estaciones {
  nombre: string;
  point: point;
}
