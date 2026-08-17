import { Component, OnInit, ViewChild,TemplateRef,Injectable, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { NgbCalendar, NgbDateAdapter, NgbDate, NgbDateParserFormatter, NgbDateStruct, NgbInputDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {Router} from '@angular/router';
import { CrmService } from '../../services/crm.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { HttpClient ,HttpHeaders, HttpResponse } from '@angular/common/http';

import { DataTableDirective } from 'angular-datatables';
import { environment } from 'src/environments/environment';

class Tasks {
  CompanyId: string;
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
  selector: 'app-task-model',
  templateUrl: './task-model.component.html',
  styleUrls: ['./task-model.component.scss'],
  providers: [
    NgbInputDatepickerConfig,
    {provide: NgbDateAdapter, useClass: CustomAdapter},
    {provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter}
  ]
})
export class TaskModelComponent implements OnInit, OnDestroy {
  [x: string]: any;
  model!: NgbDateStruct;
  model2!: string;

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  private destroy$ = new Subject<void>();
  @ViewChild(DataTableDirective) dtElement!: DataTableDirective;
  @ViewChild('closebutton') closebutton: any;
  private dateToString = (date) => `${date.year}-${date.month}-${date.day}`; 
  respStatus =[];    
  minDate = {year: 1900, month: 1, day: 1};
  maxDate = {year: 2099, month: 12, day: 31};
  DatatableParameter = { Assignee: '', reporters : '',taskDate: '',tastStatus: '',Tasktype:''};
  dataa:Tasks[];
  resp:any;
  employee : any;
  modal:any;


  addTask = new FormGroup({
    status : new FormControl('',Validators.required),
    date : new FormControl('',Validators.required),
    reporter: new FormControl('',Validators.required),
    assignee:new FormControl('',Validators.required),
    task_title: new FormControl('',Validators.required),
    task_description : new FormControl('',Validators.required)
  });
  searchTask = new FormGroup({
    task_status : new FormControl('',Validators.required),
    userName:new FormControl('',Validators.required),
    task_date:new FormControl('',Validators.required),
    customerName:new FormControl('',Validators.required)
  });
  constructor(private ngbCalendar: NgbCalendar, private dateAdapter: NgbDateAdapter<string>,private router:Router,private http:HttpClient,private crmservice:CrmService, private chRef : ChangeDetectorRef) {
    if(sessionStorage.getItem('token')==undefined && sessionStorage.getItem('UserName')==undefined){
      this.router.navigate(['/']);
    }
  }

  ngOnInit(): void {
    this.datatableCode();
    this.employeetypenamelis();
    this.lookupdatalist();
    this.CrmUserRole = false;
    if(sessionStorage.getItem('UserRole') == 'CRM User'){
      this.CrmUserRole = true;
    }
    if (this.router.url == '/crm-task') {
      this.taskSearchTab = true;
      this.taskTable = true;
    } else {
      this.taskTable = true;
    }
  }

  employeetypenamelis(){
    let employeelist = new FormData();
    this.crmservice.getEmployee(employeelist).pipe(takeUntil(this.destroy$)).subscribe(resp =>{
      this.employee = resp.data;
    });
  }
  addtask() {
    this.submitted = false;
    this.saveButton=true;
    this.addTask.reset();
  }
  datatableCode() {
    this.DatatableParameter.Tasktype = 'CRMTask';
    this.DatatableParameter.reporters = this.searchTask.get('userName').value;
    this.DatatableParameter.Assignee = this.searchTask.get('customerName').value;
    this.DatatableParameter.tastStatus = this.searchTask.get('task_status').value;;
    this.DatatableParameter.taskDate = this.searchTask.get('task_date').value;
    const that = this;
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain'});
    this.dtOptions = {
      processing: true,
      serverSide: true,
      dom: 'lrtip',
      lengthMenu:[[5, 10, 25, 50], [5, 10, 25, 50]],
      columnDefs: [
        { orderable: false, targets: 5 }
      ],
      ajax: (dataTablesParameters: any, callback) => {
        Object.assign(dataTablesParameters, this.DatatableParameter);
        that.http.post<DataTablesResponse>(environment.APIEndpoint+'tasks.fetch_task&reload=1',Object.assign(dataTablesParameters,this.DatatableParameter), {responseType: 'json', headers}).pipe(takeUntil(this.destroy$)).subscribe(resp =>{
          that.dataa=resp.data;
          callback({recordsTotal: resp.recordsTotal,recordsFiltered: resp.recordsTotal,data: []});
        });   
      }
    };   
  }

  lookupdatalist(){
    let lookupStatus = "Status";
    let Statusdata = new FormData();
    Statusdata.append('lookupname',lookupStatus);
    this.crmservice.fetch_lookupdata(Statusdata).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
      this.respStatus = Response.data
    });
  }

  ViewTask(id) {
    this.router.navigate(['crm-task-details',id,'view']);
  }
  
  editTask(id){
    this.router.navigate(['/crm-task-details',id,'edit']);
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  deletTask(taskID){
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.value) {
        this.crmservice.deleteitem(taskID).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
          
          if(Response) {
            Swal.fire({
              icon:'success',
              title:'Success!',
              text:Response.MESSAGE,
              showConfirmButton:false,
              timer:2000
            });
            this.reload();
          }else{
            Swal.fire({
              icon:'error',
              title:'Error!',
              text:'item Delete Failed',
              showConfirmButton:false,
              timer:3000
            });
          }
        });
      } 
    })
  }

  public closeModal(){
    this.closebutton.nativeElement.click();
  }

  redirect(link){
    this.router.navigate(['/'+link]);
  }

  fetchTaskList(){
    this.crmservice.fetchTaskList().pipe(takeUntil(this.destroy$)).subscribe(Response =>{this.resp=Response});
  }

  taskSearch(){
    this.datatableCode();
    this.rerender();
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  insertTask(){
    if(this.addTask.valid){
      this.submitted = false;
      let taskData = new FormData();
      taskData.append('task_title',this.addTask.get('task_title').value);
      taskData.append('task_description',this.addTask.get('task_description').value);
      taskData.append('status',this.addTask.get('status').value);
      taskData.append('date',this.addTask.get('date').value);
      taskData.append('reporter',this.addTask.get('reporter').value);
      taskData.append('assignee',this.addTask.get('assignee').value);
      taskData.append('Tasktype','CRMTask');
      this.crmservice.addTask(taskData).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
        if(Response.CODE == 200) {
          Swal.fire({
            icon:'success',
            title:'Success!',
            text:Response.MESSAGE,
            showConfirmButton:false,
            timer:2000
          });
          this.searchTask.reset();
          this.addTask.reset();
          this.reload();
          this.closeModal();
        }else{
          Swal.fire({
            icon:'error',
            title:'Error!',
            text:'Task Creation Failed',
            showConfirmButton:false,
            timer:3000
          });
        }
      });  
    }else{
      this.submitted = true;
      Swal.fire('Alert','Fill all required fields first','info');
    }
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
    });
  } 
  reload() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }
  taskSearchReset(){
    this.searchTask.get('userName').setValue('');
    this.searchTask.get('customerName').setValue('');
    this.searchTask.get('task_status').setValue('');;
    this.searchTask.get('task_date').setValue('');
    this.datatableCode();
    this.rerender();
  }
}
