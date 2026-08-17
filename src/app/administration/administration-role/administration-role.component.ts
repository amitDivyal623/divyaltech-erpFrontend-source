import { NgbCalendar, NgbDateAdapter, NgbDate, NgbDateParserFormatter, NgbDateStruct, NgbInputDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnInit, ViewChild, ChangeDetectorRef, TemplateRef, Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CompanyService } from '../../services/company.service';
import { DataTableDirective } from 'angular-datatables';
import { Router } from '@angular/router';
import { from, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
class RoleInfo {

  CompanyId : string;
	RoleId : string;
	Role : string;
	Status : string;
	CreatedBy : string;
	CreatedDt : string;

}

class DataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}

@Component({
  selector: 'app-administration-role',
  templateUrl: './administration-role.component.html',
  styleUrls: ['./administration-role.component.css']
})
export class AdministrationRoleComponent implements OnInit,OnDestroy {

  isButtonDisabled: boolean = false;
  isReadOnly: boolean;
	[x: string]: any;
	dtOptions: DataTables.Settings = {};
 	dtTrigger: Subject<any> = new Subject<any>();
 	private destroy$ = new Subject<void>();

  	@ViewChild(DataTableDirective) dtElement: DataTableDirective;
	@ViewChild('closebutton') closebutton;
	@ViewChild('userrolemodal') userrolemodal;

	data: RoleInfo[];

	DatatableParameter = { Role: ''};


	addroleform = new FormGroup({
		userRole : new FormControl('',Validators.required),
    status: new FormControl(''),
    CompanyName : new FormControl('',Validators.required),
		RoleId : new FormControl('',)
	});

	filterroleform = new FormGroup({
		user_role : new FormControl('')
	});

	constructor(private companyService:CompanyService,public http:HttpClient,private chRef : ChangeDetectorRef) { }

  ngOnInit(): void {
		this.datatableCode();
    this.CompanyInfo();
    this.getuserdetails();

	}

