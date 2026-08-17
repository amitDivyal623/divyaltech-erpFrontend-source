import { Injectable } from '@angular/core';
import {HttpClient,HttpHeaders} from '@angular/common/http';
import { Observable,from,of } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  	providedIn: 'root'
})
export class ProjectService {
  public apiurl = environment.APIEndpoint;
  constructor( private http : HttpClient) { }

	public addProject(obj:any):Observable<any>{		
		return this.http.post(this.apiurl+`project.Add_Projects&reload=1`,obj);
	}

	public addNotes(obj:any):Observable<any>{		
		return this.http.post(this.apiurl+`project.add_Notes&reload=1`,obj);
	}

	public addtaskDetails(obj:any):Observable<any>{		
		return this.http.post(this.apiurl+`project.add_task&reload=1`,obj);
	}

	public addWorkDetails(obj:any):Observable<any>{
		return this.http.post(this.apiurl+`project.add_work_Details&reload=1`,obj);
	}

	public addattachment(obj:any):Observable<any>{
		return this.http.post(this.apiurl+`project.add_attachment&reload=1`,obj);
	}

	public addMaterial(obj:any):Observable<any>{		
		return this.http.post(this.apiurl+`project.delete_item&reload=1`,obj);
	}
	public project_edit_data(obj:any):Observable<any>{
		let projectData = new FormData();
		projectData.append('project_id',obj);
		return this.http.post(this.apiurl + 'project.edit_ProjectList&reload=1',projectData);
	}
	public deleteProject(obj:any):Observable<any>{
		let projectData = new FormData();
		projectData.append('project_id',obj);
		return this.http.post(this.apiurl + 'project.project_delete&reload=1',projectData);
	}
	public deletetask(obj:any):Observable<any>{
		let projectData = new FormData();
		projectData.append('task_id',obj);
		return this.http.post(this.apiurl + 'project.delete_task&reload=1',projectData);
	}

	public deletenotes(obj:any):Observable<any>{
		let projectData = new FormData();
		projectData.append('notesid',obj);
		return this.http.post(this.apiurl + 'project.deltes_Notes&reload=1',projectData);
	}
	public deleteattachment(obj:any):Observable<any>{
		let projectData = new FormData();
		projectData.append('attachment_id',obj);
		return this.http.post(this.apiurl + 'project.delete_attachment&reload=1',projectData);
	}
	// public deletematerial(obj:any):Observable<any>{
	// 	let projectData = new FormData();
	// 	projectData.append('material_id',obj);
	// 	return this.http.post(this.apiurl + 'project.material_delete&reload=1',projectData);
  	// }

	public deleteWorkDetail(obj:any): Observable<any>{
		return this.http.post(this.apiurl+ `project.deleteWorkDetail&reload=1`,obj);
	}
	public deleteMaterialConsume(obj:any): Observable<any>{
		return this.http.post(this.apiurl+ `project.deleteMaterialConsume&reload=1`,obj);
	}
	public DeleteMaterialByid(obj:any): Observable<any>{
		return this.http.post(this.apiurl+ `project.DeleteMaterialByid&reload=1`,obj);
	}
	public addProjectMapping(obj:any):Observable<any>{			
		return this.http.post(this.apiurl+`project_building_material_map.Add_ProjectMapping&reload=1`,obj);
	}
	public addbooking(obj:any):Observable<any>{
		return this.http.post(this.apiurl+`project.add_addbooking&reload=1`,obj);
	}

	public addWorkContract(onj: any): Observable<any>{
		return this.http.post(this.apiurl+`project_work_contract.saveWokrContract&reload=1`,onj);
	}

	public fetchWokrContractData(obj: any): Observable<any>{
		return this.http.post(this.apiurl+`project_work_contract.fetchWokrContract&reload=1`,obj);
	}

	public removeContractData(obj: any): Observable<any>{
		return this.http.post(this.apiurl+`project_work_contract.removeContractData&reload=1`,obj);
	}

