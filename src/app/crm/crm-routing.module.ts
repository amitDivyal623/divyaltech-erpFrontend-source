import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CrmCustomerComponent } from './crm-customer/crm-customer.component';
import { CrmEnquiryComponent } from './crm-enquiry/crm-enquiry.component';
import { CrmTaskComponent } from './crm-task/crm-task.component';
import { CrmVisitorsComponent } from './crm-visitors/crm-visitors.component';
import {CrmTaskDetailsComponent} from './crm-task-details/crm-task-details.component';
import { CrmPurchaseComponent } from './crm-purchase/crm-purchase.component';
import { AddIndentComponent } from './crm-purchase/add-indent/add-indent.component';
import { ViewIndentComponent } from './crm-purchase/view-indent/view-indent.component';
import { UpdateIndentComponent } from './crm-purchase/update-indent/update-indent.component';
import { AddCrmEnquiryComponent } from './crm-enquiry/add-crm-enquiry/crm-enquiry-details.component';
// import { AddRegistryComponent } from '../booking-registry/add-registry/add-registry.component';

const routes: Routes = [
  {path : 'crm-customer', component: CrmCustomerComponent},
  {path : 'crm-enquiry', component: CrmEnquiryComponent},
  {path : 'crm-task', component: CrmTaskComponent},
  {path : 'crm-visitors', component: CrmVisitorsComponent},
  {path : 'crm-task-details/:id/:method',component : CrmTaskDetailsComponent},
  {path : 'crm-purchase',component: CrmPurchaseComponent},
  {path : 'crm-add-indent',component: AddIndentComponent},
  {path : 'crm-view-indent',component:ViewIndentComponent},
  {path : 'crm-update-indent',component:UpdateIndentComponent},
  {path : 'crm-enquiry-details/:method',component : AddCrmEnquiryComponent},
  // {path : 'crm-enquiry-details/:id/:customerID/:method',component : AddCrmEnquiryComponent},
  {path : 'crm-enquiry-details/:id/:method',component : AddCrmEnquiryComponent},
  
  // {path : 'registry-booking',component : AddRegistryComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CrmRoutingModule { }
