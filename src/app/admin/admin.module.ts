import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminPlaceComponent } from './admin-place/admin-place.component';
import { SharedModule } from '../shared/shared.module';
import { AdminComponent } from './admin.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule,ReactiveFormsModule,} from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { IntlModule } from '@progress/kendo-angular-intl';
import { MasterEntryComponent } from './master-entry/master-entry.component';
import { CompanyCalendarComponent } from './company-calendar/company-calendar.component';
import { ItemMasterComponent } from './item-master/item-master.component';
import { WarehouseComponent } from './warehouse/warehouse.component';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [ AdminPlaceComponent, AdminComponent, MasterEntryComponent, CompanyCalendarComponent, ItemMasterComponent, WarehouseComponent],
  imports: [
    CommonModule,
    AdminRoutingModule,
    SharedModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    DataTablesModule,
    IntlModule
  ],
  exports : [AdminPlaceComponent, MasterEntryComponent,CompanyCalendarComponent],
  bootstrap: []
})
export class AdminModule { }
