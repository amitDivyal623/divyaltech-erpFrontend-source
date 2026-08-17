import { Injectable } from '@angular/core';
import {HttpClient,HttpHeaders} from '@angular/common/http';
import { Observable,from,of } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PurchaseOrderService {
  public apiurl = environment.APIEndpoint;
  constructor(private http : HttpClient) { }

  public savePOData(obj:any):Observable<any>{		
    return this.http.post(this.apiurl+`stock.savePOData&reload=1`,obj);
  }
  public getPRLists(obj:any): Observable<any>{
    return this.http.post(this.apiurl + `purchaseOrder.getPRLists&reload=1`, obj);
  }
  public getItemsOnPRChange(obj: any): Observable<any>{
    return this.http.post(this.apiurl+ `stock.getItemsOnPRChange&reload=1`,obj);
  }
  public fetchVendorNameState(obj:any): Observable<any>{
    return this.http.post(this.apiurl+ `stock.fetchVendorNameState&reload=1`, obj);
  }
  public fetchCompanyNameState(obj:any): Observable<any>{
    return this.http.post(this.apiurl+ `stock.fetchCompanyNameState&reload=1`, obj);
  }
  public getPurchaseOrderById(obj:any): Observable<any>{
    return this.http.post(this.apiurl+ `stock.getPurchaseOrderById&reload=1`,obj);
  }

}
