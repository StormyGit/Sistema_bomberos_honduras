export interface TipoReporte {
  value: string;
  label: string;
}

export const TIPOS_REPORTES: TipoReporte[] = [
  {
    value: 'reporteIncendio',
    label: 'Reporte de incendio'
  },
  {
    value: 'reporteRescate',
    label: 'Reporte de rescate'
  }
];







export function reporteIncendio(): iFormGroup {

  const ahora = new Date();

  const fechaActual =
    ahora.toISOString().split('T')[0];

  const horaActual =
    ahora.toTimeString().slice(0, 5);

  return {
    seccions: [

      /*
       * ==========================================
       * PÁGINA 1: DATOS GENERALES
       * ==========================================
       */
      {
        title: 'Datos generales',
        showTitle: false,
        w: 1,

        field: [

          {
            label: 'Lugar',
            type: 'text',
            name: 'lugar',
            w: 4,
            required: true,
            readonly: true,
          },

          {
            label: 'Fecha',
            type: 'date',
            name: 'fecha',
            w: 4,
            required: true,
            readonly: true,
            value: fechaActual
          },

          {
            label: 'Compañía en servicio',
            type: 'text',
            name: 'companiaServicio',
            w: 4,
            required: true
          },

          {
            label: 'Hora del servicio',
            type: 'text',
            name: 'horaServicio',
            w: 4,
            readonly: true,
            required: true,
            value: horaActual,
            placeholder: 'HH:mm'
          },

          {
            label: 'Reportó del teléfono',
            type: 'phone',
            name: 'telefonoReportante',
            w: 2,
            readonly: true,
            required: false
          },

          {
            label: 'Señor(a)',
            type: 'text',
            name: 'nombreReportante',
            w: 2,
            readonly: true,
            required: false,
            max: 100
          },

          {
            label: 'Informando que en',
            type: 'textarea',
            name: 'ubicacionIncendio',
            w: 1,
            h: 3,
            required: true,
            max: 500,
            placeholder:
              'Dirección o ubicación donde ocurrió el incendio'
          }
        ]
      },

      {
        title: 'Información del incendio',
        showTitle: true,
        w: 1,

        field: [

          {
            label: 'Clase de incendio',
            type: 'text',
            name: 'claseIncendio',
            w: 2,
            required: true,
            readonly: true,
          },

          {
            label: 'Propietarios presentes',
            type: 'checkbox',
            name: 'propietariosPresentes',
            w: 2,
            value: false
          },

          {
            label:
              'Propietarios de las viviendas quemadas',
            type: 'textarea',
            name: 'propietariosViviendasQuemadas',
            w: 1,
            h: 3,
            required: false,
            max: 600
          },

          {
            label: 'Personas que sufrieron daños',
            type: 'textarea',
            name: 'personasQueSufrieronDanos',
            w: 1,
            h: 4,
            required: false,
            max: 800,
            placeholder:
              'Nombres, tipo de afectación u otra información relevante'
          },

          {
            label: 'Origen del fuego',
            type: 'textarea',
            name: 'origenFuego',
            w: 1,
            h: 3,
            required: false,
            max: 500
          }
        ]
      },

      /*
       * ==========================================
       * SEGURO Y PÉRDIDAS
       * ==========================================
       */
      {
        title: 'Seguro y pérdidas',
        showTitle: true,
        w: 1,

        field: [

          {
            label: 'Asegurado con',
            type: 'text',
            name: 'aseguradoCon',
            w: 2,
            required: false,
            max: 150
          },

          {
            label: 'Monto del seguro',
            type: 'number',
            name: 'montoSeguro',
            w: 2,
            required: false,
            min: 0
          },

          {
            label:
              'Propiedades adyacentes salvadas',
            type: 'textarea',
            name: 'propiedadesAdyacentesSalvadas',
            w: 1,
            h: 4,
            required: false,
            max: 1000
          },

          {
            label: 'Pérdidas materiales',
            type: 'textarea',
            name: 'perdidasMateriales',
            w: 1,
            h: 5,
            required: false,
            max: 1500
          }
        ]
      },

      /*
       * ==========================================
       * RECURSOS Y PERSONAL
       * ==========================================
       */
      {
        title: 'Recursos y personal',
        showTitle: true,
        w: 1,

        field: [

          {
            label: 'Unidades que asistieron',
            type: 'textarea',
            name: 'unidadesQueAsistieron',
            w: 1,
            h: 4,
            required: false,
            max: 1000,
            placeholder:
              'Indique códigos o nombres de las unidades'
          },

          {
            label: 'Personal que asistió',
            type: 'textarea',
            name: 'personalQueAsistio',
            w: 1,
            h: 5,
            required: false,
            max: 1500
          },

          {
            label: 'Personal libre',
            type: 'textarea',
            name: 'personalLibre',
            w: 1,
            h: 3,
            required: false,
            max: 800
          },

          {
            label: 'Personal voluntario',
            type: 'textarea',
            name: 'personalVoluntario',
            w: 1,
            h: 4,
            required: false,
            max: 1000
          },

          {
            label:
              'Colaboración de otras instituciones',
            type: 'textarea',
            name: 'colaboracionOtrasInstituciones',
            w: 1,
            h: 4,
            required: false,
            max: 1000
          }
        ]
      },

      /*
       * ==========================================
       * PÁGINA 2: DESCRIPCIÓN
       * ==========================================
       */
      {
        title: 'Descripción del incendio',
        showTitle: true,
        w: 1,
        pageBreakBefore: true,

        field: [

          {
            label: '',
            type: 'textarea',
            name: 'descripcionIncendio',
            w: 1,
            required: true,
            max: 8000,
            placeholder:
              'Describa detalladamente el incendio, las acciones realizadas y los resultados obtenidos'
          }
        ]
      },

      /*
       * ==========================================
       * OBSERVACIONES
       * ==========================================
       */
      {
        title: 'Observaciones',
        showTitle: true,
        w: 1,

        field: [

          {
            label: '',
            type: 'textarea',
            name: 'observaciones',
            w: 1,
            h: 4,
            required: false,
            max: 1200
          }
        ]
      },

      /*
       * ==========================================
       * CIERRE DEL REPORTE
       * ==========================================
       */
      {
        title: 'Cierre del reporte',
        showTitle: false,
        w: 1,

        field: [

          {
            label: 'Hora de regreso',
            type: 'text',
            name: 'horaRegreso',
            w: 2,
            required: true,
            readonly: true,
            placeholder: 'HH:mm'
          },

          {
            label: 'Operador de turno',
            type: 'text',
            name: 'operadorTurno',
            w: 2,
            required: true,
            max: 100
          },

          {
            label: 'Elaborado por',
            type: 'text',
            name: 'elaboradoPor',
            w: 2,
            required: true,
            max: 100
          },

          {
            label: 'Oficial de servicio',
            type: 'text',
            name: 'oficialServicio',
            w: 2,
            required: true,
            max: 100
          }
        ]
      }
    ]
  };
}

