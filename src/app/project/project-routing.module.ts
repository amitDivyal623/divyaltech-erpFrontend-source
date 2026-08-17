import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProjectVendorComponent } from './project-vendor/project-vendor.component';
import { ProjectMappingComponent } from './project-mapping/project-mapping.component';
import { ProjectMaterialComponent } from './project-material/project-material.component';
import { AddNewProjectComponent } from './project-mgmt/add-new-project/add-new-project.component';
import { ProjectGodownComponent } from './project-godown/project-godown.component';
import { ProjectMgmtComponent } from './project-mgmt/project-mgmt.component';
import { ProjectWorkContractComponent } from './project-work-contract/project-work-contract.component';

const routes: Routes = [
  {path : 'project-vendor', component: ProjectVendorComponent},
  {path : 'project-mapping', component: ProjectMappingComponent},
  {path : 'project-material', component: ProjectMaterialComponent},
  {path : 'project-mgmt', component: ProjectMgmtComponent},
  {path : 'project-godown', component: ProjectGodownComponent},
  {path : 'project-work-contract', component:ProjectWorkContractComponent},
  { path: 'project-add', component: AddNewProjectComponent },
  {path : 'project-edit/:id/:method', component: AddNewProjectComponent},
  {path : 'project-view/:id/:method', component:AddNewProjectComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectRoutingModule { }
