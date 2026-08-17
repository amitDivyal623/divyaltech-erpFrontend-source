import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild,AfterViewInit, OnDestroy, Injectable, Input } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbCalendar, NgbDateAdapter, NgbDate,NgbModule , NgbDateParserFormatter, NgbDateStruct, NgbInputDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { DataTableDirective } from 'angular-datatables';
import { BillingService } from 'src/app/services/billing.service';
import { ActivatedRoute, Router } from '@angular/router';
import { from, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
import { DatePipe } from '@angular/common';
import { HrService } from 'src/app/services/hr.service';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { saveAs } from 'file-saver';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

class DataTablesResponse {
	data: any[];
	draw: number;
	recordsFiltered: number;
	recordsTotal: number;
}
class landlordAttorney {

	title: any;
  landlords_name: any;
  reg_area:  any;
  reg_address: any;
  reg_city: any;
  reg_tah : any;
  reg_state: any;
  reg_country : any;
  reg_pincode : any;
  reg_caste : any;
  mobile_number : any;
  alt_mobile_number : any;
  pan_number : any;
  adhar_number : any;
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
@Component({
  selector: 'app-power-attorney',
  templateUrl: './power-attorney.component.html',
  styleUrls: ['./power-attorney.component.scss'],
  providers: [
    NgbInputDatepickerConfig,
    {provide: NgbDateAdapter, useClass: CustomAdapter},
    {provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter}
  ]
})
export class PowerAttorneyComponent implements OnInit, OnDestroy {

  @Input() power_id:any;
  pipe = new DatePipe('en-US');
  date = new Date();
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  private destroy$ = new Subject<void>();
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  @ViewChild('attorneymodal')attorneymodal: ElementRef;
  @ViewChild('closebutton') closebutton;
  data:landlordAttorney[];
  PopupTitle: string;
  attorneyDetails = new FormGroup({
    attLandlordId:new FormControl('',),
    AttorneyId:new FormControl(''),
    powerName: new FormControl('',[Validators.required]),
    powerNumber: new FormControl('',[Validators.required,Validators.pattern('^[0-9]*$')]),
    KhasraNo: new FormControl('',[Validators.required]),
    powerRakba: new FormControl('',[Validators.required]),
    diversion: new FormControl('',[Validators.required]),
    signTime: new FormControl('',[Validators.required]),
    powerDate: new FormControl('',[Validators.required]),
    powerPustak: new FormControl('',[Validators.required]),
    powerGranth: new FormControl('',[Validators.required]),
    powerVilekh: new FormControl('',[Validators.required])
  });
  landlordtitle: string;
  DatatableParameters: { };
  submitted: boolean;
  flg: string= "Add";
  attorneyId: any;
  constructor(private cd: ChangeDetectorRef, private _fb: FormBuilder,private cdr: ChangeDetectorRef, private billingservice: BillingService,private route:Router,public http:HttpClient,private activatedRoute: ActivatedRoute,private hrservice: HrService){ }

  ngOnInit(): void {

    this.datatableCode();
  }
  datatableCode() {
		const that = this;
		const headers = new HttpHeaders({ 'Content-Type': 'text/plain'});
		this.dtOptions = {
      searching: false,
      processing: true,
      serverSide: true,
      dom: 'lrtip',
      pageLength: 50,
      lengthMenu:[[5, 10, 25, 50], [5, 10, 25, 50]],
      columnDefs: [
        { orderable: false, targets: -1 }
      ],
      order:[[0, 'desc']],
      ajax: (dataTablesParameters: any, callback) => {
				Object.assign(dataTablesParameters, {'id':this.power_id});
        that.http.post<DataTablesResponse>(environment.APIEndpoint + 'reg_landlords.get_AttorneyDetail&reload=1', dataTablesParameters, { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {
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

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
	ngAfterViewInit(): void {
		this.dtTrigger.next();
  }
  add_attorneyDetails() {
    this.submitted = true;
    if (this.attorneyDetails.valid)
    {  
      
      let attorneyDetaildata = new FormData();
      attorneyDetaildata.append('attLandlordId', this.attorneyDetails.get('attLandlordId').value);
      attorneyDetaildata.append('AttorneyId', this.attorneyDetails.get('AttorneyId').value);
      attorneyDetaildata.append('powerName', this.attorneyDetails.get('powerName').value);
      attorneyDetaildata.append('powerNumber', this.attorneyDetails.get('powerNumber').value);
      attorneyDetaildata.append('KhasraNo', this.attorneyDetails.get('KhasraNo').value);
      attorneyDetaildata.append('powerRakba', this.attorneyDetails.get('powerRakba').value);
      attorneyDetaildata.append('diversion', this.attorneyDetails.get('diversion').value);
      attorneyDetaildata.append('powerDate', this.attorneyDetails.get('powerDate').value);
      attorneyDetaildata.append('signTime', this.attorneyDetails.get('signTime').value);
      attorneyDetaildata.append('powerPustak', this.attorneyDetails.get('powerPustak').value);
      attorneyDetaildata.append('powerGranth', this.attorneyDetails.get('powerGranth').value);
      attorneyDetaildata.append('powerVilekh', this.attorneyDetails.get('powerVilekh').value);
      // stop here if form is invalid
      this.billingservice.add_attorneyDetails(attorneyDetaildata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
        if (Response.CODE == 200) {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: Response.MESSAGE,
            showConfirmButton: false,
            timer: 2000
          });
          // this.rerender();                                                                                                                                                                                                                                                                                                                                                                                                     
          this.reload(); 
          this.closeModal();
          this.attorneyDetails.reset();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Field required!',
            showConfirmButton: false,
            timer: 3000
          });
        }
      });
    }
    else{
      Swal.fire({
        icon: 'info',
        title: 'All Field required!',
        text: 'Please fill all the required fields',
        showConfirmButton: true,
        timer: 3000
      })
    }
  }
  editAttorney(id) {
    this.attorneyDetails.enable();
    let patchData = new FormData();
    patchData.append('AttorneyId',id);

    this.billingservice.getAttorneydata(patchData).pipe(takeUntil(this.destroy$)).subscribe(Response => {


      if (Response) {
        this.attorneyDetails.patchValue({
          attLandlordId: Response.attLandlordId,
          AttorneyId: Response.AttorneyId,
          powerName: Response.poa_name,
          KhasraNo: Response.khasra_number,
          powerNumber: Response.poa_number,
          powerRakba: Response.rakba,
          diversion: Response.isDiverted,
          signTime: Response.time,
          powerDate: Response.date,
          powerPustak: Response.book_number,
          powerGranth: Response.granth,
          powerVilekh: Response.vilekh_number,
        });
      }

    })
    // this.PopupTitle = "Edit Attorney";
    this.flg = "Edit";
    this.attorneymodal.nativeElement.click();

  }
  viewAttorney(id) {

    let patchData = new FormData();
    patchData.append('AttorneyId',id);
    this.billingservice.getAttorneydata(patchData).pipe(takeUntil(this.destroy$)).subscribe(Response => {


      if (Response) {
        this.attorneyDetails.patchValue({
          attLandlordId: Response.attLandlordId,
          AttorneyId: Response.AttorneyId,
          powerName: Response.poa_name,
          powerNumber: Response.poa_number,
          KhasraNo: Response.khasra_number,
          powerRakba: Response.rakba,
          diversion: Response.isDiverted,
          powerDate: Response.date,
          signTime: Response.time,
          powerPustak: Response.book_number,
          powerGranth: Response.granth,
          powerVilekh: Response.vilekh_number,
        });
        
      }

    });

    
     this.flg = "View";
    this.attorneymodal.nativeElement.click();

  }


  deleteAttorney(AttorneyId){

   

    let delAttData =new FormData();
    delAttData.append('AttorneyId',AttorneyId);

    this.billingservice.deleteAttorneydata(delAttData).pipe(takeUntil(this.destroy$)).subscribe(Response => {

      
      if (Response) {
        Swal.fire({
          icon:'success',
          title:'Successfully Deleted!',
          text:Response.MESSAGE,
          showConfirmButton:false,
          timer:2000
        });
        this.reload();
        // this.rerender();
        this.attorneyDetails.reset();
        this.closeModal();
      } else {
          Swal.fire({
          icon:'error',
          title:'Field required!',
          showConfirmButton:false,
          timer:3000
        });
      }
    })
  }

  downloadAttorney(id){


    let attorneyData = new FormData();
    attorneyData.append('AttorneyId',id);

    this.attorneyId = id;
    
 
    const formData = new FormData();
    if(this.attorneyId){
      formData.append('attorneyId',this.attorneyId);
    }

    const xhr = new XMLHttpRequest();
      xhr.open('POST', environment.APIEndpoint + `reg_landlords.Att_pdfData&reload=1`, true);
      xhr.responseType = 'blob'; 
      xhr.onload = function () {
        if (xhr.status === 200) {

          
          const blob = new Blob([xhr.response], { type: 'application/pdf' });
          saveAs(blob, 'AttorneyDetails.pdf');
          
        } else {
          console.error('Unexpected response status:', xhr.status);
        }
      };
  
      xhr.onerror = function () {
        console.error('An error occurred during the transaction');
      };
  
      xhr.send(formData);

  }
  
  openAttorButton() {

    if (this.flg == "Add") {
       this.PopupTitle = "Add New Attorney";
       this.attorneyDetails.enable();
    }
    else if (this.flg == "Edit")
    {
      this.PopupTitle = "Edit Attorney";
      this.attorneyDetails.enable();

    }
    else if (this.flg == "View")
    {
      this.PopupTitle = "View Attorney";
      this.attorneyDetails.disable();
    }

    this.flg = "Add"
    this.attorneyDetails.reset();
    const aLandlordId = this.activatedRoute.snapshot.paramMap.get('id');
    this.attorneyDetails.get('attLandlordId').setValue(aLandlordId);
    this.submitted = false;
  }
  rerender():void{
    this.dtElement.dtInstance.then((dtInstance : DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
    });
  }
  reload()
  {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }
  public closeModal() {
    this.closebutton.nativeElement.click();
}
}
