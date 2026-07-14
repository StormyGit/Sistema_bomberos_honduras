import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonCard, IonRefresher, IonRefresherContent, IonImg, IonButton, IonSpinner,
  IonSegment, IonSegmentButton, IonLabel, IonIcon, IonTextarea
} from '@ionic/angular/standalone';

import { RefresherCustomEvent } from '@ionic/core';
import { ActivatedRoute } from '@angular/router';

import { IncidenteService } from 'src/app/services/incidente-service';
import { incidente, Tiempo, TiempoTipo } from 'src/app/types/cce/incidente.interface';
import { catchError, throwError, timeout } from 'rxjs';
import { HttpEventType } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from 'src/environments/environment';

interface iTiempoStep {
  tipo: TiempoTipo;
  label: string;
  descripcion: string;
}

interface iImagenPreview {
  file: File;
  url: string;
}

@Component({
  selector: 'app-incidente-detalle',
  templateUrl: './incidente-detalle.page.html',
  styleUrls: ['./incidente-detalle.page.scss'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
    IonCard, IonRefresher, IonRefresherContent, IonImg, IonButton, IonSpinner,
    IonSegment, IonSegmentButton, IonLabel, IonTextarea
  ]
})
export class IncidenteDetallePage implements OnInit {

  private route = inject(ActivatedRoute);
  private scrIncidente = inject(IncidenteService);

   apiUrl = environment.serve_incidenteApplication + '/incidente';
procesandoImagenes = signal(false);

  incidente = signal<incidente | null>(null);
  myId: string | null = null;

  // ---- Tabs ----
  activeTab = signal<'detalle' | 'agregar'>('detalle');

  cambiarTab(tab: 'detalle' | 'agregar') {
    this.activeTab.set(tab);
  }

  // ---- Tiempos (secuencial) ----
  tiempoSteps: iTiempoStep[] = [
    { tipo: TiempoTipo.Reporte,        label: 'Reporte',              descripcion: 'Momento en que se recibe el incidente' },
    { tipo: TiempoTipo.Despacho,       label: 'Despacho',             descripcion: 'Se asigna la unidad' },
    { tipo: TiempoTipo.SalidaEstacion, label: 'Salida de estación',   descripcion: 'Unidad sale hacia el lugar' },
    { tipo: TiempoTipo.Llegada,        label: 'Llegada al lugar',     descripcion: 'Unidad llega a la escena' },
    { tipo: TiempoTipo.Controlado,     label: 'Incidente controlado', descripcion: 'La emergencia queda bajo control' },
    { tipo: TiempoTipo.Finalizacion,   label: 'Finalización',         descripcion: 'Cierre operativo del incidente' },
  ];

  registrandoTiempo = signal<TiempoTipo | null>(null);

  tiempoRegistrado(tipo: TiempoTipo): Tiempo | undefined {
    return this.incidente()?.tiempos?.find(t => t.tipoTiempo === tipo);
  }

  // índice del próximo paso pendiente (-1 si ya están todos completos)
  get proximoPasoIndex(): number {
    const tiempos = this.incidente()?.tiempos ?? [];
    return this.tiempoSteps.findIndex(step => !tiempos.some(t => t.tipoTiempo === step.tipo));
  }

  estadoPaso(index: number): 'completado' | 'activo' | 'pendiente' {
    const proximo = this.proximoPasoIndex;
    if (proximo === -1 || index < proximo) return 'completado';
    if (index === proximo) return 'activo';
    return 'pendiente';
  }

registrarTiempo(tipo: TiempoTipo) {
  if (!this.myId || this.registrandoTiempo()) return;

  this.registrandoTiempo.set(tipo);

  this.scrIncidente.addTiempo(this.myId, tipo).subscribe({
    next: () => {
      this.registrandoTiempo.set(null);
      this.recargarList();
    },
    error: (err: any) => {
      console.error('Error al registrar tiempo', err);
      this.registrandoTiempo.set(null);
    }
  });
}

