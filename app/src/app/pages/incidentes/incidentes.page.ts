import { Component, inject, OnInit, signal, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton, RefresherEventDetail, IonRefresher, IonRefresherContent, IonRippleEffect } from '@ionic/angular/standalone';
import { IonRefresherCustomEvent, RefresherCustomEvent } from '@ionic/core';
import { IncidenteService } from 'src/app/services/incidente-service';
import { incidente } from 'src/app/types/cce/incidente.interface';
import { RouterLink } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-incidentes',
  templateUrl: './incidentes.page.html',
  styleUrls: ['./incidentes.page.scss'],
  standalone: true,
  imports: [RouterLink, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonCard, IonButton, IonRefresher, IonRefresherContent, IonCardContent]
})
export class IncidentesPage implements OnInit {

 apiUrl = environment.serve_incidenteApplication + '/incidente';

  private scrIncidente = inject(IncidenteService);

  listIncidente = signal<incidente[]>([]);

  ngOnInit(): void {
    this.recargarList();
  }
errorApi = signal<string | null>(null);
recargarList(event?: RefresherCustomEvent): void {
  this.errorApi.set(null);

  this.scrIncidente.getAll().subscribe({
    next: (res) => {
      console.log('Respuesta API:', res);
      this.listIncidente.set(res ?? []);
    },
    error: (error) => {
      console.error('Error al cargar incidentes:', error);

      this.errorApi.set(
        `Error: ${error.status} - ${error.message}`
      );

      this.listIncidente.set([]);
    },
    complete: () => {
      event?.target.complete();
    }
  });
}

  handleRefresh(event: RefresherCustomEvent): void {
    this.recargarList(event);
  }
}
