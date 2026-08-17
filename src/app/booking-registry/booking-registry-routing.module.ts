import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AddLandlordComponent } from './add-landlord/add-landlord.component';
import { BookingRegistryTaskComponent } from './booking-registry-task/booking-registry-task.component';
import { ChequeListComponent } from './cheque-list/cheque-list.component';
import { DocumentFollowupComponent } from './document-followup/document-followup.component';
// import { AddRegistryComponent } from './add-registry/add-registry.component';
import { LandlordVendorComponent } from './landlord-vendor/landlord-vendor.component';
import { PaymentFollowupComponent } from './payment-followup/payment-followup.component';
import { RegistryRecordComponent } from './registry-record/registry-record.component';
import { TransactionListComponent } from './transaction-list/transaction-list.component';

const routes: Routes = [
  {path : 'reg-landlord', component: LandlordVendorComponent},
  {path : 'reg-record',component: RegistryRecordComponent},
  {path : 'add-landlord/:id/:method',component: AddLandlordComponent},
  {path : 'reg-booking-task',component: BookingRegistryTaskComponent},
  {path : 'reg-cheque-list',component: ChequeListComponent},
  {path : 'reg-document-followup',component: DocumentFollowupComponent },
  {path : 'reg-trans-list',component: TransactionListComponent},
  {path : 'reg-payment-followup',component: PaymentFollowupComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BookingRegistryRoutingModule { }