  // ---- Evidencias ----
  // imagenesSeleccionadas: iImagenPreview[] = [];
  // observacionForm: string = '';
  // enviandoEvidencia = signal(false);

async onSeleccionarImagen(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement;

  if (!input.files?.length || this.procesandoImagenes()) {
    return;
  }

  const espacioDisponible = 3 - this.imagenesSeleccionadas.length;
  const archivos = Array.from(input.files).slice(0, espacioDisponible);

  this.procesandoImagenes.set(true);
  this.errorEvidencia.set(null);

  try {
    for (const archivoOriginal of archivos) {
      if (!archivoOriginal.type.startsWith('image/')) {
        continue;
      }
      const inicioCompresion = performance.now();
      const archivoComprimido = await this.comprimirImagen(
        archivoOriginal,
        1280,
        1280,
        0.65
      );

      const tiempoCompresion = performance.now() - inicioCompresion;

      console.log('IMAGEN:', {
        originalMB: (archivoOriginal.size / 1024 / 1024).toFixed(2),
        comprimidaMB: (archivoComprimido.size / 1024 / 1024).toFixed(2),
        compresionMs: tiempoCompresion.toFixed(0),
        tipo: archivoComprimido.type
      });
      console.log('Imagen original:', {
        nombre: archivoOriginal.name,
        pesoMB: this.bytesToMB(archivoOriginal.size)
      });

      console.log('Imagen comprimida:', {
        nombre: archivoComprimido.name,
        pesoMB: this.bytesToMB(archivoComprimido.size)
      });

      this.imagenesSeleccionadas.push({
        file: archivoComprimido,
        url: URL.createObjectURL(archivoComprimido)
      });
    }
  } catch (error) {
    console.error('Error al procesar imágenes', error);

    this.errorEvidencia.set(
      'No se pudieron procesar una o más imágenes.'
    );
  } finally {
    this.procesandoImagenes.set(false);
    input.value = '';
  }
}

private async comprimirImagen(
  file: File,
  maxWidth: number = 1280,
  maxHeight: number = 1280,
  calidad: number = 0.72
): Promise<File> {

  const urlTemporal = URL.createObjectURL(file);

  try {
    const imagen = await this.cargarImagen(urlTemporal);

    const escala = Math.min(
      1,
      maxWidth / imagen.naturalWidth,
      maxHeight / imagen.naturalHeight
    );

    const ancho = Math.round(
      imagen.naturalWidth * escala
    );

    const alto = Math.round(
      imagen.naturalHeight * escala
    );

    const canvas = document.createElement('canvas');
    canvas.width = ancho;
    canvas.height = alto;

    const contexto = canvas.getContext('2d');

    if (!contexto) {
      throw new Error(
        'No se pudo crear el contexto de la imagen.'
      );
    }

    contexto.fillStyle = '#ffffff';
    contexto.fillRect(0, 0, ancho, alto);

    contexto.drawImage(
      imagen,
      0,
      0,
      ancho,
      alto
    );

    const blob = await new Promise<Blob>(
      (resolve, reject) => {
        canvas.toBlob(
          resultado => {
            if (resultado) {
              resolve(resultado);
            } else {
              reject(
                new Error('No se pudo comprimir la imagen.')
              );
            }
          },
          'image/jpeg',
          calidad
        );
      }
    );

    /*
     * Si la compresión termina creando un archivo mayor,
     * conservamos el original.
     */
    if (blob.size >= file.size) {
      return file;
    }

    const nombre =
      file.name.replace(/\.[^/.]+$/, '');

    return new File(
      [blob],
      `${nombre}.jpg`,
      {
        type: 'image/jpeg',
        lastModified: Date.now()
      }
    );

  } finally {
    URL.revokeObjectURL(urlTemporal);
  }
}

private cargarImagen(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const imagen = new Image();

    imagen.onload = () => resolve(imagen);

    imagen.onerror = () => {
      reject(
        new Error('No se pudo cargar la imagen.')
      );
    };

    imagen.src = url;
  });
}
private bytesToMB(bytes: number): string {
  return (bytes / 1024 / 1024).toFixed(2);
}

  quitarImagen(index: number) {
    URL.revokeObjectURL(this.imagenesSeleccionadas[index].url);
    this.imagenesSeleccionadas.splice(index, 1);
  }



  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.myId = id;
    this.recargarList();
  }

  recargarList(event?: RefresherCustomEvent): void {
    if (!this.myId) {
      event?.target.complete();
      return;
    }

    this.scrIncidente.getById(this.myId).subscribe({
      next: (res) => {
        this.incidente.set(res ?? null);
      },
      error: (error) => {
        console.error('Error al cargar incidente', error);
      },
      complete: () => {
        event?.target.complete();
      }
    });
  }

  formatearTexto(valor: string | null | undefined): string {
    if (!valor) return 'No registrado';
    return valor;
  }

  obtenerHora(fecha: string | null | undefined): string {
    if (!fecha) return 'No registrada';
    const date = new Date(fecha);
    return date.toLocaleTimeString('es-HN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  colorEstado(estado: string | null | undefined): string {
    switch (estado) {
      case 'Pendiente': return 'warning';
      case 'SinEvidencias': return 'warning';
      case 'Ejecucion': return 'primary';
      case 'Finalizado': return 'success';
      case 'Cancelado': return 'danger';
      default: return 'medium';
    }
  }


  // ---- Evidencias ----
  imagenesSeleccionadas: iImagenPreview[] = [];
  observacionForm: string = '';
  enviandoEvidencia = signal(false);
  errorEvidencia = signal<string | null>(null);   // <-- nuevo

  progresoEvidencia = signal<number>(0);


guardarEvidencia() {
  if (!this.myId) return;

  this.errorEvidencia.set(null);
  this.progresoEvidencia.set(0);

  const formData = new FormData();
  formData.append('idIncidente', this.myId);

  this.imagenesSeleccionadas.forEach((img, i) => {
    formData.append(`image${i + 1}`, img.file, img.file.name);
  });

  if (this.observacionForm?.trim()) {
    formData.append('observacionGeneral', this.observacionForm.trim());
  }

  this.enviandoEvidencia.set(true);

  this.scrIncidente.addEvidencia(formData).subscribe({
    next: (event: any) => {
      if (event.type === HttpEventType.UploadProgress) {
        const total = event.total ?? 1;
        const progreso = Math.round((event.loaded * 100) / total);
        this.progresoEvidencia.set(progreso);
      }

      if (event.type === HttpEventType.Response) {
        this.enviandoEvidencia.set(false);
        this.progresoEvidencia.set(100);

        this.imagenesSeleccionadas.forEach(img => URL.revokeObjectURL(img.url));
        this.imagenesSeleccionadas = [];
        this.observacionForm = '';

        this.recargarList();
      }
    },
    error: (err: any) => {
      console.error('Error al guardar evidencia', err);
      this.enviandoEvidencia.set(false);

      const status = err?.status ?? 'sin status';
      const mensajeServidor =
        err?.error?.message ??
        err?.error?.error ??
        (typeof err?.error === 'string' ? err.error : null) ??
        err?.message ??
        'Error desconocido';

      this.errorEvidencia.set(`[${status}] ${mensajeServidor}`);
    }
  });
}




}
