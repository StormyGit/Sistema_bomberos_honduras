import { User } from './../../../auth/auth.interface.ts';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Popover } from "../../../shared/popover/popover";
import { AuthServiceService } from '../../../auth/authService.service';

interface NavbarChild {
  path: string;
  name: string;
}

interface NavbarButton {
  path: string | null;
  name: string;
  child?: NavbarChild[];
}

@Component({
  selector: 'app-navbar-component',
  imports: [Popover],
  templateUrl: './navbar-component.html',
  styleUrl: './navbar-component.css',
})
export class NavbarComponent {

  route = inject(Router);
  scrAuth         = inject(AuthServiceService);
  User = signal(this.scrAuth.getUser);
  openIndex: number | null = null;
    private router = inject(Router);

listButtons: NavbarButton[] = [
  { path: '/cce', name: 'Dashboard' },
  {
    path: null,
    name: 'Seguridad',
    child: [
      { path: '/seguridad/usuarios', name: 'Usuarios' },
      { path: '/seguridad/roles', name: 'Rol' },
      { path: '/seguridad/objeto', name: 'Objeto' },
    ],
  },

  {
    path: null,
    name: 'Incidentes',
    child: [
      { path: '/cce/incidente', name: 'Generar' },
      { path: '/cce/incidente/create', name: 'Informes' }
    ],
  },

];

  clickButton(item: NavbarButton, index: number) {
    if (item.child && item.child.length > 0) {
      this.openIndex = this.openIndex === index ? null : index;
      return;
    }

    if (item.path) {
      this.irPagina(item.path);
    }
  }

  irPagina(path: string) {
    this.route.navigate([path]);
  }

  isOpen(index: number): boolean {
    return this.openIndex === index;
  }

  isActive(path: string | null): boolean {
    if (!path) return false;
    return this.route.url === path;
  }

  onLogout(){
    this.scrAuth.logout();
    this.router.navigate(['/login']);
  }
}
