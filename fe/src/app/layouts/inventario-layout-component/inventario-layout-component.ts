import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from "../../components/layouts/navbar-component/navbar-component";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-inventario-layout-component',
  imports: [CommonModule, NavbarComponent, RouterOutlet],
  templateUrl: './inventario-layout-component.html',
  styleUrl: './inventario-layout-component.css',
})
export class InventarioLayoutComponent {
  Departamento: string = "Centro de Coordinacion de Emergencias";
  Region: string = "Tegucigalpa";

  sidebarOpen: boolean = false;

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