	public saveWorkDetails(obj:any): Observable<any>{
		return this.http.post(this.apiurl+ `project.saveWorkDetails&reload=1`, obj);
	}

	public fetchWorkDetails(obj:any): Observable<any>{
		return this.http.post(this.apiurl+ `project.fetchWorkDetails&reload=1`, obj);
	}

	public saveMaterialDetails(obj:any): Observable<any> {
		return this.http.post(this.apiurl+ 'project.saveMaterialData&reload=1', obj);
	}

    public getMaterialById(obj:any): Observable<any>{
		return this.http.post(this.apiurl+'project.getMaterialbyId&reload=1', obj);
	}

	public getAllMaterialsLists(obj:any): Observable<any> {
		return this.http.post(this.apiurl+ 'project.getAllMaterialsLists&reload=1', obj);
	}

	public getTotalAmount(obj:any): Observable<any> {
		return this.http.post(this.apiurl+ 'project.getTotalAmount&reload=1', obj);
	}

	public getAllWarehouselists(obj:any): Observable<any> {
		return this.http.post(this.apiurl+ 'project.getAllWarehouselists&reload=1', obj);
	}
	public getVendorsLists(obj:any): Observable<any> {
		return this.http.post(this.apiurl+ 'project.getVendorsLists&reload=1', obj);
	}
	public getCompanyLists(obj:any): Observable<any> {
		return this.http.post(this.apiurl+ 'project.getCompanyLists&reload=1',obj);
	}

	public getAllProjectsLists(obj:any): Observable<any> {
		return this.http.post(this.apiurl+ 'project.getAllProjectsLists&reload=1', obj);
	}

	public getAllCategoryLists(obj:any): Observable<any> {
		return this.http.post(this.apiurl+ 'project.getAllCategoryLists&reload=1', obj);
	}

	public getAllSubCategoryLists(obj:any): Observable<any> {
		return this.http.post(this.apiurl+ 'project.getAllSubCategoryLists&reload=1', obj);
	}
	
	public getAllUnitsLists(obj:any): Observable<any> {
		return this.http.post(this.apiurl+ 'project.getAllUnitsLists&reload=1', obj);
	}

	public getUnitsByMaterial(obj:any): Observable<any>{
		return this.http.post(this.apiurl+ 'project.getUnitsByMaterial&reload=1', obj);
	}

	public getUnitsFromConversionTable(obj: any): Observable<any> {
		return this.http.post(this.apiurl+ 'project.getUnitsFromConversionTable&reload=1',obj);
	}
	public getTotalCurrentBalance(obj:any): Observable<any>{
		return this.http.post(this.apiurl+ 'project.getTotalCurrentBalance&reload=1', obj);
	}

	public getVehicleslists(obj:any): Observable<any>{
		return this.http.post(this.apiurl+ 'project.getVehicleslists&reload=1', obj);
	}

	public getWarehouselists(obj:any): Observable<any>{
		return this.http.post(this.apiurl+ 'project.getWarehouselists&reload=1',obj);
	}

	public getToWarehouselists(obj:any): Observable<any>{
		return this.http.post(this.apiurl+ 'project.getToWarehouselists&reload=1',obj);
	}

	public getWarehouseFromInventory(obj:any): Observable<any>{
		return this.http.post(this.apiurl+'project.getWarehouseFromInventory&reload=1',obj);
	}

	public getWarehouseFromInventorywithCurrentbal(obj:any): Observable<any>{
		return this.http.post(this.apiurl+'project.getWarehouseFromInventorywithCurrentbal&reload=1',obj);
	}

	public saveMaterialConsumption(obj:any): Observable<any>{
		return this.http.post(this.apiurl+ 'project.savematerialConsumption&reload=1', obj);
	}

	public getMaterialsUsedLists(obj: any): Observable<any>{
		return this.http.post(this.apiurl+ 'project.getMaterialsUsedLists&reload=1',obj);
	}

	public getConsumedMaterials(obj:any): Observable<any>{
		return this.http.post(this.apiurl+ 'project.getConsumedMaterials&reload=1',obj);
	}


}
