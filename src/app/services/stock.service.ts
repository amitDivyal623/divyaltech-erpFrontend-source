import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UserActivityService } from './user-activity.service';
// import { publicDecrypt } from 'crypto';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  public apiurl = environment.APIEndpoint;
  constructor(private http: HttpClient, private activityService: UserActivityService) {
  }
  public saveInventoryData(obj: any): Observable<any> {
    this.activityService.logActivity('ACTION', 'Inventory', 'Save', obj.id ? `ID: ${obj.id}` : 'New Record');
    return this.http.post(this.apiurl + `stock.saveInventoryData&reload=1`, obj);
  }
  public getInventorybyId(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `stock.getInventorybyId&reload=1`, obj);
  }
  public removeInventory(obj: any): Observable<any> {
    this.activityService.logActivity('ACTION', 'Inventory', 'Delete', `ID: ${obj.id}`);
    return this.http.post(this.apiurl + `stock.removeInventory&reload=1`, obj);
  }
  public removeGatePass(obj: any): Observable<any> {
    this.activityService.logActivity('ACTION', 'Gate Pass', 'Delete', `ID: ${obj.id}`);
    return this.http.post(this.apiurl + `stock.removeGatePass&reload=1`, obj);
  }
  public updateProjectBalanceAfterDelete(obj: any): Observable<any> {
    return this.http.post(this.apiurl + 'stock.updateProjectBalanceAfterDelete&reload=1', obj);
  }
  public updateWarehouseBalanceAfterDelete(obj: any): Observable<any> {
    return this.http.post(this.apiurl + 'stock.updateWarehouseBalanceAfterDelete&reload=1', obj);
  }
  public removeGateEntry(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `stock.removeGateEntry&reload=1`, obj);
  }
  public saveGatePassDetails(obj: any): Observable<any> {
    this.activityService.logActivity('ACTION', 'Gate Pass', 'Save', obj.gate_pass_no || 'New Gate Pass');
    return this.http.post(this.apiurl + `stock.saveGatePassDetails&reload=1`, obj);
  }
  public saveWarehouseToProject(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `project.saveWarehouseToProject&reload=1`, obj);
  }
  public saveWarehouseToWarehouse(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `project.saveWarehouseToWarehouse&reload=1`, obj);
  }
  public fetchGatePassById(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `stock.fetchGatePassById&reload=1`, obj);
  }
  public savePurchaseRequest(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `stock.savePruchaseRequest&reload=1`, obj);
  }
  public getPRById(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `stock.getPRById&reload=1`, obj);
  }
  public deletePRDetail(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `stock.deletePRDetail&reload=1`, obj);
  }
  public deletePODetail(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `stock.deletePODetail&reload=1`, obj);
  }
  public fetchMaxId(obj: any): Observable<any> {
    return this.http.post(this.apiurl + 'stock.fetchMaxId&reload=1', obj);
  }
  public fetchMaxPOId(obj: any): Observable<any> {
    return this.http.post(this.apiurl + 'stock.fetchMaxPOId&reload=1', obj);
  }
  public fetchAllPR(obj: any): Observable<any> {
    return this.http.post(this.apiurl + 'stock.fetchAllPR&reload=1', obj);
  }
  public fetchAllEmployees(obj: any): Observable<any> {
    return this.http.post(this.apiurl + 'stock.fetchAllEmployees&reload=1', obj);
  }
  public downloadPurchaseOrder(obj: any): Observable<any> {
    return this.http.post(this.apiurl + 'stock.downloadPurchaseOrder&reload=1', obj);
  }
  public checkPOExistence(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `stock.checkPOExistence&reload=1`, obj);
  }
  public updatePODispatchStatus(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `stock.updatePODispatchStatus&reload=1`, obj);
  }
  public fetchCurrentBalFromWarehouseAndItem(obj: any): Observable<any> {
    return this.http.post(this.apiurl + 'stock.fetchCurrentBalFromWarehouseAndItem&reload=1', obj);
  }
  public getDispatchedPOLists(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `stock.getDispatchedPOLists&reload=1`, obj);
  }
  public onPOSelectionChange(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `stock.onPOSelectionChange&reload=1`, obj);
  }
  public saveGateEntryForm(obj: any): Observable<any> {
    return this.http.post(this.apiurl + 'stock.saveGateEntryForm&reload=1', obj);
  }
  public fetchGateEntryBiId(obj: any): Observable<any> {
    return this.http.post(this.apiurl + 'stock.fetchGateEntryById&reload=1', obj);
  }
  public fetchGenData(obj: any): Observable<any> {
    return this.http.post(this.apiurl + 'stock.fetchGenData&reload=1', obj);
  }
  public fetchGENByName(obj: any): Observable<any> {
    return this.http.post(this.apiurl + 'stock.fetchGENByName&reload=1', obj);
  }
  public saveGRN(obj: any): Observable<any> {
    this.activityService.logActivity('ACTION', 'GRN', 'Save', obj.grn_no || 'New GRN');
    return this.http.post(this.apiurl + 'stock.saveGRN&reload=1', obj);
  }
  public getGrnDetailsById(obj: any): Observable<any> {
    return this.http.post(this.apiurl + 'stock.getGrnDetailsById&reload=1', obj);
  }
  public removeGRN(obj: any): Observable<any> {
    this.activityService.logActivity('ACTION', 'GRN', 'Delete', `ID: ${obj.id}`);
    return this.http.post(this.apiurl + 'stock.removeGRN&reload=1', obj);
  }
  public downloadGRN(obj: any): Observable<any> {
    return this.http.post(this.apiurl + 'stock.downloadGRN&reload=1', obj);
  }

  public viewCredit(obj: any): Observable<any> {
    return this.http.post(this.apiurl + 'stock.viewCredit&reload=1', obj);
  }
  public viewDebit(obj: any): Observable<any> {
    return this.http.post(this.apiurl + 'stock.viewDebit&reload=1', obj);
  }
  public getVendorsLists(obj: any): Observable<any> {
    return this.http.post(this.apiurl + 'stock.getVendorsLists&reload=1', obj);
  }
  public onVendorSelect(obj: any): Observable<any> {
    return this.http.post(this.apiurl + 'stock.onVendorSelect&reload=1', obj);
  }
  public fetchTotalCurrentbalance(obj: any): Observable<any> {
    return this.http.post(this.apiurl +'stock.fetchTotalCurrentbalance&reload=1', obj);
  }
  public getAllrentedItemsLists(obj:any): Observable<any> {
    return this.http.post(this.apiurl+ 'stock.getAllrentedItemsLists&reload=1',obj);
  }
  public saveRentgatePass(obj: any): Observable<any> {
    return this.http.post(this.apiurl + 'stock.saveRentgatePass&reload=1',obj);
  }
  public fetchRentItemGatePassData(obj: any): Observable<any> {
    return this.http.post(this.apiurl + 'stock.fetchRentItemGatePassData&reload=1', obj);
  }
  public deleteRentGatePass(obj: any): Observable<any> {
    return this.http.post(this.apiurl+ 'stock.deleteRentGatePass&reload=1',obj);
  }  
  public getRentGatePassEditData(obj: any): Observable<any> {
    return this.http.post(this.apiurl + 'stock.getRentGatePassEditData&reload=1',obj);
  }
}
