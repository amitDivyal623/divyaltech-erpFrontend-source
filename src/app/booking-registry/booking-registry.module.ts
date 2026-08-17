import { NgModule } from '@angular/core';
import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { BookingRegistryRoutingModule } from './booking-registry-routing.module';
import { LandlordVendorComponent } from './landlord-vendor/landlord-vendor.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { NgSelectModule } from '@ng-select/ng-select';
import { RegistryRecordComponent } from './registry-record/registry-record.component';
import { AddLandlordComponent } from './add-landlord/add-landlord.component';
import { PowerAttorneyComponent } from './power-attorney/power-attorney.component';
import { LandDetailComponent } from './land-detail/land-detail.component';
import {AutocompleteLibModule} from 'angular-ng-autocomplete';
import { BookingRegistryTaskComponent } from './booking-registry-task/booking-registry-task.component';
import { ChequeListComponent } from './cheque-list/cheque-list.component';
import { DocumentFollowupComponent } from './document-followup/document-followup.component';
import { TransactionListComponent } from './transaction-list/transaction-list.component';
import { PaymentFollowupComponent } from './payment-followup/payment-followup.component';
import { NgxSpinnerModule } from "ngx-spinner";
// import { AddRegistryComponent } from './add-registry/add-registry.component';


@NgModule({
  declarations: [LandlordVendorComponent, RegistryRecordComponent, AddLandlordComponent, PowerAttorneyComponent, LandDetailComponent, BookingRegistryTaskComponent, ChequeListComponent, DocumentFollowupComponent,TransactionListComponent, PaymentFollowupComponent],
  imports: [
    SharedModule,
    NgbModule,
    BookingRegistryRoutingModule,
    SharedModule,
    NgbModule,
    NgxSpinnerModule,
    FormsModule,
    ReactiveFormsModule,
    DataTablesModule,
    NgSelectModule,
    CommonModule,
    AutocompleteLibModule,
    
  ],
  exports: [LandlordVendorComponent,NgxSpinnerModule]
})
export class BookingRegistryModule { }
