import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectRoutingModule } from './project-routing.module';

import { SharedModule } from '../shared/shared.module';
import { MachineryDetailsComponent } from './project-vendor/machinery-details/machinery-details.component';
import { ProjectVendorComponent } from './project-vendor/project-vendor.component';
import { ProjectMappingComponent } from './project-mapping/project-mapping.component';
import { ProjectMaterialComponent } from './project-material/project-material.component';
import { ProjectMgmtComponent } from './project-mgmt/project-mgmt.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AddNewProjectComponent } from './project-mgmt/add-new-project/add-new-project.component';
import { FormsModule,ReactiveFormsModule,} from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { from } from 'rxjs';
import { IntlModule } from '@progress/kendo-angular-intl';
import { NgSelectModule } from '@ng-select/ng-select';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import {DatePipe} from '@angular/common';
import { NgxSpinnerModule } from 'ngx-spinner';
import {AutocompleteLibModule} from 'angular-ng-autocomplete';
import { NotesDetailsComponent } from './project-mgmt/notes-details/notes-details.component';
import { AttachmentDetailsComponent } from './project-mgmt/attachment-details/attachment-details.component';
import { TaskDetailsComponent } from './project-mgmt/task-details/task-details.component';
import { HistoryDetailsComponent } from './project-mgmt/history-details/history-details.component';
import { ProjectGodownComponent } from './project-godown/project-godown.component';
import { ProjectWorkContractComponent } from './project-work-contract/project-work-contract.component';
@NgModule({

  declarations: [ ProjectVendorComponent,ProjectMappingComponent, ProjectMaterialComponent, ProjectMgmtComponent, AddNewProjectComponent, NotesDetailsComponent, AttachmentDetailsComponent, TaskDetailsComponent, HistoryDetailsComponent,MachineryDetailsComponent,ProjectGodownComponent, ProjectWorkContractComponent],
  imports: [
    CommonModule,
    ProjectRoutingModule,
    SharedModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    IntlModule,
    DateInputsModule,
    DataTablesModule,
    NgxSpinnerModule,
    AutocompleteLibModule,
    NgSelectModule,   
  ],
  exports : [ProjectVendorComponent,ProjectMappingComponent, ProjectMaterialComponent, ProjectMgmtComponent,AddNewProjectComponent,MachineryDetailsComponent],
})
export class ProjectModule { }
