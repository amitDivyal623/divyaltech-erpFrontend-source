import { Injectable } from '@angular/core';
import {HttpClient,HttpHeaders,HttpRequest} from '@angular/common/http';
import { Observable,from,of } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {


  public apiurl = environment.APIEndpoint;
  constructor( private http : HttpClient) { }

  // company Service

  public addcompany(obj:any):Observable<any>{
    return this.http.post(this.apiurl+`company.addcompany&reload=1`,obj);
  }

  public ViewCompanyinfo(obj:any):Observable<any>{
    return this.http.post(this.apiurl+`company.ViewCompanyinfo&reload=1`,obj);
  }

  public RemoveCompanyinfo(obj:any):Observable<any>{
    return this.http.post(this.apiurl+`company.deletecompany&reload=1`,JSON.stringify({CompanyId:obj}));
  }

  // User Service
  public getCompany(obj:any):Observable<any>{
    return this.http.post(this.apiurl+`main.getCompany&reload=1`,obj);
  }
  public companyList(obj:any):Observable<any>{
    return this.http.post(this.apiurl+`company.fetchcompany&reload=1`,obj);
  }
  public getUserdetail(obj:any):Observable<any>{
    return this.http.post(this.apiurl + 'hr.getuserdetail&reload=1',obj);
  }
   public getUserdetailbycompanyid(obj:any):Observable<any>{
    return this.http.post(this.apiurl + 'hr.getuserdetailbycompanyid&reload=1',obj);
  }
  public getuserRoledata(obj:any):Observable<any>{
    return this.http.post(this.apiurl+`main.getuserRoledata&reload=1`,obj);
  }
  public userRoledata(obj:any):Observable<any>{
    return this.http.post(this.apiurl+`main.getuserRoledata&reload=1`,obj);
  }

  public adduser(obj:any):Observable<any>{
    return this.http.post(this.apiurl+`main.create&reload=1`,obj);
  }

  public ViewUserinfo(obj:any):Observable<any>{
    return this.http.post(this.apiurl+`main.ViewUserinfo&reload=1`,obj);
  }

  public edituser(obj:any):Observable<any>{
    return this.http.post(this.apiurl+`main.update&reload=1`,obj);
  }

  public RemoveUserinfo(obj:any):Observable<any>{
    return this.http.post(this.apiurl+`main.delete&reload=1`,obj);
  }

  // User Role

  public adduserRole(obj:any):Observable<any>{
    return this.http.post(this.apiurl+`user_role.create&reload=1`,obj);
  }

  public ViewUserRole(obj:any):Observable<any>{
    return this.http.post(this.apiurl+`user_role.ViewUserRoledata&reload=1`,obj);
  }

  public resetPassword(obj:any):Observable<any>{
    return this.http.post(this.apiurl+`main.reset&reload=1`,obj);
  }

  public resetPasswordWithin30days(obj:any):Observable<any>{
    return this.http.post(this.apiurl+`main.resetpassword&reload=1`,obj);
  }
  getOldpassword(obj:any):Observable<any>{
    return this.http.post(this.apiurl+`main.getOldpassword&reload=1`,obj);
  }

}
