import { Injectable } from '@angular/core';
import {HttpClient,HttpHeaders} from '@angular/common/http';
import { Observable,from,of } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LabourService {
  public apiurl = environment.APIEndpoint;
  constructor( private http : HttpClient) { }

  public fetchlabour(obj:any,obj2:any):Observable<any>{
    
    return this.http.post(this.apiurl+`hr.fetch_labour&reload=1`,JSON.stringify({obj: obj, obj2: obj2}));
  }

  public getlabour(labourid:any,CompanyId:any):Observable<any>{
    
    return this.http.post(this.apiurl+`hr.get_labour&reload=1`,JSON.stringify({labourid: labourid ,CompanyId:CompanyId}));
  }
  public addlabour(obj:any):Observable<any>{
    
    return this.http.post(this.apiurl+`hr.add_labour&reload=1`,obj);
  }

  public updatelabour(obj:any):Observable<any>{
   
    return this.http.post(this.apiurl+`hr.update_labour&reload=1`,obj);
  }

  public searchlabour(obj:any):Observable<any>{
  
    return this.http.post(this.apiurl+`hr.fetch_labour`,obj);
  }

  public deletelabour(labourid:any):Observable<any>{
    
    return this.http.post(this.apiurl+`hr.delete_labour&reload=1`,JSON.stringify({labourid: labourid}));
  }

  public getRawKhasraLists(obj:any): Observable<any> {
    return this.http.post(this.apiurl + 'product.getRawKhasraLists&reload=1',obj);
  }
}
