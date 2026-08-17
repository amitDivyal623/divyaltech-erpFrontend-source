import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef, Injectable } from '@angular/core';
import { FormGroup, FormArray, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal, NgbDateAdapter, NgbDateParserFormatter, NgbDateStruct, NgbInputDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { HrService } from 'src/app/services/hr.service';
import Swal from 'sweetalert2';
import { DatePipe } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Injectable()
export class CustomAdapter extends NgbDateAdapter<string> {

	readonly DELIMITER = '/';

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
	selector: 'app-employee-model',
	templateUrl: './employee-model.component.html',
	styleUrls: ['./employee-model.component.css'],
	providers: [NgbInputDatepickerConfig,
		{ provide: NgbDateAdapter, useClass: CustomAdapter },
		{ provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter }]
})
export class EmployeeModelComponent implements OnInit, OnDestroy {
	private destroy$ = new Subject<void>();
	[x: string]: any;
	pipe = new DatePipe('en-US');
	workDiaryDetails!: FormGroup;
	// @ViewChild('entrydate') entrydate1:any;
	@Input() heading!: string;
	@Input() submitted!: boolean;
	@Input() model2!: string;
	@Input() entrydatetime: any;
	@Input() PermanentEmployeeType: Array<any> = [];
	@Input() respProject: Array<any> = [];
	@Input() EmployeeTypeAccess!: boolean;
	@Input() tempdiv!: boolean;
	@Input() Permanentdiv!: boolean;
	@Input() labourdiv!: boolean;
	@Input() classname!: boolean;
	@Input() saveButton!: boolean;
	@Input() projectName!: string;
	@Input() EmployeeType!: string;
	@Input() EmployeeName!: string;
	@Input() TempEmployeeName!: string;
	@Input() labourName!: string;
	@Input() totalLabour!: string;
	@Input() notes!: string;
	@Input() ContractorName!: string;
	@Input() EntryID!: string;
	@Input() Employee_Type!: string;
	@Input() CurrentProjectId!: string;
	@Input() respcontractor!: string;
	@Input() setData!: boolean;
	@Input() fieldStatus!: boolean;
	@Input() resptempEmployeeType: Array<any> = [];
	constructor(public modal: NgbActiveModal, private hrservice: HrService, private datePipe: DatePipe) { }
	minDate = { year: 1900, month: 1, day: 1 };
	maxDate = { year: 2099, month: 12, day: 31 };

	ngOnInit(): void {

		this.workDiaryDetails = new FormGroup({
			entryDate: new FormControl('', Validators.required),
			projectName: new FormControl('', Validators.required),
			EmployeeType: new FormControl(''),
			EmployeeName: new FormControl(''),
			labourName: new FormControl(''),
			totalLabour: new FormControl(''),
			notes: new FormControl('', Validators.required),
			ContractorName: new FormControl(' '),
			EntryID: new FormControl(''),
			TempEmployeeName: new FormControl(''),
			Employee_Type: new FormControl(''),
		});
		this.newdate = new Date(this.entrydatetime);
		this.dates = `${this.newdate.getDate()}/${this.newdate.getMonth() + 1}/${this.newdate.getFullYear()}`;
		if (this.setData == true) {
			this.workDiaryDetails.patchValue({
				projectName: this.projectName,
				EmployeeType: this.EmployeeType,
				EmployeeName: this.EmployeeName,
				TempEmployeeName: this.TempEmployeeName,
				labourName: this.labourName,
				totalLabour: this.totalLabour,
				notes: this.notes,
				ContractorName: this.ContractorName,
				EntryID: this.EntryID,
				Employee_Type: this.Employee_Type,
				entryDate: this.dates

			});
		}
		if (this.fieldStatus == true) {
			this.workDiaryDetails.disable();
		} else if (this.setData == true && this.fieldStatus == false) {
			this.workDiaryDetails.enable();
		} else {
			this.workDiaryDetails.reset();
			this.workDiaryDetails.enable();
			if (this.CurrentProjectId != '') {
				this.workDiaryDetails.patchValue({
					projectName: this.CurrentProjectId
				});
			}
		}
	}


	onSubmit() {
		this.isButtonDisabled = false;
		if (this.workDiaryDetails.valid) {
			this.submitted = false;
			this.isButtonDisabled = true;
			const form = document.forms.namedItem('dailyDairy') as HTMLFormElement;
			let workDairy = new FormData(form);
			if (sessionStorage.getItem('UserRole') == 'Employee') {
				workDairy.append('EmployeeName', this.workDiaryDetails.controls.EmployeeName.value);
				workDairy.append('EmployeeType', this.workDiaryDetails.controls.EmployeeType.value);
			}

			this.hrservice.addWorkDiary(workDairy).pipe(takeUntil(this.destroy$)).subscribe(Response => {
				if (Response.CODE == 200) {
					Swal.fire({
						icon: 'success',
						title: 'Success!',
						text: Response.MESSAGE,
						showConfirmButton: false,
						timer: 2000
					});
					this.workDiaryDetails.reset();
					// this.reload();
					this.modal.close(this.workDiaryDetails.value);
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
			this.isButtonDisabled = false;
			Swal.fire({
				icon: 'error',
				title: 'Required fields empty',
				text: 'Please enter the mandatory fields',
				showConfirmButton: false,
				timer: 3000
			});
		}
	}

	emlpoyeedata(e: any) {
		this.Employee_Type = e.target.options[e.target.selectedIndex].text;
		if (this.Employee_Type == 'Temporary Employee') {
			this.workDiaryDetails.controls.Employee_Type.setValue(this.Employee_Type);
			this.tempdiv = true;
			this.labourdiv = false;
			this.Permanentdiv = false;
			this.workDiaryDetails.controls.EmployeeName.enable();
		} else if (this.Employee_Type == 'Permanent Employee') {
			this.workDiaryDetails.controls.Employee_Type.setValue(this.Employee_Type);

			// if(sessionStorage.getItem('UserRole') == 'Employee'){
			//     let employeeData = new FormData();
			//     employeeData.append('EmployeeId','2BF00C5F-D5CB-4E34-9C53C1DA692197DB');
			//     this.hrservice.getemployeeData(employeeData).subscribe(Response =>{
			//         this.employeeDetails = Response.EMPLOYEEDATA.DATA[0][0];
			//         this.workDiaryDetails.controls.EmployeeName.disable();
			//         this.workDiaryDetails.controls.EmployeeName.setValue(this.employeeDetails);
			//     });
			// }
			this.Permanentdiv = true;
			this.tempdiv = false;
			this.labourdiv = false;
		} else if (this.Employee_Type == 'Contract Employee') {
			this.workDiaryDetails.controls.Employee_Type.setValue(this.Employee_Type);
			this.labourdiv = true;
			this.tempdiv = false;
			this.Permanentdiv = false;
			this.workDiaryDetails.controls.EmployeeName.enable();
		} else {
			this.tempdiv = false;
			this.labourdiv = false;
			this.Permanentdiv = false;
			this.workDiaryDetails.controls.EmployeeName.enable();
		}
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
	}

}