export function reporteRescate(): iFormGroup {
  const ahora = new Date();
  const fechaActual = ahora.toISOString().split('T')[0];
  const horaActual = ahora.toTimeString().slice(0, 5);

  return {
    seccions: [
      {
        title: 'Datos generales',
        showTitle: false,
        w: 1,
        field: [
          { label: 'Lugar', type: 'text', name: 'lugar', w: 4, required: true, readonly: true, value: 'Tegucigalpa, M.D.C.' },
          { label: 'Fecha', type: 'date', name: 'fecha', w: 4, required: true, readonly: true, value: fechaActual },
          { label: 'Compañía en servicio', type: 'text', name: 'companiaServicio', w: 4, required: true },
          { label: 'Hora del servicio', type: 'text', name: 'horaServicio', w: 4, required: true, readonly: true, value: horaActual },

          { label: 'Reportó del teléfono', type: 'phone', name: 'telefonoReportante', w: 2, readonly: true },
          { label: 'Señor(a)', type: 'text', name: 'nombreReportante', w: 2, readonly: true, max: 100 },

          {
            label: 'Informando que en',
            type: 'textarea',
            name: 'ubicacionRescate',
            w: 1,
            h: 2,
            required: true,
            max: 500,
            placeholder: 'Dirección o ubicación donde ocurrió el rescate'
          }
        ]
      },

      {
        title: 'Servicio de rescate',
        showTitle: true,
        w: 1,
        field: [
          { label: 'Personas', type: 'checkbox', name: 'rescatePersonas', w: 2, value: false },
          { label: 'Animales', type: 'checkbox', name: 'rescateAnimales', w: 2, value: false }
        ]
      },

      {
        title: 'Tipo de rescate',
        showTitle: true,
        w: 1,
        field: [
          { label: 'Vehicular', type: 'checkbox', name: 'rescateVehicular', w: 4, value: false },
          { label: 'En ascensor', type: 'checkbox', name: 'rescateAscensor', w: 4, value: false },
          { label: 'En alturas', type: 'checkbox', name: 'rescateAlturas', w: 4, value: false },
          { label: 'Otros', type: 'checkbox', name: 'rescateOtros', w: 4, value: false },

          {
            label: 'Especifique otro tipo de rescate',
            type: 'text',
            name: 'otroTipoRescate',
            w: 1,
            required: false,
            max: 250
          }
        ]
      },

      {
        title: 'Recursos y personal',
        showTitle: true,
        w: 1,
        field: [
          {
            label: 'Unidades que asistieron',
            type: 'textarea',
            name: 'unidadesQueAsistieron',
            w: 1,
            h: 3,
            max: 1000,
            placeholder: 'Indique códigos o nombres de las unidades'
          },

          {
            label: 'Personal que asistió',
            type: 'textarea',
            name: 'personalQueAsistio',
            w: 1,
            h: 3,
            max: 1500
          },

          {
            label: 'Personal voluntario',
            type: 'textarea',
            name: 'personalVoluntario',
            w: 1,
            h: 3,
            max: 1000
          },

          {
            label: 'Cooperación de otras instituciones',
            type: 'textarea',
            name: 'cooperacionOtrasInstituciones',
            w: 1,
            h: 3,
            max: 1200
          }
        ]
      },

      {
        title: 'Descripción del rescate',
        showTitle: true,
        w: 1,
        field: [
          {
            label: '',
            type: 'textarea',
            name: 'descripcionRescate',
            w: 1,
            h: 6,
            required: true,
            max: 6000,
            placeholder: 'Describa detalladamente el rescate y las acciones realizadas'
          }
        ]
      },

      {
        title: 'Observaciones',
        showTitle: true,
        w: 1,
        pageBreakBefore: true,
        field: [
          {
            label: '',
            type: 'textarea',
            name: 'observaciones',
            w: 1,
            h: 4,
            max: 1500
          }
        ]
      },

      {
        title: 'Otros datos',
        showTitle: true,
        w: 1,
        field: [
          {
            label: '',
            type: 'textarea',
            name: 'otrosDatos',
            w: 1,
            h: 5,
            max: 2000
          }
        ]
      },

      {
        title: 'Cierre del reporte',
        showTitle: false,
        w: 1,
        field: [
          { label: 'Hora de salida', type: 'text', name: 'horaSalida', w: 2, required: true, readonly: true, placeholder: 'HH:mm' },
          { label: 'Hora de regreso', type: 'text', name: 'horaRegreso', w: 2, required: true, readonly: true, placeholder: 'HH:mm' },

          { label: 'Elaborado por', type: 'text', name: 'elaboradoPor', w: 2, required: true, max: 100 },
          { label: 'Operador de turno', type: 'text', name: 'operadorTurno', w: 2, required: true, max: 100 },

          { label: 'Oficial de servicio', type: 'text', name: 'oficialServicio', w: 1, required: true, max: 100 }
        ]
      }
    ]
  };
}
