import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdministrationCompanyInfoComponent } from './administration-company-info/administration-company-info.component';
import { AdministrationRoleComponent } from './administration-role/administration-role.component';
import { AdministrationUsersComponent } from './administration-users/administration-users.component';

const routes: Routes = [
  {path : 'administration-company-info', component: AdministrationCompanyInfoComponent},
  {path : 'admin-administration-role', component: AdministrationRoleComponent},
  {path : 'admin-administration-users', component: AdministrationUsersComponent}
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdministrationRoutingModule { }
