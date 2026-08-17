import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductMasterComponent } from './product-master/product-master.component';
import { ItemMasterComponent } from './item-master/item-master.component';
import { AddProductMasterComponent } from './product-master/add-product-master/add-product-master.component';
import { SettingsComponent } from './settings/settings.component';
import { ProductStockmangComponent } from './product-stockmang/product-stockmang.component';


const routes: Routes = [
  {path : 'product-item-master', component: ItemMasterComponent},
  {path : 'product-master', component: ProductMasterComponent},
  {path : 'add-product', component: AddProductMasterComponent},
  {path : 'product-Details/:id/:method', component: AddProductMasterComponent},
  {path : 'settings', component: SettingsComponent},
  {path : 'product-stock', component: ProductStockmangComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductRoutingModule { }
