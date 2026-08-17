import { Component, OnInit, OnDestroy } from '@angular/core';
import { ElementRef, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';
import { CrmService } from '../../services/crm.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import { Router ,ActivatedRoute  } from '@angular/router';
import { from, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { HrService } from 'src/app/services/hr.service';

@Component({
    selector: 'app-crm-task-details',
    templateUrl: './crm-task-details.component.html',
    styleUrls: ['./crm-task-details.component.css']
})
export class CrmTaskDetailsComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    @ViewChild('swiper') swiper: ElementRef;
    @ViewChild('title') title: ElementRef;
    respStatus =[];

	constructor( private hrservice:HrService,private crmservice:CrmService,private route: ActivatedRoute,private router:Router,private datePipe: DatePipe ) { 
		if(sessionStorage.getItem('token')==undefined && sessionStorage.getItem('UserName')==undefined){
			this.router.navigate(['/']);
		}
	}
	[x: string]: any;
	UserId: string;
	taskTitle='Task Title';
	hideTitle:boolean;

	task_status=new FormGroup({
		status:new FormControl('')
	});

	taskActionFrom=new FormGroup({
		taskAction:new FormControl('')
	});

	taskDetails= new FormGroup({
		description:new FormControl('',Validators.required),
		comment : new FormControl('',Validators.required),
		swiper : new FormControl('',Validators.required),
		title: new FormControl('',Validators.required),
		follwoupDetails: new FormControl('',Validators.required),
	});
 
	ngOnInit(): void {
		this.lookupdatalist();
		this.getTaskActionlist();
		this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
		var id = params.get('id');
		this.crmservice.getTaskDetails(id).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
			this.taskBriefDetails = Response.DATA;
			this.hideTitle = true;
			this.showSave = false;
			this.showSave1 = false;
			this.writeAccess =true;
			this.Access = true;
			this.editBtn =true;
			this.AccessAssigne = true;
			this.taskDetails.controls['title'].setValue(this.taskBriefDetails[0][2]);
			this.taskDetails.controls['description'].setValue(this.taskBriefDetails[0][3]);
			this.task_status.controls['status'].setValue(this.taskBriefDetails[0][8]);
			this.taskActionFrom.controls['taskAction'].setValue(this.taskBriefDetails[0][20]);
			this.assigne = this.taskBriefDetails[0][15];
			this.reporter = this.taskBriefDetails[0][16];
			this.taskDetails.patchValue({follwoupDetails: this.taskBriefDetails[0][21]});
			// this.taskDate = this.datePipe.transform(this.taskBriefDetails[0][4],"dd-MM-yyyy");
			this.taskDate = this.taskBriefDetails[0][4];
			this.taskId = this.taskBriefDetails[0][1];
			//this.task_status.controls.status.setValue(statusValue);
			// this.task_status.controls['status'].disable();
			// this.taskDetails.controls['comment'].setValue(' ');
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

	saveTaskAssgine(taskID){
		if (this.taskActionFrom.controls['taskAction'].valid) {
			let taskAssigne = new FormData();
			taskAssigne.append('taskAction',this.taskActionFrom.controls['taskAction'].value);
			taskAssigne.append('taskId',taskID);
			this.hrservice.updatetaskaction(taskAssigne).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
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

	hideTaskAssgine(){
        this.AccessAssigne = true;
    }

	editTaskAssigne(){
		if(sessionStorage.getItem('UserRole') == 'Admin' || sessionStorage.getItem('UserRole') == 'HR Admin' || sessionStorage.getItem('UserRole') == 'CRM Admin'){
            this.AccessAssigne = false;
        }
	}

	getTaskActionlist(){
		let lookupStatus = "TaskAction";
		let Statusdata = new FormData();
		Statusdata.append('lookupname',lookupStatus);
		this.crmservice.fetch_lookupdata(Statusdata).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
		  this.taskAction = Response.data
		  
		});
	  }

	showCommentSave(e){
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
		this.crmservice.fetch_lookupdata(Statusdata).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
		this.respStatus = Response.data
		});
	}

	editTaskTitle(){
		this.Access=false;
	}
	hideTaskTitleSave(){
		this.Access=true;
	}

	saveTaskTitle(taskID){
		if(this.taskDetails.controls['title'].valid){
			this.crmservice.updateTitle(this.taskDetails.controls['title'].value,taskID).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
				this.resp =Response,
				this.Access=true;
			});
			Swal.fire({
				//position: 'top',
				title:'Success',
				icon:'success',
				text: 'Task title updated successfully!',
				showConfirmButton: false,
				timer: 3000,
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

	displaySave1(){
		
		this.showSave1 = true;
	}
	saveMsg(taskId){
		if(this.taskDetails.controls['description'].valid){
		this.crmservice.updateDescription(this.taskDetails.controls['description'].value,taskId).pipe(takeUntil(this.destroy$)).subscribe(Response =>{this.resp =Response,this.hideSave()});
		Swal.fire({
			//position: 'top',
			title:'Success',
			icon:'success',
			text: 'Description saved successfully!',
			showConfirmButton: false,
			timer: 3000,
		});
		}
	}

	saveMsg1(taskId){
		if(this.taskDetails.controls['follwoupDetails'].valid){
		this.crmservice.updatefollowup(this.taskDetails.controls['follwoupDetails'].value,taskId).pipe(takeUntil(this.destroy$)).subscribe(Response =>{this.resp =Response,this.hideSave()});
		Swal.fire({
			//position: 'top',
			title:'Success',
			icon:'success',
			text: 'Followup Details saved successfully!',
			showConfirmButton: false,
			timer: 3000,
		});
		this.showSave1 = false;
		}
	}

	addComment(taskId){      
		if(this.taskDetails.controls['comment'].valid && this.taskDetails.controls['comment'].value != ' '){
		this.crmservice.addTaskComment(taskId,this.taskDetails.controls['comment'].value).pipe(takeUntil(this.destroy$)).subscribe(Response =>
			{this.resp=Response,
			this.ngOnInit();
		});
		Swal.fire({
			//position: 'top',
			icon:'success',
			title:'Success',
			text: 'Comment saved successfully!',
			showConfirmButton: false,
			timer: 3000,
		});  
		}
	}

	commentSave(commentID){
		if(this.swiper.nativeElement.value != ''){
		this.crmservice.updateTaskComment(this.swiper.nativeElement.value,commentID).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
			this.resp = Response,
			this.ngOnInit()
		});
			Swal.fire({
				//position: 'top',
				icon:'success',
				title:'Success',
				text: 'Comment saved successfully!',
				showConfirmButton: false,
				timer: 3000,
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
		this.crmservice.updateTaskStatus(taskStatus,taskId).pipe(takeUntil(this.destroy$)).subscribe(Response =>{this.resp = Response});
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

	hideSave1(){
		this.showSave1 =false;
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}
}
