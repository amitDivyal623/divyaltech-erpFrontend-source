import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportRoutingModule } from './report-routing.module';
import { ReportAttendanceComponent } from './report-attendance/report-attendance.component';
import { SharedModule } from '../shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReportEnquiryComponent } from './report-enquiry/report-enquiry.component';
import { ReportProjectsComponent } from './report-projects/report-projects.component';
import { ReportBookingComponent } from './report-booking/report-booking.component';
import { ReportExpenseComponent } from './report-expense/report-expense.component';
import { UserActivityLogsComponent } from './user-activity-logs/user-activity-logs/user-activity-logs.component';
import { DataTablesModule } from 'angular-datatables';

@NgModule({
  declarations: [ReportAttendanceComponent, ReportEnquiryComponent, ReportProjectsComponent, ReportBookingComponent, ReportExpenseComponent, UserActivityLogsComponent],
  imports: [
    CommonModule,
    ReportRoutingModule,
    SharedModule,
    NgbModule,
    DataTablesModule
  ],
  exports: [ReportAttendanceComponent]
})
export class ReportModule { }
