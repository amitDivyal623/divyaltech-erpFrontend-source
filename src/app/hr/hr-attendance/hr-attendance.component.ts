import { Component, OnInit, ViewChild,ElementRef,TemplateRef, ChangeDetectorRef, OnDestroy,Injectable } from '@angular/core';
import { from, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {Router} from '@angular/router';
import { HrService } from '../../services/hr.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { HttpClient ,HttpHeaders, HttpResponse } from '@angular/common/http';
import {NgxSpinnerService} from 'ngx-spinner';
import { NgbCalendar, NgbDateAdapter, NgbDate, NgbDateParserFormatter, NgbDateStruct, NgbInputDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';
import { DataTableDirective } from 'angular-datatables';
declare var $;
import { environment } from 'src/environments/environment';

class HRAttendence {
	AttendanceID : string;
	EmployeeId : string;
	AttendanceDt : string;
	ShiftId : string;
	TimeIn : string;
	TimeOut : string;
	TimeInStatus : string;
	TimeOutStatus : string;
}
class DataTablesResponse {
    data: any[];
    data1: any[];
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
	selector: 'app-hr-attendance',
	templateUrl: './hr-attendance.component.html',
	styleUrls: ['./hr-attendance.component.css'],
	providers: [
        NgbInputDatepickerConfig,
        {provide: NgbDateAdapter, useClass: CustomAdapter},
        {provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter}
      ]
})

export class HrAttendanceComponent implements OnInit, OnDestroy {
	minDate = {year: 1900, month: 1, day: 1};
	maxDate = {year: 2099, month: 12, day: 31};
	importfile:File;
	[x: string]: any;
	dtOptions: DataTables.Settings = {};
    dtTrigger: Subject<any> = new Subject<any>();
	private destroy$ = new Subject<void>();
	@ViewChild('labelImport')labelImport: ElementRef;
	@ViewChild('closebutton') closebutton;
	@ViewChild('closeImportbutton') closeImportbutton;
	@ViewChild('add_attendancePopup') add_attendancePopup;
	@ViewChild(DataTableDirective) dtElement: DataTableDirective;
	ImportFileForm = new FormGroup({
		attendenceImportFile : new FormControl('',[Validators.required,Validators.pattern("^.+\.(csv)$")])
	});
	SearcAttendanceDetails = new FormGroup({
		EmployeeId : new FormControl(''),
		reportType : new FormControl(''),
		reportFor : new FormControl('Employees'),
		duration : new FormControl('Monthly'),
		SearchattendanceDate : new FormControl(''),
		SearchattendanceDateTo : new FormControl(''),
		Departments : new FormControl(''),
		vendor_id : new FormControl(''),
		SearchattendanceMonth : new FormControl(''),
		SearchattendanceYear : new FormControl('')
	})
	attendanceForm = new FormGroup({
		employeeName : new FormControl('',[Validators.required]),
		attendanceDate : new FormControl(''),
		attendance_id : new FormControl(''),
		employeeShift : new FormControl('',[Validators.required]),
		checkinTime : new FormControl(''),
		checkOutTime : new FormControl('')
	})
	DatatableParameter = { employeeId: '', attendanceDate: '', attendanceMonth: '', attendanceYear: '', Department: '', vendorId: '',report_Type:'',report_for:'', attendanceDateTo:''};
	constructor(private router:Router,private http:HttpClient,private hrservice:HrService,private spinner: NgxSpinnerService,private chRef : ChangeDetectorRef,private datePipe: DatePipe) { 
		if(sessionStorage.getItem('token')==undefined && sessionStorage.getItem('UserName')==undefined){
		this.router.navigate(['/']);
		}
	}
	ngOnInit() {
		// var today = new Date();
		// this.dateOfAttendance = ("0"+(today.getDate())).slice(-2)+'/'+("0"+(today.getMonth()+1)).slice(-2)+'/'+today.getFullYear()
		// setTimeout(()=>{                          
		// 	$('#SearchattendanceDate').val(this.dateOfAttendance);
		// }, 500);
		this.employeeList();
		this.lookupdatalist();
		this.contractorlist();
		this.report_for ='Employees'
		this.report_Type ='Detailed Report';
		this.attendance_summaryReprt = false;
		this.attendance_DetailedReport = true;
		this.attendance_date = true;
		this.employeeDepartments = true;
		this.attendance_forEmployee = true;
		this.attendance_forMachines = false;
		this.attendance_forlabour = false;
		this.attendancedatatable();
		if(sessionStorage.getItem('UserRole') == 'Employee'){
			this.employeeTab = true;
		}
		if(sessionStorage.getItem('UserRole') == 'HR user'){
			this.hruser = true;
		}
	}
	getDaysInMonth = function(month,year) {
		return new Date(year, month, 0).getDate();
	};
	employeeList(){
		let employee2 = new FormData();
			this.hrservice.getEmployee(employee2).pipe(takeUntil(this.destroy$)).subscribe(resp =>{
			this.employee = resp.data;
		});
	}
	lookupdatalist(){
		let lookupShift = "Shift";
		let shiftdata = new FormData();
		shiftdata.append('lookupname',lookupShift);
		this.hrservice.fetch_lookupdata(shiftdata).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
		this.resplookupShift = Response.data
		});

		let lookupReportType = "ReportType";
		let ReportTypedata = new FormData();
		ReportTypedata.append('lookupname',lookupReportType);
		this.hrservice.fetch_lookupdata(ReportTypedata).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
		this.resplookupReportType = Response.data
		});

		let lookupDepartment = "Department";
        let departmentdata = new FormData();
        departmentdata.append('lookupname',lookupDepartment);
        this.hrservice.fetch_lookupdata(departmentdata).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
            this.resplookupDepartment = Response.data
        });
	}
	contractorlist(){
        let projectlist = new FormData();
        this.hrservice.contractorList(projectlist).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
            this.respcontractor = Response.data
        });
    }
	incomingfile(event){
		this.importfile = event.target.files[0];
		this.labelImport.nativeElement.innerText = this.importfile.name
	}
	insertImportAttendence(){
		if(this.ImportFileForm.valid){
			this.submitted = false;
			this.spinner.show();
			let importData = new FormData();
			importData.append("importFile",this.importfile);
			this.hrservice.addImportFile(importData).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
				if(Response.CODE == 200) {
					Swal.fire({
						icon:'success',
						title:'Success!',
						text:Response.MESSAGE,
						showConfirmButton:false,
						timer:2000
					});
					this.spinner.hide();
					this.ImportFileForm.reset();
					this.closeImportbutton.nativeElement.click();
				}else{
					this.submitted = true;
					Swal.fire({
						icon:'error',
						title:'Error!',
						text:'Task Creation Failed',
						showConfirmButton:false,
						timer:3000
					});
					this.spinner.hide();
				}
			});
		}else{
			this.submitted = true;
			Swal.fire({
				icon:'error',
				title:'Error!',
				text:'Fill required fields first',
				showConfirmButton:false,
				timer:3000
			});
		}
  	}
	ReportTypeChanges(e){
		this.report_Type = e.target.options[e.target.selectedIndex].text;
		if( this.report_Type =='Detailed Report'){
			this.attendance_date = true;
			this.attendance_duration = false;
			this.Monthlyduration = false;
			this.DwownloadDiv = false;
			setTimeout(()=>{                          
				$('#SearchattendanceDate').val(this.dateOfAttendance);
			}, 500);
		}else if(this.report_Type =='Summary Report'){
			var today = new Date();
			this.dateOfAttendanceMonth = ("0"+(today.getMonth()+1)).slice(-2);
			this.dateOfAttendanceYear = today.getFullYear();
			setTimeout(()=>{                          
				$('#SearchattendanceMonth').val(this.dateOfAttendanceMonth);
				$('#SearchattendanceYear').val(this.dateOfAttendanceYear);
			}, 500);
			this.attendance_date = false;
			this.attendance_duration = true;
			this.Monthlyduration = true;
			this.DwownloadDiv = true;
		}else{
			this.attendance_date = false;
			this.attendance_duration = false;
			this.Monthlyduration = false;
			this.DwownloadDiv = false;
		}
	}
	ReportForChanges(e){
		this.report_for = e.target.options[e.target.selectedIndex].text;
		if( this.report_for =='Employees'){
			this.employeeDepartments = true;
			this.vendorDetails = false;
		}else if(this.report_for =='labour'){
			this.employeeDepartments = false;
			//this.vendorDetails = false;
			this.vendorDetails = true;
		}else{
			this.employeeDepartments = false;
			//this.attendance_forEmployee = false;
			this.vendorDetails = true;
		}
	}
	durationChanges(e){
		this.duration = e.target.options[e.target.selectedIndex].text;
		if( this.duration =='Monthly'){
			this.Monthlyduration = true;
		}else if(this.duration =='Weekly'){
			this.Weeklyduration = true;
		}
	}
	attendancedatatable() {
        this.DatatableParameter.employeeId = this.SearcAttendanceDetails.get('EmployeeId').value;
		if(this.SearcAttendanceDetails.get('SearchattendanceDate').value != '' && !this.attendance_summaryReprt){
			this.DatatableParameter.attendanceDate = (<HTMLInputElement>document.getElementById("SearchattendanceDate")).value;
		}else{
			this.DatatableParameter.attendanceDate = this.dateOfAttendance;
		}
		this.DatatableParameter.attendanceDateTo = this.SearcAttendanceDetails.get('SearchattendanceDateTo').value;
        this.DatatableParameter.vendorId = this.SearcAttendanceDetails.get('vendor_id').value;
        this.DatatableParameter.Department = this.SearcAttendanceDetails.get('Departments').value;
        this.DatatableParameter.attendanceMonth = $("#SearchattendanceMonth").val();
        this.DatatableParameter.attendanceYear =  $("#SearchattendanceYear").val();
        this.DatatableParameter.report_for = this.report_for;
        this.DatatableParameter.report_Type = this.report_Type;
        const that = this;
        const headers = new HttpHeaders({ 'Content-Type': 'text/plain'});
        this.dtOptions = {
            processing: true,
            serverSide: true,
            dom: 'lrtip',
            lengthMenu:[[50,5, 10, 25, 50], [50,5, 10, 25, 50]],
            // columnDefs: [
            //     { orderable: false, targets: 5 }
            // ],
            ajax: (dataTablesParameters: any, callback) => {
                Object.assign(dataTablesParameters, this.DatatableParameter);
                that.http.post<DataTablesResponse>(environment.APIEndpoint+'hr_attendance.fetch_attendance&reload=1',Object.assign(dataTablesParameters,this.DatatableParameter), {responseType: 'json', headers}).pipe(takeUntil(this.destroy$)).subscribe(resp =>{
                    that.data = resp.data;
					
					if(this.attendance_summaryReprt){
						setTimeout(()=>{   
							let k;
							for(k=0;k<this.data.length;k++){
								if(this.report_for == 'Machines'){
									let index = this.data[k].readingDate - 1;
									$('#'+k+'_'+index).text(this.data[k].Attendance);
									let i;
									for(i=0;i<31;i++){
										if(i != index){
											$('#'+k+'_'+i).text('A')
										}
									}
								}else if(this.report_for == 'labour'){
									this.attdata = resp.data[k].AttendanceDate.split(',');
									this.totalLabour = resp.data[k].totalLabour.split(',');
									let i;
									let arr = [];
									for(i=0;i<this.attdata.length;i++){
										let index = this.attdata[i] - 1;
										arr.push(index);
										$('#'+k+'_'+index).text(this.totalLabour[i])
									}
									let j;
									for(j=0;j<31;j++){
										if($.inArray(j, arr) == -1){
											$('#'+k+'_'+j).text('A')
										}
									}									
								}else{
								this.attdata = resp.data[k].Attendance.split(',');
								let i
								this.data3 = [];
								for(i=0;i<this.attdata.length;i++){
									$('#'+k+'_'+i).text(this.attdata[i])
								}
							}
								
							}
						}, 500);
					}
                    callback({recordsTotal: resp.recordsTotal,recordsFiltered: resp.recordsTotal,data: []});
                });
            }
        }; 
    }
	attendanceAdd(){
		if(this.attendanceForm.controls.employeeName.valid && this.attendanceForm.controls.employeeShift.valid){
			this.attendancesubmitted = false;
			this.spinner.show();
			const form = document.querySelector('form');
			let attendancesData = new FormData(form);
			attendancesData.append('PresAbs','p');
			this.hrservice.addAttendance(attendancesData).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
				if(Response.CODE == 200) {
					Swal.fire({
						icon:'success',
						title:'Success!',
						text:Response.MESSAGE,
						showConfirmButton:false,
						timer:2000
					});
					this.closebutton.nativeElement.click();
					this.spinner.hide();
					this.attendanceForm.reset();
					this.reload();
				}else{
					this.attendancesubmitted = true;
					Swal.fire({
						icon:'error',
						title:'Error!',
						text:'Task Creation Failed',
						showConfirmButton:false,
						timer:3000
					});
					this.spinner.hide();
				}
			});
		}else{
			this.attendancesubmitted = true;
			Swal.fire({
                icon:'error',
                title:'Required fields empty',
                text:'Please enter the mandatory fields',
                showConfirmButton:false,
                timer:3000
            });
		}
	}
	add_attendance(){
		this.editView = false;
		this.viewAttendance = true;
		var today = new Date();
		this.dateOfAttendance = ("0"+(today.getDate())).slice(-2)+'/'+("0"+(today.getMonth()+1)).slice(-2)+'/'+today.getFullYear()
		setTimeout(()=>{                          
			$('#attendanceDate').val(this.datePipe.transform(new Date(),"dd/MM/yyyy"));
			$('#checkinTime').val('10:00');
		}, 500);
		this.attendanceForm.enable();
		this.add_attendancePopup.nativeElement.click();
	}
	editattenance(id){
		this.editView = true;
		this.viewAttendance = true;
		let attendancesData = new FormData();
		attendancesData.append('AttendanceID',id);
		this.hrservice.editAttendance(attendancesData).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
			$('#attendanceDate').val(this.datePipe.transform(Response.DATA[0][3],"dd/MM/yyyy"));
			this.attendanceForm.patchValue({
				employeeName : Response.DATA[0][2],
				attendance_id : Response.DATA[0][0],
				//attendanceDate : Response.DATA[0][3],
				employeeShift : Response.DATA[0][4],
				checkinTime : this.datePipe.transform(Response.DATA[0][5],"HH:mm"),
				checkOutTime : this.datePipe.transform(Response.DATA[0][6],"HH:mm")
			});
		});
		this.attendanceForm.enable();
		this.add_attendancePopup.nativeElement.click();
	}
	viewattendance(id){
		this.editView = true;
		this.viewAttendance = false;
		let attendancesData = new FormData();
		attendancesData.append('AttendanceID',id);
		this.hrservice.editAttendance(attendancesData).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
			$('#attendanceDate').val(this.datePipe.transform(Response.DATA[0][3],"dd/MM/yyyy"));
			this.attendanceForm.patchValue({
				employeeName : Response.DATA[0][2],
				attendance_id : Response.DATA[0][0],
				//attendanceDate : Response.DATA[0][3],
				employeeShift : Response.DATA[0][4],
				checkinTime : this.datePipe.transform(Response.DATA[0][5],"HH:mm"),
				checkOutTime : this.datePipe.transform(Response.DATA[0][6],"HH:mm")
			});
		});
		this.attendanceForm.disable();
		this.add_attendancePopup.nativeElement.click();
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
	month_name = function(dt){
		this.mlist = [ "Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec" ];
		return this.mlist[dt.getMonth()];
	};
	searchAttendance(){
		this.reportType_value = this.SearcAttendanceDetails.get('reportType').value
		if(this.reportType_value != '' && this.reportType_value != 'null'){
			if(this.report_Type == 'Detailed Report'){
				this.attendance_summaryReprt = false;
				this.attendance_DetailedReport = true;
			}else{
				this.attendance_summaryReprt = true;
				this.attendance_DetailedReport = false;
				this.attendanceMonth = $('#SearchattendanceMonth').val();
				this.attendanceYear = $('#SearchattendanceYear').val();
				this.totaldays = [];
				if(this.attendanceMonth != '' && this.attendanceYear != ''){
					let i;
					for(i=0;i<this.getDaysInMonth(this.attendanceMonth, this.attendanceYear);i++){
						this.totaldays.push(i);
					}
				}
				this.Monthname = this.month_name(new Date(this.attendanceMonth))
			}
			this.attendanceRportFor = this.SearcAttendanceDetails.get('reportFor').value;
			if( this.attendanceRportFor == 'Employees'){
				this.attendance_forEmployee = true;
				this.attendance_forlabour = false;
				this.attendance_forMachines = false;
			}else if(this.attendanceRportFor == 'labour'){
				this.attendance_forEmployee = false;
				this.attendance_forMachines = false;
				this.attendance_forlabour = true;
			}else{
				this.attendance_forMachines = true;
				this.attendance_forEmployee = false;
				this.attendance_forlabour = false;
			}
			this.attendancedatatable();
			this.rerender();
		}else{
			Swal.fire('Alert','Fill report type fields first','info');
		}
    }
	dwonloadAttendance(){
		this.attendanceRportFor = this.SearcAttendanceDetails.get('reportFor').value;
		if( this.attendanceRportFor == 'Employees'){
			window.open(environment.APIEndpoint+'hr_attendance.downloadEmployeeAttendance&reload=1&attendanceMonth='+$('#SearchattendanceMonth').val()+'&attendanceYear='+$('#SearchattendanceYear').val()+'&employeeId='+this.SearcAttendanceDetails.get('EmployeeId').value+'&Department='+this.SearcAttendanceDetails.get('Departments').value+'&token='+sessionStorage.getItem('token'),"_blank")
		}else if(this.attendanceRportFor == 'labour'){
			window.open(environment.APIEndpoint+'hr_attendance.downloadLaborAttendance&reload=1&attendanceMonth='+$('#SearchattendanceMonth').val()+'&attendanceYear='+$('#SearchattendanceYear').val()+'&vendorId='+this.SearcAttendanceDetails.get('vendor_id').value+'&token='+sessionStorage.getItem('token'),"_blank")
		}else{
			window.open(environment.APIEndpoint+'hr_attendance.downloadMachinAttendance&reload=1&attendanceMonth='+$('#SearchattendanceMonth').val()+'&attendanceYear='+$('#SearchattendanceYear').val()+'&vendorId='+this.SearcAttendanceDetails.get('vendor_id').value+'&token='+sessionStorage.getItem('token'),"_blank")
		}
		
	}
}
