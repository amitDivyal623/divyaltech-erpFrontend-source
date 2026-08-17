import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Observable, from, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { HrService } from '../../../services/hr.service';
import { DatePipe } from '@angular/common';
import { DataTableDirective } from 'angular-datatables';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
declare var $;
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
				day: parseInt(date[0], 10),
				month: parseInt(date[1], 10),
				year: parseInt(date[2], 10)
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
				day: parseInt(date[0], 10),
				month: parseInt(date[1], 10),
				year: parseInt(date[2], 10)
			};
		}
		return null;
	}

	format(date: NgbDateStruct | null): string {
		return date ? ("0" + date.day).slice(-2) + this.DELIMITER + ("0" + date.month).slice(-2) + this.DELIMITER + date.year : '';
	}
}
@Component({
	selector: 'app-vendor-salary-process',
	templateUrl: './vendor-salary-process.component.html',
	styleUrls: ['./vendor-salary-process.component.css'],
	providers: [
		NgbInputDatepickerConfig,
		{ provide: NgbDateAdapter, useClass: CustomAdapter },
		{ provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
		{ provide: DatePipe }
	]
})
export class VendorSalaryProcessComponent implements OnInit, OnDestroy {
	private destroy$ = new Subject<void>();
	searchSalaryProcee = new FormGroup({
		vendorType: new FormControl(''),
		ResourceType: new FormControl('Labour'),
		RatedType: new FormControl(''),
		dateTo: new FormControl(''),
		dateFrom: new FormControl('')
	
	});
	
	[x: string]: any;
	dtOptions: DataTables.Settings = {};
	dtTrigger: Subject<any> = new Subject<any>();
	@ViewChild(DataTableDirective) dtElement: DataTableDirective;
	@ViewChild('viewbutton') viewbutton;
	@ViewChild('Machinviewbutton') Machinviewbutton;
	@ViewChild('pay') pay;
	@ViewChild('total') total;
	BasicSalary: any;
	DatatableParameter = { RatedType: '', ResourceType: '', vendorType: '', dateFrom: '', dateTo: '' };
	constructor(private cd: ChangeDetectorRef, private http: HttpClient, private _fb: FormBuilder, private router: Router, private hrservice: HrService, private datePipe: DatePipe) { }
	minDate = { year: 1900, month: 1, day: 1 };
	maxDate = { year: 2099, month: 12, day: 31 };










	ngOnInit(): void {
		this.machindiv = false;
		this.labourdiv = true;
		this.datatableCode();
		this.lookupdatalist();

	}
	lookupdatalist() {
		let lookupVendorType = "VendorType";
		let VendorTypedata = new FormData();
		VendorTypedata.append('lookupname', lookupVendorType);
		this.hrservice.fetch_lookupdata(VendorTypedata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
			this.resplookupVendorType = Response.data
		});
		let lookupRateType = "RateType";
		let RateTypedata = new FormData();
		RateTypedata.append('lookupname', lookupRateType);
		this.hrservice.fetch_lookupdata(RateTypedata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
			this.resplookupRateType = Response.data
		});
	}
	datatableCode() {
		this.DatatableParameter.ResourceType = this.searchSalaryProcee.get('ResourceType').value;
		this.DatatableParameter.RatedType = this.searchSalaryProcee.get('RatedType').value;
		this.DatatableParameter.vendorType = this.searchSalaryProcee.get('vendorType').value;
		this.DatatableParameter.dateFrom = (<HTMLInputElement>document.getElementById("dateFrom")).value; 
		this.DatatableParameter.dateTo = (<HTMLInputElement>document.getElementById("dateTo")).value;
		const that = this;
		const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });
		this.dtOptions = {
			processing: true,
			serverSide: true,
			dom: 'lrtip',
			lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
			columnDefs: [
				{ orderable: false, targets: 5 }
			],
			ajax: (dataTablesParameters: any, callback) => {
				Object.assign(dataTablesParameters, this.DatatableParameter);
				this.http.post<DataTablesResponse>(environment.APIEndpoint + 'salary.vendorSalary_Process&reload=1', Object.assign(dataTablesParameters, this.DatatableParameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {
					this.dataa = resp.data;
					

					callback({ recordsTotal: resp.recordsTotal, recordsFiltered: resp.recordsTotal, data: [] });
					setTimeout(()=>{                          
						this.amountCalculculation();

					}, 500);
				});


			}

		};


	}
	vendorSalary() {
		this.dateTo = this.searchSalaryProcee.get('dateTo').value;
		this.dateForm = this.searchSalaryProcee.get('dateFrom').value;
		if (this.searchSalaryProcee.get('ResourceType').value == 'Machine') {
			this.machindiv = true;
			this.labourdiv = false;
		} else {
			this.machindiv = false;
			this.labourdiv = true;
		}
		this.datatableCode();
		this.rerender();
		// if (this.dateTo != '' && this.dateForm != '') {
			
		// } else {
		// 	Swal.fire({
		// 		icon: 'warning',
		// 		title: 'warning!',
		// 		text: 'Please Failed Date To and Date From For Process Salary',
		// 		showConfirmButton: false,
		// 		timer: 4000
		// 	});
		// }
	}
	labourOverview(id) {
		this.dateTo =(<HTMLInputElement>document.getElementById("dateTo")).value
		this.dateForm =(<HTMLInputElement>document.getElementById("dateFrom")).value
		let labourdatadata = new FormData();
		labourdatadata.append('vendor_id', id);
		labourdatadata.append('dateTo', this.dateTo);
		labourdatadata.append('dateFrom', this.dateForm);
		this.hrservice.labousDetailsData(labourdatadata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
			this.reslabours = Response.data
		});
		this.viewbutton.nativeElement.click();
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
		this.dateTo = (<HTMLInputElement>document.getElementById("dateTo")).value
		this.dateForm = (<HTMLInputElement>document.getElementById("dateFrom")).value
		if(this.dateTo != '' && this.dateForm !=''){
			const form = document.querySelector('form');
			let salaryData = new FormData(form);
			salaryData.append('dateTo',this.dateTo);
			salaryData.append('dateForm',this.dateForm);
			salaryData.append('ResourceType',(<HTMLInputElement>document.getElementById("ResourceType")).value);
			this.hrservice.addvendorsalaryhitory(salaryData).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
				if(Response.STATUS == 200) {
					Swal.fire({
						icon:'success',
                        title:'Success!',
						text:'Already Process Salary',
						showConfirmButton:false,
						timer:2000
					});
					this.reload();
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
			Swal.fire({
				icon:'error',
				title:'Error!',
				text:'Please Fill Date To and Date From For Process Salary',
				showConfirmButton:false,
				timer:4000
			});
		}
	}

	amountCalculculation(){
		let i 
		
		if($(".vendorSalary").length != 0){
		
			for(i=0;i<$(".vendorSalary").length;i++){
				this.flag = (<HTMLInputElement>document.getElementById("flag_"+i)).value;

				if((<HTMLInputElement>document.getElementById("VendorRate_"+i)).value !=''){
					this.VendorRate = (<HTMLInputElement>document.getElementById("VendorRate_"+i)).value;
					
				}else{
					this.VendorRate =  0;
				}
				if((<HTMLInputElement>document.getElementById("Totallabour_"+i)).value != ''){
					this.Totallabour = (<HTMLInputElement>document.getElementById("Totallabour_"+i)).value;
					
				}else{
					this.Totallabour = 0;
				}
				this.ratedType = (<HTMLInputElement>document.getElementById("PaymentSchedule_"+i)).value
				
				this.totalDays = (<HTMLInputElement>document.getElementById("TotalDays_"+i)).value
				
				if(this.ratedType == 'Hourly'){
					this.price = parseFloat(this.VendorRate) * 8;
					
				}else if(this.ratedType == 'Daily'){
					this.price = this.VendorRate;
				}else if(this.ratedType == 'Weekly'){
					this.price = parseFloat(this.VendorRate) / 7;
					
				}else{
					this.price = parseFloat(this.VendorRate) / 31;
				}
				if(this.flag == 'employee'){
					this.totalPayable = parseInt(this.totalDays) * parseInt(this.price);
					
				}else{
					this.totalPayable = parseFloat(this.Totallabour) * parseFloat(this.price)* parseFloat(this.totalDays);
					
                   
	
				}
				$('#TotalPayable_'+i).val(parseInt(this.totalPayable));
				
				$('#AmountToPay_'+i).val(parseInt(this.totalPayable));
			}
		}
		if($(".vendorMachinSalary").length != 0){
			for(i=0;i<$(".vendorMachinSalary").length;i++){
				if((<HTMLInputElement>document.getElementById("VendorRate_"+i)).value !=''){
					this.VendorRate = (<HTMLInputElement>document.getElementById("VendorRate_"+i)).value;
				}else{
					this.VendorRate =  0;
				}
				this.MachineRate = parseInt(this.VendorRate)/60;

				if((<HTMLInputElement>document.getElementById("TotalHours_"+i)).value != ''){
					this.TotalHrs = (<HTMLInputElement>document.getElementById("TotalHours_"+i)).value;
				}else{
					this.TotalHrs = 0;
				}
				this.TotalHours = this.TotalHrs.split('.');
				this.Machinprice1 = this.TotalHours[0] * this.VendorRate;
				this.Machinprice2 = this.TotalHours[1] * this.MachineRate;
				this.totalPayable = parseInt(this.Machinprice1) + parseInt(this.Machinprice2);
				$('#TotalPayable_'+i).val(this.totalPayable);
				$('#AmountToPay_'+i).val(this.totalPayable);
				
			}
		}
	}
      
				
			

	  
	totalamountCalculculation() {
		let i
		if ($(".vendorSalary").length != 0) {
			for (i = 0; i < $(".vendorSalary").length; i++) {
				this.TotalPayable = (<HTMLInputElement>document.getElementById("TotalPayable_" + i)).value;
				this.Advance = (<HTMLInputElement>document.getElementById("Advance_" + i)).value;
				this.amountTopay = parseInt(this.TotalPayable) + parseInt(this.Advance);
				$('#AmountToPay_' + i).val(this.amountTopay);
			}
		}
		if ($(".vendorMachinSalary").length != 0) {
			for (i = 0; i < $(".vendorMachinSalary").length; i++) {
				this.TotalPayable = (<HTMLInputElement>document.getElementById("TotalPayable_" + i)).value;
				this.Advance = (<HTMLInputElement>document.getElementById("Advance_" + i)).value;
				this.amountTopay = parseInt(this.TotalPayable) + parseInt(this.Advance);
				$('#AmountToPay_' + i).val(this.amountTopay);
			}
		}
	}
	MachinOverview(id) {
		this.dateTo = (<HTMLInputElement>document.getElementById("dateTo")).value;
		this.dateForm = (<HTMLInputElement>document.getElementById("dateFrom")).value;
		let labourdatadata = new FormData();
		labourdatadata.append('vendor_id', id);
		labourdatadata.append('dateTo', this.dateTo);
		labourdatadata.append('dateForm', this.dateForm);
		this.hrservice.MachinDetailsData(labourdatadata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
			this.resMachin = Response.data
		});
		this.Machinviewbutton.nativeElement.click();
	}

}
