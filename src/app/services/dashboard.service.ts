import { Injectable } from '@angular/core';
import {HttpClient,HttpHeaders,HttpRequest} from '@angular/common/http';
import { Observable,from,of } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  public apiurl = environment.APIEndpoint;
  constructor(private http: HttpClient) { }

  public getVisitorsCount(obj: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(this.apiurl + `dashboard.getVisitorsCounts&reload=1`, obj,{ headers: headers });
  }
  public getTodaysVisitorsCount(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `dashboard.getTodaysVisitorsCounts&reload=1`, obj);
  }
  public getTotCustsCount(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `dashboard.getTotCustsCounts&reload=1`, obj);
  }
  public getTodaySalesCount(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `dashboard.getTodaySalesCounts&reload=1`, obj);
  }
  public getMonthlyVisitsCount(obj: any): Observable<any>{
    return this.http.post(this.apiurl + `dashboard.getMonthlyVisitsCount&reload=1`, obj);
  }
  public getMonthlySalesCount(obj: any): Observable<any>{
    return this.http.post(this.apiurl + `dashboard.getMonthlySalesCount&reload=1`, obj);
  }
  public getTotalOrderCount(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `dashboard.getTotalOrderCount&reload=1`, obj);
  }
  public getTotalAreaCount(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `dashboard.getTotalAreaCount&reload=1`, obj);
  }
    public getBookingCompleted(obj: any): Observable<any> {
     return this.http.post(this.apiurl + 'dashboard.getBookingCompleted&reload=1', obj);
  }
   public getInProgCount(obj: any): Observable<any> {
     return this.http.post(this.apiurl + 'dashboard.getInProgCount&reload=1', obj);
  }
  public getParimaniCount(obj : any): Observable<any> {
    return this.http.post(this.apiurl + 'dashboard.getParimaniCount&reload=1', obj);
  }
  public getDiversionCount(obj : any): Observable<any> {
    return this.http.post(this.apiurl + 'dashboard.getDiversionCount&reload=1', obj);
  }
  public getBalAmntCount(obj : any): Observable<any> {
    return this.http.post(this.apiurl + 'dashboard.getBalAmntCount&reload=1', obj);
  }
  public getRegBalAmntCount(obj : any): Observable<any> {
    return this.http.post(this.apiurl + 'dashboard.getRegBalAmntCount&reload=1', obj);
  }
  public getAllMonthData(obj : any): Observable<any> {
    return this.http.post(this.apiurl + 'dashboard.getAllRangeData&reload=1', obj);
  }
}

