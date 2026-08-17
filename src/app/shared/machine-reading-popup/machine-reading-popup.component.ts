import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef, Injectable } from '@angular/core';
import { FormGroup, FormArray, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal, NgbDateAdapter, NgbDateParserFormatter, NgbDateStruct, NgbInputDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { DatePipe } from '@angular/common';
import { HrService } from 'src/app/services/hr.service';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/services/notification.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';



@Injectable()
export class CustomAdapter extends NgbDateAdapter<string> {

	readonly DELIMITER = '/';

	fromModel(value: string | null): NgbDateStruct | null {
		const myDate = new Date();


		const DEFAULT_DATE: NgbDateStruct = { day: myDate.getDate(), month: myDate.getMonth() + 1, year: myDate.getFullYear() }; // Set your default date here

		if (value) {
			let date = value.split(this.DELIMITER);
			return {
				day: parseInt(date[0], 10),
				month: parseInt(date[1], 10),
				year: parseInt(date[2], 10)
			};
		}

		return DEFAULT_DATE;
	}



	//   fromModel(value: string | null): NgbDateStruct | null {
	//     if (value) {
	//       let date = value.split(this.DELIMITER);
	//       return {
	//         day : parseInt(date[0], 10),
	//         month : parseInt(date[1], 10),
	//         year : parseInt(date[2], 10)
	//       };
	//     }
	//     return null;
	//   }



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
	selector: 'app-machine-reading-popup',
	templateUrl: './machine-reading-popup.component.html',
	styleUrls: ['./machine-reading-popup.component.css'],
	providers: [
		NgbInputDatepickerConfig,
		{ provide: NgbDateAdapter, useClass: CustomAdapter },
		{ provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter }
	]
})
export class MachineReadingPopupComponent implements OnInit, OnDestroy {
	//@ViewChild('inputdate') input_date:ElementRef;
	[x: string]: any;
	private destroy$ = new Subject<void>();
	pipe = new DatePipe('en-US');
	@Input() machineTitle: string;
	@Input() submitted: boolean;
	@Input() date: Date;
	@Input() respcontractor: string;
	@Input() vechicalList: string;
	@Input() setvechicalList: string;
	@Input() machineData: any;
	@Input() fieldStatus: boolean;
	@Input() setData: boolean;
	@Input() reading: string;
	@Input() startReading: string;
	@Input() stopReading: string;
	@Input() machineStart: any;
	@Input() machineStop: any;
	@Input() extendedTime: any;
	@Input() vendertype: string;
	@Input() vechiceltype: string;
	@Input() vendorId: string;
	@Input() saveButton1: boolean;
	@Input() respProject: Array<any> = [];
	@Input() projectId: string;

	minDate = { year: 1900, month: 1, day: 1 };
	maxDate = { year: 2099, month: 12, day: 31 };
	// save_btn = fa;
	showGatePassField: boolean = true;



	addMachineReading = new FormGroup({
		date: new FormControl(''),
		startReading: new FormControl('', Validators.required),
		stopReading: new FormControl(''),
		machineStart: new FormControl('', Validators.required),
		machineStop: new FormControl(''),
		extendedTime: new FormControl('', Validators.pattern(/^[.\d]+$/)),
		vendertype: new FormControl('', Validators.required),
		vechiceltype: new FormControl(''),
		projectName: new FormControl(''),
		notes: new FormControl('', Validators.required),
		reading: new FormControl(''),
		vehicle_no: new FormControl(''),
		gate_pass_no: new FormControl(''),
		amount: new FormControl(''),
		total_run: new FormControl(''),
	});
	Startmachine: any;
	Stopmachine: any;
	Stopmachineformat: any;
	constructor(private router: Router, public modal: NgbActiveModal, private hrservice: HrService, private datePipe: DatePipe,private notificationService: NotificationService) { }
	ngAfterViewInit() {
		//this.input_date.nativeElement.value=this.newdate
	}
	ngOnInit(): void {

		const currentUrl = this.router.url;
		const isProjectEdit = currentUrl.includes('project-edit');
		if (currentUrl.includes('hr-machine-reading')) {
			this.showGatePassField = false;
		}


		// this.router.url.includes('project-edit') ? this.addMachineReading.get('projectName')?.disable() : this.addMachineReading.get('projectName')?.enable();


		this.newdate = new Date();
		this.dates = this.newdate.toLocaleDateString('en-GB');
		this.addMachineReading.controls['date'].setValue(this.dates);
		this.saveButton1 = true;

		if (this.setData == true) {
			this.addMachineReading.controls['startReading'].setValue(this.startReading);
			this.addMachineReading.controls['stopReading'].setValue(this.stopReading);
			this.addMachineReading.controls['machineStart'].setValue(this.datePipe.transform(this.machineStart, "HH:mm"));
			this.addMachineReading.controls['machineStop'].setValue(this.datePipe.transform(this.machineStop, "HH:mm"));
			this.addMachineReading.controls['extendedTime'].setValue(this.extendedTime);
			this.addMachineReading.controls['vendertype'].setValue(this.vendertype);
			this.addMachineReading.controls['reading'].setValue(this.reading);
			this.addMachineReading.controls['projectName'].setValue(this.projectId);
			this.Startmachine = this.datePipe.transform(this.machineStart, "HH:mm");
			this.Stopmachine = this.datePipe.transform(this.machineStop, "HH:mm");
			this.addMachineReading.controls['notes'].setValue(this.MachineNotes);
			this.addMachineReading.controls['vehicle_no'].setValue(this.VehicleNo);
			this.addMachineReading.controls['gate_pass_no'].setValue(this.gate_pass_no);
			this.addMachineReading.controls['total_run'].setValue(this.total_run);
			this.addMachineReading.controls['amount'].setValue(this.amount);
			this.newdate = new Date(this.date);
			this.dates = `${this.newdate.getDate()}/${this.newdate.getMonth() + 1}/${this.newdate.getFullYear()}`;
			this.addMachineReading.controls['date'].setValue(this.dates);

			let venderData = new FormData();
			venderData.append('VendorId', this.vendorId);
			this.hrservice.getvechicalList(venderData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
				this.setvechicalList = resp.data;
			});
			setTimeout(() => {
				this.addMachineReading.controls['vechiceltype'].setValue(this.vechiceltype);
			}, 500);
		}

