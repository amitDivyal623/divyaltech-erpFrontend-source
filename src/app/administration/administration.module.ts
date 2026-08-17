import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdministrationRoutingModule } from './administration-routing.module';
import { SharedModule } from '../shared/shared.module';
import { AdministrationCompanyInfoComponent } from './administration-company-info/administration-company-info.component';
import { AdministrationRoleComponent } from './administration-role/administration-role.component';
import { AdministrationUsersComponent } from './administration-users/administration-users.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { NgSelectModule } from '@ng-select/ng-select';
import {AutocompleteLibModule} from 'angular-ng-autocomplete';

@NgModule({
  declarations: [AdministrationCompanyInfoComponent, AdministrationRoleComponent, AdministrationUsersComponent],
  imports: [
    CommonModule,
    AdministrationRoutingModule,
    SharedModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    DataTablesModule,
    NgSelectModule,
    AutocompleteLibModule,
    
  ],
  exports: [AdministrationCompanyInfoComponent, AdministrationRoleComponent, AdministrationUsersComponent]
})
export class AdministrationModule { }
