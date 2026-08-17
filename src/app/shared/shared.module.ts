import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { NavbarComponent } from './navbar/navbar.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { EmployeeModelComponent } from './employee-model/employee-model.component';
import { FormsModule,ReactiveFormsModule,} from '@angular/forms';
import { MachineReadingPopupComponent } from './machine-reading-popup/machine-reading-popup.component';
import { TaskModelComponent } from './task-model/task-model.component';
import { ProjectGodownModelComponent } from './project-godown-model/project-godown-model.component';
import { ApiService } from './services/api.services';
import { SecurityService } from './services/encrypt-decrypt';
import { AddBookingRegistryComponent } from './add-booking-registry/add-booking-registry.component';
import {AutocompleteLibModule} from 'angular-ng-autocomplete';
import { BookingRegistryModalComponent } from './booking-registry-modal/booking-registry-modal.component';
import { DataTablesModule } from 'angular-datatables';
import { TransactionModalComponent } from './transaction-modal/transaction-modal.component';

@NgModule({

  declarations: [HeaderComponent, NavbarComponent, EmployeeModelComponent, MachineReadingPopupComponent, TaskModelComponent, AddBookingRegistryComponent, BookingRegistryModalComponent,ProjectGodownModelComponent, TransactionModalComponent],
  imports: [
    CommonModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    AutocompleteLibModule,
    NgSelectModule,
    DataTablesModule,
  ],
    
  exports: [HeaderComponent, NavbarComponent],
  bootstrap: []
})
export class SharedModule { }
