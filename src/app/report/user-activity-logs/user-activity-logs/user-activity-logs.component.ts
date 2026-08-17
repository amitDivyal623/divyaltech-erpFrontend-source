import { Component, OnInit, OnDestroy, ViewChildren } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DataTableDirective } from 'angular-datatables';
import { DatePipe } from '@angular/common';
import { FormBuilder } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';


class DataTablesResponse {
  iTotalDisplayRecords(iTotalDisplayRecords: any) {
    throw new Error('Method not implemented.');
  }
  data: any[] = [];
  draw: number = 0; 
  recordsFiltered: number = 0;
  recordsTotal: number= 0;
}

@Component({
  selector: 'app-user-activity-logs',
  templateUrl: './user-activity-logs.component.html',
  styleUrls: ['./user-activity-logs.component.scss']
})
export class UserActivityLogsComponent implements OnInit, OnDestroy {

  activityDatatableparameter: {};
  constructor(private datePipe: DatePipe, private fb: FormBuilder, private http: HttpClient) {
    this.activityDatatableparameter = {}
  }

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  @ViewChildren(DataTableDirective) dtElement: any;
  private destroy$ = new Subject<void>();
  activityTableData: any[] = [];

  ngOnInit(): void {
    this.datatablecode();
  }

  datatablecode() {
    this.activityDatatableparameter = '';

    const that = this;
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });
    this.dtOptions = {
      processing: true,
      serverSide: true,
      pageLength: 25,
      dom: 'lrtip',
      lengthMenu: [[5, 10, 25, 50, 300], [5, 10, 25, 50, 300]],
      columnDefs: [
        { orderable: false, targets: [0, 5] } // blank + action
      ],
      columns: [],
      ajax: (dataTablesParameters: any, callback) => {

        // Extract sorting info
        const orderColumnIndex = dataTablesParameters.order[0].column;
        const orderDir = dataTablesParameters.order[0].dir;
        const orderColumnName = dataTablesParameters.columns[orderColumnIndex].data;

        // Build request payload
        // const params = {
        //   ...dataTablesParameters,
        //   ...this.activityDatatableparameter,
        //   order_column: orderColumnIndex,
        //   order_dir: orderDir,
        //   order_column_name: orderColumnName
        // };

        that.http.post<DataTablesResponse>(environment.APIEndpoint + 'admin.fetchAllUsersActivityData&reload=1', Object.assign(dataTablesParameters, this.activityDatatableparameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {
          console.log(resp);
          that.activityTableData = resp.data;
          callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsTotal,
            data: []
          });
        });
      }
    }
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  rerender(): void {
    this.dtElement.forEach((item: any) => {
      if (item.dtInstance) {
        item.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.destroy();
        });
      }
    });
    this.dtTrigger.next();
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();

    this.destroy$.next();
    this.destroy$.complete();

    // if (this.dtElement && this.dtElement.dtInstance) {
    //   this.dtElement.dtInstance.then(dt => dt.destroy());
    // }

  }

}
