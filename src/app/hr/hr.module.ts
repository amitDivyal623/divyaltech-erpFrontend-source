import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HrAttendanceComponent } from './hr-attendance/hr-attendance.component';
import { HrEmployeeComponent } from './hr-employee/hr-employee.component';
import { HrLabourComponent } from './hr-labour/hr-labour.component';
import { HrMachineReadingComponent } from './hr-machine-reading/hr-machine-reading.component';
import { HrVehicleComponent } from './hr-vehicle/hr-vehicle.component';
import { HrWorkingDailyDiaryComponent } from './hr-working-daily-diary/hr-working-daily-diary.component';
import { HrRoutingModule } from './hr-routing.module';
import { SharedModule } from '../shared/shared.module';
import { HrTaskComponent } from './hr-task/hr-task.component';
import { HrTaskDatailsComponent } from './hr-task-datails/hr-task-datails.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule,ReactiveFormsModule,} from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { from } from 'rxjs';
import { NgxSpinnerModule } from 'ngx-spinner';
import { AddComponent } from './hr-employee/add/add.component';
import { EditComponent } from './hr-employee/edit/edit.component';
import { SalaryCreateComponent } from './hr-employee/salary-create/salary-create.component';
import { HrSalaryComponent } from './hr-salary/hr-salary.component';
import { IntlModule } from '@progress/kendo-angular-intl';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import {DatePipe} from '@angular/common';
import { SalaryProcessComponent } from './salary-process/salary-process.component';
import { VendorSalaryComponent } from './hr-salary/vendor-salary/vendor-salary.component';
import { VendorSalaryProcessComponent } from './hr-salary/vendor-salary-process/vendor-salary-process.component';
import { SalaryHistoryComponent } from './hr-salary/salary-history/salary-history.component';
import { AttendanceDetailsComponent } from './hr-salary/attendance-details/attendance-details.component';
import { LabourAttendanceDetailsComponent } from './hr-salary/vendor-salary/labour-attendance-details/labour-attendance-details.component';
import { MachineryDetailsComponent } from './hr-labour/machinery-details/machinery-details.component';
import { HrEmployeeAttendanceComponent } from './hr-attendance/hr-employee-attendance/hr-employee-attendance.component';
import { HrVendorAttendanceComponent } from './hr-attendance/hr-vendor-attendance/hr-vendor-attendance.component';
import { HrMachineAttendanceComponent } from './hr-attendance/hr-machine-attendance/hr-machine-attendance.component';
import { HrReportComponent } from './hr-report/hr-report.component';
import { MachineReportComponent } from './hr-report/machine-report/machine-report.component';
import { LabourReportComponent } from './hr-report/labour-report/labour-report.component';
import { HrCompanyComponent } from './hr-company/hr-company.component';
import { HrContractorComponent } from './hr-contractor/hr-contractor.component';

@NgModule({
  declarations: [HrAttendanceComponent, HrEmployeeComponent, HrLabourComponent, HrMachineReadingComponent, HrVehicleComponent, HrWorkingDailyDiaryComponent, HrTaskComponent ,HrTaskDatailsComponent,AddComponent,EditComponent, SalaryCreateComponent, HrSalaryComponent, SalaryProcessComponent, VendorSalaryComponent, VendorSalaryProcessComponent, SalaryHistoryComponent, AttendanceDetailsComponent, LabourAttendanceDetailsComponent, MachineryDetailsComponent, HrEmployeeAttendanceComponent, HrVendorAttendanceComponent, HrMachineAttendanceComponent, HrReportComponent, MachineReportComponent, LabourReportComponent, HrCompanyComponent, HrContractorComponent],
  imports: [
    CommonModule,
    HrRoutingModule,
    SharedModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    IntlModule,
    DateInputsModule,
    DataTablesModule,
    NgxSpinnerModule
  ],
  exports : [HrAttendanceComponent, HrEmployeeComponent, HrLabourComponent, HrMachineReadingComponent, HrVehicleComponent, HrWorkingDailyDiaryComponent, HrTaskComponent ,HrTaskDatailsComponent,AddComponent,EditComponent, SalaryCreateComponent, HrSalaryComponent, SalaryProcessComponent, VendorSalaryComponent,HrReportComponent],
  bootstrap: []
})
export class HrModule {
}

