import { NgbCalendar, NgbDateAdapter, NgbDate, NgbDateParserFormatter, NgbDateStruct, NgbInputDatepickerConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnInit, ViewChild, ViewContainerRef,ChangeDetectorRef, OnDestroy, Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import { HrService } from '../../services/hr.service';
import Swal from 'sweetalert2';
import { from ,Subject} from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HttpClient ,HttpHeaders, HttpResponse } from '@angular/common/http';
import { StringLiteralLike } from 'typescript';
import { DataTableDirective } from 'angular-datatables';
import { DatePipe } from '@angular/common';
import { environment } from 'src/environments/environment';
import {MachineReadingPopupComponent} from '../../shared/machine-reading-popup/machine-reading-popup.component';

class HrMachineReading {
    ReadingId : string;
    ReadingDt : string;
    ReadingStart : string;
    ReadingEnd : string;
    TimeStart : string;
    TimeEnd : string;
    ExpendedTime : string;
    Status : string;
    CreatedBy : string;
    CreatedDt : string;
    UpadtedDt : string;
    UpadtedBy : string;
}

class DataTablesResponse {
    data: any[];
    draw: number;
    recordsFiltered: number;
    recordsTotal: number;
}

@Injectable()
export class CustomAdapter extends NgbDateAdapter<string> {

	readonly DELIMITER = '/';

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
declare var require: any;
var dateFormat = require('dateformat');
@Component({
	selector: 'app-hr-machine-reading',
	templateUrl: './hr-machine-reading.component.html',
	styleUrls: ['./hr-machine-reading.component.css'],
	providers: [
		NgbInputDatepickerConfig,
		{provide: NgbDateAdapter, useClass: CustomAdapter},
		{provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter}
	]
})

export class HrMachineReadingComponent implements OnInit, OnDestroy {
	dtOptions: DataTables.Settings = {};
	dtTrigger: Subject<any> = new Subject<any>();
	private destroy$ = new Subject<void>();
	@ViewChild(DataTableDirective) dtElement: DataTableDirective;
	@ViewChild('closebutton') closebutton;
	@ViewChild('openmodal') openmodal;
	@ViewChild('container', { read: ViewContainerRef })
	public containerRef: ViewContainerRef;
	private dateToString = (date) => `${date.year}-${date.month}-${date.day}`;

	model: NgbDateStruct;
	model2: string;
	modal:any;
	isButtonDisabled: boolean=false;
	fieldStatus:boolean = false;
	setData:boolean = false;
	saveButton1:boolean = true;
	addMachineReading = new FormGroup({
		date: new FormControl('',Validators.required),
		startReading: new FormControl('',Validators.required),
		stopReading: new FormControl('',Validators.required),
		machineStart: new FormControl('',Validators.required),
		machineStop: new FormControl('',Validators.required),
		extendedTime: new FormControl('',Validators.pattern(/^[.\d]+$/)),
		vendertype: new FormControl('',Validators.required),
		vechiceltype: new FormControl('',Validators.required),
		reading: new FormControl('')
	});
	searchMachine = new FormGroup({
		machineDate: new FormControl('',Validators.required),
		filtervendertype: new FormControl('',Validators.required),
		filterVehicletype: new FormControl('',Validators.required)
	});
	constructor(private modalService: NgbModal,private router:Router,private fb:FormBuilder,private hrservice:HrService,private http:HttpClient,private chRef : ChangeDetectorRef,private datePipe: DatePipe) {
		if(sessionStorage.getItem('token')==undefined && sessionStorage.getItem('UserName')==undefined){
		this.router.navigate(['/']);
		}
	}
	[x: string]: any;
	minDate = {year: 1900, month: 1, day: 1};
	maxDate = {year: 2099, month: 12, day: 31};
	DatatableParameter = {machineDate: '',vendertype: '',Vehicletype: ''};
	response:HrMachineReading[];

	public value: Date = new Date();

