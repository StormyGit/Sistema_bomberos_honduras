import { Routes } from '@angular/router';
import { CceLayoutComponent } from './layouts/cce-layout-component/cce-layout-component';
import { IncidenteComponent } from './pages/cce/incidente-component/incidente-component';
import { IncidenteCreateComponent } from './pages/cce/incidente-create-component/incidente-create-component';
import { InventarioLayoutComponent } from './layouts/inventario-layout-component/inventario-layout-component';
import { LoginLayoutComponent } from './layouts/login-layout-component/login-layout-component';
import { authGuard, authGuard_login, permisoGuard } from './guards/auth.guard';
import { UsuariosComponent } from './pages/seguridad/usuarios-component/usuarios-component';
import { RolComponents } from './pages/seguridad/rol-components/rol-components';
import { ObjetoComponent } from './pages/seguridad/objeto-component/objeto-component';
import { PermisosComponent } from './pages/seguridad/permisos-component/permisos-component';
import { PublicLayout } from './layouts/public-layout/public-layout';
import { IncidenteResumen } from './pages/public/incidente-resumen/incidente-resumen';
import { EstacionesCompenent } from './pages/seguridad/estaciones-compenent/estaciones-compenent';
import { UnidadesComponent } from './pages/seguridad/unidades-component/unidades-component';
import { SeguridadLayoutComponent } from './layouts/seguridad-layout-component/seguridad-layout-component';
import { DashboardLayoutComponent } from './layouts/dashboard-layout-component/dashboard-layout-component';
import { Compoenentesss } from './pages/compoenentesss/compoenentesss';
import { IncidenteTiposComponent } from './pages/seguridad/incidentes-tipos-component/incidentes-tipos-component';

export const routes: Routes = [
  {
    path:"cce",
    canActivate: [authGuard],
    canActivateChild: [authGuard, permisoGuard],
    data: {objetoId: 'cd65e978-b655-4c18-b70e-e973676b92a4',accion: 'View'},
    component: CceLayoutComponent, children:[
      {path:"incidente/create", component: IncidenteComponent,    data: {objetoId: 'cd65e978-b655-4c18-b70e-e973676b92a4',accion: 'View'},},
      {path:"incidente", component: IncidenteCreateComponent,    data: {objetoId: 'cd65e978-b655-4c18-b70e-e973676b92a4',accion: 'View'},},
      {path:"reporteIncidente/:idincidente", component:Compoenentesss, data: {objetoId: 'cd65e978-b655-4c18-b70e-e973676b92a4',accion: 'View'},},
  ]},
  {
    path:"seguridad",
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    component: SeguridadLayoutComponent, children:[
      {path:"usuarios", component: UsuariosComponent},
      {path:"roles", component: RolComponents},
      {path:'roles/:rolId/permisos', component: PermisosComponent},
      {path:"objeto", component: ObjetoComponent},
      {path:"estaciones", component: EstacionesCompenent},
      {path:"unidades/:idEstacion", component: UnidadesComponent},
      {path:"incidenteTipo", component: IncidenteTiposComponent},
  ]},

  {
    path:"inventario",
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    component:InventarioLayoutComponent
  },
  {path:"public", component:PublicLayout, children:[
      {path:"incidente/:incidenteId", component: IncidenteResumen},
  ]},
  {path:"login", canActivate: [authGuard_login], component:LoginLayoutComponent},
  {path:"dashboard", canActivate: [authGuard], component:DashboardLayoutComponent},
  {path:"**", redirectTo: "dashboard"}

];
