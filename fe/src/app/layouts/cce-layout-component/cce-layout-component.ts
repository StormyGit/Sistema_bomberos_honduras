import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../components/layouts/navbar-component/navbar-component';
import { CommonModule } from '@angular/common';
import { User } from '../../auth/auth.interface.ts';
import { AuthServiceService } from '../../auth/authService.service';

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

  // Ahora es un signal: cada .set() notifica a la vista automáticamente,
  // sin depender de que zone.js "se entere" del setInterval.
  fechaHoraActual = signal<Date>(new Date());

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

  private actualizarFechaHora(): void {
    this.fechaHoraActual.set(new Date());
  }
}
