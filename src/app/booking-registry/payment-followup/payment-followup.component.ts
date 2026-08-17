import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef, Injectable, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormControl, FormGroup,Validators  } from '@angular/forms';
import { Observable, from, Subject } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { DataTableDirective } from 'angular-datatables';
import { DatePipe } from '@angular/common';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
import { NgbCalendar, NgbDateAdapter, NgbDate, NgbDateParserFormatter, NgbDateStruct, NgbInputDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { CrmService } from '../../services/crm.service';
import { HrService } from 'src/app/services/hr.service';
import { BillingService } from 'src/app/services/billing.service';
import {map, startWith, takeUntil} from 'rxjs/operators';
import { ProductService } from 'src/app/services/product.service';
// import jwt_decode from 'jwt-decode';
import { event } from 'jquery';
import { Moment } from 'moment'
import * as moment from 'moment';


class Tasks {
  TaskId: string;
  EmployeeId: string;
  UserId: string;
  TaskDescription: string;
  TaskTitle: string;
  TaskDt: string;
  Status: string;
  CreatedBy: string;
  CreatedDt: string;
  UpdatedBy: string;
  UpdatedDt: string;
}
class DataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
  iTotalDisplayRecords: number;
}


@Injectable()
export class CustomAdapter extends NgbDateAdapter<string> {
  readonly DELIMITER = '-';

  fromModel(value: string | null): NgbDateStruct | null {
    if (value) {
      let date = value.split(this.DELIMITER);
      if (date.length === 3) {
        return {
          day: parseInt(date[0], 10),
          month: parseInt(date[1], 10),
          year: parseInt(date[2], 10),
        };
      }
    }
    return null;
  }

  toModel(date: NgbDateStruct | null): string | null {
    return date 
      ? `${this.padNumber(date.day)}${this.DELIMITER}${this.padNumber(date.month)}${this.DELIMITER}${date.year}`
      : null;
  }

  private padNumber(value: number): string {
    return value < 10 ? '0' + value : value.toString();
  }
}

/**
 * This Service handles how the date is rendered and parsed from keyboard i.e. in the bound input field.x
 */

@Injectable()
export class CustomDateParserFormatter extends NgbDateParserFormatter {

  readonly DELIMITER = '/';

  parse(value: string): NgbDateStruct | null {
    if (value) {
      let date = value.split(this.DELIMITER);
      return {
        day: parseInt(date[0], 10),
        month: parseInt(date[1], 10),
        year: parseInt(date[2], 10)
      };
    }
    return null;
  }

  format(date: NgbDateStruct | null): string {
    return date ? ("0" + date.day).slice(-2) + this.DELIMITER + ("0" + date.month).slice(-2) + this.DELIMITER + date.year : '';
  }
}


