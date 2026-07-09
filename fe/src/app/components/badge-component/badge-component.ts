import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

type EstadoIncidente =
  | 'pendiente'
  | 'asignado'
  | 'en_camino'
  | 'ejecucion'
  | 'finalizado'
  | 'cancelado';

interface BadgeConfig {
  label: string;
  badgeClass: string;
  dotClass: string;
}

@Component({
  selector: 'app-badge-component',
  standalone: true,
  imports: [NgClass],
  templateUrl: './badge-component.html',
  styleUrl: './badge-component.css',
})
export class BadgeComponent {
  @Input() estado: string = 'Pendiente';

  private readonly config: Record<EstadoIncidente, BadgeConfig> = {
    pendiente: {
      label: 'Pendiente',
      badgeClass: 'bg-amber-500/10 text-amber-200 border-amber-400/30',
      dotClass: 'bg-amber-400',
    },
    asignado: {
      label: 'Asignado',
      badgeClass: 'bg-blue-500/10 text-blue-200 border-blue-400/30',
      dotClass: 'bg-blue-400',
    },
    en_camino: {
      label: 'En camino',
      badgeClass: 'bg-cyan-500/10 text-cyan-200 border-cyan-400/30',
      dotClass: 'bg-cyan-400',
    },
    ejecucion: {
      label: 'En ejecución',
      badgeClass: 'bg-orange-500/10 text-orange-200 border-orange-400/30',
      dotClass: 'bg-orange-400',
    },
    finalizado: {
      label: 'Finalizado',
      badgeClass: 'bg-emerald-500/10 text-emerald-200 border-emerald-400/30',
      dotClass: 'bg-emerald-400',
    },
    cancelado: {
      label: 'Cancelado',
      badgeClass: 'bg-rose-500/10 text-rose-200 border-rose-400/30',
      dotClass: 'bg-rose-400',
    },
  };

  private get estadoNormalizado(): EstadoIncidente | null {
    const value = this.estado
      ?.toString()
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_');

    const aliases: Record<string, EstadoIncidente> = {
      pendiente: 'pendiente',
      asignado: 'asignado',
      en_camino: 'en_camino',
      camino: 'en_camino',
      ejecucion: 'ejecucion',
      en_ejecucion: 'ejecucion',
      finalizado: 'finalizado',
      cancelado: 'cancelado',
    };

    return aliases[value] ?? null;
  }

  get badgeLabel(): string {
    const estado = this.estadoNormalizado;

    if (!estado) {
      return this.estado || 'Sin estado';
    }

    return this.config[estado].label;
  }

  get badgeClass(): string {
    const estado = this.estadoNormalizado;

    if (!estado) {
      return 'bg-slate-500/10 text-slate-300 border-slate-400/30';
    }

    return this.config[estado].badgeClass;
  }

  get dotClass(): string {
    const estado = this.estadoNormalizado;

    if (!estado) {
      return 'bg-slate-400';
    }

    return this.config[estado].dotClass;
  }

  get shouldPulse(): boolean {
    const estado = this.estadoNormalizado;

    return estado === 'ejecucion' || estado === 'en_camino';
  }
}
