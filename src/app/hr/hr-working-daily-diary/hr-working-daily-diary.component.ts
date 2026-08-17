import { Component, OnInit,ViewChild,ElementRef, ChangeDetectorRef,OnDestroy ,Injectable,TemplateRef} from '@angular/core';
import { Router } from '@angular/router';
import {FormBuilder, FormControl, FormGroup, Validators, FormArray} from '@angular/forms';
import { Observable,from, Subject } from 'rxjs';
import {debounceTime, distinctUntilChanged, map, takeUntil} from 'rxjs/operators';
import Swal from 'sweetalert2';
import { HrService } from 'src/app/services/hr.service';
import { HttpClient ,HttpHeaders, HttpResponse } from '@angular/common/http';
import { DataTableDirective } from 'angular-datatables';
import { DatePipe } from '@angular/common';
import { NgbCalendar, NgbDateAdapter, NgbDate, NgbDateParserFormatter, NgbDateStruct, NgbInputDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'src/environments/environment';
import { CompanyService } from '../../services/company.service';
import {EmployeeModelComponent} from '../../shared/employee-model/employee-model.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


class workdiarymangment {
    searchentrydate: string;
    searchproject: string;
    searchemployeetype: string;

}

class DataTablesResponse {
    data: any[];
    draw: number;
    recordsFiltered: number;
    recordsTotal: number;
}
const project =['Project1', 'Project2','Project3', 'Project4','Project5'];
@Injectable()
export class CustomAdapter extends NgbDateAdapter<string> {

  readonly DELIMITER = '/';

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
    selector: 'app-hr-working-daily-diary',
    templateUrl: './hr-working-daily-diary.component.html',
    styleUrls: ['./hr-working-daily-diary.component.css'],
    providers: [
        NgbInputDatepickerConfig,
        {provide: NgbDateAdapter, useClass: CustomAdapter},
        {provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter},
        {provide : DatePipe}
      ]
})
export class HrWorkingDailyDiaryComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    model: NgbDateStruct;
    model2: string;
    model3: string;
    Permanentdiv: boolean = true;
    fieldStatus:boolean = false;
    dtOptions: DataTables.Settings = {};
    dtTrigger: Subject<any> = new Subject<any>();
    @ViewChild(DataTableDirective) dtElement: DataTableDirective;
    @ViewChild('fileInput') el: ElementRef;
    @ViewChild('modalbutton') modalbutton;
    @ViewChild('closebutton') closebutton;
    workDiaryDetails = new FormGroup({
        entryDate:new FormControl('',Validators.required),
        projectName:new FormControl('',Validators.required),
        EmployeeType:new FormControl(''),
        EmployeeName:new FormControl(''),
        labourName:new FormControl(''),
        totalLabour:new FormControl(''),
        notes:new FormControl('',Validators.required),
        ContractorName:new FormControl(' '),
        EntryID:new FormControl(''),
        TempEmployeeName:new FormControl(''),
        Employee_Type:new FormControl(''),
    });
    SearchworkDiaryDetails = new FormGroup({
        searchentrydate: new FormControl(''),
        searchproject: new FormControl(''),
        searchemployeetype: new FormControl('')
    });
    DatatableParameter = { searchentrydate: '', searchproject: '', searchemployeetype: '',CompanyId:''};
    constructor(private modalService: NgbModal, private hrservice: HrService, private cd: ChangeDetectorRef, private _fb: FormBuilder, private router:Router,public http:HttpClient,private datePipe: DatePipe,private companyService:CompanyService) {
        if(sessionStorage.getItem('token')==undefined && sessionStorage.getItem('UserName')==undefined){
            this.router.navigate(['/']);
        }
    }
    //search select code
    [x: string]: any;
    data:workdiarymangment[];
    search = (text$: Observable<string>) =>
        text$.pipe(
        debounceTime(200),
        distinctUntilChanged(),
        map(term => term.length < 2 ? []
            : project.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
        )
    //end of search select code
    minDate = {year: 1900, month: 1, day: 1};
    maxDate = {year: 2099, month: 12, day: 31};
    ngOnInit(): void {
        this.lookuplist();
        this.datatableCode();
        this.projectlist();
        this.contractorlist();
        this.employeetypenamelis();
        this.EmployeeTypeAccess = true;
    }
    lookuplist(){
        let lookupEmployeeType = "Employee Type";
        let employeetypedata = new FormData();
        employeetypedata.append('lookupname',lookupEmployeeType);
        this.hrservice.fetch_lookupdata(employeetypedata).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
            this.resplookupEmployeeType = Response.data
        });
    }
    projectlist(){
        let projectlist = new FormData();
        this.hrservice.projectlist(projectlist).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
            this.respProject = Response.data
        });
    }
    contractorlist(){
        let projectlist = new FormData();
        this.hrservice.contractorList(projectlist).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
            this.respcontractor = Response.data
        });
    }
    employeetypenamelis(){
        let employee = new FormData();
        employee.append('EmployeeType','Temporary Employee');
        this.hrservice.employeelist(employee).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
            this.resptempEmployeeType = Response.data
        });
        let employee1 = new FormData();
        employee1.append('EmployeeType','Permanent Employee');
        this.hrservice.employeelist(employee1).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
            this.PermanentEmployeeType = Response.data
        });
    }

    addEmployee(){
        const modalRef = this.modalService.open(EmployeeModelComponent, { size: 'lg', backdrop: 'static', keyboard: true });
        modalRef.componentInstance.heading = this.heading;
        modalRef.componentInstance.PermanentEmployeeType = this.PermanentEmployeeType;
        modalRef.componentInstance.minDate = this.minDate;
        modalRef.componentInstance.submitted = this.submitted;
        modalRef.componentInstance.model2 = this.model2;
        modalRef.componentInstance.entrydatetime = this.entrydatetime;
        modalRef.componentInstance.respProject = this.respProject;
        modalRef.componentInstance.EmployeeTypeAccess = this.EmployeeTypeAccess;
        modalRef.componentInstance.tempdiv = this.tempdiv;
        modalRef.componentInstance.Permanentdiv =  this.Permanentdiv;
        modalRef.componentInstance.labourdiv = this.labourdiv;
        modalRef.componentInstance.classname = this.classname;
        modalRef.componentInstance.resplookupEmployeeType = this.resplookupEmployeeType;
        modalRef.componentInstance.resptempEmployeeType = this.resptempEmployeeType;
        modalRef.componentInstance.saveButton = this.saveButton;
        modalRef.componentInstance.projectName = this.projectName;
        modalRef.componentInstance.EmployeeType = this.EmployeeType;
        modalRef.componentInstance.EmployeeName = this.EmployeeName;
        modalRef.componentInstance.TempEmployeeName = this.TempEmployeeName;
        modalRef.componentInstance.labourName = this.labourName;
        modalRef.componentInstance.totalLabour = this.totalLabour;
        modalRef.componentInstance.notes = this.notes;
        modalRef.componentInstance.ContractorName = this.ContractorName;
        modalRef.componentInstance.EntryID = this.EntryID;
        modalRef.componentInstance.setData = this.setData;
        modalRef.componentInstance.fieldStatus = this.fieldStatus;
        modalRef.componentInstance.Employee_Type = this.Employee_Type;
        modalRef.componentInstance.respcontractor = this.respcontractor;
        modalRef.result.then((response: any) => {
            this.reload();
        },() => {});
    }

    deleteDiary(e){
        this.hrservice.workdailydairydata(e).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
            this.createdDate = this.datePipe.transform(Response.DATA[0][11], 'dd/MM/yyyy');
            this.username = Response.DATA[0][10];
            let i=0
            this.todayDate = this.datePipe.transform(new Date(), 'dd/MM/yyyy');
            if(sessionStorage.getItem('UserRole') == 'Employee' && this.todayDate != this.createdDate){
                Swal.fire({
                    icon:'error',
                    title:'Sorry!',
                    text:'You are not authorized to Delete',
                    showConfirmButton:false,
                    timer:3000
                });
                this.workDiaryDetails.disable();
            }else{
                Swal.fire({
                    title: 'Are you sure?',
                    text: 'You want to delete this.',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Yes',
                    cancelButtonText: 'No'
                    }).then((result) => {
                    if (result.value) {
                        this.hrservice.deleteDiary(e).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
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
                                    text:'Employee Delete Failed',
                                    showConfirmButton:false,
                                    timer:3000
                                });
                            }
                        });
                    }
                })
            }
        });
    }

  datatableCode() {
        this.DatatableParameter.searchentrydate = this.SearchworkDiaryDetails.get('searchentrydate').value;
        this.DatatableParameter.searchproject = this.SearchworkDiaryDetails.get('searchproject').value;
        this.DatatableParameter.searchemployeetype = this.SearchworkDiaryDetails.get('searchemployeetype').value;
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
                that.http.post<DataTablesResponse>(environment.APIEndpoint+'hr.fetch_daily_working&reload=1',Object.assign(dataTablesParameters,this.DatatableParameter), {responseType: 'json', headers}).pipe(takeUntil(this.destroy$)).subscribe(resp =>{
                    that.data=resp.data;
                               
                    callback({recordsTotal: resp.recordsTotal,recordsFiltered: resp.recordsTotal,data: []});
                });
            }
        };
    }
    viewDiary(id){
        this.submitted = false
        this.saveButton=false;
        this.workDiaryDetails.disable();
        this.hrservice.workdailydairydata(id).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
            this.employeetype = Response.DATA[0][15];
            if(this.employeetype == "Temporary Employee"){
                this.tempdiv = true;
                this.labourdiv=false;
                this.Permanentdiv=false;
            }else if(this.employeetype == "Permanent Employee"){
                this.Permanentdiv=true
                this.tempdiv = false;
                this.labourdiv=false;
            }else if(this.employeetype == "Contract Employee"){
                this.labourdiv=true;
                this.tempdiv = false;
                this.Permanentdiv=false;
            }
            this.entrydatetime = Response.DATA[0][2];
            this.createdDate = this.datePipe.transform(Response.DATA[0][11], 'dd/MM/yyyy');
            this.username = Response.DATA[0][10];
            this.todayDate = this.datePipe.transform(new Date(), 'dd/MM/yyyy');
            if(sessionStorage.getItem('UserRole') == 'Employee'){
                let getUserId = new FormData();
                this.companyService.ViewUserinfo(getUserId).pipe(takeUntil(this.destroy$)).subscribe(employeeResponse =>{
                    if(employeeResponse.data[0].EmployeeId != Response.DATA[0][5]){
                        Swal.fire({
                            icon:'error',
                            title:'Sorry!',
                            text:'You are not authorized to view',
                            showConfirmButton:false,
                            timer:3000
                        });
                    }else{

                        this.heading = "View Entry"
                        this.projectName = Response.DATA[0][9];
                        this.EmployeeType = Response.DATA[0][4];
                        this.EmployeeName = Response.DATA[0][5];
                        this.TempEmployeeName = Response.DATA[0][5];
                        this.labourName = Response.DATA[0][6];
                        this.totalLabour = Response.DATA[0][7];
                        this.notes = Response.DATA[0][3];
                        this.ContractorName = Response.DATA[0][14];
                        this.EntryID = Response.DATA[0][1];
                        this.classname= "active";
                        this.setData = true;
                        this.fieldStatus = true;
                        this.modalbutton.nativeElement.click();
                    }
                });
            }else{
                this.heading = "View Entry"
                this.projectName = Response.DATA[0][9];
                this.EmployeeType = Response.DATA[0][4];
                this.EmployeeName = Response.DATA[0][5];
                this.TempEmployeeName = Response.DATA[0][5];
                this.labourName = Response.DATA[0][6];
                this.totalLabour = Response.DATA[0][7];
                this.notes = Response.DATA[0][3];
                this.ContractorName = Response.DATA[0][14];
                this.EntryID = Response.DATA[0][1];
                this.classname= "active";
                this.setData = true;
                this.fieldStatus = true;
                this.modalbutton.nativeElement.click();
            }
        });
    }
    editDiary(id) {
        this.saveButton=true;
        this.submitted = false
        this.workDiaryDetails.enable();
        this.hrservice.workdailydairydata(id).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
            this.employeetype = Response.DATA[0][15];
            if(this.employeetype == "Temporary Employee"){
                this.Employee_Type = "Temporary Employee";
                this.workDiaryDetails.controls.Employee_Type.setValue('Temporary Employee');
                this.tempdiv = true;
                this.labourdiv=false;
                this.Permanentdiv=false;
            }else if(this.employeetype == "Permanent Employee"){
                this.Employee_Type = "Permanent Employee";
                this.workDiaryDetails.controls.Employee_Type.setValue('Permanent Employee');
                this.Permanentdiv=true
                this.tempdiv = false;
                this.labourdiv=false;
            }else if(this.employeetype == "Contract Employee"){
                this.Employee_Type = "Contract Employee";
                this.workDiaryDetails.controls.Employee_Type.setValue('Contract Employee');
                this.labourdiv=true;
                this.tempdiv = false;
                this.Permanentdiv=false;
            }
            this.entrydatetime = Response.DATA[0][2];

            this.createdDate = this.datePipe.transform(Response.DATA[0][11], 'dd/MM/yyyy');
            this.todayDate = this.datePipe.transform(new Date(), 'dd/MM/yyyy');
            if( (sessionStorage.getItem('UserRole') == 'Employee' && this.todayDate != this.createdDate)){
                Swal.fire({
                    icon:'error',
                    title:'Sorry!',
                    text:'You are not authorized to edit',
                    showConfirmButton:false,
                    timer:3000
                });
                this.workDiaryDetails.disable();
            }else{
                this.heading = "Edit Entry"
                this.projectName = Response.DATA[0][9];
                this.EmployeeType = Response.DATA[0][4];
                this.EmployeeName = Response.DATA[0][5];
                this.TempEmployeeName = Response.DATA[0][5];
                this.labourName = Response.DATA[0][6];
                this.totalLabour = Response.DATA[0][7];
                this.notes = Response.DATA[0][3];
                this.ContractorName = Response.DATA[0][14];
                this.EntryID = Response.DATA[0][1];
                this.classname= "active";
                this.setData = true;
                this.fieldStatus = false;
                this.modalbutton.nativeElement.click();
            }
        });
    }
    addDiary() {
        this.saveButton=true;
        this.submitted = false
        this.fieldStatus = false;
        this.workDiaryDetails.reset();
        this.heading="Add New Entry";
        this.workDiaryDetails.enable();
        this.tempdiv = false;
        this.labourdiv=false;
        this.Permanentdiv=true;
        this.setData = false;
        if(sessionStorage.getItem('UserRole') == 'Employee'){
            this.employeeLogin = true;
            let getUserId = new FormData();
          this.companyService.ViewUserinfo(getUserId).pipe(takeUntil(this.destroy$)).subscribe(Response => {
                if(Response.data[0].length != 0){
                    let employeeData = new FormData();
                    employeeData.append('EmployeeId',Response.data[0].EmployeeId);
                  this.hrservice.getemployeeData(employeeData).pipe(takeUntil(this.destroy$)).subscribe(Res => {
                        this.workDiaryDetails.controls.EmployeeType.setValue(Res.EMPLOYEEDATA.DATA[0][4]);
                    });
                    this.workDiaryDetails.controls.EmployeeName.setValue(Response.data[0].EmployeeId);

                    this.workDiaryDetails.controls.Employee_Type.setValue('Permanent Employee');
                    this.workDiaryDetails.controls.EmployeeName.disable();
                    this.EmployeeTypeAccess = false;
                }
            })
        }
        this.modalbutton.nativeElement.click();
    }
    closeModal(){
        this.closebutton.nativeElement.click();
    }
    diarySearch(){
        this.datatableCode();
        this.rerender();
    }
    ngOnDestroy(): void {
        this.dtTrigger.unsubscribe();
        this.destroy$.next();
        this.destroy$.complete();
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
    ngAfterViewInit(): void {
        this.dtTrigger.next();
    }
    resetSearch(){
      this.SearchworkDiaryDetails.reset();
      this.SearchworkDiaryDetails.get('searchentrydate').setValue('');
      this.SearchworkDiaryDetails.get('searchproject').setValue('');
      this.SearchworkDiaryDetails.get('searchemployeetype').setValue('');
      this.datatableCode();
      this.rerender();
    }
}
