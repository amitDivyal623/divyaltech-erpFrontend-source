import { Component, OnInit, OnDestroy } from '@angular/core';
import {NgbCalendar,NgbDate,NgbDateStruct,NgbInputDatepickerConfig} from '@ng-bootstrap/ng-bootstrap';
import { Observable, from, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BillingService } from 'src/app/services/billing.service';
import { DatePipe } from '@angular/common';
import { HrService } from 'src/app/services/hr.service';
import { CrmService } from 'src/app/services/crm.service';

class DataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}

@Component({
  selector: 'app-account-transaction',
  templateUrl: './account-transaction.component.html',
  styleUrls: ['./account-transaction.component.css'],
  providers: [NgbInputDatepickerConfig]
})
export class AccountTransactionComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  model: NgbDateStruct;
  model_add: NgbDateStruct;
  model_view: NgbDateStruct;
  model_edit: NgbDateStruct;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();

  paymentDetaildatatableParameter: { person_type: any; booking_id: any };
  // PaymentDetaildata: [];
  [x: string]: any;
  constructor(config: NgbInputDatepickerConfig, calendar: NgbCalendar,private http:HttpClient,private billingservice: BillingService, private datePipe: DatePipe,private hrservice:HrService,private crmservice:CrmService) { 
    // customize default values of datepickers used by this component tree
    config.minDate = {year: 1900, month: 1, day: 1};
    config.maxDate = {year: 2099, month: 12, day: 31};

    // days that don't belong to current month are not visible
    config.outsideDays = 'hidden';

    // weekends are disabled
    config.markDisabled = (date: NgbDate) => calendar.getWeekday(date) >= 6;

    // setting datepicker popup to close only on click outside
    config.autoClose = 'outside';

    // setting datepicker popup to open above the input
    config.placement = ['bottom-left', 'bottom-right'];
  }

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

  ngOnInit(): void {
    this.paymentDetailDatatableCode();
    this.getAccHead();
    this.getAllAccSubHead();
    this.employeetypenamelist();
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

  paymentDetailDatatableCode() {
    // this.paymentDetaildatatableParameter.person_type = "buyer";
    // this.paymentDetaildatatableParameter.booking_id = this.id;
    const that = this;
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });

    this.dtOptions = {
      processing: true,
      serverSide: true,
      pageLength: 10,
      dom: 'lrtip',
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
      columnDefs: [
        { orderable: false, targets: 6 },
      ],
      ajax: (dataTablesParameters: any, callback) => {
        // Object.assign(dataTablesParameters, this.witDatatableParameter);
        that.http.post<DataTablesResponse>(environment.APIEndpoint + 'transaction.fetchAllPaymentDetails&reload=1', Object.assign(dataTablesParameters, this.paymentDetaildatatableParameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {

          
          that.PaymentDetaildata = resp.data;
          // that.paidAmount();
            
          callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsTotal,
            data: []
          });
        });
      }
    };
  }

  ViewPaymentDetail(title,trans_id) {
    
    this.modalTitle = title;
    this.submit_btn = false;
    this.plan_save_transaction_form.reset();
    this.isView = false;
    let response_data: any = {};
    this.modalTitle.includes('View') ? (this.plan_save_transaction_form.disable()) : (this.plan_save_transaction_form.enable(), this.isView = true);
    // alert(trans_id);
    // this.plan_save_transaction_form.disable();
    // this.plan_save_transaction_form.enable();
    this.billingservice.view_PaymentDetail(trans_id).pipe(takeUntil(this.destroy$)).subscribe(Response => {


    
      for (let i = 0; i < Response.COLUMNS.length; i++) {
        response_data[Response.COLUMNS[i]] = Response.DATA[0][i]
      }


      if (Response.DATA[0][2] == 'Online') {
        let value = 'Online';
        this.onSelectPlanPaymentMode(value);

        this.plan_save_transaction_form.patchValue({
 
          plan_save_online_transferred_from: Response.DATA[0][8],
          plan_save_online_bank_name: Response.DATA[0][9],
          plan_save_online_acc_holder_name: Response.DATA[0][10],
          plan_save_online_recieved_date: this.datePipe.transform(Response.DATA[0][11], 'dd/MM/yyyy'),
          
        });

      }
      if (Response.DATA[0][2] == 'Cash') {

        let value = 'Cash';
        this.onSelectPlanPaymentMode(value);
        this.plan_save_transaction_form.patchValue({
          plan_save_transaction_mode:'Cash',
          plan_save_cash_submitted_by: Response.DATA[0][12],
          plan_save_cash_date: this.datePipe.transform(Response.DATA[0][13], 'dd/MM/yyyy'),

        })
      }

      if(Response.DATA[0][2] == 'DD'){

        let value = 'DD';
        this.onSelectPlanPaymentMode(value);

        this.plan_save_transaction_form.patchValue({
          plan_save_dd_bank_name: Response.DATA[0][13],   
          plan_save_dd_name: Response.DATA[0][14],   
          plan_save_dd_number: Response.DATA[0][15],   
          plan_save_dd_submit_date: this.datePipe.transform(Response.DATA[0][16], 'dd/MM/yyyy'),   
         
        })
      }

      if (Response.DATA[0][2] == 'Cheque') {
        let value = 'Cheque';
        this.onSelectPlanPaymentMode(value);

        this.plan_save_transaction_form.patchValue({
          // transaction_date: this.datePipe.transform(Response.DATA[0][8], 'dd/MM/yyyy'),
          // transaction_amount: Response.DATA[0][3],
          // transaction_mode: Response.DATA[0][2],
          plan_save_chequeNumber: Response.DATA[0][5],
          plan_save_chequeDate: this.datePipe.transform(Response.DATA[0][6], 'dd/MM/yyyy'),
          plan_save_chequeSubmitDate: this.datePipe.transform(Response.DATA[0][7], 'dd/MM/yyyy'),
          plan_save_chequeName: Response.DATA[0][4],

            
        });
      }


      this.plan_save_transaction_form.patchValue({

        plan_transaction_id: Response.DATA[0][0],
        plan_save_transaction_booking_id: Response.DATA[0][1],
        plan_save_transaction_date: this.datePipe.transform(Response.DATA[0][3], 'dd/MM/yyyy'),
        plan_save_transaction_mode: Response.DATA[0][2],
        plan_save_status: Response.DATA[0][19],
        plan_save_amount: Response.DATA[0][17],
        plan_save_recieved_by: Response.DATA[0][18],
        plan_save_transaction_accHead: Response.DATA[0][20],
        plan_save_transaction_accHSubHead: Response.DATA[0][21], 
        plan_save_all_recieved_date: this.datePipe.transform(Response.DATA[0][11], 'dd/MM/yyyy'),

      });
    });

    
  }

  savePlanmodalClose(){

    this.plan_save_transaction_form.reset();
    this.plan_save_transaction_form.markAsUntouched();

    let value=0;

    this.onSelectPlanPaymentMode(value);
    this.savePlancloseModal();
    this.plan_save_transaction_form.enable();
  }

  public savePlancloseModal() {

    this.plan_save_transaction_form.reset();
    // this.closebutton.forEach(item => {
    //   item.nativeElement.click()
    // });
   
  
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
        this.transCond33 = true;
        this.transCond44 = false;
        this.transCond464 = true;
        this.transCond55 = false;
        this.transCond66 = false;
      
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
        this.transCond33 = false;
        this.transCond44 = true;
        this.transCond464 = true;
        this.transCond55 = false;
        this.transCond66 = false;
        
        
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
      this.transCond33 = false;
      this.transCond44 = false;
      this.transCond464 = true;
      this.transCond55 = true;
      this.transCond66 = false;

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
      this.transCond33 = false;
      this.transCond44 = false;
      this.transCond464 = true;
      this.transCond55 = false;
      this.transCond66 = true;

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
      this.transCond33 = false;
      this.transCond44 = false;
      this.transCond464 = false;
      this.transCond55 = false;
      this.transCond66 = false;
    }
  }



  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

