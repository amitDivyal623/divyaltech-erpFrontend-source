import { Component, OnInit, OnDestroy,ViewChild,ElementRef, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import {FormBuilder, FormControl, FormGroup, Validators, FormArray} from '@angular/forms';
import { Observable,from, Subject } from 'rxjs';
import {debounceTime, distinctUntilChanged, map, takeUntil} from 'rxjs/operators';
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
  selector: 'app-hr-employee-attendance',
  templateUrl: './hr-employee-attendance.component.html',
  styleUrls: ['./hr-employee-attendance.component.scss']
})
export class HrEmployeeAttendanceComponent implements OnInit, OnDestroy {

  	[x: string]: any;
	dtOptions: DataTables.Settings = {};
	dtTrigger: Subject<any> = new Subject<any>();
	private destroy$ = new Subject<void>();
	@ViewChild(DataTableDirective) dtElement: DataTableDirective;
	@ViewChild('viewbutton') viewbutton;
	
	DatatableParameter = { month: '', year : '',employee: ''};
	searchAttandence = new FormGroup({
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
		this.searchAttandence.controls['month'].setValue(("0"+new Date().getMonth()).slice(-2));
		this.searchAttandence.controls['year'].setValue(this.datePipe.transform(new Date(),"yyyy"));
		this.datatableCode();
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
	datatableCode() {
		this.DatatableParameter.month = this.searchAttandence.get('month').value;
		this.DatatableParameter.year = this.searchAttandence.get('year').value;
		this.DatatableParameter.employee = this.searchAttandence.get('employee').value;
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
				that.http.post<DataTablesResponse>(environment.APIEndpoint+'salary.fetch_attendance&reload=1',Object.assign(dataTablesParameters,this.DatatableParameter), {responseType: 'json', headers}).pipe(takeUntil(this.destroy$)).subscribe(resp =>{
					that.dataa=resp.data;
					callback({recordsTotal: resp.recordsTotal,recordsFiltered: resp.recordsTotal,data: []});
				});
			}
		};
	}
	searching(){
		this.datatableCode();
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

}
