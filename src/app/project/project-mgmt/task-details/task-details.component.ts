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

declare var $;

class taskmangment{
    Date: string;
    Details: string;
}
class DataTablesResponse {
    data: any[];
    draw: number;
    recordsFiltered: number;
    recordsTotal: number;
}

@Component({
	selector: 'app-task-details',
	templateUrl: './task-details.component.html',
	styleUrls: ['./task-details.component.css']
})
export class TaskDetailsComponent implements OnInit, OnDestroy {
    minDate = {year: 1900, month: 1, day: 1};
	maxDate = {year: 2099, month: 12, day: 31};

	[x: string]: any;
    dtOptions: DataTables.Settings = {};
    dtTrigger: Subject<any> = new Subject<any>();
    private destroy$ = new Subject<void>();
    @ViewChild('title') title: ElementRef;
    @ViewChild(DataTableDirective) dtElement: DataTableDirective;
    @ViewChild('taskclose') taskclose;
    @ViewChild('taskModalButton')taskModalButton: ElementRef;
    @ViewChild('taskEditModel')taskEditModel: ElementRef;
    @ViewChild('swiper') swiper: ElementRef;


    taskDetails = new FormGroup({
        task_title:new FormControl(''),
        task_date:new FormControl(''),
        taskstatus:new FormControl(''),
        assigneeBy:new FormControl(''),
        assigneeTo:new FormControl(''),
        task_description:new FormControl(''),
        task_id:new FormControl(''),
        comment : new FormControl(''),
        swiper : new FormControl(''),
        enquiry_mode:new FormControl(''),
        enquiry_cust:new FormControl(''),
    });

    task_status=new FormGroup({
        status :new FormControl('')
    });