@Component({
  selector: 'app-payment-followup',
  templateUrl: './payment-followup.component.html',
  styleUrls: ['./payment-followup.component.scss'],
  providers: [
    NgbInputDatepickerConfig,
    {provide: NgbDateAdapter, useClass: CustomAdapter},
    {provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter}
  ]
})
export class PaymentFollowupComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  selected = [
    {name: "Active"},
    {name: "Pending"},
  ];
  [x: string]: any;

  paymentdetail: FormGroup;
  iconColor: string = '#a18606';
  model: NgbDateStruct;
  model2: string;
  followupadd: boolean;
  filterWorking: boolean = true;
  hideDoneButton: boolean = true;
  hideAddMoreFollowUpButton = false;
  isDDSelected: boolean = false;  
  isCQSelected: boolean = false;  
  isVisitorNameReadOnly: boolean;
  hideRedirectButton: boolean = true;
  showDuplicateCheckbox:boolean = false;
  dtOptions5: DataTables.Settings = {};
  dtOptions: DataTables.Settings = {};
  dtTrigger5: Subject<any> = new Subject<any>();
  // dtTrigger5: Subject<any> = new Subject<any>();
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  @ViewChildren(DataTableDirective) dtElement1: any;
  @ViewChild('closebutton') closebutton;
  @ViewChild('ngbDatepicker') dte: NgbDateStruct;
  @ViewChildren('closebutton1') closebutton1;
  @ViewChild('taskaddModel')taskaddModel: ElementRef;
  @ViewChild('taskEditModel')taskEditModel: ElementRef;


  @ViewChild('close_payment_paln_button') close_payment_paln_button;
  private dateToString = (date) => `${date.year}-${date.month}-${date.day}`;
  respStatus =[];
  categories = [];
  categories1 = [];
  SelectedBankData = [];
  respcusTags =[];
  custtags = [];
  custtags1 = [];
  minDate = {year: 1900, month: 1, day: 1};
  maxDate = {year: 2099, month: 12, day: 31};
  paymentDatatableParameter: { id: '', buyername: '', dateFrom: '',dateTo: ''};
  DatatableParameter = {dateFrom: '',dateTo: '',buyername: '',planDate: '',planStatus: '',planMode: '',planType:'',fuPlanDate: ''};
  dataa:Tasks[];
  customerdataList = [];
  customerData= [];
  keyword = 'name';
  resp:any;
  employee : any;
  modal:any;
  taskselected = [];
  tempTaskSelected = [];

  constructor(private formBuilder : FormBuilder,private crmservice:CrmService,private Activatedroute: ActivatedRoute,private hrservice:HrService,private billingservice:BillingService,private datePipe: DatePipe, private ngbCalendar: NgbCalendar, private dateAdapter: NgbDateAdapter<string>,private router:Router,private http:HttpClient, private chRef : ChangeDetectorRef,private productservice: ProductService) { 
    this.paymentdetail = formBuilder.group({
      address: formBuilder.array([])
    });
  }

  regMeasurement = new FormGroup({

    mBlockNumber: new FormControl(),
  })
  myControl = new FormControl();
  options: string[] = ['One', 'Two', 'Three'];
  filteredOptions!: Observable<string[]>;

  paymentPlan_form = new FormGroup({


    visitor_name: new FormControl(''),
    paymentPlan_task_title: new FormControl(''),
    paymentPlan_task_contact: new FormControl('',Validators.required),
    paymentPlan_task_description: new FormControl(''),
    paymentPlan_task_action_response: new FormControl(''),
    paymentPlan_task_action_response_logs: new FormControl(''),
    paymentPlan_task_Assignee: new FormControl(''),
    paymentPlan_task_Reporter: new FormControl(''),
    paymentPlan_task_Action: new FormControl('',Validators.required),
    paymentPlan_id: new FormControl(''),
    paymentPlan_booking_id: new FormControl(''),
    paymentPlan_buyer_id: new FormControl(''),

    paymentPlan_date: new FormControl(''),
    paymentPlan_amount: new FormControl(''), // Only numbers,
    paymentPlan_status: new FormControl(''),
    paymentPlan_reason: new FormControl(''),
    paymentPlan_mode: new FormControl(''),
    payment_plan_paidTo: new FormControl(''),

    payment_plan_chequeName: new FormControl(''),
    payment_plan_chequeNo: new FormControl(''), // Only numbers,
    

    online_received_date: new FormControl(''),
    online_account_holder_name: new FormControl(''),
    online_bank_name: new FormControl(''),
    online_transferred_from: new FormControl(''),

    plan_cash_submittedBy: new FormControl(''),
    plan_cash_date: new FormControl(''),
    // plan_cash_amount: new FormControl(''),

    planDD_bank_name: new FormControl(''),
    planDD_name_on_dd:  new FormControl(''),
    // planDD_dd_amount: new FormControl(''),
    planDD_dd_number: new FormControl(''), // Only numbers,

  });

  plan_save_transaction_form = new FormGroup({
    plan_transaction_id: new FormControl(''),
    booking_id: new FormControl(''),
    
    plan_save_transaction_date: new FormControl(''), 
    plan_save_transaction_mode: new FormControl('', [Validators.required]),
    plan_save_all_recieved_date: new FormControl('',[Validators.required]),
    
    plan_save_transaction_accHead: new FormControl('', [Validators.required]), 
    plan_save_transaction_accHSubHead: new FormControl('',[Validators.required]),
    
    plan_save_chequeName: new FormControl('', [Validators.required]), 
    plan_save_status: new FormControl('', [Validators.required]),
    
    plan_save_chequeNumber: new FormControl('', [Validators.required]), 
    plan_save_chequeSubmitDate: new FormControl('',[Validators.required]), 
    plan_save_chequeDate: new FormControl('',[Validators.required]), 
    plan_save_online_transferred_from: new FormControl('', [Validators.required]), 
    plan_save_online_bank_name: new FormControl('', [Validators.required]),
    plan_save_online_acc_holder_name: new FormControl('', [Validators.required]),
    plan_save_online_recieved_date: new FormControl('',[Validators.required]),
    
    plan_save_recieved_by: new FormControl('', [Validators.required]), 
    plan_save_cash_submitted_by: new FormControl('', [Validators.required]), 
    plan_save_cash_date: new FormControl('',[Validators.required]), 
    
    plan_save_dd_bank_name: new FormControl('', [Validators.required]), 
    plan_save_dd_name: new FormControl('', [Validators.required]), 
    plan_save_amount: new FormControl('', [Validators.required]), 
    plan_save_dd_number: new FormControl('', [Validators.required]),
    plan_save_dd_submit_date: new FormControl('',[Validators.required]),
  });

  plan_done_transaction_form = new FormGroup({


    done_transaction_id: new FormControl(''),
    done_booking_id: new FormControl(''),
    done_buyer_id: new FormControl(''),
    plan_done_transaction_date: new FormControl('', [Validators.required]),
    plan_done_transaction_mode: new FormControl('', [Validators.required]),

    plan_done_chequeName: new FormControl('', [Validators.required]),
    plan_done_bank_name: new FormControl('', [Validators.required]),
    plan_done_chequeNumber: new FormControl('', [Validators.required]),
    plan_done_chequeDate: new FormControl('', [Validators.required]),
    plan_done_chequeSubmitDate: new FormControl('', [Validators.required]),
    plan_done_chequeClearDate: new FormControl('', [Validators.required]),

    plan_done_online_transferred_from: new FormControl('', [Validators.required]),
    plan_done_online_bank_name: new FormControl('', [Validators.required]),
    plan_done_online_acc_holder_name: new FormControl('', [Validators.required]),
    plan_done_online_recieved_date: new FormControl('', [Validators.required]),
    plan_done_all_recieved_date: new FormControl('', [Validators.required]),

    plan_done_cash_submitted_by:new FormControl('', [Validators.required]),
    plan_done_cash_date:new FormControl('', [Validators.required]),

    plan_done_dd_bank_name: new FormControl('', [Validators.required]),
    plan_done_dd_name: new FormControl('', [Validators.required]),
    plan_done_dd_number: new FormControl('', [Validators.required]),
    plan_done_dd_submit_date: new FormControl('', [Validators.required]),
    plan_done_dd_clear_date: new FormControl('', [Validators.required]),

    plan_done_status: new FormControl('', [Validators.required]),
    plan_done_amount: new FormControl('', [Validators.required]),
    plan_done_recieved_by: new FormControl('', [Validators.required]),
    plan_done_transaction_accHead: new FormControl('', [Validators.required]),
    plan_done_transaction_accHSubHead: new FormControl('', [Validators.required]),

  });

  ngOnInit(): void {

    this.Admin = false;
    this.Administrator = false;
    this.Accountant = false;
    let role = sessionStorage.getItem('UserRole');
    let match = role.split(',');
    for(let a in match){
      if(match[a] == 'Accountant'){
        this.Accountant = true;
      }
      if(match[a] == 'Administrator'){
        this.Administrator = true;
      }
      if(match[a] == 'Admin'){
        this.Admin = true;
      }
    }
    
    this.assignee = sessionStorage.getItem('EMPLOYEEID');
    this.CrmUserRole = false;
    if(sessionStorage.getItem('UserRole') == 'Admin'){
        this.CrmUserRole = true;
    }
    // this.jwttoken = jwt_decode(sessionStorage.getItem('token'));
    // this.isChangeSave[1] = true;
    this.id = this.Activatedroute.snapshot.paramMap.get('id');
    this.customerID = this.Activatedroute.snapshot.paramMap.get('customerID');
    this.prsn_id = this.Activatedroute.snapshot.paramMap.get('prsn_id');
    this.type = this.Activatedroute.snapshot.paramMap.get('type');
    
    this.filteredOptions = this.myControl.valueChanges
    .pipe(
      startWith(''),
      map(value => this._filter(value))
    );

    if(this.router.url == '/reg-payment-followup'){
     
      this.hideDoneButton = false;
    }

    this.id = this.Activatedroute.snapshot.paramMap.get('id');
    this.customerID = this.Activatedroute.snapshot.paramMap.get('customerID');
    this.prsn_id = this.Activatedroute.snapshot.paramMap.get('prsn_id');
    this.type = this.Activatedroute.snapshot.paramMap.get('type');
    this.getAccHead();
    this.getAllAccSubHead();
    // this.datatableCode();
    this.lookupDataList();
    this.paymentPlanDatatableCode();
    this.employeetypenamelist();
    this.getAllBankDetails();
    // this.employeetypenamelis();
    // this.lookupdatalist();
    // this.getTaskActionlist();
    // this.taskStatus();
    // this.taskTags();
    this.CrmUserRole = false;
    if(sessionStorage.getItem('UserRole') == 'CRM User'){
      this.CrmUserRole = true;
    }
  }


  addNewFollowUpGroup() {
    this.isHideFollowUps = true;
    this.editMode = true;
    const add = this.paymentdetail.get('address') as FormArray;
    add.push(this.formBuilder.group({

      fuDesp: [],
      fuDate: [],
      fuTime: [],
 
    }))
  }


  deleteAddressGroup(index: number) {
    
    this.editMode = false;
    const addressArray = this.paymentdetail.get('address') as FormArray;
  
    if (index >= 0 && index < addressArray.length) {
      addressArray.removeAt(index);
    } else {
      console.warn('Invalid index:', index);
    }

    this.fuDesp[index] = false;
    this.fuDate[index] = false;
    this.fuTime[index] = false;

  }

  getAccHead(){
    let headData = new FormData();
    this.hrservice.fetch_headData(headData).pipe(takeUntil(this.destroy$)).subscribe(Response => {

      this.resplookupBank = Response.data

    });
 
  }

  getAllAccSubHead(){
    let headData = new FormData();

    this.hrservice.fetch_AllSubheadData(headData).pipe(takeUntil(this.destroy$)).subscribe(resp => {

      this.resplookupsubBank = resp.data;

    });
  }

  getAllBankDetails(){
    let headData = new FormData();

    this.hrservice.fetch_AllBankDetails(headData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      
      this.SelectedBankData = resp.data;

    })
  }

  onAccHeadChange(event: Event): void {

    
    const selectedValue = (event.target as HTMLSelectElement).value;
    if(selectedValue){
      
      this.getAccSubHead(selectedValue);
    }
    
  }


  getAccSubHead(selectedValue: string){
   
    let subHead = new FormData();
     subHead.append('subhead',selectedValue);
    this.hrservice.fetch_subheadData(subHead).pipe(takeUntil(this.destroy$)).subscribe(Response => {

      
      this.resplookupsubBank = Response.data;  

              // Set the first sub-head as selected if there are options available
            //   if (this.resplookupsubBank.length > 0) {
            //     this.plan_save_transaction_form.controls['plan_save_transaction_accHSubHead'].setValue(this.resplookupsubBank);
            // }
      return this.resplookupsubBank;
    });
    
  }

  onAccSubHeadChange(event: Event) {

    let HeadAndSubhHeadData = new FormData();

    HeadAndSubhHeadData.append('acc_head',this.plan_done_transaction_form.get('plan_done_transaction_accHead').value);
    HeadAndSubhHeadData.append('acc_sub_head',this.plan_done_transaction_form.get('plan_done_transaction_accHSubHead').value);
    
   
    this.hrservice.fetch_bankName(HeadAndSubhHeadData).pipe(takeUntil(this.destroy$)).subscribe(resp => {

      
      
     
      this.SelectedBankData = resp.data;

      if(resp.data && resp.data.length > 0 && resp.data[0].bankName){
        
        this.plan_done_transaction_form.patchValue({
          plan_save_cheque_bank_name: resp.data[0].bankName
        });
  
        this.plan_done_transaction_form.get('plan_done_bank_name').setValue(resp.data[0].bankName);
      }

    });
     
  }

  showFollowup(e){
		if(e.target.checked){
      this.additionalFollow = true;
      // this.nextFollowup.controls['followup_date'].setValue('');
    } else{
      this.additionalFollow = false;
    }
	}

  selectCust(e){
    this.customerdataList = [];

  }

  onCustomerSearch(e){

    
    if(e.length > 1) {
      this.customerlistData(e);
    } else {
      this.customerdataList = [];
    }
  }

  customerlistData(e){
    let customerlist = new FormData();
    customerlist.append('value', e);
    this.crmservice.getCustomerDetail(customerlist).pipe(takeUntil(this.destroy$)).subscribe((resp) => {
      this.customerData =[];
      this.customerSuggestion = resp.data;
      for (let i = 0; i < this.customerSuggestion.length; i++) {
        this.customerData.push({
          id: this.customerSuggestion[i].CustomerId,
          name: this.customerSuggestion[i].Name,
        });
      }
    });
    this.customerdataList = [this.customerData];
    this.customerdataList = this.customerdataList[0];
  }

  public taskModalshow(){
    this.taskaddModel.nativeElement.click();
    this.nextFollowup.reset();
    this.followupadd = true;
  }

  lookupDataList(){
    let reason = new FormData();
    reason.append("LookupTypeId", 'd43ad69b-6c8b-11ec-9924-063127f6ced7');
    this.productservice.fetchLookUpDataByID(reason).pipe(takeUntil(this.destroy$)).subscribe(Response => {
      this.reason = Response.data;

    })
  }

  ngAfterViewInit(): void {
    this.dtTrigger5.next();   
  }


  // CheckReason(id) {

  //   const foundReason = this.reason.find(x => x.LookupDataId === id);
  //   return foundReason ? foundReason.LookupValue : null;
  // }

  iconColors: string[] = [];

  paymentPlanDatatableCode() {

    const index = 0;
    const that = this;
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });
    this.DatatableParameter.planType ='followUP';
    this.dtOptions5 = {
      processing: true,
      serverSide: true,
      dom: 'lrtip',
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
      pageLength: 25,
      columnDefs: [
        { orderable: false, targets: 0 }
      ],
      ajax: (dataTablesParameters: any, callback) => {
        Object.assign(dataTablesParameters, this.DatatableParameter);
        that.http.post<DataTablesResponse>(environment.APIEndpoint + 'regPayment.fetch_paymentPlan&reload=1', Object.assign(dataTablesParameters, this.DatatableParameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {

            that.paymentplan = resp.data;
            that.totalAmount();

            that.iconColors = new Array(resp.data.length).fill('#59c959'); 

            const idsArray = resp.data.map(item => item.id);
            
            idsArray.forEach((id, index) => {
              const formdata23 = new FormData();
              formdata23.append('id', id);

              this.billingservice.checkview(formdata23).pipe(takeUntil(this.destroy$)).subscribe((resp) => {
                if (resp.data === true) {
                  that.iconColors[index] = 'grey'; 
                  
                } else {
                  that.iconColors[index] = '#59c959'; 
                  
                }
              });
            });

          callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsTotal,
            data: []
          });
        });
      }

    }

  }

  RedirectToPaymentPlan(booking_id: string | null | undefined, buyer_id: string | null | undefined){
    if (!booking_id || !buyer_id) {
      Swal.fire({
        icon: 'warning',
        title: 'Cannot Redirect',
        text: 'Plot details are missing.',
      });
      return;
    }
    this.router.navigate(['/edit-booking',booking_id ,buyer_id ,'Edit']);    
  }

  totalAmount(){
    const totalAmount = Math.abs(this.paymentplan.reduce((acc, item) => acc - item.amount, 0));
    this.paymentfollowUp.patchValue({ totalAmount: totalAmount });
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        this.dtTrigger5.next();
    });
  }




  taskSearchReset() {

    // this.paymentfollowUp.controls['planDate'].setValue('');
    this.paymentfollowUp.controls['dateFrom'].setValue('');
    this.paymentfollowUp.controls['dateTo'].setValue('');
    this.paymentfollowUp.controls['buyername'].setValue('');
    this.paymentfollowUp.controls['planStatus'].setValue('');
    this.paymentfollowUp.controls['planMode'].setValue('');
    // this.paymentfollowUp.controls['fuPlanDate'].setValue('');

    
    // this.paymentPlanDatatableCode();
    // this.rerender();
    this.PlanSearch();
  }



  PlanSearch() {


    this.DatatableParameter.buyername = this.paymentfollowUp.get('buyername').value;
    
    // this.DatatableParameter.planDate = (<HTMLInputElement>(document.getElementById('planDate'))).value;
    this.DatatableParameter.dateFrom = (<HTMLInputElement>(document.getElementById('dateFrom'))).value;
    this.DatatableParameter.dateTo = (<HTMLInputElement>(document.getElementById('dateTo'))).value;
    this.DatatableParameter.planStatus = (<HTMLInputElement>(document.getElementById('planStatus'))).value;
    this.DatatableParameter.planMode = (<HTMLInputElement>(document.getElementById('planMode'))).value;
    // this.DatatableParameter.fuPlanDate = (<HTMLInputElement>(document.getElementById('fuPlanDate'))).value;
    
    
    this.paymentPlanDatatableCode();
    this.rerender();
  }
  


  // rerender(): void {
  //   this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
  //     dtInstance.ajax.reload();
  //   });
  // }
  

 

  reload() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }


  paymentfollowUp = new FormGroup({
    userName: new FormControl(''),
    customerName:new FormControl(''),
    // dateFrom: new FormControl(''),
    // dateTo: new FormControl(''),
    planStatus: new FormControl(''),
    // fuPlanDate: new FormControl(''),
    dateFrom: new FormControl(''),
    dateTo: new FormControl(''),
    planMode: new FormControl(''),
    totalAmount: new FormControl(''),
    buyername:new FormControl(''),
    planDate:new FormControl(''),
    task_status: new FormControl(''),
    tagid: new FormControl(''),
    filtertasktag: new FormControl('',),
    Tasktagid:new FormControl(''),
    planType: new FormControl(''),
  });

  addFollowup = new FormGroup({
    status: new FormControl('',Validators.required),
    date: new FormControl('',Validators.required),
    task_description: new FormControl('',Validators.required),
    task_id: new FormControl(''),
    Buyer_id: new FormControl(''),
    Buyer_name: new FormControl('',Validators.required),
    task_title: new FormControl('',Validators.required),
    reporter: new FormControl('',Validators.required),
    assignee:new FormControl('',Validators.required),
    Followup_completion: new FormControl(''),
    taskAction: new FormControl(''),
    Followup_response: new FormControl(''),
    task_tags: new FormControl(''),
    tag_id: new FormControl(''),
    followupResult: new FormControl(''),
    registry_id: new FormControl('')
  });

  nextFollowup = new FormGroup({
    followup_date: new FormControl(''),
    followup_Time: new FormControl('', Validators.required),
    followup_notes: new FormControl('', Validators.required),
  });



  modalClosed() {
    const addressArray = this.paymentdetail.get('address') as FormArray;
  
    // Remove all address groups forcefully
    addressArray.clear(); 
  
    this.paymentPlan_form.reset();
    this.paymentPlan_form.enable();
  }

  public closeModal() {

    // this.transaction_form.reset();
    this.paymentPlan_form.reset();
    this.closebutton.forEach(item => {
      item.nativeElement.click()
    });    
  }


  employeetypenamelist() {
    let employeelist = new FormData();
    this.crmservice.getEmployee(employeelist).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.employee = resp.data;
      for (let i = 0; i < resp.data.length; i++) {
        if ('AMAR SONI' == resp.data[i].EmployeeName) {
          this.reporter = resp.data[i].EmployeeId;
        }
      }

    });
  }


  ngOnDestroy(): void {
    this.dtTrigger5.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }


  onSelectPaymentPlanMode(value) {
   

    if (value == 'DD') {


      this.paymentPlan_form.get('payment_plan_chequeName').clearValidators();
      this.paymentPlan_form.get('payment_plan_chequeNo').clearValidators();
      this.paymentPlan_form.get('payment_plan_paidTo').clearValidators();

      this.paymentPlan_form.get('plan_cash_submittedBy').clearValidators();
      this.paymentPlan_form.get('plan_cash_date').clearValidators();


      this.paymentPlan_form.get('planDD_bank_name');
      this.paymentPlan_form.get('planDD_name_on_dd');
      // this.paymentPlan_form.get('planDD_dd_amount');
      this.paymentPlan_form.get('planDD_dd_number');


      this.transCond = false;
      this.transCondRby = false;
      this.transCond1 = false;
      this.transCond2 = false;
      this.transCond3 = false;
      this.transCond4 = false;
      this.transCond5 = false;
      this.transCond6 = true;
      this.transCond69 = true;


    }
    if (value == 'Cash') {

      this.paymentPlan_form.get('payment_plan_chequeName').clearValidators();
      this.paymentPlan_form.get('payment_plan_chequeNo').clearValidators();
      this.paymentPlan_form.get('payment_plan_paidTo').clearValidators();

    
      this.paymentPlan_form.get('planDD_bank_name').clearValidators();
      this.paymentPlan_form.get('planDD_name_on_dd').clearValidators();
      this.paymentPlan_form.get('planDD_dd_number').clearValidators();
      
      
      // this.paymentPlan_form.get('plan_cash_date');
      
      // this.paymentPlan_form.get('plan_cash_submittedBy');
      

      this.transCond = false;
      this.transCondRby = false;
      this.transCond1 = false;
      this.transCond2 = false;
      this.transCond3 = false;
      this.transCond4 = false;
      this.transCond5 = true;
      this.transCond6 = false;
      this.transCond69 = false;
    }

    if(value =='Online') {


      this.paymentPlan_form.get('payment_plan_chequeName').clearValidators();
      this.paymentPlan_form.get('payment_plan_chequeNo').clearValidators();
      this.paymentPlan_form.get('payment_plan_paidTo').clearValidators();

    
      this.paymentPlan_form.get('plan_cash_submittedBy').clearValidators();
      this.paymentPlan_form.get('plan_cash_date').clearValidators();
      
      this.paymentPlan_form.get('planDD_bank_name').clearValidators();
      this.paymentPlan_form.get('planDD_name_on_dd').clearValidators();
      this.paymentPlan_form.get('planDD_dd_number').clearValidators();

      this.transCond = false;
      this.transCondRby = false;
      this.transCond1 = false;
      this.transCond2 = false;
      this.transCond3 = false;
      this.transCond4 = true;
      this.transCond5 = false;
      this.transCond6 = false;
      this.transCond69 = false;
      
    }
    if (value == 'Cheque') {

      this.paymentPlan_form.get('plan_cash_submittedBy').clearValidators();
      this.paymentPlan_form.get('plan_cash_date').clearValidators();
      
      this.paymentPlan_form.get('planDD_bank_name').clearValidators();
      this.paymentPlan_form.get('planDD_name_on_dd').clearValidators();
      this.paymentPlan_form.get('planDD_dd_number').clearValidators();
      
      
      this.paymentPlan_form.get('payment_plan_chequeNo');
      this.paymentPlan_form.get('payment_plan_chequeName');
      this.transCond = true;
      this.transCondRby = true;
      this.transCond1 = false;
      this.transCond2 = false;
      this.transCond3 = true;
      this.transCond4 = false;
      this.transCond5 = false;
      this.transCond6 = false;
      this.transCond69 = true;
    }
    if (value == 0) {

      this.paymentPlan_form.get('payment_plan_chequeName').clearValidators();
      this.paymentPlan_form.get('payment_plan_chequeNo').clearValidators();
      this.paymentPlan_form.get('payment_plan_paidTo').clearValidators();

      this.paymentPlan_form.get('plan_cash_submittedBy').clearValidators();
      this.paymentPlan_form.get('plan_cash_date').clearValidators();
      
      this.paymentPlan_form.get('planDD_bank_name').clearValidators();
      this.paymentPlan_form.get('planDD_name_on_dd').clearValidators();
      this.paymentPlan_form.get('planDD_dd_number').clearValidators();
      

      this.transCond = false;
      this.transCondRby = false;
      this.transCond1 = false;
      this.transCond2 = false;
      this.transCond3 = false;
      this.transCond4 = false;
      this.transCond5 = false;
      this.transCond6 = false;
      this.transCond69 = false;
    }
  }

  
  openModalPayPlan(type, id = "", booking_id="",buyer_id="") {
    
    this.modalTitle = type;
    this.submit_btn = false;
    this.followupadd = true;
    this.paymentPlan_form.reset();
    this.isView = false;
    let response_data: any = {};

    // this.paymentdetail.get('address').disable();
    type.includes('View') ? (this.paymentPlan_form.disable(),this.nextFollowup.disable()) : (this.paymentPlan_form.enable(),this.nextFollowup.enable(), this.isView = true);
    if (id && (type.includes('Edit') || type.includes('View'))) {
      // this.paymentPlan_form.get('paymentPlan_task_action_response_logs').disable();
      this.responseLogReadonly = true;
      let formData = new FormData();
      formData.append("id", id);
      formData.append("booking_id", booking_id);
      formData.append("buyer_id", buyer_id);
      this.billingservice.view(formData).pipe(takeUntil(this.destroy$)).subscribe((resp) => {

        for (let i = 0; i < resp.data.COLUMNS.length; i++) {
          response_data[resp.data.COLUMNS[i]] = resp.data.DATA[0][i]
        }


        if (resp.data.DATA[0][6] == 'Cash') {
          let value = resp.data.DATA[0][6];
          this.onSelectPaymentPlanMode(value);
          this.paymentPlan_form.patchValue({
            
            // plan_cash_submittedBy: resp.data.DATA[0][13],
            // plan_cash_date: this.datePipe.transform(resp.data.DATA[0][14], 'dd/MM/yyyy'),       
            
          });

        }


        if(resp.data.DATA[0][6] == 'Cheque'){
          let value = resp.data.DATA[0][6];

          this.onSelectPaymentPlanMode(value);

          this.paymentPlan_form.patchValue({
            payment_plan_chequeName: resp.data.DATA[0][7],
            payment_plan_chequeNo: resp.data.DATA[0][8],
            payment_plan_paidTo: resp.data.DATA[0][19],
            
          });
        }

        if(resp.data.DATA[0][6] == 'Online'){
          let value = resp.data.DATA[0][6];

          this.onSelectPaymentPlanMode(value);

          this.paymentPlan_form.patchValue({

            online_transferred_from: resp.data.DATA[0][9],
            online_bank_name: resp.data.DATA[0][10],
            online_account_holder_name: resp.data.DATA[0][11],
            online_received_date: this.datePipe.transform(resp.data.DATA[0][12], 'dd/MM/yyyy'),

          });
        }

        if(resp.data.DATA[0][6] == 'DD'){
          let value = resp.data.DATA[0][6];

          this.onSelectPaymentPlanMode(value);

          this.paymentPlan_form.patchValue({

           planDD_bank_name: resp.data.DATA[0][15],
           planDD_name_on_dd: resp.data.DATA[0][16],
           //  planDD_amount: resp.data.DATA[0][20],
           payment_plan_paidTo: resp.data.DATA[0][19],
           planDD_dd_number: resp.data.DATA[0][18],
          });
        }
        console.log(resp.data);
        if(resp.data.DATA[0][26]){
          //  this.paymentPlan_form.patchValue({
          //   paymentPlan_task_description: resp.data.DATA[0][26]
          //  })
          try {
            
            let rawData = JSON.parse(resp.data.DATA[0][34]); 
        
            if (Array.isArray(rawData) && rawData.length > 0) {
              
              let lastValue = rawData[rawData.length - 1];        
              
              this.paymentPlan_form.patchValue({
                paymentPlan_task_description: lastValue
              });
        
              
            } else {
              console.warn('Parsed data is not a valid array or is empty:', rawData);
            }
          } catch (error) {
            console.error('Error parsing data:', error);
          }
        }else{
          this.paymentPlan_form.patchValue({
            paymentPlan_task_description: 'Following up on the payment of'+' '+resp.data.DATA[0][3],
          })
        }
        

       
        this.paymentPlan_form.patchValue({
          
          paymentPlan_id: resp.data.DATA[0][0],
          paymentPlan_booking_id: resp.data.DATA[0][2],
          paymentPlan_buyer_id: resp.data.DATA[0][1],

          paymentPlan_date: this.datePipe.transform(resp.data.DATA[0][4], 'dd-MM-yyyy'),
          paymentPlan_amount: resp.data.DATA[0][3],
          paymentPlan_status: resp.data.DATA[0][5],
          paymentPlan_mode: resp.data.DATA[0][6],
          paymentPlan_reason: resp.data.DATA[0][20],         
          visitor_name: resp.data.DATA[0][23],         
          paymentPlan_task_contact: resp.data.DATA[0][24],    
            
                 
          paymentPlan_task_title: resp.data.DATA[0][25],
          paymentPlan_task_Assignee: resp.data.DATA[0][27],
          paymentPlan_task_Reporter: resp.data.DATA[0][28],
          paymentPlan_task_Action: resp.data.DATA[0][29],


          paymentPlan_task_action_response_logs: resp.data.DATA[0][30],
          // paymentPlan_task_action_response: resp.data.DATA[0][30],
          paymentPlan_task_action_response: '',
          
        });
        
        if(resp.data.DATA[0][32] || resp.data.DATA[0][34] ){
          
          this.additionalFollow = false;
          const checkbox = document.getElementById('nextFollowCRM') as HTMLInputElement;
          if(checkbox){
            checkbox.checked = false;
            this.hideAddMoreFollowUpButton= true;
            // this.showDuplicateCheckbox = true;
          }
        }else{
          this.hideAddMoreFollowUpButton= false;
          this.additionalFollow = false;
          const checkbox = document.getElementById('nextFollowCRM') as HTMLInputElement;
          if(checkbox){
            checkbox.checked = false;
          }
        }

        // this.showFollowup();
        let followupDates = resp.data.DATA[0][31];
        let followupNotes = resp.data.DATA[0][34];
        let followupTimes = resp.data.DATA[0][32];
        
        // Ensure it's an actual array and extract only the first element
        if ((typeof followupNotes === 'string') && (typeof followupTimes === 'string')) {
          try {
            followupNotes = JSON.parse(followupNotes); // Convert string to array if needed
            followupTimes = JSON.parse(followupTimes); 
            followupDates = JSON.parse(followupDates);
          } catch (e) {
            console.error("Invalid JSON format in followup_notes:", followupTimes);
          }
        }
        const firstFollowUpDate = Array.isArray(followupDates) ? followupDates[0] : followupDates;
        
        const firstFollowUpNote = Array.isArray(followupNotes) ? followupNotes[0] : followupNotes;
        const firstFollowUpTime = Array.isArray(followupTimes) ? followupTimes[0] : followupTimes;
        this.nextFollowup.patchValue({
          // followup_date: this.datePipe.transform(resp.data.DATA[0][31], 'dd-MM-yyyy'),
          followup_date: firstFollowUpDate,
          followup_Time: firstFollowUpTime,
          followup_notes: firstFollowUpNote,
        });

        let responseStringDate = Array.isArray(followupDates) ? followupDates.join(',') : followupDates;
        let valueAfterCommasDate = responseStringDate.split(',').slice(1);

        let responseString = Array.isArray(followupNotes) ? followupNotes.join(',') : followupNotes;
        let valuesAfterCommas = responseString.split(',').slice(1); // Get all values after the first comma

        let responseStringTime = Array.isArray(followupTimes) ? followupTimes.join(',') : followupTimes;
        let valueAfterCommasTime = responseStringTime.split(',').slice(1);

        
        let commaCount = (responseString.match(/,/g) || []).length;
        
        for (let i = 0; i < valuesAfterCommas.length; i++) {
            this.addNewFollowUpGroup();
            const formArray = this.paymentdetail.get('address') as FormArray;
            formArray.at(i).patchValue({ fuDesp: valuesAfterCommas[i].trim() });
            formArray.at(i).patchValue({ fuTime: valueAfterCommasTime[i].trim() });
            formArray.at(i).patchValue({ fuDate: valueAfterCommasDate[i].trim() });
        }
     

        this.isHideFollowUps = false;
        this.paymentPlan_form.get('visitor_name').disable();
        this.paymentPlan_form.get('paymentPlan_task_contact').disable();
        // this.isVisitorNameReadOnly = true;

      });
    }
  }

  onSelectPlanPaymentMode(value) {

    // this.plan_save_transaction_form.get('plan_save_online_transferred_from').clearValidators();
    // this.plan_save_transaction_form.get('plan_save_online_bank_name').clearValidators();
    // this.plan_save_transaction_form.get('plan_save_online_acc_holder_name').clearValidators();
    // this.plan_save_transaction_form.get('plan_save_online_recieved_date').clearValidators();
  
    // this.plan_save_transaction_form.get('plan_save_cash_submitted_by').clearValidators();
    // this.plan_save_transaction_form.get('plan_save_cash_date').clearValidators();
  
    // this.plan_save_transaction_form.get('plan_save_dd_bank_name').clearValidators();
    // this.plan_save_transaction_form.get('plan_save_dd_name').clearValidators();
    // this.plan_save_transaction_form.get('plan_save_dd_number').clearValidators();

    // this.plan_save_transaction_form.get('plan_save_chequeName').clearValidators();
    // this.plan_save_transaction_form.get('plan_save_chequeNumber').clearValidators();
    // this.plan_save_transaction_form.get('plan_save_chequeSubmitDate').clearValidators();
    // this.plan_save_transaction_form.get('plan_save_chequeDate').clearValidators();
  

    if (value === 'Cheque') {

      this.plan_save_transaction_form.get('plan_save_cash_submitted_by').clearValidators();
      this.plan_save_transaction_form.get('plan_save_cash_date').clearValidators();
    
      this.plan_save_transaction_form.get('plan_save_dd_bank_name').clearValidators();
      this.plan_save_transaction_form.get('plan_save_dd_name').clearValidators();
      this.plan_save_transaction_form.get('plan_save_dd_number').clearValidators();

      this.plan_save_transaction_form.get('plan_save_online_transferred_from').clearValidators();
      this.plan_save_transaction_form.get('plan_save_online_bank_name').clearValidators();
      this.plan_save_transaction_form.get('plan_save_online_acc_holder_name').clearValidators();
      this.plan_save_transaction_form.get('plan_save_online_recieved_date').clearValidators();

        this.transCond = true;
        this.transCondRby = true;
        this.transCond33 = true;
        this.transCond44 = false;
        this.transCond464 = true;
        this.transCond55 = false;
        this.transCond66 = false;
        this.isDDSelected = false;
        this.isCQSelected = true;
      
        this.plan_save_transaction_form.get('plan_save_chequeName');
        this.plan_save_transaction_form.get('plan_save_chequeNumber');
        this.plan_save_transaction_form.get('plan_save_chequeSubmitDate');
        this.plan_save_transaction_form.get('plan_save_chequeDate');
    
    }
    
    if(value == 'Online'){

  
      this.plan_save_transaction_form.get('plan_save_cash_submitted_by').clearValidators();
      this.plan_save_transaction_form.get('plan_save_cash_date').clearValidators();
    
      this.plan_save_transaction_form.get('plan_save_dd_bank_name').clearValidators();
      this.plan_save_transaction_form.get('plan_save_dd_name').clearValidators();
      this.plan_save_transaction_form.get('plan_save_dd_number').clearValidators();

      this.plan_save_transaction_form.get('plan_save_chequeName').clearValidators();
      this.plan_save_transaction_form.get('plan_save_chequeNumber').clearValidators();
      this.plan_save_transaction_form.get('plan_save_chequeSubmitDate').clearValidators();
      this.plan_save_transaction_form.get('plan_save_chequeDate').clearValidators();



        this.transCond = true;
        this.transCondRby = true;
        this.transCond33 = false;
        this.transCond44 = true;
        this.transCond464 = true;
        this.transCond55 = false;
        this.transCond66 = false;
        this.isDDSelected = false;
        this.isCQSelected = false;
        
        
        this.plan_save_transaction_form.get('plan_save_online_transferred_from');
        this.plan_save_transaction_form.get('plan_save_online_bank_name');
        this.plan_save_transaction_form.get('plan_save_online_acc_holder_name');
        this.plan_save_transaction_form.get('plan_save_online_recieved_date');      
     
      
    }

    if(value == 'Cash'){
      

      this.plan_save_transaction_form.get('plan_save_online_transferred_from').clearValidators();
      this.plan_save_transaction_form.get('plan_save_online_bank_name').clearValidators();
      this.plan_save_transaction_form.get('plan_save_online_acc_holder_name').clearValidators();
      this.plan_save_transaction_form.get('plan_save_online_recieved_date').clearValidators();
    
  
      this.plan_save_transaction_form.get('plan_save_dd_bank_name').clearValidators();
      this.plan_save_transaction_form.get('plan_save_dd_name').clearValidators();
      this.plan_save_transaction_form.get('plan_save_dd_number').clearValidators();

      this.plan_save_transaction_form.get('plan_save_chequeName').clearValidators();
      this.plan_save_transaction_form.get('plan_save_chequeNumber').clearValidators();
      this.plan_save_transaction_form.get('plan_save_chequeSubmitDate').clearValidators();
      this.plan_save_transaction_form.get('plan_save_chequeDate').clearValidators();


      this.plan_save_transaction_form.get('plan_save_cash_submitted_by');
      this.plan_save_transaction_form.get('plan_save_cash_date');
        
        
      this.transCond = true;
      this.transCondRby = true;
      this.transCond33 = false;
      this.transCond44 = false;
      this.transCond464 = true;
      this.transCond55 = true;
      this.transCond66 = false;
      this.isDDSelected = false;
      this.isCQSelected = false;

      this.plan_save_transaction_form.patchValue({
        plan_save_transaction_accHead:'firm',
        plan_save_transaction_accHSubHead:'Manoj Rajput Property Layout Pvt Ltd',
      });
      

    }
    if(value == 'DD'){

      this.plan_save_transaction_form.get('plan_save_online_transferred_from').clearValidators();
      this.plan_save_transaction_form.get('plan_save_online_bank_name').clearValidators();
      this.plan_save_transaction_form.get('plan_save_online_acc_holder_name').clearValidators();
      this.plan_save_transaction_form.get('plan_save_online_recieved_date').clearValidators();
    
      this.plan_save_transaction_form.get('plan_save_cash_submitted_by').clearValidators();
      this.plan_save_transaction_form.get('plan_save_cash_date').clearValidators();

      this.plan_save_transaction_form.get('plan_save_chequeName').clearValidators();
      this.plan_save_transaction_form.get('plan_save_chequeNumber').clearValidators();
      this.plan_save_transaction_form.get('plan_save_chequeSubmitDate').clearValidators();
      this.plan_save_transaction_form.get('plan_save_chequeDate').clearValidators();
        

        
      this.plan_save_transaction_form.get('plan_save_dd_bank_name');
      this.plan_save_transaction_form.get('plan_save_dd_name');
      this.plan_save_transaction_form.get('plan_save_dd_number');


      this.transCond = true;
      this.transCondRby = true;
      this.transCond33 = false;
      this.transCond44 = false;
      this.transCond464 = true;
      this.transCond55 = false;
      this.transCond66 = true;
      this.isDDSelected = true;
      this.isCQSelected = false;

    }

    if(value == 0){

      this.plan_save_transaction_form.get('plan_save_chequeName').clearValidators();
      this.plan_save_transaction_form.get('plan_save_chequeNumber').clearValidators();
      this.plan_save_transaction_form.get('plan_save_chequeSubmitDate').clearValidators();
      this.plan_save_transaction_form.get('plan_save_chequeDate').clearValidators();

      this.plan_save_transaction_form.get('plan_save_online_transferred_from').clearValidators();
      this.plan_save_transaction_form.get('plan_save_online_bank_name').clearValidators();
      this.plan_save_transaction_form.get('plan_save_online_acc_holder_name').clearValidators();
      this.plan_save_transaction_form.get('plan_save_online_recieved_date').clearValidators();


      this.plan_save_transaction_form.get('plan_save_cash_submitted_by').clearValidators();
      this.plan_save_transaction_form.get('plan_save_cash_date').clearValidators();
      
      this.plan_save_transaction_form.get('plan_save_dd_bank_name').clearValidators();
      this.plan_save_transaction_form.get('plan_save_dd_name').clearValidators();
      this.plan_save_transaction_form.get('plan_save_dd_number').clearValidators();

      this.transCond = false;
      this.transCondRby = false;
      this.transCond33 = false;
      this.transCond44 = false;
      this.transCond464 = false;
      this.transCond55 = false;
      this.transCond66 = false;
      this.isDDSelected = false;
      this.isCQSelected = false;
    }
  }

  onSelectDonePlanPaymentMode(value) {

    if(value == 'Cheque'){

      this.plan_done_transaction_form.get('plan_done_chequeName');
      this.plan_done_transaction_form.get('plan_done_bank_name');
      this.plan_done_transaction_form.get('plan_done_chequeNumber');
      this.plan_done_transaction_form.get('plan_done_chequeSubmitDate');
      this.plan_done_transaction_form.get('plan_done_chequeClearDate');
      this.plan_done_transaction_form.get('plan_done_chequeDate');
      
         
      
      
      this.transCond = true;
      this.transCondRby = true;
      this.transCond33 = true;
      this.transCond44 = false;
      this.transCond444 = true;
      this.transCond55 = false;
      this.transCond66 = false;
      this.isDDSelected = false;
      this.isCQSelected = true;
    }
    
    if(value == 'Online'){
      
      
      this.plan_done_transaction_form.get('plan_done_online_transferred_from');
      this.plan_done_transaction_form.get('plan_done_online_bank_name');
      this.plan_done_transaction_form.get('plan_done_online_acc_holder_name');
      this.plan_done_transaction_form.get('plan_done_online_recieved_date');
      
      
      this.transCond = true;
      this.transCondRby = false;
      this.transCond33 = false;
      this.transCond44 = true;
      this.transCond444 = true;
      this.transCond55 = false;
      this.transCond66 = false;
      this.isDDSelected = false;
      this.isCQSelected = false;
      
      
    }
    if(value == 'Cash'){
      
      
      
      this.plan_done_transaction_form.get('plan_done_cash_submitted_by');
      this.plan_done_transaction_form.get('plan_done_cash_date');
     
      
      this.transCond = true;
      this.transCondRby = true;
      this.transCond33 = false;
      this.transCond44 = false;
      this.transCond444 = true;
      this.transCond55 = true;
      this.transCond66 = false;
      this.isDDSelected = false;
      this.isCQSelected = false;
      

    }
    if(value == 'DD'){
      
      
      this.plan_done_transaction_form.get('plan_done_dd_bank_name');
      this.plan_done_transaction_form.get('plan_done_dd_name');
      this.plan_done_transaction_form.get('plan_done_dd_number');


      this.transCond = true;
      this.transCondRby = true;
      this.transCond33 = false;
      this.transCond44 = false;
      this.transCond444 = true;
      this.transCond55 = false;
      this.transCond66 = true;
      this.isDDSelected = true;
      this.isCQSelected = false;

    }

    if(value == 0){
      this.transCond = false;
      this.transCondRby = false;
      this.transCond33 = false;
      this.transCond44 = false;
      this.transCond444 = false;
      this.transCond55 = false;
      this.transCond66 = false;
      this.isDDSelected = false;
      this.isCQSelected = false;
    }
  }

  DonePayment() {

    this.submit_btn = true;
    var plan_done_transValue = {
      trans_date: this.plan_done_transaction_form.get('plan_done_transaction_date').value,
      plan_done_all_recieved_date: this.plan_done_transaction_form.get('plan_done_all_recieved_date').value,
      trans_mode: this.plan_done_transaction_form.get('plan_done_transaction_mode').value,
      trans_amount: this.plan_done_transaction_form.get('plan_done_amount').value,
      trans_status: this.plan_done_transaction_form.get('plan_done_status').value,
      // trans_recieved_by: this.plan_done_transaction_form.get('plan_done_recieved_by').value,
      trans_acc_head: this.plan_done_transaction_form.get('plan_done_transaction_accHead').value,
      trans_acc_subhead: this.plan_done_transaction_form.get('plan_done_transaction_accHSubHead').value
    }
    

    if(Object.values(plan_done_transValue).every(value => value)) {
      

      // Validate amount
      const plan_done_amount = this.plan_done_transaction_form.get("plan_done_amount").value;
      const amountErrors = [];

      if (!plan_done_amount) {
        amountErrors.push("Amount is required");
      } else if (!/^\d+(\.\d{1,2})?$/.test(plan_done_amount)) {
        amountErrors.push("Please Enter Valid Amount");
      }

      if (amountErrors.length > 0) {
        Swal.fire({
          title: 'Validation Errors',
          text: amountErrors.join('\n'),
          icon: 'error',
          confirmButtonText: 'Okay'
        });
        return; // Stop further execution if there are errors
      }

      let checkPayMode = this.plan_done_transaction_form.get("plan_done_transaction_mode").value;
      var plan_done_additionalValue = null;
     
      if (checkPayMode === 'Cheque') {
        plan_done_additionalValue = {
          trans_cheque_name: this.plan_done_transaction_form.get('plan_done_chequeName').value,
          //trans_done_bank_name: this.plan_done_transaction_form.get('plan_done_bank_name').value,
          trans_cheque_number: this.plan_done_transaction_form.get('plan_done_chequeNumber').value,
          trans_cheque_submit_date: this.plan_done_transaction_form.get('plan_done_chequeSubmitDate').value,
          trans_cheque_date: this.plan_done_transaction_form.get('plan_done_chequeDate').value,
        };
      } else if (checkPayMode === 'Online') {
        plan_done_additionalValue = {
          //trans_online_transferred_from: this.plan_done_transaction_form.get('plan_done_online_transferred_from').value,
          //trans_online_bank_name: this.plan_done_transaction_form.get('plan_done_online_bank_name').value,
         // trans_online_acc_holder_name: this.plan_done_transaction_form.get('plan_done_online_acc_holder_name').value,
          // trans_online_recieved_date: this.plan_done_transaction_form.get('plan_done_online_recieved_date').value,
        };
      } else if (checkPayMode === 'Cash') {
        
        plan_done_additionalValue = {
          trans_cash_submitted_by: this.plan_done_transaction_form.get('plan_done_cash_submitted_by').value,
          
          // trans_cash_date: this.plan_done_transaction_form.get('plan_done_cash_date').value,
        };
      } else if (checkPayMode === 'DD') {
        plan_done_additionalValue = {
          trans_dd_bank_name: this.plan_done_transaction_form.get('plan_done_dd_bank_name').value,
          trans_dd_name: this.plan_done_transaction_form.get('plan_done_dd_name').value,
          trans_dd_number: this.plan_done_transaction_form.get('plan_done_dd_number').value,
          trans_dd_submit_date: this.plan_done_transaction_form.get('plan_done_dd_submit_date').value,
        };
      }

      const validateFields = (fields) => {
        const errors = [];


    
        // Custom validation logic
        if (checkPayMode === 'Cheque') {
          if (!fields.trans_cheque_name) errors.push("Cheque Name is required");
          if (!/^[A-Za-z\s]+$/.test(fields.trans_cheque_name)) errors.push("Cheque Name must only contain letters");
          if (!/^\d+$/.test(fields.trans_cheque_number)) errors.push("Cheque No must be numeric");
        } else if (checkPayMode === 'Online') {
          // if (!fields.trans_online_transferred_from) errors.push("Transferred From is required");
          // if (!/^[A-Za-z\s]+$/.test(fields.trans_online_transferred_from)) errors.push("Transferred From must only contain letters");
          // if (!fields.trans_online_bank_name) errors.push("Bank Name is required");
          // if (!/^[A-Za-z\s]+$/.test(fields.trans_online_bank_name)) errors.push("Bank Name must only contain letters");
          // if (!fields.trans_online_acc_holder_name) errors.push("Account Holder Name is required");
          // if (!/^[A-Za-z\s]+$/.test(fields.trans_online_acc_holder_name)) errors.push("Account Holder Name must only contain letters");
        } else if (checkPayMode === 'Cash') {
          // if (!fields.trans_cash_submitted_by) errors.push("Submitted By is required");
          if (!/^[A-Za-z\s]+$/.test(fields.trans_cash_submitted_by)) errors.push("Submitted By must only contain letters");
          // Removed validation for cashDate
        } else if (checkPayMode === 'DD') {
          if (!fields.trans_dd_bank_name) errors.push("Bank Name is required");
          if (!/^[A-Za-z\s]+$/.test(fields.trans_dd_bank_name)) errors.push("Bank Name must only contain letters");
          if (!fields.trans_dd_name) errors.push("Name on DD is required");
          if (!/^[A-Za-z\s]+$/.test(fields.trans_dd_name)) errors.push("Name on DD must only contain letters");
          if (!/^\d+$/.test(fields.trans_dd_number)) errors.push("DD Number must be numeric");
        }
    
        return errors;
      };

      var validationErrors = validateFields(plan_done_additionalValue);
      
      if (validationErrors.length > 0) {
        Swal.fire({
          title: 'Validation Errors',
          text: validationErrors.join('\n , '),
          icon: 'error',
          confirmButtonText: 'Okay'
        });
        return;
      } else {

        
       
        if(Object.values(plan_done_transValue).every(value => value) && Object.values(plan_done_additionalValue).every(value => value )){
          // console.log(true); 
        }else{
          // console.log(false);
        }
      }


    }else{
      Swal.fire('Alert', 'Some fields are missing', 'info');
    }



    if (Object.values(plan_done_transValue).every(value => value) && Object.values(plan_done_additionalValue).every(value => value )) {
      
      Swal.fire({
        title: 'Are you sure?',
        text: 'Do you want to proceed with the payment submission?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      }).then((result) => {
        if (result.isConfirmed) {
          
          let doneFormData = new FormData();
  
          doneFormData.append('transaction_id', this.plan_done_transaction_form.get('done_transaction_id').value);
          doneFormData.append('booking_id', this.plan_done_transaction_form.get('done_booking_id').value);
          doneFormData.append('trans_date', this.plan_done_transaction_form.get('plan_done_transaction_date').value);
          doneFormData.append('trans_mode', this.plan_done_transaction_form.get('plan_done_transaction_mode').value);
          doneFormData.append('trans_amount', this.plan_done_transaction_form.get('plan_done_amount').value);
          doneFormData.append('trans_status', this.plan_done_transaction_form.get('plan_done_status').value);
          doneFormData.append('trans_recieved_by', this.plan_done_transaction_form.get('plan_done_recieved_by').value);
          doneFormData.append('trans_all_recieved_date', this.plan_done_transaction_form.get('plan_done_all_recieved_date').value);
          doneFormData.append('trans_acc_head', this.plan_done_transaction_form.get('plan_done_transaction_accHead').value);
          doneFormData.append('trans_acc_subhead', this.plan_done_transaction_form.get('plan_done_transaction_accHSubHead').value);
          doneFormData.append('buyer_id', this.prsn_id);
          doneFormData.append('block_number', this.regMeasurement.get('mBlockNumber').value);
  
          if (this.plan_done_transaction_form.get('plan_done_transaction_mode').value == 'Cheque') {
            doneFormData.append('trans_cheque_name', this.plan_done_transaction_form.get('plan_done_chequeName').value);
            doneFormData.append('trans_cheque_bank_name', this.plan_done_transaction_form.get('plan_done_bank_name').value);
            doneFormData.append('trans_cheque_number', this.plan_done_transaction_form.get('plan_done_chequeNumber').value);
            doneFormData.append('trans_cheque_submit_date', this.plan_done_transaction_form.get('plan_done_chequeSubmitDate').value);
            doneFormData.append('trans_cheque_clear_date', this.plan_done_transaction_form.get('plan_done_chequeClearDate').value);
            doneFormData.append('trans_cheque_date', this.plan_done_transaction_form.get('plan_done_chequeDate').value);
          }
  
          if (this.plan_done_transaction_form.get('plan_done_transaction_mode').value == 'Online') {
            //doneFormData.append('trans_online_transferred_from', this.plan_done_transaction_form.get('plan_done_online_transferred_from').value);
            //doneFormData.append('trans_online_bank_name', this.plan_done_transaction_form.get('plan_done_online_bank_name').value);
            doneFormData.append('trans_cheque_bank_name', this.plan_done_transaction_form.get('plan_done_bank_name').value);
            // doneFormData.append('trans_online_recieved_date', this.plan_done_transaction_form.get('plan_done_online_recieved_date').value);
          }
  
          if (this.plan_done_transaction_form.get('plan_done_transaction_mode').value == 'Cash') {
            doneFormData.append('trans_cash_submitted_by', this.plan_done_transaction_form.get('plan_done_cash_submitted_by').value);
            // doneFormData.append('trans_cash_date', this.plan_done_transaction_form.get('plan_done_cash_date').value);
          }
  
          if (this.plan_done_transaction_form.get('plan_done_transaction_mode').value == 'DD') {
            doneFormData.append('trans_dd_bank_name', this.plan_done_transaction_form.get('plan_done_dd_bank_name').value);
            doneFormData.append('trans_dd_name', this.plan_done_transaction_form.get('plan_done_dd_name').value);
            doneFormData.append('trans_dd_number', this.plan_done_transaction_form.get('plan_done_dd_number').value);
            doneFormData.append('trans_dd_submit_date', this.plan_done_transaction_form.get('plan_done_dd_submit_date').value);
            doneFormData.append('trans_dd_clear_date', this.plan_done_transaction_form.get('plan_done_dd_clear_date').value);
            doneFormData.append('trans_cheque_bank_name', this.plan_done_transaction_form.get('plan_done_bank_name').value);
          }

          
          this.billingservice.addDonePaymentDetail(doneFormData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
            if (resp.data.CODE == 200 || resp) {
              Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: resp.data.MESSAGE,
                showConfirmButton: false,
                timer: 2000
              });
              this.plan_done_transaction_form.reset();
              this.reload();
              this.donecloseModal();
              this.submit_btn = false;
  
              if (resp.data[0]['transaction_id']) {
                this.plan_done_transaction_form.disable();
                this.isDone = false;
              }
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Failed',
                showConfirmButton: false,
                timer: 3000
              });
            }
          });
        }
      });
    } else {
      Swal.fire('Alert', 'Some Fields are Missing', 'info');
    }
  }
  

  public donecloseModal() {

    
    // this.transaction_form.reset();
    // this.plan_done_transaction_form.reset();
    this.closebutton1.forEach(item => {
      item.nativeElement.click();
    });

    
  }

  save_regPaymentPlanForm() {

    var value1 = {
      // buyer_id: this.prsn_id,
      // booking_id: this.id,
      date: this.paymentPlan_form.get("paymentPlan_date").value,
      amount: this.paymentPlan_form.get("paymentPlan_amount").value,
      reason: this.paymentPlan_form.get("paymentPlan_reason").value,
      status: this.paymentPlan_form.get("paymentPlan_status").value,
      mode: this.paymentPlan_form.get("paymentPlan_mode").value,
      paymentPlan_task_title: this.paymentPlan_form.get("paymentPlan_task_title").value,
      paymentPlan_task_Assignee: this.paymentPlan_form.get("paymentPlan_task_Assignee").value,
      paymentPlan_task_Reporter: this.paymentPlan_form.get("paymentPlan_task_Reporter").value,
      paymentPlan_task_Action: this.paymentPlan_form.get("paymentPlan_task_Action").value,
      paymentPlan_task_contact: this.paymentPlan_form.get("paymentPlan_task_contact").value,
    };

   
    
    
    if (Object.values(value1).every(value => value)) {
      

     
      const amount = this.paymentPlan_form.get("paymentPlan_amount").value;
      const amountErrors = [];
      // const taskTitle = this.paymentPlan_form.get("paymentPlan_task_title").value;
      const taskTitleErrors = [];

      
      // if (!/^[A-Za-z\s]+$/.test(taskTitle)) {
      //     taskTitleErrors.push("Task title should contain characters only.");
      // }
      if (taskTitleErrors.length > 0 || amountErrors.length > 0) {
        Swal.fire({
          icon: 'error',
          title: 'Validation Error !!',
          text: [...taskTitleErrors, ...amountErrors].join('\n'),
          confirmButtonText: 'Ok'
        });
          
          return;
      }

      if (!amount) {
        amountErrors.push("Amount is required");
      } else if (!/^\d+(\.\d{1,2})?$/.test(amount)) {
        amountErrors.push("Please Enter Valid Amount");
      }

      if (amountErrors.length > 0) {
        Swal.fire({
          title: 'Validation Errors',
          text: amountErrors.join('\n'),
          icon: 'error',
          confirmButtonText: 'Okay'
        });
        return; 
      }
    
      let checkPayMode = this.paymentPlan_form.get("paymentPlan_mode").value;
      var additionalValue = null;
    
      if (checkPayMode === 'Cheque') {
        additionalValue = {
          chequeName: this.paymentPlan_form.get("payment_plan_chequeName").value,
          chequeNo: this.paymentPlan_form.get("payment_plan_chequeNo").value,
          recievedBy: this.paymentPlan_form.get("payment_plan_paidTo").value
        };
      } else if (checkPayMode === 'DD') {
        additionalValue = {
          ddBankName: this.paymentPlan_form.get("planDD_bank_name").value,
          ddName: this.paymentPlan_form.get("planDD_name_on_dd").value,
          ddNumber: this.paymentPlan_form.get("planDD_dd_number").value,
          recievedBy: this.paymentPlan_form.get("payment_plan_paidTo").value
        };
      }
    
 

        
      if(Object.values(value1).every(value => value) || Object.values(additionalValue).every(value => value )){
        
        this.validatedNowSave = true;
      }
 
    }

    if(this.paymentPlan_form.valid){

      this.submit_btn = true;
      let regPaymentPlanData = new FormData();
      regPaymentPlanData.append("id", this.paymentPlan_form.get("paymentPlan_id").value);      
      regPaymentPlanData.append("booking_id", this.paymentPlan_form.get("paymentPlan_booking_id").value);
      regPaymentPlanData.append("buyer_id", this.paymentPlan_form.get("paymentPlan_buyer_id").value);

      // const paymentPlanDate = this.paymentPlan_form.get("paymentPlan_date").value;
      // const dateObj = new Date(paymentPlanDate);
      // const day = dateObj.getDate().toString().padStart(2, '0'); 
      // const month = String(dateObj.getMonth() + 1).padStart(2, '0'); 
      // const year = dateObj.getFullYear();
      // const formattedDate = `${month}/${day}/${year}`;
      // regPaymentPlanData.append("date", formattedDate);
      regPaymentPlanData.append("date", this.paymentPlan_form.get("paymentPlan_date").value);
       //const formatdate = this.datePipe.transform(this.paymentPlan_form.get("paymentPlan_date").value,'yyyy-mm-dd');
       //console.log(formatdate);

      regPaymentPlanData.append("amount", this.paymentPlan_form.get("paymentPlan_amount").value);
      regPaymentPlanData.append("reason", this.paymentPlan_form.get("paymentPlan_reason").value);
      regPaymentPlanData.append("status", this.paymentPlan_form.get("paymentPlan_status").value);
      regPaymentPlanData.append("mode", this.paymentPlan_form.get("paymentPlan_mode").value);
      regPaymentPlanData.append("recievedBy", this.paymentPlan_form.get("payment_plan_paidTo").value);

      regPaymentPlanData.append("task_title", this.paymentPlan_form.get("paymentPlan_task_title").value);
      regPaymentPlanData.append("task_description", this.paymentPlan_form.get("paymentPlan_task_description").value);
      regPaymentPlanData.append("task_assignee", this.paymentPlan_form.get("paymentPlan_task_Assignee").value);
      regPaymentPlanData.append("task_reporter", this.paymentPlan_form.get("paymentPlan_task_Reporter").value);
      regPaymentPlanData.append("task_action", this.paymentPlan_form.get("paymentPlan_task_Action").value);
      // regPaymentPlanData.append("task_action_response", this.paymentPlan_form.get("paymentPlan_task_action_response").value);

      const currentDate = new Date();
      const formattedDate = currentDate.getDate().toString().padStart(2, '0') + '-' +
                            (currentDate.getMonth() + 1).toString().padStart(2, '0') + '-' +
                            currentDate.getFullYear();
      
      let taskActionResponseLogs = this.paymentPlan_form.get("paymentPlan_task_action_response_logs").value || "";
      let taskActionResponse = formattedDate + ' -> ' + this.paymentPlan_form.get("paymentPlan_task_action_response").value;
      
      if (taskActionResponseLogs) {
        taskActionResponseLogs = `${taskActionResponse}\n\n${taskActionResponseLogs}`;
      } else {
        taskActionResponseLogs = taskActionResponse;
      }
      
      
      regPaymentPlanData.append("task_action_response", taskActionResponseLogs);

      if(this.followupadd == true){
        let nextFollowUpDate = this.nextFollowup.get("followup_date").value;
        const addressArray = this.paymentdetail.get('address') as FormArray;       
       
        let followUpDates = addressArray.controls.map(control => control.value.fuDate);        
        // If nextFollowUpDate exists, add it to the array
        if (nextFollowUpDate) {
          followUpDates.unshift(nextFollowUpDate);
        }        
        // Determine the value to append to "date"
        if (followUpDates.length > 0) {
          regPaymentPlanData.append("date", followUpDates[followUpDates.length - 1]); // Append last date
        } else {
          regPaymentPlanData.append("date", this.paymentPlan_form.get("paymentPlan_date").value); // Default to paymentPlan_date
        }
        
        // Append nextFollowUpDate properly
        if (followUpDates.length === 1) {
          regPaymentPlanData.append("nextFollowUpDate", followUpDates[0]);
        } else if (followUpDates.length > 1) {
          regPaymentPlanData.append("nextFollowUpDate", JSON.stringify(followUpDates));
        } else {
          regPaymentPlanData.append("nextFollowUpDate", this.paymentPlan_form.get("paymentPlan_date").value);
        }
        
        // regPaymentPlanData.append("nextFollowUpTime",this.nextFollowup.get("followup_Time").value);

        

        let nextFollowUpTime = this.nextFollowup.get("followup_Time").value;
        let followUpTimes = addressArray.controls.map(control => control.value.fuTime);
        followUpTimes.unshift(nextFollowUpTime);
        regPaymentPlanData.append("nextFollowUpTime",JSON.stringify(followUpTimes));
        

        let nextFollowUpNote = this.nextFollowup.get("followup_notes").value;        
        let followUpDescriptions = addressArray.controls.map(control => control.value.fuDesp);        
        followUpDescriptions.unshift(nextFollowUpNote);       
        regPaymentPlanData.append('nextFollowUpNotes', JSON.stringify(followUpDescriptions));
      }


      let checkPayMode = this.paymentPlan_form.get("paymentPlan_mode").value;

      if(checkPayMode == 'Cheque'){

        regPaymentPlanData.append("chequeName", this.paymentPlan_form.get("payment_plan_chequeName").value);
        regPaymentPlanData.append("chequeNo", this.paymentPlan_form.get("payment_plan_chequeNo").value);
        
      }

      if(checkPayMode == 'Online'){

          // regPaymentPlanData.append("onlineTransferredFrom", this.paymentPlan_form.get("online_transferred_from").value);
          // regPaymentPlanData.append("onlineBankName", this.paymentPlan_form.get("online_bank_name").value);
          // regPaymentPlanData.append("onlineAccHolderName", this.paymentPlan_form.get("online_account_holder_name").value);
          // regPaymentPlanData.append("onlineRecievedDate", this.paymentPlan_form.get("online_received_date").value);
      }

      if(checkPayMode =='Cash'){

          // regPaymentPlanData.append("cashAmount", this.paymentPlan_form.get("plan_cash_amount").value);
          // regPaymentPlanData.append("cashRecievedBy", this.paymentPlan_form.get("plan_cash_recievedBy").value);
          // regPaymentPlanData.append("cashSubmittedBy", this.paymentPlan_form.get("plan_cash_submittedBy").value);
          // regPaymentPlanData.append("cashDate", this.paymentPlan_form.get("plan_cash_date").value);
      }

      if(checkPayMode == 'DD'){

          regPaymentPlanData.append("ddBankName", this.paymentPlan_form.get("planDD_bank_name").value);
          regPaymentPlanData.append("ddName", this.paymentPlan_form.get("planDD_name_on_dd").value);
          // regPaymentPlanData.append("ddAmount", this.paymentPlan_form.get("planDD_dd_amount").value);
          regPaymentPlanData.append("ddNumber", this.paymentPlan_form.get("planDD_dd_number").value);
      }

     

     
      
         
      this.billingservice.updatePaymentFollowUp(regPaymentPlanData).pipe(takeUntil(this.destroy$)).subscribe((resp) => {

        this.close_payment_paln_button.nativeElement.click();
        if (resp.data.CODE == 200 || resp) {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: resp.MESSAGE,
            showConfirmButton: false,
            timer: 2000
          });
          this.close_payment_paln_button.nativeElement.click();
          // this.rerender();
          // this.reload();
          this.PlanSearch();
          this.paymentPlan_form.reset();
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
    
    else {
      this.isButtonDisabled = false;
      this.submitted = true;
      this.submit_btn = true;
      Swal.fire('Alert', 'Some fields are missing', 'info');

    }
    

  }


  DeletePaymentPlan(id) {
  
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this payment plan?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then((result) => {
      
      if (result.isConfirmed) {
        // Prepare the form data for deletion
        let transactionForm = new FormData();
        transactionForm.append("id", id);  
  
        
        this.billingservice.deletePaymentPlan(id).pipe(takeUntil(this.destroy$)).subscribe((response) => {
          if (response) {
            
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Payment plan deleted successfully.',
              showConfirmButton: false,
              timer: 2000,  
            });
            this.reload(); 
          } else {
            
            Swal.fire({
              icon: 'error',
              title: 'Failed!',
              text: 'An error occurred while deleting the payment plan.',
              showConfirmButton: false,
              timer: 3000,  
            });
          }
        });
      }
    });
  }


  planDone(title,id,index,buyer_id){
   
    this.isDone = true;
   // this.SaveViewForDone = true;
   let formData = new FormData();
  
   formData.append('id',id);

     this.billingservice.view(formData).pipe(takeUntil(this.destroy$)).subscribe((resp) => {

       if(resp.data.DATA[0][6] == 'Cheque'){
         this.isDDSelected = false;
         this.isCQSelected = true;
         let value = resp.data.DATA[0][6];

         this.onSelectDonePlanPaymentMode(value);

         this.plan_done_transaction_form.patchValue({
           plan_done_chequeName: resp.data.DATA[0][7],
           plan_done_chequeNumber: resp.data.DATA[0][8],
          
           
         });
       }

       if(resp.data.DATA[0][6] == 'Online'){
         this.isDDSelected = false;
         this.isCQSelected = false;
         let value = resp.data.DATA[0][6];

         this.onSelectDonePlanPaymentMode(value);

         this.plan_done_transaction_form.patchValue({

           plan_done_online_transferred_from: resp.data.DATA[0][9],
           plan_done_online_bank_name: resp.data.DATA[0][10],
           plan_done_online_acc_holder_name: resp.data.DATA[0][11],
           plan_done_online_recieved_date: this.datePipe.transform(resp.data.DATA[0][12], 'dd-MM-yyyy'),

         });
       }

       if (resp.data.DATA[0][6] == 'Cash') {
         this.isDDSelected = false;
         this.isCQSelected = false;
         let value = resp.data.DATA[0][6];
         this.onSelectDonePlanPaymentMode(value);

         this.plan_done_transaction_form.patchValue({
           
           plan_done_cash_submitted_by: resp.data.DATA[0][13],
           plan_done_cash_date: this.datePipe.transform(resp.data.DATA[0][14], 'dd/MM/yyyy'),       
           plan_done_transaction_accHead: 'firm',
           plan_done_transaction_accHSubHead: 'Manoj Rajput Property Layout Pvt Ltd',
         });

         // this.plan_done_transaction_form.get('plan_done_transaction_accHead').disable();

       }

       if(resp.data.DATA[0][6] == 'DD'){
         this.isDDSelected = true;
         this.isCQSelected = false;
         let value = resp.data.DATA[0][6];

         this.onSelectDonePlanPaymentMode(value);

         this.plan_done_transaction_form.patchValue({

           plan_done_dd_bank_name: resp.data.DATA[0][15],
           plan_done_dd_name: resp.data.DATA[0][16],
           //  planDD_amount: resp.data.DATA[0][20],
           plan_done_dd_number: resp.data.DATA[0][18],
         });
       }

       this.plan_done_transaction_form.patchValue({
         done_transaction_id: resp.data.DATA[0][0],
        //  done_buyer_id: resp.data.DATA[0][1],
         done_booking_id: resp.data.DATA[0][2],
         
         plan_done_transaction_date: this.datePipe.transform(resp.data.DATA[0][4], 'dd-MM-yyyy'),
         plan_done_transaction_mode: resp.data.DATA[0][6],
         plan_done_amount: resp.data.DATA[0][3], //3
         plan_done_status: resp.data.DATA[0][5],
         plan_done_recieved_by: resp.data.DATA[0][19],


       });

      
       this.billingservice.checkview(formData).pipe(takeUntil(this.destroy$)).subscribe((resp) => {

        
         if(resp.data === true){

           this.plan_done_transaction_form.disable();
           // this.isDone = false;
           this.isSave = false;
           // this.isChangeSave[index] = false;
           // this.isChangeSave = false;

           this.billingservice.view_PaymentDetail(id).pipe(takeUntil(this.destroy$)).subscribe(Response => {
   
             
             this.plan_done_transaction_form.patchValue({
       

               done_transaction_id: Response.DATA[0][0],
               done_booking_id: Response.DATA[0][1],
               plan_done_transaction_date: this.datePipe.transform(Response.DATA[0][3], 'dd/MM/yyyy'),
               plan_done_transaction_mode: Response.DATA[0][2],

               plan_done_chequeName: Response.DATA[0][4],
               plan_done_chequeNumber: Response.DATA[0][5],
               plan_done_chequeDate: this.datePipe.transform(Response.DATA[0][6], 'dd/MM/yyyy'),
               plan_done_chequeSubmitDate: this.datePipe.transform(Response.DATA[0][7], 'dd/MM/yyyy'),

               plan_done_online_transferred_from: Response.DATA[0][8],
               plan_done_online_bank_name: Response.DATA[0][9],
               plan_done_online_acc_holder_name: Response.DATA[0][10],
               plan_done_all_recieved_date: this.datePipe.transform(Response.DATA[0][11], 'dd/MM/yyyy'),

               plan_done_cash_submitted_by: Response.DATA[0][12],
               // plan_done_cash_date: this.datePipe.transform(Response.DATA[0][13], 'dd/MM/yyyy'),
               
               plan_done_dd_bank_name: Response.DATA[0][13],
               plan_done_dd_name: Response.DATA[0][14],
               plan_done_dd_number: Response.DATA[0][15],
               plan_done_dd_submit_date: this.datePipe.transform(Response.DATA[0][16], 'dd/MM/yyyy'),


               plan_done_status: Response.DATA[0][19],
               plan_done_amount: Response.DATA[0][17],
               plan_done_recieved_by: Response.DATA[0][18],
               plan_done_transaction_accHead: Response.DATA[0][20],
               plan_done_transaction_accHSubHead: Response.DATA[0][21], //this.getAccSubHead(Response.DATA[0][20])
               
               
       
             });
           });
         }
         else{
           
           this.plan_done_transaction_form.enable();
           this.isSave = true;
           // this.isChangeSave[index] = true;
           // this.isChangeSave = true;
         }
       });
     });  

     

 }

public donePlancloseModal() {

  // this.plan_done_transaction_form.reset();
  this.closebutton1.forEach(item => {
    item.nativeElement.click()
  });

}

donePlanmodalClose(){

  this.plan_done_transaction_form.reset();
  let value=0;

  this.onSelectDonePlanPaymentMode(value);
  this.donePlancloseModal();
  this.plan_done_transaction_form.enable();
}

}
