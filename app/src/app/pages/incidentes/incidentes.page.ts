import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton, RefresherEventDetail, IonRefresher, IonRefresherContent, IonRippleEffect } from '@ionic/angular/standalone';
import { IonRefresherCustomEvent, RefresherCustomEvent } from '@ionic/core';

@Component({
  selector: 'app-incidentes',
  templateUrl: './incidentes.page.html',
  styleUrls: ['./incidentes.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton, IonRefresher, IonRefresherContent, IonRippleEffect]
})
export class IncidentesPage implements OnInit {
  constructor() { }

  ngOnInit() {
  }

      handleRefresh(event: RefresherCustomEvent) {
      setTimeout(() => {
        event.target.complete();
      }, 2000);
    }

}
