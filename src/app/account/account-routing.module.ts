import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccountBillingComponent } from './account-billing/account-billing.component'; 
import { AccountAccountantComponent } from './account-accountant/account-accountant.component';
import { AccountTransactionComponent } from './account-transaction/account-transaction.component';
import { AccountBankAccountsComponent } from './account-bank-accounts/account-bank-accounts.component';
import { AccountVendorDetailsComponent } from './account-vendor-details/account-vendor-details.component';
import { AccountContractorDetailsComponent } from './account-contractor-details/account-contractor-details.component';

const routes: Routes = [
  {path : 'account-billing', component: AccountBillingComponent},
  {path : 'account-transaction', component: AccountTransactionComponent},
  {path : 'account-bank-accounts', component: AccountBankAccountsComponent},
  {path: 'account-accountant', component: AccountAccountantComponent},
  {path: 'account-vendordetails', component: AccountVendorDetailsComponent},
  {path: 'account-contractorDetails', component: AccountContractorDetailsComponent}
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountRoutingModule { }
