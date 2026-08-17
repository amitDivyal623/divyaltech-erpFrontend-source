import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FileMgmtComponent } from './file-mgmt/file-mgmt.component';


const routes: Routes = [
  {path : 'file-mgmt', component: FileMgmtComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FileMgmtRoutingModule { }
