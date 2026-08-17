import { Component, OnInit, ViewChild, ChangeDetectorRef, TemplateRef, Injectable, OnDestroy } from '@angular/core';
import { NgbCalendar, NgbDateAdapter, NgbDate, NgbDateParserFormatter, NgbDateStruct, NgbInputDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { CrmService } from '../../services/crm.service';
import { StringLiteralLike } from 'typescript';
import { ActivatedRoute, Router, Routes } from '@angular/router';
import { from, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
import { BillingService } from 'src/app/services/billing.service';
import { HrService } from 'src/app/services/hr.service';
import * as XLSX from 'xlsx';


class EnquiryManagement {
	CompanyId: string;
	EnquiryId: string;
	EnqDate: string;
	EnqType: string;
	VisitorName: string;
	EnqDetails: string;
	RefferedBy: string;
	MobileNumber: string;
	CityId: string;
	Status: string;
	CreatedBy: string;
	CreatedDt: string;
}

class DataTablesResponse {
	data: any[];
	draw: number;
	recordsFiltered: number;
	recordsTotal: number;
}

/**
 * Handles how date is stored in form model (string format)
 */
@Injectable()
export class CustomAdapter extends NgbDateAdapter<string> {

	readonly DELIMITER = '/';

	fromModel(value: string | null): NgbDateStruct | null {
		if (!value) return null;

		const date = value.split(this.DELIMITER);
		if (date.length !== 3) return null;

		return {
			day: parseInt(date[0], 10),
			month: parseInt(date[1], 10),
			year: parseInt(date[2], 10)
		};
	}

	toModel(date: NgbDateStruct | null): string | null {
		if (!date) return null;

		const day = date.day.toString().padStart(2, '0');
		const month = date.month.toString().padStart(2, '0');

		return `${day}${this.DELIMITER}${month}${this.DELIMITER}${date.year}`;
	}
}


/**
 * Handles how date is displayed in input field (UI format)
 */
@Injectable()
export class CustomDateParserFormatter extends NgbDateParserFormatter {

	readonly DELIMITER = '/';

	parse(value: string): NgbDateStruct | null {
		if (!value) return null;

		const date = value.split(this.DELIMITER);
		if (date.length !== 3) return null;

		return {
			day: parseInt(date[0], 10),
			month: parseInt(date[1], 10),
			year: parseInt(date[2], 10)
		};
	}

	format(date: NgbDateStruct | null): string {
		if (!date) return '';

		const day = date.day.toString().padStart(2, '0');
		const month = date.month.toString().padStart(2, '0');

		return `${day}${this.DELIMITER}${month}${this.DELIMITER}${date.year}`;
	}
}


@Component({
	selector: 'app-crm-enquiry',
	templateUrl: './crm-enquiry.component.html',
	styleUrls: ['./crm-enquiry.component.css'],
	providers: [
		NgbInputDatepickerConfig,
		{ provide: NgbDateAdapter, useClass: CustomAdapter },
		{ provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter }
	]
})
export class CrmEnquiryComponent implements OnInit, OnDestroy {

	private destroy$ = new Subject<void>();


	isViewMode: boolean = false;
	form: FormGroup;
	stages = [
		{ item_text: 'Contact' },
		{ item_text: 'Deals' },
		{ item_text: 'Booking' },
		{ item_text: 'Registration' },
		{ item_text: 'Parimanikaran' },
		{ item_text: 'Diversion' },
		{ item_text: 'Handover + Diversion in Progress' },
		{ item_text: 'Handover without diversion' },
		{ item_text: 'Complete Handover' }
	];


	[x: string]: any;
	model: NgbDateStruct;
	model_add: NgbDateStruct;
	model_view: NgbDateStruct;
	model_edit: NgbDateStruct;

	isButtonDisabled: boolean = false;

	dtOptions: DataTables.Settings = {};
	dtTrigger: Subject<any> = new Subject<any>();
	@ViewChild(DataTableDirective) dtElement: DataTableDirective;
	@ViewChild('closebutton') closebutton;
	@ViewChild('removebutton') removebutton;
	@ViewChild('Enquirymodal') Enquirymodal;

	data: EnquiryManagement[];
	modal: any;
	model2: string;
	respcusTags = [];
	keyword = 'name';
	minDate = { year: 1900, month: 1, day: 1 };
	maxDate = { year: 2099, month: 12, day: 31 };
	showIntroducedBy = false;
	plotShownByList: any[] = [];
	userLists: any[] = [];
	plotList: { id: string; name: string }[] = [];
	fromDateStruct: any;

	addCrmEnquiry = new FormGroup({
		EnquiryId: new FormControl('',),
		Enquiry_date: new FormControl('', Validators.required),
		enquiry_cust: new FormControl('', Validators.required),
		enquiry_mode: new FormControl('', Validators.required),
		enquiry_no: new FormControl('', Validators.required),
		enquiry_reference: new FormControl('', Validators.required),
		enquiry_state: new FormControl('', Validators.required),
		city_enquiry: new FormControl('', Validators.required),
		enquiry_address: new FormControl('', Validators.required),
		enquiry_details: new FormControl('', Validators.required),
		enquiry_intrested: new FormControl('', Validators.required),
	});

	searchCrmEnquiry = new FormGroup({
		filter_customername: new FormControl(''),
		filter_contactperson: new FormControl(''),
		filter_contactno: new FormControl(''),
		filter_city: new FormControl(''),
		filter_date: new FormControl(''),
		from_date: new FormControl(''),
		to_date: new FormControl(''),
		filtercustomertag: new FormControl(''),
		tag_id: new FormControl(''),
		introduced_by: new FormControl(''),
		stage: new FormControl(''),
		enquiry_mode: new FormControl(''),
		plot_shown_by: new FormControl(''),
		added_by: new FormControl(''),
		visited_plot: new FormControl(''),
		notes_search: new FormControl(''),
	});

	DatatableParameter = {
		filter_customername: '',
		filter_contactperson: '',
		filter_contactno: '',
		filter_city: '',
		filter_date: '',
		from_date: '',
		to_date: '',
		CompanyId: '',
		tag_id: '',
		enquiry_mode: '',
		introduced_by: '',
		stage: '',
		plot_shown_by: '',
		added_by: '',
		visited_plot: '',
		notes_search: ''
	};

	constructor(private ngbCalendar: NgbCalendar, private fb: FormBuilder, private dateAdapter: NgbDateAdapter<string>, private routee: ActivatedRoute, private router: Router, public http: HttpClient, private CrmService: CrmService, private billingservice: BillingService, private chRef: ChangeDetectorRef, private formBuilder: FormBuilder, private hrservice: HrService) {
		if (sessionStorage.getItem('token') == undefined && sessionStorage.getItem('UserName') == undefined) {
			this.router.navigate(['/']);
		}
	}

	route(link: any) {
		this.router.navigate(['/' + link, 'add']);
	}



	ngOnInit(): void {
		this.StagesStatuslist();
		this.datatableCode();
		this.CrmUserRole = false;
		if (sessionStorage.getItem('UserRole') == 'CRM User') {
			this.CrmUserRole = true;
		}
		this.CRMAdmin = false;
		if (sessionStorage.getItem('UserRole') == 'CRM Admin') {
			this.CRMAdmin = true;
		}
		this.customerTags();

		this.enquiryModeList();
		this.getMarketingTeamsLists();
		this.loadPlotShownBy();
		this.loadUsersLists();
		this.loadPlotList();
	}


	customerTags() {
		let lookupTags = "";
		let Tagsdata = new FormData();
		Tagsdata.append('lookupname', lookupTags);
		this.hrservice.fetchTagsLists(Tagsdata).pipe(takeUntil(this.destroy$)).subscribe(Response => {

			this.respcusTags = Response.data;

			// let i =0;
			// for(i=0;i<this.respcusTags.length;i++){
			//   this.custtags1.push({
			//     'id': this.respcusTags[i]['id'],
			//     'name': this.respcusTags[i]['name']
			//   })
			// }
			// this.custtags = [this.custtags1];
			// this.custtags = this.custtags[0];

			// Restore filtercustomertag from session storage after tags data is loaded
			const storedFormValues = JSON.parse(sessionStorage.getItem('crmProfileValues') || '{}');
			const tagCsv = storedFormValues.tag_id || '';
			if (tagCsv && this.respcusTags && this.respcusTags.length > 0) {
				const tagIds = tagCsv.split(',').map((id: string) => id.trim()).filter((id: string) => id !== '');
				this.searchCrmEnquiry.get('filtercustomertag').setValue(tagIds);
			}
		});
	}

	loadPlotShownBy() {
		const formData = new FormData();
		this.hrservice.getEmployeeDetail(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
			const employees = resp.data || [];
			this.plotShownByList = employees.map(emp => ({
				id: emp.EmployeeId,
				name: emp.EmployeeName
			}));
		});
	}

	loadUsersLists() {
		const formData = new FormData();
		this.hrservice.loadUsersData(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
			this.userLists = resp;
		});
	}

	loadPlotList() {
		const payload = new FormData();
		this.CrmService.getAllVisitedPlots(payload).pipe(takeUntil(this.destroy$)).subscribe(resp => {
			this.plotList = (resp.data || []).map((p: any) => ({
				id: p.ProductId,
				name: p.ProductName,
			}));
			const storedFormValues = JSON.parse(sessionStorage.getItem('crmProfileValues') || '{}');
			if (storedFormValues.visited_plot) {
				this.searchCrmEnquiry.get('visited_plot').setValue(storedFormValues.visited_plot);
			}
		});
	}


	SelectedTagsValue(event: any) {
		// event = array of selected objects, not IDs
		const idArray = event.map(e => e.lookupdataid);  // extract only IDs

		const csv = idArray.join(',');
		this.searchCrmEnquiry.get('tag_id').setValue(csv);

		// if you need:
		this.CustTagID = idArray;
		this.tag_id = csv;
	}


	StagesStatuslist() {
		let StagesStatus = "";
		let StagesStatusdata = new FormData();
		StagesStatusdata.append('StagesStatus', StagesStatus);
		this.billingservice.fetch_TopThreeStagesData(StagesStatusdata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
			this.respStages = Response.data;

			// Restore stage from session storage after stages data is loaded
			const storedFormValues = JSON.parse(sessionStorage.getItem('crmProfileValues') || '{}');
			if (storedFormValues.stage) {
				this.searchCrmEnquiry.get('stage').setValue(storedFormValues.stage);
			}
		});
	}

	onChangeStatus(e) {
		let StageId = e.target.value;
		let StagesStatusdata = new FormData();
		StagesStatusdata.append('StageId', StageId);
		this.billingservice.fetch_StagesStatusData(StagesStatusdata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
			this.respStagesStatus = Response.data;
		});
	}

	public closeModal() {
		this.closebutton.nativeElement.click();
	}

	public removeModal() {
		this.removebutton.nativeElement.click();
	}

	public Enquirymodalshow() {
		this.Enquirymodal.nativeElement.click();
	}

	private myValue;
	private modalaction;




	ngOnDestroy(): void {
		this.dtTrigger.unsubscribe();
		this.destroy$.next();
		this.destroy$.complete();
	}

	ngAfterViewInit(): void {
		this.dtTrigger.next();
	}

	openEnquirymodal() {
		this.addCrmEnquiry.reset();
		if (this.modalaction == 'add') {
			$('#modaltextheader').text('Add New Customer Profile');
			this.addCrmEnquiry.enable();
			this.isButtonDisabled = false;
		} else if (this.modalaction == 'edit') {
			$('#modaltextheader').text('Edit Customer Profile Details');
			this.addCrmEnquiry.enable();
			this.isButtonDisabled = false;
		} else if (this.modalaction == 'view') {
			$('#modaltextheader').text('View Customer Profile Details');
			this.addCrmEnquiry.disable();
			this.isButtonDisabled = true;
		}
	}

	enquirymodalbackdropbtn() {
		this.modalaction = 'add'
	}


	viewenquiry(EnquiryId, CustomerId) {
		this.router.navigate(['/crm-enquiry-details', EnquiryId, 'view']);
	}

	editenquiry(EnquiryId: string, CustomerId: string) {



		this.router.navigate(['/crm-enquiry-details', EnquiryId, 'edit']);
	}

	delete(EnquiryId) {

		let removeEnquiryData = new FormData();
		removeEnquiryData.append('EnquiryId', EnquiryId);
		Swal.fire({
			title: 'Are you sure?',
			text: 'You want to delete this.',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Yes',
			cancelButtonText: 'No'
		}).then((result) => {
			if (result.value) {
				this.CrmService.deleteCrmEnquiryMngmt(removeEnquiryData).pipe(takeUntil(this.destroy$)).subscribe(Response => {
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
							text: 'item Delete Failed',
							showConfirmButton: false,
							timer: 3000
						});
					}
				});
			}
		})
	}

	datatableCode() {

		const storedFormValues = JSON.parse(sessionStorage.getItem('crmProfileValues') || '{}');

		this.searchCrmEnquiry.get('filter_customername').setValue(storedFormValues.filter_customername);
		this.searchCrmEnquiry.get('filter_contactperson').setValue(storedFormValues.filter_contactperson);
		this.searchCrmEnquiry.get('filter_contactno').setValue(storedFormValues.filter_contactno);
		this.searchCrmEnquiry.get('filter_city').setValue(storedFormValues.filter_city);
		this.searchCrmEnquiry.get('filter_date').setValue(storedFormValues.filter_date);
		this.searchCrmEnquiry.get('from_date').setValue(storedFormValues.from_date);
		this.searchCrmEnquiry.get('to_date').setValue(storedFormValues.to_date);
		this.searchCrmEnquiry.get('plot_shown_by').setValue(storedFormValues.plot_shown_by);
		this.searchCrmEnquiry.get('added_by').setValue(storedFormValues.added_by);
		this.searchCrmEnquiry.get('visited_plot').setValue(storedFormValues.visited_plot || '');
		this.searchCrmEnquiry.get('notes_search').setValue(storedFormValues.notes_search || '');
		// this.searchCrmEnquiry.get('enquiry_mode').setValue(storedFormValues.enquiry_mode);
		// this.searchCrmEnquiry.get('introduced_by').setValue(storedFormValues.introduced_by);
		// this.searchCrmEnquiry.get('stage').setValue(storedFormValues.stage);

		const tagCsv = storedFormValues.tag_id || '';
		this.searchCrmEnquiry.get('tag_id').setValue(tagCsv);
		this.DatatableParameter.tag_id = tagCsv;



		if (storedFormValues && Object.keys(storedFormValues).length > 0) {
			this.DatatableParameter.filter_customername = storedFormValues.filter_customername;
			this.DatatableParameter.filter_contactperson = storedFormValues.filter_contactperson;
			this.DatatableParameter.filter_contactno = storedFormValues.filter_contactno;
			this.DatatableParameter.filter_city = storedFormValues.filter_city;
			this.DatatableParameter.filter_date = storedFormValues.filter_date;
			this.DatatableParameter.from_date = this.formatDateForAPI(storedFormValues.from_date);
			this.DatatableParameter.to_date = this.formatDateForAPI(storedFormValues.to_date);
			this.DatatableParameter.enquiry_mode = storedFormValues.enquiry_mode;
			this.DatatableParameter.introduced_by = storedFormValues.introduced_by;
			this.DatatableParameter.stage = storedFormValues.stage;
			this.DatatableParameter.plot_shown_by = storedFormValues.plot_shown_by;
			this.DatatableParameter.added_by = storedFormValues.added_by;
			this.DatatableParameter.visited_plot = storedFormValues.visited_plot || '';
			this.DatatableParameter.notes_search = storedFormValues.notes_search || '';
			this.DatatableParameter.CompanyId = sessionStorage.getItem('CompanyId');
		} else {
			this.searchCrmEnquiry.reset();
			this.searchCrmEnquiry.get('filter_customername').setValue('');
			this.searchCrmEnquiry.get('filter_contactperson').setValue('');
			this.searchCrmEnquiry.get('filter_contactno').setValue('');
			this.searchCrmEnquiry.get('filter_city').setValue('');
			this.searchCrmEnquiry.get('filter_date').setValue('');
			this.searchCrmEnquiry.get('from_date').setValue('');
			this.searchCrmEnquiry.get('to_date').setValue('');
			this.searchCrmEnquiry.get('plot_shown_by').setValue('');
			this.searchCrmEnquiry.get('added_by').setValue('');
			this.searchCrmEnquiry.get('visited_plot').setValue('');
			this.searchCrmEnquiry.get('notes_search').setValue('');
			sessionStorage.setItem('crmProfileValues', JSON.stringify(this.searchCrmEnquiry.value));


			this.DatatableParameter.filter_customername = this.searchCrmEnquiry.get('filter_customername').value;
			this.DatatableParameter.filter_contactperson = this.searchCrmEnquiry.get('filter_contactperson').value;
			this.DatatableParameter.filter_contactno = this.searchCrmEnquiry.get('filter_contactno').value;
			this.DatatableParameter.filter_city = this.searchCrmEnquiry.get('filter_city').value;
			this.DatatableParameter.filter_date = this.searchCrmEnquiry.get('filter_date').value;
			this.DatatableParameter.from_date = this.formatDateForAPI(this.searchCrmEnquiry.get('from_date').value);
			this.DatatableParameter.to_date = this.formatDateForAPI(this.searchCrmEnquiry.get('to_date').value);
			this.DatatableParameter.enquiry_mode = this.searchCrmEnquiry.get('enquiry_mode').value;
			this.DatatableParameter.introduced_by = this.searchCrmEnquiry.get('introduced_by').value;
			this.DatatableParameter.stage = this.searchCrmEnquiry.get('stage').value;
			this.DatatableParameter.plot_shown_by = this.searchCrmEnquiry.get('plot_shown_by').value;
			this.DatatableParameter.added_by = this.searchCrmEnquiry.get('added_by').value;
			this.DatatableParameter.visited_plot = this.searchCrmEnquiry.get('visited_plot')?.value || '';
			this.DatatableParameter.notes_search = this.searchCrmEnquiry.get('notes_search')?.value || '';
			this.DatatableParameter.CompanyId = sessionStorage.getItem('CompanyId');
		}

		const that = this;
		const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });
		this.dtOptions = {
			processing: true,
			serverSide: true,
			dom: 'lrtip',
			pageLength: 50,
			lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
			columnDefs: [
				{ orderable: false, targets: -1 }
			],
			order: [[3, "desc"]],
			ajax: (dataTablesParameters: any, callback) => {
				// Object.assign(dataTablesParameters, this.DatatableParameter);
				that.http.post<DataTablesResponse>(environment.APIEndpoint + 'CrmEnquiryDetails.fetch_CrmEnquiryMngmt&reload=1', Object.assign(dataTablesParameters, this.DatatableParameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {
					console.log(resp.data);
					that.data = resp.data;

					callback({
						recordsTotal: resp.recordsTotal,
						recordsFiltered: resp.recordsTotal,
						data: []
					});
				});
			}
		};
	}

	EnquirySearch() {
		this.DatatableParameter.notes_search = this.searchCrmEnquiry.get('notes_search')?.value || '';
		this.DatatableParameter.visited_plot = this.searchCrmEnquiry.get('visited_plot')?.value || '';
		sessionStorage.setItem('crmProfileValues', JSON.stringify(this.searchCrmEnquiry.value));

		if (this.router.url == '/crm-enquiry') {
			const storedFormValues = JSON.parse(sessionStorage.getItem('crmProfileValues'));
			if (storedFormValues) {
				this.datatableCode();
				this.rerender();
			}
		}

	}
	resetSearch() {
		this.searchCrmEnquiry.reset();
		this.searchCrmEnquiry.get('filter_customername').setValue('');
		this.searchCrmEnquiry.get('filter_contactperson').setValue('');
		this.searchCrmEnquiry.get('filter_contactno').setValue('');
		this.searchCrmEnquiry.get('filter_city').setValue('');
		this.searchCrmEnquiry.get('filter_date').setValue('');
		this.searchCrmEnquiry.get('from_date').setValue('');
		this.searchCrmEnquiry.get('to_date').setValue('');
		this.searchCrmEnquiry.get('filtercustomertag').setValue('');
		this.searchCrmEnquiry.get('enquiry_mode').setValue('');
		this.searchCrmEnquiry.get('stage').setValue('');
		this.searchCrmEnquiry.get('plot_shown_by').setValue('');
		this.searchCrmEnquiry.get('added_by').setValue('');
		this.searchCrmEnquiry.get('visited_plot').setValue('');
		this.searchCrmEnquiry.get('notes_search').setValue('');
		sessionStorage.setItem('crmProfileValues', JSON.stringify(this.searchCrmEnquiry.value));

		this.showIntroducedBy = false;
		this.searchCrmEnquiry.get('introduced_by')?.reset();
		this.datatableCode();
		this.rerender();

	}


	canExport(): boolean {
		const from = this.searchCrmEnquiry.get('from_date')?.value;
		const to = this.searchCrmEnquiry.get('to_date')?.value;
		return !!from && !!to && this.isDateRangeValid();
	}

	private isDateRangeValid(): boolean {
		const from = this.searchCrmEnquiry.get('from_date')?.value;
		const to = this.searchCrmEnquiry.get('to_date')?.value;
		if (!from || !to) { return false; }

		// Parse DD/MM/YYYY format
		const fromDate = this.parseDate(from);
		const toDate = this.parseDate(to);

		if (!fromDate || !toDate) { return false; }
		return toDate >= fromDate;
	}

	// Helper: Parse DD/MM/YYYY string to Date object
	private parseDate(dateStr: string): Date | null {
		if (!dateStr) return null;
		const parts = dateStr.split('/');
		if (parts.length !== 3) return null;
		return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
	}

	// Helper: Convert DD/MM/YYYY to YYYY-MM-DD format for backend API
	private formatDateForAPI(dateStr: string): string {
		if (!dateStr) return '';
		const parts = dateStr.split('/');
		if (parts.length !== 3) return '';
		const day = parts[0];
		const month = parts[1];
		const year = parts[2];
		return `${year}-${month}-${day}`;
	}


	onFromDateChange(date: any) {
		this.fromDateStruct = date;

		// Update form control with the selected date
		const formattedDate = `${String(date.day).padStart(2, '0')}/${String(date.month).padStart(2, '0')}/${date.year}`;
		this.searchCrmEnquiry.get('from_date')?.setValue(formattedDate);

		const toDateStr = this.searchCrmEnquiry.get('to_date')?.value;
		if (toDateStr) {
			const fromDate = this.parseDate(formattedDate);
			const toDate = this.parseDate(toDateStr);

			if (fromDate && toDate && fromDate > toDate) {
				this.searchCrmEnquiry.get('to_date')?.setValue(null);
			}
		}
	}

	onToDateChange(date: any) {
		// Update form control with the selected date
		const formattedDate = `${String(date.day).padStart(2, '0')}/${String(date.month).padStart(2, '0')}/${date.year}`;
		this.searchCrmEnquiry.get('to_date')?.setValue(formattedDate);

		const fromDateStr = this.searchCrmEnquiry.get('from_date')?.value;
		if (fromDateStr) {
			const fromDate = this.parseDate(fromDateStr);
			const toDate = this.parseDate(formattedDate);

			if (fromDate && toDate && toDate < fromDate) {
				this.searchCrmEnquiry.get('to_date')?.setValue(null);
			}
		}
	}
	exportToExcel() {
		if (!this.canExport()) {
			if (!this.isDateRangeValid()) {
				Swal.fire('Alert', 'To Date cannot be before From Date', 'warning');
			}
			return;
		}
		const filters = {
			filter_customername: this.searchCrmEnquiry.get('filter_customername')?.value,
			filter_contactperson: this.searchCrmEnquiry.get('filter_contactperson')?.value,
			filter_contactno: this.searchCrmEnquiry.get('filter_contactno')?.value,
			filter_city: this.searchCrmEnquiry.get('filter_city')?.value,
			filter_date: this.searchCrmEnquiry.get('filter_date')?.value,
			from_date: this.formatDateForAPI(this.searchCrmEnquiry.get('from_date')?.value),
			to_date: this.formatDateForAPI(this.searchCrmEnquiry.get('to_date')?.value),
			tag_id: this.searchCrmEnquiry.get('tag_id')?.value,
			enquiry_mode: this.searchCrmEnquiry.get('enquiry_mode')?.value,
			introduced_by: this.searchCrmEnquiry.get('introduced_by')?.value,
			stage: this.searchCrmEnquiry.get('stage')?.value,
			plot_shown_by: this.searchCrmEnquiry.get('plot_shown_by')?.value,
			added_by: this.searchCrmEnquiry.get('added_by')?.value
		};
		const from = filters.from_date || '';
		const to = filters.to_date || '';

		const formData = new FormData();
		Object.entries(filters).forEach(([key, value]) => {
			if (value !== null && value !== undefined && value !== '') {
				formData.append(key, value as string);
			}
		});
		formData.append('CompanyId', sessionStorage.getItem('CompanyId') || '');

		Swal.fire({
			title: 'Please wait',
			text: 'Exporting data...',
			allowOutsideClick: false,
			didOpen: () => Swal.showLoading()
		});

		this.CrmService.export_visitor_details(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
			if (resp?.code === 504) {
				Swal.close();
				Swal.fire('Info', resp.message || 'No data found', 'info');
				return; //  STOP further execution
			}
			try {
				const data = Array.isArray(resp) ? resp : resp?.data || [];
				const rows = data.map((item: any) => {
					const parsedDate = item.latestVisitingDate ? new Date(item.latestVisitingDate) : null;
					const visitingDate = parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate.toLocaleDateString('en-IN') : '';
					const visitingTime = parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate.toLocaleTimeString('en-IN') : '';
					return {
						'Visitor Name': item.VisitorName || '',
						'Plot Details': item.PlotDetails || '',
						'Visited Plots': item.ProductName || '',
						'Plot Shown By': item.plotshownby || '',
						'Visitor Mobile': item.PhoneNumber || '',
						'Visiting Date': visitingDate,
						'Visiting Time': visitingTime
					};
				});

				const worksheet = XLSX.utils.json_to_sheet(rows, { header: ['Visitor Name', 'Plot Details', 'Visited Plots', 'Plot Shown By', 'Visitor Mobile', 'Visiting Date', 'Visiting Time'] });
				worksheet['!cols'] = [
					{ wch: 20 }, // Visitor Name
					{ wch: 50 }, // Plot Details
					{ wch: 60 }, // Visited Plots
					{ wch: 25 }, // Plot Shown By
					{ wch: 18 }, // Visitor Mobile
					{ wch: 18 }, // Visiting Date
					{ wch: 18 }  // Visiting Time
				];
				const workbook = XLSX.utils.book_new();
				XLSX.utils.book_append_sheet(workbook, worksheet, 'Visits');
				const filename = `CRM_Visits_${from}_to_${to}.xlsx`;
				XLSX.writeFile(workbook, filename);
			} finally {
				Swal.close();
			}
		}, err => {
			Swal.close();
			console.error('Export to Excel failed:', err);
			Swal.fire('Error', 'Export failed. Please try again.', 'error');
		});
	}



	// insertenquiryDetail(){
	// 	if(this.addCrmEnquiry.valid){
	// 	let EnquiryData = new FormData();
	// 	EnquiryData.append('status','1');
	// 	EnquiryData.append('EnquiryId',this.addCrmEnquiry.get('EnquiryId').value);
	// 	EnquiryData.append('Enquiry_date',this.addCrmEnquiry.get('Enquiry_date').value);
	// 	EnquiryData.append('enquiry_cust',this.addCrmEnquiry.get('enquiry_cust').value);
	// 	EnquiryData.append('enquiry_mode',this.addCrmEnquiry.get('enquiry_mode').value);
	// 	EnquiryData.append('enquiry_no',this.addCrmEnquiry.get('enquiry_no').value);
	// 	EnquiryData.append('enquiry_reference',this.addCrmEnquiry.get('enquiry_reference').value);
	// 	EnquiryData.append('city_enquiry',this.addCrmEnquiry.get('city_enquiry').value);
	// 	EnquiryData.append('enquiry_address',this.addCrmEnquiry.get('enquiry_address').value);
	// 	EnquiryData.append('enquiry_details',this.addCrmEnquiry.get('enquiry_details').value);
	// 	EnquiryData.append('enquiry_state',this.addCrmEnquiry.get('enquiry_state').value);
	// 	EnquiryData.append('enquiry_intrested',this.addCrmEnquiry.get('enquiry_intrested').value);

	// 	this.CrmService.addCrmEnquiryMngmt(EnquiryData).subscribe(Response =>{
	// 		if(Response.CODE == 200) {
	// 		Swal.fire({
	// 			icon:'success',
	// 			title:'Success!',
	// 			text:Response.MESSAGE,
	// 			showConfirmButton:false,
	// 			timer:2000
	// 		});
	// 		this.addCrmEnquiry.reset();
	// 		this.closeModal();
	// 		this.reload();
	// 		}else{
	// 		Swal.fire({
	// 			icon:'error',
	// 			title:'Error!',
	// 			text:'Task Creation Failed',
	// 			showConfirmButton:false,
	// 			timer:3000
	// 		});
	// 		}
	// 	});
	// 	}else{
	// 	this.validateAllFormFields(this.form);
	// 	Swal.fire('Alert','Fill all required fields first','info');
	// 	}
	// }



	removeEnquiryDetail() {
		let removeEnquiryData = new FormData();
		removeEnquiryData.append('EnquiryId', this.myValue);
		this.CrmService.deleteCrmEnquiryMngmt(removeEnquiryData).pipe(takeUntil(this.destroy$)).subscribe(Response => {
			if (Response.CODE == 200) {
				Swal.fire({
					icon: 'success',
					title: 'Success!',
					text: Response.MESSAGE,
					showConfirmButton: false,
					timer: 2000
				});
				this.removeModal();
				this.reload();
			}
		});
	}

	rerender(): void {
		this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
			// Destroy the table first in the current context
			dtInstance.destroy();
			// Call the dtTrigger to rerender again
			this.dtTrigger.next();
		});
	}
	reload() {
		this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
			dtInstance.ajax.reload();
		});
	}
	isFieldValid(field: string) {
		return !this.form.get(field).valid && this.form.get(field).touched;
	}

	displayFieldCss(field: string) {
		return {
			'has-error': this.isFieldValid(field),
			'has-feedback': this.isFieldValid(field)
		};
	}
	validateAllFormFields(formGroup: FormGroup) {         //{1}
		Object.keys(formGroup.controls).forEach(field => {  //{2}
			const control = formGroup.get(field);             //{3}
			if (control instanceof FormControl) {             //{4}
				control.markAsTouched({ onlySelf: true });
			} else if (control instanceof FormGroup) {        //{5}
				this.validateAllFormFields(control);            //{6}
			}
		});
	}


	enquiryModeList() {
		let formData = new FormData();
		formData.append('lookupTypeId', '79ac32a7-ef7c-11f0-9534-065da37009bd');
		this.CrmService.getEnquiryModeList(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
			this.enquiryModeData = resp.data;

			// Restore enquiry_mode from session storage after mode data is loaded
			const storedFormValues = JSON.parse(sessionStorage.getItem('crmProfileValues') || '{}');
			if (storedFormValues.enquiry_mode) {
				this.searchCrmEnquiry.get('enquiry_mode').setValue(storedFormValues.enquiry_mode);

				// Restore showIntroducedBy flag by checking if the stored mode is "Marketing Team"
				const selectedMode = this.enquiryModeData?.find(m => m.lookupdataid === storedFormValues.enquiry_mode);
				if (selectedMode && selectedMode.lookupvalue === 'Marketing Team') {
					this.showIntroducedBy = true;
				}
			}
		});
	}

	getMarketingTeamsLists() {
		let formData = new FormData();
		formData.append('lookupTypeId', 'b5c6adce-ef88-11f0-9534-065da37009bd');
		this.CrmService.getEnquiryModeList(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
			this.marketingTeamMembersData = resp.data;

			// Restore introduced_by from session storage after marketing team data is loaded
			const storedFormValues = JSON.parse(sessionStorage.getItem('crmProfileValues') || '{}');
			if (storedFormValues.introduced_by) {
				this.searchCrmEnquiry.get('introduced_by').setValue(storedFormValues.introduced_by);
			}
		});
	}

	onEnquiryModeChange(event: any) {
		const selectEl = event.target;
		const selectedIndex = selectEl.selectedIndex;

		// Get displayed text (name)
		const selectedName = selectEl.options[selectedIndex].text.trim();

		// Use ONLY name for logic
		this.showIntroducedBy = selectedName === 'Marketing Team';

		if (!this.showIntroducedBy) {
			this.searchCrmEnquiry.get('introduced_by')?.reset();
		}
	}

}


