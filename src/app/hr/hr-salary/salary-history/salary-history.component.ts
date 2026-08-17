import { Component, OnInit, OnDestroy,ViewChild,ElementRef, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import {FormBuilder, FormControl, FormGroup, Validators, FormArray} from '@angular/forms';
import { Observable,from, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HttpClient ,HttpHeaders, HttpResponse } from '@angular/common/http';
import { HrService } from '../../../services/hr.service';
import { DatePipe } from '@angular/common';
import { DataTableDirective } from 'angular-datatables';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';

class DataTablesResponse {
	data: any[];
	draw: number;
	recordsFiltered: number;
	recordsTotal: number;
}

@Component({
	selector: 'app-salary-history',
	templateUrl: './salary-history.component.html',
	styleUrls: ['./salary-history.component.css']
})
export class SalaryHistoryComponent implements OnInit, OnDestroy {

	[x: string]: any;
	dtOptions: DataTables.Settings = {};
	dtOptions1: DataTables.Settings = {};
	dtTrigger: Subject<any> = new Subject<any>();
	private destroy$ = new Subject<void>();
	@ViewChild(DataTableDirective) dtElement: DataTableDirective;
	@ViewChild('viewbutton') viewbutton;
	DatatableParameter = { month: '', year : '',employee: ''};
	searchsalaryHistory = new FormGroup({
		month : new FormControl(''),
		year: new FormControl(''),
		employee: new FormControl('')
	});
	constructor(private cd: ChangeDetectorRef,private http:HttpClient, private _fb: FormBuilder, private router: Router,private hrservice:HrService,private datePipe: DatePipe) {
		if(sessionStorage.getItem('token')==undefined && sessionStorage.getItem('UserName')==undefined){
			this.router.navigate(['/']);
		  }
	 }

	ngOnInit(): void {
		this.searchsalaryHistory.controls['month'].setValue(("0"+new Date().getMonth()).slice(-2));
		this.searchsalaryHistory.controls['year'].setValue(this.datePipe.transform(new Date(),"yyyy"));
		this.historydatatableCode();
		this.employeetypenamelis();
	}
	employeetypenamelis(){
		let employeelist = new FormData();
		this.hrservice.getEmployee(employeelist).pipe(takeUntil(this.destroy$)).subscribe(resp =>{
			this.employee = resp.data;
		});
		this.hrservice.getcalander(employeelist).pipe(takeUntil(this.destroy$)).subscribe(resp =>{
			this.calander = resp.DATA;
		});
	}
	historydatatableCode() {
		this.DatatableParameter.month = this.searchsalaryHistory.get('month').value;
		this.DatatableParameter.year = this.searchsalaryHistory.get('year').value;
		this.DatatableParameter.employee = this.searchsalaryHistory.get('employee').value;
		const that = this;
		const headers = new HttpHeaders({ 'Content-Type': 'text/plain'});
		this.dtOptions1 = {
			processing: true,
			serverSide: true,
			dom: 'lrtip',
			lengthMenu:[[5, 10, 25, 50], [5, 10, 25, 50]],
			// columnDefs: [
			// 	{ orderable: false, targets: 5 }
			// ],
			ajax: (dataTablesParameters: any, callback) => {
				Object.assign(dataTablesParameters, this.DatatableParameter);
				that.http.post<DataTablesResponse>(environment.APIEndpoint+'salary.Salary_history&reload=1',Object.assign(dataTablesParameters,this.DatatableParameter), {responseType: 'json', headers}).pipe(takeUntil(this.destroy$)).subscribe(resp =>{
					that.herstoryRes=resp.data;
					callback({recordsTotal: resp.recordsTotal,recordsFiltered: resp.recordsTotal,data: []});
				});
			}
		};
	}
	viewsealrhistory(id){
		let sailryDetail = new FormData();
		sailryDetail.append('employee_id',id);
		this.hrservice.getsalaryhitory(sailryDetail).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
			this.employeename = Response.DATA[0][23];
			this.basicSalary = Response.DATA[0][5];
			this.HRA = Response.DATA[0][6];
			this.CA = Response.DATA[0][9];
			this.DA = Response.DATA[0][8];
			this.Grosspay = Response.DATA[0][20];
			this.Bonus = Response.DATA[0][11];
			this.PFDeduction = Response.DATA[0][12];
			this.ESIDeduction= Response.DATA[0][13];
			this.NetSalary= Response.DATA[0][19];
			this.TotalCTC = Response.DATA[0][26];
        });
        this.viewbutton.nativeElement.click();
    }
	historySreach(){
		this.historydatatableCode();
		this.rerender();
	}
	ngOnDestroy(): void {
		this.dtTrigger.unsubscribe();
		this.destroy$.next();
		this.destroy$.complete();
	}
	ngAfterViewInit(): void {
		this.dtTrigger.next();
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
	route(link:any){
		this.router.navigate(['/'+link]);
	}
	result(tabName:any){
		this.activeTab = tabName;
	}
}
