import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../components/layouts/navbar-component/navbar-component';
import { CommonModule } from '@angular/common';
import { User } from '../../auth/auth.interface.ts';
import { AuthServiceService } from '../../auth/authService.service';

const SIDEBAR_STORAGE_KEY = 'cce-sidebar-open';

@Component({
  selector: 'app-cce-layout-component',
  imports: [RouterOutlet, NavbarComponent, CommonModule],
  templateUrl: './cce-layout-component.html',
  styleUrl: './cce-layout-component.css',
})
export class CceLayoutComponent implements OnInit, OnDestroy {
  scrAuth = inject(AuthServiceService);
  User = signal<User | null>(this.scrAuth.getUser);

  Departamento: string = 'Centro de Coordinacion de Emergencias';
  Region: string = this.User()?.region ?? '-';

  fechaHoraActual = signal<Date>(new Date());

  // Estado del sidebar, persistido en localStorage
  isSidebarOpen = signal<boolean>(this.leerEstadoSidebar());

  private intervaloHora?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.actualizarFechaHora();

    this.intervaloHora = setInterval(() => {
      this.actualizarFechaHora();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.intervaloHora) {
      clearInterval(this.intervaloHora);
    }
  }

  toggleSidebar(): void {
    this.isSidebarOpen.update((v) => !v);
    this.guardarEstadoSidebar(this.isSidebarOpen());
  }

  private leerEstadoSidebar(): boolean {
    try {
      const guardado = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      // Por defecto abierto si nunca se ha guardado nada
      return guardado !== null ? JSON.parse(guardado) : true;
    } catch {
      return true;
    }
  }

  private guardarEstadoSidebar(valor: boolean): void {
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(valor));
    } catch {
      // Si localStorage falla (modo privado, etc.) simplemente no persiste
    }
  }

  private actualizarFechaHora(): void {
    this.fechaHoraActual.set(new Date());
  }
}
