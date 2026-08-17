import { Component, OnInit, OnDestroy,ViewChild,ElementRef, ChangeDetectorRef,Injectable } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators, FormArray} from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient ,HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable,from, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HrService } from '../../../services/hr.service';
import { DatePipe } from '@angular/common';
import { DataTableDirective } from 'angular-datatables';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
import { NgbCalendar, NgbDateAdapter, NgbDate, NgbDateParserFormatter, NgbDateStruct, NgbInputDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';

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
	selector: 'app-vendor-salary',
	templateUrl: './vendor-salary.component.html',
	styleUrls: ['./vendor-salary.component.css'],
	providers: [
		NgbInputDatepickerConfig,
		{provide: NgbDateAdapter, useClass: CustomAdapter},
		{provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter},
		{provide : DatePipe}
	]
})
export class VendorSalaryComponent implements OnInit, OnDestroy {
	searchvendorattendance = new FormGroup({
		dateTo : new FormControl(''),
		dateFrom: new FormControl(''),
		ResourceType: new FormControl('Labour'),
		vendorname: new FormControl('')
		
	});
	searchHistory = new FormGroup({
		dateTo : new FormControl(''),
		dateFrom: new FormControl(''),
		ResourceType: new FormControl('Labour'),
		vendorname: new FormControl('')
	});
	activeTab = 'Profile';
	attendanceTab = true;
	historyTab = false;
	minDate = {year: 1900, month: 1};
	maxDate = {year: 2099, month: 12};
	[x: string]: any;
	dtOptions: DataTables.Settings = {};
	dtOptions1: DataTables.Settings = {};
	dtTrigger: Subject<any> = new Subject<any>();
	private destroy$ = new Subject<void>();
	@ViewChild(DataTableDirective) dtElement: DataTableDirective;
	@ViewChild('viewbutton') viewbutton;
	@ViewChild('Machinviewbutton') Machinviewbutton;
	
	DatatableParameter = { dateTo: '', dateFrom : '',vendorname: '',ResourceType :''};
	constructor(private cd: ChangeDetectorRef, private _fb: FormBuilder, private router: Router,private http:HttpClient,private hrservice:HrService,private datePipe: DatePipe) {
		
	}
	result(tabName:any){
		if(tabName == 'Profile'){
			this.attendanceTab = true;
			this.historyTab = false;
		}else{
			this.attendanceTab = false;
			this.historyTab = true;
		}
		this.activeTab = tabName;
	}
	ngOnInit() {
		this.salary_historydatatable();
		this.vendorList();
		this.vendorSalaryProcess = false;
		if(sessionStorage.getItem('UserRole') == 'HR user'){
			this.vendorSalaryProcess = true;
		}
	}
	route(link:any){
		this.router.navigate(['/'+link]);
	}
  	
	salary_historydatatable() {
		this.DatatableParameter.dateTo = (<HTMLInputElement>document.getElementById("dateTo")).value;
		this.DatatableParameter.dateFrom = (<HTMLInputElement>document.getElementById("dateFrom")).value;
		this.DatatableParameter.ResourceType = this.searchHistory.get('ResourceType').value;
		this.DatatableParameter.vendorname = this.searchHistory.get('vendorname').value;
		const that = this;
		const headers = new HttpHeaders({ 'Content-Type': 'text/plain'});
		this.dtOptions1 = {
			processing: true,
			serverSide: true,
			dom: 'lrtip',
			lengthMenu:[[5, 10, 25, 50], [5, 10, 25, 50]],
			columnDefs: [
				{ orderable: false, targets: 5 }
			],
			ajax: (dataTablesParameters: any, callback) => {
				Object.assign(dataTablesParameters, this.DatatableParameter);
				that.http.post<DataTablesResponse>(environment.APIEndpoint+'salary.fetch_vendorsalary_history&reload=1',Object.assign(dataTablesParameters,this.DatatableParameter), {responseType: 'json', headers}).pipe(takeUntil(this.destroy$)).subscribe(resp =>{
					that.history=resp.data;
					callback({recordsTotal: resp.recordsTotal,recordsFiltered: resp.recordsTotal,data: []});
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
	vendorSalaryDetails(id){
		let sailryDetail = new FormData();
		sailryDetail.append('vendorPaymentId',id);
		this.hrservice.getvendorsalaryDetails(sailryDetail).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
			if(Response.vendorData[0].resourceType == "Machine"){
				this.vendorData = Response.vendorData
				this.Machinviewbutton.nativeElement.click();
			}else{
				this.dateFrom = Response.vendorData[0].dateFrom;
				this.dateTo = Response.vendorData[0].dateTo;
				this.resourceType = Response.vendorData[0].resourceType;
				this.TotalLabour = Response.vendorData[0].TotalLabour;
				this.totalAmount = Response.vendorData[0].totalAmount;
				this.unitPrice = Response.vendorData[0].unitPrice;
				this.vendoename = Response.vendorData[0].vendoename;
				this.Advance = Response.vendorData[0].Advance;
				this.totalPayable = Response.vendorData[0].totalPayable;
				this.viewbutton.nativeElement.click();
			}
        });
    }
	vendorHistory(){
		this.salary_historydatatable();
		this.rerender();
	}
	
	vendorList(){
		let vendorDetail = new FormData();
		this.hrservice.getvendorList(vendorDetail).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
			this.vendorDataList = Response.data
				
        });
	}
}


