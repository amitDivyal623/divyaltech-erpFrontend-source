import { Component, OnInit, ElementRef, ViewChild, ChangeDetectorRef, TemplateRef, Injectable, OnDestroy  } from '@angular/core';
import { NgbCalendar, NgbDateAdapter, NgbDate,NgbModule , NgbDateParserFormatter, NgbDateStruct, NgbInputDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder,FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Router, ActivatedRoute} from '@angular/router';
import {debounceTime, distinctUntilChanged, map, takeUntil} from 'rxjs/operators';
import { CrmService } from '../../../../services/crm.service';
import { ProjectService} from '../../../../services/project.service';
import { HrService } from 'src/app/services/hr.service';
import { DataTableDirective } from 'angular-datatables';
import Swal from 'sweetalert2';
import { DatePipe } from '@angular/common';
import { abort } from 'process';
import { environment } from 'src/environments/environment';
import jwt_decode from 'jwt-decode';


class attachmentmangment {
	Date: string;
	UploaderName: string;
	FileName: string;
}


class DataTablesResponse {
	data: any[];
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
  selector: 'app-crmenquiry-file',
  templateUrl: './crmenquiry-file.component.html',
  styleUrls: ['./crmenquiry-file.component.css'],
	providers: [
        NgbInputDatepickerConfig,
        {provide: NgbDateAdapter, useClass: CustomAdapter},
        {provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter},
        {provide : DatePipe}
    ]
})

export class CRMEnquiryFileComponent implements OnInit, OnDestroy {
  pipe = new DatePipe('en-US');
  [x: string]: any;
  dtOptions: DataTables.Settings = {};
  dtOptions1: DataTables.Settings = {};
  dtOptions2: DataTables.Settings = {};
  dtOptions3: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  private destroy$ = new Subject<void>();
  imageUrl: any = '';
  editFile: boolean = true;
  div1:boolean=true;
  fileStatus:boolean=true;
  removeUpload: boolean = false;
  constructor(private ngbCalendar: NgbCalendar,private cd: ChangeDetectorRef,private activatedRoute: ActivatedRoute, private dateAdapter: NgbDateAdapter<string>, private router: Router,public http:HttpClient,private CrmService:CrmService,private hrservice:HrService,private ProjectService:ProjectService,private chRef : ChangeDetectorRef,private datePipe: DatePipe,private formBuilder : FormBuilder) {
    if(sessionStorage.getItem('token')==undefined && sessionStorage.getItem('UserName')==undefined){
      this.router.navigate(['/']);
    }
  }
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  @ViewChild('NgbdDatepicker') d: NgbDateStruct;
  @ViewChild('fileInput') el: ElementRef;
  @ViewChild('closebutton') closebutton;
  @ViewChild('labelImport')labelImport: ElementRef;
  @ViewChild('attachmentModalButton')attachmentModalButton: ElementRef;
  @ViewChild('attachmentclosebutton') attachmentclosebutton;
  //Enquiry_date;
  private dateToString = (date) => `${date.year}-${date.month}-${date.day}`;
  public model: any;
  minDate = {year: 1900, month: 1, day: 1};
  maxDate = {year: 2099, month: 12, day: 31};
  notesModalHadding:any;
  VisitorModalHadding:any;
  attachmentModalHadding:any;
  attachmentstatus:any;
  attachmentimageName;
  fileuploads;
  filecontent;
  status;
  attachmentdata:attachmentmangment[];



  attachmenDetails = new FormGroup({
    // notesDate:new FormControl('',Validators.required),
    attachmentstatus:new FormControl(''),
    attachmentimage:new FormControl(''),
    attachmeid_id:new FormControl('')
  });
  attachmentDatatableParameter = {Customer_id : ''};

  viewenquiry()
  {this.router.navigate(['/crm-enquiry-view']);}

  ngOnInit(): void {
    this.jwttoken = jwt_decode(sessionStorage.getItem('token'));
    
    this.Method = this.activatedRoute.snapshot.paramMap.get('method');
	  this.EnquiryIds = this.activatedRoute.snapshot.paramMap.get('id');
    if (this.Method == 'add') {
      this.div1=false;
	  this.enquiryactive = '';
    }else{

		this.enquiryview = false;
		if(this.Method == 'view'){

      this.fileStatus=false;
			this.enquiryview = true;
			setTimeout(()=>{
				$('.form-control').prop('disabled',true);
				$('.custom-file-input').prop('disabled',true);
				$('.enquryButton').hide();
			}, 500);
		}


		this.attachmentdatatabl();
		this.enquiryactive = 'active';
    }
    this.CrmUserRole = false;
    if(sessionStorage.getItem('UserRole') == 'CRM User'){
			this.CrmUserRole = true;
		}
    this.CRMAdmin = false;
    if (sessionStorage.getItem('UserRole') == 'CRM Admin') {
      this.CRMAdmin = true;
    }
  }
  viewAttchement(path,type){
    window.open(environment.APIEndpoint+'project.download&path='+path+'&type='+type+'&token='+sessionStorage.getItem('token')+'&reload=1', "_blank");
  }