    task_Assignee= new FormGroup({
        TaskAssigne:new FormControl('',Validators.required)
    });
    taskDatatableParameter = { project_id : ''};
	taskdata:taskmangment[];
	constructor(private router:Router,private http:HttpClient,private ProjectService:ProjectService,private hrservice:HrService,private chRef : ChangeDetectorRef,private activatedRoute: ActivatedRoute,private datePipe: DatePipe,private spinner: NgxSpinnerService) { 
        if(sessionStorage.getItem('token')==undefined && sessionStorage.getItem('UserName')==undefined){
            this.router.navigate(['/']);
        }
        
     }
	ngOnInit(): void {
		this.projectId = this.activatedRoute.snapshot.paramMap.get('id');
		this.lookuplist();
		this.employeetypenamelis();
		this.tasksdatatabl();
        this.Access = true;
        this.showSave = false;
        this.writeAccess =true;
        this.lookupdatalist();
        this.role = sessionStorage.getItem('UserRole');
	}
	tasksdatatabl() {
        this.taskDatatableParameter.project_id = this.projectId;
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
                Object.assign(dataTablesParameters, this.taskDatatableParameter);
                that.http.post<DataTablesResponse>(environment.APIEndpoint+'project.fetch_task&reload=1',Object.assign(dataTablesParameters,this.taskDatatableParameter), {responseType: 'json', headers}).pipe(takeUntil(this.destroy$)).subscribe(resp =>{
                    that.taskdata=resp.data;
                    callback({recordsTotal: resp.recordsTotal,recordsFiltered: resp.recordsTotal,data: []});
                });
            }
        }; 
    }

    editTaskAssigne(){
		if(sessionStorage.getItem('UserRole') == 'Admin' || sessionStorage.getItem('UserRole') == 'HR Admin' || sessionStorage.getItem('UserRole') == 'CRM Admin'){
            this.AccessAssigne = false;
        }
	}


    showConfirmation(editable){
        if(this.task_status.controls['status'].disabled && editable == true){
        Swal.fire({
            icon:'info',
            text: 'Do you want to change the task status?',
        // showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: `Yes`,
            //denyButtonText: `No`,
            }).then((result) => {
                /* Read more about isConfirmed, isDenied below */
                if (result.isConfirmed) {
                this.task_status.controls['status'].enable();
                }
            });
        }
    }

    lookupdatalist(){
        let lookupStatus = "Status";
        let Statusdata = new FormData();
        Statusdata.append('lookupname',lookupStatus);
        this.hrservice.fetch_lookupdata(Statusdata).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
          this.respStatus = Response.data
        });
    }

    showMsg(taskId){
        if(this.task_status.controls['status'].value != ''){
            let taskStatus = this.task_status.controls['status'].value;
            this.hrservice.updateTaskStatus(taskStatus,taskId).pipe(takeUntil(this.destroy$)).subscribe(Response =>{this.resp = Response});
            Swal.fire({
                //position: 'top',
                icon:'success',
                title:'Success',
                text: 'Status changed successfully!',
                showConfirmButton: false,
                timer: 3000,
            });
            this.task_status.controls['status'].disable();
        }
    }

    editTaskTitle(){
        this.Access=false;
    }

    saveTaskTitle(taskID){
        if(this.taskDetails.controls['task_title'].valid){
            this.hrservice.updateTitle(this.taskDetails.controls['task_title'].value,taskID).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
                this.resp =Response,
                this.Access=true;
                if(Response.code == 200) {
                    Swal.fire({
                        icon:'success',
                        title:'Success!',
                        text:Response.massage,
                        showConfirmButton:false,
                        timer:2000
                    });
                }else{
                    Swal.fire({
                        icon:'error',
                        title:'Error!',
                        text:'Update Title Failed',
                        showConfirmButton:false,
                        timer:3000
                    });
                }
            });
            this.reload();
        }else{
            Swal.fire({
                //position: 'top',
                title:'Alert',
                icon:'info',
                text: 'Title should not be empty!',
                showConfirmButton: false,
                timer: 3000,
            });
        }
    }

    commentSave(commentID){
        this.comments = $('#'+commentID).val();
        if(this.swiper.nativeElement.value != ''){
            this.hrservice.updateTaskComment(this.comments,commentID).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
                this.resp = Response,
                this.commentData(this.taskId)
                //this.showCommentEdit()
                if(Response.code == 200) {
                    Swal.fire({
                        icon:'success',
                        title:'Success!',
                        text:Response.massage,
                        showConfirmButton:false,
                        timer:2000
                    });
                }else{
                    Swal.fire({
                        icon:'error',
                        title:'Error!',
                        text:'Comment Save Failed',
                        showConfirmButton:false,
                        timer:3000
                    });
                }
            });
            this.reload();
        }
    }

    showCommentEdit(e){
        this.writeAccess = true;
        this.length = e.target.id.split("_")
        $('#showCommentSave_'+this.length[1]).show();
        $('.showeditButton').hide();
    }

    showCommentSave(e){
        //this.swiper.nativeElement.focus();
        this.length = e.target.id.split("_")
        $('#'+e.target.id).hide();
        $('#commentBox_'+this.length[1]).focus();
        $('#showeditButton_'+this.length[1]).show();
        $('#showeditCancleButton_'+this.length[1]).show();
        this.editBtn=false;
        this.writeAccess=false;
    }

    saveMsg(taskID){
        if(this.taskDetails.controls['task_description'].valid){
            this.hrservice.updateDescription(this.taskDetails.controls['task_description'].value,taskID).pipe(takeUntil(this.destroy$)).subscribe(Response =>{this.resp =Response,this.hideSave()
                if(Response.code == 200) {
                    Swal.fire({
                        icon:'success',
                        title:'Success!',
                        text:Response.massage,
                        showConfirmButton:false,
                        timer:2000
                    });
                }else{
                    Swal.fire({
                        icon:'error',
                        title:'Error!',
                        text:'Update Description Failed',
                        showConfirmButton:false,
                        timer:3000
                    });
                }
            });
            this.reload();
        }
    }

    addComment(taskId){      
        if(this.taskDetails.controls['comment'].valid && this.taskDetails.controls['comment'].value != ' '){
            this.hrservice.addTaskComment(taskId,this.taskDetails.controls['comment'].value).pipe(takeUntil(this.destroy$)).subscribe(Response =>{this.resp=Response,
                this.commentData(taskId);
                if(Response.code == 200) {
                    Swal.fire({
                        icon:'success',
                        title:'Success!',
                        text:Response.massage,
                        showConfirmButton:false,
                        timer:2000
                    });
                }else{
                    Swal.fire({
                    icon:'error',
                    title:'Error!',
                    text:'Comment Add Failed',
                    showConfirmButton:false,
                    timer:3000
                    });
                }
            });
        }
    }

    hideSave(){
        this.showSave=false;
        this.writeAccess = true;
	}

    hideTaskTitleSave(){
        this.Access = true;
    }

    displaySave(){
        this.showSave = true;
        this.writeAccess = false;
    }

	lookuplist(){
        let lookupStatus = "Status";
        let Statusdata = new FormData();
        Statusdata.append('lookupname',lookupStatus);
        this.hrservice.fetch_lookupdata(Statusdata).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
          this.respStatus = Response.data
        });
    }
	employeetypenamelis(){
        let employee2 = new FormData();
        this.hrservice.employeelist(employee2).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
            this.Employees = Response.data
        });
    }
	taskSubmit(){
        if(this.taskDetails.valid){
            this.taskubmitted = false;
            let taskDetails = new FormData();
            taskDetails.append('task_id',this.taskDetails.get('task_id').value);
            taskDetails.append('task_title',this.taskDetails.get('task_title').value);
            taskDetails.append('taskdate',this.taskDetails.get('task_date').value);
            taskDetails.append('taskstatus',this.taskDetails.get('taskstatus').value);
            taskDetails.append('taskDetails',this.taskDetails.get('task_description').value);
            taskDetails.append('assigneeBy',this.taskDetails.get('assigneeBy').value);
            taskDetails.append('assigneeTo',this.taskDetails.get('assigneeTo').value);
            taskDetails.append('Project_Id',this.projectId);
            this.ProjectService.addtaskDetails(taskDetails).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
                if(Response) {
                    Swal.fire({
                        icon:'success',
                        title:'Success!',
                        text:Response.MESSAGE,
                        showConfirmButton:false,
                        timer:2000
                    });
                    this.reload();
                    this.taskDetails.reset();
                    this.taskclose.nativeElement.click();
                    
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
            this.taskubmitted = true;
            Swal.fire({
                icon:'error',
                title:'Required fields empty',
                text:'Please enter the mandatory fields',
                showConfirmButton:false,
                timer:3000
            });
        } 
    }
	
	Newtaskadd(){
        this.taskDetails.reset();
        this.taskDetails.get('task_title').setValue((<HTMLInputElement>document.getElementById("projectName")).value);
        this.taskModalHadding='Add New Task'
        this.taskModalButton.nativeElement.click();
    }
	TaskEdit(taskId){
        setTimeout(()=>{ 
            $('.showeditButton').hide();
        }, 1000);
        this.commentData(taskId);
        this.taskModalHadding='Edit task';
        this.taskEditModel.nativeElement.click();
    }

    commentData(taskId){
        setTimeout(()=>{ 
            $('.showeditButton').hide();
        }, 1000);
        this.hrservice.getTaskDetails(taskId).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
            this.taskBriefDetails = Response.DATA;
            this.hideTitle = true;
            this.showSave = false;
            this.writeAccess = true;
            this.Access = true;
            this.editBtn = true;
            this.AccessAssigne = true;
            this.taskDetails.controls['task_title'].setValue(this.taskBriefDetails[0][2]);
            this.taskDetails.controls['task_description'].setValue(this.taskBriefDetails[0][3]);
            this.task_status.controls['status'].setValue(this.taskBriefDetails[0][8]);
            this.task_Assignee.controls['TaskAssigne'].setValue(this.taskBriefDetails[0][5]);
            this.taskDetails.controls['assigneeTo'].setValue(Response.DATA[0][6]);
            this.assigne = this.taskBriefDetails[0][15];
            this.reporter = this.taskBriefDetails[0][16];
            //this.taskDate = this.datePipe.transform(this.taskBriefDetails[0][4],"dd-MM-yyyy");
            this.taskDate = this.taskBriefDetails[0][4];
            this.taskId = this.taskBriefDetails[0][1];
            //this.task_status.controls.status.setValue(statusValue);
            this.task_status.controls['status'].disable();
            this.taskDetails.controls['comment'].setValue(' ');
            this.editable = true;
        })
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

    saveTaskAssgine(taskID){
		if (this.task_Assignee.controls['TaskAssigne'].valid) {
			let taskAssigne = new FormData();
			taskAssigne.append('TaskAssigne',this.task_Assignee.controls['TaskAssigne'].value);
			taskAssigne.append('taskId',taskID);
			this.hrservice.updateAssignee(taskAssigne).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
				this.resp = Response;
				if(Response.code == 200) {
					Swal.fire({
						icon:'success',
						title:'Success!',
						text:Response.massage,
						showConfirmButton:false,
						timer:2000
					});
					this.AccessAssigne = true;
				}else{
					Swal.fire({
						icon:'error',
						title:'Error!',
						text:'Update Title Failed',
						showConfirmButton:false,
						timer:3000
					});
				}
			});
            this.reload();
		}else{
			Swal.fire({
				//position: 'top',
				title:'Alert',
				icon:'info',
				text: 'Title should not be empty!',
				showConfirmButton: false,
				timer: 3000,
			});
		}
	}

    hideTaskAssgine(){
        this.AccessAssigne = true;
    }

	DeleteTask(id){
        Swal.fire({
            title: 'Are you sure?',
            text: 'You want to delete this.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.value) {
                this.ProjectService.deletetask(id).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
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

}
