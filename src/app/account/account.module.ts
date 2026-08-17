import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { AccountRoutingModule } from './account-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { SharedModule } from '../shared/shared.module';
import { AccountBillingComponent } from './account-billing/account-billing.component';
import { AccountTransactionComponent } from './account-transaction/account-transaction.component';

import { AccountBankAccountsComponent } from './account-bank-accounts/account-bank-accounts.component';
import { AccountAccountantComponent } from './account-accountant/account-accountant.component';
import { AccountVendorDetailsComponent } from './account-vendor-details/account-vendor-details.component';
import { AccountContractorDetailsComponent } from './account-contractor-details/account-contractor-details.component';


@NgModule({
  declarations: [ AccountBillingComponent, AccountTransactionComponent, AccountBankAccountsComponent, AccountBankAccountsComponent, AccountAccountantComponent, AccountVendorDetailsComponent, AccountContractorDetailsComponent],
  imports: [
    CommonModule,
    AccountRoutingModule,
    SharedModule,
    FormsModule,
    DataTablesModule,
    ReactiveFormsModule,
    NgbModule
  ],
  exports : [AccountBillingComponent ,AccountTransactionComponent],
})
export class AccountModule { }