  Newattachmentadd(){
    // this.reload();
    this.attachmenDetails.reset();
    this.attachmentstatus = "add"
    this.attachmentModalHadding='Add New Attachment'
    this.attachmentModalButton.nativeElement.click();
  }
  attachmentSubmit(){


    if(this.attachmenDetails.valid){
      this.attachmentSubmitted = false;
      let attachment = new FormData();
      attachment.append('attachmeid_id',this.attachmenDetails.get('attachmeid_id').value);
      attachment.append('attachmentimage',this.filecontent);
      attachment.append('attachmentimagename',this.attachmentimageName);
      attachment.append('attachmentstatus',this.attachmenDetails.get('attachmentstatus').value);
      attachment.append('fileuploads',this.fileuploads);
      attachment.append('Customer_id',this.EnquiryIds);
      attachment.append('USERID',this.jwttoken.USERID);
      attachment.append('COMPANYID',this.jwttoken.COMPANYID);
      attachment.append('attachment_type', 'CustomerEnquiry');
      
      this.ProjectService.addattachment(attachment).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
        if(Response) {
            Swal.fire({
                icon:'success',
                title:'Success!',
                text:Response.MESSAGE,
                showConfirmButton:false,
                timer:2000
            });
            this.attachmenDetails.reset();
            this.reload();
            this.attachmentclosebutton.nativeElement.click();
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
        this.attachmentSubmitted = true;
        Swal.fire({
            icon:'error',
            title:'Required fields empty',
            text:'Please enter the mandatory fields',
            showConfirmButton:false,
            timer:3000
        });
    }
  }

  attachmentdatatabl() {
    this.attachmentDatatableParameter.Customer_id = this.EnquiryIds;
    const that = this;
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain'});
    this.dtOptions2 = {
      processing: true,
      serverSide: true,
      dom: 'lrtip',
      lengthMenu:[[5, 10, 25, 50], [5, 10, 25, 50]],
      // columnDefs: [
      //     { orderable: false, targets: 9 }
      // ],
      ajax: (dataTablesParameters: any, callback) => {
        Object.assign(dataTablesParameters, this.attachmentDatatableParameter);
        that.http.post<DataTablesResponse>(environment.APIEndpoint+'CrmEnquiryDetails.fetch_Attachment&reload=1',Object.assign(dataTablesParameters,this.attachmentDatatableParameter), {responseType: 'json', headers}).pipe(takeUntil(this.destroy$)).subscribe(resp =>{
            that.attachmentdata=resp.data;
           
            callback({recordsTotal: resp.recordsTotal,recordsFiltered: resp.recordsTotal,data: []});
        });
      }
    };
  }
  AttachmentImage(files: FileList, event) {
    this.labelImport.nativeElement.innerText = Array.from(files)
    .map(f => f.name)
    .join(', ');
    this.filecontent = event.target.files[0];
    this.attachmentimageName = this.filecontent.name;
    this.fileuploads="changeed";
    this.reload();
  }
  reload()
  {
    
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }
  editAttachment(attachmeid_id){
    this.hrservice.attachmentsdata(attachmeid_id).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
        this.attachmenDetails.patchValue({
            attachmeid_id:Response.DATA[0][0],
            // attachmentimage : Response.DATA[0][3],
            // attachmentimageName : Response.DATA[0][2]
        });
        this.filecontent = Response.DATA[0][3],
        this.attachmentimageName =  Response.DATA[0][2],
        this.labelImport.nativeElement.innerText = Response.DATA[0][2]
        if(Response.DATA[0][5] == 1){
            status = "Enable"
        }else{
            status = "Disable"
        }
        this.attachmenDetails.controls.attachmentstatus.setValue(status)
    });

    this.attachmentstatus = "Update"
    this.attachmentModalHadding='Edit Attachment'
    this.attachmentModalButton.nativeElement.click();
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

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  Deleteattachment(id){
	let removeEnquiryData = new FormData();
	removeEnquiryData.append('attachment_id',id);
	Swal.fire({
		title: 'Are you sure?',
		text: 'You want to delete this.',
		icon: 'warning',
		showCancelButton: true,
		confirmButtonText: 'Yes',
		cancelButtonText: 'No'
	}).then((result) => {
		if (result.value) {
			this.CrmService.deleteEnquiryattachment(removeEnquiryData).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
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

  isFieldValid(field: string) {
		return !this.form.get(field).valid && this.form.get(field).touched;
	}

	displayFieldCss(field: string) {
		return {
		'has-error': this.isFieldValid(field),
		'has-feedback': this.isFieldValid(field)
		};
	}


}
