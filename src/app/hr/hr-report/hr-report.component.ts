import { Component, OnInit, OnDestroy,ViewChild,ElementRef, ChangeDetectorRef,Injectable } from '@angular/core';
import { FormBuilder,FormGroup,FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbCalendar, NgbDatepicker , NgbDateAdapter, NgbDate, NgbDateParserFormatter, NgbDateStruct, NgbInputDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { HrService } from '../../services/hr.service';
import { DatePipe } from '@angular/common';
import { HttpClient ,HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable,from, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DataTableDirective } from 'angular-datatables';
@Component({
  selector: 'app-hr-report',
  templateUrl: './hr-report.component.html',
  styleUrls: ['./hr-report.component.scss']
})
export class HrReportComponent implements OnInit, OnDestroy {
      [x: string]: any;
      private destroy$ = new Subject<void>();
     hrReport= new FormGroup({
    dateFrom : new FormControl(''),
    dateTo : new FormControl(''),
    vendorname: new FormControl(''),
    resourseType: new FormControl(''),
    projectNames:new FormControl(''),
       })
    
      constructor(private cd: ChangeDetectorRef, private _fb: FormBuilder, private router: Router,private http:HttpClient,private hrservice:HrService,private datePipe: DatePipe) { }
      minDate = { year: 1900, month: 1, day: 1 };
      maxDate = { year: 2099, month: 12, day: 31 };
    
 

  ngOnInit(): void {
    this.vendorList();
    
  }
  vendorList(){
		let vendorDetail = new FormData();
		this.hrservice.getVendorListReport(vendorDetail).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
			this.vendorDataList = Response.data;

        });
	}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
