import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminPlaceComponent } from './admin-place/admin-place.component';
import { MasterEntryComponent } from './master-entry/master-entry.component';
import { CompanyCalendarComponent } from './company-calendar/company-calendar.component';
import { ItemMasterComponent } from './item-master/item-master.component';
import { WarehouseComponent } from './warehouse/warehouse.component';

const routes: Routes = [
  {path: 'admin-place',component: AdminPlaceComponent,},
  {path: 'admin-master-entry',component:MasterEntryComponent,},
  {path: 'admin-company-calendar',component:CompanyCalendarComponent,},
  {path: 'admin-item-master',component:ItemMasterComponent,},
  {path: 'warehouse', component:WarehouseComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
