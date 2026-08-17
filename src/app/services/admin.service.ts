import { Injectable } from '@angular/core';
import {HttpHeaders,HttpClient} from '@angular/common/http'
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  public apiurl = environment.APIEndpoint;
  constructor( private http : HttpClient) { }

  public fetchLookUpTypeList(obj:any):Observable<any>{
   
    return this.http.post<any>(this.apiurl+`admin.fetch_lookupType&reload=1`,obj);
  }
  public fetchLookUpDataList():Observable<any>{
    
    return this.http.get<any>(this.apiurl+`admin.fetch_lookupData&reload=1`);
  }
  public fetchLookUpDataByID(obj:any):Observable<any>{
    
    return this.http.post<any>(this.apiurl+`admin.fetch_lookupDataByID&reload=1`,obj);
  }
  public updateLookUpData(obj:any):Observable<any>{
    
    return this.http.post<any>(this.apiurl+`admin.update_lookupData&reload=1`,obj);
  }

  public addLookupData(obj:any):Observable<any>{
 
    return this.http.post(this.apiurl+`admin.add_lookupData&reload=1`,obj);
  }

  public deleteitem(obj:any):Observable<any>{
   
    return this.http.post(this.apiurl+`admin.delete_lookupData&reload=1`,obj);
  }

  public fetchCountryList(obj:any):Observable<any>{
  
    return this.http.post<any>(this.apiurl+`admin.fetch_countrylist&reload=1`,obj);
  }
  public addCountryData(obj:any):Observable<any>{
  
    return this.http.post(this.apiurl+`admin.add_country&reload=1`,obj);
  }
  public updateCountryData(obj:any):Observable<any>{
   
    return this.http.post(this.apiurl+`admin.update_country&reload=1`,obj);
  }
  public addStateData(obj:any):Observable<any>{
 
    return this.http.post(this.apiurl+`admin.add_state&reload=1`,obj);
  }
  public updateStateData(obj:any):Observable<any>{
   
    return this.http.post(this.apiurl+`admin.update_state&reload=1`,obj);
  }
  
  public deletecountry(CountryId:any):Observable<any>{
    
    return this.http.post(this.apiurl+`admin.delete_country`,JSON.stringify({CountryId: CountryId}));
  }
  public deletestate(StateId:any):Observable<any>{
    
    return this.http.post(this.apiurl+`admin.delete_state`,JSON.stringify({StateId: StateId}));
  }
  public fetchStateList(obj:any):Observable<any>{
    
    return this.http.post<any>(this.apiurl+`admin.fetch_stateList&reload=1`,obj);
  }
  public calendarAdd(obj:any):Observable<any>{
    return this.http.post<any>(this.apiurl+`admin.addleave&reload=1`,obj);
  }
  public deleteCalendar(obj:any):Observable<any>{
    let Data_id = new FormData();
    Data_id.append('calendar_id',obj);
    return this.http.post<any>(this.apiurl+`admin.deleteCalendar&reload=1`,Data_id);
  }
  public Calendareditdata(obj:any):Observable<any>{
    return this.http.post<any>(this.apiurl+`admin.Calendareditdata&reload=1`,obj);
  }
  public fetch_company():Observable<any>{
    return this.http.get<any>(this.apiurl+`admin.companyList&reload=1`);
  }
  public saveGroupName(obj:any): Observable<any>{
    return this.http.post(this.apiurl+`admin.saveGroupName&reload=1`,obj);
  }
  public GetAllGroupName(obj:any): Observable<any>{
    return this.http.post(this.apiurl+`admin.GetAllGroupName&reload=1`,obj);
  }
  public GetAllSubGroupName(obj:any): Observable<any>{
    return this.http.post(this.apiurl+`admin.GetAllSubGroupName&reload=1`,obj);
  }
  public saveSubGroup(obj:any): Observable<any>{
    return this.http.post(this.apiurl+`admin.saveSubGroup&reload=1`,obj);
  }
  public getSubGroupById(obj:any): Observable<any>{
    return this.http.post(this.apiurl+`admin.getSubGroupById&reload=1`,obj);
  }
  public fetchMaxId(obj:any): Observable<any>{
    return this.http.post(this.apiurl+`admin.fetchMaxId&reload=1`,obj);
  }
  public saveItemMaster(obj:any): Observable<any>{
    return this.http.post(this.apiurl+`admin.saveItemMaster&reload=1`,obj);
  }
  public fetchItemDataById(obj:any): Observable<any>{
    return this.http.post(this.apiurl + `admin.fetchItemById&reload=1`,obj);
  }
  public DeleteItemDataById(obj:any): Observable<any>{
    return this.http.post(this.apiurl + `admin.DeleteItemDataById&reload=1`,obj);
  }
  public fetchCompanyDataById(obj:any): Observable<any>{
    return this.http.post(this.apiurl + `admin.fetchCompanyDataById&reload=1`,obj);
  }
  public fetchContractorById(obj:any): Observable<any>{
    return this.http.post(this.apiurl + `contractor.fetchContractorById&reload=1`,obj);
  }
  public DeleteContractorById(obj:any): Observable<any>{
    return this.http.post(this.apiurl + `contractor.deleteContractorById&reload=1`,obj);
  }
  public fetchCategoryDataById(obj:any): Observable<any>{
    return this.http.post(this.apiurl + `admin.fetchCategoryDataById&reload=1`,obj);
  }
  public fetchSubCategoryDataById(obj:any): Observable<any>{
    return this.http.post(this.apiurl + `admin.fetchSubCategoryDataById&reload=1`,obj);
  }
  public fetchUnitDataById(obj:any): Observable<any>{
    return this.http.post(this.apiurl + `admin.fetchUnitDataById&reload=1`,obj);
  }
  public fetchStateDataById(obj:any): Observable<any>{
    return this.http.post(this.apiurl + `admin.fetchStateDataById&reload=1`,obj);
  }
  public saveUnits(obj:any): Observable<any>{
    return this.http.post(this.apiurl+`admin.saveUnitDetails&reload=1`, obj);
  }
  public saveStates(obj:any): Observable<any>{
    return this.http.post(this.apiurl+`admin.saveStateDetails&reload=1`, obj);
  }
  public saveCompany(obj:any): Observable<any>{
    return this.http.post(this.apiurl+`admin.saveCompanyDetails&reload=1`, obj);
  }
  public getAllStates(obj:any): Observable<any>{
    return this.http.post(this.apiurl+`admin.getAllStates&reload=1`, obj);
  }
  public getUnitLists(obj:any): Observable<any>{
    return this.http.post(this.apiurl+`admin.getAllUnits&reload=1`, obj);
  }
  public deleteCompanyById(obj:any): Observable<any>{
    return this.http.post(this.apiurl+ `admin.deleteCompanyById&reload=1`, obj);
  }
  public deleteCategoryById(obj:any): Observable<any>{
    return this.http.post(this.apiurl+ `admin.deleteCategoryById&reload=1`, obj);
  }
  public deleteSubCategoryById(obj:any): Observable<any>{
    return this.http.post(this.apiurl+ `admin.deleteSubCategoryById&reload=1`, obj);
  }
  public deleteUnitById(obj:any): Observable<any>{
    return this.http.post(this.apiurl+ `admin.deleteUnitById&reload=1`, obj);
  }
  public deleteStateById(obj:any): Observable<any>{
    return this.http.post(this.apiurl+ `admin.deleteStateById&reload=1`, obj);
  }
  public deleteWarehouseById(obj:any): Observable<any>{
    return this.http.post(this.apiurl+ `admin.deleteWarehouseById&reload=1`, obj);
  }
  public getMaxWarehouseId(obj:any): Observable<any>{
    return this.http.post(this.apiurl+ `admin.getMaxWarehouseById&reload=1`, obj);
  }
  public saveWareHouse(obj:any): Observable<any>{
    return this.http.post(this.apiurl+ `admin.saveWarehouse&reload=1`, obj);
  }
  public getWareByid(obj:any): Observable<any>{
    return this.http.post(this.apiurl+ `admin.getWareByid&reload=1`, obj);
  }
  public getAllNotificationDetails(obj:any):Observable<any> {
    return this.http.post(this.apiurl+ 'admin.getAllNotificationDetails&reload=1',obj);
  }
  
}
