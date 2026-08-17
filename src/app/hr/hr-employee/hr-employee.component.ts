import { Component, OnInit , ViewChild,TemplateRef, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { from, Subject } from 'rxjs';
import { HrService } from '../../services/hr.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { HttpClient ,HttpHeaders, HttpResponse } from '@angular/common/http';
import { StringLiteralLike } from 'typescript';
import { DataTableDirective } from 'angular-datatables';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { CompanyService } from '../../services/company.service';
class employeeSDatalist {
	EmployeeName: string;
	JoiningDate: string;
    EmployeeId: string;
    DesignationCode: string;
    EmailId: string;
    MobileNo: number;
    EmpPermAdd: string;
    WorkStatus: string;
}

class DataTablesResponse {
    data: any[];
    draw: number;
    recordsFiltered: number;
    recordsTotal: number;
}

@Component({
  selector: 'app-hr-employee',
  templateUrl: './hr-employee.component.html',
  styleUrls: ['./hr-employee.component.css'],
})
export class HrEmployeeComponent implements OnInit,OnDestroy {
   
    [x: string]: any;
    dtOptions: DataTables.Settings = {};
    dtTrigger: Subject<any> = new Subject<any>();
    @ViewChild(DataTableDirective) dtElement: DataTableDirective;
    @ViewChild('closebutton') closebutton;
    private destroy$ = new Subject<void>();
    DatatableParameter = { EmployeeName: '' ,Designation: '',EmployeeType : '',Contact : ''};
    //private dateToString = (date) => `${date.year}-${date.month}-${date.day}`; 

    minDate = {year: 1900, month: 1, day: 1};
    maxDate = {year: 2099, month: 12, day: 31};
    dataa:employeeSDatalist[];
    constructor(private router:Router,public http:HttpClient,private hrservice:HrService,private chRef : ChangeDetectorRef,private companyService:CompanyService) { 
        if(sessionStorage.getItem('token')==undefined && sessionStorage.getItem('UserName')==undefined){
            this.router.navigate(['/']);
        }
     }
    adddesignation = new FormGroup({
        Department : new FormControl('',Validators.required),       
        emp_designation : new FormControl('',Validators.required)       
    });
    searchemp = new FormGroup({
        EmployeeName : new FormControl(''),
        Designation: new FormControl(''),
        EmployeeType: new FormControl(''),
        Contact: new FormControl('')
    });

    addemployee(){
        this.router.navigate(['/hr-employee-add']);
    }

    editmployee(id){
        this.router.navigate(['/hr-employee-details' ,id,'edit']);
    }
    viewemployee(id){
        this.router.navigate(['/hr-employee-details' ,id,'view']);
    }
    insertDesignation(){
        this.isButtonDisabled = false;
        if(this.adddesignation.valid){
            this.isButtonDisabled = true;
            let designationData = new FormData();
            designationData.append('Department',this.adddesignation.get('Department').value);
            designationData.append('emp_designation',this.adddesignation.get('emp_designation').value);
            this.hrservice.adddesignation(designationData).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
                if(Response.CODE == 200) {
                    Swal.fire({
                        icon:'success',
                        title:'Success!',
                        text:Response.MESSAGE,
                        showConfirmButton:false,
                        timer:2000
                    });
                    this.reload();
                    this.adddesignation.reset();
                    this.closeModal();
                }else{
                    Swal.fire({
                        icon:'error',
                        title:'Error!',
                        text:'designation Creation Failed',
                        showConfirmButton:false,
                        timer:3000
                    });
                }
            });  
        }else{
          this.isButtonDisabled = false;
          Swal.fire('Alert','Fill all required fields first','info');
        }
    }
    deletemployee(e){
        Swal.fire({
            title: 'Are you sure?',
            text: 'You want to delete this.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
          }).then((result) => {
            if (result.value) {
                this.hrservice.deleteemployee(e).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
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
    employeeSearch(){
        sessionStorage.setItem('crmEmpValues', JSON.stringify(this.searchemp.value));
        sessionStorage.getItem(JSON.stringify(this.searchemp.value));

        if(this.router.url == '/hr-employee'){
            const storedFormValues = JSON.parse(sessionStorage.getItem('crmEmpValues'));
            if(storedFormValues){
                this.datatableCode();
                this.rerender();
            }
        }

    }
    employeeReset(){
        this.searchemp.get('EmployeeName').setValue('');
        this.searchemp.get('Designation').setValue('');
        this.searchemp.get('EmployeeType').setValue('');
        this.searchemp.get('Contact').setValue('');
        sessionStorage.setItem('crmEmpValues', JSON.stringify(this.searchemp.value));
        this.datatableCode();
        this.rerender();
    }
    datatableCode() {

        const storedFormValues = JSON.parse(sessionStorage.getItem('crmEmpValues') || '{}');

        this.searchemp.get('EmployeeName').setValue(storedFormValues.EmployeeName);
        this.searchemp.get('Designation').setValue(storedFormValues.Designation);
        this.searchemp.get('EmployeeType').setValue(storedFormValues.EmployeeType);
        this.searchemp.get('Contact').setValue(storedFormValues.Contact);

        if(storedFormValues && Object.keys(storedFormValues).length > 0){
            this.DatatableParameter.EmployeeName = storedFormValues.EmployeeName;
            this.DatatableParameter.Designation = storedFormValues.Designation;
            this.DatatableParameter.EmployeeType = storedFormValues.EmployeeType;
            this.DatatableParameter.Contact = storedFormValues.Contact;
        }else {
            this.searchemp.reset();
            this.searchemp.get('EmployeeName').setValue('');
            this.searchemp.get('Designation').setValue('');
            this.searchemp.get('EmployeeType').setValue('');
            this.searchemp.get('Contact').setValue('');
            sessionStorage.setItem('crmEmpValues', JSON.stringify(this.searchemp.value));

            this.DatatableParameter.EmployeeName = this.searchemp.get('EmployeeName').value;
            this.DatatableParameter.Designation = this.searchemp.get('Designation').value;
            this.DatatableParameter.EmployeeType = this.searchemp.get('EmployeeType').value;
            this.DatatableParameter.Contact = this.searchemp.get('Contact').value;
        }

        const that = this;
        const headers = new HttpHeaders({ 'Content-Type': 'text/plain'});
        this.dtOptions = {
            processing: true,
            serverSide: true,
            dom: 'lrtip',
            lengthMenu:[[5, 10, 25, 50], [5, 10, 25, 50]],
            columnDefs: [
                { orderable: false, targets: 9 }
            ],
            
            ajax: (dataTablesParameters: any, callback) => {
                Object.assign(dataTablesParameters, this.DatatableParameter);
                that.http.post<DataTablesResponse>(environment.APIEndpoint+'hr.fetch_employee&reload=1',Object.assign(dataTablesParameters,this.DatatableParameter), {responseType: 'json', headers}).pipe(takeUntil(this.destroy$)).subscribe(resp =>{
                    that.dataa=resp.data;
                    
                    callback({recordsTotal: resp.recordsTotal,recordsFiltered: resp.recordsTotal,data: []});
                });
            }
        };
        
    }
    ngOnInit(): void {
        this.datatableCode();
        this.lookupdatalist();
        this.EmployeeRole= false;
        if(sessionStorage.getItem('UserRole') == 'Employee'){
            this.employeeLogin = true;
            let getUserId = new FormData();
            this.companyService.ViewUserinfo(getUserId).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
                this.router.navigate(['/hr-employee-details' ,Response.data[0].EmployeeId,'view']);
            })
        }
    }
    lookupdatalist(){
        let deprtmentdata = new FormData();
        this.hrservice.fetch_designation(deprtmentdata).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
            this.resplookupDesignation = Response.data
        });
        let lookupEmployeeType = "Employee Type";
        let EmployeeTypedata = new FormData();
        EmployeeTypedata.append('lookupname',lookupEmployeeType);
        this.hrservice.fetch_lookupdata(EmployeeTypedata).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
            this.resplookupEmployeeType = Response.data
        });

        let lookupDepartment = "Department";
        let departmentdata = new FormData();
        departmentdata.append('lookupname',lookupDepartment);
        this.hrservice.fetch_lookupdata(departmentdata).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
            this.resplookupDepartment = Response.data
        });
    }

    ngOnDestroy(): void {
        this.dtTrigger.unsubscribe();
        this.destroy$.next();
        this.destroy$.complete();
    }
    public closeModal(){
        this.closebutton.nativeElement.click();
    }
    redirect(link){
        this.router.navigate(['/'+link]);
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
    fetchemployee(){
        this.hrservice.fetchemployee().pipe(takeUntil(this.destroy$)).subscribe(Response =>{});
    }
    
}
