import { NgbCalendar, NgbDateAdapter, NgbDate, NgbDateParserFormatter, NgbDateStruct, NgbInputDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnInit, ViewChild, ChangeDetectorRef, TemplateRef, Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { CompanyService } from '../../services/company.service';
import { DataTableDirective } from 'angular-datatables';
import { HrService } from 'src/app/services/hr.service';
import { Router } from '@angular/router';
import { from, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
import { ConfirmedValidator } from './confirmed.validator';
declare var $;
class UserInfo {

	CompanyId: string;
	UserId: string;
	UserFirName: string;
	UserLastName: string;
	UserName: string;
	EmailId: string;
	PhoneNum: string;
	Password1: string;
	Password2: string;
	RoleId: string;
	Status: string;
	CreatedBy: string;
	CreatedDt: string;
}

class DataTablesResponse {
	data: any[];
	draw: number;
	recordsFiltered: number;
	recordsTotal: number;
}

@Component({
	selector: 'app-administration-users',
	templateUrl: './administration-users.component.html',
	styleUrls: ['./administration-users.component.css']
})
export class AdministrationUsersComponent implements OnInit, OnDestroy {

	userCompanyId;
	actualpass: boolean;
	data: UserInfo[];
	[x: string]: any;
	selected: any = [];
	dtOptions: DataTables.Settings = {};
	dtTrigger: Subject<any> = new Subject<any>();
	private destroy$ = new Subject<void>();
	EmpId: string = "";
	Fname: string = "";
	Lname: string = "";
	@ViewChild(DataTableDirective) dtElement: DataTableDirective;
	@ViewChild('closebutton') closebutton;
	@ViewChild('cancelbtn') cancelbtn;
	@ViewChild('UserLoginModal') UserLoginModal;
	filteruserform = new FormGroup({
		filterusername: new FormControl('', Validators.required),
		filteruseremailid: new FormControl('', Validators.required)
	});
	adduserform: FormGroup;
	DatatableParameter = { username: '', useremailid: '', company_id: '' };
	RoleIddata = [];
	RoleId_data = [];
	employeedata = [];
	employeedataList = [];
	userRolecategories = [];
	userRolecategories1 = [];
	userRolecategories2 = [];
	UserRole_Id = [];
	temp = [];
	keyword = 'name';
	constructor(private formBuilder: FormBuilder, private hrservice: HrService, private route: Router, private companyService: CompanyService, public http: HttpClient, private chRef: ChangeDetectorRef) {
		this.adduserform = this.formBuilder.group({
			firstname: ['', Validators.required],
			username: ['', Validators.required],
			userrole: ['', Validators.required],
			useremailid: ['', [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]],
			userpassword: ['', [Validators.required, Validators.minLength(6)]],
			cnfrmuserpassword: ['', Validators.required],
			Company: ['', Validators.required],
			usercontactno: ['', [Validators.required, Validators.maxLength(10), Validators.pattern(/^[0-9]\d*$/), Validators.minLength(10)]],
			userId: [''],
			Overtime: ['']
		}, {
			validator: ConfirmedValidator('userpassword', 'cnfrmuserpassword')
		});
	}

	ngOnInit(): void {
		this.getuserdetails();
		this.datatableCode();
		this.employeetypenamelist();
		// this.getuserdetailsbyCompanyId(this.UserCompanyId);
		let companyData = new FormData();
		this.companyService.getCompany(companyData).pipe(takeUntil(this.destroy$)).subscribe(resp => {

			this.company = resp.DATA;
		});


	}
	private myValue;

	addlogin() {
		this.selected = [];
		this.adduserform.get("userpassword").setValidators([Validators.required]);
		this.adduserform.get("cnfrmuserpassword").setValidators([Validators.required]);
		this.heading = "Add New User";
		this.adduserform.enable();
		this.isButtonDisabled = false;
		// this.viewedit = true;
		this.activeClass = '';
		this.UserLoginModal.nativeElement.click();
		this.adduserform.reset();
		this.UserRole = sessionStorage.getItem("UserRole");
		this.UserRoleA = this.UserRole.split(',');
		this.isAdmin = this.UserRoleA.includes('Admin');
		this.isAdministrator = this.UserRoleA.includes('Administrator');

		this.adduserform.patchValue({
			userrole: this.UserRole,
			Company: this.CompanyId
		});
		this.adduserform.controls['Company'].setValue(this.UserCompanyId);
		if (this.isAdministrator) {
			this.adduserform.controls['Company'].enable();
		} else {
			this.adduserform.controls['Company'].disable();
		}
		this.temp = [];
	}

	public closeModal() {
		this.closebutton.nativeElement.click();
		// this.selected=[];
		// this.RoleIddata =[];
	}

	// public cancel(){
	// 	this.cancelbtn.nativeElement.click();
	// }

	datatableCode() {
		this.DatatableParameter.username = this.filteruserform.get('filterusername').value;
		this.DatatableParameter.useremailid = this.filteruserform.get('filteruseremailid').value;
		const that = this;
		const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });
		this.dtOptions = {
			processing: true,
			serverSide: true,
			dom: 'lrtip',
			lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
			columnDefs: [
				{ orderable: false, targets: -1 }
			],
			ajax: (dataTablesParameters: any, callback) => {
				Object.assign(dataTablesParameters, this.DatatableParameter);
				that.http.post<DataTablesResponse>(environment.APIEndpoint + 'main.fetch_UserData&reload=1', Object.assign(dataTablesParameters, this.DatatableParameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {
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

	searchuserdata() {
		this.datatableCode();
		this.rerender();
	}

	// view(UserId) {

	// 	this.activeClass = 'active';
	// 	this.heading = "View User";
	// 	this.viewedit = true;
	// 	this.adduserform.disable();
	// 	let getUserId = new FormData();
	// 	getUserId.append('UserIdDetails',UserId);
	// 	this.companyService.ViewUserinfo(getUserId).subscribe(Response =>{
	// 		if(Response.data.length) {
	//     this.fullName = Response.data[0].UserFirstName +' '+ Response.data[0].UserLastName
	//     this.adduserform.patchValue({
	//       firstname: this.fullName,
	//       userId: Response.data[0].UserId,
	//       username: Response.data[0].UserName,
	//       userrole: Response.data[0].RoleId,
	//       useremailid: Response.data[0].EmailId,
	//       usercontactno: Response.data[0].PhoneNum,
	//       Company: Response.data[0].Companyname,
	//       // cnfrmuserpassword:Response.data[0].Password1,
	//       // userpassword :Response.data[0].Password1
	//     });

	// 	    this.id = Response.data[0].RoleId.split(',');
	// 		this.getuserdetailsbyCompanyId(this.UserCompanyId);
	// 		}

	// 	});

	// 	this.UserLoginModal.nativeElement.click();
	// }


	edit(UserId, type) {
		this.selected = [];
		if (type == "view") {
			this.heading = "View User";
			this.adduserform.disable();
			this.isButtonDisabled = true;
		}
		else {
			this.heading = "Edit User";
			this.adduserform.enable();
			this.isButtonDisabled = false;

		}
		this.activeClass = 'active';
		this.adduserform.reset();
		this.adduserform.get("userpassword").setValidators(null);
		this.adduserform.get("cnfrmuserpassword").setValidators(null);
		let getUserId = new FormData();
		getUserId.append('UserIdDetails', UserId);
		this.myValue = UserId;
		this.companyService.ViewUserinfo(getUserId).pipe(takeUntil(this.destroy$)).subscribe(Response => {
			console.log(Response.data);
			if (Response.data.length) {
				this.EmpId = Response.data[0].EmployeeId;
				this.Fname = Response.data[0].UserFirstName;
				this.Lname = Response.data[0].UserLastName;
				this.fullName = Response.data[0].UserFirstName + ' ' + Response.data[0].UserLastName
				this.adduserform.patchValue({
					firstname: this.fullName,
					userId: Response.data[0].UserId,
					username: Response.data[0].UserName,
					useremailid: Response.data[0].EmailId,
					usercontactno: Response.data[0].PhoneNum,
					Company: Response.data[0].Companyname,
				});
				this.id = Response.data[0].RoleId.split(',');
				console.log(this.id);
				this.getuserdetailsbyCompanyId(this.UserCompanyId);
			}
		})
		this.UserLoginModal.nativeElement.click();
	}



	remove(UserIdDetails) {

		Swal.fire({
			title: 'Are you sure?',
			text: 'You want to delete this.',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Yes',
			cancelButtonText: 'No'
		}).then((result) => {
			if (result.value) {
				let getUserId = new FormData();
				getUserId.append('UserIdDetails', UserIdDetails);
				this.companyService.RemoveUserinfo(getUserId).pipe(takeUntil(this.destroy$)).subscribe(Response => {
					if (Response) {
						Swal.fire({
							icon: 'success',
							title: 'Success!',
							text: Response.MESSAGE,
							showConfirmButton: false,
							timer: 2000
						});
						this.reload();
					} else {
						Swal.fire({
							icon: 'error',
							title: 'Error!',
							text: 'item Delete Failed',
							showConfirmButton: false,
							timer: 3000
						});
					}
				});
			}
		})

	}

	adduser() {

		this.submitted = false;
		this.isButtonDisabled = false;
		if (this.adduserform.valid) {
			this.submitted = false;
			this.isButtonDisabled = true;
			let userData = new FormData();
			// code...
			this.roleData = this.adduserform.get('userrole').value;
			let i;
			this.loginUserRole_Id = '';
			this.UserRole_Id = [];
			for (i = 0; i < this.roleData.length; i++) {
				this.UserRole_Id.push(this.roleData[i].id);
				this.loginUserRole_Id = this.UserRole_Id.join(',')
			}
			// if( this.Fname === undefined && this.Lname === undefined){
			// 	this.userFUllname = this.adduserform.get('firstname').value.split(" ");
			// 	userData.append('firstname',this.userFUllname[0]);
			// 	userData.append('lastname',this.userFUllname[1]);
			// 	userData.append('employeeId','');
			// }else{
			userData.append('firstname', this.Fname);
			userData.append('lastname', this.Lname);
			userData.append('employeeId', this.EmpId);
			//}
			userData.append('username', this.adduserform.get('username').value);
			userData.append('userrole', this.loginUserRole_Id);
			userData.append('userpassword', this.adduserform.get('userpassword').value);
			userData.append('cnfrmuserpassword', this.adduserform.get('cnfrmuserpassword').value);
			userData.append('useremailid', this.adduserform.get('useremailid').value);
			userData.append('usercontactno', this.adduserform.get('usercontactno').value);
			userData.append('Company', this.adduserform.get('Company').value);
			userData.append('UserIdDetails', this.adduserform.get('userId').value);
			userData.append('overtimeTiming', this.adduserform.get('Overtime').value);
			if (this.actualpass == true) {
				userData.append('actualpass', 'true');
			} else {
				userData.append('actualpass', 'false');
			}
			if (this.EmpId == "") {
				Swal.fire({
					icon: 'error',
					title: 'Error!',
					text: "Cannot find user in hr employee",
					timer: 2000
				});
			} else {
				this.companyService.adduser(userData).pipe(takeUntil(this.destroy$)).subscribe(Response => {
					if (Response.CODE == 200) {
						Swal.fire({
							icon: 'success',
							title: 'Success!',
							text: Response.MESSAGE,
							showConfirmButton: false,
							timer: 2000
						});
						this.reload();
						this.adduserform.reset();
						this.closeModal();
					}
				});
			}

		}
		else {
			this.submitted = true;
			this.isButtonDisabled = false;
			Swal.fire({
				icon: 'error',
				title: 'Field required!',
				showConfirmButton: false,
				timer: 3000
			});
		}

	}

	passchange() {
		this.actualpass = true;
	}

	rerender(): void {
		this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
			// Destroy the table first in the current context
			dtInstance.destroy();
			// Call the dtTrigger to rerender again
			this.dtTrigger.next();
		});
	}
	reload() {
		this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
			dtInstance.ajax.reload();
		});
	}
	selectEvent(item) {
		var splitted = item.name.split(" ", 3);
		this.EmpId = item.id;
		this.Fname = splitted[0];
		this.Lname = splitted[1];
	}
	onChangeSearch(val: string) {
	}
	onFocused(e) { }

	employeetypenamelist() {
		let employeelist = new FormData();
		this.hrservice.getEmployee(employeelist).pipe(takeUntil(this.destroy$)).subscribe(resp => {
			this.employee = resp.data;
			let i
			for (i = 0; i < this.employee.length; i++) {
				this.employeedata.push({
					'id': this.employee[i].EmployeeId,
					'name': this.employee[i].EmployeeName
				})
			}
			this.employeedataList = [this.employeedata];
			this.employeedataList = this.employeedataList[0];
		});
	}
	getuserdetailsbyId(e) {
		this.adduserform.controls['userrole'].setValue('');
		this.company_Id = e.target.value;
		this.getuserdetailsbyCompanyId(this.company_Id);
	}

	getuserdetailsbyCompanyId(companyID) {
		this.id = this.id || []; // Ensure this.id is an array

		this.adduserform.controls['userrole'].setValue('');
		this.company_Id = companyID;
		if (this.company_Id != "") {
			let userdata = new FormData();
			userdata.append('company_Id', this.company_Id);
			this.companyService.getUserdetailbycompanyid(userdata).pipe(takeUntil(this.destroy$)).subscribe(resp => {
				let i = 0;
				this.userrole = resp.data;
				for (i = 0; i < this.userrole.length; i++) {
					this.RoleId_data.push({
						'id': this.userrole[i].RoleId,
						'name': this.userrole[i].userRole
					});
				}
				this.RoleIddata = [this.RoleId_data];
				this.RoleIddata = this.RoleIddata[0];
				this.selected = this.RoleIddata.filter(item => this.id.includes(item.id));
				//   console.log("end result -",test)

			});
		} else {
			this.adduserform.controls['userrole'].setValue('');
		}
	}

	getuserdetails() {
		this.username = sessionStorage.getItem('UserName');
		let userdata = new FormData();
		userdata.append('UserName', this.username);
		this.companyService.getUserdetail(userdata).pipe(takeUntil(this.destroy$)).subscribe(resp => {
			this.UserCompanyId = resp.data[0].CompanyId;
			this.getuserdetailsbyCompanyId(this.UserCompanyId);
		});

	}
}
