import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule,ReactiveFormsModule} from '@angular/forms';
import { FileMgmtRoutingModule } from './file-mgmt-routing.module';
import { FileMgmtComponent } from './file-mgmt/file-mgmt.component';
import { SharedModule } from '../shared/shared.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DataTablesModule } from 'angular-datatables';
import { NgSelectModule } from '@ng-select/ng-select';



@NgModule({
  declarations: [FileMgmtComponent],
  imports: [
    CommonModule,
    FileMgmtRoutingModule,
    SharedModule,
    NgbModule,
    ReactiveFormsModule,
    FormsModule,
    DataTablesModule,
    NgSelectModule
  
  
  ]
})
export class FileMgmtModule { }
