import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReportAttendanceComponent } from './report-attendance/report-attendance.component';
import { ReportEnquiryComponent } from './report-enquiry/report-enquiry.component';
import { ReportProjectsComponent } from './report-projects/report-projects.component';
import { ReportExpenseComponent } from './report-expense/report-expense.component';
import { ReportBookingComponent } from './report-booking/report-booking.component';
import { UserActivityLogsComponent } from './user-activity-logs/user-activity-logs/user-activity-logs.component';

const routes: Routes = [
  {path : 'report-attendance', component: ReportAttendanceComponent},
  {path : 'report-booking', component: ReportBookingComponent},
  {path : 'report-enquiry', component: ReportEnquiryComponent},
  {path : 'report-projects', component: ReportProjectsComponent},
  {path : 'report-expense', component: ReportExpenseComponent},
  {path : 'report-user-activity-logs', component: UserActivityLogsComponent}

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportRoutingModule { }
