import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Observable, from, Subject } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { HrService } from '../../../services/hr.service';
import { DataTableDirective } from 'angular-datatables';
import { DatePipe } from '@angular/common';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
import { NgbCalendar, NgbDateAdapter, NgbDate, NgbDateParserFormatter, NgbDateStruct, NgbInputDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { concatMap, takeUntil } from 'rxjs/operators';

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
  selector: 'app-labour-report',
  templateUrl: './labour-report.component.html',
  styleUrls: ['./labour-report.component.scss'],
  providers: [
		NgbInputDatepickerConfig,
		{ provide: NgbDateAdapter, useClass: CustomAdapter },
		{ provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
		{ provide: DatePipe }
	]
})
export class LabourReportComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  labourReport=new FormGroup({
    dateFrom: new FormControl(''),
    dateTo : new FormControl(''),
    vendorName: new FormControl(''),
    projectName: new FormControl('')
  });
   pdf:any;
  dtOptions: DataTables.Settings = {};
	dtTrigger: Subject<any> = new Subject<any>();
	@ViewChild(DataTableDirective) dtElement: DataTableDirective;
  date = new Date();

  [x: string]: any;
  DatatableParameter = { dateFrom: '',dateTo:'',vendorId:'',projectID: ''};
  minDate = { year: 1900, month: 1, day: 1 };
  maxDate = { year: 2099, month: 12, day: 31 };
  constructor(private cd: ChangeDetectorRef, private _fb: FormBuilder, private router: Router,private http:HttpClient,private hrservice:HrService,private datePipe: DatePipe) {  
    if(sessionStorage.getItem('token')==undefined && sessionStorage.getItem('UserName')==undefined){
    this.router.navigate(['/']);
}
}

  ngOnInit(): void {
    this.vendorList();
    this.projectlist();
    this.datatableCode();

  }
  
  datatableCode() {
    
    this.DatatableParameter.dateFrom = (<HTMLInputElement>document.getElementById("dateFrom")).value;
    this.DatatableParameter.dateTo = (<HTMLInputElement>document.getElementById("dateTo")).value;
    this.DatatableParameter.vendorId= this.labourReport.get('vendorName').value;
    this.DatatableParameter.projectID=this.labourReport.get('projectName').value;
    const that = this;
    const headers = new HttpHeaders(
      { 'Content-Type': 'text/plain',
      'token':sessionStorage.getItem('token')
    });
   
    this.dtOptions = {
        processing: true,
        serverSide: true,
        dom: 'lrtip',
        lengthMenu:[[5, 10, 25, 50], [5, 10, 25, 50]],
        columnDefs: [
            { orderable: false, targets: 5 }
        ],
        ajax: (dataTablesParameters: any, callback) => {
          
            that.http.post<DataTablesResponse>(environment.APIEndpoint+'report.fetch_Data&reload=1',Object.assign(dataTablesParameters,this.DatatableParameter), {responseType: 'json', headers}).pipe(takeUntil(this.destroy$)).subscribe(resp =>{
                that.data=resp.data;
               this.pdf=that.data;
              
               
                           
                callback({recordsTotal: resp.recordsTotal,recordsFiltered: resp.recordsTotal,data: []});
            });
        }
    };
}

showData(){
         this.showPdf();
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
  vendorList(){
		let vendorDetail = new FormData();
		this.hrservice.getVendorListReport(vendorDetail).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
			this.vendorDataList = Response.data
				
        });
}
projectlist(){
  let projectlist = new FormData();
  this.hrservice.projectlist(projectlist).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
      this.respProject = Response.data;
    
  });
}

downloadfile(){
  let type='_download';
  window.open(environment.APIEndpoint+'project.download&type='+type+'&token='+sessionStorage.getItem('token')+'&reload=1', "_blank");
}





showPdf(){
  
const that = this;
let ReportPdf = new FormData();
ReportPdf.append('DateFrom',(<HTMLInputElement>document.getElementById("dateFrom")).value);
ReportPdf.append('DateTo',(<HTMLInputElement>document.getElementById("dateTo")).value);
ReportPdf.append('VendorId',this.labourReport.get('vendorName').value);
ReportPdf.append('ProjectID',this.labourReport.get('projectName').value);

  this.hrservice.getLabourPdf(ReportPdf).pipe(takeUntil(this.destroy$)).subscribe(resp=>{
  
  let fileName='report'
  // let binaryData=[];
  // binaryData=[resp];
  var blob = new Blob([resp], {type: "text/plain"});
  let a= document.createElement('a');
  a.download=fileName;
  a.href=window.URL.createObjectURL(blob);
  a.click();
  },
  err=>{
    console.log("error-",err);
  })
        
   
  }

}