		let contractlist = new FormData();
		contractlist.append('statusValue', '1');
		this.hrservice.contractorList(contractlist).pipe(takeUntil(this.destroy$)).subscribe(Response => {
			this.respcontractor = Response.data
			let formData = new FormData();
			this.hrservice.getAllVehiclesList(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
				this.setvechicalList = resp.data;
			})
		});

		if (this.machineData) {
			if (this.flg == 'viewBooking') {
				this.addBookingDetail.disable();
				this.saveButton1 = false;
				this.hideSubmitbutton = false;
			}
			this.projectId = this.machineData.project_id;
			this.addMachineReading.patchValue({
				reading: this.machineData.readingid,
				date: this.datePipe.transform(this.machineData.readingdt, 'dd/MM/yyyy'),
				startReading: this.machineData.readingstart,
				stopReading: this.machineData.readingend,
				machineStart: this.datePipe.transform(this.machineData.timestart, 'HH:mm'),
				machineStop: this.datePipe.transform(this.machineData.timeend, 'HH:mm'),
				extendedTime: this.machineData.expendedtime,
				vendertype: this.machineData.venderid,
				vechiceltype: this.machineData.vehicleid,
				vehicle_no: this.machineData.vehicleno,
				gate_pass_no: this.machineData.gate_pass_no,
				total_run: this.machineData.total_run,
				amount: this.machineData.amount,
				notes: this.machineData.notes,
			});
		}
		this.setProjectValueAndLock();


		//  VIEW MODE
		if (this.fieldStatus) {
			this.addMachineReading.disable();
			this.saveButton1 = false;
			return;
		}
		//  EDIT MODE (data exists but editable)
		if (this.machineData && !this.fieldStatus) {
			this.addMachineReading.enable();
			return;
		}
		//  ADD MODE (fresh form)
		this.addMachineReading.reset();
		this.addMachineReading.enable();
		if (this.projectId) {
			this.addMachineReading.patchValue({
				projectName: this.projectId
			});
		}

		// isProjectEdit ? this.addMachineReading.get('projectName')?.disable() : this.addMachineReading.get('projectName')?.enable();
	}


	private setProjectValueAndLock() {
		if (!this.projectId) return;
		this.addMachineReading.patchValue({
			projectName: this.projectId
		});

		if (this.fieldStatus || this.router.url.includes('project-edit')) {
			this.addMachineReading.get('projectName')?.disable();
		}
	}



	calculateTotalRun(): void {
		const start = Number(this.addMachineReading.get('startReading')?.value) || 0;
		const stop = Number(this.addMachineReading.get('stopReading')?.value) || 0;
		const total = stop - start;
		this.addMachineReading.patchValue({ total_run: total > 0 ? total : 0 }, { emitEvent: false });
	}




	saveMachineReading() {
		
		// this.isButtonDisabled = false;
		this.submitted = false;
		if (this.addMachineReading.valid) {

			this.submitted = false;
			// this.isButtonDisabled = true
			// this.save_btn = true
			const form = document.forms["addMachineReading"];
			let MachineReadingData = new FormData(form);
			if (this.projectId) {
				MachineReadingData.append('project_id', this.projectId);
			}
			MachineReadingData.append('readingID', this.addMachineReading.get('reading').value);
			MachineReadingData.append('vendertype', this.addMachineReading.get('vendertype').value);
			MachineReadingData.append('vechiceltype', this.addMachineReading.get('vechiceltype').value);
			this.hrservice.addMachineReading(MachineReadingData).pipe(takeUntil(this.destroy$)).subscribe(Response => {
				console.log(Response);
				if (Response.code == 200) {
					Swal.fire({
						icon: 'success',
						title: 'Success!',
						text: Response.MESSAGE,
						showConfirmButton: false,
						timer: 2000
					});
					this.notificationService.triggerFollowupRefresh();
					this.addMachineReading.reset();
					this.modal.close({ success: true, readingId: Response.Message || null }); 
				} else {
					Swal.fire({
						icon: 'error',
						title: 'Error!',
						text: 'Task Creation Failed',
						showConfirmButton: false,
						timer: 3000
					});
				}
			});
		} else {
			this.submitted = true;
			// this.isButtonDisabled = false;

			Swal.fire('Alert', 'Fill all required fields first', 'info');
		}
	}

	private setfinalminute;

	onMachineStart($event) {
		this.Startmachine = this.addMachineReading.get('machineStart').value;
		if (this.Stopmachine == 'null' || this.Stopmachine == null) {
		} else {
			let dates = new Date();
			let Startmachineformat = this.datePipe.transform(dates.setDate(dates.getDate()), "yyyy-MM-dd") + 'T' + this.Startmachine + ':00'
			if (this.Startmachine > this.Stopmachine) {
				this.Stopmachineformat = this.datePipe.transform(dates.setDate(dates.getDate() + 1), "yyyy-MM-dd") + 'T' + this.Stopmachine + ':00'
			} else {
				this.Stopmachineformat = this.datePipe.transform(dates.setDate(dates.getDate()), "yyyy-MM-dd") + 'T' + this.Stopmachine + ':00'
			}
			const diffInMs = Date.parse(this.Stopmachineformat) - Date.parse(Startmachineformat);
			let hour = Math.floor((diffInMs % 86400000) / 3600000);
			let minute = Math.round(((diffInMs % 86400000) % 3600000) / 60000);
			if (minute >= 10 && minute <= 60) {
				this.setfinalminute = minute
			} else {
				this.setfinalminute = '0' + minute
			}
			let spentTime = hour + '.' + this.setfinalminute
			this.addMachineReading.controls['extendedTime'].setValue(spentTime);
		}
	}

	onMachineStop($event) {
		this.Stopmachine = this.addMachineReading.get('machineStop').value;
		let dates = new Date();
		let Startmachineformat = this.datePipe.transform(dates.setDate(dates.getDate()), "yyyy-MM-dd") + 'T' + this.Startmachine + ':00'
		if (this.Startmachine > this.Stopmachine) {
			this.Stopmachineformat = this.datePipe.transform(dates.setDate(dates.getDate() + 1), "yyyy-MM-dd") + 'T' + this.Stopmachine + ':00'
		} else {
			this.Stopmachineformat = this.datePipe.transform(dates.setDate(dates.getDate()), "yyyy-MM-dd") + 'T' + this.Stopmachine + ':00'
		}
		const diffInMs = Date.parse(this.Stopmachineformat) - Date.parse(Startmachineformat);
		let hour = Math.floor((diffInMs % 86400000) / 3600000);
		let minute = Math.round(((diffInMs % 86400000) % 3600000) / 60000);
		if (minute >= 10 && minute <= 60) {
			this.setfinalminute = minute
		} else {
			this.setfinalminute = '0' + minute
		}
		let spentTime = hour + '.' + this.setfinalminute
		this.addMachineReading.controls['extendedTime'].setValue(spentTime);
	}

	VendorfilterSelected(e) {
		let venderData = new FormData();
		venderData.append('VendorId', e.target.value);
		this.hrservice.getvechicalList(venderData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
			console.log(resp);
			this.setvechicalList = resp.data;
		});
	}
	vechicelfilterSelected(e) {

		this.addMachineReading.get('vehicle_no')?.reset();

		let VehicleID = new FormData();
		VehicleID.append('VehicleID', e.target.value);
		this.hrservice.getVehicleName(VehicleID).pipe(takeUntil(this.destroy$)).subscribe(resp => {

			this.vechicalList = resp.data;
			this.vehicleno = this.vechicalList[0]['VehicleNo'];
		});
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

}




