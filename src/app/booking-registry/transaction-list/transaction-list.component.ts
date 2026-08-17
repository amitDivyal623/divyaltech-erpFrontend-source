import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef, Injectable, ViewChildren, Input } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder, FormControlName } from '@angular/forms';
import { NgbCalendar, NgbDateAdapter, NgbDate, NgbDateParserFormatter, NgbDateStruct, NgbInputDatepickerConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { Observable, from, Subject, forkJoin, of, iif } from 'rxjs';

import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { DataTableDirective } from 'angular-datatables';
import { TransactionModalComponent } from 'src/app/shared/transaction-modal/transaction-modal.component';
import { environment } from 'src/environments/environment';
import { BillingService } from 'src/app/services/billing.service';
import { DatePipe, Location } from '@angular/common';
import { HrService } from 'src/app/services/hr.service';
import { CrmService } from 'src/app/services/crm.service';
import { distinctUntilChanged, switchMap, map, takeUntil } from 'rxjs/operators';
import * as moment from 'moment';
import { v4 as uuid } from 'uuid';
import { ActivatedRoute, Router, NavigationStart } from '@angular/router';
import { StockService } from 'src/app/services/stock.service';
import { ContractorService } from 'src/app/services/contractor.service';

class DataTablesResponse {
  iTotalDisplayRecords(iTotalDisplayRecords: any) {
    throw new Error('Method not implemented.');
  }
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}

@Injectable()
export class CustomAdapter extends NgbDateAdapter<string> {

  readonly DELIMITER = '-';

  fromModel(value: string | null): NgbDateStruct | null {
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

  toModel(date: NgbDateStruct | null): string | null {
    return date ? date.day + this.DELIMITER + date.month + this.DELIMITER + date.year : null;
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
  selector: 'app-transaction-list',
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.scss'],
  providers: [
    NgbInputDatepickerConfig,
    { provide: NgbDateAdapter, useClass: CustomAdapter },
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter }
  ]
})




export class TransactionListComponent implements OnInit, OnDestroy {
  minDate = { year: 1900, month: 1, day: 1 };
  maxDate = { year: 2099, month: 12, day: 31 };
  selectedLogIds = new Set<number>();

  dtOptions: DataTables.Settings = {};
  dtOptions5: DataTables.Settings = {};
  dtOptions3: DataTables.Settings = {};
  dtOptions6: DataTables.Settings = {};
  dtOptions7: DataTables.Settings = {};
  dtOptions8: DataTables.Settings = {};
  dtOptions9: DataTables.Settings = {};
  dtOptions10: DataTables.Settings = {};
  dtOptions11: DataTables.Settings = {};

  dtOptions12: DataTables.Settings = {};
  modal: any;
  @ViewChild('content') content;
  @ViewChild('ngbDatepicker') dte: NgbDateStruct;
  @ViewChildren('closebutton') closebutton;
  @ViewChildren('closebankbutton') closebankbutton;
  @ViewChild('transactionModel') transactionModel: ElementRef;
  @ViewChild('transactionBankModel') transactionBankModel: ElementRef;
  @Input() submitted: boolean;
  dtTrigger: Subject<any> = new Subject<any>();
  dtTrigger5: Subject<any> = new Subject<any>();
  dtTrigger8: Subject<any> = new Subject<any>();
  dtTrigger7: Subject<any> = new Subject<any>();
  dtTrigger9: Subject<any> = new Subject<any>();
  dtTrigger10: Subject<any> = new Subject<any>();
  dtTrigger11: Subject<any> = new Subject<any>();
  dtTrigger12: Subject<any> = new Subject<any>();
  interCash: boolean = false;
  paymentRec: boolean = false;

  keyword = 'combinedSearch';
  keyword1 = 'incCombinedSearch';
  isShowPayMode: boolean = false;
  isIcmChequeMode: Boolean = false;
  isIcmCashMode: Boolean = false;
  isIcmOnlineCashMode: Boolean = false;
  isRentCashMode: Boolean = false;
  isDDSelected: Boolean = false;
  isCQSelected: Boolean = false;
  isShowPayModeForICM: boolean = false;
  isShowICMmngmtType: boolean = false;
  isShowCivilPayMode: boolean = false;
  isShowExpensePayMode: boolean = false;
  isShowCivilWork: boolean = false;
  isShowChequeModes: boolean = false;
  isShowOnlineModes: boolean = false;
  isShowCashModes: boolean = false;
  isShowDDModes: boolean = false;
  ishideSubmit: boolean = true;
  isbyDefaultallTrue: boolean = true;
  isExpenseDate: boolean = false;
  ishideBankSubmitbutton: boolean = true;
  private destroy$ = new Subject<void>();
  docLabel = 'Bill No.';
  poOptions: any[] = [];
  getAllPaidCustomersData: any[] = [];

  selectedTransaction: any;
  isEditMode: boolean = false;
  isSubmitDisabled: boolean = false;
  previousExpamount: number;
  previousINamount: number;
  previousICMamount: number;
  redirectAfterSave: { bookingId: string; prsnId: string } | null = null;
  previousPartyInCashAmt: number = 0;
  previousPartyOutCashAmt: number = 0;
  expenses: boolean = false;
  addPaySelect: boolean = false;
  addExpenseSelect: boolean = false;
  addInterSelect: boolean = false;
  addChequeMode: boolean = false;
  addBankMode: boolean = false;
  paymentDetaildatatableParameter: { person_type: any; booking_id: any; filterstatus: any; searchCommonTransType: any; searchPayMode: any; fromsearchRecDate: any; tosearchRecDate: any; bd_acc_head_in: any; bd_acc_sub_head_in: any; customerId: any; };
  paymentExpensedatatableParameter: { fromsearchRecDateExp: any; tosearchRecDateExp: any; expense_head_valueExp: any; searchPayModeExp: any; bd_acc_head_exp: any; bd_acc_sub_head_exp: any };
  paymentICMdatatablePatameter: { from_rec_date: any; to_rec_date: any; payment_mode: any };
  IcmInternalDatatableParameter: { fromDateInternal: any; toDateInternal: any; internal_from_acc_subhead: any; internal_to_acc_subhead: any; internal_from_bank_name: any; internal_to_bank_name: any };
  IcmPartyDatatableParameter: { fromInDateParty: any; fromOutDateParty: any; toInDateParty: any; toOutDateParty: any; icmParty_partyname: any };
  paymentDetailBankDatatableParameter: { bd_acc_head: any; bd_acc_sub_head: any; bd_bank_name: any };
  paymentDetailLogsDatatableParameter: { fromLogDate: any; toLogDate: any; actionMode: any };
  IcmCustomerDatatableParameter: { fromCustsearchDate: any; toCustsearchDate: any; icmParty_custname: any; }
  DatatableParameter = { dateFrom: '', dateTo: '', transType: '', payMode: '', ReceivedFrom: '', Holder: '', accHead: '', receviedBy: '', searchParty: '', accHolder: '', sendBy: '', fromAcc: '', toAcc: '', AccHead: '' };

  // Label for the shared amount field; switches for ICM Customer scenario
  get commonAmountLabel(): string {
    const transType = this.addTranscform?.get('commonTransType')?.value;
    const managementType = this.addTranscform?.get('icm_management_type')?.value;

    return transType === 'inter_cash_management' && managementType === 'icm_customer'
      ? 'Rotation Amount'
      : 'Amount';
  }

  srcTransactionForm = new FormGroup({
    searchdateFrom: new FormControl(),
    searchdateTo: new FormControl(),
    searchtransType: new FormControl(),
    searchpayMode: new FormControl(),
    searchReceivedFrom: new FormControl(),
    searchHolder: new FormControl(),
    searchaccHead: new FormControl(),
    searchreceviedBy: new FormControl(),
    searchParty: new FormControl(),
    searchAccHead: new FormControl(),
    availableCash: new FormControl(),
    bankAccHead: new FormControl(),
    bankAccSubHead: new FormControl(),
    bankAccBankName: new FormControl(),
    searchaccHolder: new FormControl(),
    cashInBankAcc: new FormControl(),
    // searchaccHand:new FormControl(),
    searchsendBy: new FormControl(),
    searchfromAcc: new FormControl(),
    searchtoAcc: new FormControl(),



  });

  loanDetail = new FormGroup({
    bTitle: new FormControl(''),
    bspouse: new FormControl(''),
    bname: new FormControl(''),
    bage: new FormControl(''),
    bcaste: new FormControl(''),
    boccupation: new FormControl(''),
    baadhar: new FormControl(''),
    bpancard: new FormControl(''),
    bmobileno: new FormControl(''),
    balternumber: new FormControl(''),
    bstate: new FormControl(''),
    bcity: new FormControl(''),
    baddress: new FormControl(''),
  })


  icmPartyForm = new FormGroup({
    bank_id: new FormControl(),
    bank_acc_head: new FormControl(),
    bank_acc_sub_head: new FormControl(),
    bank_bank_name: new FormControl(),
    bank_total_amount: new FormControl(),
  });

  icmInternalForm = new FormGroup({
    fromDateInternal: new FormControl(),
    toDateInternal: new FormControl(),
    internal_from_acc_subhead: new FormControl(),
    internal_to_acc_subhead: new FormControl(),
    internal_from_bank_name: new FormControl(),
    internal_to_bank_name: new FormControl(),
  });

  icmPartysearchForm = new FormGroup({
    fromInDateParty: new FormControl(),
    fromOutDateParty: new FormControl(),
    toInDateParty: new FormControl(),
    toOutDateParty: new FormControl(),
    icmParty_partyname: new FormControl(),
  });

  reportFormGroup = new FormGroup({
    fromLogDate: new FormControl(),
    toLogDate: new FormControl(),
    actionMode: new FormControl(),
  });

  addTranscform!: FormGroup;


  bankTransForm = new FormGroup({
    bd_acc_head: new FormControl(),
    bd_acc_sub_head: new FormControl(),
    bd_bank_name: new FormControl(),
    bd_total_amount: new FormControl(),
  });

  searchIN = new FormGroup({
    searchCommonTransType: new FormControl(),
    searchPayMode: new FormControl(),
    bd_acc_head_in: new FormControl(),
    bd_acc_sub_head_in: new FormControl(),
    customerId: new FormControl(),
    fromsearchRecDate: new FormControl(),
    tosearchRecDate: new FormControl(),
  });

  icmPartyCostForm = new FormGroup({
    fromCustsearchDate: new FormControl(),
    toCustsearchDate: new FormControl(),
    icmParty_custname: new FormControl(),
  });

  searchOUT = new FormGroup({
    fromsearchRecDateExp: new FormControl(),
    tosearchRecDateExp: new FormControl(),
    expense_head_valueExp: new FormControl(),
    searchPayModeExp: new FormControl(),
    bd_acc_head_exp: new FormControl(),
    bd_acc_sub_head_exp: new FormControl(),
  });

  searchICM = new FormGroup({

    from_rec_date: new FormControl(),
    to_rec_date: new FormControl(),
    payment_mode: new FormControl(),

  });

  expenseHeadMap: { [key: string]: string } = {
    'through_customer': 'Through Customer (IN)',
    'civil_work': 'Civil Work (IN)',
    'expenses': 'Expenses',
    'rental': 'Rental (IN)',
    'inter_cash_management': 'Inter Cash Management'
  };

  icmPaymentModes: { [Key: string]: string } = {
    'icm_cheque': 'Cheque',
    'icm_online': 'Online',
    'icm_cash': 'Cash',
    'icm_cash_withdrawal': 'Cash Withdrawal'
  };

  icmPartPaymentModes: { [key: string]: string } = {
    'party_in_cheque': 'Cheque',
    'party_in_online': 'Online',
    'party_in_cash': 'Cash',
    'party_in_dd': 'DD',
    'party_out_cheque': 'Cheque',
    'party_out_online': 'Online',
    'party_out_cash': 'Cash',
    'party_out_dd': 'DD'
  }

  icmManagementType: { [key: string]: string } = {
    'icm_customer': 'Customer',
    'icm_internal': 'Internal',
    'icm_party': 'Party',
  }

  inOutchangeModes: { [key: string]: string } = {
    'icm_party': 'IN/OUT',
    'icm_internal': 'IN',
    'icm_customer': 'OUT',
  }





  model: any;
  [x: string]: any;
  @ViewChild(DataTableDirective) datatable_directive: any;
  @ViewChildren(DataTableDirective) dtElement: any;
  transactionTitle: string;
  resplookupExpHead: any;
  resplookupIncHead: any;

  constructor(private stockService: StockService, private contractorService: ContractorService, private modalService: NgbModal, private http: HttpClient, private fb: FormBuilder, private hrservice: HrService, private crmservice: CrmService, private billingservice: BillingService, private datePipe: DatePipe, private router: Router, private route: ActivatedRoute, private location: Location) {

    this.paymentDetaildatatableParameter = { person_type: '', booking_id: '', filterstatus: '', searchCommonTransType: '', searchPayMode: '', fromsearchRecDate: '', tosearchRecDate: '', bd_acc_head_in: '', bd_acc_sub_head_in: '', customerId: '' };
    this.paymentExpensedatatableParameter = { fromsearchRecDateExp: '', tosearchRecDateExp: '', expense_head_valueExp: '', searchPayModeExp: '', bd_acc_head_exp: '', bd_acc_sub_head_exp: '' };
    this.paymentICMdatatablePatameter = { from_rec_date: '', to_rec_date: '', payment_mode: '' };
    this.IcmInternalDatatableParameter = { fromDateInternal: '', toDateInternal: '', internal_from_acc_subhead: '', internal_to_acc_subhead: '', internal_from_bank_name: '', internal_to_bank_name: '' };
    this.IcmPartyDatatableParameter = { fromInDateParty: '', fromOutDateParty: '', toInDateParty: '', toOutDateParty: '', icmParty_partyname: '' };
    this.paymentDetailBankDatatableParameter = { bd_acc_head: '', bd_acc_sub_head: '', bd_bank_name: '' };
    this.IcmCustomerDatatableParameter = { fromCustsearchDate: '', toCustsearchDate: '', icmParty_custname: '' };
    this.paymentDetailLogsDatatableParameter = { fromLogDate: '', toLogDate: '', actionMode: '' }
  }



  ngOnInit(): void {
    // this.Admin = false;
    // this.Administrator = false;    
    // this.Accounts_Internal = false;
    // let role = sessionStorage.getItem('UserRole');
    // let match = role.split(',');
    // for(let a in match){
    //   if(match[a] == 'Accounts Internal'){
    //     this.Accounts_Internal = true;
    //   }
    //   if(match[a] == 'Administrator'){
    //     this.Administrator = true;
    //   }
    //   if(match[a] == 'Admin'){
    //     this.Admin = true;
    //   }      
    // }


    this.addTranscform = new FormGroup({
      addpayMode: new FormControl(),
      transactions_id: new FormControl(),
      bookings_id: new FormControl(),
      expense_id: new FormControl(),
      expense_booking_id: new FormControl(),
      icm_booking_id: new FormControl(),
      icm_id: new FormControl(),
      icm_party_link_booking_id: new FormControl(),
      cq_senders_bank_name: new FormControl(),
      cq_cheque_number: new FormControl(),
      cq_submit_date: new FormControl(),
      cq_clear_date: new FormControl(),
      cq_recieved_by: new FormControl(),

      cash_submitted_by: new FormControl(),
      cash_recieved_by: new FormControl(),
      cash_issued_by: new FormControl(),

      dd_sender_bank_name: new FormControl(),
      dd_name_on_dd: new FormControl(),
      dd_number: new FormControl(),
      dd_submit_date: new FormControl(),
      dd_clear_date: new FormControl(),
      dd_recieved_by: new FormControl(),

      cw_recieved_source: new FormControl(),

      icmaddpayMode: new FormControl(),
      icm_cq_number: new FormControl(),
      icm_cq_submit_date: new FormControl(),
      icm_cq_clear_date: new FormControl(),
      icm_from_acc_head: new FormControl(),
      icm_from_acc_sub_head: new FormControl(),
      icm_form_bank_name: new FormControl(),
      icm_to_acc_head: new FormControl(),
      icm_to_acc_sub_head: new FormControl(),
      icm_to_bank_name: new FormControl(),
      icm_management_type: new FormControl(),
      icm_customer_name: new FormControl(),
      persons_id: new FormControl(),
      person_map_id: new FormControl(),
      person_plan_id: new FormControl(),
      icm_cust_cq_to_cqname: new FormControl(),
      icm_mgmt_party_name: new FormControl(),

      party_in_date: new FormControl(),
      party_in_mode: new FormControl(),
      party_in_amount: new FormControl(),
      party_in_acc_head: new FormControl(),
      party_in_acc_sub_head: new FormControl(),
      party_in_bank: new FormControl(),
      party_in_description: new FormControl(),

      party_out_date: new FormControl(),
      party_out_mode: new FormControl(),
      party_out_amount: new FormControl(),
      party_out_acc_head: new FormControl(),
      party_out_acc_sub_head: new FormControl(),
      party_out_bank: new FormControl(),
      party_out_description: new FormControl(),

      commonTransType: new FormControl(),
      common_time: new FormControl(),
      common_amount: new FormControl(),
      common_description: new FormControl(),
      common_amount_recieved_on: new FormControl(),
      common_account_head: new FormControl(),
      common_account_sub_head: new FormControl(),
      common_acc_bank_name: new FormControl(),

      tc_cust_name: new FormControl(),
      tc_contact: new FormControl(),
      tc_block_plot: new FormControl(),

      vender_name: new FormControl(),
      vechice_name: new FormControl(),
      vehicle_no: new FormControl(),

      expense_head_value: new FormControl(),
      exp_vendor_value: new FormControl(),
      exp_contractor_value: new FormControl(),

      ic_income_head: new FormControl(),
      // docType: new FormControl(),
      // docNumber: new FormControl(),
      // po_no: new FormControl(),
    });



    const roles = new Set((sessionStorage.getItem('UserRole') || '').split(','));
    this.Admin = roles.has('Admin');
    this.Administrator = roles.has('Administrator');
    this.Accounts_Internal = roles.has('Accounts Internal');

    this.transactionTitle = 'Add Transaction Details';

    this.paymentDetailDatatableCode();
    // this.paymentDetailDatatableCodeAll();
    this.expenseDatatableCode();
    this.icmDatatableCode();
    this.bankDatatableCode();
    this.loadAllbankData();
    this.logDatatableCode();
    this.icmInternalDatatableCode();
    this.icmCustomerDatatableCode();
    this.icmPartyDatatableCode();

    this.lookupdatalist();
    this.Incomelookupdatalist();
    this.changeAvaCash();
    this.submitted = false;

    this.getAccHeadICMFrom();
    this.getAccHeadICMTo();
    this.contractorlist();
    this.getallcontractorsData();

    this.commongetAccHead();
    this.commongetAllAccSubHead();
    this.commongetAllBankDetails();
    this.partyIngetAccHead();
    this.partyIngetAllAccSubHead();
    this.IcmInternalgetAllAccSubHead();
    this.partyIngetAllBankDetails();
    this.isShowPayMode = true;
    //this.isIcmChequeMode = false;


    this.getVehicleThroughContractor();
    this.employeetypenamelist();
    this.activateInternalTab();

    this.getAllPaidCustomersLists();
    // this.srcTransactionForm.get('bankAccBankName')?.valueChanges
    // .pipe(distinctUntilChanged())
    // .subscribe(value => {
    //   this.logSelectedBankDetails();
    // });
    // if(this.activeTab = 'BuyerTab'){      
    //   this.activateBuyerTab();
    // } 
    // else  if(this.activeTab = 'InternalTab'){

    //   this.activateInternalTab();
    // }

    if (this.activeICMTab = 'INTERNAL') {
      this.activeICMTab = 'INTERNAL';
    }

    // this.getDispatchedPOLists();
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {

      if (params['tab'] === 'expense') {
        this.activateExpenseTab();
      }

      if (params['openModal'] === 'add') {
        this.showLoader('Preparing transaction...');
        setTimeout(() => {
          if (params['vendorName']) {
            this.openAddTransactionModal(params);
          } else if (params['contractor_name']) {
            this.openContractorTransactionModal(params);
          } else if (params['source'] === 'paymentPlanRotation') {
            this.openRedirectedTransactionModal(params);
          }
        }, 300); // important
      }

    });


    this.router.events.pipe(takeUntil(this.destroy$)).subscribe(event => {
      if (event instanceof NavigationStart) {
        this.forceCloseModal();
      }
    });

  }

  // getAllPaidCustomersLists(){
  //   let formData = new FormData();
  //   this.crmservice.getAllPaidCustomersLists(formData).subscribe(resp => {
  //     this.getAllPaidCustomersData = resp;
  //   });
  // }
  getAllPaidCustomersLists() {
    let formData = new FormData();

    this.crmservice.getAllPaidCustomersLists(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {

      this.getAllPaidCustomersData = resp.map((item: any) => {
        return {
          combinedSearch: `${item.cust_name} (${item.plot_names})`, // label
          persons_id: item.trans_booking_id // value
        };
      });

    });
  }


  openRedirectedTransactionModal(params: any) {

    const systemDate = this.datePipe.transform(new Date(), 'dd-MM-yyyy');
    this.redirectAfterSave = {
      bookingId: params['bookingId'] || '',
      prsnId: params['prsn_id'] || params['buyerId'] || ''
    };
    this.populateRedirectedIcmCustomer(params).pipe(takeUntil(this.destroy$)).subscribe((redirectData) => {
      this.customerdataList = redirectData.customers;
      this.GetCustCqList = redirectData.chequeList;
      const selectedChequeOption = this.getRedirectedChequeOption(params, redirectData.chequeList);

      this.openModel();
      this.addTranscform.patchValue({
        commonTransType: 'inter_cash_management',
        icm_management_type: 'icm_customer',
        common_amount_recieved_on: systemDate,
        persons_id: redirectData.personsId,
        icm_customer_name: redirectData.customerDisplay,
        icm_cust_cq_to_cqname: selectedChequeOption
      });
      this.onAddSelectChange({ target: { value: 'inter_cash_management' } });
      this.onSelectMngmtType({ target: { value: 'icm_customer' } });
      if (selectedChequeOption) {
        this.handleModeChange(selectedChequeOption);
      }
      this.hideLoader();
      this.resetTransactionPageUrl();
    }, () => {
      this.openModel();
      this.addTranscform.patchValue({
        commonTransType: 'inter_cash_management',
        icm_management_type: 'icm_customer',
        common_amount_recieved_on: systemDate,
        persons_id: params['prsn_id'] || params['buyerId'] || '',
        icm_customer_name: params['buyerName'] || ''
      });
      this.onAddSelectChange({ target: { value: 'inter_cash_management' } });
      this.onSelectMngmtType({ target: { value: 'icm_customer' } });
      this.hideLoader();
      this.resetTransactionPageUrl();
    });
  }

  populateRedirectedIcmCustomer(params: any) {
    const personsId = params['prsn_id'] || params['buyerId'] || '';
    const buyerName = params['buyerName'] || '';

    const chequeHeadData = new FormData();
    chequeHeadData.append('persons_id', String(personsId));

    const chequeList$ = personsId
      ? this.billingservice.getCustCheqeList(chequeHeadData).pipe(takeUntil(this.destroy$))
      : of({ data: [] });

    if (buyerName) {
      const customerlist = new FormData();
      customerlist.append('value', buyerName);

      return forkJoin({
        customerResp: this.crmservice.getRegisteredCustomerLists(customerlist).pipe(takeUntil(this.destroy$)),
        chequeResp: chequeList$
      }).pipe(
        map(({ customerResp, chequeResp }) => {
          const customers = (customerResp?.data || []).map(item => ({
            persons_id: item.persons_id,
            cust_name: item.cust_name,
            ProductCode: item.ProductCode,
            combinedSearch: `${item.cust_name}${item.ProductCode ? ', ' + item.ProductCode : ''}`
          }));

          const matchedCustomer = customers.find(item => String(item.persons_id) === String(personsId));

          return {
            personsId: matchedCustomer ? matchedCustomer.persons_id : personsId,
            customerDisplay: matchedCustomer ? matchedCustomer.combinedSearch : buyerName,
            customers: customers,
            chequeList: chequeResp?.data || []
          };
        })
      );
    }

    return chequeList$.pipe(
      map((chequeResp) => ({
        personsId: personsId,
        customerDisplay: buyerName,
        customers: [],
        chequeList: chequeResp?.data || []
      }))
    );
  }

  getRedirectedChequeOption(params: any, chequeList: any[] = []): string {
    const matchedItem = chequeList.find(cqList =>
      this.normalizeRedirectValue(cqList.mode) === this.normalizeRedirectValue(params['mode']) &&
      this.normalizeRedirectAmount(cqList.amount) === this.normalizeRedirectAmount(params['amount']) &&
      this.normalizeRedirectValue(cqList.cheque_number) === this.normalizeRedirectValue(params['chequeNumber']) &&
      this.normalizeRedirectValue(cqList.cheque_name) === this.normalizeRedirectValue(params['chequeBankName'])
    );

    return matchedItem ? this.buildChequeOptionValue(matchedItem) : '';
  }

  buildChequeOptionValue(cqList: any): string {
    return (cqList.cheque_name && cqList.cheque_number)
      ? `${cqList.mode} , ${cqList.amount} , ${cqList.cheque_number} , ${cqList.cheque_name}`
      : `${cqList.mode} , ${cqList.amount}`;
  }

  normalizeRedirectValue(value: any): string {
    return String(value || '').trim().toLowerCase();
  }

  normalizeRedirectAmount(value: any): string {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue.toString() : this.normalizeRedirectValue(value);
  }


  private toNgbDateStruct(dateValue: any): NgbDateStruct | null {
    if (!dateValue) return null;

    const date = new Date(dateValue);
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate()
    };
  }


  openAddTransactionModal(params: any) {
    this.redirectAfterSave = null;
    this.transactionModel.nativeElement.click();

    this.waitForVendors(() => {

      const ngbDate = this.datePipe.transform(params.fromDate, 'dd-MM-yyyy');

      const selectedVendor = this.respcontractor.find(
        v => v.contractorName.trim().toLowerCase() === params.vendorName.trim().toLowerCase()
      );

      const vendorId = selectedVendor ? selectedVendor.contractorId : '';

      this.addTranscform.patchValue({
        commonTransType: 'expenses',
        common_amount_recieved_on: ngbDate,
        exp_vendor_value: vendorId,
        common_amount: params.amount,
        common_description: params.description,
        docType: params.docType,
        po_no: params.po_no
      });

      this.onAddSelectChange({ target: { value: 'expenses' } });
      // this.onDocTypeChange();
      // this.addTranscform.get('docNumber').setValue(params.docNumber);
      this.hideLoader();
      this.resetTransactionPageUrl();
    });
  }

  openContractorTransactionModal(params: any) {
    this.redirectAfterSave = null;
    this.transactionModel.nativeElement.click();

    this.waitForContractor(() => {
      const ngbDate = this.datePipe.transform(params.credit_date, 'dd-MM-yyyy');

      // 1️⃣ Patch expense head first
      this.addTranscform.patchValue({
        expense_head_value: 'CONTRACTOR',
        commonTransType: 'expenses',
        common_amount_recieved_on: ngbDate,
        exp_contractor_value: params.contractor_name,
        common_amount: params.credit_amount,
        common_description: params.remarks
      });

      // 2️⃣ Wait for form + UI to settle
      setTimeout(() => {
        // 3️⃣ Existing logic
        this.onAddSelectChange({ target: { value: 'expenses' } });
        this.onExpenseHeadChange({ target: { value: 'CONTRACTOR' } }, true);
        this.hideLoader();
        this.resetTransactionPageUrl();
      }, 0);
    });
  }



  waitForVendors(callback: () => void) {
    const timer = setInterval(() => {
      if (this.respcontractor && this.respcontractor.length > 0) {
        clearInterval(timer);
        callback();
      }
    }, 100);
  }

  waitForContractor(callback: () => void) {
    const timer = setInterval(() => {
      if (this.respcontractors && this.respcontractors.length > 0) {
        clearInterval(timer);
        callback();
      }
    }, 100);
  }


  forceCloseModal() {

    // Close any open Bootstrap modal
    const modals = document.querySelectorAll('.modal.show');
    modals.forEach(m => {
      m.classList.remove('show');
      (m as HTMLElement).style.display = 'none';
    });

    // Remove modal backdrops
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(b => b.remove());

    // Restore body scroll
    document.body.classList.remove('modal-open');
    document.body.style.paddingRight = '0px';
  }


  showLoader(message: string = 'Preparing your transaction…') {
    Swal.fire({
      title: message,
      html: `
        <div style="font-size:14px; color:#6c757d; margin-top:8px;">
          Please wait while we set things up
        </div>
      `,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      backdrop: true,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }


  hideLoader() {
    Swal.close();
  }

  resetTransactionPageUrl() {
    const cleanPath = this.router.url.split('?')[0];
    this.location.replaceState(cleanPath);
  }


  getDispatchedPOLists() {
    let formData = new FormData();
    formData.append('dispatched', '1');

    this.stockService.getDispatchedPOLists(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe(resp => {

        // Map only PO numbers to dropdown format
        this.poOptions = resp.data.map((po: any) => ({
          value: po.purchase_order_number,
          label: po.purchase_order_number
        }));
      });
  }

  activateExpenseTab() {
    setTimeout(() => {
      document.getElementById('docs-tab-workdetail')?.click();
    }, 0);
  }


  getVehicleThroughContractor() {
    let venderData = new FormData();
    this.hrservice.getvechicalList(venderData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.setvechicalList = resp.data;
    });
  }

  VendorfilterSelected(e) {
    let venderData = new FormData();
    venderData.append('VendorId', e.target.value);
    this.hrservice.getvechicalList(venderData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.setvechicalList = resp.data;
    });
  }

  vechicelfilterSelected(e) {
    let VehicleID = new FormData();
    VehicleID.append('VehicleID', e.target.value);
    this.hrservice.getVehicleName(VehicleID).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.vechicalList = resp.data;
      this.vehicleno = this.vechicalList[0]['VehicleNo'];

      this.addTranscform.get('vehicle_no').setValue(this.vehicleno);
    });
  }

  activateBuyerTab() {
    this.activeTab = 'BuyerTab';
  }

  activateInternalTab() {
    this.activeTab = 'InternalTab';
  }

  activatePaymentPlanTab() {
    this.activeTab = 'PaymentPlanTab';
  }

  callbankChange() {
    let accHead = this.srcTransactionForm.get('bankAccHead').value;
    let accSubHead = this.srcTransactionForm.get('bankAccSubHead').value;
    let bankName = this.srcTransactionForm.get('bankAccBankName').value;

    this.logSelectedBankDetails(accHead, accSubHead, bankName);
  }


  logSelectedBankDetails(accHead, accSubHead, bankName) {
    let formData = new FormData();
    formData.append('accHead', accHead);
    formData.append('accSubHead', accSubHead);
    formData.append('accbankname', bankName);

    this.billingservice.getSelectedBankAmounts(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {

      if (resp.OUTvalue.DATA[0][0] || resp.INvalue.DATA[0][0]) {

        let InValue = resp.INvalue.DATA[0][0];
        let OutValue = resp.OUTvalue.DATA[0][0];

        if (InValue == '' || InValue == 'null') {
          InValue = 0;
        } else if (OutValue == '' || OutValue == 'null') {
          OutValue = 0;
        }

        const FinalSumDiff = InValue - OutValue;

        const formattedValue = new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR'
        }).format(FinalSumDiff);
        this.srcTransactionForm.get('cashInBankAcc').setValue(formattedValue);

      } else {
        const formattedValue = new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR'
        }).format(0);
        this.srcTransactionForm.get('cashInBankAcc').setValue(formattedValue);
      }
      // if(resp.DATA[0][0]){        
      //   let cashAmount = resp.DATA[0][0];

      //   const formattedValue = new Intl.NumberFormat('en-IN', {
      //     style: 'currency',
      //     currency: 'INR'
      //   }).format(cashAmount);
      //   this.srcTransactionForm.get('cashInBankAcc').setValue(formattedValue);
      // }else{
      //   this.srcTransactionForm.get('cashInBankAcc').setValue(0);
      // }      
    });
  }

  // GetAvailableAmount(){
  //   let formData = new FormData();

  //   this.billingservice.getAvailableAmounts(formData).subscribe(resp => {

  //     if(resp.DATA[0][0]){
  //       let availableCashAmount = resp.DATA[0][0];
  //       this.srcTransactionForm.get('availableCash').setValue(availableCashAmount);
  //     }
  //   })
  // }

  lookupdatalist() {

    let bankdata = new FormData();
    bankdata.append('lookupname', 'Expense Head');
    this.hrservice.fetch_lookupdata(bankdata).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.resplookupExpHead = resp.data;
    });
  }

  Incomelookupdatalist() {

    let bankdata = new FormData();
    bankdata.append('lookupname', "Income Head");
    this.hrservice.fetch_lookupdata(bankdata).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.resplookupIncHead = resp.data;
    });
  }

  changeAvaCash() {
    this.ExpselectedTransaction = this.ExpPaymentDetaildata;

    let getFormdata = new FormData();
    this.billingservice.getTotaAmntFromIN(getFormdata).pipe(takeUntil(this.destroy$)).subscribe(resp => {

      if (resp && (resp.INvalue.DATA[0][0] || resp.OUTvalue.DATA[0][0])) {
        let SumIn = resp.INvalue.DATA[0][0];
        let SumOut = resp.OUTvalue.DATA[0][0];
        const DifferValue = SumIn - SumOut;

        const formattedValue = new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR'
        }).format(DifferValue);
        this.srcTransactionForm.get('availableCash').setValue(formattedValue);
      }
    });

  }

  onCwRecievedSourceChange(value) {
    let transType = typeof (value) == "object" ? value.target.value : value;

    if (transType == 'cw_rental') {
      this.isRentCashMode = true;
    }
    else {
      this.isRentCashMode = false;
    }
  }



  onAddSelectChange(value) {
    let transType = typeof (value) == "object" ? value.target.value : value;

    if (transType == 'through_customer') {
      // Switching to "Through Customer" - clear stale Civil Work fields so they
      // can't be silently carried into a Through Customer income transaction.
      this.addTranscform.patchValue({
        cw_recieved_source: null,
        vender_name: null,
        vechice_name: null,
        vehicle_no: null,
      }, { emitEvent: false });

      // this.addTranscform.get('tc_cust_name').clearValidators();
      // this.addTranscform.get('tc_cust_name').updateValueAndValidity();
      // this.addTranscform.get('tc_contact').clearValidators();
      // this.addTranscform.get('tc_contact').updateValueAndValidity();
      // this.addTranscform.get('tc_block_plot').clearValidators();
      // this.addTranscform.get('tc_block_plot').updateValueAndValidity();


      // this.addTranscform.get('cw_recieved_source').clearValidators();
      // this.addTranscform.get('cw_recieved_source').updateValueAndValidity();

      // this.addTranscform.get('expense_head_value').clearValidators();
      // this.addTranscform.get('expense_head_value').updateValueAndValidity();

      // this.addTranscform.get('addpayMode').clearValidators();
      // this.addTranscform.get('addpayMode').updateValueAndValidity();
      // this.addTranscform.get('icmaddpayMode').clearValidators();
      // this.addTranscform.get('icmaddpayMode').updateValueAndValidity();
      this.isShowIcmSelectCust = false;
      this.isThroughCustomer = true;
      this.isThroughCustCBP = true;
      this.isShowPayMode = true;
      this.isShowPayModeForICM = false;
      this.isShowICMmngmtType = false;
      this.isShowCivilWork = false;
      this.isShowCivilPayMode = false;
      this.isShowExpensePayMode = false;
      this.isNormalExpense = false;
      this.isExpenseDate = false;
      this.isShowIncome = true;

      this.isIcmChequeMode = false;
      this.isIcmCashMode = false;
      this.isDDSelected = false;
      this.isCQSelected = false;
      this.isIcmOnlineCashMode = false;
      // this.isRentCashMode = false;

    }
    else if (transType == 'civil_work') {
      // Switching to "Civil Work" - clear stale Through Customer fields so they
      // can't be silently carried into a Civil Work income transaction.
      this.addTranscform.patchValue({
        tc_cust_name: null,
        tc_contact: null,
        tc_block_plot: null,
        person_map_id: null,
        bookings_id: null,
      }, { emitEvent: false });

      // this.addTranscform.get('expense_head_value').clearValidators();
      // this.addTranscform.get('expense_head_value').updateValueAndValidity();

      // this.addTranscform.get('cw_recieved_source').clearValidators();
      // this.addTranscform.get('cw_recieved_source').updateValueAndValidity();

      // this.addTranscform.get('tc_cust_name').clearValidators();
      // this.addTranscform.get('tc_cust_name').updateValueAndValidity();
      // this.addTranscform.get('tc_contact').clearValidators();
      // this.addTranscform.get('tc_contact').updateValueAndValidity();
      // this.addTranscform.get('tc_block_plot').clearValidators();
      // this.addTranscform.get('tc_block_plot').updateValueAndValidity();

      // this.addTranscform.get('addpayMode').clearValidators();
      // this.addTranscform.get('addpayMode').updateValueAndValidity();
      // this.addTranscform.get('icmaddpayMode').clearValidators();
      // this.addTranscform.get('icmaddpayMode').updateValueAndValidity();
      this.isShowIcmSelectCust = false;
      this.isThroughCustomer = true;
      this.isThroughCustCBP = false;
      this.isShowCivilWork = true;
      this.isShowCivilPayMode = true;
      this.isShowPayMode = true;
      this.isShowPayModeForICM = false;
      this.isShowICMmngmtType = false;
      this.isShowExpensePayMode = false;
      this.isNormalExpense = false;
      this.isExpenseDate = false;
      this.isShowIncome = true;

      this.isIcmChequeMode = false;
      this.isIcmCashMode = false;
      this.isDDSelected = false;
      this.isCQSelected = false;
      this.isIcmOnlineCashMode = false;
      // this.isRentCashMode = false;


    } else if (transType == 'expenses') {

      // this.addTranscform.get('expense_head_value').clearValidators();
      // this.addTranscform.get('expense_head_value').updateValueAndValidity();

      // this.addTranscform.get('cw_recieved_source').clearValidators();
      // this.addTranscform.get('cw_recieved_source').updateValueAndValidity();

      // this.addTranscform.get('tc_cust_name').clearValidators();
      // this.addTranscform.get('tc_cust_name').updateValueAndValidity();
      // this.addTranscform.get('tc_contact').clearValidators();
      // this.addTranscform.get('tc_contact').updateValueAndValidity();
      // this.addTranscform.get('tc_block_plot').clearValidators();
      // this.addTranscform.get('tc_block_plot').updateValueAndValidity();

      // this.addTranscform.get('addpayMode').clearValidators();
      // this.addTranscform.get('addpayMode').updateValueAndValidity();
      // this.addTranscform.get('icmaddpayMode').clearValidators();
      // this.addTranscform.get('icmaddpayMode').updateValueAndValidity();
      this.isThroughCustomer = false;
      this.isThroughCustCBP = false;
      this.isShowIcmSelectCust = false;
      this.isIcmMngmtParty = false;
      this.isShowCivilWork = true;
      this.isShowCivilPayMode = false;
      this.isShowPayMode = true;
      this.isShowPayModeForICM = false;
      this.isShowICMmngmtType = false;
      this.isShowExpensePayMode = true;
      this.isNormalExpense = true;
      this.isExpenseDate = true;
      this.isShowIncome = false;

      this.isIcmChequeMode = false;
      this.isIcmCashMode = false;
      this.isDDSelected = false;
      this.isCQSelected = false;
      this.isIcmOnlineCashMode = false;
      // this.isRentCashMode = false;

    } else if (transType == 'rental') {
      // this.addTranscform.get('expense_head_value').clearValidators();
      // this.addTranscform.get('expense_head_value').updateValueAndValidity();

      // this.addTranscform.get('cw_recieved_source').clearValidators();
      // this.addTranscform.get('cw_recieved_source').updateValueAndValidity();

      // this.addTranscform.get('tc_cust_name').clearValidators();
      // this.addTranscform.get('tc_cust_name').updateValueAndValidity();
      // this.addTranscform.get('tc_contact').clearValidators();
      // this.addTranscform.get('tc_contact').updateValueAndValidity();
      // this.addTranscform.get('tc_block_plot').clearValidators();
      // this.addTranscform.get('tc_block_plot').updateValueAndValidity();

      // this.addTranscform.get('addpayMode').clearValidators();
      // this.addTranscform.get('addpayMode').updateValueAndValidity();
      // this.addTranscform.get('icmaddpayMode').clearValidators();
      // this.addTranscform.get('icmaddpayMode').updateValueAndValidity();
      this.isShowIcmSelectCust = false;
      this.isThroughCustomer = false;
      this.isThroughCustCBP = false;
      this.isShowCivilWork = false;
      this.isShowCivilPayMode = false;
      this.isShowPayMode = true;
      this.isShowPayModeForICM = false;
      this.isShowICMmngmtType = false;
      this.isShowExpensePayMode = false;
      this.isNormalExpense = false;
      this.isShowIncome = false;

      this.isIcmChequeMode = false;
      this.isIcmCashMode = false;
      this.isDDSelected = false;
      this.isCQSelected = false;
      this.isIcmOnlineCashMode = false;
      // this.isRentCashMode = true;
      this.isExpenseDate = false;

      this.isShowChequeModes = false;
      this.isShowOnlineModes = false;
      this.isShowCashModes = false;
      this.isShowDDModes = false;

      this.isCommonHSHBK = false;
      this.isCommonAmntRecievedOn = false;

    } else if (transType == 'inc_income') {
      // Fresh Income selection - clear any stale income-head-specific fields
      // left over from a previous selection earlier in this modal session.
      this.addTranscform.patchValue({
        tc_cust_name: null,
        tc_contact: null,
        tc_block_plot: null,
        person_map_id: null,
        bookings_id: null,
        cw_recieved_source: null,
        vender_name: null,
        vechice_name: null,
        vehicle_no: null,
      }, { emitEvent: false });

      this.isShowIcmSelectCust = false;
      this.isThroughCustomer = false;
      this.isThroughCustCBP = false;
      this.isShowCivilWork = false;
      this.isShowIncome = true;
      this.isShowCivilPayMode = true;
      this.isShowPayMode = true;
      this.isShowPayModeForICM = false;
      this.isShowICMmngmtType = false;
      this.isShowExpensePayMode = false;
      this.isNormalExpense = false;
      this.isExpenseDate = false;

      this.isIcmChequeMode = false;
      this.isIcmCashMode = false;
      this.isDDSelected = false;
      this.isCQSelected = false;
      this.isIcmOnlineCashMode = false;
      this.isCommonHSHBK = false;
    }
    else if (transType == 'inter_cash_management') {
      this.addTranscform.get('expense_head_value').clearValidators();
      this.addTranscform.get('expense_head_value').updateValueAndValidity();

      this.addTranscform.get('cw_recieved_source').clearValidators();
      this.addTranscform.get('cw_recieved_source').updateValueAndValidity();

      this.addTranscform.get('tc_cust_name').clearValidators();
      this.addTranscform.get('tc_cust_name').updateValueAndValidity();
      this.addTranscform.get('tc_contact').clearValidators();
      this.addTranscform.get('tc_contact').updateValueAndValidity();
      this.addTranscform.get('tc_block_plot').clearValidators();
      this.addTranscform.get('tc_block_plot').updateValueAndValidity();

      this.addTranscform.get('addpayMode').clearValidators;
      this.addTranscform.get('addpayMode').updateValueAndValidity();

      this.addTranscform.get('addpayMode').clearValidators;
      this.addTranscform.get('addpayMode').updateValueAndValidity();
      // this.addTranscform.get('icmaddpayMode').setValidators([Validators.required]);
      // this.addTranscform.get('icmaddpayMode').updateValueAndValidity();

      // this.addTranscform.get('icm_management_type').setValidators([Validators.required]);
      // this.addTranscform.get('icm_management_type').updateValueAndValidity();

      this.isThroughCustomer = false;
      this.isThroughCustCBP = false;
      this.isShowPayModeForICM = true;
      this.isShowICMmngmtType = true;
      this.isShowCivilWork = false;
      this.isShowCivilPayMode = false;
      this.isShowPayMode = false;
      this.isShowExpensePayMode = false;
      this.isNormalExpense = false;
      this.isShowIncome = false;

      this.isIcmChequeMode = false;
      this.isIcmCashMode = false;
      this.isDDSelected = false;
      this.isCQSelected = false;
      this.isIcmOnlineCashMode = false;
      // this.isRentCashMode = false;
      this.isExpenseDate = false;

      this.isShowChequeModes = false;
      this.isShowOnlineModes = false;
      this.isShowCashModes = false;
      this.isShowDDModes = false;

      this.isCommonHSHBK = false;
    }
    else {
      // Any other selection (including a generic, DB-driven Income Head) - clear
      // stale Through Customer / Civil Work fields as well.
      this.addTranscform.patchValue({
        tc_cust_name: null,
        tc_contact: null,
        tc_block_plot: null,
        person_map_id: null,
        bookings_id: null,
        cw_recieved_source: null,
        vender_name: null,
        vechice_name: null,
        vehicle_no: null,
      }, { emitEvent: false });

      this.addTranscform.get('expense_head_value').clearValidators();
      this.addTranscform.get('expense_head_value').updateValueAndValidity();

      this.addTranscform.get('cw_recieved_source').clearValidators();
      this.addTranscform.get('cw_recieved_source').updateValueAndValidity();

      this.addTranscform.get('tc_cust_name').clearValidators();
      this.addTranscform.get('tc_cust_name').updateValueAndValidity();
      this.addTranscform.get('tc_contact').clearValidators();
      this.addTranscform.get('tc_contact').updateValueAndValidity();
      this.addTranscform.get('tc_block_plot').clearValidators();
      this.addTranscform.get('tc_block_plot').updateValueAndValidity();

      this.addTranscform.get('addpayMode').clearValidators;
      this.addTranscform.get('addpayMode').updateValueAndValidity();

      this.addTranscform.get('icmaddpayMode').clearValidators();
      this.addTranscform.get('icmaddpayMode').updateValueAndValidity();
      this.addTranscform.get('icm_management_type').clearValidators();
      this.addTranscform.get('icm_management_type').updateValueAndValidity();
      this.isShowIcmSelectCust = false;
      this.isThroughCustomer = false;
      this.isThroughCustCBP = false;
      this.isShowPayMode = true;
      this.isShowPayModeForICM = false;
      this.isShowICMmngmtType = false;
      this.isShowCivilWork = false;
      this.isShowCivilPayMode = false;
      this.isShowExpensePayMode = false;
      this.isNormalExpense = false;
      this.isShowIncome = true;

      this.isIcmChequeMode = false;
      this.isIcmCashMode = false;
      this.isDDSelected = false;
      this.isCQSelected = false;
      this.isIcmOnlineCashMode = false;
      // this.isRentCashMode = false;
      this.isExpenseDate = false;

      this.isShowChequeModes = false;
      this.isShowOnlineModes = false;
      this.isShowCashModes = false;
      this.isShowDDModes = false;
      this.isCommonHSHBK = false;
    }
    // if (transType == 1) {
    //   this.addPaySelect=true;
    //   this.addExpenseSelect=false;
    //   this.addInterSelect=false;
    // }else if (transType == 2) {
    //   this.addPaySelect=false;
    //  this.addExpenseSelect=true;
    //  this.addInterSelect=false;
    // } else {
    //   this.addPaySelect=false;
    //   this.addExpenseSelect=false;
    //   this.addInterSelect=true;
    // }
  }

  closeModal() {
    this.redirectAfterSave = null;
    this.isEditMode = false;
    this.submitted = false;

    this.resetUIState();

    this.closebutton.forEach(item => {
      item.nativeElement.click()
    });

    this.previousICMamount = 0;
    this.previousINamount = 0;
    this.previousExpamount = 0;
    this.previousPartyOutCashAmt = 0;
    this.previousPartyInCashAmt = 0;

    this.addTranscform.reset({
      commonTransType: 'select',
      addpayMode: 'select',
      icmaddpayMode: 'select'
    });


    this.addTranscform.get('icm_management_type').clearValidators();
    this.addTranscform.get('icm_management_type').updateValueAndValidity({ emitEvent: false });

    this.addTranscform.get('common_amount_recieved_on').clearValidators();
    this.addTranscform.get('common_amount_recieved_on').updateValueAndValidity({ emitEvent: false });

    this.addTranscform.get('common_description').clearValidators();
    this.addTranscform.get('common_description').updateValueAndValidity({ emitEvent: false });

    this.addTranscform.get('commonTransType').clearValidators();
    this.addTranscform.get('commonTransType').updateValueAndValidity({ emitEvent: false });

    this.addTranscform.get('addpayMode').clearValidators();
    this.addTranscform.get('addpayMode').updateValueAndValidity({ emitEvent: false });

    this.addTranscform.get('common_amount').clearValidators();
    this.addTranscform.get('common_amount').updateValueAndValidity({ emitEvent: false });

    this.addTranscform.get('expense_head_value').clearValidators();
    this.addTranscform.get('expense_head_value').updateValueAndValidity({ emitEvent: false });

    this.addTranscform.get('cw_recieved_source').clearValidators();
    this.addTranscform.get('cw_recieved_source').updateValueAndValidity({ emitEvent: false });

    this.addTranscform.get('tc_cust_name').clearValidators();
    this.addTranscform.get('tc_cust_name').updateValueAndValidity({ emitEvent: false });

    this.addTranscform.get('tc_contact').clearValidators();
    this.addTranscform.get('tc_contact').updateValueAndValidity({ emitEvent: false });


    this.addTranscform.get('tc_block_plot').clearValidators();
    this.addTranscform.get('tc_block_plot').updateValueAndValidity({ emitEvent: false });

    this.addTranscform.get('icmaddpayMode').clearValidators();
    this.addTranscform.get('icmaddpayMode').updateValueAndValidity({ emitEvent: false });

    this.addTranscform.get('icm_cq_clear_date').clearValidators();
    this.addTranscform.get('icm_cq_clear_date').updateValueAndValidity({ emitEvent: false });

    this.addTranscform.get('icm_from_acc_sub_head').clearValidators();
    this.addTranscform.get('icm_from_acc_sub_head').updateValueAndValidity({ emitEvent: false });

    this.addTranscform.get('icm_from_acc_head').clearValidators();
    this.addTranscform.get('icm_from_acc_head').updateValueAndValidity({ emitEvent: false });

    this.addTranscform.get('icm_form_bank_name').clearValidators();
    this.addTranscform.get('icm_form_bank_name').updateValueAndValidity({ emitEvent: false });

    this.addTranscform.get('icm_cq_number').clearValidators();
    this.addTranscform.get('icm_cq_number').updateValueAndValidity({ emitEvent: false });


    [
      'transactions_id',
      'bookings_id',
      'expense_id',
      'expense_booking_id',
      'icm_booking_id',
      'icm_id'
    ].forEach(c => this.addTranscform.get(c)?.reset());

    this.resplookupsubBankICMFrom = [];
    this.SelectedBankDataICMFrom = [];
    this.resplookupsubBankICMTo = [];
    this.SelectedBankDataICMTo = [];
    // this.addTranscform.get('commonTransType').setValue('select');

    this.ishideSubmit = true;
    this.addTranscform.enable();

    this.addTranscform.markAsPristine();
    this.addTranscform.markAsUntouched();
  }


  resetUIState(): void {
    this.isShowPayMode = true;
    this.isShowCivilWork = false;
    this.isShowCivilPayMode = false;
    this.isShowExpensePayMode = false;
    this.isShowPayModeForICM = false;
    this.isShowICMmngmtType = false;

    this.isIcmChequeMode = false;
    this.isIcmCashMode = false;
    this.isIcmOnlineCashMode = false;

    this.isRentCashMode = false;
    this.isDDSelected = false;
    this.isCQSelected = false;

    this.isCommonAmntRecievedOn = true;
    this.isThroughCustomer = false;
    this.isThroughCustCBP = false;

    this.isShowChequeModes = false;
    this.isShowOnlineModes = false;
    this.isShowCashModes = false;
    this.isShowDDModes = false;

    this.isCommonHSHBK = false;

    this.isShowIcmSelectCust = false;
    this.isShowIcmSelectInternal = false;
    this.isIcmMngmtParty = false;

    this.isbyDefaultallTrue = true;
    this.isShowIncome = false;
    this.isCashWidrawal = false;

    this.isContractorExpense = false;
    this.isNormalExpense = true;
  }


  closeBankModal() {
    this.closeBankButton.forEach(item => {
      item.nativeElement.click()
    });
    this.bankTransForm.enable();
  }

  onSelectICMPaymentMode(value) {

    let modeType = typeof (value) == "object" ? value.target.value : value;

    if (modeType == 'icm_cheque') {
      this.ishideCqNumber = true;
      this.isIcmChequeMode = true;
      this.isIcmCashMode = false;
      this.isDDSelected = false;
      this.isCQSelected = true;
      this.isIcmOnlineCashMode = false;
    }
    else if (modeType == 'icm_online') {
      this.ishideCqNumber = false;
      this.isIcmChequeMode = true;
      this.isIcmCashMode = false;
      this.isDDSelected = false;
      this.isCQSelected = false;
      this.isIcmOnlineCashMode = true;
    }
    else if (modeType == 'icm_cash') {
      this.ishideCqNumber = false;
      this.isIcmChequeMode = false;
      this.isCashWidrawal = false;
      if (this.addTranscform.get('icm_management_type').value == 'icm_internal') {
        this.isIcmCashMode = true;

      } else {
        this.isIcmCashMode = false;
      }
      this.isDDSelected = false;
      this.isCQSelected = false;
      this.isIcmOnlineCashMode = true;
    } else if (modeType == 'icm_cash_withdrawal') {
      this.ishideCqNumber = false;
      this.isIcmChequeMode = false;
      this.isIcmCashMode = false;
      if (this.addTranscform.get('icm_management_type').value == 'icm_internal') {
        this.isCashWidrawal = true;
      } else {
        this.isCashWidrawal = false;
      }
      this.isDDSelected = false;
      this.isCQSelected = false;
      this.isIcmOnlineCashMode = true;
    }
    // else if (modeType == 'icm_dd'){
    //   this.isIcmChequeMode = true;
    //   this.isIcmCashMode = true;
    //   this.isDDSelected = true;
    //   this.isIcmOnlineCashMode = false;
    // }
    else {
      this.ishideCqNumber = false;
      this.isCashWidrawal = false;
      this.isIcmChequeMode = false;
      this.isIcmCashMode = false;
      this.isDDSelected = false;
      this.isCQSelected = false;
      this.isIcmOnlineCashMode = false;
    }
  }
  onSelectPaymentMode(value) {

    let modeType = typeof (value) == "object" ? value.target.value : value;

    // Clear values left over from a previously selected mode so a field that's
    // now hidden can't be silently submitted under the newly selected mode.
    this.addTranscform.patchValue({
      cq_senders_bank_name: null,
      cq_cheque_number: null,
      cq_submit_date: null,
      cq_clear_date: null,
      cq_recieved_by: null,
      cash_submitted_by: null,
      cash_recieved_by: null,
      cash_issued_by: null,
      dd_sender_bank_name: null,
      dd_number: null,
      dd_submit_date: null,
      dd_clear_date: null,
      dd_recieved_by: null,
      common_account_head: null,
      common_account_sub_head: null,
      common_acc_bank_name: null,
    }, { emitEvent: false });

    if (modeType == 'Cheque') {
      this.isShowChequeModes = true;
      this.isShowOnlineModes = false;
      this.isShowCashModes = false;
      this.isShowDDModes = false;
      this.isCommonHSHBK = true;
      this.isCommonAmntRecievedOn = true;
      this.isDDSelected = false;
      this.isCQSelected = true;
    }
    else if (modeType == 'Online') {
      this.isShowChequeModes = false;
      this.isShowOnlineModes = true;
      this.isShowCashModes = false;
      this.isShowDDModes = false;
      this.isCommonHSHBK = true;
      this.isCommonAmntRecievedOn = true;
      this.isDDSelected = false;
      this.isCQSelected = false;
    }
    else if (modeType == 'Cash') {
      this.isShowCashModes = true;
      this.isShowChequeModes = false;
      this.isShowOnlineModes = false;
      this.isShowDDModes = false;
      this.isCommonHSHBK = true;
      this.isCommonAmntRecievedOn = true;
      this.isDDSelected = false;
      this.isCQSelected = false;
    }
    else if (modeType == 'DD') {
      this.isShowDDModes = true;
      this.isShowChequeModes = false;
      this.isShowOnlineModes = false;
      this.isShowCashModes = false;
      this.isCommonHSHBK = true;
      this.isCommonAmntRecievedOn = true;
      this.isDDSelected = true;
      this.isCQSelected = false;
    }
    else {
      this.isShowChequeModes = false;
      this.isShowOnlineModes = false;
      this.isShowCashModes = false;
      this.isShowDDModes = false;
      this.isCommonHSHBK = false;
      this.isCommonAmntRecievedOn = false;
      this.isDDSelected = false;
      this.isCQSelected = false;
    }
    // if (modeType == 1) {
    //   this.addChequeMode=true;
    //   this.addBankMode=false
    // }else if (modeType == 2) {
    //   this.addChequeMode=false;
    //   this.addBankMode=false;
    // } else {
    //   this.addChequeMode=false;
    //   this.addBankMode=true;
    // }
  }

  onSelectMngmtType(value) {
    let modeType = typeof (value) == "object" ? value.target.value : value;

    if (modeType === 'icm_customer') {

      this.isIcmChequeMode = true;
      this.isIcmCashMode = false;
      this.isShowIcmSelectCust = true;
      this.isShowIcmSelectInternal = false;
      this.isIcmMngmtParty = false;
      this.isbyDefaultallTrue = true;
      this.isShowICMmngmtType = true;
      this.isShowPayModeForICM = true;
    } else if (modeType === 'icm_internal') {
      this.isIcmChequeMode = true;
      this.isIcmCashMode = true;
      this.isShowIcmSelectInternal = true;
      this.isShowIcmSelectCust = false;
      this.isIcmMngmtParty = false;
      this.isbyDefaultallTrue = true;
      this.isShowICMmngmtType = true;
      this.isShowPayModeForICM = true;
    } else if (modeType === 'icm_party') {
      // this.isIcmChequeMode = false;
      this.isShowIcmSelectInternal = false;
      this.isIcmCashMode = false;
      this.isIcmChequeMode = false;
      this.isIcmMngmtParty = true;
      this.isShowIcmSelectCust = false;
      this.isShowIcmSelectInternal = false;
      this.isbyDefaultallTrue = false;
      this.isShowICMmngmtType = true;
      this.isShowPayModeForICM = false;
    }
    else {
      this.isIcmChequeMode = true;
      // this.isShowIcmSelectInternal = true;
      this.isIcmCashMode = false;

      this.isIcmChequeMode = true;
      this.isShowIcmSelectCust = false;
      this.isShowIcmSelectInternal = false;
      this.isIcmMngmtParty = false;
      this.isbyDefaultallTrue = true;
      this.isShowICMmngmtType = true;
      this.isShowPayModeForICM = false;
    }

    if (this.isShowPayModeForICM) {
      const selectedPayMode = this.addTranscform.get('icmaddpayMode')?.value;
      if (selectedPayMode && selectedPayMode !== 'select') {
        this.onSelectICMPaymentMode(selectedPayMode);

      }
    }

  }

  setupICMFormListeners() {
    const commonTransTypeCtrl = this.addTranscform.get('commonTransType');

    const initValue = commonTransTypeCtrl.value;
    this.applyValidationsBasedOnTransactionType(initValue);

    // This method is called on every modal open and every save, so the previous
    // listener must be torn down first - otherwise each call stacks another
    // duplicate subscriber onto the same valueChanges stream.
    if (this.commonTransTypeSubscription) {
      this.commonTransTypeSubscription.unsubscribe();
    }

    this.commonTransTypeSubscription = commonTransTypeCtrl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.applyValidationsBasedOnTransactionType(value);
    });
  }



  private applyValidationsBasedOnTransactionType(type: string) {

    this.clearICMValidations();
    this.clearExpenseValidations();
    this.clearIncomeValidations();

    switch (type) {
      case 'inter_cash_management':
        this.enableICMValidations();
        break;
      case 'expenses':
        this.enableExpenseValidations();
        break;
      case 'inc_income':
        this.enableIncomeValidations();
        break;
    }
  }

  enableICMValidations() {
    const icmManagementTypeCtrl = this.addTranscform.get('icm_management_type');
    const payModeCtrl = this.addTranscform.get('icmaddpayMode');

    // Set initial validators
    icmManagementTypeCtrl.setValidators([Validators.required]);
    icmManagementTypeCtrl.updateValueAndValidity();

    // Cleanup old subscriptions if exist
    if (this.icmMgmtSubscription) this.icmMgmtSubscription.unsubscribe();
    if (this.payModeSubscription) this.payModeSubscription.unsubscribe();

    // Subscribe to management type changes
    this.icmMgmtSubscription = icmManagementTypeCtrl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((managementType: string) => {
      if (managementType !== 'icm_party') {
        payModeCtrl.setValidators([Validators.required]);
      } else {
        payModeCtrl.clearValidators();
      }
      payModeCtrl.updateValueAndValidity();
    });

    // Subscribe to pay mode changes
    this.payModeSubscription = payModeCtrl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(mode => {
      const managementType = icmManagementTypeCtrl.value;
      const clearDateControl = this.addTranscform.get('icm_cq_clear_date');
      const fromAccHead = this.addTranscform.get('icm_from_acc_head');
      const fromAcSubHead = this.addTranscform.get('icm_from_acc_sub_head');
      const fromBankname = this.addTranscform.get('icm_form_bank_name');
      const toAccHead = this.addTranscform.get('icm_to_acc_head');
      const toAcSubHead = this.addTranscform.get('icm_to_acc_sub_head');
      const toBankname = this.addTranscform.get('icm_to_bank_name');
      const chequeNumber = this.addTranscform.get('icm_cq_number');
      const cmmAmount = this.addTranscform.get('common_amount');

      const icmControls = [
        cmmAmount, clearDateControl, fromAccHead, fromAcSubHead,
        fromBankname, toAccHead, toAcSubHead, toBankname, chequeNumber
      ];

      // Clear all validators first
      icmControls.forEach(ctrl => {
        ctrl.clearValidators();
        ctrl.updateValueAndValidity();
      });

      if (managementType !== 'icm_party') {
        cmmAmount.setValidators([Validators.required, Validators.pattern("^[0-9]*$")]);
        cmmAmount.updateValueAndValidity();

        if (mode === 'icm_cheque') {
          [
            clearDateControl, chequeNumber,
            fromAccHead, fromAcSubHead, fromBankname
          ].forEach(ctrl => {
            ctrl.setValidators([Validators.required]);
            ctrl.updateValueAndValidity();
          });
        }
      }
    });

    // Trigger revalidation for current values
    icmManagementTypeCtrl.updateValueAndValidity({ onlySelf: true, emitEvent: true });
    payModeCtrl.updateValueAndValidity({ onlySelf: true, emitEvent: true });
  }
  clearICMValidations() {
    const fields = [
      'icm_management_type', 'icmaddpayMode', 'icm_cq_clear_date',
      'icm_from_acc_head', 'icm_from_acc_sub_head', 'icm_form_bank_name',
      'icm_to_acc_head', 'icm_to_acc_sub_head', 'icm_to_bank_name',
      'icm_cq_number', 'common_amount'
    ];

    fields.forEach(field => {
      const ctrl = this.addTranscform.get(field);
      if (ctrl) {
        ctrl.clearValidators();
        ctrl.updateValueAndValidity();
      }
    });

    // Unsubscribe from old subscriptions to avoid memory leaks
    if (this.icmMgmtSubscription) {
      this.icmMgmtSubscription.unsubscribe();
      this.icmMgmtSubscription = null;
    }

    if (this.payModeSubscription) {
      this.payModeSubscription.unsubscribe();
      this.payModeSubscription = null;
    }
  }

  enableIncomeValidations() {
    const controlsToValidate = [
      'ic_income_head',
      'common_description',
      'common_amount_recieved_on',
      'addpayMode',
      'common_amount'
    ];

    controlsToValidate.forEach(field => {
      const ctrl = this.addTranscform.get(field);
      if (ctrl) {
        const validators = field === 'common_amount'
          ? [Validators.required, Validators.pattern("^[0-9]*$")]
          : [Validators.required];
        ctrl.setValidators(validators);
        ctrl.updateValueAndValidity();
      }
    });
  }

  clearIncomeValidations() {
    const fields = [
      'ic_income_head',
      'common_description',
      'common_amount_recieved_on',
      'addpayMode',
      'common_amount'
    ];

    fields.forEach(field => {
      const ctrl = this.addTranscform.get(field);
      if (ctrl) {
        ctrl.clearValidators();
        ctrl.updateValueAndValidity();
      }
    });
  }



  enableExpenseValidations() {
    const controlsToValidate = [
      'common_amount_recieved_on',
      'common_description',
      'expense_head_value',
      'common_amount'
    ];

    controlsToValidate.forEach(field => {
      const ctrl = this.addTranscform.get(field);
      if (ctrl) {
        const validators = field === 'common_amount'
          ? [Validators.required, Validators.pattern("^[0-9]+(\\.[0-9]{1,2})?$")]
          : [Validators.required];
        ctrl.setValidators(validators);
        ctrl.updateValueAndValidity();
      }
    });

    // 'addpayMode' is optional in expense
    const addPayModeCtrl = this.addTranscform.get('addpayMode');
    if (addPayModeCtrl) {
      addPayModeCtrl.clearValidators();
      addPayModeCtrl.updateValueAndValidity();
    }
  }
  clearExpenseValidations() {
    const fields = [
      'common_amount_recieved_on',
      'common_description',
      'expense_head_value',
      'common_amount',
      'addpayMode'
    ];

    fields.forEach(field => {
      const ctrl = this.addTranscform.get(field);
      if (ctrl) {
        ctrl.clearValidators();
        ctrl.updateValueAndValidity();
      }
    });
  }




  openModel() {
    this.isSubmitDisabled = false;
    this.addTranscform.enable();
    this.addTranscform.reset();
    this.taskHeading = "Add New Transaction";
    this.transactionModel.nativeElement.click();
    // this.addTranscform.get('commonTransType').setValue('select');

    const now = new Date();
    const currentTime = this.datePipe.transform(now, 'HH:mm');
    this.addTranscform.get('common_time')?.setValue(currentTime);
    this.setupICMFormListeners();

    // this.addTranscform.get('addpayMode').clearValidators();
    // this.addTranscform.get('addpayMode').updateValueAndValidity();
    // this.addTranscform.get('tc_cust_name').clearValidators();
    // this.addTranscform.get('tc_cust_name').updateValueAndValidity();
    // this.addTranscform.get('tc_contact').clearValidators();
    // this.addTranscform.get('tc_contact').updateValueAndValidity();
    // this.addTranscform.get('tc_block_plot').clearValidators();
    // this.addTranscform.get('tc_block_plot').updateValueAndValidity();
    // this.addTranscform.get('cw_recieved_source').clearValidators();
    // this.addTranscform.get('cw_recieved_source').updateValueAndValidity();
    // this.addTranscform.get('expense_head_value').clearValidators();
    // this.addTranscform.get('expense_head_value').updateValueAndValidity();
    // this.addTranscform.get('icmaddpayMode').clearValidators();
    // this.addTranscform.get('icmaddpayMode').updateValueAndValidity();
    // this.addTranscform.get('common_amount_recieved_on').clearValidators();
    // this.addTranscform.get('common_amount_recieved_on').updateValueAndValidity();
    // this.addTranscform.get('common_description').clearValidators();
    // this.addTranscform.get('common_description').updateValueAndValidity();
    // this.addTranscform.get('common_amount').clearValidators();
    // this.addTranscform.get('common_amount').updateValueAndValidity();


  }

  openModelBank() {
    this.bankTransForm.enable();
    this.bankTransForm.reset();

    this.transactionBankModel.nativeElement.click();

  }


  resetSearch() {

    this.srcTransactionForm.get('bankAccHead').setValue('');
    this.srcTransactionForm.get('bankAccSubHead').setValue('');
    this.srcTransactionForm.get('bankAccBankName').setValue('');
    this.srcTransactionForm.get('cashInBankAcc').setValue('');

  }



  ngAfterViewInit(): void {
    this.dtTrigger5.next();
    this.dtTrigger7.next();
    this.dtTrigger8.next();
    this.dtTrigger9.next();
    this.dtTrigger10.next();
    this.dtTrigger11.next();
    this.dtTrigger12.next();


  }


  removeICMValue({ icm_id, booking_id, person_plan_id, from_acc_head, from_acc_sub_head, from_bank_name, to_acc_head, to_acc_sub_head, to_bank_name, management_type, trans_amount, trans_mode, party_in_acc_head, party_in_acc_sub_head, party_in_amount, party_in_bank, party_out_acc_head, party_out_acc_sub_head, party_out_amount, party_out_bank, party_in_mode, party_out_mode }: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.value) {
        let transation_form = new FormData();
        transation_form.append('icm_id', icm_id);
        transation_form.append('booking_id', booking_id);
        transation_form.append('person_plan_id', person_plan_id);
        transation_form.append('from_acc_head', from_acc_head);
        transation_form.append('from_acc_sub_head', from_acc_sub_head);
        transation_form.append('from_bank_name', from_bank_name);
        transation_form.append('to_acc_head', to_acc_head);
        transation_form.append('to_acc_sub_head', to_acc_sub_head);
        transation_form.append('to_bank_name', to_bank_name);
        transation_form.append('management_type', management_type);
        transation_form.append('amount', trans_amount);
        transation_form.append('trans_mode', trans_mode);
        transation_form.append('party_in_acc_head', party_in_acc_head);
        transation_form.append('party_in_acc_sub_head', party_in_acc_sub_head);
        transation_form.append('party_in_amount', party_in_amount);
        transation_form.append('party_in_bank', party_in_bank);
        transation_form.append('party_in_mode', party_in_mode);
        transation_form.append('party_out_mode', party_out_mode);
        transation_form.append('party_out_acc_head', party_out_acc_head);
        transation_form.append('party_out_acc_sub_head', party_out_acc_sub_head);
        transation_form.append('party_out_amount', party_out_amount);
        transation_form.append('party_out_bank', party_out_bank);
        this.billingservice.deleteICMDetail(transation_form).pipe(takeUntil(this.destroy$)).subscribe(Response => {
          if (Response) {
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'Value Deleted Sucessfully',
              showConfirmButton: false,
              timer: 2000
            });
            const icmType = management_type;

            if (icmType === 'icm_internal') {
              this.reload('ICM_INTERNAL');
            }
            else if (icmType === 'icm_customer') {
              this.reload('ICM_CUSTOMER');
            }
            else if (icmType === 'icm_party') {
              this.reload('ICM_PARTY');
            }

          }
          else {
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
  }

  removeExpense(expense_id: string, acc_head, acc_sub_head, bank_name, amount) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.value) {
        let transation_form = new FormData();
        transation_form.append('expense_id', expense_id);
        transation_form.append('acc_head', acc_head);
        transation_form.append('acc_sub_head', acc_sub_head);
        transation_form.append('bank_name', bank_name);
        transation_form.append('amount', amount);
        this.billingservice.deleteExpenseDetail(transation_form).pipe(takeUntil(this.destroy$)).subscribe(Response => {
          if (Response) {
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'Expense Deleted Sucessfully',
              showConfirmButton: false,
              timer: 2000
            });
            this.reload('OUT');
            this.callbankChange();
          }
          else {
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
  }

  removeLogValue(id: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.value) {
        let transation_form = new FormData();
        transation_form.append('id', id);
        this.billingservice.deleteLogDetail(transation_form).pipe(takeUntil(this.destroy$)).subscribe(Response => {
          if (Response) {
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'LOG Deleted Sucessfully',
              showConfirmButton: false,
              timer: 2000
            });
            this.reload('LOGS');
            this.callbankChange();
          }
          else {
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
  }

  normalizePaymentMode(mode: string): string {
    const map: Record<string, string> = {
      party_in_online: 'Online',
      party_in_cash: 'Cash',
      party_in_cheque: 'Cheque',
      party_in_dd: 'DD',
      Online: 'Online',
      Cash: 'Cash',
      Cheque: 'Cheque',
      DD: 'DD'
    };
    return map[mode] || 'select';
  }

  ViewPaymentDetail(action: string, transactionId: string) {
    this.isShowPayMode = true;
    this.isShowPayModeForICM = false;
    this.isSubmitDisabled = false;

    if (action === 'View Expense' || action === "Edit Expense") {
      if (action === 'View Expense') {
        this.ishideSubmit = false;
        this.addTranscform.disable();
      }

      this.isEditMode = true;
      this.ExpselectedTransaction = this.ExpPaymentDetaildata.find(item => item.expense_id === transactionId);

      let formattedExpRecDate = this.datePipe.transform(this.ExpselectedTransaction.recieved_date, 'dd-MM-yyyy');

      this.addTranscform.patchValue({
        expense_id: this.ExpselectedTransaction.expense_id,
        common_amount_recieved_on: formattedExpRecDate,
        common_time: this.ExpselectedTransaction.exp_time,
        commonTransType: this.ExpselectedTransaction.trans_type,
        addpayMode: this.ExpselectedTransaction.payment_mode,

        common_amount: this.ExpselectedTransaction.trans_amount,
        common_description: this.ExpselectedTransaction.exp_descriptions,
      });

      this.previousExpamount = this.ExpselectedTransaction.trans_amount;

      if (this.ExpselectedTransaction.trans_type == 'expenses') {
        let value = 'expenses';
        this.onAddSelectChange(value);

        this.addTranscform.patchValue({
          expense_head_value: this.ExpselectedTransaction.expense_head,
          exp_vendor_value: this.ExpselectedTransaction.vendor_name,
          exp_contractor_value: this.ExpselectedTransaction.contractor_name,
          // docType: this.ExpselectedTransaction.docType,
          // docNumber: this.ExpselectedTransaction.docNumber,
          // po_no: this.ExpselectedTransaction.po_no
        });
        this.onExpenseHeadChange({ target: { value: this.addTranscform.get('expense_head_value')?.value } }, true);
      }

      if (this.ExpselectedTransaction.payment_mode == 'Cheque') {
        let value = 'Cheque';
        this.onSelectPaymentMode(value);

        this.addTranscform.patchValue({
          cq_senders_bank_name: this.ExpselectedTransaction.cq_dd_name,
          cq_cheque_number: this.ExpselectedTransaction.cq_dd_number,
          cq_submit_date: this.datePipe.transform(this.ExpselectedTransaction.cq_dd_submit_date, 'dd-MM-yyyy'),
          cq_clear_date: this.datePipe.transform(this.ExpselectedTransaction.cq_dd_clear_date, 'dd-MM-yyyy'),
          cq_recieved_by: this.ExpselectedTransaction.recieved_by,
          common_account_head: this.ExpselectedTransaction.trans_acc_head,
          common_account_sub_head: this.ExpselectedTransaction.trans_acc_sub_head,
          common_acc_bank_name: this.ExpselectedTransaction.trans_acc_bank_name,
        });

      }
      else if (this.ExpselectedTransaction.payment_mode == 'Online') {
        let value = 'Online';
        this.onSelectPaymentMode(value);

        this.addTranscform.patchValue({
          common_account_head: this.ExpselectedTransaction.trans_acc_head,
          common_account_sub_head: this.ExpselectedTransaction.trans_acc_sub_head,
          common_acc_bank_name: this.ExpselectedTransaction.trans_acc_bank_name,
        });
      }
      else if (this.ExpselectedTransaction.payment_mode == 'Cash') {
        let value = 'Cash';
        this.onSelectPaymentMode(value);

        this.addTranscform.patchValue({
          cash_submitted_by: this.ExpselectedTransaction.submitted_by,
          cash_recieved_by: this.ExpselectedTransaction.recieved_by,
          common_account_head: this.ExpselectedTransaction.trans_acc_head,
          common_account_sub_head: this.ExpselectedTransaction.trans_acc_sub_head,
        });
      }
      else if (this.ExpselectedTransaction.payment_mode == 'DD') {
        let value = 'DD';
        this.onSelectPaymentMode(value);

        this.addTranscform.patchValue({
          dd_sender_bank_name: this.ExpselectedTransaction.cq_dd_name,
          dd_number: this.ExpselectedTransaction.cq_dd_number,
          dd_submit_date: this.datePipe.transform(this.ExpselectedTransaction.cq_dd_submit_date, 'dd-MM-yyyy'),
          dd_clear_date: this.datePipe.transform(this.ExpselectedTransaction.cq_dd_clear_date, 'dd-MM-yyyy'),
          dd_recieved_by: this.ExpselectedTransaction.recieved_by,
          common_account_head: this.ExpselectedTransaction.trans_acc_head,
          common_account_sub_head: this.ExpselectedTransaction.trans_acc_sub_head,
          common_acc_bank_name: this.ExpselectedTransaction.trans_acc_bank_name,
        });
      }
    }
    else if (action === 'View_ICM_internal' || action === "Edit_ICM_internal") {

      if (action === 'View_ICM_internal') {
        this.ishideSubmit = false;
        this.addTranscform.disable();
      }



      this.isEditMode = true;

      this.IcmExpectedValue = this.PaymentIcmInternalData.find(item => item.icm_id === transactionId);

      let formattedDateforIcm = this.datePipe.transform(this.IcmExpectedValue.recieved_date, 'dd-MM-yyyy');

      this.addTranscform.patchValue({
        icm_id: this.IcmExpectedValue.icm_id,
        icm_booking_id: this.IcmExpectedValue.booking_id,
        common_amount_recieved_on: formattedDateforIcm,
        commonTransType: this.IcmExpectedValue.trans_type,
        common_time: this.IcmExpectedValue.time,
        common_description: this.IcmExpectedValue.description,
        common_amount: this.IcmExpectedValue.trans_amount,
        icmaddpayMode: this.IcmExpectedValue.trans_mode,
        icm_management_type: this.IcmExpectedValue.management_type
      });


      this.previousICMamount = this.IcmExpectedValue.trans_amount;
      if (this.IcmExpectedValue.trans_type == 'inter_cash_management') {
        let value = 'inter_cash_management';
        this.onAddSelectChange(value);
      }

      // this.getAllAccSubHeadICMFrom();
      // this.getAllBankDetailsICMFrom();
      // this.getAllAccSubHeadICMTo();
      // this.getAllBankDetailsICMTo();

      if (this.IcmExpectedValue.trans_mode == 'icm_cheque') {
        let value = 'icm_cheque';
        this.onSelectICMPaymentMode(value);
        this.getAllAccSubHeadICMFrom();
        this.getAllBankDetailsICMFrom();
        this.getAllAccSubHeadICMTo();
        this.getAllBankDetailsICMTo();
        this.isIcmChequeMode = true;
        this.isShowIcmSelectInternal = true;
        this.isIcmCashMode = true;

        // this.getAllAccSubHeadICMFrom();
        // this.getAllBankDetailsICMFrom();
        // this.getAllAccSubHeadICMTo();
        // this.getAllBankDetailsICMTo();
        this.addTranscform.patchValue({
          icm_cq_submit_date: this.datePipe.transform(this.IcmExpectedValue.cq_submit_date, 'dd-MM-yyyy'),
          icm_cq_clear_date: this.datePipe.transform(this.IcmExpectedValue.cq_clear_date, 'dd-MM-yyyy'),
          icm_cq_number: this.IcmExpectedValue.cq_number,
          icm_from_acc_head: this.IcmExpectedValue.from_acc_head,
          icm_from_acc_sub_head: this.IcmExpectedValue.from_acc_sub_head,
          icm_form_bank_name: this.IcmExpectedValue.from_bank_name,
          icm_to_acc_head: this.IcmExpectedValue.to_acc_head,
          icm_to_acc_sub_head: this.IcmExpectedValue.to_acc_sub_head,
          icm_to_bank_name: this.IcmExpectedValue.to_bank_name,
        });

      } else if (this.IcmExpectedValue.trans_mode == 'icm_online') {
        let value = 'icm_online';
        this.onSelectICMPaymentMode(value);
        this.getAllAccSubHeadICMFrom();
        this.getAllBankDetailsICMFrom();
        this.getAllAccSubHeadICMTo();
        this.getAllBankDetailsICMTo();
        this.isIcmChequeMode = true;
        this.isShowIcmSelectInternal = true;
        this.isIcmCashMode = true;
        this.addTranscform.patchValue({
          icm_cq_clear_date: this.datePipe.transform(this.IcmExpectedValue.cq_clear_date, 'dd-MM-yyyy'),
          icm_from_acc_head: this.IcmExpectedValue.from_acc_head,
          icm_from_acc_sub_head: this.IcmExpectedValue.from_acc_sub_head,
          icm_form_bank_name: this.IcmExpectedValue.from_bank_name,
          icm_to_acc_head: this.IcmExpectedValue.to_acc_head,
          icm_to_acc_sub_head: this.IcmExpectedValue.to_acc_sub_head,
          icm_to_bank_name: this.IcmExpectedValue.to_bank_name,
        });
      } else if (this.IcmExpectedValue.trans_mode == 'icm_cash') {
        let value = 'icm_cash';
        this.onSelectICMPaymentMode(value);
        this.getAllAccSubHeadICMTo();
        this.getAllBankDetailsICMTo();
        this.addTranscform.patchValue({
          icm_to_acc_head: this.IcmExpectedValue.to_acc_head,
          icm_to_acc_sub_head: this.IcmExpectedValue.to_acc_sub_head,
          icm_to_bank_name: this.IcmExpectedValue.to_bank_name,
        });
      } else if (this.IcmExpectedValue.trans_mode == 'icm_cash_withdrawal') {
        let value = 'icm_cash_withdrawal';
        this.onSelectICMPaymentMode(value);
        this.getAllBankDetailsICMFrom();
        this.getAllAccSubHeadICMFrom();
        // this.getAccHeadICMFrom();
        this.addTranscform.patchValue({
          icm_from_acc_head: this.IcmExpectedValue.from_acc_head,
          icm_from_acc_sub_head: this.IcmExpectedValue.from_acc_sub_head,
          icm_form_bank_name: this.IcmExpectedValue.from_bank_name,
        });
      }




      // this.IcmExpectedValue = this.paymentIcmCustomerData.find(item => item.icm_id === transactionId);
      // if(this.IcmExpectedValue.management_type == 'icm_customer'){
      //   let value = 'icm_customer';
      //   this.onSelectMngmtType(value);

      //   this.addTranscform.patchValue({
      //     icm_customer_name: this.IcmExpectedValue.select_customer,
      //     icm_cust_cq_to_cqname: this.IcmExpectedValue.to_cheque_no_name,
      //   });
      // }

      // this.IcmExpectedValue = this.paymentIcmPartyData.find(item => item.icm_id === transactionId);
      // if(this.IcmExpectedValue.management_type == 'icm_party'){
      //   let value = 'icm_party';
      //   this.onSelectMngmtType(value);

      //   this.addTranscform.patchValue({
      //    icm_mgmt_party_name: this.IcmExpectedValue.party_name,
      //    party_in_date: this.IcmExpectedValue.party_in_date,
      //    party_in_mode: this.IcmExpectedValue.party_in_mode,
      //    party_in_amount: this.IcmExpectedValue.party_in_amount,
      //    party_in_acc_head: this.IcmExpectedValue.party_in_acc_head,
      //    party_in_acc_sub_head: this.IcmExpectedValue.party_in_acc_sub_head,
      //    party_in_bank: this.IcmExpectedValue.party_in_bank,
      //    party_in_description: this.IcmExpectedValue.party_in_description,
      //    party_out_date: this.IcmExpectedValue.party_out_date,
      //    party_out_mode: this.IcmExpectedValue.party_out_mode,
      //    party_out_amount: this.IcmExpectedValue.party_out_amount,
      //    party_out_acc_head: this.IcmExpectedValue.party_out_acc_head,
      //    party_out_acc_sub_head: this.IcmExpectedValue.party_out_acc_sub_head,
      //    party_out_bank: this.IcmExpectedValue.party_out_bank,
      //    party_out_description: this.IcmExpectedValue.party_out_description,

      //   });

      //   this.previousPartyInCashAmt = this.IcmExpectedValue.party_in_amount;
      //   this.previousPartyOutCashAmt = this.IcmExpectedValue.party_out_amount;

      // }



    } else if (action === 'View_ICM_customer' || action === "Edit_ICM_customer") {

      if (action === 'View_ICM_customer') {
        this.ishideSubmit = false;
        this.addTranscform.disable();
      }
      this.isEditMode = true;

      this.IcmCustExpectedValue = this.paymentIcmCustomerData.find(item => item.icm_id === transactionId);
      let formattedDateforIcm = this.datePipe.transform(this.IcmCustExpectedValue.recieved_date, 'dd-MM-yyyy');

      this.addTranscform.patchValue({
        icm_id: this.IcmCustExpectedValue.icm_id,
        icm_booking_id: this.IcmCustExpectedValue.booking_id,
        common_amount_recieved_on: formattedDateforIcm,
        commonTransType: this.IcmCustExpectedValue.trans_type,
        common_time: this.IcmCustExpectedValue.time,
        common_description: this.IcmCustExpectedValue.description,
        common_amount: this.IcmCustExpectedValue.trans_amount,
        icmaddpayMode: this.IcmCustExpectedValue.trans_mode,
        icm_management_type: this.IcmCustExpectedValue.management_type
      });

      this.previousICMamount = this.IcmCustExpectedValue.trans_amount;
      if (this.IcmCustExpectedValue.trans_type == 'inter_cash_management') {
        let value = 'inter_cash_management';
        this.onAddSelectChange(value);
      }

      if (this.IcmCustExpectedValue.management_type == 'icm_customer') {
        let value = 'icm_customer';
        this.onSelectMngmtType(value);

        this.addTranscform.patchValue({
          icm_customer_name: this.IcmCustExpectedValue.select_customer,
          icm_cust_cq_to_cqname: this.IcmCustExpectedValue.to_cheque_no_name,
          persons_id: this.IcmCustExpectedValue.persons_id,
          person_plan_id: this.IcmCustExpectedValue.person_plan_id,
        });

        this.getCustChequeClearList(this.addTranscform.get('persons_id').value);
        this.addTranscform.patchValue({
          icm_cust_cq_to_cqname: this.IcmCustExpectedValue.to_cheque_no_name,
        });
      }

      this.getAllAccSubHeadICMFrom();
      this.getAllBankDetailsICMFrom();
      this.getCustChequeClearList(this.IcmCustExpectedValue.persons_id);

      if (this.IcmCustExpectedValue.trans_mode == 'icm_cheque') {
        let value = 'icm_cheque';
        this.onSelectICMPaymentMode(value);

        this.addTranscform.patchValue({
          icm_cq_submit_date: this.datePipe.transform(this.IcmCustExpectedValue.cq_submit_date, 'dd-MM-yyyy'),
          icm_cq_clear_date: this.datePipe.transform(this.IcmCustExpectedValue.cq_clear_date, 'dd-MM-yyyy'),
          icm_cq_number: this.IcmCustExpectedValue.cq_number,
          icm_from_acc_head: this.IcmCustExpectedValue.from_acc_head,
          icm_from_acc_sub_head: this.IcmCustExpectedValue.from_acc_sub_head,
          icm_form_bank_name: this.IcmCustExpectedValue.from_bank_name,
          // icm_cust_cq_to_cqname: this.IcmCustExpectedValue.to_cheque_no_name
        });
      } else if (this.IcmCustExpectedValue.trans_mode == 'icm_online') {
        let value = 'icm_online';
        this.onSelectICMPaymentMode(value);
        this.addTranscform.patchValue({
          icm_cq_submit_date: this.datePipe.transform(this.IcmCustExpectedValue.cq_submit_date, 'dd-MM-yyyy'),
          icm_cq_clear_date: this.datePipe.transform(this.IcmCustExpectedValue.cq_clear_date, 'dd-MM-yyyy'),
          icm_customer_name: this.IcmCustExpectedValue.select_customer,
          icm_cust_cq_to_cqname: this.IcmCustExpectedValue.to_cheque_no_name,
          persons_id: this.IcmCustExpectedValue.persons_id,
          icm_from_acc_head: this.IcmCustExpectedValue.from_acc_head,
          icm_from_acc_sub_head: this.IcmCustExpectedValue.from_acc_sub_head,
          icm_form_bank_name: this.IcmCustExpectedValue.from_bank_name,
        });
      } else if (this.IcmCustExpectedValue.trans_mode == 'icm_cash') {
        let value = 'icm_cash';
        this.onSelectICMPaymentMode(value);
        this.addTranscform.patchValue({
          icm_to_acc_head: this.IcmCustExpectedValue.to_acc_head,
          icm_to_acc_sub_head: this.IcmCustExpectedValue.to_acc_sub_head,
          icm_to_bank_name: this.IcmCustExpectedValue.to_bank_name,
        });
      }
    } else if (action === 'View_ICM_party' || action === 'Edit_ICM_party') {
      if (action === 'View_ICM_party') {
        this.ishideSubmit = false;
        this.addTranscform.disable();
      }
      this.isEditMode = true;

      this.IcmPartyExpectedValue = this.paymentIcmPartyData.find(item => item.icm_id === transactionId);


      this.addTranscform.patchValue({
        icm_id: this.IcmPartyExpectedValue.icm_id,
        icm_booking_id: this.IcmPartyExpectedValue.booking_id,
        icmaddpayMode: this.IcmPartyExpectedValue.trans_mode,
        icm_management_type: this.IcmPartyExpectedValue.management_type,
        commonTransType: this.IcmPartyExpectedValue.trans_type,
        icm_mgmt_party_name: this.IcmPartyExpectedValue.party_name
      });

      // this.previousICMamount = this.IcmPartyExpectedValue.trans_amount;
      if (this.IcmPartyExpectedValue.trans_type == 'inter_cash_management') {
        let value = 'inter_cash_management';
        this.onAddSelectChange(value);
      }

      if (this.IcmPartyExpectedValue.management_type == 'icm_party') {
        let value = 'icm_party';
        this.onSelectMngmtType(value);

        this.addTranscform.patchValue({
          icm_mgmt_party_name: this.IcmPartyExpectedValue.party_name,
          party_in_date: this.IcmPartyExpectedValue.party_in_date,
          party_in_mode: this.IcmPartyExpectedValue.party_in_mode,
          party_in_amount: this.IcmPartyExpectedValue.party_in_amount,
          party_in_acc_head: this.IcmPartyExpectedValue.party_in_acc_head,
          party_in_acc_sub_head: this.IcmPartyExpectedValue.party_in_acc_sub_head,
          party_in_bank: this.IcmPartyExpectedValue.party_in_bank,
          party_in_description: this.IcmPartyExpectedValue.party_in_description,
          party_out_date: this.IcmPartyExpectedValue.party_out_date,
          party_out_mode: this.IcmPartyExpectedValue.party_out_mode,
          party_out_amount: this.IcmPartyExpectedValue.party_out_amount,
          party_out_acc_head: this.IcmPartyExpectedValue.party_out_acc_head,
          party_out_acc_sub_head: this.IcmPartyExpectedValue.party_out_acc_sub_head,
          party_out_bank: this.IcmPartyExpectedValue.party_out_bank,
          party_out_description: this.IcmPartyExpectedValue.party_out_description,

        });
        this.previousPartyInCashAmt = this.IcmPartyExpectedValue.party_in_amount;
        this.previousPartyOutCashAmt = this.IcmPartyExpectedValue.party_out_amount;
      }
    }
    else if (action === 'Edit' || action === 'View') {

      if (action === 'View') {
        this.ishideSubmit = false;
        this.addTranscform.disable();
      }
      this.isEditMode = true;
      let formData = new FormData();
      formData.append('transactionId', transactionId);
      this.billingservice.getINDataById(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {

        this.selectedTransaction = resp.data[0]

        let formattedRegDate = this.datePipe.transform(this.selectedTransaction.all_recieved_date, 'dd-MM-yyyy');
        // let ngbDateStruct = this.fromModel(formattedRegDate!);

        this.addTranscform.patchValue({
          transactions_id: this.selectedTransaction.transaction_id,
          bookings_id: this.selectedTransaction.trans_booking_id,
          common_amount_recieved_on: formattedRegDate,
          common_time: this.selectedTransaction.time,
          commonTransType: this.selectedTransaction.transaction_type,
          // addpayMode: this.selectedTransaction.trans_mode,
          addpayMode: this.normalizePaymentMode(this.selectedTransaction.trans_mode),
          common_amount: this.selectedTransaction.trans_amount,
          common_description: this.selectedTransaction.descriptions,

        });

        this.previousINamount = this.selectedTransaction.trans_amount;

        if (this.selectedTransaction.transaction_type == 'inc_income') {
          let value = 'inc_income';
          this.onAddSelectChange(value);
          this.isThroughCustomer = true;
          this.isThroughCustCBP = true;
          // this.onCwRecievedSourceChange(value);
          this.addTranscform.patchValue({
            cw_recieved_source: this.selectedTransaction.recieved_source,
            vender_name: this.selectedTransaction.vendor_name,
            vechice_name: this.selectedTransaction.vehicle_name,
            vehicle_no: this.selectedTransaction.vehicle_number,
            tc_cust_name: this.selectedTransaction.customer_name,
            tc_contact: this.selectedTransaction.contact_no,
            tc_block_plot: this.selectedTransaction.block_plot,
            ic_income_head: this.selectedTransaction.income_head,
          });

        }
        else if (this.selectedTransaction.transaction_type == '') {
          this.addTranscform.patchValue({
            commonTransType: 'select',
          });
        }

        if (this.selectedTransaction.trans_mode == 'Cheque') {
          let value = 'Cheque';
          this.onSelectPaymentMode(value);

          this.addTranscform.patchValue({
            cq_senders_bank_name: this.selectedTransaction.trans_cheque_name,
            cq_cheque_number: this.selectedTransaction.trans_cheque_number,
            cq_submit_date: this.datePipe.transform(this.selectedTransaction.trans_cheque_submit_date, 'dd-MM-yyyy'),
            cq_clear_date: this.datePipe.transform(this.selectedTransaction.trans_cheque_clear_date, 'dd-MM-yyyy'),
            cq_recieved_by: this.selectedTransaction.trans_recieved_by,
            common_account_head: this.selectedTransaction.acc_head,
            common_account_sub_head: this.selectedTransaction.acc_subHead,
            common_acc_bank_name: this.selectedTransaction.trans_cheque_bank_name,
          });

        }
        else if (this.selectedTransaction.trans_mode == 'Online') {
          let value = 'Online';
          this.onSelectPaymentMode(value);

          this.addTranscform.patchValue({
            common_account_head: this.selectedTransaction.acc_head,
            common_account_sub_head: this.selectedTransaction.acc_subHead,
            common_acc_bank_name: this.selectedTransaction.trans_cheque_bank_name,

          });

        }
        else if (this.selectedTransaction.trans_mode == 'Cash') {
          let value = 'Cash';
          this.onSelectPaymentMode(value);

          this.addTranscform.patchValue({
            cash_submitted_by: this.selectedTransaction.trans_cash_submitted_by,
            cash_recieved_by: this.selectedTransaction.trans_recieved_by,
            common_account_head: this.selectedTransaction.acc_head,
            common_account_sub_head: this.selectedTransaction.acc_subHead,
            cash_issued_by: this.selectedTransaction.issued_by,
          });
        }
        else if (this.selectedTransaction.trans_mode == 'DD') {
          let value = 'DD';
          this.onSelectPaymentMode(value);

          this.addTranscform.patchValue({
            dd_sender_bank_name: this.selectedTransaction.trans_dd_name,
            dd_number: this.selectedTransaction.trans_dd_number,
            dd_submit_date: this.datePipe.transform(this.selectedTransaction.trans_dd_submit_date, 'dd-MM-yyyy'),
            dd_clear_date: this.datePipe.transform(this.selectedTransaction.trans_cheque_clear_date, 'dd-MM-yyyy'),
            dd_recieved_by: this.selectedTransaction.trans_recieved_by,
            common_account_head: this.selectedTransaction.acc_head,
            common_account_sub_head: this.selectedTransaction.acc_subHead,
            common_acc_bank_name: this.selectedTransaction.trans_cheque_bank_name,
          });
        }
      })
    } else {
      this.isEditMode = false;
      this.ExpselectedTransaction = null;
      this.selectedTransaction = null;
    }

  }

  ViewBankDetail(action: string, id: string) {
    this.isEditMode = true;
    if (action === 'View Bank') {
      this.ishideBankSubmitbutton = false;
      this.icmPartyForm.disable();
    } else if (action === 'Edit Bank') {
      this.ishideBankSubmitbutton = true;
      this.icmPartyForm.enable();
    }
    this.BankExpectedValue = this.PaymentDetaildataBank.find(item => item.id === id);

    this.icmPartyForm.patchValue({
      bank_acc_head: this.BankExpectedValue.acc_head,
      bank_acc_sub_head: this.BankExpectedValue.acc_sub_head,
      bank_bank_name: this.BankExpectedValue.bank_name,
      bank_total_amount: this.BankExpectedValue.total_amount
    });

  }


  DeletePayment(id, acc_head, acc_sub_head, bank_name, amount) {

    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.value) {
        let transation_form = new FormData();
        transation_form.append('transaction_id', id);
        transation_form.append('acc_head', acc_head);
        transation_form.append('acc_sub_head', acc_sub_head);
        transation_form.append('bank_name', bank_name);
        transation_form.append('amount', amount);
        this.billingservice.deletePaymentDetail(transation_form).pipe(takeUntil(this.destroy$)).subscribe(Response => {
          if (Response) {
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'Payment Deleted Sucessfully',
              showConfirmButton: false,
              timer: 2000
            });
            this.reload('IN');
            this.callbankChange();
          }
          else {
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

  }

  saveTransList() {
    if (this.isSubmitDisabled) return; // prevent double clicks
    this.isSubmitDisabled = true;

    let transData: any = new FormData();



    if (this.isEditMode) {
      transData.append('transaction_id', this.addTranscform.get('transactions_id').value);
      transData.append('booking_id', this.addTranscform.get('bookings_id').value);
      transData.append('expense_id', this.addTranscform.get('expense_id').value);
      transData.append('icm_id', this.addTranscform.get('icm_id').value);
    } else {

    }

    this.submitted = true;

    Object.keys(this.addTranscform.controls).forEach(controlName => {
      this.addTranscform.get(controlName).updateValueAndValidity();
    });



    if (this.addTranscform.valid) {

      // let transData: any = new FormData();
      transData.append('transDate', this.addTranscform.get('common_amount_recieved_on').value);
      transData.append('time', this.addTranscform.get('common_time').value);
      transData.append('transactionType', this.addTranscform.get('commonTransType').value);
      // transData.append('transaction_type', this.addTranscform.get('addpayMode').value);
      transData.append('transAmount', this.addTranscform.get('common_amount').value);
      transData.append('desciptions', this.addTranscform.get('common_description').value);

      let transType = this.addTranscform.get('commonTransType').value


      if (transType == 'inc_income' || transType == 'select') {
        this.setupICMFormListeners();
        if (this.addTranscform.get('ic_income_head').value == 'through_customer') {

          if (this.addTranscform.get('bookings_id').value) {
            transData.append('booking_id', this.addTranscform.get('bookings_id').value);
          } else {
            let booking_id = 'FCD4AEA3-6F32-483D-9CDUCSCT6OBMAECR';
            transData.append('booking_id', booking_id);
          }

          transData.append('contactNo', this.addTranscform.get('tc_contact').value);
          transData.append('blockPlot', this.addTranscform.get('tc_block_plot').value);


        }
        else if (this.addTranscform.get('ic_income_head').value == 'civil_work') {

          if (this.addTranscform.get('bookings_id').value) {
            transData.append('booking_id', this.addTranscform.get('bookings_id').value);
          } else {
            let booking_id = 'DBE013E4-8C9B-4A6E-C9IBV3I4L4WEO7KC';
            transData.append('booking_id', booking_id);
          }
          transData.append('recievedSource', this.addTranscform.get('cw_recieved_source').value);

          let cw_transType = this.addTranscform.get('cw_recieved_source').value

          if (cw_transType == 'cw_rental') {
            if (this.addTranscform.get('bookings_id').value) {
              transData.append('booking_id', this.addTranscform.get('bookings_id').value);
            } else {
              let booking_id = 'C8E9D50C-53CF-46FD-R1E6N9T9A19L5334';
              transData.append('booking_id', booking_id);
            }

            transData.append('vendorName', this.addTranscform.get('vender_name').value);
            transData.append('vehicleName', this.addTranscform.get('vechice_name').value);
            transData.append('vehicleNo', this.addTranscform.get('vehicle_no').value);
          }


        }
        else if (transType == 'rental') {
          // if(this.addTranscform.get('bookings_id').value){
          //   transData.append('booking_id', this.addTranscform.get('bookings_id').value);           
          // }else {
          //   let booking_id = 'C8E9D50C-53CF-46FD-R1E6N9T9A19L5334';
          //   transData.append('booking_id', booking_id);
          // }           

          // transData.append('vendorName', this.addTranscform.get('vender_name').value);
          // transData.append('vehicleName', this.addTranscform.get('vechice_name').value);
          // transData.append('vehicleNo', this.addTranscform.get('vehicle_no').value);
        } else {
          transData.append('booking_id', this.addTranscform.get('bookings_id').value);
        }

        // transData.append('customerName', this.addTranscform.get('tc_cust_name').value.incCombinedSearch);
        const selectedCustomer = this.addTranscform.get('tc_cust_name').value;
        if (selectedCustomer && typeof selectedCustomer === 'object' && 'incCombinedSearch' in selectedCustomer) {
          transData.append('customerName', selectedCustomer.incCombinedSearch);

        } else {
          transData.append('customerName', '');

        }
        transData.append('incomehead', this.addTranscform.get('ic_income_head').value);
        transData.append('person_map_id', this.addTranscform.get('person_map_id').value);

        transData.append('transMode', this.addTranscform.get('addpayMode').value);
        let paymentMode = this.addTranscform.get('addpayMode').value;

        if (paymentMode == 'Cheque') {
          transData.append('transChequename', this.addTranscform.get('cq_senders_bank_name').value);
          transData.append('transChequenumber', this.addTranscform.get('cq_cheque_number').value);
          transData.append('transChequeSubmitDate', this.addTranscform.get('cq_submit_date').value);
          transData.append('transChequeClearDate', this.addTranscform.get('cq_clear_date').value);
          transData.append('transRecievedBy', this.addTranscform.get('cq_recieved_by').value);

          transData.append('transAccHead', this.addTranscform.get('common_account_head').value);
          transData.append('transAccSubHead', this.addTranscform.get('common_account_sub_head').value);
          transData.append('transChequeBankName', this.addTranscform.get('common_acc_bank_name').value);

        }
        else if (paymentMode == 'Online') {
          transData.append('transAccHead', this.addTranscform.get('common_account_head').value);
          transData.append('transAccSubHead', this.addTranscform.get('common_account_sub_head').value);
          transData.append('transChequeBankName', this.addTranscform.get('common_acc_bank_name').value);
        }
        else if (paymentMode == 'Cash') {
          transData.append('transCashSubmittedBy', this.addTranscform.get('cash_submitted_by').value);
          transData.append('transCashRecievedBy', this.addTranscform.get('cash_recieved_by').value);
          transData.append('transAccHead', this.addTranscform.get('common_account_head').value);
          transData.append('transAccSubHead', this.addTranscform.get('common_account_sub_head').value);
          transData.append('issued_by', this.addTranscform.get('cash_issued_by').value);
        }
        else if (paymentMode == 'DD') {
          transData.append('transDdName', this.addTranscform.get('dd_sender_bank_name').value);
          transData.append('transDdNumber', this.addTranscform.get('dd_number').value);
          transData.append('transDdSubmitDate', this.addTranscform.get('dd_submit_date').value);
          transData.append('transChequeClearDate', this.addTranscform.get('dd_clear_date').value);
          transData.append('transRecievedBy', this.addTranscform.get('dd_recieved_by').value);

          transData.append('transAccHead', this.addTranscform.get('common_account_head').value);
          transData.append('transAccSubHead', this.addTranscform.get('common_account_sub_head').value);
          transData.append('transChequeBankName', this.addTranscform.get('common_acc_bank_name').value);

        }

        if (Number(this.previousINamount) > Number(this.addTranscform.get('common_amount').value)) {
          const lessValue = this.previousINamount - this.addTranscform.get('common_amount').value;

          transData.append('subtract_value', lessValue.toString());
        } else {
          const greaterValue = this.addTranscform.get('common_amount').value - this.previousINamount;

          transData.append('add_value', greaterValue.toString());
        }

        this.billingservice.SaveTransValues(transData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
          if (resp) {
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'Transactions Added Sucessfully',
              showConfirmButton: false,
              timer: 2000
            });
            this.addTranscform.reset();
            this.reload('IN');
            // this.rerender();
            this.closeModal();
            this.callbankChange();
            // this.paymentDetailDatatableCode();
          }
          else {
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
      else if (transType == 'expenses') {
        this.setupICMFormListeners();
        if (this.addTranscform.valid) {

          let checkAmtFormData = new FormData();
          checkAmtFormData.append('total_amount', this.addTranscform.get('common_amount').value);
          checkAmtFormData.append('account_head', this.addTranscform.get('common_account_head').value);
          checkAmtFormData.append('account_sub_head', this.addTranscform.get('common_account_sub_head').value);
          checkAmtFormData.append('account_bank_name', this.addTranscform.get('common_acc_bank_name').value);


          // if(this.addTranscform.get('addpayMode').value == 'Cash'){         
          // }          return;



          // if(this.addTranscform.get('addpayMode').value !== 'Cash'){
          //   this.billingservice.checkAmountValidation(checkAmtFormData).pipe(takeUntil(this.destroy$)).subscribe(resp => {

          //     const available = Number(resp.DATA[0][0]);
          //     const requested = Number(this.addTranscform.get('common_amount').value);

          //     if (available === 0 || available < requested) {
          //       Swal.fire({
          //         icon: 'error',
          //         title: 'Amount Limit Exceeds!',
          //         text: 'Available Balance is: ' + available,
          //         showConfirmButton: false,
          //         timer: 3000
          //       });
          //       return;
          //     } 


          //   });  
          // }else {
          //   const availableCashStr = this.srcTransactionForm.get('availableCash').value;
          //   const currentCash = this.addTranscform.get('common_amount').value;

          //   const availableCash = parseFloat(
          //     availableCashStr
          //       .replace(/[^0-9.]/g, '') 
          //       .replace(/,/g, '')       
          //   );

          //   if(Number(currentCash) > availableCash){
          //       Swal.fire({
          //         icon: 'error',
          //         title: 'Amount Limit Exceeds!',
          //         text: 'Available Balance is: ' + availableCash,
          //         showConfirmButton: false,
          //         timer: 3000
          //       });
          //       return;
          //   }


          // }

          transData.append('expenseHead', this.addTranscform.get('expense_head_value').value);
          transData.append('expVendor', this.addTranscform.get('exp_vendor_value').value);
          transData.append('expContractor', this.addTranscform.get('exp_contractor_value').value);
          // transData.append('docType', this.addTranscform.get('docType').value);
          // transData.append('docNumber', this.addTranscform.get('docNumber').value);
          // transData.append('po_no', this.addTranscform.get('po_no').value);
          if (this.addTranscform.get('expense_booking_id').value) {
            transData.append('expense_booking_id', this.addTranscform.get('expense_booking_id').value);
          } else {
            let expBookingId = 'A7598CDD-4541-4ABF-ECX3P9E1N4S4EAS2';
            transData.append('expense_booking_id', expBookingId);
          }

          if (this.addTranscform.get('expense_id').value) {
            transData.append('expense_id', this.addTranscform.get('expense_id').value);
          } else {
            transData.append('expense_id', '');
          }


          transData.append('transMode', this.addTranscform.get('addpayMode').value);
          let paymentMode = this.addTranscform.get('addpayMode').value;

          if (paymentMode == 'Cheque') {
            transData.append('cq_dd_name', this.addTranscform.get('cq_senders_bank_name').value);
            transData.append('cq_dd_number', this.addTranscform.get('cq_cheque_number').value);
            transData.append('cq_dd_submit_Date', this.addTranscform.get('cq_submit_date').value);
            transData.append('cq_clear_date', this.addTranscform.get('cq_clear_date').value);
            transData.append('recieved_By', this.addTranscform.get('cq_recieved_by').value);

            transData.append('trans_acc_head', this.addTranscform.get('common_account_head').value);
            transData.append('trans_acc_sub_head', this.addTranscform.get('common_account_sub_head').value);
            transData.append('trans_acc_bank_name', this.addTranscform.get('common_acc_bank_name').value);

          }
          else if (paymentMode == 'Online') {
            transData.append('trans_acc_head', this.addTranscform.get('common_account_head').value);
            transData.append('trans_acc_sub_head', this.addTranscform.get('common_account_sub_head').value);
            transData.append('trans_acc_bank_name', this.addTranscform.get('common_acc_bank_name').value);
          }
          else if (paymentMode == 'Cash') {
            transData.append('submitted_by', this.addTranscform.get('cash_submitted_by').value);
            transData.append('recieved_by', this.addTranscform.get('cash_recieved_by').value);
            transData.append('trans_acc_head', this.addTranscform.get('common_account_head').value);
            transData.append('trans_acc_sub_head', this.addTranscform.get('common_account_sub_head').value);
          }
          else if (paymentMode == 'DD') {

            transData.append('cq_dd_name', this.addTranscform.get('dd_sender_bank_name').value);
            transData.append('cq_dd_number', this.addTranscform.get('dd_number').value);
            transData.append('cq_dd_submit_Date', this.addTranscform.get('dd_submit_date').value);
            transData.append('cq_dd_clear_date', this.addTranscform.get('dd_clear_date').value);
            transData.append('recieved_By', this.addTranscform.get('dd_recieved_by').value);

            transData.append('trans_acc_head', this.addTranscform.get('common_account_head').value);
            transData.append('trans_acc_sub_head', this.addTranscform.get('common_account_sub_head').value);
            transData.append('trans_acc_bank_name', this.addTranscform.get('common_acc_bank_name').value);

          }


          if (Number(this.previousExpamount) > Number(this.addTranscform.get('common_amount').value)) {
            const lessValue = this.previousExpamount - this.addTranscform.get('common_amount').value;
            transData.append('subtract_value', lessValue.toString());
          } else if (Number(this.previousExpamount) < Number(this.addTranscform.get('common_amount').value)) {
            const greaterValue = this.addTranscform.get('common_amount').value - this.previousExpamount;
            transData.append('add_value', greaterValue.toString());
          }


          const isCash = paymentMode === 'Cash';
          const requestedAmount = Number(this.addTranscform.get('common_amount').value);

          let icmHead = this.addTranscform.get('common_account_head').value;

          // Payment Mode is optional for Expense. When it's left unselected there is
          // no bank/account to validate a balance against - skip the check instead of
          // running the bank-balance branch against an empty account, which used to
          // reject the save with a misleading "Amount Limit Exceeds! Available
          // Balance is: 0" error rather than reflecting that no mode was chosen.
          const skipBalanceCheck = icmHead === 'Other' || !paymentMode || paymentMode === 'select';

          (
            skipBalanceCheck
              ? of(true) // directly allow save
              : iif(
                () => isCash,
                of(this.srcTransactionForm.get('availableCash').value).pipe(
                  map(availableCashStr => {
                    const availableCash = parseFloat(
                      availableCashStr.replace(/[^0-9.]/g, '').replace(/,/g, '')
                    );
                    if (requestedAmount > availableCash) {
                      Swal.fire({
                        icon: 'error',
                        title: 'Amount Limit Exceeds!',
                        text: 'Available Balance is: ' + availableCash,
                        showConfirmButton: false,
                        timer: 3000
                      });
                      throw new Error('Cash limit exceeded');
                    }
                    return true;
                  })
                ),
                this.billingservice.checkAmountValidation(checkAmtFormData).pipe(
                  map(resp => {
                    const available = Number(resp.DATA[0][0]);
                    if (available === 0 || available < requestedAmount) {
                      Swal.fire({
                        icon: 'error',
                        title: 'Amount Limit Exceeds!',
                        text: 'Available Balance is: ' + available,
                        showConfirmButton: false,
                        timer: 3000
                      });
                      throw new Error('Bank limit exceeded');
                    }
                    return true;
                  })
                )
              )
          )
            .pipe(
              switchMap(() => this.billingservice.SaveExpTransValue(transData)),
              takeUntil(this.destroy$)
            )
            .subscribe({
              next: (resp) => {
                if (resp) {
                  Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Expense Added Successfully',
                    showConfirmButton: false,
                    timer: 2000
                  });
                  this.addTranscform.reset();
                  this.reload('OUT');
                  this.callbankChange();
                  this.closeModal();
                } else {
                  this.isSubmitDisabled = false;
                  Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: 'Failed',
                    showConfirmButton: false,
                    timer: 3000
                  });
                }
              },
              error: (err) => {
                // Balance-check rejection (or a save error) - re-enable Save so the
                // user can correct the amount/mode and try again without having to
                // close and reopen the modal.
                this.isSubmitDisabled = false;
                console.warn('Validation or Save failed:', err.message);
                // No need to do anything else — validation has already shown Swal
              }
            });




          // this.billingservice.SaveExpTransValue(transData).pipe(takeUntil(this.destroy$)).subscribe(resp => {         
          //   if (resp) {
          //     Swal.fire({
          //       icon: 'success',
          //       title: 'Success!',
          //       text: 'Expense Added Sucessfully',
          //       showConfirmButton: false,
          //       timer: 2000
          //     });
          //     this.addTranscform.reset();
          //     this.reload();
          //     this.callbankChange();
          //     // this.rerender();
          //     this.closeModal();
          //     // this.paymentDetailDatatableCode();
          //   }
          //   else {
          //     Swal.fire({
          //       icon: 'error',
          //       title: 'Error!',
          //       text: 'Failed',
          //       showConfirmButton: false,
          //       timer: 3000
          //     });
          //   }
          // });           

        } else {
          Swal.fire('Alert', 'Some Fields are Missing', 'info');
          return;
        }

      }
      else if (transType == 'inter_cash_management') {
        this.setupICMFormListeners();

        if (this.addTranscform.valid) {

          if (this.addTranscform.get('icm_booking_id').value) {
            transData.append('icm_booking_id', this.addTranscform.get('icm_booking_id').value);
          } else {
            let icmBookingId = 'A7598CDD-4541-4ABF-ICN3T9E1R4C4A9S2';
            transData.append('icm_booking_id', icmBookingId);
          }
          if (this.addTranscform.get('icm_id').value) {
            transData.append('icm_id', this.addTranscform.get('icm_id').value);
          } else {
            transData.append('icm_id', '');
          }


          if (this.addTranscform.get('icm_management_type').value == 'icm_customer') {

            // icm_customer_name is null when no customer was ever selected (the field
            // has no required validator) - guard against that before touching
            // .combinedSearch, since `typeof null === 'object'` in JS and would
            // otherwise throw here rather than just leaving the value unselected.
            let custNameValue = this.addTranscform.get('icm_customer_name')?.value;
            if (custNameValue && typeof custNameValue === 'object') {
              transData.append('select_customer', custNameValue.combinedSearch);
            } else {
              transData.append('select_customer', custNameValue);
            }


            transData.append('persons_id', this.addTranscform.get('persons_id').value);
            transData.append('person_plan_id', this.addTranscform.get('person_plan_id').value);
          } else if (this.addTranscform.get('icm_management_type').value == 'icm_party') {


            transData.append('party_name', this.addTranscform.get('icm_mgmt_party_name').value);
            transData.append('party_in_date', this.addTranscform.get('party_in_date').value);
            transData.append('party_in_mode', this.addTranscform.get('party_in_mode').value);
            transData.append('party_in_amount', this.addTranscform.get('party_in_amount').value);
            transData.append('party_in_acc_head', this.addTranscform.get('party_in_acc_head').value);
            transData.append('party_in_acc_sub_head', this.addTranscform.get('party_in_acc_sub_head').value);
            transData.append('party_in_bank', this.addTranscform.get('party_in_bank').value);
            transData.append('party_in_description', this.addTranscform.get('party_in_description').value);

            transData.append('party_out_date', this.addTranscform.get('party_out_date').value);
            transData.append('party_out_mode', this.addTranscform.get('party_out_mode').value);
            transData.append('party_out_amount', this.addTranscform.get('party_out_amount').value);
            transData.append('party_out_acc_head', this.addTranscform.get('party_out_acc_head').value);
            transData.append('party_out_acc_sub_head', this.addTranscform.get('party_out_acc_sub_head').value);
            transData.append('party_out_bank', this.addTranscform.get('party_out_bank').value);
            transData.append('party_out_description', this.addTranscform.get('party_out_description').value);
          }

          transData.append('management_type', this.addTranscform.get('icm_management_type').value);
          transData.append('trans_type', this.addTranscform.get('commonTransType').value);
          transData.append('trans_mode', this.addTranscform.get('icmaddpayMode').value);

          let icmPaymode = this.addTranscform.get('icmaddpayMode').value;
          // const cust_name  = typeof (this.addTranscform.get('icm_customer_name').value) == "object" ? this.addTranscform.get('icm_customer_name').value.name : this.addTranscform.get('bkCustomerNm').value;

          if (icmPaymode == 'icm_cheque' || icmPaymode == 'icm_online') {
            transData.append('cq_submit_date', this.addTranscform.get('icm_cq_submit_date').value);
            transData.append('cq_clear_date', this.addTranscform.get('icm_cq_clear_date').value);
            transData.append('icm_cq_number', this.addTranscform.get('icm_cq_number').value);

            transData.append('from_acc_head', this.addTranscform.get('icm_from_acc_head').value);
            transData.append('from_acc_sub_head', this.addTranscform.get('icm_from_acc_sub_head').value);
            transData.append('from_bank_name', this.addTranscform.get('icm_form_bank_name').value);
            transData.append('to_acc_head', this.addTranscform.get('icm_to_acc_head').value);
            transData.append('to_acc_sub_head', this.addTranscform.get('icm_to_acc_sub_head').value);
            transData.append('to_bank_name', this.addTranscform.get('icm_to_bank_name').value);
            transData.append('to_cheque_no_name', this.addTranscform.get('icm_cust_cq_to_cqname').value);
          } else if (icmPaymode == 'icm_cash') {
            transData.append('to_acc_head', this.addTranscform.get('icm_to_acc_head').value);
            transData.append('to_acc_sub_head', this.addTranscform.get('icm_to_acc_sub_head').value);
            transData.append('to_bank_name', this.addTranscform.get('icm_to_bank_name').value);
            transData.append('to_cheque_no_name', this.addTranscform.get('icm_cust_cq_to_cqname').value);
          } else if (icmPaymode == 'icm_cash_withdrawal') {
            transData.append('from_acc_head', this.addTranscform.get('icm_from_acc_head').value);
            transData.append('from_acc_sub_head', this.addTranscform.get('icm_from_acc_sub_head').value);
            transData.append('from_bank_name', this.addTranscform.get('icm_form_bank_name').value);

            transData.append('to_acc_head', 'party_in_head');
            transData.append('to_acc_sub_head', 'party_in_subhead');
            transData.append('to_bank_name', 'party_in_bank_name');
          }

          if ((this.addTranscform.get('icm_management_type').value == 'icm_customer') && icmPaymode == 'icm_cash') {
            let desductfromInData = new FormData();

            let prevAmnt = this.previousICMamount;

            if (prevAmnt != undefined) {
              const currentAmnt = this.addTranscform.get('common_amount').value;
              const finalAmnt = Math.abs(prevAmnt - currentAmnt);
              desductfromInData.append('trans_amount', finalAmnt.toString());
            } else {
              desductfromInData.append('trans_amount', this.addTranscform.get('common_amount').value);
            }
            desductfromInData.append('from_acc_head', 'party_in_head');
            desductfromInData.append('from_acc_sub_head', 'party_in_subhead');
            desductfromInData.append('from_bank_name', 'party_in_bank_name');

            const currentCash = this.addTranscform.get('common_amount').value;
            const availableCashStr = this.srcTransactionForm.get('availableCash').value;
            const availableCash = parseFloat(
              availableCashStr
                .replace(/[^0-9.]/g, '')
                .replace(/,/g, '')
            );

            if (Number(currentCash) > availableCash) {
              this.isSubmitDisabled = false;
              Swal.fire({
                icon: 'error',
                title: 'Amount Limit Exceeds!',
                text: 'Available Balance is: ' + availableCash,
                showConfirmButton: false,
                timer: 3000
              });
              return;
            }

            const currnAmnt = this.addTranscform.get('common_amount').value;
            const rawToCqValue = this.addTranscform.get('icm_cust_cq_to_cqname').value;
            let tochqValue: string | undefined;
            if (rawToCqValue) {
              const parts = rawToCqValue.split(',').map(p => p.trim());

              if (parts.length === 4) {
                tochqValue = parts[1];
              } else if (parts.length === 2) {
                tochqValue = parts[1];
              } else {
                console.warn('Unexpected format in icm_cust_cq_to_cqname:', rawToCqValue);
              }
            }

            if (Number(currnAmnt) > Number(tochqValue)) {
              this.isSubmitDisabled = false;
              Swal.fire({
                icon: 'error',
                title: 'Amount Limit Exceeds!',
                text: 'Rotation Amount Should be less than Clearance Amount',
                showConfirmButton: false,
                timer: 3000
              });
              return;
            }


            this.billingservice.deductFromInAmnt(desductfromInData).pipe(takeUntil(this.destroy$)).subscribe(resp => {

            });
          } else if (this.addTranscform.get('icm_management_type').value == 'icm_internal' && icmPaymode == 'icm_cash') {
            let cashFormData = new FormData();
            const previousAmount = Number(this.previousICMamount ?? 0);
            // cashFormData.append('amount',this.addTranscform.get('common_amount').value);
            if (previousAmount > Number(this.addTranscform.get('common_amount').value)) {
              const lessValue = previousAmount - this.addTranscform.get('common_amount').value;
              cashFormData.append('subtract_value', lessValue.toString());
            } else if (previousAmount < Number(this.addTranscform.get('common_amount').value)) {
              const greaterValue = this.addTranscform.get('common_amount').value - previousAmount;
              cashFormData.append('add_value', greaterValue.toString());
            }
            this.billingservice.updateForCashOnly(cashFormData).pipe(takeUntil(this.destroy$)).subscribe(resp => {

            });
          } else if (this.addTranscform.get('icm_management_type').value == 'icm_internal' && icmPaymode == 'icm_cash_withdrawal') {
            let cashFormData = new FormData();
            const previousAmount = Number(this.previousICMamount ?? 0);

            // cashFormData.append('amount',this.addTranscform.get('common_amount').value);
            if (Number(previousAmount) < Number(this.addTranscform.get('common_amount').value)) {
              const lessValue = this.addTranscform.get('common_amount').value - previousAmount;
              cashFormData.append('subtract_value', lessValue.toString());
            } else if (Number(previousAmount) > Number(this.addTranscform.get('common_amount').value)) {
              const greaterValue = previousAmount - this.addTranscform.get('common_amount').value;
              cashFormData.append('add_value', greaterValue.toString());
            }
            this.billingservice.updateForCashOnly(cashFormData).pipe(takeUntil(this.destroy$)).subscribe(resp => {

            });
          }


          //save the filed entry 'to cheque no/name'
          if (this.addTranscform.get('icm_management_type').value === 'icm_customer') {
            let saveFormData = new FormData();
            saveFormData.append('trans_amount', this.addTranscform.get('common_amount').value);
            saveFormData.append('person_plan_id', this.addTranscform.get('person_plan_id').value);

            const currnAmnt = this.addTranscform.get('common_amount').value;
            const rawToCqValue = this.addTranscform.get('icm_cust_cq_to_cqname').value;
            let tochqValue: string | undefined;
            if (rawToCqValue) {
              const parts = rawToCqValue.split(',').map(p => p.trim());

              if (parts.length === 4) {
                tochqValue = parts[1];
              } else if (parts.length === 2) {
                tochqValue = parts[1];
              } else {
                console.warn('Unexpected format in icm_cust_cq_to_cqname:', rawToCqValue);
              }
            }

            if (Number(currnAmnt) > Number(tochqValue)) {
              this.isSubmitDisabled = false;
              Swal.fire({
                icon: 'error',
                title: 'Amount Limit Exceeds!',
                text: 'Rotation Amount Should be less than Clearance Amount',
                showConfirmButton: false,
                timer: 3000
              });
              return;
            }

            const normalize = (val: any) => val ? String(val).trim().toLowerCase() : ''
            const out_head = normalize(this.addTranscform.get('icm_from_acc_head')?.value);
            const out_subhead = normalize(this.addTranscform.get('icm_from_acc_sub_head')?.value);
            const out_bank = normalize(this.addTranscform.get('icm_form_bank_name')?.value);
            const filled_amount = this.addTranscform.get('common_amount').value;


            this.BankExpectedValue = this.CheckBankLists.find(item =>
              normalize(item.acc_head) === out_head &&
              normalize(item.acc_sub_head) === out_subhead &&
              normalize(item.bank_name) === out_bank
            );
            const bank_amount = Number(this.BankExpectedValue?.total_amount || 0);
            if (icmPaymode !== 'icm_cash' && filled_amount > bank_amount) {
              this.isSubmitDisabled = false;
              Swal.fire({
                icon: 'error',
                title: 'Transaction Failed!',
                html: `
                      <strong>Insufficient Balance</strong><br><br>
                      Unable to process the transaction from :<br>
                      <b>${out_head}</b> →
                      <b>${out_subhead}</b> →
                      <b>${out_bank}</b>
                    `,
                showConfirmButton: true,
                confirmButtonText: 'OK'
              });
              return;
            }

            this.billingservice.updateStatusAmt(saveFormData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
              if (resp) {

              } else {

              }
            });

          }


          if (Number(this.previousICMamount) > Number(this.addTranscform.get('common_amount').value)) {
            const lessValue = this.previousICMamount - this.addTranscform.get('common_amount').value;

            transData.append('subtract_value', lessValue.toString());
          } else {
            const greaterValue = this.addTranscform.get('common_amount').value - this.previousICMamount;

            transData.append('add_value', greaterValue.toString());
          }


          let inCall$ = of(true);   // default no-op
          let outCall$ = of(true);  // default no-op          
          //check if IN and OUT value are coming, if coming then set the diff amount (if amount in profit then add in IN table, otherwise add in OUT table)
          if (this.addTranscform.get('party_in_date').value && this.addTranscform.get('party_in_amount').value
            || this.addTranscform.get('party_out_date').value && this.addTranscform.get('party_out_amount').value) {
            const in_amount = parseFloat(this.addTranscform.get('party_in_amount')?.value) || 0;
            const out_amount = parseFloat(this.addTranscform.get('party_out_amount')?.value) || 0;



            if (in_amount > out_amount) {
              const profit_value = in_amount - out_amount;
              let profitFormData = new FormData();
              profitFormData.append('recieved_date', this.addTranscform.get('party_in_date').value);
              profitFormData.append('transaction_type', 'inter_cash_management');
              profitFormData.append('income_head', 'ROTA /BILL EXP.');
              profitFormData.append('trans_status', 'Completed');


              if (this.previousPartyInCashAmt == 0) {
                const myId = uuid();
                transData.append('icm_party_link_booking_id', myId);
                profitFormData.append('icm_party_link_booking_id', myId);
                profitFormData.append('trans_amount', profit_value.toString());
              } else {
                if (Number(this.previousPartyInCashAmt) > Number(this.addTranscform.get('party_in_amount').value)) {
                  const lessValue = this.previousPartyInCashAmt - this.addTranscform.get('party_in_amount').value;
                  profitFormData.append('lessValue', lessValue.toString());
                  profitFormData.append('trans_amount', profit_value.toString());
                } else {
                  const greatervalue = this.addTranscform.get('party_in_amount').value - this.previousPartyInCashAmt;
                  profitFormData.append('greatervalue', greatervalue.toString());
                  profitFormData.append('trans_amount', profit_value.toString());
                }
              }


              // starts...check the minimum amount for out Mode

              const normalize = (val: any) => val ? String(val).trim().toLowerCase() : ''

              const out_head = normalize(this.addTranscform.get('party_out_acc_head')?.value);
              const out_subhead = normalize(this.addTranscform.get('party_out_acc_sub_head')?.value);
              const out_bank = normalize(this.addTranscform.get('party_out_bank')?.value);
              const out_mode = this.addTranscform.get('party_out_mode').value;
              // this.BankExpectedValue = this.PaymentDetaildataBank.find(item =>
              //   normalize(item.acc_head) == out_head &&
              //   normalize(item.acc_sub_head) == out_subhead &&
              //   normalize(item.bank_name) == out_bank
              // );
              // const bank_amount = Number(this.BankExpectedValue.total_amount);
              const filled_bank = this.addTranscform.get('party_out_amount').value;
              const availableCashStr = this.srcTransactionForm.get('availableCash').value;
              const availableCash = parseFloat(
                availableCashStr
                  .replace(/[^0-9.]/g, '')
                  .replace(/,/g, '')
              );


              if (out_mode === 'party_out_cash') {

                if (filled_bank > availableCash) {
                  this.isSubmitDisabled = false;
                  Swal.fire({
                    icon: 'error',
                    title: 'Amount Limit Exceeds!',
                    text: 'Available Balance is: ' + availableCash,
                    showConfirmButton: false,
                    timer: 3000
                  });
                  return;
                }
              } else {
                this.BankExpectedValue = this.CheckBankLists.find(item =>
                  normalize(item.acc_head) === out_head &&
                  normalize(item.acc_sub_head) === out_subhead &&
                  normalize(item.bank_name) === out_bank
                );

                const bank_amount = Number(this.BankExpectedValue?.total_amount || 0);

                if (filled_bank > bank_amount) {
                  this.isSubmitDisabled = false;
                  Swal.fire({
                    icon: 'error',
                    title: 'Transaction Failed!',
                    html: `
                            <strong>Insufficient Balance</strong><br><br>
                            Unable to process the transaction from :<br>
                            <b>${out_head}</b> →
                            <b>${out_subhead}</b> →
                            <b>${out_bank}</b>
                          `,
                    showConfirmButton: true,
                    confirmButtonText: 'OK'
                  });
                  return;
                } else if (filled_bank > availableCash) {
                  this.isSubmitDisabled = false;
                  Swal.fire({
                    icon: 'error',
                    title: 'Amount Limit Exceeds!',
                    text: 'Available Balance is: ' + availableCash,
                    showConfirmButton: false,
                    timer: 3000
                  });
                  return;
                }
              }


              // ends...check the minimum amount for out Mode

              profitFormData.append('payment_mode', this.addTranscform.get('party_in_mode').value);
              profitFormData.append('descriptions', this.addTranscform.get('icm_mgmt_party_name').value);
              profitFormData.append('acc_head', this.addTranscform.get('party_in_acc_head').value);
              profitFormData.append('acc_sub_head', this.addTranscform.get('party_in_acc_sub_head').value);
              profitFormData.append('bank_name', this.addTranscform.get('party_in_bank').value);

              // if (this.addTranscform.get('party_in_mode').value !== 'party_in_cash') {
              // }                
              inCall$ = this.billingservice.savePartyToIN(profitFormData);

              // if(this.addTranscform.get('party_in_mode').value === 'party_in_cash'){

              // } else {
              //   this.billingservice.savePartyToIN(profitFormData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
              //    
              //   });
              // }

            } else if (out_amount > in_amount) {
              const loss_value = out_amount - in_amount;

              let lossFormData = new FormData();
              lossFormData.append('recieved_date', this.addTranscform.get('party_out_date').value);
              lossFormData.append('trans_type', 'inter_cash_management');
              lossFormData.append('expense_head', 'ROTA /BILL EXP.');


              if (this.previousPartyOutCashAmt == 0) {
                const myId = uuid();
                transData.append('icm_party_link_booking_id', myId);
                lossFormData.append('icm_party_link_booking_id', myId);
                lossFormData.append('trans_amount', loss_value.toString());
              } else {
                if (Number(this.previousPartyOutCashAmt) > Number(this.addTranscform.get('party_out_amount').value)) {
                  const lessValue = this.previousPartyOutCashAmt - this.addTranscform.get('party_out_amount').value;
                  lossFormData.append('lessValue', lessValue.toString());
                  lossFormData.append('trans_amount', loss_value.toString());
                } else {
                  const greatervalue = this.addTranscform.get('party_out_amount').value - this.previousPartyOutCashAmt;
                  lossFormData.append('greatervalue', greatervalue.toString());
                  lossFormData.append('trans_amount', loss_value.toString());
                }
              }

              lossFormData.append('payment_mode', this.addTranscform.get('party_out_mode').value);
              lossFormData.append('exp_descriptions', this.addTranscform.get('icm_mgmt_party_name').value);
              lossFormData.append('trans_acc_head', this.addTranscform.get('party_out_acc_head').value);
              lossFormData.append('trans_acc_sub_head', this.addTranscform.get('party_out_acc_sub_head').value);
              lossFormData.append('trans_acc_bank_name', this.addTranscform.get('party_out_bank').value);

              // if (this.addTranscform.get('party_out_mode').value !== 'party_out_cash') {
              // }               
              outCall$ = this.billingservice.savePartyToOUT(lossFormData);

              // if(this.addTranscform.get('party_out_mode').value === 'party_out_cash'){

              // } else {
              //   this.billingservice.savePartyToOUT(lossFormData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
              //   
              //   if(resp === false){                              
              //     Swal.fire({
              //       icon: 'error',
              //       title: 'Transaction Failed!',
              //       html: `
              //         <strong>Insufficient Balance</strong><br><br>
              //         Unable to process the transaction from :<br>
              //         <b>${this.addTranscform.get('party_out_acc_head').value}</b> → 
              //         <b>${this.addTranscform.get('party_out_acc_sub_head').value}</b> → 
              //         <b>${this.addTranscform.get('party_out_bank').value}</b>
              //       `,
              //       showConfirmButton: true,
              //       confirmButtonText: 'OK'
              //     });
              //     return;
              //   }
              //   
              //   });
              // }

            }


          } else {
            console.log('something is missing...')
          }


          forkJoin([inCall$, outCall$]).pipe(takeUntil(this.destroy$)).subscribe(([inResp, outResp]) => {
            // Check if OUT failed
            if (outResp === false) {
              this.isSubmitDisabled = false;
              Swal.fire({
                icon: 'error',
                title: 'Transaction Failed!',
                html: `
                    <strong>Insufficient Balance</strong><br><br>
                    Unable to process the transaction from :<br>
                    <b>${this.addTranscform.get('party_out_acc_head').value}</b> →
                    <b>${this.addTranscform.get('party_out_acc_sub_head').value}</b> →
                    <b>${this.addTranscform.get('party_out_bank').value}</b>
                  `,
                showConfirmButton: true,
                confirmButtonText: 'OK'
              });
              return;
            }

            if (this.addTranscform.get('party_in_mode').value === 'party_in_cash') {
              let profitFormData = new FormData();
              profitFormData.append('transaction_id', '0b8d43ab-42d0-4118-a27d-9a1469dab3c1');

              if (this.previousPartyInCashAmt == 0) {
                profitFormData.append('trans_amount', this.addTranscform.get('party_in_amount').value);
              } else {
                if (Number(this.previousPartyInCashAmt) > Number(this.addTranscform.get('party_in_amount').value)) {
                  const lessValue = this.previousPartyInCashAmt - this.addTranscform.get('party_in_amount').value;
                  profitFormData.append('lessValue', lessValue.toString());
                  profitFormData.append('trans_amount', this.addTranscform.get('party_in_amount').value);
                } else {
                  const greatervalue = this.addTranscform.get('party_in_amount').value - this.previousPartyInCashAmt;
                  profitFormData.append('greatervalue', greatervalue.toString());
                  profitFormData.append('trans_amount', this.addTranscform.get('party_in_amount').value);
                }
              }


              profitFormData.append('acc_head', 'party_in_head');
              profitFormData.append('acc_sub_head', 'party_in_subhead');
              profitFormData.append('bank_name', 'party_in_bank_name');
              this.billingservice.addPartyAmountToAvaCash(profitFormData).pipe(takeUntil(this.destroy$)).subscribe(resp => {

              });

            }
            if (this.addTranscform.get('party_out_mode').value === 'party_out_cash') {
              let lossFormData = new FormData();
              lossFormData.append('expense_id', 'ad955ebf-72c1-4865-9b67-9aee5070120a');

              if (this.previousPartyOutCashAmt == 0) {
                lossFormData.append('trans_amount', this.addTranscform.get('party_out_amount').value);
              } else {
                if (Number(this.previousPartyOutCashAmt) > Number(this.addTranscform.get('party_out_amount').value)) {
                  const lessValue = this.previousPartyOutCashAmt - this.addTranscform.get('party_out_amount').value;
                  lossFormData.append('lessValue', lessValue.toString());
                  lossFormData.append('trans_amount', this.addTranscform.get('party_out_amount').value);
                } else {
                  const greatervalue = this.addTranscform.get('party_out_amount').value - this.previousPartyOutCashAmt;
                  lossFormData.append('greatervalue', greatervalue.toString());
                  lossFormData.append('trans_amount', this.addTranscform.get('party_out_amount').value);
                }
              }
              lossFormData.append('trans_amount', this.addTranscform.get('party_out_amount').value);
              lossFormData.append('trans_acc_head', 'party_out_head');
              lossFormData.append('trans_acc_subhead', 'party_out_subhead');
              lossFormData.append('trans_acc_bank_name', 'party_out_bank_name');

              const availableCashStr = this.srcTransactionForm.get('availableCash').value;
              const currentCash = this.addTranscform.get('party_out_amount').value;

              const availableCash = parseFloat(
                availableCashStr
                  .replace(/[^0-9.]/g, '')
                  .replace(/,/g, '')
              );
              if (Number(currentCash) > availableCash) {
                this.isSubmitDisabled = false;
                Swal.fire({
                  icon: 'error',
                  title: 'Amount Limit Exceeds!',
                  text: 'Available Balance is: ' + availableCash,
                  showConfirmButton: false,
                  timer: 3000
                });
                return;
              }

              this.billingservice.subtractPartyAmountFromAvaCash(lossFormData).pipe(takeUntil(this.destroy$)).subscribe(resp => {

              });
            }





            // Now call SaveIcmDetails
            this.billingservice.SaveIcmDetails(transData).pipe(takeUntil(this.destroy$)).subscribe({
              next: (resp1) => {
                if (resp1 === true) {
                  const icmType = this.addTranscform.get('icm_management_type')?.value;
                  const redirectTarget = this.redirectAfterSave;
                  Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Inter Cash Added Successfully',
                    showConfirmButton: false,
                    timer: 2000
                  });
                  this.addTranscform.reset();


                  if (icmType === 'icm_internal') {
                    this.reload('ICM_INTERNAL');
                  }
                  else if (icmType === 'icm_customer') {
                    this.reload('ICM_CUSTOMER');
                  }
                  else if (icmType === 'icm_party') {
                    this.reload('ICM_PARTY');
                  }

                  this.closeModal();
                  if (redirectTarget?.bookingId && redirectTarget?.prsnId) {
                    this.router.navigate(
                      ['/edit-booking', redirectTarget.bookingId, redirectTarget.prsnId, 'Edit'],
                      { queryParams: { tab: 'paymentPlan' } }
                    );
                    this.redirectAfterSave = null;
                  }
                } else if (resp1 === false) {
                  this.isSubmitDisabled = false;
                  Swal.fire({
                    icon: 'error',
                    title: 'Transaction Failed!',
                    html: `
                      <strong>Insufficient Balance</strong><br><br>
                      Unable to process the transaction from :<br>
                      <b>${this.addTranscform.get('icm_from_acc_head').value}</b> →
                      <b>${this.addTranscform.get('icm_from_acc_sub_head').value}</b> →
                      <b>${this.addTranscform.get('icm_form_bank_name').value}</b>
                    `,
                    showConfirmButton: true,
                    confirmButtonText: 'OK'
                  });
                } else {
                  this.isSubmitDisabled = false;
                  Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: 'Failed',
                    showConfirmButton: false,
                    timer: 3000
                  });
                }
              },
              error: (err) => {
                // Re-enable Save so the user can retry without closing/reopening the modal.
                this.isSubmitDisabled = false;
                console.warn('ICM save failed:', err.message);
              }
            });
          });
        } else {
          this.isSubmitDisabled = false;
          Swal.fire('Alert', 'Some Fields are Missing', 'info');
          return;
        }


      }
    }
    else {
      Swal.fire('Alert', 'Some Fields are Missing', 'info');
    }


  }

  saveBankTransList() {
    let bankFormData = new FormData();

    bankFormData.append('accHead', this.icmPartyForm.get('bank_acc_head').value);
    bankFormData.append('accSubHead', this.icmPartyForm.get('bank_acc_sub_head').value);
    bankFormData.append('bankName', this.icmPartyForm.get('bank_bank_name').value);
    bankFormData.append('totalAmount', this.icmPartyForm.get('bank_total_amount').value);

    this.billingservice.saveBankDetails(bankFormData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      if (resp) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Bank Details Added',
          showConfirmButton: false,
          timer: 2000
        });
        this.reload('BANK');
        this.callbankChange();
      }
      else {
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

  rerender(): void {
    this.dtElement.forEach((item) => {
      if (item.dtInstance) {
        item.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.destroy();
        });
      }
    });

    this.dtTrigger5.next();
    this.dtTrigger8.next();
    this.dtTrigger7.next();
    this.dtTrigger9.next();
    this.dtTrigger10.next();
    this.dtTrigger11.next();
    this.dtTrigger12.next();
    this.dtTrigger.next();
  }

  reload(tableType?: 'IN' | 'OUT' | 'ICM_INTERNAL' | 'ICM_CUSTOMER' | 'ICM_PARTY' | 'BANK' | 'LOGS') {

    const reloadTable = (index: number) => {
      const table = this.dtElement.toArray()[index];
      if (table?.dtInstance) {
        table.dtInstance.then((dt: DataTables.Api) => {
          dt.ajax.reload(null, false); // keep pagination
        });
      }
    };

    switch (tableType) {
      case 'IN':
        reloadTable(0);   // Payment IN
        break;

      case 'OUT':
        reloadTable(1);   // Expenses
        break;

      case 'ICM_INTERNAL':
        reloadTable(2);   // ICM Internal
        break;

      case 'ICM_CUSTOMER':
        reloadTable(3);   // ICM Customer
        break;

      case 'ICM_PARTY':
        reloadTable(4);   // ICM Party
        break;

      case 'BANK':
        reloadTable(5);   // Bank
        break;

      case 'LOGS':
        reloadTable(6);   // Logs
        break;

      default:
        // fallback (rarely needed)
        this.dtElement.forEach(item =>
          item.dtInstance?.then(dt => dt.ajax.reload(null, false))
        );
    }

    this.changeAvaCash();
  }






  onAccHeadChange(event: Event): void {


    const selectedValue = (event.target as HTMLSelectElement).value;

    if (selectedValue) {

      this.getAccSubHead(selectedValue);

    }

  }


  // getAccHead(){
  //   let headData = new FormData();
  //   this.hrservice.fetch_headData(headData).pipe(takeUntil(this.destroy$)).subscribe(Response => {
  //     this.resplookupBank = Response.data
  //   }); 
  // }

  // getAllAccSubHead(){
  //   let headData = new FormData();
  //   this.hrservice.fetch_AllSubheadData(headData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
  //     this.resplookupsubBank = resp.data;
  //   });
  // }

  // getAllBankDetails(){
  //   let headData = new FormData();
  //   this.hrservice.fetch_AllBankDetails(headData).pipe(takeUntil(this.destroy$)).subscribe(resp => {      
  //     this.SelectedBankData = resp.data;
  //   })
  // }


  commongetAccHead() {
    let headData = new FormData();
    this.hrservice.fetch_headData(headData).pipe(takeUntil(this.destroy$)).subscribe(Response => {

      this.commonresplookupBank = Response.data

    });
  }

  commongetAllAccSubHead() {
    let headData = new FormData();

    this.hrservice.fetch_AllSubheadData(headData).pipe(takeUntil(this.destroy$)).subscribe(resp => {

      this.commonresplookupsubBank = resp.data;

    });
  }

  commongetAllBankDetails() {
    let headData = new FormData();

    this.hrservice.fetch_AllBankDetails(headData).pipe(takeUntil(this.destroy$)).subscribe(resp => {

      this.commonSelectedBankData = resp.data;

    })
  }

  commononAccHeadChange(event: Event): void {


    const selectedValue = (event.target as HTMLSelectElement).value;
    if (selectedValue) {

      this.commongetAccSubHead(selectedValue);

    }

  }

  commongetAccSubHead(selectedValue: string) {

    let subHead = new FormData();
    subHead.append('subhead', selectedValue);
    this.hrservice.fetch_subheadData(subHead).pipe(takeUntil(this.destroy$)).subscribe(Response => {


      this.commonresplookupsubBank = Response.data;

      // return this.resplookupsubBank;
    });
  }

  commononAccSubHeadChange(event: Event) {

    let HeadAndSubhHeadData = new FormData();

    HeadAndSubhHeadData.append('acc_head', this.addTranscform.get('common_account_head').value);
    HeadAndSubhHeadData.append('acc_sub_head', this.addTranscform.get('common_account_sub_head').value);


    this.hrservice.fetch_bankName(HeadAndSubhHeadData).pipe(takeUntil(this.destroy$)).subscribe(resp => {

      this.commonSelectedBankData = resp.data;

      if (resp.data && resp.data.length > 0 && resp.data[0].bankName) {
        this.addTranscform.patchValue({
          common_acc_bank_name: resp.data[0].bankName
        });
        this.addTranscform.get('common_acc_bank_name').setValue(resp.data[0].bankName);
      }

    });

  }

  searchAccSubHeadChange(event: Event) {
    let headSubHeadData = new FormData();


    headSubHeadData.append('acc_head', this.bankTransForm.get('bd_acc_head').value);
    headSubHeadData.append('acc_sub_head', this.bankTransForm.get('bd_acc_sub_head').value);
    this.hrservice.fetch_bankName(headSubHeadData).pipe(takeUntil(this.destroy$)).subscribe(resp => {

      this.partyInSelectedBankData = resp.data;

      if (resp.data && resp.data.length > 0 && resp.data[0].bankName) {
        this.bankTransForm.patchValue({
          bd_bank_name: resp.data[0].bankName
        });
        this.bankTransForm.get('bd_bank_name').setValue(resp.data[0].bankName);
      }

    });
  }



  outPartyAccSubHeadChange(event: Event) {
    let headSubHeadData = new FormData();


    headSubHeadData.append('acc_head', this.addTranscform.get('party_out_acc_head').value);
    headSubHeadData.append('acc_sub_head', this.addTranscform.get('party_out_acc_sub_head').value);
    this.hrservice.fetch_bankName(headSubHeadData).pipe(takeUntil(this.destroy$)).subscribe(resp => {

      this.commonSelectedBankData = resp.data;

      if (resp.data && resp.data.length > 0 && resp.data[0].bankName) {
        this.addTranscform.patchValue({
          party_out_bank: resp.data[0].bankName
        });
        this.addTranscform.get('party_out_bank').setValue(resp.data[0].bankName);
      }

    });
  }

  bankAccSubHeadChange(event: Event) {
    let headSubheadData = new FormData();

    headSubheadData.append('acc_head', this.icmPartyForm.get('bank_acc_head').value);
    headSubheadData.append('acc_sub_head', this.icmPartyForm.get('bank_acc_sub_head').value);
    this.hrservice.fetch_bankName(headSubheadData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.commonSelectedBankData = resp.data;
      if (resp.data && resp.data.length > 0 && resp.data[0].bankName) {
        this.icmPartyForm.patchValue({
          bank_bank_name: resp.data[0].bankName
        });
        this.icmPartyForm.get('bank_bank_name').setValue(resp.data[0].bankName);
      }
    });

  }


  onAccSubHeadChange(event: Event) {

    let HeadAndSubhHeadData = new FormData();

    HeadAndSubhHeadData.append('acc_head', this.srcTransactionForm.get('bankAccHead').value);
    HeadAndSubhHeadData.append('acc_sub_head', this.srcTransactionForm.get('bankAccSubHead').value);


    this.hrservice.fetch_bankName(HeadAndSubhHeadData).pipe(takeUntil(this.destroy$)).subscribe(resp => {

      this.SelectedBankData = resp.data;

      if (resp.data && resp.data.length > 0 && resp.data[0].bankName) {
        this.srcTransactionForm.patchValue({
          bankAccBankName: resp.data[0].bankName
        });

        this.srcTransactionForm.get('bankAccBankName').setValue(resp.data[0].bankName);
      }


      let accHead = this.srcTransactionForm.get('bankAccHead').value;
      let accSubHead = this.srcTransactionForm.get('bankAccSubHead').value;
      let bankName = this.srcTransactionForm.get('bankAccBankName').value;
      this.logSelectedBankDetails(accHead, accSubHead, bankName)


    });

  }

  onBankChange(event: Event) {

    let accHead = this.srcTransactionForm.get('bankAccHead').value;
    let accSubHead = this.srcTransactionForm.get('bankAccSubHead').value;
    let bankName = this.srcTransactionForm.get('bankAccBankName').value;
    this.logSelectedBankDetails(accHead, accSubHead, bankName)
  }




  getAccSubHead(selectedValue: string) {

    let subHead = new FormData();
    subHead.append('subhead', selectedValue);
    this.hrservice.fetch_subheadData(subHead).pipe(takeUntil(this.destroy$)).subscribe(Response => {
      this.resplookupsubBank = Response.data;
      // return this.resplookupsubBank;
    });

  }


  // started... Party In acchead , subhead and bank data 
  partyIngetAccHead() {
    let headData = new FormData();
    this.hrservice.fetch_headData(headData).pipe(takeUntil(this.destroy$)).subscribe(Response => {

      this.partyInresplookupBank = Response.data

    });
  }
  partyIngetAllAccSubHead() {
    let headData = new FormData();

    this.hrservice.fetch_AllSubheadData(headData).pipe(takeUntil(this.destroy$)).subscribe(resp => {

      this.partyInresplookupsubBank = resp.data;

    });
  }
  partyIngetAllBankDetails() {
    let headData = new FormData();

    this.hrservice.fetch_AllBankDetails(headData).pipe(takeUntil(this.destroy$)).subscribe(resp => {

      this.partyInSelectedBankData = resp.data;

    })
  }


  onPartyInAccHeadChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    if (selectedValue) {
      this.partyIngetAccSubHead(selectedValue);
    }
  }
  partyIngetAccSubHead(selectedValue: string) {
    let subHead = new FormData();
    subHead.append('subhead', selectedValue);
    this.hrservice.fetch_subheadData(subHead).pipe(takeUntil(this.destroy$)).subscribe(Response => {
      this.partyInresplookupsubBank = Response.data;
    });
  }

  inPartyAccSubHeadChange(event: Event) {
    let headSubHeadData = new FormData();


    headSubHeadData.append('acc_head', this.addTranscform.get('party_in_acc_head').value);
    headSubHeadData.append('acc_sub_head', this.addTranscform.get('party_in_acc_sub_head').value);
    this.hrservice.fetch_bankName(headSubHeadData).pipe(takeUntil(this.destroy$)).subscribe(resp => {

      this.partyInSelectedBankData = resp.data;

      if (resp.data && resp.data.length > 0 && resp.data[0].bankName) {
        this.addTranscform.patchValue({
          party_in_bank: resp.data[0].bankName
        });
        this.addTranscform.get('party_in_bank').setValue(resp.data[0].bankName);
      }

    });
  }

  // ended .... Party In acchead , subhead and bank data


  // start ICM internal subhead values

  IcmInternalgetAllAccSubHead() {
    let headData = new FormData();

    this.hrservice.fetch_AllSubheadData(headData).pipe(takeUntil(this.destroy$)).subscribe(resp => {

      this.icmInternalresplookupsubBank = resp.data;

    });
  }

  onGetSelectedFromBankName(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    let formData = new FormData();
    formData.append('selected_sub_head', selectedValue);
    this.hrservice.onGetSelectedBankName(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.onGetSelectedFromBankNameLists = resp.data
    });

  }
  onGetSelectedToBankName(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    let formData = new FormData();
    formData.append('selected_sub_head', selectedValue);
    this.hrservice.onGetSelectedBankName(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.onGetSelectedToBankNameLists = resp.data
    });

  }

  // end ICM Internal subhead values




  transSearch() {
    this.paymentDetailDatatableCode();
    // this.paymentDetailDatatableCodeAll();
    // this.rerender();
    this.reload('IN');

  }

  resetINSearch() {
    this.searchIN.get('searchCommonTransType').setValue('');
    this.searchIN.get('searchPayMode').setValue('');
    this.searchIN.get('bd_acc_head_in').setValue('');
    this.searchIN.get('bd_acc_sub_head_in').setValue('');
    this.searchIN.get('customerId').setValue('');
    this.searchIN.get('fromsearchRecDate').setValue('');
    this.searchIN.get('tosearchRecDate').setValue('');

    this.paymentDetailDatatableCode();
    // this.paymentDetailDatatableCodeAll();
    this.reload('IN');
  }

  onInTransTypeChange(event: any) {
    const value = event?.target?.value;
    if (String(value) !== '1') {
      this.searchIN.get('customerId')?.setValue('');
    }
  }

  expenseDatatableCode() {

    const rawDate = this.searchOUT.get('fromsearchRecDateExp').value;

    let formattedDate = null;

    if (typeof rawDate === 'string') {
      formattedDate = moment(rawDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
    } else if (rawDate instanceof Date) {
      formattedDate = moment(rawDate).format('YYYY-MM-DD');
    }
    if (formattedDate) {
      this.paymentExpensedatatableParameter.fromsearchRecDateExp = formattedDate;
    }

    const torawDate = this.searchOUT.get('tosearchRecDateExp').value;

    let toformattedDate = null;

    if (typeof torawDate === 'string') {
      toformattedDate = moment(torawDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
    } else if (torawDate instanceof Date) {
      toformattedDate = moment(torawDate).format('YYYY-MM-DD');
    }
    if (toformattedDate) {
      this.paymentExpensedatatableParameter.tosearchRecDateExp = toformattedDate;
    }

    // this.paymentExpensedatatableParameter.searchRecDateExp = this.searchOUT.get('searchRecDateExp').value;
    this.paymentExpensedatatableParameter.expense_head_valueExp = this.searchOUT.get('expense_head_valueExp').value;
    this.paymentExpensedatatableParameter.searchPayModeExp = this.searchOUT.get('searchPayModeExp').value;
    this.paymentExpensedatatableParameter.bd_acc_head_exp = this.searchOUT.get('bd_acc_head_exp').value;
    this.paymentExpensedatatableParameter.bd_acc_sub_head_exp = this.searchOUT.get('bd_acc_sub_head_exp').value;

    const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });
    const that = this;
    this.dtOptions5 = {
      processing: true,
      serverSide: true,
      dom: 'lrtip',
      pageLength: 10,
      lengthMenu: [[5, 10, 25, 50, 100], [5, 10, 25, 50, 100]],
      columnDefs: [
        {
          orderable: false,
          targets: 6
        },
      ],

      ajax: (dataTableParameter: any, callback) => {
        that.http.post<DataTablesResponse>(environment.APIEndpoint + 'transaction.fetchExpenseDetails&reload=1', Object.assign(dataTableParameter, this.paymentExpensedatatableParameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {


          that.ExpPaymentDetaildata = resp.data;
          that.changeAvaCash();
          //that.paidAmount();
          // that.checkTransType();

          callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsTotal,
            data: []
          });
        });
      }
    };
  }

  paymentDetailDatatableCode() {
    this.paymentDetaildatatableParameter.person_type = "buyer";
    // this.paymentDetaildatatableParameter.booking_id = '';
    this.paymentDetaildatatableParameter.filterstatus = 'Completed'


    const fromrawDate = this.searchIN.get('fromsearchRecDate').value;

    let fromformattedDate = null;

    if (typeof fromrawDate === 'string') {
      fromformattedDate = moment(fromrawDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
    } else if (fromrawDate instanceof Date) {
      fromformattedDate = moment(fromrawDate).format('YYYY-MM-DD');
    }
    if (fromformattedDate) {
      this.paymentDetaildatatableParameter.fromsearchRecDate = fromformattedDate;
    }


    const torawDate = this.searchIN.get('tosearchRecDate').value;

    let toformattedDate = null;

    if (typeof torawDate === 'string') {
      toformattedDate = moment(torawDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
    } else if (torawDate instanceof Date) {
      toformattedDate = moment(torawDate).format('YYYY-MM-DD');
    }
    if (toformattedDate) {
      this.paymentDetaildatatableParameter.tosearchRecDate = toformattedDate;
    }

    if(this.searchIN.get('customerId')?.value) { this.paymentDetaildatatableParameter.booking_id = this.searchIN.get('customerId').value; }
    else { this.paymentDetaildatatableParameter.booking_id = ''; }

    console.log(this.searchIN.get('customerId').value);
    // this.paymentDetaildatatableParameter.booking_id = this.searchIN.get('booking_id').value;
    this.paymentDetaildatatableParameter.searchCommonTransType = this.searchIN.get('searchCommonTransType').value;
    this.paymentDetaildatatableParameter.searchPayMode = this.searchIN.get('searchPayMode').value;
    this.paymentDetaildatatableParameter.bd_acc_head_in = this.searchIN.get('bd_acc_head_in').value;
    this.paymentDetaildatatableParameter.bd_acc_sub_head_in = this.searchIN.get('bd_acc_sub_head_in').value;
    const that = this;
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });

    this.dtOptions6 = {
      processing: true,
      serverSide: true,
      pageLength: 10,
      dom: 'lrtip',
      lengthMenu: [[5, 10, 25, 50, 100], [5, 10, 25, 50, 100]],
      columnDefs: [
        { orderable: false, targets: 6 },
      ],
      ajax: (dataTablesParameters: any, callback) => {
        // Object.assign(dataTablesParameters, this.witDatatableParameter);
        that.http.post<DataTablesResponse>(environment.APIEndpoint + 'transaction.fetchPaymentDetailsTL&reload=1', Object.assign(dataTablesParameters, this.paymentDetaildatatableParameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {

          that.PaymentDetaildata = resp.data;
          //that.paidAmount();
          that.changeAvaCash();
          that.checkTransType();
          // that.paymentDetailDatatableCodeAll();

          callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsTotal,
            data: []
          });
        });
      }
    };
  }

  icmDatatableCode() {

    // this.paymentICMdatatablePatameter.rec_date = this.searchICM.get('rec_date').value;
    this.paymentICMdatatablePatameter.payment_mode = this.searchICM.get('payment_mode').value;

    const rawDate = this.searchICM.get('from_rec_date').value;
    let fromformattedDate = null;

    if (typeof rawDate === 'string') {
      fromformattedDate = moment(rawDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
    } else if (rawDate instanceof Date) {
      fromformattedDate = moment(rawDate).format('YYYY-MM-DD');
    }
    if (fromformattedDate) {
      this.paymentICMdatatablePatameter.from_rec_date = fromformattedDate;
    }

    const torawDate = this.searchICM.get('to_rec_date').value
    let toformattedDate = null;

    if (typeof torawDate === 'string') {
      toformattedDate = moment(torawDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
    } else if (torawDate instanceof Date) {
      toformattedDate = moment(torawDate).format('YYYY-MM-DD');
    }
    if (toformattedDate) {
      this.paymentICMdatatablePatameter.to_rec_date = toformattedDate;
    }

    const that = this;
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });
    this.dtOptions8 = {
      processing: true,
      serverSide: true,
      pageLength: 50,
      dom: 'lrtip',
      lengthMenu: [[5, 10, 25, 50, 100], [5, 10, 25, 50, 100]],
      columnDefs: [
        { orderable: false, targets: 6 },
      ],
      ajax: (dataTablesParameters: any, callback) => {

        that.http.post<DataTablesResponse>(environment.APIEndpoint + 'transaction.fetchICMPaymentDetails&reload=1', Object.assign(dataTablesParameters, this.paymentICMdatatablePatameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {


          that.PaymentDetaildataICM = resp.data;
          //that.paidAmount();
          // that.checkTransType();

          callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsTotal,
            data: []
          });
        });
      }
    };
  }

  loadAllbankData(): void {
    let formData = new FormData();
    this.billingservice.getAllBankData(formData).pipe(takeUntil(this.destroy$)).subscribe(reps => {
      this.CheckBankLists = reps.data;
    });
  }

  paymentDetailDatatableCodeAll(): void {
    this.billingservice.getAllPaymentDetails(new FormData()).pipe(takeUntil(this.destroy$)).subscribe(resp => {

      this.GetAllPaymentDetails = resp.data;
    });
  }

  bankDatatableCode() {
    this.paymentDetailBankDatatableParameter = {
      bd_acc_head: '',
      bd_acc_sub_head: '',
      bd_bank_name: ''
    };
    const accHead = this.bankTransForm.get('bd_acc_head')?.value;
    const accSubHead = this.bankTransForm.get('bd_acc_sub_head')?.value;
    const bankName = this.bankTransForm.get('bd_bank_name')?.value;

    if (accHead) {
      this.paymentDetailBankDatatableParameter.bd_acc_head = accHead;
    }
    if (accSubHead) {
      this.paymentDetailBankDatatableParameter.bd_acc_sub_head = accSubHead;
    }
    if (bankName) {
      this.paymentDetailBankDatatableParameter.bd_bank_name = bankName;
    }

    const that = this;
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });

    this.dtOptions7 = {
      processing: true,
      serverSide: true,
      pageLength: 300,
      dom: 'lrtip',
      lengthMenu: [[5, 10, 25, 50, 300], [5, 10, 25, 50, 300]],
      columnDefs: [
        { orderable: false, targets: 0 },
      ],
      ajax: (dataTablesParameters: any, callback) => {
        that.http.post<DataTablesResponse>(environment.APIEndpoint + 'transaction.getBanksData&reload=1', Object.assign(dataTablesParameters, this.paymentDetailBankDatatableParameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {


          that.PaymentDetaildataBank = resp.data;

          callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsTotal,
            data: []
          });
        });
      }
    }
  }

  icmInternalDatatableCode() {
    this.IcmInternalDatatableParameter.internal_from_acc_subhead = this.icmInternalForm.get('internal_from_acc_subhead').value;
    this.IcmInternalDatatableParameter.internal_to_acc_subhead = this.icmInternalForm.get('internal_to_acc_subhead').value;
    this.IcmInternalDatatableParameter.internal_from_bank_name = this.icmInternalForm.get('internal_from_bank_name').value;
    this.IcmInternalDatatableParameter.internal_to_bank_name = this.icmInternalForm.get('internal_to_bank_name').value;

    const rawDate = this.icmInternalForm.get('fromDateInternal').value;
    let fromformattedDate = null;
    if (typeof rawDate === 'string') { fromformattedDate = moment(rawDate, 'DD-MM-YYYY').format('YYYY-MM-DD'); }
    else if (rawDate instanceof Date) { fromformattedDate = moment(rawDate).format('YYYY-MM-DD'); }
    if (fromformattedDate) {
      this.IcmInternalDatatableParameter.fromDateInternal = fromformattedDate;
    }

    const torawDate = this.icmInternalForm.get('toDateInternal').value
    let toformattedDate = null;
    if (typeof torawDate === 'string') { toformattedDate = moment(torawDate, 'DD-MM-YYYY').format('YYYY-MM-DD'); }
    else if (torawDate instanceof Date) { toformattedDate = moment(torawDate).format('YYYY-MM-DD'); }
    if (toformattedDate) {
      this.IcmInternalDatatableParameter.toDateInternal = toformattedDate;
    }


    const that = this;
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });

    this.dtOptions10 = {
      processing: true,
      serverSide: true,
      pageLength: 25,
      dom: 'lrtip',
      lengthMenu: [[5, 10, 25, 50, 100], [5, 10, 25, 50, 100]],
      columnDefs: [
        { orderable: false, targets: 6 },
      ],
      ajax: (dataTablesParameters: any, callback) => {
        that.http.post<DataTablesResponse>(environment.APIEndpoint + 'transaction.getIcmInternalData&reload=1', Object.assign(dataTablesParameters, this.IcmInternalDatatableParameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {


          that.PaymentIcmInternalData = resp.data;

          callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsTotal,
            data: []
          });
        });
      }
    }

  }

  icmCustomerDatatableCode() {
    this.IcmCustomerDatatableParameter.icmParty_custname = this.icmPartyCostForm.get('icmParty_custname').value;

    const rawDate = this.icmPartyCostForm.get('fromCustsearchDate').value;
    let fromformattedDate = null;

    if (typeof rawDate === 'string') {
      fromformattedDate = moment(rawDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
    } else if (rawDate instanceof Date) {
      fromformattedDate = moment(rawDate).format('YYYY-MM-DD');
    }
    if (fromformattedDate) {
      this.IcmCustomerDatatableParameter.fromCustsearchDate = fromformattedDate;
    }

    const torawDate = this.icmPartyCostForm.get('toCustsearchDate').value
    let toformattedDate = null;

    if (typeof torawDate === 'string') {
      toformattedDate = moment(torawDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
    } else if (torawDate instanceof Date) {
      toformattedDate = moment(torawDate).format('YYYY-MM-DD');
    }
    if (toformattedDate) {
      this.IcmCustomerDatatableParameter.toCustsearchDate = toformattedDate;
    }

    const that = this;
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });

    this.dtOptions11 = {
      processing: true,
      serverSide: true,
      pageLength: 25,
      dom: 'lrtip',
      lengthMenu: [[5, 10, 25, 50, 100], [5, 10, 25, 50, 100]],
      columnDefs: [
        { orderable: false, targets: 6 },
      ],
      ajax: (dataTableParameters: any, callback) => {
        that.http.post<DataTablesResponse>(environment.APIEndpoint + 'transaction.getIcmCustomerData&reload=1', Object.assign(dataTableParameters, this.IcmCustomerDatatableParameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {

          that.paymentIcmCustomerData = resp.data;

          callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsTotal,
            data: []
          });
        });
      }
    }
  }

  icmPartyDatatableCode() {
    this.IcmPartyDatatableParameter.icmParty_partyname = this.icmPartysearchForm.get('icmParty_partyname').value;

    const rawDate = this.icmPartysearchForm.get('fromInDateParty').value;
    let fromformattedDate = null;
    if (typeof rawDate === 'string') { fromformattedDate = moment(rawDate, 'DD-MM-YYYY').format('YYYY-MM-DD'); }
    else if (rawDate instanceof Date) { fromformattedDate = moment(rawDate).format('YYYY-MM-DD'); }
    if (fromformattedDate) {
      this.IcmPartyDatatableParameter.fromInDateParty = fromformattedDate;
    }
    const torawDate = this.icmPartysearchForm.get('toInDateParty').value
    let toformattedDate = null;
    if (typeof torawDate === 'string') { toformattedDate = moment(torawDate, 'DD-MM-YYYY').format('YYYY-MM-DD'); }
    else if (torawDate instanceof Date) { toformattedDate = moment(torawDate).format('YYYY-MM-DD'); }
    if (toformattedDate) {
      this.IcmPartyDatatableParameter.toInDateParty = toformattedDate;
    }

    const outrawDate = this.icmPartysearchForm.get('fromOutDateParty').value;
    let fromoutFormattedDate = null;
    if (typeof outrawDate === 'string') { fromoutFormattedDate = moment(outrawDate, 'DD-MM-YYYY').format('YYYY-MM-DD') }
    else if (outrawDate instanceof Date) { fromoutFormattedDate = moment(outrawDate).format('YYYY-MM-DD'); }
    if (fromoutFormattedDate) {
      this.IcmPartyDatatableParameter.fromOutDateParty = fromoutFormattedDate
    }
    const outTorawDate = this.icmPartysearchForm.get('toOutDateParty').value;
    let tooutFromattedDate = null;
    if (typeof outTorawDate === 'string') { tooutFromattedDate = moment(outTorawDate, 'DD-MM-YYYY').format('YYYY-MM-DD'); }
    else if (outTorawDate instanceof Date) { tooutFromattedDate = moment(outTorawDate).format('YYYY-MM-DD'); }
    if (tooutFromattedDate) {
      this.IcmPartyDatatableParameter.toOutDateParty = tooutFromattedDate;
    }

    const that = this;
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });

    this.dtOptions12 = {
      processing: true,
      serverSide: true,
      pageLength: 25,
      dom: 'lrtip',
      lengthMenu: [[5, 10, 25, 50, 100], [5, 10, 25, 50, 100]],
      columnDefs: [
        { orderable: false, targets: 6 },
      ],
      ajax: (dataTablesParameters: any, callback) => {
        that.http.post<DataTablesResponse>(environment.APIEndpoint + 'transaction.getIcmPartyData&reload=1', Object.assign(dataTablesParameters, this.IcmPartyDatatableParameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {


          that.paymentIcmPartyData = resp.data;

          callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsTotal,
            data: []
          });
        });
      }
    }
  }

  logDatatableCode() {
    // this.paymentDetailLogsDatatableParameter.fromLogDate = this.reportFormGroup.get('fromLogDate').value;
    const rawDate = this.reportFormGroup.get('fromLogDate').value;
    let fromformattedDate = null;
    if (typeof rawDate === 'string') { fromformattedDate = moment(rawDate, 'DD-MM-YYYY').format('YYYY-MM-DD'); }
    else if (rawDate instanceof Date) { fromformattedDate = moment(rawDate).format('YYYY-MM-DD'); }
    if (fromformattedDate) {
      this.paymentDetailLogsDatatableParameter.fromLogDate = fromformattedDate;
    }

    const rawDateTo = this.reportFormGroup.get('toLogDate').value;
    let toformattedDate = null;
    if (typeof rawDateTo === 'string') { toformattedDate = moment(rawDateTo, 'DD-MM-YYYY').format('YYYY-MM-DD'); }
    else if (rawDateTo instanceof Date) { toformattedDate = moment(rawDateTo).format('YYYY-MM-DD'); }
    if (toformattedDate) {
      this.paymentDetailLogsDatatableParameter.toLogDate = toformattedDate;
    }

    this.paymentDetailLogsDatatableParameter.actionMode = this.reportFormGroup.get('actionMode').value;

    const that = this;
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });

    this.dtOptions9 = {
      processing: true,
      serverSide: true,
      dom: 'lrtip',
      lengthMenu: [[5, 10, 25, 50, 100], [5, 10, 25, 50, 100]],
      columnDefs: [
        { orderable: false, targets: 6 },
      ],
      ajax: (dataTablesParameters: any, callback) => {

        that.http.post<DataTablesResponse>(environment.APIEndpoint + 'transaction.getLogsData&reload=1', Object.assign(dataTablesParameters, this.paymentDetailLogsDatatableParameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {

          that.PaymentDetaildataLog = resp.data;
          //that.paidAmount();
          // that.checkTransType();

          callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsTotal,
            data: []
          });
        });
      }

    }
  }



  checkTransType() {
    this.selectedTransaction = this.PaymentDetaildata;

    this.selectedTransaction.forEach(value => {


      if (value.trans_booking_id == 'DBE013E4-8C9B-4A6E-C9IBV3I4L4WEO7KC') {
        value.transTypeValue = 'Civil Work';
      }
      else if (value.trans_booking_id == 'C8E9D50C-53CF-46FD-R1E6N9T9A19L5334') {
        value.transTypeValue = 'Rental';
      }
      else if (value.trans_booking_id == '9710F402-33B1-455A-I8N6TAE6R8C9A1SF') {
        value.transTypeValue = 'Inter Cash Managemnt';
      }
      else {
        value.transTypeValue = 'Through Customer'
      }
    });
  }

  expenseSearch() {
    const fromDate = this.searchOUT.get('fromsearchRecDateExp')?.value;
    const toDate = this.searchOUT.get('tosearchRecDateExp')?.value;

    if ((fromDate && !toDate) || (!fromDate && toDate)) {
      Swal.fire({
        title: 'Validation Error',
        text: 'Please fill both "From Received Date" and "To Received Date" before searching.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }

    // Proceed if both dates are filled
    this.expenseDatatableCode();
    this.reload('OUT');
  }


  icmSearch() {
    this.icmDatatableCode();
    this.reload();
  }

  BankSearch() {
    this.bankDatatableCode();
    this.reload('BANK');
  }

  LogSearch() {
    this.logDatatableCode();
    this.reload('LOGS');
  }

  resetLogSearch() {
    this.reportFormGroup.get('fromLogDate').setValue('');
    this.reportFormGroup.get('toLogDate').setValue('');
    this.reportFormGroup.get('actionMode').setValue('');
    this.selectedLogIds.clear();

    this.logDatatableCode();
    this.reload('LOGS');
  }

  resetBankSearch() {
    this.bankTransForm.get('bd_acc_head').setValue('');
    this.bankTransForm.get('bd_acc_sub_head').setValue('');
    this.bankTransForm.get('bd_bank_name').setValue('');

    this.bankDatatableCode();
    this.reload('BANK');
    this.partyIngetAccHead();
    this.partyIngetAllAccSubHead();
    this.partyIngetAllBankDetails();
  }

  resetOUTSearch() {
    this.searchOUT.get('searchPayModeExp').setValue('');
    this.searchOUT.get('expense_head_valueExp').setValue('');
    this.searchOUT.get('fromsearchRecDateExp').setValue('');
    this.searchOUT.get('tosearchRecDateExp').setValue('');
    this.searchOUT.get('bd_acc_head_exp').setValue('');
    this.searchOUT.get('bd_acc_sub_head_exp').setValue('');

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true
    });
    this.expenseDatatableCode();
    this.reload('OUT');
  }

  resetICMSearch() {
    this.searchICM.get('from_rec_date').setValue('');
    this.searchICM.get('to_rec_date').setValue('');
    this.searchICM.get('payment_mode').setValue('');

    this.icmDatatableCode();
    this.reload();
  }


  // onInCustomerFilterChange(value: any) {
  //   if (value && typeof value === 'object') {
  //     this.searchIN.get('customerId')?.setValue(value.persons_id);
  //     return;
  //   }
  //   this.searchIN.get('customerId')?.setValue(value || '');
  // }


  // start icm -> customer - > select customer
  // onCustomerSearch(e) {
  //   if (e.length >= 0) {
  //     this.customerlistData(e);
  //   } else {
  //     this.customerdataList = [];
  //   }
  // }

  customerlistData(e) {
    let customerlist = new FormData();
    customerlist.append('value', e);

    this.crmservice.getRegisteredCustomerLists(customerlist).pipe(takeUntil(this.destroy$)).subscribe((resp) => {
      this.customerSuggestion = resp.data;

      this.customerData = this.customerSuggestion.map(item => ({
        persons_id: item.persons_id,
        cust_name: item.cust_name,
        ProductCode: item.ProductCode,

        combinedSearch: `${item.cust_name}${item.ProductCode ? ', ' + item.ProductCode : ''}`
      }));
      this.customerdataList = this.customerData;
    });
  }
  // end icm -> customer - > select customer

  // start income -> Customer name
  onIncCustomerSearch(e) {
    if (e.length >= 3) {
      this.IncCustomerlistData(e);
    } else {
      this.incCustomerdatalist = [];
    }
  }

  IncCustomerlistData(e) {
    let customerlist = new FormData();
    customerlist.append('value', e);

    this.crmservice.getRegisteredCustomerLists(customerlist).pipe(takeUntil(this.destroy$)).subscribe((resp) => {
      this.customerIncSuggestion = resp.data;
      this.customerIncData = this.customerIncSuggestion.map(item => ({
        person_map_id: item.persons_id,
        tc_cust_name: item.cust_name,
        ProductCode: item.ProductCode,

        incCombinedSearch: `${item.cust_name}${item.ProductCode ? ', ' + item.ProductCode : ''}`
      }));
      this.incCustomerdatalist = this.customerIncData;
    });
  }
  // end income -> Customer name



  selectCust(value: any) {
    if (value && typeof value === 'object') {

      const displayValue = `${value.cust_name}${value.ProductCode ? ', ' + value.ProductCode : ''}`;
      this.addTranscform.get('icm_customer_name').setValue(displayValue);
      this.addTranscform.get('persons_id')?.setValue(value.persons_id);
    }
    const persons_id = this.addTranscform.get('persons_id').value;
    this.getCustChequeClearList(persons_id);

  }

  selectIncCust(value: any) {
    if (value && typeof value === 'object') {

      const displayValue = `${value.tc_cust_name}${value.ProductCode ? ', ' + value.ProductCode : ''}`;
      this.addTranscform.get('tc_cust_name').setValue(displayValue);
      this.addTranscform.get('person_map_id')?.setValue(value.person_map_id);
    }
    const persons_id = this.addTranscform.get('person_map_id').value;
    // this.getCustChequeClearList(persons_id);

  }




  // ICM modes From head,subhead and bank name

  getAccHeadICMFrom() {
    let headData = new FormData();
    this.hrservice.fetch_headData(headData).pipe(takeUntil(this.destroy$)).subscribe(Response => {
      this.resplookupBankICMFrom = Response.data
    });
  }
  getAllAccSubHeadICMFrom() {
    let headData = new FormData();
    this.hrservice.fetch_AllSubheadData(headData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.resplookupsubBankICMFrom = resp.data;
    });
  }
  getAllBankDetailsICMFrom() {
    let headData = new FormData();
    this.hrservice.fetch_AllBankDetails(headData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.SelectedBankDataICMFrom = resp.data;
    });
  }


  onAccHeadChangeICMFrom(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    if (selectedValue) {
      this.getAccSubHeadICMFromICM(selectedValue);
    }
  }
  getAccSubHeadICMFromICM(selectedValue: string) {
    let subHead = new FormData();
    subHead.append('subhead', selectedValue);
    this.hrservice.fetch_subheadData(subHead).pipe(takeUntil(this.destroy$)).subscribe(Response => {
      this.resplookupsubBankICMFrom = Response.data;
      // return this.resplookupsubBank;
    });
  }
  onAccSubHeadChangeICMFrom() {

    const accHead = this.addTranscform.get('icm_from_acc_head')?.value;
    const accSubHead = this.addTranscform.get('icm_from_acc_sub_head')?.value;

    if (accHead && accSubHead) {

      let HeadAndSubhHeadData = new FormData();

      HeadAndSubhHeadData.append('acc_head', accHead);
      HeadAndSubhHeadData.append('acc_sub_head', accSubHead);

      this.hrservice.fetch_bankName(HeadAndSubhHeadData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
        this.SelectedBankDataICMFrom = resp.data;
        if (resp.data && resp.data.length > 0 && resp.data[0].bankName) {
          this.addTranscform.patchValue({
            icm_form_bank_name: resp.data[0].bankName
          });
          this.addTranscform.get('icm_form_bank_name').setValue(resp.data[0].bankName);
        }
      });
    }

  }
  //From end here 

  // ICM modes TO head,subhead and bank name

  getAccHeadICMTo() {
    let headData = new FormData();
    this.hrservice.fetch_headData(headData).pipe(takeUntil(this.destroy$)).subscribe(Response => {
      this.resplookupBankICMTo = Response.data
    });
  }
  getAllAccSubHeadICMTo() {
    let headData = new FormData();
    this.hrservice.fetch_AllSubheadData(headData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.resplookupsubBankICMTo = resp.data;
    });
  }
  getAllBankDetailsICMTo() {
    let headData = new FormData();
    this.hrservice.fetch_AllBankDetails(headData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.SelectedBankDataICMTo = resp.data;
    });
  }
  getCustChequeClearList(persons_id: string) {
    let headData = new FormData();
    headData.append('persons_id', persons_id);
    this.billingservice.getCustCheqeList(headData).pipe(takeUntil(this.destroy$)).subscribe(resp => {

      this.GetCustCqList = resp.data;
    });
  }

  handleModeChange(selectedValue: string): void {
    const matchedItem = this.GetCustCqList.find(cqList => {
      const generatedValue = (cqList.cheque_name && cqList.cheque_number)
        ? `${cqList.mode} , ${cqList.amount} , ${cqList.cheque_number} , ${cqList.cheque_name}`
        : `${cqList.mode} , ${cqList.amount}`;
      return generatedValue === selectedValue;
    });
    if (matchedItem) {
      // this.onmodeSelectSearch(matchedItem.person_plan_id);
      this.addTranscform.get('person_plan_id')?.setValue(matchedItem.person_plan_id);

    }
  }

  onAccHeadChangeICMTo(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    if (selectedValue) {
      this.getAccSubHeadICMToICM(selectedValue);
    }
  }
  getAccSubHeadICMToICM(selectedValue: string) {
    let subHead = new FormData();
    subHead.append('subhead', selectedValue);
    this.hrservice.fetch_subheadData(subHead).pipe(takeUntil(this.destroy$)).subscribe(Response => {
      this.resplookupsubBankICMTo = Response.data;
      // return this.resplookupsubBank;
    });
  }
  onAccSubHeadChangeICMTo() {
    let HeadAndSubhHeadData = new FormData();

    HeadAndSubhHeadData.append('acc_head', this.addTranscform.get('icm_to_acc_head').value);
    HeadAndSubhHeadData.append('acc_sub_head', this.addTranscform.get('icm_to_acc_sub_head').value);

    this.hrservice.fetch_bankName(HeadAndSubhHeadData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.SelectedBankDataICMTo = resp.data;
      if (resp.data && resp.data.length > 0 && resp.data[0].bankName) {
        this.addTranscform.patchValue({
          icm_to_bank_name: resp.data[0].bankName
        });
        this.addTranscform.get('icm_to_bank_name').setValue(resp.data[0].bankName);
      }
    });
  }
  // ICM modes closed

  calculateOutExpenses(): string {
    if (!this.ExpPaymentDetaildata) return '₹0.00';

    const total = this.ExpPaymentDetaildata.reduce((accumulator, currentItem) => {
      const amount = typeof currentItem.trans_amount === 'string'
        ? parseFloat(currentItem.trans_amount)
        : currentItem.trans_amount;

      return accumulator + (isNaN(amount) ? 0 : amount);
    }, 0);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(total);
  }

  calculateInterCash(): string {
    if (!this.PaymentDetaildataICM) return '₹0.00';

    const total = this.PaymentDetaildataICM.reduce((accumulator, currentItem) => {
      const amount = typeof currentItem.trans_amount === 'string'
        ? parseFloat(currentItem.trans_amount)
        : currentItem.trans_amount;

      return accumulator + (isNaN(amount) ? 0 : amount);
    }, 0);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(total);
  }

  calculateInCivil(): string {
    if (!this.PaymentDetaildata) return '₹0.00';

    const total = this.PaymentDetaildata.reduce((accumulator, currentItem) => {
      const amount = typeof currentItem.trans_amount === 'string'
        ? parseFloat(currentItem.trans_amount)
        : currentItem.trans_amount;

      return accumulator + (isNaN(amount) ? 0 : amount);
    }, 0);

    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(total);
  }

  indianCurrency(amount: number | string): string {
    if (amount === null || amount === undefined || isNaN(Number(amount))) return '';

    const num = Number(amount);
    const formatted = num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    return `₹${formatted}`;
  }

  onPartyInModeChange(value) {
    let modeType = typeof (value) == "object" ? value.target.value : value;
    if (modeType === 'party_in_cash') {
      this.addTranscform.get('party_in_acc_head').disable();
      this.addTranscform.get('party_in_acc_sub_head').disable();
      this.addTranscform.get('party_in_bank').disable();
    }
    else {
      this.addTranscform.get('party_in_acc_head').enable();
      this.addTranscform.get('party_in_acc_sub_head').enable();
      this.addTranscform.get('party_in_bank').enable();
    }
  }
  onPartyOutModeChange(value) {
    let modeType = typeof (value) == "object" ? value.target.value : value;
    if (modeType === 'party_out_cash') {
      this.addTranscform.get('party_out_acc_head').disable();
      this.addTranscform.get('party_out_acc_sub_head').disable();
      this.addTranscform.get('party_out_bank').disable();
    }
    else {
      this.addTranscform.get('party_out_acc_head').enable();
      this.addTranscform.get('party_out_acc_sub_head').enable();
      this.addTranscform.get('party_out_bank').enable();
    }
  }

  internalSearch() {
    const fromDate = this.icmInternalForm.get('fromDateInternal')?.value;
    const toDate = this.icmInternalForm.get('toDateInternal')?.value;

    // Case 1: Only "From Date" or "To Date" is filled
    if ((fromDate && !toDate) || (!fromDate && toDate)) {
      Swal.fire({
        icon: 'warning',
        title: 'Both dates required',
        text: 'Please select both From and To dates before searching.',
        confirmButtonText: 'OK'
      });
      return;
    }

    this.icmInternalDatatableCode();
    this.reload('ICM_INTERNAL');
  }

  internalReset() {
    this.icmInternalForm.get('fromDateInternal').setValue('');
    this.icmInternalForm.get('toDateInternal').setValue('');
    this.icmInternalForm.get('internal_from_acc_subhead').setValue('');
    this.icmInternalForm.get('internal_to_acc_subhead').setValue('');
    this.icmInternalForm.get('internal_from_bank_name').setValue('');
    this.icmInternalForm.get('internal_to_bank_name').setValue('');

    this.icmInternalDatatableCode();
    this.reload('ICM_INTERNAL');
    this.IcmInternalgetAllAccSubHead();
  }

  partyDataSearch() {
    this.icmPartyDatatableCode();
    this.reload('ICM_PARTY');
  }

  partyDataReset() {
    this.icmPartysearchForm.get('fromInDateParty').setValue('');
    this.icmPartysearchForm.get('toInDateParty').setValue('');
    this.icmPartysearchForm.get('toOutDateParty').setValue('');
    this.icmPartysearchForm.get('fromOutDateParty').setValue('');
    this.icmPartysearchForm.get('icmParty_partyname').setValue('');

    this.icmPartyDatatableCode();
    this.reload('ICM_PARTY');
  }


  custreset() {
    this.icmPartyCostForm.get('fromCustsearchDate').setValue('');
    this.icmPartyCostForm.get('toCustsearchDate').setValue('');
    this.icmPartyCostForm.get('icmParty_custname').setValue('');
    this.icmCustomerDatatableCode();
    this.reload('ICM_CUSTOMER');
  }

  custSearch() {
    const fromDate = this.icmPartyCostForm.get('fromCustsearchDate')?.value;
    const toDate = this.icmPartyCostForm.get('toCustsearchDate')?.value;

    // Case 1: Only "From Date" adn "To Date" is filled
    if ((fromDate && !toDate) || (!fromDate && toDate)) {
      Swal.fire({
        icon: 'warning',
        title: 'Both dates required',
        text: 'Please select both From and To Clear dates before searching.',
        confirmButtonText: 'OK'
      });
      return;
    }
    this.icmCustomerDatatableCode();
    this.reload('ICM_CUSTOMER');

  }

  contractorlist() {
    let projectlist = new FormData();
    projectlist.append('statusValue', '1');
    this.hrservice.contractorList(projectlist).pipe(takeUntil(this.destroy$)).subscribe(Response => {
      this.respcontractor = Response.data
    });
  }

  getallcontractorsData() {
    let formData = new FormData();

    this.contractorService.getContractorsLists(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.respcontractors = resp;
    });
  }

  RedirectToPaymentPlans(details_id: any, persons_id: any) {
    this.router.navigate(['/edit-booking', details_id, persons_id, 'Edit']);

  }

  toggleSelection(id: number, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;

    if (isChecked) {
      this.selectedLogIds.add(id);
    } else {
      this.selectedLogIds.delete(id);
      // Uncheck header checkbox when any item is unchecked
      const selectAll = document.getElementById('selectAll') as HTMLInputElement;
      if (selectAll) selectAll.checked = false;
    }
  }

  toggleSelectAll(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;

    if (isChecked) {

      this.PaymentDetaildataLog.forEach(item =>
        this.selectedLogIds.add(item.id)
      );
    } else {
      // Remove only currently visible IDs
      this.PaymentDetaildataLog.forEach(item =>
        this.selectedLogIds.delete(item.id)
      );
    }

    // Update individual checkboxes
    this.PaymentDetaildataLog.forEach(item => {
      const checkbox = document.getElementById(`check-${item.id}`) as HTMLInputElement;
      if (checkbox) checkbox.checked = isChecked;
    });
  }

  bulkDelete(): void {
    if (this.selectedLogIds.size === 0) return;

    Swal.fire({
      title: `Delete ${this.selectedLogIds.size} selected entr${this.selectedLogIds.size === 1 ? 'y' : 'ies'} ?`,
      text: "This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff6b6b',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete them!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        const idsToDelete = Array.from(this.selectedLogIds);

        this.billingservice.bulkDelete(idsToDelete).pipe(takeUntil(this.destroy$)).subscribe({
          next: () => {
            this.LogSearch(); // Refresh filtered data
            this.selectedLogIds.clear();

            // Uncheck selectAll checkbox if present
            const selectAll = document.getElementById('selectAll') as HTMLInputElement;
            if (selectAll) selectAll.checked = false;

            Swal.fire({
              title: 'Deleted!',
              text: 'Selected entries have been deleted.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          },
          error: (err) => {
            console.error('Delete failed', err);
            Swal.fire('Error', 'Failed to delete selected entries.', 'error');
          }
        });
      }
    });
  }

  GenerateReport(): void {
    const rawFromDate = this.srcTransactionForm.get('searchdateFrom').value;
    const rawToDate = this.srcTransactionForm.get('searchdateTo').value;

    if (!rawFromDate || !rawToDate || this.parseDateFromForm(rawFromDate) > this.parseDateFromForm(rawToDate)) {
      Swal.fire(
        'Invalid Date Range',
        !rawFromDate || !rawToDate
          ? 'Please select both From and To dates to generate the report.'
          : `From Date (${rawFromDate}) cannot be after To Date (${rawToDate}). Please correct the range.`,
        'warning'
      );
      return;
    }

    const fromDate = this.parseDateFromForm(rawFromDate);
    const toDate = this.parseDateFromForm(rawToDate);
    const fromDateStr = this.formatDateToDash(fromDate);
    const toDateStr = this.formatDateToDash(toDate);

    const formData = new FormData();
    formData.append('fromDate', fromDateStr);
    formData.append('toDate', toDateStr);

    forkJoin([
      this.billingservice.generateReport(formData),
      this.billingservice.generateSeparateExpReport(formData),
      this.billingservice.generateSeparateIncReport(formData),
    ]).pipe(takeUntil(this.destroy$)).subscribe(([resp1, resp2, resp3]) => {
      const sheet1Data = this.prepareExcelData(resp1.Invalue, resp1.OUTvalue, fromDate, toDate);
      const sheet2Data = this.prepareSecondSheet(resp2.data);
      const sheet3Data = this.prepareThirdSheet(resp3.data);

      this.downloadExcelWithTwoSheets(sheet1Data, sheet2Data, sheet3Data, fromDate, toDate);
    });
  }

  resetDateRange() {
    this.srcTransactionForm.get('searchdateFrom').setValue('');
    this.srcTransactionForm.get('searchdateTo').setValue('');
  }

  private parseDateFromForm(dateInput: string | Date): Date {
    if (dateInput instanceof Date) return dateInput;

    const parts = dateInput.includes('/') ? dateInput.split('/') :
      dateInput.includes('-') ? dateInput.split('-') : [];

    if (parts.length === 3) {
      const [dd, mm, yyyy] = parts.map(p => parseInt(p, 10));
      return new Date(yyyy, mm - 1, dd);
    }

    return new Date(dateInput); // fallback
  }

  private formatDateToDash(date: Date): string {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }


  prepareExcelData(incomeData: any[], expenseData: any[], fromDate: Date, toDate: Date): any[] {
    const excelData = [];

    excelData.push({
      'Income_head': `Financial Report from ${this.datePipe.transform(fromDate, "dd/MM/yyyy")} to ${this.datePipe.transform(toDate, "dd/MM/yyyy")}`,
      'Total_Amount': '',
      ' ': '',
      'Expense_head': '',
      'Total_Amount_Expense': ''
    });
    excelData.push({
      'Income_head': '',
      'Total_Amount': '',
      ' ': '',
      'Expense_head': '',
      'Total_Amount_Expense': ''
    });
    excelData.push({
      'Income_head': 'Income Head',
      'Total_Amount': 'Total Amount',
      ' ': '',
      'Expense_head': 'Expense Head',
      'Total_Amount_Expense': 'Total Amount'
    });

    const maxLength = Math.max(incomeData.length, expenseData.length);
    for (let i = 0; i < maxLength; i++) {
      excelData.push({
        'Income_head': incomeData[i]?.income_head || '',
        'Total_Amount': incomeData[i]?.total_amount || '',
        'Expense_head': expenseData[i]?.expense_head || '',
        'Total_Amount_Expense': expenseData[i]?.total_amount || ''
      });
    }
    return excelData;
  }

  prepareSecondSheet(expData: any[]): any[] {
    const sheetData = [];

    let currentGroup = '';
    let currentGroupTotal = 0;
    let tempGroupRows = [];

    for (let i = 0; i < expData.length; i++) {
      const item = expData[i];
      const expenseHead = item.expense_head || '';
      const transactionAmount = Number(item.trans_amount) || 0;

      if (expenseHead !== currentGroup && currentGroup !== '') {
        // Push group rows
        sheetData.push(...tempGroupRows);

        // Add total row
        sheetData.push({
          'Received Date': '',
          'Payment Mode': '',
          'Expense Head': 'Total',
          'Transaction Amount': currentGroupTotal,
          'Expense Description': ''
        });

        // Add gap row
        sheetData.push({
          'Received Date': '',
          'Payment Mode': '',
          'Expense Head': '',
          'Transaction Amount': '',
          'Expense Description': ''
        });

        // Reset group trackers
        tempGroupRows = [];
        currentGroupTotal = 0;
      }

      // Accumulate current group
      currentGroup = expenseHead;
      currentGroupTotal += transactionAmount;

      tempGroupRows.push({
        'Received Date': this.formatDate(item.recieved_date) || '',
        'Payment Mode': item.payment_mode || '',
        'Expense Head': expenseHead,
        'Transaction Amount': transactionAmount,
        'Expense Description': item.exp_descriptions || '',
      });
    }

    // Push final group if any
    if (tempGroupRows.length > 0) {
      sheetData.push(...tempGroupRows);
      sheetData.push({
        'Received Date': '',
        'Payment Mode': '',
        'Expense Head': 'Total',
        'Transaction Amount': currentGroupTotal,
        'Expense Description': ''
      });
    }

    return sheetData;
  }

  prepareThirdSheet(IncData: any[]): any[] {
    const sheetData = [];

    let currentGroup = '';
    let currentGroupTotal = 0;
    let tempGroupRows = [];

    for (let i = 0; i < IncData.length; i++) {
      const item = IncData[i];
      const incomeHead = item.income_head || '';
      const transactionAmount = Number(item.trans_amount) || 0;

      if (incomeHead !== currentGroup && currentGroup !== '') {
        sheetData.push(...tempGroupRows);

        sheetData.push({
          'Received Date': '',
          'Payment Mode': '',
          'Income Head': 'Total',
          'Amount': currentGroupTotal,
          'Description': ''
        });

        sheetData.push({
          'Received Date': '',
          'Payment Mode': '',
          'Income Head': '',
          'Amount': '',
          'Description': ''
        });

        tempGroupRows = [],
          currentGroupTotal = 0;
      }

      currentGroup = incomeHead;
      currentGroupTotal += transactionAmount;

      tempGroupRows.push({
        'Received Date': this.formatDate(item.trans_all_recieved_date) || '',
        'Payment Mode': item.trans_mode || '',
        'Income Head': incomeHead,
        'Amount': transactionAmount,
        'Description': item.descriptions || '',
      });
    }
    if (tempGroupRows.length > 0) {
      sheetData.push(...tempGroupRows);
      sheetData.push({
        'Received Date': '',
        'Payment Mode': '',
        'Income Head': 'Total',
        'Amount': currentGroupTotal,
        'Description': '',
      })
    }
    return sheetData;
  }

  // Format date for display
  private formatDate(dateString: string): string {
    let date: Date;

    if (dateString.includes('/')) {
      const parts = dateString.split('/');
      if (parts.length === 3) {
        date = new Date(
          parseInt(parts[2]),
          parseInt(parts[1]) - 1,
          parseInt(parts[0])
        );
      } else {
        date = new Date(dateString);
      }
    } else if (dateString.includes('-')) {
      date = new Date(dateString);
    } else {
      date = new Date(dateString);
    }

    const formatted = date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    return formatted;
  }

  onExpenseHeadChange(event: any, skipReset: boolean = false) {

    const selected = event.target.value?.trim().toLowerCase();

    if (!this.isShowExpensePayMode) return;

    // Reset flags
    this.isContractorExpense = false;
    this.isNormalExpense = true;

    // Clear conflicting values left over from the previously selected head so a
    // live Vendor <-> Contractor switch can't submit both. Skipped when this is
    // called to redisplay an already-patched value (edit mode / prefill
    // redirects), where the real stored value must be preserved.
    if (!skipReset) {
      this.addTranscform.patchValue({
        exp_vendor_value: null,
        exp_contractor_value: null,
      }, { emitEvent: false });
    }

    // Contractor expense
    if (selected === 'contractor') {
      this.isContractorExpense = true;
      this.isNormalExpense = false;
    }
  }






  downloadExcelWithTwoSheets(data1: any[], data2: any[], data3: any[], fromDate: Date, toDate: Date): void {
    import('xlsx').then(xlsx => {
      const ws1 = xlsx.utils.json_to_sheet(data1, { skipHeader: true });
      const ws2 = xlsx.utils.json_to_sheet(data2);
      const ws3 = xlsx.utils.json_to_sheet(data3);

      // Sheet1 column widths (Report)
      ws1['!cols'] = [
        { wch: 21 },
        { wch: 21 },
        { wch: 10 },
        { wch: 21 },
        { wch: 21 }
      ];

      // Sheet2 column widths (Expenses)
      ws2['!cols'] = [
        { wch: 21 },
        { wch: 21 },
        { wch: 21 },
        { wch: 21 },
        { wch: 21 }
      ];

      // Sheet3 column widths (Expenses)
      ws3['!cols'] = [
        { wch: 21 },
        { wch: 21 },
        { wch: 21 },
        { wch: 21 },
        { wch: 21 }
      ];

      // Sheet1 title row merge
      if (!ws1['!merges']) ws1['!merges'] = [];
      ws1['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } });

      const workbook = {
        Sheets: {
          'Report': ws1,
          'Expenses': ws2,
          'Income': ws3,
        },
        SheetNames: ['Report', 'Expenses', 'Income']
      };

      const excelBuffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      // const formattedFrom = this.formatDateForFilename(fromDate);
      // const formattedTo = this.formatDateForFilename(toDate);

      const link = document.createElement('a');
      const url = window.URL.createObjectURL(blob);
      link.href = url;
      link.download = `Financial_Report_${this.datePipe.transform(fromDate, "dd/MM/yyyy")}_to_${this.datePipe.transform(toDate, "dd/MM/yyyy")}.xlsx`;
      link.click();

      window.URL.revokeObjectURL(url);
    });
  }

  // onDocTypeChange() {
  //   const type = this.addTranscform.get('docType')?.value;

  //   if (type === 'challan_no') {
  //     this.docLabel = 'Challan No.';
  //   } else {
  //     // Default fallback
  //     this.docLabel = 'Bill No.';
  //   }

  //   // Optional: clear value when switching
  //   // this.addTranscform.get('docNumber')?.reset();
  // }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.dtTrigger5.unsubscribe();
    this.dtTrigger8.unsubscribe();
    this.dtTrigger7.unsubscribe();
    this.dtTrigger9.unsubscribe();
    this.dtTrigger10.unsubscribe();
    this.dtTrigger11.unsubscribe();
    this.dtTrigger12.unsubscribe();

    this.destroy$.next();
    this.destroy$.complete();

    if (this.dtElement && this.dtElement.dtInstance) {
      this.dtElement.dtInstance.then(dt => dt.destroy());
    }

  }

}
