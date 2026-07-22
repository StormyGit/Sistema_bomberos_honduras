import { User } from '../../../auth/auth.interface.ts';
import {
  Component,
  computed,
  inject,
  OnInit,
  signal
} from '@angular/core';

import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { Popover } from '../../popover/popover.js';
import { AuthServiceService } from '../../../auth/authService.service';

import {
  AccionTipo,
  PermisosService
} from '../../../service/seguridad/permisos-service';




interface NavbarPermiso {
  objetoId?: string;
  accion?: AccionTipo;
}

interface NavbarChild extends NavbarPermiso {
  path: string;
  name: string;
}

interface NavbarButton extends NavbarPermiso {
  path: string | null;
  name: string;
  child?: NavbarChild[];
}


/*
 * Reemplaza los IDs pendientes por los UUID reales
 * que tengas registrados en segur_objeto.
 */
const OBJETOS_ID = {

  MODULO_SEGURIDAD:
    '63610ac6-0815-4044-82ec-db9fc1201279',

  MODULO_CCE:
    'cd65e978-b655-4c18-b70e-e973676b92a4',

  PAGINA_USUARIOS:
    'COLOCA-ID-PAGINA-USUARIOS',

  PAGINA_ROLES:
    'COLOCA-ID-PAGINA-ROLES',

  PAGINA_OBJETOS:
    'COLOCA-ID-PAGINA-OBJETOS',

  PAGINA_INCIDENTES:
    'COLOCA-ID-PAGINA-INCIDENTES',

  PAGINA_INFORMES:
    'COLOCA-ID-PAGINA-INFORMES'

} as const;


@Component({
  selector: 'app-navbar-component',
  imports: [
    Popover
  ],
  templateUrl: './navbar-component.html',
  styleUrl: './navbar-component.css',
})
export class NavbarComponent implements OnInit {

  private readonly router = inject(Router);

  readonly scrAuth =
    inject(AuthServiceService);

  private readonly svrPermiso =
    inject(PermisosService);

  readonly User = signal<User | null>(
    this.scrAuth.getUser
  );

  readonly cargandoMenu =
    signal<boolean>(true);

  openIndex: number | null = null;

  /*
   * Menú completo sin filtrar.
   */
  readonly listButtons: NavbarButton[] = [
    {
      path: '/dashboard',
      name: 'Dashboard'
    },

    {
      path: null,
      name: 'Seguridad',

      objetoId:
        OBJETOS_ID.MODULO_SEGURIDAD,

      accion: 'View',

      child: [
        {
          path: '/seguridad/usuarios',
          name: 'Usuarios',
          accion: 'View'
        },
        {
          path: '/seguridad/roles',
          name: 'Rol',
          accion: 'View'
        },
        {
          path: '/seguridad/objeto',
          name: 'Objeto',

          accion: 'View'
        },
        {
          path: '/seguridad/estaciones',
          name: 'Estaciones',

          accion: 'View'
        },
        {
          path: '/seguridad/incidenteTipo',
          name: 'Tipos',

          accion: 'View'
        }
      ]
    },

    {
      path: null,
      name: 'Incidentes',

      objetoId:
        OBJETOS_ID.MODULO_CCE,

      accion: 'View',

      child: [
        {
          path: '/cce/incidente',
          name: 'Generar',
          accion: 'View'
        },
        {
          path: '/cce/incidente/create',
          name: 'Informes',
          accion: 'View'
        }
      ]
    }
  ];

  /*
   * Menú que realmente se mostrará.
   *
   * 1. Verifica permiso del módulo.
   * 2. Filtra las páginas sin permiso.
   * 3. Oculta módulos que no tengan páginas visibles.
   */
  readonly listButtonsVisibles = computed<NavbarButton[]>(() => {

    return this.listButtons
      .map((item): NavbarButton | null => {

        /*
         * Elemento sin objetoId, como Dashboard.
         */
        if (!item.objetoId) {
          return item;
        }

        /*
         * Si no puede ver el módulo o elemento principal,
         * se elimina completamente del navbar.
         */
        if (!this.puedeVer(item)) {
          return null;
        }

        /*
         * Elemento sin hijos.
         */
        if (!item.child?.length) {
          return item;
        }

        /*
         * Filtrar las páginas del módulo.
         */
        const hijosVisibles =
          item.child.filter(child =>
            this.puedeVer(child)
          );

        /*
         * Si no puede ver ninguna página del módulo,
         * ocultamos también el módulo.
         */
        if (hijosVisibles.length === 0) {
          return null;
        }

        return {
          ...item,
          child: hijosVisibles
        };
      })
      .filter(
        (item): item is NavbarButton =>
          item !== null
      );
  });

  ngOnInit(): void {

    this.svrPermiso
      .cargarPermisosUsuario()
      .pipe(
        finalize(() => {
          this.cargandoMenu.set(false);
        })
      )
      .subscribe({
        error: error => {
          console.error(
            'Error al cargar permisos del navbar:',
            error
          );
        }
      });
  }

  private puedeVer(
    item: NavbarPermiso
  ): boolean {

    /*
     * Los elementos sin objetoId se muestran siempre
     * mientras el usuario esté autenticado.
     */
    if (!item.objetoId) {
      return true;
    }

    return this.svrPermiso.tienePermiso(
      item.objetoId,
      item.accion ?? 'View'
    );
  }

  clickButton(
    item: NavbarButton,
    index: number
  ): void {

    if (!this.puedeVer(item)) {
      return;
    }

    if (item.child?.length) {
      this.openIndex =
        this.openIndex === index
          ? null
          : index;

      return;
    }

    if (item.path) {
      this.irPagina(item.path);
    }
  }

  clickChild(
    child: NavbarChild
  ): void {

    if (!this.puedeVer(child)) {
      return;
    }

    this.openIndex = null;
    this.irPagina(child.path);
  }

  irPagina(path: string): void {
    this.router.navigate([path]);
  }

  isOpen(index: number): boolean {
    return this.openIndex === index;
  }

  isActive(path: string | null): boolean {

    if (!path) {
      return false;
    }

    return this.router.url === path;
  }

  onLogout(): void {

    this.svrPermiso.limpiarPermisos();

    this.scrAuth.logout();

    this.router.navigate(['/login']);
  }
}
