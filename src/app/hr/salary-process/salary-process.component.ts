import { Component, OnInit, OnDestroy,ViewChild,ElementRef, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import {FormBuilder, FormControl, FormGroup, Validators, FormArray, SelectMultipleControlValueAccessor} from '@angular/forms';
import { Observable,from, Subject } from 'rxjs';
import {debounceTime, distinctUntilChanged, map, takeUntil} from 'rxjs/operators';
import { HttpClient ,HttpHeaders, HttpResponse } from '@angular/common/http';
import { HrService } from '../../services/hr.service';
import { DatePipe } from '@angular/common';
import { DataTableDirective } from 'angular-datatables';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
declare var $;

class DataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}
@Component({
  selector: 'app-salary-process',
  templateUrl: './salary-process.component.html',
  styleUrls: ['./salary-process.component.css']
})
export class SalaryProcessComponent implements OnInit, OnDestroy {

	private destroy$ = new Subject<void>();
	[x: string]: any;
	dtOptions: DataTables.Settings = {};
	dtTrigger: Subject<any> = new Subject<any>();
	@ViewChild(DataTableDirective) dtElement: DataTableDirective;
	BasicSalary: any;
	DatatableParameter = { };
  constructor(private cd: ChangeDetectorRef,private http:HttpClient, private _fb: FormBuilder, private router: Router,private hrservice:HrService,private datePipe: DatePipe) {
	if(sessionStorage.getItem('token')==undefined && sessionStorage.getItem('UserName')==undefined){
		this.router.navigate(['/']);
	  }
   }

  ngOnInit(): void {
	this.datatableCode();
  }
  datatableCode() {
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
				that.http.post<DataTablesResponse>(environment.APIEndpoint+'salary.Salary_process&reload=1',Object.assign(dataTablesParameters,this.DatatableParameter), {responseType: 'json', headers}).pipe(takeUntil(this.destroy$)).subscribe(resp =>{
					that.dataa=resp.data;
					if(resp.data.length != 0){
						this.WorkingDay = resp.data[0].WorkingDay;
					}
					callback({recordsTotal: resp.recordsTotal,recordsFiltered: resp.recordsTotal,data: []});
					setTimeout(()=>{                          
						this.amountCalculculation();
						this.getCompanyVariableValue();
				   	}, 500);
				});
				
			}
		};
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
	SubmitSalaryProcess(){
		const form = document.querySelector('form');
		let salaryData = new FormData(form);
		salaryData.append('salarypf',this.salarypf);
		salaryData.append('salaryESIC',this.salaryESIC);
		this.hrservice.addsalaryhitory(salaryData).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
			if(Response.STATUS == 200) {
				Swal.fire({
				    icon:'success',
				    title:'Success!',
				    text:'successfully',
				    showConfirmButton:false,
				    timer:2000
				});
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
	}
	getCompanyVariableValue(){
        this.hrservice.getCompanySetup('PF').pipe(takeUntil(this.destroy$)).subscribe(Response =>{
			this.pf = Response.data;
			if(this.pf.length == 1){
				$('.PFcolumn').show();
			}else{
				$('.PFcolumn').hide();
			}
			
		});
        this.hrservice.getCompanySetup('ESIC').pipe(takeUntil(this.destroy$)).subscribe(Response =>{
			this.ESIC = Response.data;
			this.salaryESIC = this.ESIC.length;
			if(this.ESIC.length == 1){
				$('.ESIcolumn').show();
			}else{
				$('.ESIcolumn').hide();
			}
        });
        this.hrservice.getCompanySetup('bonus').pipe(takeUntil(this.destroy$)).subscribe(Response =>{
            this.bonus = Response.data
        });
    }
	amountCalculculation(){
		let i 
		for(i=0;i<$(".BasicSalary").length;i++){
			this.GrossSalary = (<HTMLInputElement>document.getElementById("GrossSalary_"+i)).value;
			this.Bonus = (<HTMLInputElement>document.getElementById("Bonus_"+i)).value;
			this.Loan = (<HTMLInputElement>document.getElementById("Loan_"+i)).value;
			this.AdvancePay1 = (<HTMLInputElement>document.getElementById("AdvancePay1_"+i)).value;
			if(this.Bonus != ' '){
				this.totalpayamont = parseInt(this.GrossSalary) + parseInt(this.Bonus);
			}else{
				this.totalpayamont = parseInt(this.GrossSalary);
			}
			if(this.Loan != ' '){
				this.netpayamount = parseInt(this.totalpayamont) - parseInt(this.Loan);
			}else{
				this.netpayamount = parseInt(this.totalpayamont);
			}
			if((<HTMLInputElement>document.getElementById("PF_"+i)).value != ''){
				this.PF = (<HTMLInputElement>document.getElementById("PF_"+i)).value;
			}else{
				this.PF = 0
			}
			if((<HTMLInputElement>document.getElementById("ESI_"+i)).value != ''){
				this.ESI = (<HTMLInputElement>document.getElementById("ESI_"+i)).value;
			}else{
				this.ESI =  0;
			}
			this.deducation = parseInt(this.PF) + parseInt(this.ESI);
			this.paybaleamount = parseInt(this.netpayamount) - parseInt(this.deducation);
			if((<HTMLInputElement>document.getElementById("slarydeduction_"+i)).value != ' '){
				this.salarydeduction = (<HTMLInputElement>document.getElementById("slarydeduction_"+i)).value;
			}else{
				this.salarydeduction = 0;
			}
			this.netSalary = parseInt(this.paybaleamount) - parseInt(this.salarydeduction);
			$('#NetSalary_'+i).val(this.netSalary);
			if((<HTMLInputElement>document.getElementById("AdvancePay1_"+i)).value != ' '){
				this.AdvancePay1 = (<HTMLInputElement>document.getElementById("AdvancePay1_"+i)).value;
			}else{
				this.AdvancePay1 = 0;
			}
			this.paybaleamount = parseInt(this.netSalary) + parseInt(this.AdvancePay1);
			$('#AmountPay_'+i).val(this.paybaleamount);
		}
	}
	
}
