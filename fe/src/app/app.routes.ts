import { Routes } from '@angular/router';
import { CceLayoutComponent } from './layouts/cce-layout-component/cce-layout-component';
import { IncidenteComponent } from './pages/cce/incidente-component/incidente-component';
import { IncidenteCreateComponent } from './pages/cce/incidente-create-component/incidente-create-component';
import { InventarioLayoutComponent } from './layouts/inventario-layout-component/inventario-layout-component';
import { LoginLayoutComponent } from './layouts/login-layout-component/login-layout-component';
import { authGuard, authGuard_login } from './guards/auth.guard';
import { UsuariosComponent } from './pages/seguridad/usuarios-component/usuarios-component';
import { RolComponents } from './pages/seguridad/rol-components/rol-components';
import { ObjetoComponent } from './pages/seguridad/objeto-component/objeto-component';
import { PermisosComponent } from './pages/seguridad/permisos-component/permisos-component';

export const routes: Routes = [
  {
    path:"cce",
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    component: CceLayoutComponent, children:[
      {path:"incidente/create", component: IncidenteComponent},
      {path:"incidente", component: IncidenteCreateComponent},
  ]},
  {
    path:"seguridad",
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    component: CceLayoutComponent, children:[
      {path:"usuarios", component: UsuariosComponent},
      {path:"roles", component: RolComponents},
      {path:'roles/:rolId/permisos', component: PermisosComponent},
      {path:"objeto", component: ObjetoComponent},
  ]},

  {
    path:"inventario",
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    component:InventarioLayoutComponent
  },
  {path:"login", canActivate: [authGuard_login], component:LoginLayoutComponent},

  {path:"**", redirectTo: "cce"}

];
