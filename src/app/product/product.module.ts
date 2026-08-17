import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductRoutingModule } from './product-routing.module';
import { ProductMasterComponent } from './product-master/product-master.component';
import { SharedModule } from '../shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IntlModule } from '@progress/kendo-angular-intl';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { ItemMasterComponent } from './item-master/item-master.component';
import { DataTablesModule } from 'angular-datatables';
import { AddProductMasterComponent } from './product-master/add-product-master/add-product-master.component';
import { SettingsComponent } from './settings/settings.component';
import { ProductLinkComponent } from './product-link/product-link.component';
import { UnitOfMeasureComponent } from './unit-of-measure/unit-of-measure.component';
import { GstSetupComponent } from './gst-setup/gst-setup.component';
import { ProductTypeComponent } from './product-type/product-type.component';
import { ProductCategoryComponent } from './product-category/product-category.component';
import { ProductStockmangComponent } from './product-stockmang/product-stockmang.component';
import { NgSelectModule } from '@ng-select/ng-select';


@NgModule({
  declarations: [ ProductMasterComponent, ItemMasterComponent, AddProductMasterComponent, SettingsComponent, ProductLinkComponent, UnitOfMeasureComponent, GstSetupComponent, ProductTypeComponent, ProductCategoryComponent, ProductStockmangComponent],
  imports: [
    CommonModule,
    DataTablesModule,
    ProductRoutingModule,
    SharedModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    IntlModule,
    DateInputsModule,
    NgSelectModule
  ],
  exports :[ ProductMasterComponent,ItemMasterComponent, AddProductMasterComponent,SettingsComponent],
  bootstrap: []
})
export class ProductModule { }
