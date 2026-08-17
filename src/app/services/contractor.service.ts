import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContractorService {

  public apiurl = environment.APIEndpoint;
  constructor(private http: HttpClient) { }



  public saveContractor(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `contractor.saveContractor&reload=1`, obj);
  }
  public getallContractors(obj: any): Observable<any> {
    return this.http.post(this.apiurl + 'contractor.getallContractors&reload=1',obj);
  }
  public getContractorsLists(obj: any): Observable<any> {
    return this.http.post(this.apiurl + 'contractor.getallContractors&reload=1',obj);
  }
  public onContractorSelect(obj: any): Observable<any> {
    return this.http.post(this.apiurl + 'contractor.onContractorSelect&reload=1',obj);
  }
  public addWorkContract(obj: any): Observable<any> {
    return this.http.post(this.apiurl+ 'contractor.addWorkContract&reload=1',obj);
  }
  public getContractWorkDtByid(obj: any): Observable<any> {
    return this.http.post(this.apiurl + 'contractor.getContractWorkDtByid&reload=1', obj);
  }
  public removeConWorkDt(obj: any): Observable<any> {
    return this.http.post(this.apiurl + 'contractor.removeConWorkDt&reload=1',obj);
  }
  public getContractCreditById(obj: any): Observable<any> {
    return this.http.post(this.apiurl + 'contractor.getContractCreditById&reload=1',obj);
  }
  public getContractDebitById(obj:any): Observable<any> {
    return this.http.post(this.apiurl + 'contractor.getContractDebitById&reload=1', obj);
  }
  public onContractorSelectTogetTotalCount(obj:any): Observable<any> {
    return this.http.post(this.apiurl + 'contractor.onContractorSelectTogetTotalCount&reload=1', obj);
  }
  public getContractorLedger(obj: any): Observable<any> {
    return this.http.post(this.apiurl + 'report.openContractorLedger&reload=1',obj);
  }
}
