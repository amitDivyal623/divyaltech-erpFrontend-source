import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PurchaseRoutingModule } from './purchase-routing.module';

import { SharedModule } from '../shared/shared.module';
import { PurchaseExpenseComponent } from './purchase-expense/purchase-expense.component';
import { PurchaseMaterialComponent } from './purchase-material/purchase-material.component';
import { PurchasePropertyComponent } from './purchase-property/purchase-property.component';
import { PurchasePropinfoComponent } from './purchase-propinfo/purchase-propinfo.component';
import { PurchaseSellerComponent } from './purchase-seller/purchase-seller.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PurchaseOrderComponent } from './purchase-order/purchase-order.component';
import { AddPurchaseOrderComponent } from './purchase-order/add-purchase-order/add-purchase-order.component';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { ProductPurchaseComponent } from './product-purchase/product-purchase.component';


@NgModule({
  declarations: [ PurchaseExpenseComponent, PurchaseMaterialComponent, PurchasePropertyComponent, PurchasePropinfoComponent, PurchaseSellerComponent, PurchaseOrderComponent, AddPurchaseOrderComponent, ProductPurchaseComponent],
  imports: [
    CommonModule,
    PurchaseRoutingModule,
    SharedModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports : [PurchaseExpenseComponent, PurchaseMaterialComponent, PurchasePropertyComponent, PurchasePropinfoComponent, PurchaseSellerComponent,PurchaseOrderComponent,AddPurchaseOrderComponent, ProductPurchaseComponent],
})
export class PurchaseModule { }
