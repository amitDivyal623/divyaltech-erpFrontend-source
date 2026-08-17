
import { Component, OnInit, OnDestroy,ViewChild,ElementRef, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import {FormBuilder, FormControl, FormGroup, Validators, FormArray} from '@angular/forms';
import { Observable, Subject, forkJoin } from 'rxjs';
import { HttpClient ,HttpHeaders, HttpResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import {debounceTime, distinctUntilChanged, map,takeUntil} from 'rxjs/operators';
import { DataTableDirective } from 'angular-datatables';
import {VendorService} from '../../services/vendor.service';
import { NodeWithI18n } from '@angular/compiler';
import { HrService } from '../../services/hr.service';
import { environment } from 'src/environments/environment';
import { AdminService } from 'src/app/services/admin.service';


const states =['North Carolina', 'North Dakota','Northern Mariana Islands', 'Ohio', 'Oklahoma', 'Oregon', 'Palau', 'Pennsylvania', 'Puerto Rico', 'Rhode Island',
'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virgin Islands', 'Virginia'];

class Vendorgroup{
	vendorId : string;
	VendorName :string;
	RateType:string;
	Rate :string;
	PaymentSchedule :string;
	VendorType:string;
	VendorAddress :string;
	VendorContact : string;
	Status : string;
	Company :string;
	CountryId :string;
	StateId : string;
	City : string;
	PostCode : string ;
	VehicleId :string;
	VehicleName :string;
	VehicleNo:string;
	VehicleType:string;
	DriverName:string;
}
class DataTablesResponse {
	data: any[];
	draw: number;
	recordsFiltered: number;
	recordsTotal: number;
}


@Component({
	selector: 'app-hr-labour',
	templateUrl: './hr-labour.component.html',
	styleUrls: ['./hr-labour.component.css']
})
export class HrLabourComponent implements OnInit, OnDestroy {
	[x: string]: any;
	dtOptions: DataTables.Settings = {};
	dtTrigger: Subject<any> = new Subject<any>();
	@ViewChild(DataTableDirective) dtElement: DataTableDirective;
	@ViewChild('closebutton') closebutton; 
	@ViewChild('EditVendorclosebutton') EditVendorclosebutton; 
	@ViewChild('VendorPopup') VendorPopup; 
	@ViewChild('addvendorCancelButton') addvendorCancelButton;
	@ViewChild('vehicalclosebutton') vehicalclosebutton;
	@ViewChild('vehicalModal') vehicalModal;
	@ViewChild('MachinPopup') MachinPopup;
	statusEnabled: boolean = true;
	private destroy$ = new Subject<void>();
	respCountry =[];
	respRateType = [];
	respVendorType =[];
	respStatus = [];
	respVehicleType = [];
  
	private dateToString = (date) => `${date.year}-${date.month}-${date.day}`; 
	activeTab = 'Vendor';
	DatatableParameter = { vendorname:'',companyName:''};
	vehicle:Vendorgroup[];
	vendor:Vendorgroup[];
	modal:any;		
	searchvendor = new FormGroup({
		vendorname : new FormControl(''),
		companyName :new FormControl(''),
	});

	addvendor = new FormGroup({
		companyName : new FormControl('',Validators.required),
		vendorname : new FormControl('',Validators.required),
		vendorMobile: new FormControl(),
		vendorCategory: new FormControl(),
		vendorSubCategory: new FormControl(),
		contactPerson: new FormControl(),
		contactPersonNo: new FormControl(),
		pan_no: new FormControl(),
		vendorEmail: new FormControl(),
		gst_no: new FormControl(),
		tax_id: new FormControl(),
		vendorState: new FormControl('',Validators.required),
		vendorAddress : new FormControl(''),
		bankName : new FormControl('',Validators.required),
		accountNo : new FormControl('',Validators.required),
		ifscCode : new FormControl('',Validators.required),
		branchAddress : new FormControl('',Validators.required),
		status_value: new FormControl(''),
		vendorDescription: new FormControl(''),
		vendorId : new FormControl(''),
		// vendortype :new FormControl(''),
		// rate :new FormControl(''),
		// payschedule :new FormControl(''),
		// vendorContact :new FormControl('',[Validators.required,Validators.maxLength(10),Validators.pattern(/^[0-9]\d*$/),Validators.minLength(10)]),
		// status : new FormControl(''),
		// postcode : new FormControl(''),
		// city : new FormControl(''),
		// country : new FormControl(''),
		// state : new FormControl('')   
	});
	searchvehicle = new FormGroup({
		vehicleName :new FormControl(''),
		vendorname : new FormControl('')
	});
	addvehicle = new FormGroup({
		vehicleId :new FormControl(''),
		vehicleNo :new FormControl('',Validators.required),
		driverName :new FormControl('',Validators.required),
		status : new FormControl(''),
		vehicleName :new FormControl('',Validators.required),
		vendorId : new FormControl(''),
		vendorContact :new FormControl('',[Validators.maxLength(10),Validators.pattern(/^[0-9]\d*$/),Validators.minLength(10)]),
		rateType : new FormControl('',Validators.required),
		rate :new FormControl('',[Validators.required,Validators.maxLength(6),Validators.pattern(/^[.\d]+$/)]),
		vehicleType:new FormControl('',Validators.required),
		vendorname : new FormControl('',Validators.required)
		
	});
	constructor(private adminservice:AdminService,private router:Router,private http:HttpClient,private VendorService:VendorService,private hrservice:HrService,private chRef : ChangeDetectorRef) {
		if(sessionStorage.getItem('token')==undefined && sessionStorage.getItem('UserName')==undefined){
		this.router.navigate(['/']);
		}
	}
	submitted: any;
	ngOnInit() {
		this.datatableCode();
		this.lookupdatalist();
		this.contractorlist();
		this.getGroupLists();
		this.getSubGroupLists();
		this.employeelistData();
		this.getStatesLists();
	}

    lookupdatalist(){
		let lookupBank = "Bank";
		let bankdata = new FormData();
		bankdata.append('lookupname', lookupBank);
		this.hrservice.fetch_lookupdata(bankdata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
		this.resplookupBank = Response.data
		});
    }
    datatableCode() {
		this.DatatableParameter.vendorname = this.searchvendor.get('vendorname').value;
		this.DatatableParameter.companyName = this.searchvendor.get('companyName').value;
		
		const that = this;
		const headers = new HttpHeaders({ 'Content-Type': 'text/plain'});
		this.dtOptions = {
			processing: true,
			serverSide: true,
			dom: 'lrtip',
			lengthMenu:[[5, 10, 25, 50], [5, 10, 25, 50]],
			columnDefs: [
				{ orderable: false, targets: 1 }
			],
			ajax: (dataTablesParameters: any, callback) => {
			Object.assign(dataTablesParameters, this.DatatableParameter);
			that.http.post<DataTablesResponse>(environment.APIEndpoint+'hr.fetch_vendor&reload=1',Object.assign(dataTablesParameters,this.DatatableParameter), {responseType: 'json', headers}).pipe(takeUntil(this.destroy$)).subscribe(resp =>{
				console.log(resp.data);
				that.vendor=resp.data;
				callback({recordsTotal: resp.recordsTotal,recordsFiltered: resp.recordsTotal,data: []});
			});
			}
		};
    }   
	getStatusLabel(value: any): string {
		if (value === '1' || value === 1) return 'Enabled';
		if (value === '0' || value === 0) return 'Disabled';
		return 'Unset';
	}
 
    public closeModal(){
      this.closebutton.nativeElement.click();
    }
    redirect(link: string){
      this.router.navigate(['/'+link]);
    }
    result(tabName:any){
      this.activeTab = tabName;
	  this.contractorlist();
    }
    vendorSearch(){
      this.datatableCode();
      this.rerender();
    }
	vendorReset(){
		this.searchvendor.get('vendorname').setValue('');
		this.searchvendor.get('companyName').setValue('');

		this.datatableCode();
		this.rerender()
	}
    vehicleSearch(){
      this.datatableCodeVehicle();
      this.rerender();
    }
    ngAfterViewInit(): void {
      this.dtTrigger.next();
    }
	AddvendorPopu(){
		this.addvendor.reset();
		this.PopupTitle = "Add New Vendor";
		this.filedClass = "";
		this.addvendor.enable();
		this.VendorPopup.nativeElement.click();
		this.submitted = false;
		this.saveButton = true;
		this.statusEnabled = true;
		// this.addvendor.patchValue({status_value: '1'});
	}
	

    // getViewVendors(type,vendorId){
	// 	this.getGroupLists();
	// 	this.getSubGroupLists();
	// 	if(type == 'viewVendor'){
	// 		this.filedClass = "active";
	// 		this.saveButton = false;
	// 		this.addvendor.disable();
	// 	}else {
	// 		this.addvendor.enable();
	// 		this.saveButton = true;
	// 	}
	// 	this.VendorPopup.nativeElement.click();
	// 	this.VendorService.getvendor(vendorId).subscribe(resp =>{
	// 		console.log(resp.data[0].status_value);
	// 		if(resp.data.length) {
	// 			this.statusEnabled = resp.data[0].status_value == '1';	
	// 			this.addvendor.patchValue({
	// 				vendorId : resp.data[0].vendorId,
	// 				companyName: resp.data[0].company_name,
	// 				vendorname : resp.data[0].vendorName,
	// 				vendorMobile : resp.data[0].vendorMobile,
	// 				vendorCategory :resp.data[0].vendorCategory,
	// 				vendorSubCategory : resp.data[0].vendorSubCategory,
	// 				contactPerson:resp.data[0].contactPerson,
	// 				contactPersonNo :resp.data[0].contactPersonNo,
	// 				vendorEmail :resp.data[0].vendorEmail,
	// 				pan_no : resp.data[0].pan_no,
	// 				gst_no : resp.data[0].gst_no,
	// 				tax_id : resp.data[0].tax_id,
	// 				vendorState : resp.data[0].vendorState,
	// 				vendorAddress : resp.data[0].vendorAddress,
	// 				bankName : resp.data[0].bankName,
	// 				accountNo : resp.data[0].accountNo,
	// 				ifscCode : resp.data[0].ifscCode,
	// 				branchAddress : resp.data[0].branchAddress,
	// 				vendorDescription : resp.data[0].vendorDescription,
	// 			});						
	// 		}else{
	// 			Swal.fire({
	// 				icon:'error',
	// 				title:'Error!',
	// 				text:'Unable to Fetch vendor Details',
	// 				showConfirmButton:false,
	// 				timer:3000
	// 			});
	// 		}
    //   });
    // }

	getViewVendors(type, vendorId) {

		if (type === 'viewVendor') {
			this.filedClass = 'active';
			this.saveButton = false;
			this.addvendor.disable();
		} else {
			this.addvendor.enable();
			this.saveButton = true;
		}

		const groupReq = this.adminservice.GetAllGroupName(this.createStatusFormData());
		const subGroupReq = this.adminservice.GetAllSubGroupName(this.createStatusFormData());

		forkJoin([groupReq, subGroupReq])
		.pipe(takeUntil(this.destroy$))
		.subscribe(([groupResp, subGroupResp]) => {
		this.showAllGroups = groupResp.data;
		this.showSubGrpsById = subGroupResp.data;

		// Once both lists are ready, fetch vendor details
		this.VendorPopup.nativeElement.click();
		this.VendorService.getvendor(vendorId).pipe(takeUntil(this.destroy$)).subscribe(resp => {
			if (resp.data.length) {
			const vendor = resp.data[0];
			this.statusEnabled = vendor.status_value === '1';
			this.addvendor.patchValue({
				vendorId: vendor.vendorId,
				companyName: vendor.company_name,
				vendorname: vendor.vendorName,
				vendorMobile: vendor.vendorMobile,
				vendorCategory: vendor.vendorCategory,
				vendorSubCategory: vendor.vendorSubCategory,
				contactPerson: vendor.contactPerson,
				contactPersonNo: vendor.contactPersonNo,
				vendorEmail: vendor.vendorEmail,
				pan_no: vendor.pan_no,
				gst_no: vendor.gst_no,
				tax_id: vendor.tax_id,
				vendorState: vendor.vendorState,
				vendorAddress: vendor.vendorAddress,
				bankName: vendor.bankName,
				accountNo: vendor.accountNo,
				ifscCode: vendor.ifscCode,
				branchAddress: vendor.branchAddress,
				vendorDescription: vendor.vendorDescription,
			});
			} else {
			Swal.fire({
				icon: 'error',
				title: 'Error!',
				text: 'Unable to Fetch vendor Details',
				showConfirmButton: false,
				timer: 3000
			});
			}
		});
		});
	}

	// helper function to avoid repeating FormData creation
	createStatusFormData() {
	const formData = new FormData();
	formData.append('status', '1');
	return formData;
	}	
    insertvendor(){
		// this.isButtonDisabled = false;
		this.submitted = false;
		if(this.addvendor.valid ){
			this.submitted = false;
			// this.isButtonDisabled = true;
			let vendorData = new FormData();
			const VendorId = this.addvendor.get('vendorId').value;
			if(VendorId){
				vendorData.append('vendorId', VendorId);
			}
			vendorData.append('companyName', this.addvendor.get('companyName').value);
			vendorData.append('VendorName',this.addvendor.get('vendorname').value);
			vendorData.append('vendorMobile',this.addvendor.get('vendorMobile').value);
			vendorData.append('vendorCategory',this.addvendor.get('vendorCategory').value);
			vendorData.append('vendorSubCategory',this.addvendor.get('vendorSubCategory').value);
			vendorData.append('contactPerson',this.addvendor.get('contactPerson').value);
			vendorData.append('contactPersonNo',this.addvendor.get('contactPersonNo').value);
			vendorData.append('vendorEmail',this.addvendor.get('vendorEmail').value);
			vendorData.append('pan_no',this.addvendor.get('pan_no').value);
			vendorData.append('gst_no',this.addvendor.get('gst_no').value);
			vendorData.append('tax_id',this.addvendor.get('tax_id').value);
			vendorData.append('vendorState',this.addvendor.get('vendorState').value);
			vendorData.append('vendorAddress',this.addvendor.get('vendorAddress').value);
			vendorData.append('bankName',this.addvendor.get('bankName').value);
			vendorData.append('accountNo',this.addvendor.get('accountNo').value);
			vendorData.append('ifscCode', this.addvendor.get('ifscCode').value);
			vendorData.append('branchAddress',this.addvendor.get('branchAddress').value);
			vendorData.append('statusValue', this.statusEnabled ? '1' : '0');
			vendorData.append('vendorDescription',this.addvendor.get('vendorDescription').value);
			this.VendorService.addvendor(vendorData).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
				if(Response.STATUS == 200) {
					Swal.fire({
					icon:'success',
					title:'Success!',
					text:Response.MESSAGE,
					showConfirmButton:false,
					timer:2000
					});
					this.reload();
					this.addvendor.reset();
					this.addvendorCancelButton.nativeElement.click();
				} else if (Response.STATUS == 204) {
					Swal.fire({
						icon: 'error',
						title: 'Vendor Creation Failed!',
						text: 'Vendor creation failed as the name already exists.',
						showConfirmButton: false,
						timer: 3000
					});

				} else{
					Swal.fire({
					icon:'error',
					title:'Error!',
					text:'vendor Creation Failed',
					showConfirmButton:false,
					timer:3000
					});
				}
			});  
		}else{
			// this.isButtonDisabled = false;
			Swal.fire('Alert','Fill all required fields first','info');
			this.submitted = true;
		}
	}
	deletevendor(vendorId){
		Swal.fire({
		title: 'Are you sure?',
		text: 'You want to delete this.',
		icon: 'warning',
		showCancelButton: true,
		confirmButtonText: 'Yes',
		cancelButtonText: 'No'
		}).then((result) => {
		if (result.value) {
			this.VendorService.deletevendor(vendorId).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
			if(Response.CODE == 200) {
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
				text:'vendor Delete Failed',
				showConfirmButton:false,
				timer:3000
				});
			}
			});
		} 
		})
	} 

	getGroupLists(){
		let formData = new FormData();
		formData.append('status','1');
		this.adminservice.GetAllGroupName(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
		this.showAllGroups = resp.data;
		}); 
	}

	getSubGroupLists(){
		let formData = new FormData();
		formData.append('status','1');
		this.adminservice.GetAllSubGroupName(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
		this.showSubGrpsById = resp.data;
		});
	}	

	onChangeGroupName() {
		const selectedValue = this.addvendor.get('vendorCategory').value;
		let formData = new FormData();
		formData.append('groupId',selectedValue);
		this.adminservice.getSubGroupById(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
		this.showSubGrpsById = resp.data;
		});
	}	

	employeelistData() {
		let customerlist = new FormData();
		this.hrservice.getEmployeeSelectedData(customerlist).pipe(takeUntil(this.destroy$)).subscribe((resp) => {
			this.emplyeedataList = resp.data;
		});
	}	


	getStatesLists(){
		let formData = new FormData();
		this.adminservice.getAllStates(formData).pipe(takeUntil(this.destroy$)).subscribe(resp =>{
			this.showAllStates = resp.data;
		});
	}	

  
	contractorlist(){
		let projectlist = new FormData();
		this.hrservice.contractorList(projectlist).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
		this.respcontractor = Response.data
		});
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
	vendorData(e){
		this.vendorName = e.target.options[e.target.selectedIndex].text;
	}
	ngOnDestroy(): void {
		this.dtTrigger.unsubscribe(); 

		this.destroy$.next();
		this.destroy$.complete();

		if (this.dtElement && this.dtElement.dtInstance) {
		this.dtElement.dtInstance.then(dt => dt.destroy());
		}
	}
}
