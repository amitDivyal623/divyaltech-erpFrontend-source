import { HttpHeaders } from '@angular/common/http';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { HttpClient , HttpResponse } from '@angular/common/http';
import { FormControl, FormGroup } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
class Ordermanagement{
  CompanyId: string;
  CustomerId: string;
  CustomerFirstName: string;
  CustomerLastName: string;
  CustomerType: string;
  ContactBy: string;
  PhoneNumber: string;
  EmialId: string;
  Address: string;
  CityId: string;
  StateId: string;
  CountryId: string;
  PostCode: string;
  Status: string;
}
class DataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}
@Component({
  selector: 'app-sale-order',
  templateUrl: './sale-order.component.html',
  styleUrls: ['./sale-order.component.css']
})
export class SaleOrderComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  minDate = {year: 1900, month: 1, day: 1};
  maxDate = {year: 2099, month: 12, day: 31};
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  constructor(private router:Router, public http:HttpClient, ) { }
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  DatatableParameter = {};
  data : Ordermanagement[];

  searchOrder = new FormGroup ({ 
    searchOrderDate: new FormControl(''),
    searchCustName: new FormControl(''),
    searchMobNumber: new FormControl(''),
    searchOrderstatus: new FormControl(''),
  })
  ngOnInit(): void {
    this.datatableCode();
  }
  route(link:any){
    this.router.navigate(['/'+link]);
  }
  datatableCode() {
    const that = this;
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain'});
    this.dtOptions = {
      processing: true,
      serverSide: true,
      dom: 'lrtip',
      pageLength: 5,
      lengthMenu:[[5, 10, 25, 50], [5, 10, 25, 50]],
      columnDefs: [
        { orderable: false, targets: -1 }
      ],
      order:[[0, 'desc']],
      ajax: (dataTablesParameters: any, callback) => {
        Object.assign(dataTablesParameters, this.DatatableParameter);
        that.http.post<DataTablesResponse>(environment.APIEndpoint+'crm.fetch_CrmCustomerMngmt&reload=1',Object.assign(dataTablesParameters,this.DatatableParameter), {responseType: 'json', headers}).pipe(takeUntil(this.destroy$)).subscribe(resp =>{
          that.data=resp.data;
          callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsTotal,
            data: []
          });
        });
      }
    };
  }
  searchOrderFilter(){
    this.searchOrder.reset();
  }
  reload()
  {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
}
