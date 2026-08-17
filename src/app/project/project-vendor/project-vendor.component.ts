
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { debounceTime, distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { DataTableDirective } from 'angular-datatables';
import { VendorService } from '../../services/vendor.service';
import { NodeWithI18n } from '@angular/compiler';
import { HrService } from '../../services/hr.service';
import { environment } from 'src/environments/environment';

const states = ['North Carolina', 'North Dakota', 'Northern Mariana Islands', 'Ohio', 'Oklahoma', 'Oregon', 'Palau', 'Pennsylvania', 'Puerto Rico', 'Rhode Island',
	'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virgin Islands', 'Virginia'];

class Vendorgroup {
	vendorId!: string;
	VendorName!: string;
	RateType!: string;
	Rate!: string;
	PaymentSchedule!: string;
	VendorType!: string;
	VendorAddress!: string;
	VendorContact!: string;
	Status!: string;
	Company!: string;
	CountryId!: string;
	StateId!: string;
	City!: string;
	PostCode!: string;
	VehicleId!: string;
	VehicleName!: string;
	VehicleNo!: string;
	VehicleType!: string;
	DriverName!: string;
}
class DataTablesResponse {
	data!: any[];
	draw!: number;
	recordsFiltered!: number;
	recordsTotal!: number;
}


@Component({
	selector: 'app-project-vendor',
	templateUrl: './project-vendor.component.html',
	styleUrls: ['./project-vendor.component.css']
})
export class ProjectVendorComponent implements OnInit, OnDestroy {
	[x: string]: any;
	dtOptions: DataTables.Settings = {};
	dtTrigger: Subject<any> = new Subject<any>();
	private destroy$ = new Subject<void>();
	@ViewChild(DataTableDirective) dtElement!: DataTableDirective;
	@ViewChild('closebutton') closebutton!: ElementRef;
	@ViewChild('EditVendorclosebutton') EditVendorclosebutton!: ElementRef;
	@ViewChild('VendorPopup') VendorPopup!: ElementRef;
	@ViewChild('addvendorCancelButton') addvendorCancelButton!: ElementRef;
	@ViewChild('vehicalclosebutton') vehicalclosebutton!: ElementRef;
	@ViewChild('vehicalModal') vehicalModal!: ElementRef;
	@ViewChild('MachinPopup') MachinPopup!: ElementRef;
	respCountry = [];
	respRateType = [];
	respVendorType = [];
	respStatus = [];
	respVehicleType = [];

	// private dateToString = (date) => `${date.year}-${date.month}-${date.day}`;
	activeTab = 'Vendor';
	DatatableParameter = { vendorname: '', vendortype: '', vendorContact: '', status: '' };
	vehicle!: Vendorgroup[];
	vendor!: Vendorgroup[];
	modal: any;
	searchvendor = new FormGroup({
		vendorname: new FormControl(''),
		vendortype: new FormControl(''),
		vendorContact: new FormControl('')
	});

	addvendor = new FormGroup({
		vendorId: new FormControl(''),
		vendorname: new FormControl('', Validators.required),
		vendorAddress: new FormControl(''),
		vendortype: new FormControl('', Validators.required),
		rateType: new FormControl('', Validators.required),
		rate: new FormControl('', [Validators.required, Validators.maxLength(7), Validators.pattern(/^[.\d]+$/)]),
		payschedule: new FormControl('', Validators.required),
		vendorContact: new FormControl('', [Validators.maxLength(10), Validators.pattern(/^[0-9]\d*$/), Validators.minLength(10)]),
		status: new FormControl(''),
		postcode: new FormControl('', [Validators.maxLength(6), Validators.pattern(/^[0-9]\d*$/), Validators.minLength(6)]),
		city: new FormControl(''),
		country: new FormControl(''),
		state: new FormControl('')
	});
	searchvehicle = new FormGroup({
		vehicleName: new FormControl(''),
		vendorname: new FormControl('')
	});
	addvehicle = new FormGroup({
		vehicleId: new FormControl(''),
		vehicleNo: new FormControl('', Validators.required),
		driverName: new FormControl('', Validators.required),
		status: new FormControl(''),
		vehicleName: new FormControl('', Validators.required),
		vendorId: new FormControl(''),
		vendorContact: new FormControl('', [Validators.maxLength(10), Validators.pattern(/^[0-9]\d*$/), Validators.minLength(10)]),
		rateType: new FormControl('', Validators.required),
		rate: new FormControl('', [Validators.required, Validators.maxLength(6), Validators.pattern(/^[.\d]+$/)]),
		vehicleType: new FormControl('', Validators.required),
		vendorname: new FormControl('', Validators.required)

	});
	constructor(private router: Router, private http: HttpClient, private VendorService: VendorService, private hrservice: HrService, private chRef: ChangeDetectorRef) {
		if (sessionStorage.getItem('token') == undefined && sessionStorage.getItem('UserName') == undefined) {
			this.router.navigate(['/']);
		}
	}
	submitted: any;
	ngOnInit() {
		this.datatableCode();
		this.lookupdatalist();
		this.contractorlist();
	}

	lookupdatalist() {
		let lookupNationality = "Nationality";
		let Nationalitydata = new FormData();
		Nationalitydata.append('lookupname', lookupNationality);
		this.hrservice.fetch_lookupdata(Nationalitydata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
			this.respCountry = Response.data
		});

		let lookupRateType = "RateType";
		let RateTypedata = new FormData();
		RateTypedata.append('lookupname', lookupRateType);
		this.hrservice.fetch_lookupdata(RateTypedata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
			this.respRateType = Response.data;
		});

		let lookupVendorType = "VendorType";
		let VendorTypedata = new FormData();
		VendorTypedata.append('lookupname', lookupVendorType);
		this.hrservice.fetch_lookupdata(VendorTypedata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
			this.respVendorType = Response.data;
		});

		let lookupStatus = "Status";
		let Statusdata = new FormData();
		Statusdata.append('lookupname', lookupStatus);
		this.hrservice.fetch_lookupdata(Statusdata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
			this.respStatus = Response.data;
		});
		let lookupVehicleType = "VehicleType";
		let VehicleTypedata = new FormData();
		VehicleTypedata.append('lookupname', lookupVehicleType);
		this.hrservice.fetch_lookupdata(VehicleTypedata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
			this.respVehicleType = Response.data
		});
	}
	datatableCode() {
		this.DatatableParameter.vendorname = this.searchvendor.get('vendorname')?.value;
		this.DatatableParameter.vendortype = this.searchvendor.get('vendortype')?.value;
		this.DatatableParameter.vendorContact = this.searchvendor.get('vendorContact')?.value;
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
				that.http.post<DataTablesResponse>(environment.APIEndpoint + 'hr.fetch_vendor&reload=1', Object.assign(dataTablesParameters, this.DatatableParameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {
					that.vendor = resp.data;
					callback({ recordsTotal: resp.recordsTotal, recordsFiltered: resp.recordsTotal, data: [] });
				});
			}
		};
	}


	ngOnDestroy(): void {
		this.dtTrigger.unsubscribe();
		this.destroy$.next();
		this.destroy$.complete();
	}
	public closeModal() {
		this.closebutton.nativeElement.click();
	}
	redirect(link: string) {
		this.router.navigate(['/' + link]);
	}
	result(tabName: any) {
		this.activeTab = tabName;
		this.contractorlist();
	}
	vendorSearch() {
		this.datatableCode();
		this.rerender();
	}
	vehicleSearch() {
		this.datatableCodeVehicle();
		this.rerender();
	}
	ngAfterViewInit(): void {
		this.dtTrigger.next();
	}
	AddvendorPopu() {
		this.addvendor.reset();
		this.PopupTitle = "Add New Vendor";
		this.filedClass = "";
		this.addvendor.enable();
		this.VendorPopup.nativeElement.click();
		this.submitted = false;
		this.saveButton = true;
	}

	getEditVendors(vendorId: any) {
		this.PopupTitle = "Edit Vendor"
		this.filedClass = "active";
		this.saveButton = true;
		this.VendorService.getvendor(vendorId).pipe(takeUntil(this.destroy$)).subscribe(Response => {
			if (Response.data.length) {
				this.addvendor.patchValue({
					vendorname: Response.data[0].vendorName,
					vendorId: Response.data[0].vendorId,
					vendorAddress: Response.data[0].vendorAddress,
					vendortype: Response.data[0].VendorTypeCode,
					rate: Response.data[0].rate,
					rateType: Response.data[0].RateTypeCode,
					payschedule: Response.data[0].payschedule,
					vendorContact: Response.data[0].vendorContact,
					status: Response.data[0].vendorStatus,
					postcode: Response.data[0].postCode,
					city: Response.data[0].city,
					country: Response.data[0].countryId,
					state: Response.data[0].stateId
				});
				this.VendorPopup.nativeElement.click();
				this.addvendor.enable();
			} else {
				Swal.fire({
					icon: 'error',
					title: 'Error!',
					text: 'vendor Creation Failed',
					showConfirmButton: false,
					timer: 3000
				});
			}
		}, (error) => {                              //Error callback
			this.errorMessage = error;
			this.loading = false;

			//throw error;   //You can also throw the error to a global error handler
		});
	}
	getViewVendors(vendorId: any) {
		this.PopupTitle = "View Vendor";
		this.filedClass = "active";
		this.saveButton = false;
		this.VendorService.getvendor(vendorId).pipe(takeUntil(this.destroy$)).subscribe(Response => {
			if (Response.data.length) {
				this.addvendor.patchValue({
					vendorname: Response.data[0].vendorName,
					vendorId: Response.data[0].vendorId,
					vendorAddress: Response.data[0].vendorAddress,
					vendortype: Response.data[0].VendorTypeCode,
					rate: Response.data[0].rate,
					rateType: Response.data[0].RateTypeCode,
					payschedule: Response.data[0].payschedule,
					vendorContact: Response.data[0].vendorContact,
					status: Response.data[0].vendorStatus,
					postcode: Response.data[0].postCode,
					city: Response.data[0].city,
					country: Response.data[0].countryId,
					state: Response.data[0].stateId
				});
				this.VendorPopup.nativeElement.click();
				this.addvendor.disable();
			} else {
				Swal.fire({
					icon: 'error',
					title: 'Error!',
					text: 'vendor Creation Failed',
					showConfirmButton: false,
					timer: 3000
				});
			}
		});
	}
	insertvendor() {
		this.isButtonDisabled = false;
		this.submitted = false;
		if (this.addvendor.valid) {
			this.submitted = false;
			this.isButtonDisabled = true;
			let vendorData = new FormData();
			vendorData.append('VendorName', this.addvendor.get('vendorname')?.value);
			vendorData.append('VendorType', this.addvendor.get('vendortype')?.value);
			vendorData.append('RateType', this.addvendor.get('rateType')?.value);
			vendorData.append('Rate', this.addvendor.get('rate')?.value);
			vendorData.append('VendorAddress', this.addvendor.get('vendorAddress')?.value);
			vendorData.append('City', this.addvendor.get('city')?.value);
			vendorData.append('Postcode', this.addvendor.get('postcode')?.value);
			vendorData.append('VendorContact', this.addvendor.get('vendorContact')?.value);
			vendorData.append('Status', this.addvendor.get('status')?.value);
			vendorData.append('Createddt', Date());
			vendorData.append('PaymentSchedule', this.addvendor.get('payschedule')?.value);
			vendorData.append('CountryId', this.addvendor.get('country')?.value);
			vendorData.append('StateId', this.addvendor.get('state')?.value);
			vendorData.append('vendorId', this.addvendor.get('vendorId')?.value);
			this.VendorService.addvendor(vendorData).pipe(takeUntil(this.destroy$)).subscribe(Response => {
				if (Response.STATUS == 200) {
					Swal.fire({
						icon: 'success',
						title: 'Success!',
						text: Response.MESSAGE,
						showConfirmButton: false,
						timer: 2000
					});
					this.reload();
					this.addvendor.reset();
					this.addvendorCancelButton.nativeElement.click();
				} else {
					Swal.fire({
						icon: 'error',
						title: 'Error!',
						text: 'vendor Creation Failed',
						showConfirmButton: false,
						timer: 3000
					});
				}
			});
		} else {
			this.isButtonDisabled = false;
			Swal.fire('Alert', 'Fill all required fields first', 'info');
			this.submitted = true;
		}
	}
	deletevendor(vendorId: any) {
		Swal.fire({
			title: 'Are you sure?',
			text: 'You want to delete this.',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Yes',
			cancelButtonText: 'No'
		}).then((result) => {
			if (result.value) {
				this.VendorService.deletevendor(vendorId).pipe(takeUntil(this.destroy$)).subscribe(Response => {
					if (Response.CODE == 200) {
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
							text: 'vendor Delete Failed',
							showConfirmButton: false,
							timer: 3000
						});
					}
				});
			}
		})
	}


	contractorlist() {
		let projectlist = new FormData();
		this.hrservice.contractorList(projectlist).pipe(takeUntil(this.destroy$)).subscribe(Response => {
			this.respcontractor = Response.data
		});
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
	vendorData(e: any) {
		this.vendorName = e.target.options[e.target.selectedIndex].text;
	}
	search = (text$: Observable<string>) =>
		text$.pipe(
			debounceTime(200),
			distinctUntilChanged(),
			map(term => term.length < 2 ? []
				: states.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
		)
	//end of search select code
	minDate = { year: 1900, month: 1, day: 1 };
	maxDate = { year: 2099, month: 12, day: 31 };
}
