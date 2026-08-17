import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { debounceTime, distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { DataTableDirective } from 'angular-datatables';
import { VendorService } from '../../../services/vendor.service';
import { NodeWithI18n } from '@angular/compiler';
import { HrService } from '../../../services/hr.service';
import { environment } from 'src/environments/environment';

class Vendorgroup {
	vendorId: string;
	VendorName: string;
	RateType: string;
	Rate: string;
	PaymentSchedule: string;
	VendorType: string;
	VendorAddress: string;
	VendorContact: string;
	Status: string;
	Company: string;
	CountryId: string;
	StateId: string;
	City: string;
	PostCode: string;
	VehicleId: string;
	VehicleName: string;
	VehicleNo: string;
	VehicleType: string;
	DriverName: string;
}

class DataTablesResponse1 {
	data: any[];
	draw: number;
	recordsFiltered: number;
	recordsTotal: number;
}

@Component({
	selector: 'app-machinery-details',
	templateUrl: './machinery-details.component.html',
	styleUrls: ['./machinery-details.component.css']
})
export class MachineryDetailsComponent implements OnInit, OnDestroy {
	[x: string]: any;
	dtOptions: DataTables.Settings = {};
	dtTrigger: Subject<any> = new Subject<any>();
	private destroy$ = new Subject<void>();
	@ViewChild(DataTableDirective) dtElement: DataTableDirective;
	@ViewChild('closebutton') closebutton;
	@ViewChild('EditVendorclosebutton') EditVendorclosebutton;
	@ViewChild('VendorPopup') VendorPopup;
	@ViewChild('addvendorCancelButton') addvendorCancelButton;
	@ViewChild('vehicalclosebutton') vehicalclosebutton;
	@ViewChild('vehicalModal') vehicalModal;
	@ViewChild('MachinPopup') MachinPopup;
	respCountry = [];
	respRateType = [];
	respVendorType = [];
	respStatus = [];
	respVehicleType = [];

	private dateToString = (date) => `${date.year}-${date.month}-${date.day}`;
	DatatableParameterVehicle = { vehicleName: '', vendorname: '', status: '' };
	vehicle: Vendorgroup[];
	modal: any;
	searchvehicle = new FormGroup({
		vehicleName: new FormControl(''),
		vendorname: new FormControl('')
	});
	addvehicle = new FormGroup({
		vehicleId: new FormControl(''),
		vehicleNo: new FormControl('', Validators.required),
		driverName: new FormControl(''),
		status: new FormControl(''),
		vehicleName: new FormControl('', Validators.required),
		vendorId: new FormControl(''),
		vendorContact: new FormControl('', [Validators.maxLength(12), Validators.pattern(/^[0-9]\d*$/), Validators.minLength(10)]),
		rateType: new FormControl(''),
		rate: new FormControl(''),
		vehicleType: new FormControl(''),
		vendorname: new FormControl('', Validators.required)

	});

	constructor(private router: Router, private http: HttpClient, private VendorService: VendorService, private hrservice: HrService, private chRef: ChangeDetectorRef) {
		if (sessionStorage.getItem('token') == undefined && sessionStorage.getItem('UserName') == undefined) {
			this.router.navigate(['/']);
		}
	}
	ngOnInit(): void {
		this.lookupdatalist();
		this.datatableCodeVehicle();
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
	datatableCodeVehicle() {
		this.DatatableParameterVehicle.vehicleName = this.searchvehicle.get('vehicleName').value;
		this.DatatableParameterVehicle.vendorname = this.searchvehicle.get('vendorname').value;
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
				Object.assign(dataTablesParameters, this.DatatableParameterVehicle);
				that.http.post<DataTablesResponse1>(environment.APIEndpoint + 'hr.fetch_vehicle&reload=1', Object.assign(dataTablesParameters, this.DatatableParameterVehicle), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {
					that.vehicle = resp.data;
					callback({ recordsTotal: resp.recordsTotal, recordsFiltered: resp.recordsTotal, data: [] });
				});
			}
		};
	}
	addMachine() {
		this.addvehicle.reset();
		this.MachinePopupTitle = "Add New Machine";
		this.MachinefiledClass = "";
		this.addvehicle.enable();
		this.MachinPopup.nativeElement.click();
		this.vehiclesubmitted = false;
		this.vehicleSaveButton = true;
	}
	/*Vehicle Components */
	getEditvehicles(vehicleId) {
		this.MachinePopupTitle = "Edit Machine";
		this.MachinefiledClass = "active";
		this.vehicleSaveButton = true;
		this.VendorService.getvehicle(vehicleId).pipe(takeUntil(this.destroy$)).subscribe(Response => {
			if (Response.data.length) {
				this.addvehicle.patchValue({
					vehicleId: Response.data[0].vehicleId,
					vehicleNo: Response.data[0].vehicleNo,
					driverName: Response.data[0].driverName,
					status: Response.data[0].status,
					vehicleName: Response.data[0].vehicleName,
					vendorContact: Response.data[0].vendorContact,
					rateType: Response.data[0].ratedType,
					rate: Response.data[0].rate,
					vehicleType: Response.data[0].vehicleType,
					vendorname: Response.data[0].vendorId,
				});
				this.MachinPopup.nativeElement.click();
				this.addvehicle.enable();
			} else {
				Swal.fire({
					icon: 'error',
					title: 'Error!',
					text: 'vehicle Creation Failed',
					showConfirmButton: false,
					timer: 3000
				});
			}
		});
	}
	getViewvehicles(vehicleId) {
		this.MachinePopupTitle = "View Machine";
		this.MachinefiledClass = "active";
		this.vehicleSaveButton = false;
		this.VendorService.getvehicle(vehicleId).pipe(takeUntil(this.destroy$)).subscribe(Response => {
			if (Response.data.length) {
				this.addvehicle.patchValue({
					vehicleId: Response.data[0].vehicleId,
					vehicleNo: Response.data[0].vehicleNo,
					driverName: Response.data[0].driverName,
					status: Response.data[0].status,
					vehicleName: Response.data[0].vehicleName,
					vendorContact: Response.data[0].vendorContact,
					rateType: Response.data[0].ratedType,
					rate: Response.data[0].rate,
					vehicleType: Response.data[0].vehicleType,
					vendorname: Response.data[0].vendorId,
				});
				this.MachinPopup.nativeElement.click();
				this.addvehicle.disable();
			} else {
				Swal.fire({
					icon: 'error',
					title: 'Error!',
					text: 'vehicle Creation Failed',
					showConfirmButton: false,
					timer: 3000
				});
			}
		});
	}
	insertvehicle() {
		this.vehiclesubmitted = false;
		// this.isButtonDisabled = false;
		if (this.addvehicle.valid) {
			this.vehiclesubmitted = false;
			// this.isButtonDisabled = true;
			let vehicleData = new FormData();
			vehicleData.append('VehicleNo', this.addvehicle.get('vehicleNo').value);
			vehicleData.append('DriverName', this.addvehicle.get('driverName').value);
			vehicleData.append('Status', '1');
			vehicleData.append('VehicleName', this.addvehicle.get('vehicleName').value);
			vehicleData.append('VendorContact', this.addvehicle.get('vendorContact').value);
			vehicleData.append('RatedType', this.addvehicle.get('rateType').value);
			vehicleData.append('Rate', this.addvehicle.get('rate').value);
			vehicleData.append('VehicleType', this.addvehicle.get('vehicleType').value);
			vehicleData.append('VendorName', this.vendorName);
			vehicleData.append('VendorId', this.addvehicle.get('vendorname').value);
			vehicleData.append('VehicleId', this.addvehicle.get('vehicleId').value);
			this.VendorService.addvehicle(vehicleData).pipe(takeUntil(this.destroy$)).subscribe(Response => {
				if (Response.CODE == 200) {
					Swal.fire({
						icon: 'success',
						title: 'Success!',
						text: Response.MESSAGE,
						showConfirmButton: false,
						timer: 2000
					});
					this.reload();
					this.addvehicle.reset();
					this.closeModal();
				} else if (Response.CODE === 409) {

					Swal.fire({
						icon: 'warning',
						title: 'Duplicate Vehicle',
						text: Response.MESSAGE,
						showConfirmButton: true
					});

				}
				else {
					Swal.fire({
						icon: 'error',
						title: 'Error!',
						text: 'Vehicle Creation Failed',
						showConfirmButton: false,
						timer: 3000
					});
				}
			});
		} else {
			this.vehiclesubmitted = true;
			// this.isButtonDisabled = false;
			Swal.fire('Alert', 'Fill all required fields first', 'info');
		}
	}

	deletevehicle(vehicleId) {
		Swal.fire({
			title: 'Are you sure?',
			text: 'You want to delete this.',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Yes',
			cancelButtonText: 'No'
		}).then((result) => {
			if (result.value) {
				this.VendorService.deletevehicle(vehicleId).pipe(takeUntil(this.destroy$)).subscribe(Response => {
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
							text: 'vehicle Delete Failed',
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
	vendorData(e) {
		this.vendorName = e.target.options[e.target.selectedIndex].text;
	}
	ngOnDestroy(): void {
		this.dtTrigger.unsubscribe();
		this.destroy$.next();
		this.destroy$.complete();
	}
	public closeModal() {
		this.closebutton.nativeElement.click();
	}
	result(tabName: any) {
		this.activeTab = tabName;
		this.contractorlist();
	}
	vehicleSearch() {
		this.datatableCodeVehicle();
		this.rerender();
	}
	vehicleReset() {
		this.searchvehicle.get('vehicleName').setValue('');
		this.searchvehicle.get('vendorname').setValue('');

		this.datatableCodeVehicle();
		this.rerender();	
	}
	ngAfterViewInit(): void {
		this.dtTrigger.next();
	}
}
