import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HrAttendanceComponent } from './hr-attendance/hr-attendance.component';
import { AddComponent } from './hr-employee/add/add.component';
import { EditComponent } from './hr-employee/edit/edit.component';
import { HrEmployeeComponent } from './hr-employee/hr-employee.component';
import { HrLabourComponent } from './hr-labour/hr-labour.component';
import { HrMachineReadingComponent } from './hr-machine-reading/hr-machine-reading.component';
import { HrVehicleComponent } from './hr-vehicle/hr-vehicle.component';
import { HrWorkingDailyDiaryComponent } from './hr-working-daily-diary/hr-working-daily-diary.component';
import { HrTaskComponent } from './hr-task/hr-task.component';
import { HrTaskDatailsComponent } from './hr-task-datails/hr-task-datails.component';
import { SalaryCreateComponent } from './hr-employee/salary-create/salary-create.component';
import { HrSalaryComponent } from './hr-salary/hr-salary.component';
import { SalaryProcessComponent } from './salary-process/salary-process.component';
import { VendorSalaryComponent } from './hr-salary/vendor-salary/vendor-salary.component';
import { VendorSalaryProcessComponent } from './hr-salary/vendor-salary-process/vendor-salary-process.component';
import { HrEmployeeAttendanceComponent } from './hr-attendance/hr-employee-attendance/hr-employee-attendance.component';
import { HrVendorAttendanceComponent } from './hr-attendance/hr-vendor-attendance/hr-vendor-attendance.component';
import { HrMachineAttendanceComponent } from './hr-attendance/hr-machine-attendance/hr-machine-attendance.component';
import { HrReportComponent } from './hr-report/hr-report.component';
import { LabourReportComponent } from './hr-report/labour-report/labour-report.component';
import { MachineReportComponent } from './hr-report/machine-report/machine-report.component';
import { HrCompanyComponent } from './hr-company/hr-company.component';
import { HrContractorComponent } from './hr-contractor/hr-contractor.component';

const routes: Routes = [
  {path : 'hr-attendance', component: HrAttendanceComponent},
  {path : 'hr-employee', component: HrEmployeeComponent},
  {path : 'hr-vendor', component: HrLabourComponent},
  {path : 'hr-machine-reading', component: HrMachineReadingComponent},
  {path : 'hr-vehicle', component: HrVehicleComponent},
  {path : 'hr-working-daily-diary', component: HrWorkingDailyDiaryComponent},
  {path : 'hr-task',component : HrTaskComponent},
  {path : 'hr-task-details/:id/:method',component : HrTaskDatailsComponent},
  {path : 'hr-working-daily-diary', component: HrWorkingDailyDiaryComponent},
  {path : 'hr-employee-add', component: AddComponent},
  {path : 'hr-employee-details/:id/:method', component: EditComponent},
  {path : 'hr-employee-salary-create', component: SalaryCreateComponent},
  {path : 'vendor-salary', component: VendorSalaryComponent},
  {path : 'employee-salary', component: HrSalaryComponent},
  {path : 'salary-process', component:SalaryProcessComponent},
  {path : 'vendor-salary-process', component:VendorSalaryProcessComponent},
  {path : 'hr-employee-attendance', component:HrEmployeeAttendanceComponent},
  {path : 'hr-vendor-attendance', component:HrVendorAttendanceComponent},
  {path : 'hr-machine-attendance', component:HrMachineAttendanceComponent},
  {path:'hr-report',component:HrReportComponent},
  {path:'hr-labour-report',component:LabourReportComponent},
  {path:'hr-machine-report',component:MachineReportComponent},
  {path:'hr-company',component:HrCompanyComponent},
  {path: 'hr-contractors', component:HrContractorComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HrRoutingModule { }