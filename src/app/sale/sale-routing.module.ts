import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AddProjectMasterComponent } from './product-sale/add-project-master/add-project-master.component';
import { EditProjectMasterComponent } from './product-sale/edit-project-master/edit-project-master.component';
import { ProductSaleComponent } from './product-sale/product-sale.component';
import { ViewProjectMasterComponent } from './product-sale/view-project-master/view-project-master.component';
import { SaleBookingComponent } from './sale-booking/sale-booking.component';
import { AddSaleOrderComponent } from './sale-order/add-sale-order/add-sale-order.component';
import { EditSaleOrderComponent } from './sale-order/edit-sale-order/edit-sale-order.component';
import { SaleOrderComponent } from './sale-order/sale-order.component';
import { ViewSaleOrderComponent } from './sale-order/view-sale-order/view-sale-order.component';
import { AddPropertySaleComponent } from './sale-property/add-property-sale/add-property-sale.component';
import { SalePropertyComponent } from './sale-property/sale-property.component';

const routes: Routes = [
  {path : 'sale-booking', component: SaleBookingComponent},
  {path : 'sale-property', component: SalePropertyComponent},
  {path : 'sale-order', component: SaleOrderComponent},
  {path : 'product-sale', component: ProductSaleComponent},
  {path : 'add-project', component: AddProjectMasterComponent},
  {path : 'view-project', component: ViewProjectMasterComponent},
  {path : 'edit-project', component: EditProjectMasterComponent},
  {path : 'add-property-sale', component: AddPropertySaleComponent},
  {path : 'view-property-sale', component: ViewProjectMasterComponent},
  {path : 'edit-property-sale', component: EditProjectMasterComponent},
  {path : 'add-sale-order', component: AddSaleOrderComponent},
  {path : 'view-sale-order', component: ViewSaleOrderComponent},
  {path : 'edit-sale-order', component: EditSaleOrderComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SaleRoutingModule { }
