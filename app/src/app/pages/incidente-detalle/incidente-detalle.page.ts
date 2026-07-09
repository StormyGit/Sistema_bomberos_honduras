import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonBadge, IonRefresher, IonRefresherContent, IonImg, IonButton, IonSpinner, IonIcon } from '@ionic/angular/standalone';

import { RefresherCustomEvent } from '@ionic/core';
import { ActivatedRoute } from '@angular/router';

import { IncidenteService } from 'src/app/services/incidente-service';
import { incidente } from 'src/app/types/cce/incidente.interface';

@Component({
  selector: 'app-incidente-detalle',
  templateUrl: './incidente-detalle.page.html',
  styleUrls: ['./incidente-detalle.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonBadge,
    IonRefresher,
    IonRefresherContent,
    IonImg,
    IonButton,
    IonSpinner,
    IonIcon
]
})
export class IncidenteDetallePage implements OnInit {

  private route = inject(ActivatedRoute);
  private scrIncidente = inject(IncidenteService);

  incidente = signal<incidente | null>(null);

  myId: string | null = null;

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
        console.log(res);
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

    return valor
    //   .replaceAll('_', ' ')
    //   .toLowerCase()
    //   .replace(/\b\w/g, letra => letra.toUpperCase());
  }

  obtenerHora(fecha: string | null | undefined): string {
    if (!fecha) return 'No registrada';

    const date = new Date(fecha);

    return date.toLocaleTimeString('es-HN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  colorEstado(estado: string | null | undefined): string {
    switch (estado) {
      case 'Pendiente':
        return 'warning';
      case 'Ejecucion':
        return 'primary';
      case 'Finalizado':
        return 'success';
      default:
        return 'medium';
    }
  }
}
