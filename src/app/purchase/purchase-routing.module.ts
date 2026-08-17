import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProductPurchaseComponent } from './product-purchase/product-purchase.component';
import { PurchaseExpenseComponent } from './purchase-expense/purchase-expense.component';
import { PurchaseMaterialComponent } from './purchase-material/purchase-material.component';
import { AddPurchaseOrderComponent } from './purchase-order/add-purchase-order/add-purchase-order.component';
import { PurchaseOrderComponent } from './purchase-order/purchase-order.component';
import { PurchasePropertyComponent } from './purchase-property/purchase-property.component';
import { PurchasePropinfoComponent } from './purchase-propinfo/purchase-propinfo.component';
import { PurchaseSellerComponent } from './purchase-seller/purchase-seller.component';

const routes: Routes = [
  {path : 'purchase-expense', component: PurchaseExpenseComponent},
  {path : 'purchase-material', component: PurchaseMaterialComponent},
  {path : 'purchase-property', component: PurchasePropertyComponent},
  {path : 'purchase-propinfo', component: PurchasePropinfoComponent},
  {path : 'purchase-seller', component: PurchaseSellerComponent},
  {path : 'purchase-order', component: PurchaseOrderComponent},
  {path : 'add-purchase-order', component: AddPurchaseOrderComponent},
  {path: 'add-purchase-order/:purchase_order_id', component: AddPurchaseOrderComponent },
  {path : 'product-purchase', component: ProductPurchaseComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PurchaseRoutingModule { }
