import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { StockManagementRoutingModule } from './stock-management-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule,ReactiveFormsModule,} from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { IntlModule } from '@progress/kendo-angular-intl';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { NgxSpinnerModule } from 'ngx-spinner';
import {AutocompleteLibModule} from 'angular-ng-autocomplete';
import { StockInventoryComponent } from './stock-inventory/stock-inventory.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { StockGatePassComponent } from './stock-gate-pass/stock-gate-pass.component';
import { StockPoPrComponent } from './stock-po-pr/stock-po-pr.component';
import { IndianCurrencyPipe } from '../pipes/indian-currency.pipe';
import { StockGateEntryNumberComponent } from './stock-gate-entry-number/stock-gate-entry-number.component';
import { StockGoodsReceivedNotesComponent } from './stock-goods-received-notes/stock-goods-received-notes.component';
import { StockAddGatePassComponent } from './stock-add-gate-pass/stock-add-gate-pass.component';
import { StockAddGrnComponent } from './stock-add-grn/stock-add-grn.component';
import { StockAddRentItemGatePassComponent } from './stock-add-rent-item-gate-pass/stock-add-rent-item-gate-pass.component';

@NgModule({
  declarations: [StockInventoryComponent, StockGatePassComponent, StockPoPrComponent,IndianCurrencyPipe, StockGateEntryNumberComponent, StockGoodsReceivedNotesComponent, StockAddGatePassComponent, StockAddGrnComponent, StockAddRentItemGatePassComponent],
  imports: [
    CommonModule,
    SharedModule,
    StockManagementRoutingModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    DataTablesModule,
    IntlModule,
    DateInputsModule,
    NgxSpinnerModule,
    AutocompleteLibModule,
    NgSelectModule
    
  ]
})
export class StockManagementModule { }
