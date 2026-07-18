import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';

type EstadoIncidente =
  | 'pendienteasignacion'
  | 'pendiente'
  | 'ejecucion'
  | 'sinevidencias'
  | 'finalizado'
  | 'cancelado';

interface BadgeConfig {
  label: string;
  descripcion: string;
  badgeClass: string;
  dotClass: string;
}

@Component({
  selector: 'app-badge-component',
  standalone: true,
  imports: [
    NgClass,
    MatTooltipModule
  ],
  templateUrl: './badge-component.html',
  styleUrl: './badge-component.css',
})
export class BadgeComponent {

  @Input() estado: string = 'Pendiente';

  private readonly config: Record<EstadoIncidente, BadgeConfig> = {
    pendienteasignacion: {
      label: 'Pendiente de asignación',
      descripcion:
        'El incidente fue reportado, pero todavía no se ha asignado una estación ni una unidad.',
      badgeClass:
        'bg-violet-500/10 text-violet-200 border-violet-400/30',
      dotClass:
        'bg-violet-400',
    },

    pendiente: {
      label: 'Pendiente',
      descripcion:
        'Ya se asignó una unidad al incidente, pero todavía no ha salido de la estación.',
      badgeClass:
        'bg-amber-500/10 text-amber-200 border-amber-400/30',
      dotClass:
        'bg-amber-400',
    },

    ejecucion: {
      label: 'En ejecución',
      descripcion:
        'La unidad salió de la estación y se encuentra en camino, atendiendo el incidente o regresando después de controlarlo.',
      badgeClass:
        'bg-orange-500/10 text-orange-200 border-orange-400/30',
      dotClass:
        'bg-orange-400',
    },

    sinevidencias: {
      label: 'Sin evidencias',
      descripcion:
        'La atención del incidente finalizó, pero todavía faltan las evidencias fotográficas requeridas.',
      badgeClass:
        'bg-sky-500/10 text-sky-200 border-sky-400/30',
      dotClass:
        'bg-sky-400',
    },

    finalizado: {
      label: 'Finalizado',
      descripcion:
        'La atención del incidente terminó satisfactoriamente y toda la información requerida fue completada.',
      badgeClass:
        'bg-emerald-500/10 text-emerald-200 border-emerald-400/30',
      dotClass:
        'bg-emerald-400',
    },

    cancelado: {
      label: 'Cancelado',
      descripcion:
        'El incidente fue cancelado o se determinó que correspondía a una falsa alarma.',
      badgeClass:
        'bg-rose-500/10 text-rose-200 border-rose-400/30',
      dotClass:
        'bg-rose-400',
    },
  };

  private get estadoNormalizado(): EstadoIncidente | null {
    const value = this.estado
      ?.toString()
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[\s_-]+/g, '');

    const aliases: Record<string, EstadoIncidente> = {
      pendienteasignacion: 'pendienteasignacion',
      pendiente: 'pendiente',
      ejecucion: 'ejecucion',
      enejecucion: 'ejecucion',
      sinevidencias: 'sinevidencias',
      finalizado: 'finalizado',
      finalizacion: 'finalizado',
      cancelado: 'cancelado',
    };

    return aliases[value] ?? null;
  }

  get badgeLabel(): string {
    const estado = this.estadoNormalizado;

    return estado
      ? this.config[estado].label
      : this.estado || 'Sin estado';
  }

  get badgeDescripcion(): string {
    const estado = this.estadoNormalizado;

    return estado
      ? this.config[estado].descripcion
      : 'No existe una descripción disponible para este estado.';
  }

  get badgeClass(): string {
    const estado = this.estadoNormalizado;

    return estado
      ? this.config[estado].badgeClass
      : 'bg-slate-500/10 text-slate-300 border-slate-400/30';
  }

  get dotClass(): string {
    const estado = this.estadoNormalizado;

    return estado
      ? this.config[estado].dotClass
      : 'bg-slate-400';
  }

  get shouldPulse(): boolean {
    return this.estadoNormalizado === 'ejecucion';
  }
}
