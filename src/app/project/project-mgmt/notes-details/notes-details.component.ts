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

class DataTablesResponse {
    data: any[];
    draw: number;
    recordsFiltered: number;
    recordsTotal: number;
}

class notesmangment {
    Date: string;
    Details: string;
}

@Component({
	selector: 'app-notes-details',
	templateUrl: './notes-details.component.html',
	styleUrls: ['./notes-details.component.css']
})
export class NotesDetailsComponent implements OnInit, OnDestroy {

	[x: string]: any;
    dtOptions: DataTables.Settings = {};
    dtTrigger: Subject<any> = new Subject<any>();
    private destroy$ = new Subject<void>();
    @ViewChild(DataTableDirective) dtElement: DataTableDirective;
    @ViewChild('notesclosebutton') notesclosebutton;
    @ViewChild('notesModalButton')notesModalButton: ElementRef;
	noteDetails = new FormGroup({
        // notesDate:new FormControl('',Validators.required),
        noteDetail:new FormControl('',Validators.required),
        notes_id:new FormControl('')
    });
	DatatableParameter = { notesType: '', project_id : ''};
	constructor(private router:Router,private http:HttpClient,private ProjectService:ProjectService,private hrservice:HrService,private chRef : ChangeDetectorRef,private activatedRoute: ActivatedRoute,private datePipe: DatePipe,private spinner: NgxSpinnerService) { 
        if(sessionStorage.getItem('token')==undefined && sessionStorage.getItem('UserName')==undefined){
            this.router.navigate(['/']);
        }
        
     }
	notesdata:notesmangment[];
	ngOnInit(): void {
		this.projectId = this.activatedRoute.snapshot.paramMap.get('id');
		this.notesdatatabl();
        this.role = sessionStorage.getItem('UserRole');
	}
	notesdatatabl() {
        this.DatatableParameter.notesType = 'Project';
        this.DatatableParameter.project_id = this.projectId;
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
                Object.assign(dataTablesParameters, this.DatatableParameter);
                that.http.post<DataTablesResponse>(environment.APIEndpoint+'project.fetch_Notes&reload=1',Object.assign(dataTablesParameters,this.DatatableParameter), {responseType: 'json', headers}).pipe(takeUntil(this.destroy$)).subscribe(resp =>{
                    that.notesdata=resp.data;
                    callback({recordsTotal: resp.recordsTotal,recordsFiltered: resp.recordsTotal,data: []});
                });
            }
        }; 
    }

	Newnotesadd(){
        this.notesModalHadding='Add New Notes'
        this.notesModalButton.nativeElement.click();
    }
	editNotes(notes_id){
        this.hrservice.notesdata(notes_id).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
            this.noteDetails.patchValue({
                noteDetail : Response.DATA[0][2],
                notes_id:Response.DATA[0][0]
            });
            
        });
        this.notesModalHadding='Edit Notes'
        this.notesModalButton.nativeElement.click();
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

	DeleteNotes(id){
        Swal.fire({
            title: 'Are you sure?',
            text: 'You want to delete this.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.value) {
                this.ProjectService.deletenotes(id).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
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
	noteSubmit(){
        if(this.noteDetails.valid){
            this.notessubmitted = false;
            let notes = new FormData();
            notes.append('notes_id',this.noteDetails.get('notes_id').value);
            notes.append('notes',this.noteDetails.get('noteDetail').value);
            notes.append('Project_Id',this.projectId);
            notes.append('NoteType','Project');
            this.ProjectService.addNotes(notes).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
                if(Response) {
                    Swal.fire({
                        icon:'success',
                        title:'Success!',
                        text:Response.MESSAGE,
                        showConfirmButton:false,
                        timer:2000
                    });
                    this.reload();
                    this.noteDetails.reset();
                    this.notesclosebutton.nativeElement.click();
                }else{
                    Swal.fire({
                        icon:'error',
                        title:'Error!',
                        text:'Nots Creation Failed',
                        showConfirmButton:false,
                        timer:3000
                    });
                }
            });
        }else{
            this.notessubmitted = true;
            Swal.fire({
                icon:'error',
                title:'Required fields empty',
                text:'Please enter the mandatory fields',
                showConfirmButton:false,
                timer:3000
            });
        }
    }
}