	datatableCode() {
	    this.DatatableParameter.Role = this.filterroleform.get('user_role').value;
	    const that = this;
	    const headers = new HttpHeaders({ 'Content-Type': 'text/plain'});
	    this.dtOptions = {
	      processing: true,
	      serverSide: true,
	      dom: 'lrtip',
	      lengthMenu:[[5, 10, 25, 50], [5, 10, 25, 50]],
	      columnDefs: [
	        { orderable: false, targets: -1 }
	      ],
	      ajax: (dataTablesParameters: any, callback) => {
	        Object.assign(dataTablesParameters, this.DatatableParameter);
	        that.http.post<DataTablesResponse>(environment.APIEndpoint+'user_role.getUserRoleData&reload=1',Object.assign(dataTablesParameters,this.DatatableParameter), {responseType: 'json', headers}).pipe(takeUntil(this.destroy$)).subscribe(resp =>{
	          that.data=resp.data;
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

	private modalaction;

	public closeModal(){
		this.closebutton.nativeElement.click();
	}

	public rolemodalshow(){
	    this.userrolemodal.nativeElement.click();
	}

	searchuserrole(){
	  	this.datatableCode();
	    this.rerender();
	}

	openuserrolemodal(){
		this.save_btn = true;
    //this.addroleform.reset();
    this.addroleform.controls['userRole'].setValue('');
    this.addroleform.controls['status'].setValue('');
    this.addroleform.controls['CompanyName'].setValue(this.CompanyId);
    this.UserRole = sessionStorage.getItem("UserRole");
    this.UserRoleA = this.UserRole.split(',');
    this.isAdmin = this.UserRoleA.includes('Admin');
    this.isAdministrator = this.UserRoleA.includes('Administrator');
    if (this.isAdministrator) {
      this.addroleform.controls['CompanyName'].enable();
    } else {
      this.addroleform.controls['CompanyName'].disable();
    }
		if (this.modalaction == 'add') {
	    	$('#modaltextheader').text('Add User Role');
	    	this.addroleform.enable();
	    	this.isButtonDisabled = false;
	    }else if (this.modalaction == 'edit') {
	    	$('#modaltextheader').text('Edit User Role');
	    	this.addroleform.enable();
	    	this.isButtonDisabled = false;
	    }else if (this.modalaction == 'view') {
	    	$('#modaltextheader').text('View User Role');
	    	this.addroleform.disable();
	    	this.isButtonDisabled = true;
	    }
	}

	rolemodalbackdropbtn(){
		this.modalaction = 'add'
	}

	view(RoleId){
		let getRoleId = new FormData();
	    getRoleId.append('RoleId',RoleId);
	    this.companyService.ViewUserRole(getRoleId).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
	      	if(Response.data.length) {
	        	this.addroleform.patchValue({
	         		userRole : Response.data[0].Role,
					status : Response.data[0].Status,
					RoleId : Response.data[0].RoleId,
					CompanyName : Response.data[0].CompanyId
	        	});
	      	}
	    });
	    this.modalaction = 'view'
	    this.isButtonDisabled = true;
	    this.addroleform.disable();
	    this.rolemodalshow();
	}
	edit(RoleId){
		let getRoleId = new FormData();
	    getRoleId.append('RoleId',RoleId);
	    this.companyService.ViewUserRole(getRoleId).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
	      	if(Response.data.length) {
		        this.addroleform.patchValue({
		         	userRole : Response.data[0].Role,
					status : Response.data[0].Status,
					RoleId : Response.data[0].RoleId,
					CompanyName : Response.data[0].CompanyId
		        });
	      	}
	    });
	    this.modalaction = 'edit'
	    this.isButtonDisabled = false;
	    this.addroleform.enable();
	    this.rolemodalshow();
	}

	AddRole(){
		this.save_btn = true;
	    if(this.addroleform.valid){
			this.save_btn = false;
	    	let RoleData = new FormData();
	    	RoleData.append('userRole',this.addroleform.get('userRole').value);
	    	RoleData.append('status',this.addroleform.get('status').value);
	    	RoleData.append('CompanyId',this.addroleform.get('CompanyName').value);
	    	RoleData.append('RoleId',this.addroleform.get('RoleId').value);
	      	this.companyService.adduserRole(RoleData).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
		        if (Response.CODE == 200) {
		        	Swal.fire({
			            icon:'success',
			            title:'Success!',
			            text:Response.MESSAGE,
			            showConfirmButton:false,
			            timer:2000
		        	});
              this.reload();
              this.addroleformreset();
		        	//this.addroleform.reset();
		        	this.closeModal();
		        }else{
		        	Swal.fire({
		        		icon:'error',
		        		showConfirmButton:false,
		        		timer:3000
		        	});
		        }
	      	});
	    }else{
			this.save_btn = true;
      		Swal.fire({
	        	icon:'error',
	        	title:'Field required!',
	        	showConfirmButton:false,
	        	timer:3000
      		});
	    }
  	}

  	rerender():void {
    	this.dtElement.dtInstance.then((dtInstance : DataTables.Api) => {
			// Destroy the table first in the current context
			dtInstance.destroy();
			// Call the dtTrigger to rerender again
			this.dtTrigger.next();
    	});
  	}
  	reload(){
	    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
	    	dtInstance.ajax.reload();
	    });
  }
  getuserdetails() {
    this.username = sessionStorage.getItem('UserName');
    let userdata = new FormData();
    userdata.append('UserName',this.username);
    this.companyService.getUserdetail(userdata).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.CompanyId = resp.data[0].CompanyId;
		});
  }
	CompanyInfo(){
		let RoleData = new FormData();
		this.companyService.companyList(RoleData).pipe(takeUntil(this.destroy$)).subscribe(resp =>{
      this.companyDataList = resp.data;
		});
  }
  addroleformreset() {
    this.addroleform.controls['userRole'].setValue('');
    this.addroleform.controls['status'].setValue('');
  }
}
