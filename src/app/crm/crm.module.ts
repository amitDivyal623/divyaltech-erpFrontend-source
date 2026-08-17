import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrmRoutingModule } from './crm-routing.module';

import { SharedModule } from '../shared/shared.module';
import { CrmCustomerComponent } from './crm-customer/crm-customer.component';
import { CrmEnquiryComponent } from './crm-enquiry/crm-enquiry.component';
import { CrmTaskComponent } from './crm-task/crm-task.component';
import { CrmVisitorsComponent } from './crm-visitors/crm-visitors.component';
import { NgbDate, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CrmTaskDetailsComponent } from './crm-task-details/crm-task-details.component';
import { FormsModule,ReactiveFormsModule,} from '@angular/forms';
import { CrmPurchaseComponent } from './crm-purchase/crm-purchase.component';
import { AddIndentComponent } from './crm-purchase/add-indent/add-indent.component';
import { ViewIndentComponent } from './crm-purchase/view-indent/view-indent.component';
import { UpdateIndentComponent } from './crm-purchase/update-indent/update-indent.component';
import { DataTablesModule } from 'angular-datatables';
import { AddCrmEnquiryComponent } from './crm-enquiry/add-crm-enquiry/crm-enquiry-details.component';
import { CRMEnquiryVisitComponent } from './crm-enquiry/add-crm-enquiry/crmenquiry-visit/crmenquiry-visit.component';
import { CRMEnquiryFileComponent } from './crm-enquiry/add-crm-enquiry/crmenquiry-file/crmenquiry-file.component';
import { CrmRevisitComponent } from './crm-enquiry/crm-revisit/crm-revisit.component';
import {AutocompleteLibModule} from 'angular-ng-autocomplete';
import { NgSelectModule } from '@ng-select/ng-select';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { NgxSpinnerModule } from "ngx-spinner";
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';

@NgModule({
  declarations: [ CrmCustomerComponent, CrmEnquiryComponent, CrmTaskComponent,  CrmVisitorsComponent, CrmTaskDetailsComponent, CrmPurchaseComponent, CrmPurchaseComponent, AddIndentComponent, ViewIndentComponent, UpdateIndentComponent, AddCrmEnquiryComponent, CRMEnquiryVisitComponent, CRMEnquiryFileComponent, CrmRevisitComponent],
  
  imports: [
    CommonModule,
    CrmRoutingModule,
    SharedModule,
    NgxSpinnerModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    InputsModule,
    DataTablesModule,
    AutocompleteLibModule,
    NgSelectModule,
    DateInputsModule   
  ],
  exports : [ CrmCustomerComponent, CrmEnquiryComponent, CrmTaskComponent, NgxSpinnerModule, CrmVisitorsComponent, CrmTaskDetailsComponent, CrmPurchaseComponent, CrmPurchaseComponent, AddIndentComponent, ViewIndentComponent, UpdateIndentComponent, AddCrmEnquiryComponent, CRMEnquiryVisitComponent, CRMEnquiryFileComponent, CrmRevisitComponent]
  
})
export class CrmModule { }