	ngOnInit(): void {
		this.machineTitle = 'Add New Entry';
		this.datatableCode();
		this.contractorlist();
		this.vehicalList();
		this.projectlist();
	}
	vehicalList(){
		let venderData = new FormData();
		venderData.append('VendorId','');
		this.hrservice.getvechicalList(venderData).pipe(takeUntil(this.destroy$)).subscribe(resp =>{
			this.vechicalList = resp.data;
		});
	}
	contractorlist(){
		let projectlist = new FormData();
		this.hrservice.contractorList(projectlist).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
			this.respcontractor = Response.data
		});
	}
  datatableCode() {

		this.DatatableParameter.machineDate = this.searchMachine.get('machineDate').value;
    this.DatatableParameter.vendertype = this.searchMachine.get('filtervendertype').value;
		this.DatatableParameter.Vehicletype = this.searchMachine.get('filterVehicletype').value;

		const that = this;
		const headers = new HttpHeaders({ 'Content-Type': 'text/plain'});
		this.dtOptions = {
			processing: true,
			serverSide: true,
			dom: 'lrtip',
			lengthMenu:[[5, 10, 25, 50], [5, 10, 25, 50]],
			columnDefs: [
				{ orderable: false, targets: 7 }
			],
			ajax: (dataTablesParameters: any, callback) => {
				Object.assign(dataTablesParameters, this.DatatableParameter);
				that.http.post<DataTablesResponse>(environment.APIEndpoint+'machine.fetchData&reload=1',Object.assign(dataTablesParameters,this.DatatableParameter), {responseType: 'json', headers}).pipe(takeUntil(this.destroy$)).subscribe(resp =>{
				that.response=resp.data;
				callback({recordsTotal: resp.recordsTotal,recordsFiltered: resp.recordsTotal,data: []});
				});
			}
		};
  	}

	setTime(){
		this.addMachineReading.controls['machineStart'].setValue(new Date());
		this.addMachineReading.controls['machineStop'].setValue(new Date());
	}

	public closeModal(){
		this.closebutton.nativeElement.click();
	}

	saveMachineReading(){
		this.submitted = false;
		if(this.addMachineReading.valid){
			this.submitted = false;
			const form = document.querySelector('form');
			let MachineReadingData = new FormData(form);
			MachineReadingData.append('readingID',this.addMachineReading.get('reading').value);
			MachineReadingData.append('vendertype',this.addMachineReading.get('vendertype').value);
			MachineReadingData.append('vechiceltype',this.addMachineReading.get('vechiceltype').value);
			this.hrservice.addMachineReading(MachineReadingData).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
				if(Response.CODE == 200) {
				Swal.fire({
					icon:'success',
					title:'Success!',
					text:Response.MESSAGE,
					showConfirmButton:false,
					timer:2000
				});
				this.addMachineReading.reset();
				this.closeModal();
				this.rerender();
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
			this.submitted = true;
			Swal.fire('Alert','Fill all required fields first','info');
		}
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
	viewMachine(readingID){
		this.hrservice.getMachineDetails(readingID).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
			this.fieldStatus = true;
			this.saveButton1 = false;
			this.machineBrifeData = Response.DATA;
			this.readingDate = this.machineBrifeData[0][1];
			this.reading = this.machineBrifeData[0][0];
			this.startReading = this.machineBrifeData[0][2];
			this.stopReading = this.machineBrifeData[0][3];
			this.machineStart = this.machineBrifeData[0][4];
			this.machineStop = this.machineBrifeData[0][4];
			this.extendedTime = this.machineBrifeData[0][6];
			this.projectId = this.machineBrifeData[0][7];
			this.vendertype = this.machineBrifeData[0][8];
			this.vechiceltype = this.machineBrifeData[0][9];
			this.vendorId = this.machineBrifeData[0][8];
			this.machineTitle = 'View Entry';
			this.addMachineReading.enable();
			this.setData = true;
			this.isButtonDisabled = false;
			this.openMachineReadingModel();
		});
	}

	editMachine(readingID){
		this.hrservice.getMachineDetails(readingID).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
			this.fieldStatus = false;
			this.saveButton1 = true;
			this.machineBrifeData = Response.DATA;
			this.readingDate = this.machineBrifeData[0][1];
			this.reading = this.machineBrifeData[0][0];
			this.startReading = this.machineBrifeData[0][2];
			this.stopReading = this.machineBrifeData[0][3];
			this.machineStart = this.machineBrifeData[0][4];
			this.machineStop = this.machineBrifeData[0][4];
			this.extendedTime = this.machineBrifeData[0][6];
			this.projectId = this.machineBrifeData[0][7];
			this.vendertype = this.machineBrifeData[0][8];
			this.vechiceltype = this.machineBrifeData[0][9];
			this.vendorId = this.machineBrifeData[0][8];
			this.machineTitle = 'Edit Entry';
			this.addMachineReading.enable();
			this.setData = true;
			this.isButtonDisabled = false;
			this.openMachineReadingModel();
		});
	}

	addnewMachine(){
		this.submitted = false;
		this.fieldStatus = false;
		this.setData = false;
		this.addMachineReading.reset();
		this.machineTitle = 'Add new Entry';
		this.addMachineReading.enable();
		this.isButtonDisabled = false;
		this.openMachineReadingModel();
	}

	openMachineReadingModel(){
		const modalRef = this.modalService.open(MachineReadingPopupComponent, { size: 'lg', backdrop: 'static', keyboard: true });
        modalRef.componentInstance.machineTitle = this.machineTitle;
		modalRef.componentInstance.date = this.readingDate;
		modalRef.componentInstance.respcontractor = this.respcontractor;
		modalRef.componentInstance.vechicalList = this.vechicalList;
		modalRef.componentInstance.isButtonDisabled = this.isButtonDisabled;
		modalRef.componentInstance.submitted = this.submitted;
		modalRef.componentInstance.reading = this.reading;
		modalRef.componentInstance.startReading = this.startReading;
		modalRef.componentInstance.stopReading = this.stopReading;
		modalRef.componentInstance.machineStart = this.machineStart;
		modalRef.componentInstance.machineStop = this.machineStop;
		modalRef.componentInstance.extendedTime = this.extendedTime;
		modalRef.componentInstance.vendertype = this.vendertype;
		modalRef.componentInstance.vechiceltype = this.vechiceltype;
		modalRef.componentInstance.vendorId = this.vendorId;
		modalRef.componentInstance.setData = this.setData;
		modalRef.componentInstance.fieldStatus = this.fieldStatus;
		modalRef.componentInstance.saveButton1 = this.saveButton1;
		modalRef.componentInstance.respProject = this.respProject;
		modalRef.componentInstance.projectId = this.projectId;
        modalRef.result.then((response: any) => {
            this.reload();
        },() => {});
	}

	machineSearch() {
		this.datatableCode();
		this.rerender();
	}

	projectlist(){
        let projectlist = new FormData();
        this.hrservice.projectlist(projectlist).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
            this.respProject = Response.data
        });
    }
	DeleteMachine(readingID) {
		Swal.fire({
		title: 'Are you sure?',
		text: 'You want to delete this.',
		icon: 'warning',
		showCancelButton: true,
		confirmButtonText: 'Yes',
		cancelButtonText: 'No'
		}).then((result) => {
			if (result.value) {
				this.hrservice.deleteMachine(readingID).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
					if(Response) {
						Swal.fire({
							icon:'success',
							title:'Success!',
							text:Response.MESSAGE,
							showConfirmButton:false,
							timer:2000
						});
						this.reload();
					}else{
						Swal.fire({
							icon:'error',
							title:'Error!',
							text:'item Delete Failed',
							showConfirmButton:false,
							timer:3000
						});
					}
				});
			}
		})
  }
  resetMachinesearch() {
    //this.searchMachine.reset();
    this.searchMachine.controls['machineDate'].setValue('');
    this.searchMachine.controls['filtervendertype'].setValue('');
    this.searchMachine.controls['filterVehicletype'].setValue('');
    this.datatableCode();
    this.rerender();
  }
	ngAfterViewInit(): void {
		this.dtTrigger.next();
	}
	ngOnDestroy(): void {
		this.dtTrigger.unsubscribe();
		this.destroy$.next();
		this.destroy$.complete();
	}
}
