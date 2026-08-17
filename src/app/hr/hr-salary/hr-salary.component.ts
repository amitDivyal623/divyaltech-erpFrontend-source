import { Component, OnInit,ViewChild,ElementRef, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import {FormBuilder, FormControl, FormGroup, Validators, FormArray} from '@angular/forms';
import { HttpClient ,HttpHeaders, HttpResponse } from '@angular/common/http';
import { HrService } from '../../services/hr.service';
import { DatePipe } from '@angular/common';

@Component({
	selector: 'app-hr-salary',
	templateUrl: './hr-salary.component.html',
	styleUrls: ['./hr-salary.component.css']
})
export class HrSalaryComponent implements OnInit {
	[x: string]: any;
	
	activeTab = "Profile"
	constructor(private cd: ChangeDetectorRef,private http:HttpClient, private _fb: FormBuilder, private router: Router,private hrservice:HrService,private datePipe: DatePipe) {
		if(sessionStorage.getItem('token')==undefined && sessionStorage.getItem('UserName')==undefined){
			this.router.navigate(['/']);
		  }
	 }
	ngOnInit() { 
		this.employeeSalaryProcess = false;
		if(sessionStorage.getItem('UserRole') == 'Employee'){
			this.employeeTab = true;
			this.employeeSalaryProcess = true;
			this.activeTab = "Deduction"
		}
		if(sessionStorage.getItem('UserRole') == 'HR user'){
			this.employeeSalaryProcess = true;
		}
	}
	createsalary(){
		this.router.navigate(['/hr-employee-salary-create']);
	}
	route(link:any){
		this.router.navigate(['/'+link]);
		

	}
	result(tabName:any){
		this.activeTab = tabName;
	}
}
