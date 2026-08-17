import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Observable, from, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { DataTableDirective } from 'angular-datatables';
import { DatePipe } from '@angular/common';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
import { NgbCalendar, NgbDateAdapter, NgbDate, NgbDateParserFormatter, NgbDateStruct, NgbInputDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { CrmService } from '../../services/crm.service';
import { HrService } from 'src/app/services/hr.service';

class Tasks {
  TaskId: string;
  EmployeeId: string;
  UserId: string;
  TaskDescription: string;
  TaskTitle: string;
  TaskDt: string;
  Status: string;
  CreatedBy: string;
  CreatedDt: string;
  UpdatedBy: string;
  UpdatedDt: string;
}

class DataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}

@Injectable()
export class CustomAdapter extends NgbDateAdapter<string> {

  readonly DELIMITER = '-';

  fromModel(value: string | null): NgbDateStruct | null {
    if (value) {
      let date = value.split(this.DELIMITER);
      return {
        day : parseInt(date[0], 10),
        month : parseInt(date[1], 10),
        year : parseInt(date[2], 10)
      };
    }
    return null;
  }

  toModel(date: NgbDateStruct | null): string | null {
    return date ? date.day + this.DELIMITER + date.month + this.DELIMITER + date.year : null;
  }
}

/**
 * This Service handles how the date is rendered and parsed from keyboard i.e. in the bound input field.x
 */
@Injectable()
export class CustomDateParserFormatter extends NgbDateParserFormatter {

  readonly DELIMITER = '/';

  parse(value: string): NgbDateStruct | null {
    if (value) {
      let date = value.split(this.DELIMITER);
      return {
        day : parseInt(date[0], 10),
        month : parseInt(date[1], 10),
        year : parseInt(date[2], 10)
      };
    }
    return null;
  }

  format(date: NgbDateStruct | null): string {
    return date ? ("0"+date.day).slice(-2) + this.DELIMITER + ("0"+date.month).slice(-2) + this.DELIMITER + date.year : '';
  }
}


@Component({
  selector: 'app-document-followup',
  templateUrl: './document-followup.component.html',
  styleUrls: ['./document-followup.component.scss']
})
export class DocumentFollowupComponent implements OnInit, OnDestroy {

  selected = [
    {name: "Active"},
    {name: "Pending"},
  ];
  [x: string]: any;
  model: NgbDateStruct;
  model2: string;
  followupadd: boolean;
  filterWorking: boolean = true;

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  private destroy$ = new Subject<void>();
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  @ViewChild('closebutton') closebutton;
  @ViewChild('closebutton1') closebutton1;
  @ViewChild('taskaddModel')taskaddModel: ElementRef;
  @ViewChild('taskEditModel')taskEditModel: ElementRef;
  private dateToString = (date) => `${date.year}-${date.month}-${date.day}`;
  respStatus =[];
  categories = [];
  categories1 = [];

  respcusTags =[];
  custtags = [];
  custtags1 = [];
  minDate = {year: 1900, month: 1, day: 1};
  maxDate = {year: 2099, month: 12, day: 31};
  DatatableParameter = { customerName : '', dateTo: '',dateFrom: '',Status: '',Tags:''};
  dataa:Tasks[];
  customerdataList = [];
  customerData= [];
  keyword = 'name';
  resp:any;
  employee : any;
  modal:any;
  taskselected = [];
  tempTaskSelected = [];

  constructor(private crmservice:CrmService,private hrservice:HrService, private datePipe: DatePipe, private ngbCalendar: NgbCalendar, private dateAdapter: NgbDateAdapter<string>,private router:Router,private http:HttpClient, private chRef : ChangeDetectorRef) {}
  ngOnInit(): void {
  
   this.lookupdatalist();
   this. taskTags();

  //  this. datatableCode();
  }
  
  followUp = new FormGroup({
    userName: new FormControl(''),
    dateFrom: new FormControl(''),
    dateTo: new FormControl(''),
    task_status: new FormControl(''),
    Tasktagid: new FormControl(''),
    filtertasktag: new FormControl('')
  });

  SelectedTagsValue(event) {
    this.tagid = event;
    this.tag_id = '';
    this.CustTagID = [];
    for(let i=0;i<this.tagid.length;i++){
      this.CustTagID.push(
        this.tagid[i].id
      );
      this.tag_id = this.CustTagID.join(',');
      this.Tasktag_id = this.CustTagID.join(',')
    }
  }


  lookupdatalist(){
    let lookupStatus = "Status";
    let Statusdata = new FormData();
    Statusdata.append('lookupname',lookupStatus);
    this.crmservice.fetch_lookupdata(Statusdata).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
      this.respStatus = Response.data;
      
    });
  }



  taskTags() {
    let lookupTags = "";
    let taskTagsdata = new FormData();
    taskTagsdata.append('lookupname',lookupTags);
    this.hrservice.fetchTaskTags(taskTagsdata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
      this.respcusTags = Response.data
      let i =0;
      for(i=0;i<this.respcusTags.length;i++){
        this.custtags1.push({
          'id': this.respcusTags[i]['id'],
          'name': this.respcusTags[i]['name']
        })
      }
    this.custtags = [this.custtags1];
    this.custtags = this.custtags[0];
    });
  }



  //   datatableCode() {
//     this.DatatableParameter.dateFrom = (<HTMLInputElement>document.getElementById("dateFrom")).value;
//     this.DatatableParameter.dateTo = (<HTMLInputElement>document.getElementById("dateTo")).value;
//     this.DatatableParameter.customerName= this.followUp.get('userName').value;
//     this.DatatableParameter.Status=this.followUp.get('task_status').value;
//     this.DatatableParameter.Tags=this.followUp.get('Tasktagid').value;
//     const that = this;
//     const headers = new HttpHeaders(
//       { 'Content-Type': 'text/plain',
//       'token':sessionStorage.getItem('token')
//     });
//     this.dtOptions = {
//       processing: true,
//       serverSide: true,
//       dom: 'lrtip',
//       lengthMenu:[[5, 10, 25, 50], [5, 10, 25, 50]],
//       columnDefs: [
//           { orderable: false, targets: 5 }
//       ],
//       // ajax: (dataTablesParameters: any, callback) => {
        
//       //     that.http.post<DataTablesResponse>(environment.APIEndpoint+'report.fetch_Data&reload=1',Object.assign(dataTablesParameters,this.DatatableParameter), {responseType: 'json', headers}).subscribe(resp =>{
//       //         that.data=resp.data;
//       //        this.pdf=that.data;
//       //       
             
                         
//       //         callback({recordsTotal: resp.recordsTotal,recordsFiltered: resp.recordsTotal,data: []});
//       //     });
//       // }
//   };
// }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}

