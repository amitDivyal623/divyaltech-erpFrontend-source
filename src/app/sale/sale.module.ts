import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SaleRoutingModule } from './sale-routing.module';
import { SharedModule } from '../shared/shared.module';
import { SaleBookingComponent } from './sale-booking/sale-booking.component';
import { SalePropertyComponent } from './sale-property/sale-property.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ProductSaleComponent } from './product-sale/product-sale.component';
import { AddProjectMasterComponent } from './product-sale/add-project-master/add-project-master.component';
import { ViewProjectMasterComponent } from './product-sale/view-project-master/view-project-master.component';
import { EditProjectMasterComponent } from './product-sale/edit-project-master/edit-project-master.component';
import { AddPropertySaleComponent } from './sale-property/add-property-sale/add-property-sale.component';
import { EditPropertySaleComponent } from './sale-property/edit-property-sale/edit-property-sale.component';
import { SaleOrderComponent } from './sale-order/sale-order.component';
import { AddSaleOrderComponent } from './sale-order/add-sale-order/add-sale-order.component';
import { ViewSaleOrderComponent } from './sale-order/view-sale-order/view-sale-order.component';
import { EditSaleOrderComponent } from './sale-order/edit-sale-order/edit-sale-order.component';
import { FormsModule,ReactiveFormsModule} from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { NgSelectModule } from '@ng-select/ng-select';
import {AutocompleteLibModule} from 'angular-ng-autocomplete';

@NgModule({
  declarations: [ SaleBookingComponent, SalePropertyComponent, ProductSaleComponent, AddProjectMasterComponent, ViewProjectMasterComponent, EditProjectMasterComponent, AddPropertySaleComponent, EditPropertySaleComponent, SaleOrderComponent, AddSaleOrderComponent, ViewSaleOrderComponent, EditSaleOrderComponent],
  imports: [
    CommonModule,
    SaleRoutingModule,
    SharedModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    DataTablesModule,
    NgSelectModule,
    AutocompleteLibModule
  ],
  exports : [SaleBookingComponent, SalePropertyComponent, ProductSaleComponent, AddProjectMasterComponent, ViewProjectMasterComponent, EditProjectMasterComponent, AddPropertySaleComponent, EditPropertySaleComponent, SaleOrderComponent,AddSaleOrderComponent, ViewSaleOrderComponent, EditSaleOrderComponent],
})
export class SaleModule { }
