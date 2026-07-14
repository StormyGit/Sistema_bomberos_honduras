import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { switchMap, tap, catchError, of } from 'rxjs';
import { IncidenteInfoComponents } from '../../components/incidente-info-components/incidente-info-components';
import { incidente } from '../../../types/cce/incidente.interface';
import { IncidenteService } from '../../cce/services/incidente-service';


@Component({
  selector: 'app-incidente-resumen',
  standalone: true,
  imports: [CommonModule, IncidenteInfoComponents],
  templateUrl: './incidente-resumen.html',
})
export class IncidenteResumen implements OnInit {
  private route = inject(ActivatedRoute);
  private incidenteService = inject(IncidenteService);

  incidente_selection = signal<incidente | null>(null);
  cargando = signal<boolean>(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('incidenteId');

          if (!id) {
            this.error.set('No se proporcionó un ID de incidente.');
            this.cargando.set(false);
            return of(null);
          }

          this.cargando.set(true);
          this.error.set(null);

          return this.incidenteService.getById(id).pipe(
            tap(() => this.cargando.set(false)),
            catchError((err) => {
              console.error('Error al cargar incidente:', err);
              this.error.set('No se pudo cargar el incidente.');
              this.cargando.set(false);
              return of(null);
            })
          );
        })
      )
      .subscribe((data) => {
        this.incidente_selection.set(data);
      });
  }
}
