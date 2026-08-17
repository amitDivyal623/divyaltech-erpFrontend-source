import { Component, OnInit, ViewChild,TemplateRef, ChangeDetectorRef, OnDestroy,Injectable } from '@angular/core';
import { from, Subject } from 'rxjs';
import {Router} from '@angular/router';
import { HrService } from '../../services/hr.service';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import Swal from 'sweetalert2';
import { HttpClient ,HttpHeaders, HttpResponse } from '@angular/common/http';
import { DataTableDirective } from 'angular-datatables';
import { takeUntil } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { NgbCalendar, NgbDateAdapter, NgbDate, NgbDateParserFormatter, NgbDateStruct, NgbInputDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'src/environments/environment';
import { CompanyService } from '../../services/company.service';

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
 * This Service handles how the date is rendered and parsed from keyboard i.e. in the bound input field.
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
    selector: 'app-hr-task',
    templateUrl: './hr-task.component.html',
    styleUrls: ['./hr-task.component.css'],
    providers: [
        NgbInputDatepickerConfig,
        {provide: NgbDateAdapter, useClass: CustomAdapter},
        {provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter},
        {provide : DatePipe}
    ]
})
export class HrTaskComponent implements OnInit,OnDestroy {
    [x: string]: any;
    dtOptions: DataTables.Settings = {};
    dtTrigger: Subject<any> = new Subject<any>();
    @ViewChild(DataTableDirective) dtElement: DataTableDirective;
    @ViewChild('closebutton') closebutton;
    private destroy$ = new Subject<void>();
    private dateToString = (date) => `${date.year}-${date.month}-${date.day}`;
    respStatus =[];
    minDate = {year: 1900, month: 1, day: 1};
    maxDate = {year: 2099, month: 12, day: 31};
    DatatableParameter = { Assignee: '', reporters : '',taskDate: '',tastStatus: '',Tasktype:''};
    dataa:Tasks[];
    employee;
    modal:any;
    addTask = new FormGroup({
        status : new FormControl('',Validators.required),
        date : new FormControl('',Validators.required),
        assignee: new FormControl('',Validators.required),
        reporter: new FormControl('',Validators.required),
        task_title: new FormControl('',Validators.required),
        task_description : new FormControl('',Validators.required)
    });
    searchTask = new FormGroup({
        task_status : new FormControl('',Validators.required),
        userName: new FormControl('',Validators.required),
        task_date: new FormControl('',Validators.required),
        customerName: new FormControl('',Validators.required)
    });
    constructor(private router:Router,private http:HttpClient,private _fb: FormBuilder,private hrservice:HrService,private chRef : ChangeDetectorRef,private companyService:CompanyService) {
        if(sessionStorage.getItem('token')==undefined && sessionStorage.getItem('UserName')==undefined){
            this.router.navigate(['/']);
        }
    }
    ngOnInit(){
        this.hradminTab = false;
        this.hrUserTab = false;
        this.Admin = false;
        this.employeeTab = false;
        this.Administrator = false
        this.CRMAdmin = false;
        this.CRMUser = false;
        this.sysAdmin = false;
        this.projectManager = false;
        this.productManager = false;
        let role = sessionStorage.getItem('UserRole')
        let match = role.split(',')
        if (sessionStorage.getItem('COMPANY_NAME') == "Manoj Rajput Property Layout Pvt Ltd")
        {
        this.rajput_company = true;
        }
        for (let a in match){
        if(match[a] == 'HR Admin'){
        this.hradminTab = true;
        }
        if(match[a] == 'HR user'){
        this.hrUserTab = true;
        }
        if(match[a] == 'Admin'){
        this.Admin = true;
        }
        if(match[a] == 'Employee'){
        this.employeeTab = true;
        }
        if(match[a] == 'SystemAccess'){
        this.sysAdmin = true;
        }
        if(match[a] == 'Administrator'){
        this.Administrator = true;
        }
        if(match[a] == "Project Manager" ||  match[a] == "Project Coordinator"){
        this.projectManager = true;
        }
        if(match[a] == "Project Manager"){
        this.vendorAndMaterial = true;
        }
        if(match[a] == "Product Manager"){
        this.productManager = true;
        }
        if(match[a] == 'CRM Admin'){
        this.CRMAdmin = true;
        }
        if(match[a] == 'CRM User'){
        this.CRMUser = true;
        }
        }
        this.datatableCode();
        this.employeetypenamelis();
        this.lookupdatalist();
    }
    employeetypenamelis(){
        let employeelist = new FormData();
		this.hrservice.getEmployee(employeelist).pipe(takeUntil(this.destroy$)).subscribe(resp =>{
			this.employee = resp.data;
		});
    }
    addtask() {
        this.submitted = false;
        this.saveButton=true;
        this.addTask.reset();
        this.isButtonDisabled = false;
    }
    datatableCode() {
        this.DatatableParameter.Assignee = this.searchTask.get('customerName').value;
        this.DatatableParameter.reporters = this.searchTask.get('userName').value;
        this.DatatableParameter.tastStatus = this.searchTask.get('task_status').value;
        this.DatatableParameter.Tasktype = 'HRTask';
        if(this.dateToString(this.searchTask.get('task_date').value) != '' && this.dateToString(this.searchTask.get('task_date').value) != 'undefined-undefined-undefined'){
            this.DatatableParameter.taskDate = this.dateToString(this.searchTask.get('task_date').value);
        }
        const that = this;
        const headers = new HttpHeaders({ 'Content-Type': 'text/plain'});
        this.dtOptions = {
            processing: true,
            serverSide: true,
            dom: 'lrtip',
            lengthMenu:[[5, 10, 25, 50], [5, 10, 25, 50]],
            columnDefs: [{ orderable: false, targets: 5 }],
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
        this.hrservice.fetch_lookupdata(Statusdata).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
            this.respStatus = Response.data
        });
    }
    ViewTask(id) {
        this.isButtonDisabled = false;
        if(sessionStorage.getItem('UserRole') == 'Employee'){
            this.hrservice.getTaskDetails(id).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
                this.taskBriefDetails = Response.DATA;
                this.assigne = this.taskBriefDetails[0][5];
                this.reporter = this.taskBriefDetails[0][6];
                let getUserId = new FormData();
                this.companyService.ViewUserinfo(getUserId).pipe(takeUntil(this.destroy$)).subscribe(employeeResponse =>{
                    if(employeeResponse.data[0].EmployeeId == this.assigne || employeeResponse.data[0].EmployeeId == this.reporter){
                        this.router.navigate(['/hr-task-details',id,'view']);
                    }else{
                        Swal.fire({
                            icon:'error',
                            title:'Sorry!',
                            text:'You are not authorized to view this Task',
                            showConfirmButton:false,
                            timer:3000
                        });
                    }
                });
            });
        }else{
            this.router.navigate(['/hr-task-details',id,'view']);
        }
    }
    editTask(id){
        this.isButtonDisabled = false;
        if(sessionStorage.getItem('UserRole') == 'Employee'){
            this.hrservice.getTaskDetails(id).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
                this.taskBriefDetails = Response.DATA;
                this.assigne = this.taskBriefDetails[0][5];
                this.reporter = this.taskBriefDetails[0][6];
                let getUserId = new FormData();
                this.companyService.ViewUserinfo(getUserId).pipe(takeUntil(this.destroy$)).subscribe(employeeResponse =>{
                    if(employeeResponse.data[0].EmployeeId == this.assigne || employeeResponse.data[0].EmployeeId == this.reporter){
                        this.router.navigate(['/hr-task-details',id,'edit']);
                    }else{
                        Swal.fire({
                            icon:'error',
                            title:'Sorry!',
                            text:'You are not authorized to edit this Task',
                            showConfirmButton:false,
                            timer:3000
                        });
                    }
                });
            });
        }else{
            this.router.navigate(['/hr-task-details',id,'edit']);
        }
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
                this.hrservice.deleteitem(taskID).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
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
        this.hrservice.fetchTaskList().pipe(takeUntil(this.destroy$)).subscribe(Response =>{});
    }
    taskSearch(){
        this.datatableCode();
        this.rerender();
    }
    ngAfterViewInit(): void {
        this.dtTrigger.next();
    }
    insertTask(){
        this.isButtonDisabled = false;
        if(this.addTask.valid){
            this.submitted = false;
            this.isButtonDisabled = true;
            let taskData = new FormData();
            taskData.append('task_title',this.addTask.get('task_title').value);
            taskData.append('task_description',this.addTask.get('task_description').value);
            taskData.append('status',this.addTask.get('status').value);
            taskData.append('date',this.dateToString(this.addTask.get('date').value));
            taskData.append('reporter',this.addTask.get('reporter').value);
            taskData.append('assignee',this.addTask.get('assignee').value);
            taskData.append('Tasktype','HRTask');
            this.hrservice.addTask(taskData).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
                if(Response.CODE == 200) {
                    Swal.fire({
                        icon:'success',
                        title:'Success!',
                        text:Response.MESSAGE,
                        showConfirmButton:false,
                        timer:2000
                    });
                    this.reload();
                    this.addTask.reset();
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
            this.isButtonDisabled = false;
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
}
