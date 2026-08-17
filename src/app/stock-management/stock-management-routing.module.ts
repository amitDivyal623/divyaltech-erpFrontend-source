import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StockInventoryComponent } from './stock-inventory/stock-inventory.component';
import { StockManagementModule } from './stock-management.module';
import { StockGatePassComponent } from './stock-gate-pass/stock-gate-pass.component';
import { StockPoPrComponent } from './stock-po-pr/stock-po-pr.component';
import { StockGateEntryNumberComponent } from './stock-gate-entry-number/stock-gate-entry-number.component';
import { StockGoodsReceivedNotesComponent } from './stock-goods-received-notes/stock-goods-received-notes.component';
import { StockAddGatePassComponent } from './stock-add-gate-pass/stock-add-gate-pass.component';
import { StockAddGrnComponent } from './stock-add-grn/stock-add-grn.component';
import { StockAddRentItemGatePassComponent } from './stock-add-rent-item-gate-pass/stock-add-rent-item-gate-pass.component';
const routes: Routes = [
  {path:'stock-inventory', component: StockInventoryComponent},
  {path:'stock-gate-pass', component: StockGatePassComponent},
  {path:'stock-po-pr', component:StockPoPrComponent},
  {path : 'stock-gate-entry-number', component: StockGateEntryNumberComponent},
  {path : 'stock-goods-received-notes', component: StockGoodsReceivedNotesComponent},
  {path : 'stock-add-gate-pass', component: StockAddGatePassComponent},
  {path : 'stock-add-gate-pass/:gate-pass-id', component: StockAddGatePassComponent},
  {path : 'stock-add-grn', component:StockAddGrnComponent},
  {path: 'stock-add-grn/:grn_id', component: StockAddGrnComponent},
  {path: 'stock-add-rent-item-gate-pass', component: StockAddRentItemGatePassComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StockManagementRoutingModule { }
