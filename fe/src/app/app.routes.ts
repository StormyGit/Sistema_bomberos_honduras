import { Routes } from '@angular/router';
import { CceLayoutComponent } from './layouts/cce-layout-component/cce-layout-component';
import { IncidenteComponent } from './pages/cce/incidente-component/incidente-component';
import { IncidenteCreateComponent } from './pages/cce/incidente-create-component/incidente-create-component';
import { InventarioLayoutComponent } from './layouts/inventario-layout-component/inventario-layout-component';

export const routes: Routes = [
  {path:"cce", component: CceLayoutComponent, children:[
    {path:"incidente/create", component: IncidenteComponent},
    {path:"incidente", component: IncidenteCreateComponent},
  ]},
  {path:"inventario", component:InventarioLayoutComponent},

  {path:"**", redirectTo: "cce"}

];
