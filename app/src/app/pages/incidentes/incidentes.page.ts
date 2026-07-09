import { Component, inject, OnInit, signal, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton, RefresherEventDetail, IonRefresher, IonRefresherContent, IonRippleEffect } from '@ionic/angular/standalone';
import { IonRefresherCustomEvent, RefresherCustomEvent } from '@ionic/core';
import { IncidenteService } from 'src/app/services/incidente-service';
import { incidente } from 'src/app/types/cce/incidente.interface';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-incidentes',
  templateUrl: './incidentes.page.html',
  styleUrls: ['./incidentes.page.scss'],
  standalone: true,
  imports: [RouterLink, IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton, IonRefresher, IonRefresherContent]
})
export class IncidentesPage implements OnInit {

  private scrIncidente = inject(IncidenteService);

  listIncidente = signal<incidente[]>([]);

  ngOnInit(): void {
    this.recargarList();
  }

  recargarList(event?: RefresherCustomEvent): void {
    this.scrIncidente.getAll().subscribe({
      next: (res) => {
        this.listIncidente.set(res ?? []);
        console.log(res);
      },
      error: (error) => {
        console.error('Error al cargar incidentes', error);
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
