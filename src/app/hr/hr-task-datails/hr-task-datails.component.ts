import { Component, OnInit, OnDestroy } from '@angular/core';
import { ElementRef, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';
import { HrService } from '../../services/hr.service'
import {FormControl, FormGroup, Validators} from '@angular/forms';
import { Router ,ActivatedRoute  } from '@angular/router';
import { from, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DatePipe } from '@angular/common'
import * as $ from 'jquery';

@Component({
  selector: 'app-hr-task-datails',
  templateUrl: './hr-task-datails.component.html',
  styleUrls: ['./hr-task-datails.component.css']
})
export class HrTaskDatailsComponent implements OnInit, OnDestroy {

    @ViewChild('swiper') swiper: ElementRef;
    @ViewChild('title') title: ElementRef;
    respStatus =[];
    private destroy$ = new Subject<void>();

    constructor(private router:Router, private hrservice:HrService,private route: ActivatedRoute,private datePipe: DatePipe ) {
        if(sessionStorage.getItem('token')==undefined && sessionStorage.getItem('UserName')==undefined){
            this.router.navigate(['/']);
        }
    }
    UserId: string;
    taskTitle='Task Title';
    hideTitle:boolean;
    task_status=new FormGroup({
        status :new FormControl('')
    });
    [x: string]: any;
    taskDetails = new FormGroup({
        description:new FormControl('',Validators.required),
        comment : new FormControl('',Validators.required),
        swiper : new FormControl('',Validators.required),
        title: new FormControl('',Validators.required),
    });
    task_Assignee= new FormGroup({
        TaskAssigne:new FormControl('',Validators.required)
    });
    ngOnInit(): void {
		this.lookupdatalist();
		this.employeetypenamelis();
        setTimeout(()=>{ 
            $('.showeditButton').hide();
        }, 1000);
        this.commentData();
    }
    commentData(){
        setTimeout(()=>{ 
            $('.showeditButton').hide();
        }, 1000);
        this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
            var id = params.get('id');
            this.hrservice.getTaskDetails(id).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
                this.taskBriefDetails = Response.DATA;
                this.hideTitle = true;
                this.showSave = false;
                this.writeAccess =true;
                this.Access = true;
                this.editBtn =true;
                this.AccessAssigne =true;
                this.taskDetails.controls['title'].setValue(this.taskBriefDetails[0][2]);
                this.taskDetails.controls['description'].setValue(this.taskBriefDetails[0][3]);
                this.task_status.controls['status'].setValue(this.taskBriefDetails[0][8]);
                this.task_Assignee.controls['TaskAssigne'].setValue(this.taskBriefDetails[0][5]);
                this.assigne = this.taskBriefDetails[0][15];
                this.reporter = this.taskBriefDetails[0][16];
                //this.taskDate = this.datePipe.transform(this.taskBriefDetails[0][4],"dd-MM-yyyy");
                this.taskDate = this.taskBriefDetails[0][4];
                this.taskId = this.taskBriefDetails[0][1];
                //this.task_status.controls.status.setValue(statusValue);
                this.task_status.controls['status'].disable();
                this.taskDetails.controls['comment'].setValue(' ');
                if(params.get('method') == 'view'){
                    this.taskDetails.disable();
                    this.task_status.disable();
                    this.editable = false;
                }else{
                    this.editable = true;
                }
            })
        })
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

    lookupdatalist(){
        let lookupStatus = "Status";
        let Statusdata = new FormData();
        Statusdata.append('lookupname',lookupStatus);
        this.hrservice.fetch_lookupdata(Statusdata).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
          this.respStatus = Response.data
        });
    }

    editTaskTitle(){
        this.Access=false;
        
    }
	editTaskAssigne(){
		if(sessionStorage.getItem('UserRole') == 'Admin' || sessionStorage.getItem('UserRole') == 'HR Admin' || sessionStorage.getItem('UserRole') == 'CRM Admin'){
            this.AccessAssigne = false;
        }
	}
    hideTaskTitleSave(){
        this.Access = true;
    }
    hideTaskAssgine(){
        this.AccessAssigne = true;
    }

    saveTaskTitle(taskID){
        if(this.taskDetails.controls['title'].valid){
            this.hrservice.updateTitle(this.taskDetails.controls['title'].value,taskID).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
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

    showCommentEdit(e){
        this.writeAccess = true;
        this.length = e.target.id.split("_")
        $('#showCommentSave_'+this.length[1]).show();
        $('.showeditButton').hide();
    }
    displaySave(){
        this.showSave = true;
        this.writeAccess = false;
    }
    saveMsg(taskID){
        if(this.taskDetails.controls['description'].valid){
            this.hrservice.updateDescription(this.taskDetails.controls['description'].value,taskID).pipe(takeUntil(this.destroy$)).subscribe(Response =>{this.resp =Response,this.hideSave()
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
        
        }
    }

    addComment(taskId){      
        if(this.taskDetails.controls['comment'].valid && this.taskDetails.controls['comment'].value != ' '){
            this.hrservice.addTaskComment(taskId,this.taskDetails.controls['comment'].value).pipe(takeUntil(this.destroy$)).subscribe(Response =>{this.resp=Response,
                this.commentData();
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
    commentSave(commentID){
        this.comments = $('#'+commentID).val();
        if(this.swiper.nativeElement.value != ''){
            this.hrservice.updateTaskComment(this.comments,commentID).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
                this.resp = Response,
                this.commentData()
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
    hideSave(){
        this.showSave=false;
        this.writeAccess = true;
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

	employeetypenamelis(){
		let employeelist = new FormData();
		this.hrservice.getEmployee(employeelist).pipe(takeUntil(this.destroy$)).subscribe(resp =>{
			this.employee = resp.data;
		});
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}
}
