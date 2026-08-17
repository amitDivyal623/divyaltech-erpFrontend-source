import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, of } from 'rxjs';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class VendorService {
  public apiurl = environment.APIEndpoint;
  constructor(private http: HttpClient) { }

  public fetchvendor(obj: any, obj2: any): Observable<any> {

    return this.http.post(this.apiurl + `hr.fetch_vendor&reload=1`, JSON.stringify({ obj: obj, obj2: obj2 }));
  }

  public getvendor(VendorId: any): Observable<any> {

    return this.http.post(this.apiurl + `hr.get_vendor&reload=1`, JSON.stringify({ VendorId: VendorId }));
  }
  public addvendor(obj: any): Observable<any> {

    return this.http.post(this.apiurl + `hr.add_vendor&reload=1`, obj);
  }

  public searchvendor(obj: any): Observable<any> {

    return this.http.post(this.apiurl + `hr.fetch_vendor`, obj);
  }

  public deletevendor(VendorId: any): Observable<any> {

    return this.http.post(this.apiurl + `hr.delete_vendor&reload=1`, JSON.stringify({ VendorId: VendorId }));
  }



  public fetchvehicle(obj: any, obj2: any): Observable<any> {

    return this.http.post(this.apiurl + `hr.fetch_vehicle&reload=1`, JSON.stringify({ obj: obj, obj2: obj2 }));
  }

  public getvehicle(vehicleId: any): Observable<any> {

    return this.http.post(this.apiurl + `hr.get_vehicle&reload=1`, JSON.stringify({ vehicleId: vehicleId }));
  }
  public addvehicle(obj: any): Observable<any> {

    return this.http.post(this.apiurl + `hr.add_vehicle&reload=1`, obj);
  }

  public updatevehicle(obj: any): Observable<any> {

    return this.http.post(this.apiurl + `hr.update_vehicle&reload=1`, obj);
  }

  public searchvehicle(obj: any): Observable<any> {

    return this.http.post(this.apiurl + `hr.fetch_vehicle`, obj);
  }

  public deletevehicle(VehicleId: any): Observable<any> {

    return this.http.post(this.apiurl + `hr.delete_vehicle&reload=1`, JSON.stringify({ VehicleId: VehicleId }));
  }

  public openVendorLedger(obj: any): Observable<any> {
    return this.http.post(this.apiurl + 'report.openVendorLedger&reload=1',obj);
  }
}
