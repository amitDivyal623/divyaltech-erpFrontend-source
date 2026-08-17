import { Component, OnInit, ViewChild,ElementRef,TemplateRef, ChangeDetectorRef, OnDestroy,Injectable } from '@angular/core';
import { from, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {Router,ActivatedRoute} from '@angular/router';
import { ProjectService} from '../../../services/project.service';
import { HrService } from 'src/app/services/hr.service';
import { FormControl, FormControlName, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { HttpClient ,HttpHeaders, HttpResponse } from '@angular/common/http';
import { StringLiteralLike } from 'typescript';
import { DataTableDirective } from 'angular-datatables';
import { DatePipe } from '@angular/common';
import { environment } from 'src/environments/environment';
import { NgbCalendar, NgbDateAdapter, NgbDate, NgbDateParserFormatter, NgbDateStruct, NgbInputDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import {NgxSpinnerService} from 'ngx-spinner';

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
@Component({
	selector: 'app-attachment-details',
	templateUrl: './attachment-details.component.html',
	styleUrls: ['./attachment-details.component.css']
})
export class AttachmentDetailsComponent implements OnInit, OnDestroy {

	private destroy$ = new Subject<void>();
	[x: string]: any;
    dtOptions: DataTables.Settings = {};
    dtTrigger: Subject<any> = new Subject<any>();
    @ViewChild(DataTableDirective) dtElement: DataTableDirective;
    @ViewChild('attachmentclosebutton') attachmentclosebutton;
    @ViewChild('labelImport')labelImport: ElementRef;
    @ViewChild('attachmentModalButton')attachmentModalButton: ElementRef;

	constructor(private router:Router,private http:HttpClient,private ProjectService:ProjectService,private hrservice:HrService,private chRef : ChangeDetectorRef,private activatedRoute: ActivatedRoute,private datePipe: DatePipe,private spinner: NgxSpinnerService) { 
        if(sessionStorage.getItem('token')==undefined && sessionStorage.getItem('UserName')==undefined){
            this.router.navigate(['/']);
        }
        
     }
	attachmenDetails = new FormGroup({
        // notesDate:new FormControl('',Validators.required),
        attachmentstatus:new FormControl(''),
        attachmentimage:new FormControl('',Validators.required),
        attachmeid_id:new FormControl('')
    });
	attachmentDatatableParameter = {project_id : ''};
    attachmentdata:attachmentmangment[];
	ngOnInit(): void {
		this.projectId = this.activatedRoute.snapshot.paramMap.get('id');
		this.attachmentdatatabl();
        this.role = sessionStorage.getItem('UserRole');
		//this.contractorlist();
	}
  	attachmentdatatabl() {
		this.attachmentDatatableParameter.project_id = this.projectId;
		const that = this;
		const headers = new HttpHeaders({ 'Content-Type': 'text/plain'});
		this.dtOptions = {
			processing: true,
			serverSide: true,
			dom: 'lrtip',
			lengthMenu:[[5, 10, 25, 50], [5, 10, 25, 50]],
			// columnDefs: [
			//     { orderable: false, targets: 9 }
			// ],
			ajax: (dataTablesParameters: any, callback) => {
				Object.assign(dataTablesParameters, this.attachmentDatatableParameter);
				that.http.post<DataTablesResponse>(environment.APIEndpoint+'project.fetch_Attachment&reload=1',Object.assign(dataTablesParameters,this.attachmentDatatableParameter), {responseType: 'json', headers}).pipe(takeUntil(this.destroy$)).subscribe(resp =>{
					that.attachmentdata=resp.data;
					callback({recordsTotal: resp.recordsTotal,recordsFiltered: resp.recordsTotal,data: []});
				});
			}
		}; 
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

    viewAttchement(path,type){
        window.open(environment.APIEndpoint+'project.download&path='+path+'&type='+type+'&token='+sessionStorage.getItem('token')+'&reload=1', "_blank");
    }
    reload() {
        this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.ajax.reload();
        });
    }
    ngAfterViewInit(): void {
        this.dtTrigger.next();
    }
	AttachmentImage(files: FileList, event) {
        this.labelImport.nativeElement.innerText = Array.from(files)
        .map(f => f.name)
        .join(', ');
        this.filecontent = event.target.files[0];
        this.attachmentimageName = this.filecontent.name; 
        this.fileuploads="changeed";      
    }
	Deleteattachment(id){
        Swal.fire({
            title: 'Are you sure?',
            text: 'You want to delete this.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.value) {
                this.ProjectService.deleteattachment(id).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
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
                            text:'Employee Delete Failed',
                            showConfirmButton:false,
                            timer:3000
                        });
                    }
                });
            } 
        });
    }
	editAttachment(attachmeid_id){
        this.hrservice.attachmentsdata(attachmeid_id).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
            this.attachmenDetails.patchValue({
                attachmeid_id:Response.DATA[0][0],
                //attachmentimage : Response.DATA[0][3],
                //attachmentimageName : Response.DATA[0][2]
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
	attachmentSubmit(){
        if(this.attachmenDetails.valid){
            this.attachmentSubmitted = false;
            let attachment = new FormData();
            attachment.append('attachmeid_id',this.attachmenDetails.get('attachmeid_id').value);            
            attachment.append('attachmentimage',this.filecontent);
            attachment.append('attachmentimagename',this.attachmentimageName);
            attachment.append('attachmentstatus',this.attachmenDetails.get('attachmentstatus').value);
            attachment.append('fileuploads',this.fileuploads);
            attachment.append('Project_Id',this.projectId);
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
	Newattachmentadd(){
        this.attachmentModalHadding='Add New Attachment'
        this.attachmentModalButton.nativeElement.click();
    }
}
