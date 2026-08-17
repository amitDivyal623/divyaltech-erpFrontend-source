import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { Observable, from, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { HrService } from 'src/app/services/hr.service';
import { AdminService } from '../../services/admin.service';
import { DataTableDirective } from 'angular-datatables';
import { filter } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
declare var $;
import { environment } from 'src/environments/environment';
import { NgbDateAdapter, NgbDateParserFormatter, NgbDateStruct, NgbInputDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';

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
@Injectable()
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
	selector: 'app-company-calendar',
	templateUrl: './company-calendar.component.html',
	styleUrls: ['./company-calendar.component.css'],
	providers: [
		NgbInputDatepickerConfig,
		{ provide: NgbDateAdapter, useClass: CustomAdapter },
		{ provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter }
	]
})

export class CompanyCalendarComponent implements OnInit, OnDestroy {
	private destroy$ = new Subject<void>();
	minDate = { year: 1900, month: 1, day: 1 };
	maxDate = { year: 2099, month: 12, day: 31 };
	year: any;
	month: any;
	counter: any;
	leaveallsunday: any;
	resplookupEmployeeType: any;
	companylist: any;
	Calendar: any;
	SearchworkCalendar = new FormGroup({
		Search_month: new FormControl(''),
		Search_year: new FormControl('')
	});
	CalendarForm = new FormGroup({});
	dtOptions: DataTables.Settings = {};
	dtTrigger: Subject<any> = new Subject<any>();
	@ViewChild(DataTableDirective) dtElement: DataTableDirective;
	@ViewChild('closebutton') closebutton;
	@ViewChild('removebutton') removebutton;
	@ViewChild('customermodal') customermodal;
	modal: any;
	isButtonDisabled: boolean = false;
	data: workdiarymangment[];
	DatatableParameter = { month: '', year: '' };
	constructor(private adminservice: AdminService, private hrservice: HrService, private dateAdapter: NgbDateAdapter<string>, private cd: ChangeDetectorRef, private _fb: FormBuilder, private router: Router, public http: HttpClient, private datePipe: DatePipe) {
	}
	ngOnInit(): void {
		this.Calendar = "Add Calendar"
		this.SearchworkCalendar.get('Search_month').setValue(("0" + new Date().getMonth()).slice(-2));
		this.SearchworkCalendar.get('Search_year').setValue(new Date().getFullYear());
		this.lookuplist();
		this.datatableCode();
		//this.CompanyList();
	}
	lookuplist() {
		let lookupEmployeeType = "Holiday Type";
		let employeetypedata = new FormData();
		employeetypedata.append('lookupname', lookupEmployeeType);
		this.hrservice.fetch_lookupdata(employeetypedata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
			this.resplookupEmployeeType = Response.data
		});
	}
	CompanyList() {
		this.adminservice.fetch_company().pipe(takeUntil(this.destroy$)).subscribe(Response => {
			this.companylist = Response.data
		});
	}
	submitCalendar() {
		// this.isButtonDisabled = true;
		const form = document.querySelector('form');
		let calendarData = new FormData(form);
		calendarData.append('leaveallsunday', this.leaveallsunday);
		this.adminservice.calendarAdd(calendarData).pipe(takeUntil(this.destroy$)).subscribe(Response => {
			this.isButtonDisabled = true;
			if (Response.CODE == 200) {
				Swal.fire({
					icon: 'success',
					title: 'Success!',
					text: 'successfully',
					showConfirmButton: false,
					timer: 2000
				});
				this.reload();
				this.closebutton.nativeElement.click();
				this.isButtonDisabled = false;
			} else {
				this.isButtonDisabled = false;
				Swal.fire({
					icon: 'error',
					title: 'Error!',
					text: 'Task Creation Failed',
					showConfirmButton: false,
					timer: 3000
				});
			}
		});
	}
	datatableCode() {
		this.DatatableParameter.month = this.SearchworkCalendar.get('Search_month').value;
		this.DatatableParameter.year = this.SearchworkCalendar.get('Search_year').value;
		const that = this;
		const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });
		this.dtOptions = {
			processing: true,
			serverSide: true,
			dom: 'lrtip',
			lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
			columnDefs: [
				{ orderable: false, targets: 0 }
			],
			ajax: (dataTablesParameters: any, callback) => {
				Object.assign(dataTablesParameters, this.DatatableParameter);
				that.http.post<DataTablesResponse>(environment.APIEndpoint + 'admin.fetch_calendar&reload=1', Object.assign(dataTablesParameters, this.DatatableParameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {
					that.data = resp.data;
					callback({ recordsTotal: resp.recordsTotal, recordsFiltered: resp.recordsTotal, data: [] });
				});
			}
		};
	}
	sundayLeave(e) {
		if (e.target.checked) {
			this.month = (<HTMLInputElement>document.getElementById("Leave_Month")).value;
			this.year = (<HTMLInputElement>document.getElementById("Leave_Year")).value;
			if (this.year != '') {
				this.leaveallsunday = 1;
				$('#sundayasleave').prop('checked', true);
			} else {
				$('#sundayasleave').prop('checked', false);
				Swal.fire({
					icon: 'error',
					title: 'Error!',
					text: 'Please Select Month And Year',
					showConfirmButton: false,
					timer: 3000
				});
			}

		}
	}
	modalOpen() {
		$('.CalendarForm').val('');
		$('#sundayasleave').prop('checked', false)
		this.Calendar = "Add Calendar"
		this.customermodal.nativeElement.click();
		this.CalendarForm.reset();
	}
	getEdit(id) {
		let Data = new FormData();
		Data.append('calendar_id', id);
		this.adminservice.Calendareditdata(Data).pipe(takeUntil(this.destroy$)).subscribe(Response => {
			$('#calender_id').val(Response.CalendarId)
			$('#Leave_Type').val(Response.holidayType);
			$('#Leave_Year').val(Response.holidayyear);
			$('#Leave_Month').val(Response.holidaymonth);
			$('#Company_Name').val(Response.company);
			$('#leaveDate').val(this.datePipe.transform(Response.holidaydate, 'dd/MM/yyyy'));
			if (Response.sundayleave == 1) {
				$('#sundayasleave').prop('checked', true)
			}
		});
		this.Calendar = "Edit Calendar"
		this.customermodal.nativeElement.click();
	}
	CalendarDelete(e) {
		Swal.fire({
			title: 'Are you sure?',
			text: 'You want to delete this.',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Yes',
			cancelButtonText: 'No'
		}).then((result) => {
			if (result.value) {
				this.adminservice.deleteCalendar(e).pipe(takeUntil(this.destroy$)).subscribe(Response => {
					if (Response) {
						Swal.fire({
							icon: 'success',
							title: 'Success!',
							text: Response.MESSAGE,
							showConfirmButton: false,
							timer: 2000
						});
						this.reload();
					} else {
						Swal.fire({
							icon: 'error',
							title: 'Error!',
							text: 'Employee Delete Failed',
							showConfirmButton: false,
							timer: 3000
						});
					}
				});
			}
		})
	}
	searchCalendar() {
		this.datatableCode();
		this.rerender();
	}
	ResetCalendar() {
		this.SearchworkCalendar.get('Search_month').setValue('');
		this.SearchworkCalendar.get('Search_year').setValue('');
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
}
