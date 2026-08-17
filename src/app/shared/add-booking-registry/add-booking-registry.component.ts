import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, OnDestroy, QueryList, ViewChildren, ViewChild, Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CrmService } from 'src/app/services/crm.service';
import { DataTableDirective } from 'angular-datatables';
import { HrService } from 'src/app/services/hr.service';
import { ActivatedRoute, Router } from '@angular/router';
import { map, takeUntil } from 'rxjs/operators';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';
import { NgbDateAdapter, NgbDateParserFormatter, NgbDateStruct, NgbInputDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { BillingService } from 'src/app/services/billing.service';
import { ProductService } from 'src/app/services/product.service';
import { Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { DatePipe } from '@angular/common';
// import { ViewProjectMasterComponent } from 'src/app/sale/product-sale/view-project-master/view-project-master.component';
import { abort } from 'process';
import * as XLSX from 'xlsx';
import jwt_decode from 'jwt-decode';
import { of, forkJoin } from 'rxjs';
import { Event, event } from 'jquery';

class DataTablesResponse {
  data!: any[];
  draw!: number;
  recordsFiltered!: number;
  recordsTotal!: number;
}
class sellerInfo {
  seller_title!: any[];
  seller_name!: any[];
  seller_area!: any[];
  seller_rin_pustika!: any[];
  seller_caste!: any[];
  seller_mobile!: any[];
  seller_altr_mobile!: any[];
  seller_occupation!: any[];
  seller_aadhar!: any[];
  seller_aadhar_img!: any[];
  seller_pan!: any[];
  seller_pan_img!: any[];
  seller_address!: any[];
  seller_country!: any[];
  seller_state!: any[];
  seller_city!: any[];
}
class buyerInfo {
  bTitle!: any[];
  bspouse!: any[];
  bname!: any[];
  bage!: any[];
  bcaste!: any[];
  boccupation!: any[];
  baadhar!: any[];
  bpancard!: any[];
  bmobileno!: any[];
  balternumber!: any[];
  bstate!: any[];
  bcity!: any[];
  baddress!: any[];
}
class attorney {
  attLandlordId!: any[];
  landlord_id!: any[];
  regpowerName!: any[];
  regpowerNumber!: any[];
  regKhasraNo!: any[];
  regpowerRakba!: any[];
  regdiversion!: any[];
  regsignTime!: any[];
  regpowerDate!: any[];
  regpowerPustak!: any[];
  regpowerGranth!: any[];
  regpowerVilekh!: any[];
}

class witnessInfo {
  regWitness!: any[];
  regGuardian!: any[];
  regAddress!: any[];
}
class attachmentmangment {
  Date!: string;
  UploaderName!: string;
  FileName!: string;
}

@Injectable()
export class CustomAdapter extends NgbDateAdapter<string> {

  readonly DELIMITER = '/';

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
  selector: 'app-add-booking-registry',
  templateUrl: './add-booking-registry.component.html',
  styleUrls: ['./add-booking-registry.component.css'],
  providers: [
    NgbInputDatepickerConfig,
    { provide: NgbDateAdapter, useClass: CustomAdapter },
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
    { provide: DatePipe }
  ]
})


export class AddBookingRegistryComponent implements OnInit, OnDestroy {

  private readonly destroy$ = new Subject<void>();
  private docsTabWorkdetailEl: HTMLElement | null = null;
  private docsTabWorkdetailClickHandler: ((ev: any) => any) | null = null;
  private hasCleanedUp = false;

  activeTab = 'Personal';
  dtOptions: DataTables.Settings = {};
  dtOptions2: DataTables.Settings = {};
  dtOptions3: DataTables.Settings = {};
  dtOptions1: DataTables.Settings = {};
  dtOptions4: DataTables.Settings = {};
  dtOptions5: DataTables.Settings = {};
  dtOptions6: DataTables.Settings = {};
  dtOptions7: DataTables.Settings = {};

  dtTrigger: Subject<any> = new Subject<any>();
  dtTrigger1: Subject<any> = new Subject<any>();
  dtTrigger2: Subject<any> = new Subject<any>();
  dtTrigger3: Subject<any> = new Subject<any>();
  dtTrigger4: Subject<any> = new Subject<any>();
  dtTrigger5: Subject<any> = new Subject<any>();
  dtTrigger6: Subject<any> = new Subject<any>();
  dtTrigger7: Subject<any> = new Subject<any>();
  @ViewChildren(DataTableDirective) dtElement: any;
  @ViewChildren('labelImport') labelImport!: QueryList<any>;

  @ViewChild('PaymentModal') PaymentModal!: ElementRef;

  @ViewChild('labelImport_doc') labelImport_doc!: ElementRef;
  @ViewChild('ngbDatepicker') dte!: NgbDateStruct;
  @ViewChild('Witnessmodal') Witnessmodal!: ElementRef;
  @ViewChild('attachmentModalButton') attachmentModalButton!: ElementRef;
  @ViewChild('attorneymodal') attorneymodal!: ElementRef;
  @ViewChildren('closebutton') closebutton!: QueryList<ElementRef>;
  @ViewChildren('closebutton1') closebutton1!: QueryList<ElementRef>;
  @ViewChild('attachmentclosebutton') attachmentclosebutton! : ElementRef;
  @ViewChild('close_payment_paln_button') close_payment_paln_button!: ElementRef;
  @ViewChild('addNewBuyer') addNewBuyer!: ElementRef;
  @Input() submitted!: boolean;

  submit_btn: boolean = false;
  submit_btn2: boolean = false;
  isDisabled: boolean = true;
  isDoneSave: boolean = false;
  isDDSelected: boolean = false;
  isCQSelected: boolean = false;
  [x: string]: any;
  DatatableParameter: { person_type: any; booking_id: any; };
  SDatatableParameter: { person_type: any; booking_id: any; };
  witDatatableParameter: { person_type: any; booking_id: any; };
  attachmentDatatableParameter: { person_type: any; booking_id: any; };
  paymentDatatableParameter: { id: any; };
  payDatatableParameter: { id: any; };
  ADatatableParameters: { landlord_id: any; };
  paymentDetaildatatableParameter: { person_type: any; booking_id: any };
  resplookupBank:any[] = [];
  resplookupBankk:any[]= [];
  SelectedBankData = [];
  resplookupsubBank:any[] = [];
  respStatus = [];
  editFile: boolean = true;
  removeUpload: boolean = false;
  // regMeasurement: any;
  resplookupTitel = [];
  state: any = '';
  id: any = '';
  customerID: any = '';
  type: any = 'Add';
  pType: any = '';
  customerData: any = [];
  customerdataList: any = [];
  resplookupCategory: any;
  modalTitle!: string;
  dataa!: buyerInfo[];
  adata!: attorney[];
  selldataa!: sellerInfo[];
  witdata!: witnessInfo[];
  PaymentDetaildata: any[] = [];
  attachmentdata!: attachmentmangment[];
  attachmentModalHadding!: string;
  filecontent: any;
  attachmentimageName: any;
  fileuploads!: string;
  flg: string = "Add";
  PopupTitle!: string;
  labelImport_arr!: any[];
  respStages: any;
  respStagesStatus: any;
  respStagesStatuss: any;
  isView!: boolean;
  SaveViewForDone!: boolean;
  isDone!: boolean;
  isSave!: boolean;
  isChangeSave!: boolean;
  // isChangeSave: boolean[] = [];
  respPPlan: any;
  respPStatus: any;
  prsn_id!: string;
  transactionList: any;
  isHideIfAmountMatches: boolean = true;
  previousamount!: number;
  transCond: boolean = false;
  transCondR: boolean = false;
  transCondSR: boolean = false;
  transCond1: boolean = false;
  transCond11: boolean = false;
  transCond2: boolean = false;
  transCond3: boolean = false;
  transCond33: boolean = false;
  transCond353: boolean = false;
  transCond393: boolean = false;
  transCond4: boolean = false;
  transCond44: boolean = false;
  transCond444: boolean = false;
  transCond464: boolean = false;
  transCond5: boolean = false;
  transCond55: boolean = false;
  transCond6: boolean = false;
  transCond66: boolean = false;
  transCond69: boolean = false;
  hideAddbutton: boolean = false;
  regMeasurement: FormGroup;
  Poalist: any;
  payPlanList: any;
  // booking_id:any;
  payPlanDate: any;
  viewPOA_btn: boolean = false;

  constructor(private cd: ChangeDetectorRef, private Activatedroute: ActivatedRoute, private router: Router, private _fb: FormBuilder, private crmservice: CrmService, private hrservice: HrService, private billingservice: BillingService, public http: HttpClient, private datePipe: DatePipe, private productservice: ProductService) {
    this.DatatableParameter = { person_type: '', booking_id: '' };
    this.SDatatableParameter = { person_type: '', booking_id: '' };
    this.ADatatableParameters = { landlord_id: '' };
    this.witDatatableParameter = { person_type: '', booking_id: '' };
    this.attachmentDatatableParameter = { person_type: '', booking_id: '' };
    this.paymentDatatableParameter = { id: '' };
    // this.transactionData = {}; //added now
    this.paymentDetaildatatableParameter = { person_type: '', booking_id: '' };
    this.payDatatableParameter = { id: '' };
    this.regMeasurement = this._fb.group({
      mBillDate: [''],        // separate
      mKhasraNo: [''],        // separate
      totalAreaValue: [''],        // separate
      totalAmountSqftValue: [''],        // separate
      totalAmountValue: [''],        // separate

      measurements: this._fb.array([]), // dynamic array

      registry_booking_id: '',
      company_id: '',
      product_id: ''
    });
  }

  Seller_form = new FormGroup({
    seller_id: new FormControl(''),
    company_id: new FormControl(''),
    booking_id: new FormControl(''),
    seller_title: new FormControl('', [Validators.required]),
    seller_name: new FormControl('', [Validators.required]),
    seller_area: new FormControl('', [Validators.required]),
    seller_rin_pustika: new FormControl('', [Validators.required]),
    seller_caste: new FormControl('', [Validators.required]),
    seller_mobile: new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]),
    seller_altr_mobile: new FormControl('', [Validators.minLength(10), Validators.maxLength(10)]),
    seller_occupation: new FormControl('', [Validators.required]),
    seller_aadhar: new FormControl('', [Validators.required]),
    seller_aadhar_img: new FormControl('', [Validators.required]),
    seller_pan: new FormControl('', [Validators.required, Validators.pattern("^[a-zA-Z0-9]{10}$")]),
    seller_pan_img: new FormControl('', [Validators.required]),
    seller_address: new FormControl('', [Validators.required]),
    seller_country: new FormControl('', [Validators.required]),
    seller_state: new FormControl('', [Validators.required]),
    seller_city: new FormControl('', [Validators.required]),
    created_by: new FormControl('', [Validators.required]),
    created_dt: new FormControl('', [Validators.required]),
    updated_Dt: new FormControl('', [Validators.required]),
    updated_By: new FormControl('', [Validators.required]),
  });
  witness_form = new FormGroup({
    witness_id: new FormControl(''),
    witness_title: new FormControl('', [Validators.required]),
    witness_name: new FormControl('', [Validators.required]),
    witness_age: new FormControl('', [Validators.required, Validators.pattern("^[0-9]*$")]),
    witness_caste: new FormControl('', [Validators.required]),
    witness_mobile: new FormControl('', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(10), Validators.maxLength(10)]),
    witness_altr_mobile: new FormControl('', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(10), Validators.maxLength(10)]),
    witness_occupation: new FormControl('', [Validators.required]),
    witness_aadhar: new FormControl('', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(12), Validators.maxLength(12)]),
    witness_aadhar_img: new FormControl('', [Validators.required]),
    witness_pan: new FormControl('', [Validators.required, Validators.pattern("^[A-Z]{5}[0-9]{4}[A-Z]{1}$")]),
    witness_pan_img: new FormControl('', [Validators.required]),
    witness_address: new FormControl('', [Validators.required]),
    witness_country: new FormControl('', [Validators.required]),
    witness_state: new FormControl('', [Validators.required]),
    witness_city: new FormControl('', [Validators.required]),
    witness_caretaker: new FormControl('', [Validators.required]),
    witness_spouse: new FormControl('', [Validators.required]),
    witness_tehsil: new FormControl('', [Validators.required]),
    witness_district: new FormControl('', [Validators.required]),
    witness_pincode: new FormControl('', [Validators.required, Validators.pattern("^[0-9]{6}$")]),
  });
  // transaction_form = new FormGroup({
  //   transaction_id: new FormControl(''),
  //   booking_id: new FormControl(''),
  //   transaction_date: new FormControl('', Validators.required),
  //   transaction_amount: new FormControl('', Validators.required),
  //   transaction_mode: new FormControl('', Validators.required),
  //   transaction_paidTo: new FormControl('', Validators.required),
  //   transaction_status: new FormControl('', Validators.required),
  //   transaction_chequeNo: new FormControl(''),
  //   transaction_chequeDate: new FormControl(''),
  //   transaction_chequeSubmitDate: new FormControl(''),
  //   transaction_bank: new FormControl(''),
  //   transaction_bankAccNo: new FormControl(''),
  //   transaction_chequeName: new FormControl(''),
  //   transaction_accHead: new FormControl('', Validators.required),
  //   trransaction_accHSubHead: new FormControl('', Validators.required),
  //   transaction_accHSubHead: new FormControl('', Validators.required),
  // });

  plan_done_transaction_form = new FormGroup({


    done_transaction_id: new FormControl(''),
    done_booking_id: new FormControl(''),
    plan_done_transaction_date: new FormControl('', [Validators.required]),
    plan_done_transaction_mode: new FormControl('', [Validators.required]),

    plan_done_chequeName: new FormControl('', [Validators.required]),
    plan_done_chequeNumber: new FormControl('', [Validators.required]),
    plan_done_chequeDate: new FormControl('', [Validators.required]),
    plan_done_chequeSubmitDate: new FormControl('', [Validators.required]),
    plan_done_chequeClearDate: new FormControl('', [Validators.required]),
    plan_done_cheque_bank_name: new FormControl('', [Validators.required]),

    plan_done_online_transferred_from: new FormControl(''),
    plan_done_online_bank_name: new FormControl(''),
    plan_done_online_acc_holder_name: new FormControl(''),
    plan_done_online_recieved_date: new FormControl('', [Validators.required]),
    plan_done_all_recieved_date: new FormControl('', [Validators.required]),

    plan_done_cash_submitted_by: new FormControl('', [Validators.required]),
    plan_done_cash_date: new FormControl('', [Validators.required]),

    plan_done_dd_bank_name: new FormControl(''),
    plan_done_dd_name: new FormControl('', [Validators.required]),
    plan_done_dd_number: new FormControl('', [Validators.required]),
    plan_done_dd_submit_date: new FormControl('', [Validators.required]),
    plan_done_dd_clear_date: new FormControl('', [Validators.required]),

    plan_done_status: new FormControl('', [Validators.required]),
    plan_done_amount: new FormControl('', [Validators.required]),
    plan_done_rotation_amnt: new FormControl(),
    plan_done_recieved_by: new FormControl('', [Validators.required]),
    plan_done_transaction_accHead: new FormControl('', [Validators.required]),
    plan_done_transaction_accHSubHead: new FormControl('', [Validators.required]),

  });

  plan_save_transaction_form = new FormGroup({
    plan_transaction_id: new FormControl(''),
    booking_id: new FormControl(''),

    plan_save_transaction_date: new FormControl(''),
    plan_save_transaction_mode: new FormControl('', [Validators.required]),
    plan_save_all_recieved_date: new FormControl('', [Validators.required]),

    plan_save_transaction_accHead: new FormControl('', [Validators.required]),
    plan_save_transaction_accHSubHead: new FormControl('', [Validators.required]),

    plan_save_status: new FormControl('', [Validators.required]),

    plan_save_chequeName: new FormControl('', [Validators.required]),
    plan_save_chequeNumber: new FormControl('', [Validators.required]),
    plan_save_chequeSubmitDate: new FormControl('', [Validators.required]),
    plan_save_chequeClearDate: new FormControl('', [Validators.required]),
    plan_save_chequeDate: new FormControl('', [Validators.required]),
    plan_save_cheque_bank_name: new FormControl('', [Validators.required]),

    plan_save_online_transferred_from: new FormControl('', [Validators.required]),
    plan_save_online_bank_name: new FormControl(''),
    plan_save_online_acc_holder_name: new FormControl('', [Validators.required]),
    plan_save_online_recieved_date: new FormControl('', [Validators.required]),

    plan_save_recieved_by: new FormControl(''),
    plan_save_cash_submitted_by: new FormControl('', [Validators.required]),
    plan_save_cash_date: new FormControl('', [Validators.required]),

    plan_save_dd_bank_name: new FormControl(''),
    plan_save_dd_name: new FormControl('', [Validators.required]),
    plan_save_amount: new FormControl('', [Validators.required]),
    plan_save_dd_number: new FormControl('', [Validators.required]),
    plan_save_dd_submit_date: new FormControl('', [Validators.required]),
    plan_save_dd_clear_date: new FormControl('', [Validators.required]),
  });


  paymentPlan_form = new FormGroup({
    paymentPlan_id: new FormControl(''),
    paymentPlan_booking_id: new FormControl(''),
    paymentPlan_buyer_id: new FormControl(''),

    paymentPlan_date: new FormControl('', [Validators.required]),
    paymentPlan_amount: new FormControl('', [Validators.required]), // Only numbers,
    paymentPlan_status: new FormControl('', [Validators.required]),
    paymentPlan_reason: new FormControl('', [Validators.required]),
    paymentPlan_mode: new FormControl('', [Validators.required]),
    payment_plan_paidTo: new FormControl(''),

    payment_plan_chequeName: new FormControl(''),
    payment_plan_chequeNo: new FormControl(''), // Only numbers,
    payment_plan_cheque_rec_date: new FormControl('', [Validators.required]),

    online_received_date: new FormControl(''),
    online_account_holder_name: new FormControl(''),
    online_bank_name: new FormControl(''),
    online_transferred_from: new FormControl(''),

    plan_cash_submittedBy: new FormControl(''),
    plan_cash_date: new FormControl(''),
    // plan_cash_amount: new FormControl(''),

    planDD_bank_name: new FormControl(''),
    planDD_name_on_dd: new FormControl(''),
    // planDD_dd_amount: new FormControl(''),
    planDD_dd_number: new FormControl(''), // Only numbers,

  });

  buyer_form = new FormGroup({
    buyer_id: new FormControl(''),
    company_id: new FormControl(''),
    booking_id: new FormControl(''),
    buyer_title: new FormControl('', [Validators.required]),
    buyer_name: new FormControl('', [Validators.required]),
    buyer_area: new FormControl('', [Validators.required]),
    buyer_rin_pustika: new FormControl('', [Validators.required]),
    buyer_caste: new FormControl('', [Validators.required]),
    buyer_mobile: new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]),
    buyer_altr_mobile: new FormControl('', [Validators.minLength(10), Validators.maxLength(10)]),
    // buyer_occupation : new FormControl('',[Validators.required]),
    buyer_occupation: new FormControl(''),
    buyer_aadhar: new FormControl('', [Validators.required]),
    buyer_aadhar_img: new FormControl('', [Validators.required]),
    buyer_pan: new FormControl('', [Validators.required, Validators.pattern("^[a-zA-Z0-9]{10}$")]),
    buyer_pan_img: new FormControl('', [Validators.required]),
    buyer_address: new FormControl('', [Validators.required]),
    buyer_country: new FormControl('', [Validators.required]),
    buyer_state: new FormControl('', [Validators.required]),
    buyer_city: new FormControl('', [Validators.required]),
    // buyer_caretaker : new FormControl('',[Validators.required]),
    buyer_caretaker: new FormControl(''),
    // buyer_spouse : new FormControl('',[Validators.required]),
    buyer_spouse: new FormControl(''),
    created_by: new FormControl('', [Validators.required]),
    created_dt: new FormControl('', [Validators.required]),
    updated_Dt: new FormControl('', [Validators.required]),
    updated_By: new FormControl('', [Validators.required]),

  });
  attachmenDetails = new FormGroup({
    // notesDate:new FormControl('',Validators.required),
    attachmentstatus: new FormControl(''),
    attachmentimage: new FormControl(''),
    attachmeid_id: new FormControl(''),
  });

  regDetailForm = new FormGroup({
    regPersonsID: new FormControl(''),
    regDetailID: new FormControl(''),
    BuyerName: new FormControl(''),
    regbkngDate: new FormControl(''),
    regDate: new FormControl(''),
    reg_remarks: new FormControl(''),
    RegStage: new FormControl(''),
    RegStatus: new FormControl(''),
    PaymentStatus: new FormControl(''),
    PaymentPlan: new FormControl(''),
    person_type: new FormControl(''),
    totalAmount: new FormControl('', { updateOn: 'blur' }),
    amount_per_sqft: new FormControl('', { updateOn: 'blur' }),
    bkPlotSize: new FormControl(''),
    paidAmount: new FormControl(''),
    discountAmount: new FormControl(''),
    remainingAmount: new FormControl(''),
    plotDepth: new FormControl(''),
    plotLength: new FormControl(''),
  });

  private toNumber(value: any): number {
    if (value === null || value === undefined || value === '') return 0;
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  }

  private toNumberLoose(value: any): number {
    if (value === null || value === undefined || value === '') return 0;
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    const match = value.toString().replace(/,/g, '').match(/-?\d+(\.\d+)?/);
    return match ? this.toNumber(match[0]) : 0;
  }

  private toMoney(value: any): number {
    const amount = this.toNumberLoose(value);
    return Math.round((amount + Number.EPSILON) * 100) / 100;
  }

  private toMoneyString(value: any): string {
    return this.toMoney(value).toFixed(2);
  }

  private toPaise(value: any): number {
    return Math.round(this.toNumberLoose(value) * 100);
  }

  private isPaidAmountValid(total: any, paid: any, discount: any = 0): boolean {
    return this.toPaise(paid) + this.toPaise(discount) <= this.toPaise(total);
  }

  private formatSize(front: number, depth: number): string {
    if (!front || !depth) return '';
    return `${front}*${depth}`;
  }

  private recalculateMeasurementRow(group: FormGroup): void {
    const front = this.toNumber(group.get('mFrontLength')?.value);
    const depth = this.toNumber(group.get('mDepthLength')?.value);

    const size = this.formatSize(front, depth);
    const area = front && depth ? front * depth : 0;

    group.patchValue(
      {
        mSize: size,
        mRakba: area ? area : 0,
      },
      { emitEvent: false }
    );
  }

  private recalculateMeasurementTotals(recalcTotal: boolean = true): void {
    const totalArea = (this.measurements?.controls || []).reduce((sum: number, ctrl: any) => {
      return sum + this.toNumber(ctrl.get('mRakba')?.value);
    }, 0);

    this.regMeasurement.get('totalAreaValue')?.setValue(totalArea, { emitEvent: false });
    this.regDetailForm.patchValue({ bkPlotSize: totalArea }, { emitEvent: false });

    if (!recalcTotal) return;

    const rate = this.toMoney(this.regDetailForm.get('amount_per_sqft')?.value);
    const paidAmount = this.toMoney(this.regDetailForm.get('paidAmount')?.value);
    const discountValue = this.toMoney(this.regDetailForm.get('discountAmount')?.value);

    const newTotalAmount = this.toMoney(totalArea * rate);

    if (this.isPaidAmountValid(newTotalAmount, paidAmount, discountValue)) {
      const totalAmountValue = this.toMoneyString(newTotalAmount);
      this.regDetailForm.patchValue({ totalAmount: totalAmountValue }, { emitEvent: false });
      this.regMeasurement.get('totalAmountValue')?.setValue(totalAmountValue, { emitEvent: false });
      this.updateRemainingAmount(newTotalAmount);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Paid Amount Should be Less than or Equal To Total Amount',
        showConfirmButton: false,
        timer: 3000
      });
    }
  }

  private wireMeasurementRow(group: FormGroup): void {
    // Keep derived fields in sync as user edits front/depth
    group.get('mFrontLength')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.recalculateMeasurementRow(group);
      this.recalculateMeasurementTotals();
    });

    group.get('mDepthLength')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.recalculateMeasurementRow(group);
      this.recalculateMeasurementTotals();
    });
  }

  private updateRemainingAmount(totalAmount?: number): void {
    const total = this.toMoney(totalAmount ?? this.regDetailForm.get('totalAmount')?.value);
    const paid = this.toMoney(this.regDetailForm.get('paidAmount')?.value);
    const discount = this.toMoney(this.regDetailForm.get('discountAmount')?.value);

    const remaining = this.toMoney(total - (paid + discount));
    this.regDetailForm.patchValue({ remainingAmount: this.toMoneyString(remaining) }, { emitEvent: false });

    if (this.toPaise(total) === this.toPaise(paid) + this.toPaise(discount)) {
      this.isHideIfAmountMatches = false;
    } else {
      this.isHideIfAmountMatches = true;
    }

    if (this.regMeasurement) {
      this.regMeasurement.get('totalAmountSqftValue')?.setValue(this.toMoneyString(this.regDetailForm.get('amount_per_sqft')?.value), { emitEvent: false });
      this.regMeasurement.get('totalAmountValue')?.setValue(this.toMoneyString(this.regDetailForm.get('totalAmount')?.value), { emitEvent: false });
    }
  }

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
  regattorneyDetails = new FormGroup({
    AttorneyId: new FormControl(''),
    attLandlordId: new FormControl(''),
    landlord_id: new FormControl(''),
    regpowerName: new FormControl('', [Validators.required]),
    regpowerNumber: new FormControl('', [Validators.required]),
    regKhasraNo: new FormControl('', [Validators.required]),
    regpowerRakba: new FormControl('', [Validators.required]),
    regdiversion: new FormControl('', [Validators.required]),
    regsignTime: new FormControl('', [Validators.required]),
    regpowerDate: new FormControl('', [Validators.required]),
    regpowerPustak: new FormControl('', [Validators.required]),
    regpowerGranth: new FormControl('', [Validators.required]),
    regpowerVilekh: new FormControl('', [Validators.required])
  })
  buyerFormInfo = new FormGroup({
    buyerTitle: new FormControl(''),
    buyerspouse: new FormControl(''),
    buyername: new FormControl(''),
    buyerage: new FormControl(''),
    buyercaste: new FormControl(''),
    buyeroccupation: new FormControl(''),
    buyeraadhar: new FormControl(''),
    buyerpancard: new FormControl(''),
    buyermobileno: new FormControl(''),
    buyeralternumber: new FormControl(''),
    buyerstate: new FormControl(''),
    buyercity: new FormControl(''),
    buyeraddress: new FormControl(''),
  })

  ngOnInit(): void {
    this.Admin = false;
    this.Administrator = false;
    this.Accountant = false;
    this.Accounts_Internal = false;
    this.CrmUserRole = false;
    if (sessionStorage.getItem('UserRole') == 'Admin') {
      this.CrmUserRole = true;
    }
    let role = sessionStorage.getItem('UserRole') || '';
    let match = role.split(',');
    for (let a in match) {
      if (match[a] == 'Accountant') {
        this.Accountant = true;
      }
      if (match[a] == 'Accounts Internal') {
        this.Accounts_Internal = true;
      }
      if (match[a] == 'Administrator') {
        this.Administrator = true;
      }
      if (match[a] == 'Admin') {
        this.Admin = true;
      }
    }
    this.jwttoken = jwt_decode(sessionStorage.getItem('token') || '');
    // this.isChangeSave[1] = true;
    this.id = this.Activatedroute.snapshot.paramMap.get('id');
    this.customerID = this.Activatedroute.snapshot.paramMap.get('customerID');
    this.prsn_id = this.Activatedroute.snapshot.paramMap.get('prsn_id') || '';
    this.type = this.Activatedroute.snapshot.paramMap.get('type');
    this.getInfo(this.id);
    // this.planDone(this.title,this.id,this.index);
    // this.paidAmount();
    this.StagesStatuslist();
    this.paidAmount();
    this.employeetypenamelist();
    this.lookupdatalist();
    this.datatableCode();
    this.sellerdatatableCode();

    this.witnessdatatableCode();
    this.GetAllStagesStatusList();
    this.paymentDetailDatatableCode();
    this.getAccHead();
    this.getAllAccSubHead();
    this.getAllBankDetails();
    // this.getAccSubHead(this.value);
    this.paymentPlanDatatableCode();

    this.checkIdAfterEntry();
    // this.showAllBankLists();
    // this.onAccSubHeadChange();

    // this.paymentDatatableCode();
    this.pType = "Seller";
    if (this.type == 'Edit') {
      this.hideAddbutton = true;
    }
    else {
      this.hideAddbutton = false;
    }
    this.editReg(this.id, this.prsn_id)
    this.attorneydatatableCode();
    this.attachmentdatatabl();
    this.PaymentPlanlist();
    // this.Statuslist();
    this.PaymentStatuslist();

    // this.BuyerAuto(this.prsn_id);
    // this.SellerAuto(this.id, this.prsn_id);
    this.Activatedroute.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const selectedTab = params['tab'];
      if (selectedTab === 'buyer') {
        this.activateBuyerTab();
      } else {
        this.activatePaymentPlanTab();
      }
    });


    this.regDetailForm.get('bkPlotSize')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.calculateTotal();
    });

    this.regDetailForm.get('amount_per_sqft')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.calculateTotal();
    });

    this.regDetailForm.get('totalAmount')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.calculatePerSqftFromTotal();
    });

    this.regDetailForm.get('paidAmount')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.updateRemainingAmount();
    });

    this.regDetailForm.get('discountAmount')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.updateRemainingAmount();
    });

    this.regMeasurement.get('totalAmountSqftValue')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      const rate = this.toMoney(this.regMeasurement.get('totalAmountSqftValue')?.value);
      if (!rate) return;
      // Sync Measurement tab "Total Amount (Per Sqft)" -> main "Amount (Per Sqft)"
      this.regDetailForm.patchValue({ amount_per_sqft: this.toMoneyString(rate) });
    });

    this.regMeasurement.get('totalAmountValue')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      const total = this.toMoney(this.regMeasurement.get('totalAmountValue')?.value);
      if (!total) return;
      // Sync Measurement tab "Total Amount Value" -> main "Total Amount"
      this.regDetailForm.patchValue({ totalAmount: this.toMoneyString(total) });
    });
  }


  calculateTotal() {
    const size = this.toNumberLoose(this.regDetailForm.get('bkPlotSize')?.value);
    const rate = this.toMoney(this.regDetailForm.get('amount_per_sqft')?.value);

    if (size && rate) {
      const total = this.toMoney(size * rate);

      this.regDetailForm.patchValue({
        totalAmount: this.toMoneyString(total)
      }, { emitEvent: false });

      this.updateRemainingAmount(total);
    }
  }

  calculatePerSqftFromTotal() {
    const size = this.toNumberLoose(this.regDetailForm.get('bkPlotSize')?.value);
    const total = this.toMoney(this.regDetailForm.get('totalAmount')?.value);

    if (!size || !total) {
      this.updateRemainingAmount(total);
      return;
    }

    const paid = this.toMoney(this.regDetailForm.get('paidAmount')?.value);
    const discount = this.toMoney(this.regDetailForm.get('discountAmount')?.value);
    if (!this.isPaidAmountValid(total, paid, discount)) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Paid Amount Should be Less than or Equal To Total Amount',
        showConfirmButton: false,
        timer: 3000
      });
      return;
    }

    const rate = this.toMoney(total / size);
    this.regDetailForm.patchValue({
      amount_per_sqft: this.toMoneyString(rate)
    }, { emitEvent: false });
    this.updateRemainingAmount(total);
  }

  activateBuyerTab() {
    this.activeTab = 'BuyerTab';
  }

  activatePaymentPlanTab() {
    this.activeTab = 'PaymentPlanTab';
  }


  checkIdAfterEntry() {
    // if (this.router.url === '/edit-booking/view') {
    //  
    // }else{
    //   
    // }
  }


  paidAmount() {


    if (this.regDetailForm.value.totalAmount != '') {

      const paidAmount = this.toMoney(this.PaymentDetaildata.reduce((acc, item) => {
        const trans = this.toMoney(item.trans_amount);
        const show_amnt = this.toMoney(item.show_amount);
        const rotation = this.toMoney(item.rotation_amnt);
        return acc + ((trans + show_amnt) - rotation);
        // return acc + (trans);
      }, 0));
      this.regDetailForm.patchValue({ paidAmount: this.toMoneyString(paidAmount) }, { emitEvent: false });

      const totalAmount = this.toMoney(this.regDetailForm.get('totalAmount')?.value);
      const finalpaidAmount = this.toMoney(this.regDetailForm.get('paidAmount')?.value);
      const discountValue = this.toMoney(this.regDetailForm.get('discountAmount')?.value);
      const remaingAmnt = this.toMoney(totalAmount - (finalpaidAmount + discountValue));
      this.regDetailForm.patchValue({ remainingAmount: this.toMoneyString(remaingAmnt) }, { emitEvent: false });

      if (this.toPaise(totalAmount) === this.toPaise(finalpaidAmount) + this.toPaise(discountValue)) {
        this.isHideIfAmountMatches = false;
      } else {
        this.isHideIfAmountMatches = true;
      }

      //update the paid amount in the db
      let bookingData: any = new FormData();

      bookingData.append('regDetailID', this.regDetailForm.get('regDetailID')?.value);
      bookingData.append('regPersonsID', this.regDetailForm.get('regPersonsID')?.value);
      bookingData.append('paidAmount', this.toMoneyString(paidAmount));
      bookingData.append('discountValue', this.toMoneyString(this.regDetailForm.get('discountAmount')?.value));

      this.billingservice.update_PaidAmount(bookingData).pipe(takeUntil(this.destroy$)).subscribe((resp) => {

      });

      // Calculate the remaining amount
      // const totalAmount = this.regDetailForm.value.totalAmount;      
      // let finalPaidValue = paidAmount;
      // let discountValue = this.regDetailForm.get('discountAmount').value;
      // if (discountValue === null || discountValue === undefined || discountValue === '') {
      //   discountValue = 0;
      // }      
      // finalPaidValue += +discountValue;  
      // const remainingAmount = totalAmount - finalPaidValue;
      // this.regDetailForm.patchValue({ remainingAmount: remainingAmount });

    } else {
      console.error("Amount is empty");
    }


  }







  getAccHead() {
    let headData = new FormData();
    this.hrservice.fetch_headData(headData).pipe(takeUntil(this.destroy$)).subscribe(Response => {

      this.resplookupBank = Response.data

    });

  }

  getAllAccSubHead() {
    let headData = new FormData();

    this.hrservice.fetch_AllSubheadData(headData).pipe(takeUntil(this.destroy$)).subscribe(resp => {

      this.resplookupsubBank = resp.data;

    });
  }

  getAllBankDetails() {
    let headData = new FormData();

    this.hrservice.fetch_AllBankDetails(headData).pipe(takeUntil(this.destroy$)).subscribe(resp => {

      this.SelectedBankData = resp.data;

    })
  }

  onAccHeadChange(event: Event): void {


    const selectedValue = (event.target as HTMLSelectElement).value;
    if (selectedValue) {

      this.getAccSubHead(selectedValue);

    }

  }


  onAccSubHeadChange(event: Event) {

    let HeadAndSubhHeadData = new FormData();

    HeadAndSubhHeadData.append('acc_head', this.plan_save_transaction_form.get('plan_save_transaction_accHead')?.value);
    HeadAndSubhHeadData.append('acc_sub_head', this.plan_save_transaction_form.get('plan_save_transaction_accHSubHead')?.value);


    this.hrservice.fetch_bankName(HeadAndSubhHeadData).pipe(takeUntil(this.destroy$)).subscribe(resp => {




      this.SelectedBankData = resp.data;

      if (resp.data && resp.data.length > 0 && resp.data[0].bankName) {

        this.plan_save_transaction_form.patchValue({
          plan_save_cheque_bank_name: resp.data[0].bankName
        });

        this.plan_save_transaction_form.get('plan_save_cheque_bank_name')?.setValue(resp.data[0].bankName);
      }

    });

  }
  onAccSubHeadChange1(event: Event) {

    let HeadAndSubhHeadData = new FormData();

    HeadAndSubhHeadData.append('acc_head', this.plan_done_transaction_form.get('plan_done_transaction_accHead')?.value);
    HeadAndSubhHeadData.append('acc_sub_head', this.plan_done_transaction_form.get('plan_done_transaction_accHSubHead')?.value);


    this.hrservice.fetch_bankName(HeadAndSubhHeadData).pipe(takeUntil(this.destroy$)).subscribe(resp => {

      this.SelectedBankData1 = resp.data;

      if (resp.data && resp.data.length > 0 && resp.data[0].bankName) {
        this.plan_done_transaction_form.patchValue({

          plan_save_cheque_bank_name: resp.data[0].bankName
        });
        this.plan_done_transaction_form.get('plan_done_cheque_bank_name')?.setValue(resp.data[0].bankName);
      }

    });

  }



  getAccSubHead(selectedValue: string) {

    let subHead = new FormData();
    subHead.append('subhead', selectedValue);
    this.hrservice.fetch_subheadData(subHead).pipe(takeUntil(this.destroy$)).subscribe(Response => {


      this.resplookupsubBank = Response.data;

      // return this.resplookupsubBank;
    });


  }





  ngAfterViewInit(): void {
    this.dtTrigger.next();
    this.dtTrigger1.next();
    this.dtTrigger2.next();
    this.dtTrigger3.next();
    this.dtTrigger6.next();
    this.dtTrigger4.next();
    this.dtTrigger5.next();
    this.labelImport_arr = this.labelImport.toArray()
    this.Seller_form.controls.seller_name.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
      value ? this.Autocomplete_fun(value) : '';
    });
    this.witness_form.controls.witness_name.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
      value ? this.Autocomplete_fun(value) : '';
    });
    // var tst = this.datatable_directive.toArray()[4].dtOptions;

    this.id = this.Activatedroute.snapshot.paramMap.get('id');
    this.customerID = this.Activatedroute.snapshot.paramMap.get('customerID');
    this.prsn_id = this.Activatedroute.snapshot.paramMap.get('prsn_id') || '';

    this.docsTabWorkdetailEl = document.getElementById('docs-tab-workdetail');
    if (this.docsTabWorkdetailEl) {
      this.docsTabWorkdetailClickHandler = this.onTabClick.bind(this);
      this.docsTabWorkdetailEl.addEventListener('click', this.docsTabWorkdetailClickHandler);
    }



  }


  goBack(): void {
    this.cleanupComponentState();
    this.router.navigate(['/reg-record'], { replaceUrl: true });
  }

  private cleanupComponentState(): void {
    if (this.hasCleanedUp) {
      return;
    }
    this.hasCleanedUp = true;

    this.destroy$.next();
    this.destroy$.complete();

    if (this.docsTabWorkdetailEl && this.docsTabWorkdetailClickHandler) {
      this.docsTabWorkdetailEl.removeEventListener('click', this.docsTabWorkdetailClickHandler);
    }
    this.docsTabWorkdetailEl = null;
    this.docsTabWorkdetailClickHandler = null;

    try {
      if (this.dtElement?.forEach) {
        this.dtElement.forEach((item: any) => item?.dtInstance?.then((dtInstance: DataTables.Api) => dtInstance?.destroy()).catch(() => undefined)
        );
      } else if (this.dtElement?.dtInstance) {
        this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => dtInstance?.destroy()).catch(() => undefined);
      }
    } catch {
      // no-op
    }

    for (const trigger of [
      this.dtTrigger,
      this.dtTrigger1,
      this.dtTrigger2,
      this.dtTrigger3,
      this.dtTrigger4,
      this.dtTrigger5,
      this.dtTrigger6,
      this.dtTrigger7
    ]) {
      try {
        trigger?.complete();
      } catch {
        // no-op
      }
      try {
        trigger?.unsubscribe();
      } catch {
        // no-op
      }
    }

    // Reset all reactive forms defined on this component
    for (const key of Object.keys(this)) {
      const value = (this as any)[key];
      if (value instanceof FormGroup) {
        try {
          value.reset();
          value.markAsPristine();
          value.markAsUntouched();
        } catch {
          // no-op
        }
      }
      if (value instanceof FormArray) {
        try {
          value.clear();
        } catch {
          // no-op
        }
      }
    }

    // Clear commonly large in-memory collections/objects to avoid residual data
    this.customerData = [];
    this.customerdataList = [];
    this.dataa = [];
    this.selldataa = [];
    this.witdata = [];
    this.PaymentDetaildata = [];
    this.attachmentdata = [];
    this.SelectedBankData = [];
    this.resplookupBank = [];
    this.resplookupBankk = [];
    this.resplookupsubBank = [];
    this.respStatus = [];
    this.resplookupTitel = [];
    this.respStages = null;
    this.respStagesStatus = null;
    this.respStagesStatuss = null;
    this.respPPlan = null;
    this.respPStatus = null;
    this.Poalist = null;
    this.payPlanList = null;
    this.filecontent = null;
    this.fileuploads = '';
    this.attachmentimageName = null;

    // Reset UI flags/state
    this.activeTab = 'Personal';
    this.submitted = false;
    this.submit_btn = false;
    this.submit_btn2 = false;
    this.isDisabled = true;
    this.isDoneSave = false;
    this.isDDSelected = false;
    this.isCQSelected = false;
    this.hideAddbutton = false;
  }


  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
      this.dtTrigger1.next();
      this.dtTrigger2.next();
      this.dtTrigger3.next();
      this.dtTrigger4.next();
    });
  }
  Autocomplete_fun(value: any) {
    if (value.length >= 3) {
      this.customerData = [];
      let customerlist = new FormData();
      customerlist.append('value', value);
      this.crmservice.getCustomerDetail(customerlist).pipe(takeUntil(this.destroy$)).subscribe((resp) => {

        for (let i = 0; i < resp.data.length; i++) {
          this.customerData.push({
            id: resp.data[i].CustomerId,
            name: resp.data[i].Name,
          });
        }
        this.customerdataList = [this.customerData];
        this.customerdataList = this.customerdataList[0];
      });
    }
    else {
      this.customerdataList = [];
    }
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


  // confirmA() {
  //   if (confirm('Are you sure to change it')) {

  //   }
  // }

  openAttorButton() {
    this.viewPOA_btn = false;
    if (this.flg == "Add") {
      this.PopupTitle = "Add New Attorney";
      this.regattorneyDetails.enable();
    }
    else if (this.flg == "Edit") {
      this.PopupTitle = "Edit Attorney";
      this.regattorneyDetails.enable();

    }
    else if (this.flg == "View") {
      this.PopupTitle = "View Attorney";
      this.regattorneyDetails.disable();
      this.viewPOA_btn = true;
    }

    this.flg = "Add"
    this.regattorneyDetails.reset();
    const aLandlordId = this.id
    this.regattorneyDetails.get('attLandlordId')?.setValue(aLandlordId);
  }


  getInfo(id:any) {

    let regData = new FormData();
    regData.append('id', id);

    this.billingservice.getRegData(regData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      console.log(resp);
      /* ================= BUYER ================= */
      this.buyer_form.patchValue({
        buyer_id: resp['regBuyer']['id'],
        company_id: resp['regBuyer']['company_id'],
        booking_id: resp['regBuyer']['booking_id'],
        buyer_name: resp['regBuyer']['name'],
        buyer_title: resp['regBuyer']['title'],
        buyer_mobile: resp['regBuyer']['mobile_number'],
        buyer_caste: resp['regBuyer']['caste'],
        buyer_altr_mobile: resp['regBuyer']['alt_number'],
        buyer_address: resp['regBuyer']['address'],
        buyer_occupation: resp['regBuyer']['occupation'],
        buyer_city: resp['regBuyer']['city'],
        buyer_country: resp['regBuyer']['country'],
        buyer_aadhar: resp['regBuyer']['aadhar_number'],
        buyer_pan: resp['regBuyer']['pan_number'],
        buyer_area: resp['regBuyer']['buyer_area'],
        buyer_state: resp['regBuyer']['state'],
        buyer_caretaker: resp['regBuyer']['guardian_type'],
        buyer_spouse: resp['regBuyer']['guardian_name'],
        created_by: resp['regBuyer']['created_by'],
        created_dt: resp['regBuyer']['created_dt'],
        updated_By: resp['regBuyer']['updated_By'],
        updated_Dt: resp['regBuyer']['updated_Dt']
      });

      /* ================= SELLER ================= */
      this.Seller_form.patchValue({
        seller_id: resp['regSeller']['id'],
        booking_id: resp['regSeller']['booking_id'],
        company_id: resp['regSeller']['company_id'],
        seller_name: resp['regSeller']['name'],
        seller_mobile: resp['regSeller']['mobile_number'],
        seller_caste: resp['regSeller']['caste'],
        seller_altr_mobile: resp['regSeller']['alt_number'],
        seller_address: resp['regSeller']['address'],
        seller_occupation: resp['regSeller']['occupation'],
        seller_city: resp['regSeller']['city'],
        seller_country: resp['regSeller']['country'],
        seller_aadhar: resp['regSeller']['aadhar_number'],
        seller_pan: resp['regSeller']['pan_number'],
        seller_state: resp['regSeller']['state'],
        seller_title: resp['regSeller']['title'],
        created_by: resp['regSeller']['created_by'],
        created_dt: resp['regSeller']['created_dt'],
        updated_By: resp['regSeller']['updated_By'],
        updated_Dt: resp['regSeller']['updated_Dt']
      });

      /* ================= MEASUREMENT ================= */

      let blockName = resp['plotDetails']['custom2'] || '';
      let plotName = resp['plotDetails']['plotName'] || '';

      // let blockName = productName.includes('-')
      //   ? productName.split('-')[0].replace('Block', '').trim()
      //   : '';

      // let plotName = productName.includes('-')
      //   ? productName.split('-')[1].trim()
      //   : '';

      //  Call centralized handler (CSV + single)
      this.patchMeasurementFromResponse(resp, blockName, plotName);

      /* ================= OTHER ================= */

      // Use PLOT_SIZE from API only as fallback when measurement rows produced no calculable area
      const calculatedSize = this.toNumberLoose(this.regDetailForm.get('bkPlotSize')?.value);
      if (!calculatedSize) {
        this.regDetailForm.get('bkPlotSize')?.setValue(resp['plotDetails']['PLOT_SIZE'], { emitEvent: false });
        this.regMeasurement.get('totalAreaValue')?.setValue(resp['plotDetails']['PLOT_SIZE'], { emitEvent: false });
      }
    });
  }


  patchMeasurementFromResponse(resp: any, blockName: string, plotName: string) {
    this.regMeasurement.patchValue({
      mBillDate: this.datePipe.transform(resp['regDetails']['booking_date'], 'dd/MM/yyyy'),
      mKhasraNo: resp['plotDetails']['KHASRAS'] || ''
    });

    this.measurements.clear();

    const split = (val: any) => {
      if (!val) return [];
      return val
        .toString()
        .split(',')
        .map((v: string) => v.trim())
        .filter((v: string) => v !== '');
    };

    const splitFrontDepth = (val: any) => {
      if (!val) return [];
      return val
        .toString()
        .split(/[,\|]/)
        .map((v: string) => v.trim())
        .filter((v: string) => v !== '');
    };

    const moujas = split(resp['plotDetails']['MOUJAS']);
    const rakbas = split(resp['plotDetails']['RAKBAS']);
    const landUses = split(resp['plotDetails']['LANDUSES']);

    const sizesRaw = resp?.plotDetails?.SIZES || '';
    const areas = sizesRaw
      ? sizesRaw
        .toString()
        .split(/\s*\|\s*/)
        .map((v: string) => v.trim())
        .filter((v: string) => v !== '')
      : [];

    // Always take FRONT/DEPTH values from resp.plotDetails only (API key names vary/contain typos).
    const frontsRaw = resp?.plotDetails?.FRONTLENGTHS ?? resp?.plotDetails?.FRONTLENTHS ?? '';
    const depthsRaw = resp?.plotDetails?.DEPTHLENGTHS ?? resp?.plotDetails?.DEPTHLENTHS ?? '';
    let fronts = splitFrontDepth(frontsRaw);
    let depths = splitFrontDepth(depthsRaw);

    // Fallback (single-plot APIs): front/depth sometimes come as custom4/custom5
    const singleFront = resp?.plotDetails?.custom4 ?? resp?.plotDetails?.CUSTOM4 ?? '';
    const singleDepth = resp?.plotDetails?.custom5 ?? resp?.plotDetails?.CUSTOM5 ?? '';
    if (fronts.length === 0 && singleFront !== '' && singleFront !== null && singleFront !== undefined) {
      fronts = [singleFront.toString()];
    }
    if (depths.length === 0 && singleDepth !== '' && singleDepth !== null && singleDepth !== undefined) {
      depths = [singleDepth.toString()];
    }

    let blocks: any[] = [];

    const blockNumbers = resp['regDetails']['BLOCKNUMBERS'];
    const plotCodes = resp['plotDetails']['PLOTCODES'];

    if (blockNumbers) {
      // Direct use
      blocks = split(blockNumbers);
    } else if (plotCodes) {
      // Extract prefix and convert to Block-X
      blocks = split(plotCodes).map((code: string) => {
        if (!code) return '';
        const cleaned = code.replace(/\s/g, '');
        const prefix = cleaned.includes('-') ? cleaned.split('-')[0] : cleaned;
        return prefix ? `Block-${prefix}` : '';
      });
    }


    let plots: any[] = [];
    const plotNumbers = resp['plotDetails']['PLOTNUMBERS'];
    // const plotCodes = resp['plotDetails']['PLOTCODES'];

    if (plotNumbers) {
      // Direct use
      plots = split(plotNumbers);
    } else if (plotCodes) {
      // Extract numeric part from codes like "Z-88441"
      plots = split(plotCodes).map((code: string) => {
        if (!code) return '';
        // remove spaces and take value after '-'
        const cleaned = code.replace(/\s/g, '');
        return cleaned.includes('-') ? cleaned.split('-')[1] : cleaned;
      });
    }

    const maxLength = Math.max(
      areas.length,
      moujas.length,
      rakbas.length,
      fronts.length,
      depths.length,
      plots.length,
      blocks.length,
      landUses.length,
    );

    const count = maxLength > 0 ? maxLength : 1;

    for (let i = 0; i < count; i++) {
      const areaText = areas[i] || '';

      const frontVal = this.toNumberLoose(fronts[i]);
      const depthVal = this.toNumberLoose(depths[i]);
      const useSplitSize = !!frontVal && !!depthVal;

      const computedArea = useSplitSize ? (frontVal * depthVal) : 0;
      const sizeValue = useSplitSize ? this.formatSize(frontVal, depthVal) : areaText;
      const group = this._fb.group({
        mUseSplitSize: [useSplitSize],
        mFrontLength: [useSplitSize ? (frontVal || '') : ''],
        mDepthLength: [useSplitSize ? (depthVal || '') : ''],
        mSize: [sizeValue || ''],
        mMouja: [moujas[i] || ''],
        mRakba: [useSplitSize ? computedArea : (this.toNumberLoose(rakbas[i]) || 0)],
        mPlotNumber: [plots[i] || ''],
        mBlockNumber: [blocks[i] || ''],
        landUse: [landUses[i] || '']
      });

      if (useSplitSize) {
        this.wireMeasurementRow(group);
      }
      this.measurements.push(group);
    }

    const rawProductIds = resp['plotDetails']['PRODUCTIDS'] || '';
    // const productIdsArr = rawProductIds.split(',').map((id: string) => id.trim()).filter((id: string) => id);
    // const productIdsCSV = productIdsArr.join(',');
    this.regMeasurement.patchValue({ product_id: rawProductIds });

    // Ensure plot size is consistent with the loaded rows; don't clobber the stored totalAmount on load
    this.recalculateMeasurementTotals(false);

  }

  datatableCode() {
    this.DatatableParameter.person_type = "Buyer";
    this.DatatableParameter.booking_id = this.id;

    const that = this;
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });
    this.dtOptions = {
      processing: true,
      serverSide: true,
      dom: 'lrtip',
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
      columnDefs: [
        { orderable: false, targets: 0 }
      ],
      ajax: (dataTablesParameters: any, callback) => {
        Object.assign(dataTablesParameters, this.DatatableParameter);
        that.http.post<DataTablesResponse>(environment.APIEndpoint + 'booking.fetchBookingDetails&reload=1', Object.assign(dataTablesParameters, this.DatatableParameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {
          that.dataa = resp.data;

          callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsTotal,
            data: [],
          });
        });
      }
    };
  }


  sellerdatatableCode() {
    this.SDatatableParameter.person_type = "Seller";
    this.SDatatableParameter.booking_id = this.id;
    const that = this;
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });
    this.dtOptions3 = {
      processing: true,
      serverSide: true,
      dom: 'lrtip',
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
      columnDefs: [
        { orderable: false, targets: 0 }
      ],
      ajax: (dataTablesParameters: any, callback) => {
        Object.assign(dataTablesParameters, this.SDatatableParameter);
        that.http.post<DataTablesResponse>(environment.APIEndpoint + 'booking.fetchBookingDetails&reload=1', Object.assign(dataTablesParameters, this.SDatatableParameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {

          that.selldataa = resp.data;

          callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsTotal,
            data: []
          });
        });
      }
    };
  }
  attorneydatatableCode() {

    this.ADatatableParameters.landlord_id = this.id;

    // alert(this.id);
    //  this.ADatatableParameters.id = '';
    const that = this;
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });
    this.dtOptions4 = {
      processing: true,
      serverSide: true,
      dom: 'lrtip',
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
      columnDefs: [
        { orderable: false, targets: 5 }
      ],

      ajax: (dataTablesParameters: any, callback) => {
        Object.assign(dataTablesParameters, this.ADatatableParameters);
        that.http.post<DataTablesResponse>(environment.APIEndpoint + 'reg_landlords.getAttorneydata&reload=1', Object.assign(dataTablesParameters, this.ADatatableParameters), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {
          that.AttoryneyData = resp.data;
          callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsTotal,
            data: []
          });
        });
      }


    };
  }
  // paymentDatatableCode(){
  // 	this.paymentDatatableParameter.id = '';
  // 	// const that = this;

  // 	// const headers = new HttpHeaders({ 'Content-Type': 'text/plain'});
  // 		this.dtOptions5 ={
  // 			searching: false
  // 		}
  // }
  iconColors: string[] = [];


  paymentPlanDatatableCode() {

    this.paymentDatatableParameter.id = this.id;

    const index = 0;
    const that = this;
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });

    this.dtOptions5 = {
      processing: true,
      serverSide: true,
      dom: 'lrtip',
      pageLength: 25,
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
      columnDefs: [
        { orderable: false, targets: 0 }
      ],

      ajax: (dataTablesParameters: any, callback) => {
        Object.assign(dataTablesParameters, this.paymentDatatableParameter);

        that.http.post<DataTablesResponse>(environment.APIEndpoint + 'regPayment.fetch_paymentPlan&reload=1', Object.assign(dataTablesParameters, this.paymentDatatableParameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {


          that.paymentplan = resp.data;
          that.iconColors = new Array(resp.data.length).fill('#59c959');
          const idsArray = resp.data.map(item => ({ id: item.id, date: item.date, reason: item.reason }));
          idsArray.forEach((item, index) => {
            const formdata23 = new FormData();
            formdata23.append('id', item.id);
            this.billingservice.checkview(formdata23).pipe(takeUntil(this.destroy$)).subscribe((resp) => {
              if (resp.data === true) {
                that.iconColors[index] = 'grey';
              } else {
                that.iconColors[index] = '#59c959';
                that.getPlanTOTAmount();
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

  getPlanTOTAmount() {
    let Planformdata = new FormData();
    Planformdata.append('regDetailID', this.regDetailForm.get('regDetailID')?.value);
    Planformdata.append('regPersonsID', this.regDetailForm.get('regPersonsID')?.value);

    const regDateValue = this.regDetailForm.get('regDate')?.value;
    const [day, month, year] = regDateValue.split('/');
    const regDate = new Date(`${year}-${month}-${day}`);
    let totalPlanAmount = 0;

    this.paymentplan.forEach((item: any, index: any) => {
      const itemDate = new Date(item.date);

      if (this.iconColors[index] === '#59c959' && regDate >= itemDate) {
        totalPlanAmount += item.amount;
      }
    });
    Planformdata.append('total_plan_amount_till_reg_date', totalPlanAmount.toString());


    let totalFinanceAmount = 0;
    this.paymentplan.forEach((item: any, index: any) => {

      if (this.iconColors[index] === '#59c959' && item.reason === '647703d8-510c-4fe2-99fd-a6cc141aecab') {
        totalFinanceAmount += item.amount;
      }
    });
    Planformdata.append('total_finance_amount', totalFinanceAmount.toString());

    this.billingservice.setRegFncAmounts(Planformdata).pipe(takeUntil(this.destroy$)).subscribe((resp) => {

    });

  }

  openModalPayPlan(type:any, id = "") {
    this.modalTitle = type;
    this.submit_btn = false;
    this.isButtonDisabled = false;
    this.paymentPlan_form.reset();
    this.isView = false;
    let response_data: any = {};
    type.includes('View') ? (this.paymentPlan_form.disable()) : (this.paymentPlan_form.enable(), this.isView = true);
    if (id && (type.includes('Edit') || type.includes('View'))) {
      let formData = new FormData();
      formData.append("id", id);
      this.billingservice.view(formData).pipe(takeUntil(this.destroy$)).subscribe((resp) => {


        for (let i = 0; i < resp.data.COLUMNS.length; i++) {
          response_data[resp.data.COLUMNS[i]] = resp.data.DATA[0][i]
        }


        if (resp.data.DATA[0][6] == 'Cash') {
          let value = resp.data.DATA[0][6];
          this.onSelectPaymentPlanMode(value);
          this.paymentPlan_form.patchValue({

            plan_cash_submittedBy: resp.data.DATA[0][13],
            plan_cash_date: this.datePipe.transform(resp.data.DATA[0][14], 'dd/MM/yyyy'),

          });

        }


        if (resp.data.DATA[0][6] == 'Cheque') {
          let value = resp.data.DATA[0][6];

          this.onSelectPaymentPlanMode(value);

          this.paymentPlan_form.patchValue({
            payment_plan_chequeName: resp.data.DATA[0][7],
            payment_plan_chequeNo: resp.data.DATA[0][8],
            payment_plan_paidTo: resp.data.DATA[0][19],
            payment_plan_cheque_rec_date: this.datePipe.transform(resp.data.DATA[0][36], 'dd/MM/yyyy'),
          })
        }

        // if(resp.data.DATA[0][6] == 'Online'){
        //   let value = resp.data.DATA[0][6];

        //   this.onSelectPaymentPlanMode(value);

        //   this.paymentPlan_form.patchValue({

        //     online_transferred_from: resp.data.DATA[0][9],
        //     online_bank_name: resp.data.DATA[0][10],
        //     online_account_holder_name: resp.data.DATA[0][11],
        //     online_received_date: this.datePipe.transform(resp.data.DATA[0][12], 'dd/MM/yyyy'),

        //   });
        // }

        if (resp.data.DATA[0][6] == 'DD') {
          let value = resp.data.DATA[0][6];

          this.onSelectPaymentPlanMode(value);

          this.paymentPlan_form.patchValue({

            planDD_bank_name: resp.data.DATA[0][15],
            planDD_name_on_dd: resp.data.DATA[0][16],
            //  planDD_amount: resp.data.DATA[0][20],
            planDD_dd_number: resp.data.DATA[0][18],
            payment_plan_paidTo: resp.data.DATA[0][19],
          });
        }

        const reasonIds = Array.isArray(resp.data[20]) ? resp.data[20] : [];
        const amount = resp.data.DATA[0][3];
        const rotationAmount = resp.data.DATA[0][33];
        const showAmount = resp.data.DATA[0][35];
        const finalAmount = showAmount && showAmount !== 0 ? showAmount : amount;

        this.paymentPlan_form.patchValue({
          paymentPlan_id: resp.data.DATA[0][0],
          paymentPlan_booking_id: resp.data.DATA[0][2],
          paymentPlan_buyer_id: resp.data.DATA[0][1],
          paymentPlan_date: this.datePipe.transform(resp.data.DATA[0][4], 'dd/MM/yyyy'),
          // paymentPlan_amount: resp.data.DATA[0][3],
          paymentPlan_amount: finalAmount,
          paymentPlan_status: resp.data.DATA[0][5],
          paymentPlan_mode: resp.data.DATA[0][6],
          // paymentPlan_reason: resp.data.DATA[0][20],
          paymentPlan_reason: this.normalizeReason(resp.data.DATA[0][20])
          // payment_plan_paidTo: resp.data.DATA[0][19],


        });

        if (rotationAmount != null && rotationAmount !== '' && rotationAmount != 0) {
          this.paymentPlan_form.get('paymentPlan_amount')?.disable();
        } else {
          this.paymentPlan_form.get('paymentPlan_amount')?.enable();
        }
        // this.paymentPlan_form.get('paymentPlan_amount').disable();
      });


    }
  }

  private normalizeReason(value: any): any[] {
    if (Array.isArray(value)) {
      return value;
    } else if (typeof value === 'string' && value.includes(',')) {
      return value.split(',').map(item => item.trim());
    } else if (value) {
      return [value];
    } else {
      return [];
    }
  }

  // calculateTotalAmount(): number {
  //   if (!this.paymentplan) return 0;

  //   return this.paymentplan.reduce((accumulator, currentItem) => {
  //     const amount = typeof currentItem.amount === 'string' 
  //       ? parseFloat(currentItem.amount) 
  //       : currentItem.amount;

  //     return accumulator + (isNaN(amount) ? 0 : amount);
  //   }, 0);
  // }

  // calculateTotalAmountDetails(): string {
  //   if(!this.PaymentDetaildata) return '₹0.00';

  //   const total = this.PaymentDetaildata.reduce((accumulator,currentItem) => {
  //     const amount = typeof currentItem.trans_amount === 'string'
  //     ? parseFloat(currentItem.trans_amount)
  //     : currentItem.trans_amount;

  //     return accumulator + (isNaN(amount) ? 0: amount);
  //   }, 0);
  //   return new Intl.NumberFormat('en-IN', {
  //   style: 'currency',
  //   currency: 'INR'
  //   }).format(total);
  // }

  calculateTotalAmountDetails(): string {
    if (!this.PaymentDetaildata) return '₹0.00';

    const total = this.PaymentDetaildata.reduce((accumulator, currentItem) => {
      const transAmount = typeof currentItem.trans_amount === 'string'
        ? parseFloat(currentItem.trans_amount)
        : currentItem.trans_amount;

      const showAmount = typeof currentItem.show_amount === 'string'
        ? parseFloat(currentItem.show_amount)
        : currentItem.show_amount;

      let amountToAdd = 0;

      if (!isNaN(transAmount) && transAmount !== 0) {
        amountToAdd = transAmount;
      } else if (transAmount === 0 && !isNaN(showAmount) && showAmount !== 0) {
        amountToAdd = showAmount;
      }

      return accumulator + amountToAdd;
    }, 0);

    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(total);
  }

  calculateTotalAmount(): string {
    if (!this.paymentplan) return '₹0.00';

    const total = this.paymentplan.reduce((accumulator:any, currentItem:any) => {
      const transAmount = typeof currentItem.amount === 'string'
        ? parseFloat(currentItem.amount)
        : currentItem.amount;

      const showAmount = typeof currentItem.show_amount === 'string'
        ? parseFloat(currentItem.show_amount)
        : currentItem.show_amount;

      let amountToadd = 0;

      if (!isNaN(transAmount) && transAmount !== 0) {
        amountToadd = transAmount;
      } else if (transAmount === 0 && !isNaN(showAmount) && showAmount !== 0) {
        amountToadd = showAmount;
      }
      return accumulator + amountToadd;
    }, 0);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(total);
  }

  calculateTotRotAmnt(): string {
    if (!this.PaymentDetaildata || this.PaymentDetaildata.length === 0) {
      return this.indianCurrency(0);
    }

    const total = this.PaymentDetaildata.reduce((sum, item) => {
      const amt = parseFloat(item.rotation_amnt) || 0;  // Convert safely to number
      return sum + amt;
    }, 0);

    return this.indianCurrency(total);
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



  planDone(title: any, id: any, index: any) {

    this.isDone = true;
    // this.SaveViewForDone = true;
    let formData = new FormData();
    formData.append('id', id);

    this.billingservice.view(formData).pipe(takeUntil(this.destroy$)).subscribe((resp) => {

      if (resp.data.DATA[0][6] == 'Cheque') {
        this.isDDSelected = false;
        this.isCQSelected = true;
        let value = resp.data.DATA[0][6];

        this.onSelectDonePlanPaymentMode(value);

        this.plan_done_transaction_form.patchValue({
          plan_done_chequeName: resp.data.DATA[0][7],
          plan_done_chequeNumber: resp.data.DATA[0][8],
          plan_done_all_recieved_date: this.datePipe.transform(resp.data.DATA[0][36], 'dd/MM/yyyy'),
        });
      }

      if (resp.data.DATA[0][6] == 'Online') {
        this.isDDSelected = false;
        this.isCQSelected = false;
        let value = resp.data.DATA[0][6];

        this.onSelectDonePlanPaymentMode(value);

        this.plan_done_transaction_form.patchValue({

          plan_done_online_transferred_from: resp.data.DATA[0][9],
          plan_done_online_bank_name: resp.data.DATA[0][10],
          plan_done_online_acc_holder_name: resp.data.DATA[0][11],
          plan_done_online_recieved_date: this.datePipe.transform(resp.data.DATA[0][12], 'dd/MM/yyyy'),

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
        // this.plan_done_transaction_form.get('plan_done_transaction_accHSubHead').disable();
      }

      if (resp.data.DATA[0][6] == 'DD') {
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

      const amount = resp.data.DATA[0][3];
      const showAmount = resp.data.DATA[0][35];
      const finalAmount = showAmount && showAmount !== 0 ? showAmount : amount;

      this.plan_done_transaction_form.patchValue({
        done_transaction_id: resp.data.DATA[0][0],
        done_booking_id: resp.data.DATA[0][2],

        plan_done_transaction_date: this.datePipe.transform(resp.data.DATA[0][4], 'dd/MM/yyyy'),
        plan_done_chequeDate: this.datePipe.transform(resp.data.DATA[0][4], 'dd/MM/yyyy'),
        plan_done_transaction_mode: resp.data.DATA[0][6],
        // plan_done_amount: resp.data.DATA[0][3], 
        plan_done_amount: finalAmount,
        plan_done_status: resp.data.DATA[0][5],
        plan_done_recieved_by: resp.data.DATA[0][19],
        plan_done_rotation_amnt: resp.data.DATA[0][33],

      });

      this.setAmountFieldState();
      this.setCashValueDisabled();



      this.billingservice.checkview(formData).pipe(takeUntil(this.destroy$)).subscribe((resp) => {

        if (resp.data === true) {

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
              plan_done_cheque_bank_name: Response.DATA[0][8],
              plan_done_cheque_clear_date: this.datePipe.transform(Response.DATA[0][9], 'dd/MM/yyyy'),

              plan_done_online_transferred_from: Response.DATA[0][10],
              plan_done_online_bank_name: Response.DATA[0][11],
              plan_done_online_acc_holder_name: Response.DATA[0][12],
              plan_done_all_recieved_date: this.datePipe.transform(Response.DATA[0][13], 'dd/MM/yyyy'),

              plan_done_cash_submitted_by: Response.DATA[0][14],
              // plan_done_cash_date: this.datePipe.transform(Response.DATA[0][13], 'dd/MM/yyyy'),

              plan_done_dd_bank_name: Response.DATA[0][15],
              plan_done_dd_name: Response.DATA[0][16],
              plan_done_dd_number: Response.DATA[0][17],
              plan_done_dd_submit_date: this.datePipe.transform(Response.DATA[0][18], 'dd/MM/yyyy'),

              plan_done_status: Response.DATA[0][21],
              plan_done_amount: Response.DATA[0][19],
              plan_done_recieved_by: Response.DATA[0][20],
              plan_done_transaction_accHead: Response.DATA[0][22],
              plan_done_transaction_accHSubHead: Response.DATA[0][23], //this.getAccSubHead(Response.DATA[0][20])



            });
          });
        }

        else {

          this.plan_done_transaction_form.enable();
          this.isSave = true;
          // this.isChangeSave[index] = true;
          // this.isChangeSave = true;
          this.setAmountFieldState();
          this.setCashValueDisabled();
        }
      });

    });


  }

  redirectToTransactionPage(type:any, item_id:any) {

    if (!this.canAccessRotationTransaction()) {
      Swal.fire({
        icon: 'warning',
        title: 'Access Restricted',
        html: `
          <div style="font-size:14px;">
            You don’t have permission to enter these details.<br><br>
            Please contact the <b>Accounts department</b> to complete this process.
          </div>
        `,
        confirmButtonText: 'OK',
        confirmButtonColor: '#f39c12'
      });
      return;
    }


    const prsnId = this.Activatedroute.snapshot.paramMap.get('prsn_id') || this.prsn_id || '';
    const selectedPlan = this.paymentplan?.find((item: any) => item.id === item_id) || {};
    const fallbackAmount = selectedPlan.show_amount && selectedPlan.show_amount !== 0 ? selectedPlan.show_amount : selectedPlan.amount;

    const formData = new FormData();
    formData.append('id', item_id);

    this.billingservice.view(formData).pipe(takeUntil(this.destroy$)).subscribe((resp) => {
      const responseData: any = {};


      for (let i = 0; i < resp.data.COLUMNS.length; i++) {
        responseData[resp.data.COLUMNS[i]] = resp.data.DATA[0][i];
      }

      const amount = resp.data.DATA[0][35] && resp.data.DATA[0][35] !== 0 ? resp.data.DATA[0][35] : resp.data.DATA[0][3];
      const mode = resp.data.DATA[0][6] || selectedPlan.mode || '';
      const chequeNumber = resp.data.DATA[0][8] || '';
      const chequeBankName = resp.data.DATA[0][7] || '';


      this.router.navigate(
        ['/reg-trans-list'],
        {
          queryParams: {
            tab: 'icm',
            icmTab: 'customer',
            openModal: 'add',
            source: 'paymentPlanRotation',
            action: type,
            bookingId: this.id,
            buyerId: this.prsn_id,
            buyerName: this.buyer_form.get('buyer_name')?.value || '',
            paymentPlanId: item_id,
            prsn_id: prsnId,
            amount: amount || fallbackAmount || '',
            mode: mode,
            chequeBankName: chequeBankName,
            chequeNumber: chequeNumber
          }
        }
      );
    }, () => {
      this.router.navigate(
        ['/reg-trans-list'],
        {
          queryParams: {
            tab: 'icm',
            icmTab: 'customer',
            openModal: 'add',
            source: 'paymentPlanRotation',
            action: type,
            bookingId: this.id,
            buyerId: this.prsn_id,
            buyerName: this.buyer_form.get('buyer_name')?.value || '',
            paymentPlanId: item_id,
            prsn_id: prsnId,
            amount: fallbackAmount || '',
            mode: selectedPlan.mode || '',
            chequeBankName: selectedPlan.chequeName || selectedPlan.payment_plan_chequeName || '',
            chequeNumber: selectedPlan.chequeNo || ''
          }
        }
      );
    });
  }

  canAccessRotationTransaction() {
    return this.Admin || this.Administrator || this.Accountant;
  }

  setCashValueDisabled() {
    const Paymode = this.plan_done_transaction_form.get('plan_done_transaction_mode')?.value;
    if (Paymode == 'Cash') {
      this.plan_done_transaction_form.get('plan_done_transaction_accHead')?.disable();
      this.plan_done_transaction_form.get('plan_done_transaction_accHSubHead')?.disable();
    } else {
      this.plan_done_transaction_form.get('plan_done_transaction_accHead')?.enable();
      this.plan_done_transaction_form.get('plan_done_transaction_accHSubHead')?.enable();
    }
  }


  setAmountFieldState() {
    const rotationAmount = this.plan_done_transaction_form.get('plan_done_rotation_amnt')?.value;

    if (rotationAmount != null && rotationAmount !== '' && rotationAmount != 0) {
      this.plan_done_transaction_form.get('plan_done_amount')?.disable();
    } else {
      this.plan_done_transaction_form.get('plan_done_amount')?.enable();
    }
  }


  DeletePaymentPlan(id:any) {
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
        // transation_form.append("mode", this.paymentPlan_form.get("paymentPlan_mode").value);
        transation_form.append("id", id);
        this.billingservice.deletePaymentPlan(id).pipe(takeUntil(this.destroy$)).subscribe(Response => {
          if (Response) {
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'Payment Deleted Sucessfully',
              showConfirmButton: false,
              timer: 2000
            });
            this.reload();
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



  witnessdatatableCode() {
    this.witDatatableParameter.person_type = "Witness";
    this.witDatatableParameter.booking_id = this.id;
    const that = this;
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });
    this.dtOptions1 = {
      processing: true,
      serverSide: true,
      pageLength: 5,
      dom: 'lrtip',
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
      columnDefs: [
        { orderable: false, targets: 4 }
      ],
      ajax: (dataTablesParameters: any, callback) => {
        // Object.assign(dataTablesParameters, this.witDatatableParameter);
        that.http.post<DataTablesResponse>(environment.APIEndpoint + 'booking.fetchBookingDetails&reload=1', Object.assign(dataTablesParameters, this.witDatatableParameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {
          that.witdata = resp.data;

          callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsTotal,
            data: []
          });
        });
      }
    };
  }




  openTransactionModel() {
  }


  openModalButton(type:any, id = "") {
    this.modalTitle = type;
    this.submit_btn = false;
    this.isButtonDisabled = false;
    this.labelImport_arr[4].nativeElement.innerText = 'Upload Aadhar Photo';
    this.labelImport_arr[5].nativeElement.innerText = 'Upload Pan Card Photo';
    this.witness_form.reset();
    this.customerdataList = [];
    this.isView = false;
    this.plan_save_transaction_form.enable();
    this.plan_save_transaction_form.reset();

    // this.PaymentModal.nativeElement.click();
    this.plan_save_transaction_form.get('plan_save_transaction_date')?.disable();
    type.includes('View') ? (this.witness_form.disable()) : (this.witness_form.enable(), this.isView = true);
    if (id && (type.includes('Edit') || type.includes('View'))) {

      let formdata = new FormData();
      formdata.append('regPersonsID', id);
      formdata.append('regDetailID', this.prsn_id);
      this.billingservice.view_buyer_seller_witness(formdata).pipe(takeUntil(this.destroy$)).subscribe(res => {
        this.witness_form.patchValue({
          witness_id: res.data[0].regPersonsID,
          witness_aadhar: res.data[0].aadhar_number,
          witness_aadhar_img: '',
          witness_address: res.data[0].address,
          witness_altr_mobile: res.data[0].alt_number,
          witness_age: res.data[0].age,
          witness_caste: res.data[0].caste,
          witness_city: res.data[0].city,
          witness_country: res.data[0].country,
          witness_mobile: res.data[0].mobile_number,
          witness_name: res.data[0].name,
          witness_occupation: res.data[0].occupation,
          witness_pan: res.data[0].pan_number,
          witness_pan_img: '',
          witness_state: res.data[0].state,
          witness_title: res.data[0].title,
          witness_spouse: res.data[0].guardian_name,
          witness_caretaker: res.data[0].guardian_type,
          witness_pincode: res.data[0].zipcode,
          witness_district: res.data[0].district,
          witness_tehsil: res.data[0].tah,
        });
      });
    }
  }

  save_modal(id:any) {
    this.submit_btn = true;
    if (this.witness_form.valid) {

      let pre_type = this.modalTitle.includes("Buyer") ? "Buyer" : (this.modalTitle.includes("Seller") ? "Seller" : (this.modalTitle.includes("Witness") ? "Witness" : ""));
      let name = typeof this.witness_form.value.witness_name == "object" ? this.witness_form.value.witness_name.name : this.witness_form.value.witness_name;
      let formData = new FormData();
      formData.append("regPersonsID", this.witness_form.value.witness_id);
      formData.append("Title", this.witness_form.value.witness_title);
      formData.append("Caste", this.witness_form.value.witness_caste);
      formData.append("Guardian_type", this.witness_form.value.witness_caretaker);
      formData.append("Guardian_name", this.witness_form.value.witness_spouse);
      formData.append("Occupation", this.witness_form.value.witness_occupation);
      formData.append("Aadhar_number", this.witness_form.value.witness_aadhar);
      formData.append("Pan_number", this.witness_form.value.witness_pan);
      formData.append("Mobile_number", this.witness_form.value.witness_mobile);
      formData.append("Alt_number", this.witness_form.value.witness_altr_mobile);
      formData.append("Address", this.witness_form.value.witness_address);
      formData.append("City", this.witness_form.value.witness_city);
      formData.append("State", this.witness_form.value.witness_state);
      formData.append("Country", this.witness_form.value.witness_country);
      formData.append("CustName", name);
      formData.append("Age", this.witness_form.value.witness_age);
      formData.append("Zipcode", this.witness_form.value.witness_pincode);
      formData.append("District", this.witness_form.value.witness_district);
      formData.append("Tehsil", this.witness_form.value.witness_tehsil);
      formData.append("BookingId", this.id);
      formData.append("Person_type", pre_type);


      this.billingservice.add_edit_buyer_seller_witness(formData).pipe(takeUntil(this.destroy$)).subscribe(res => {

        if (res.CODE == 200) {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Added Successfully',
            showConfirmButton: false,
            timer: 1000
          }).then(() => {
            // this.rerender();
            this.reload();
            this.closeModal();
          })
        }
        else {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Something went wrong',
            showConfirmButton: false,
            timer: 2000
          })
        }
        this.submit_btn = false;
        this.closeModal();
      });


    }

    else {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Please fill all the fields',
        showConfirmButton: true,
        // timer:2000
      })
    }


  }
  Newattachmentadd() {
    // this.reload();
    this.attachmentModalHadding = 'Add New Attachment'
    this.attachmentModalButton.nativeElement.click();
  }

  attachmentSubmit() {


    if (this.attachmenDetails.valid) {
      this.attachmentSubmitted = false;
      let attachment = new FormData();
      attachment.append('reg_attach_id', this.attachmenDetails.get('attachmeid_id')?.value);
      attachment.append('edit_reg_attach_id', this.currentAttachId);

      attachment.append('attachmentimage', this.filecontent);
      attachment.append('attachmentimagename', this.attachmentimageName);
      attachment.append('attachmentstatus', this.attachmenDetails.get('attachmentstatus')?.value);
      attachment.append('fileuploads', this.fileuploads);
      attachment.append('booking_id', this.id);
      attachment.append('USERID', this.jwttoken.USERID);
      attachment.append('COMPANYID', this.jwttoken.COMPANYID);
      attachment.append('attachment_type', 'Reg_Attachment');

      this.productservice.addattachment(attachment).pipe(takeUntil(this.destroy$)).subscribe(Response => {


        if (Response) {
          Swal.fire({
            icon: 'success',
            title: 'Successfully Attached!',
            text: Response.MESSAGE,
            showConfirmButton: false,
            timer: 2000
          });
          this.attachmenDetails.reset();
          this.reload();
          this.attachmentclosebutton.nativeElement.click();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Reg Attachment integration Failed',
            showConfirmButton: false,
            timer: 3000
          });
        }
      });
    } else {
      this.attachmentSubmitted = true;
      Swal.fire({
        icon: 'error',
        title: 'Required fields empty',
        text: 'Please enter the mandatory fields',
        showConfirmButton: false,
        timer: 3000
      });
    }

  }

  editAttachment(attach_id:any) {


    this.attachmentstatus = "Update"
    this.attachmentModalHadding = 'Edit Attachment'
    this.attachmentModalButton.nativeElement.click();

    this.hrservice.reg_attachmentsdata(attach_id).pipe(takeUntil(this.destroy$)).subscribe(Response => {


      this.attachmenDetails.patchValue({
        attachmeid_id: Response.DATA[0][0],

        // attachmentimage : attachmentData,
        // attachmentimageName : Response.DATA[0][2]
      });
      this.filecontent = Response.DATA[0][3],
        this.attachmentimageName = Response.DATA[0][2]
      this.labelImport_doc.nativeElement.innerText = Response.DATA[0][2]

    });

    this.currentAttachId = attach_id;


  }

  Deleteattachment(reg_attach_id:any) {

    let removeEnquiryData = new FormData();
    removeEnquiryData.append('reg_attach_id', reg_attach_id);
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.value) {
        this.productservice.deleteEnquiryattachment(removeEnquiryData).pipe(takeUntil(this.destroy$)).subscribe(Response => {

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

  viewAttchement(path: any, type: any) {
    window.open(environment.APIEndpoint + 'product.download&path=' + path + '&type=' + type + '&token=' + sessionStorage.getItem('token') + '&reload=1', "_blank");
  }

  // viewAttchement(path: string, type: string) {
  //   const formData = new FormData();
  //   formData.append('path', path);
  //   formData.append('type', type);

  //   const xhr = new XMLHttpRequest();
  //   xhr.open('POST', environment.APIEndpoint + `product.viewOrDownloadImage&reload=1`, true);
  //   xhr.responseType = 'blob';

  //   xhr.onload = function () {
  //     if (xhr.status === 200) {
  //       const mimeType = xhr.getResponseHeader('Content-Type') || 'image/jpeg';
  //       const blob = new Blob([xhr.response], { type: mimeType });
  //       const blobUrl = URL.createObjectURL(blob);

  //       if (type === 'view') {       
  //         window.open(blobUrl, '_blank');
  //       } else {
  //         // Force download
  //         const link = document.createElement('a');
  //         link.href = blobUrl;
  //         link.download = path.split('/').pop() || 'downloaded-image.jpg';
  //         document.body.appendChild(link);
  //         link.click();
  //         document.body.removeChild(link);
  //       }
  //     } else {
  //       console.error('Failed to fetch image. Status:', xhr.status);
  //     }
  //   };

  //   xhr.onerror = function () {
  //     console.error('An error occurred while downloading/viewing the image.');
  //   };

  //   xhr.send(formData);
  // }




  attachmentdatatabl() {

    this.attachmentDatatableParameter.person_type = "Attachtment";
    this.attachmentDatatableParameter.booking_id = this.id;

    const that = this;
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });
    this.dtOptions2 = {
      processing: true,
      serverSide: true,
      dom: 'lrtip',
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
      // columnDefs: [
      //     { orderable: false, targets: 9 }
      // ],
      ajax: (dataTablesParameters: any, callback) => {
        Object.assign(dataTablesParameters, this.attachmentDatatableParameter);
        that.http.post<DataTablesResponse>(environment.APIEndpoint + 'booking.fetch_regAttachment&reload=1', Object.assign(dataTablesParameters, {}), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {


          that.attachmentdata = resp.data;

          callback({ recordsTotal: resp.recordsTotal, recordsFiltered: resp.recordsTotal, data: [] });
        });
      }
    };
  }


  AttachmentImage(files: FileList, event:any) {

    this.labelImport_doc.nativeElement.innerText = Array.from(files)
      .map(f => f.name)
      .join(', ');
    this.filecontent = event.target.files[0];

    this.attachmentimageName = this.filecontent.name;

    this.fileuploads = "regAttach";

    this.reload();
  }

  reload() {


    this.dtElement.forEach((item: any) =>
      Object.keys(item.dtInstance).length ?
        item.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.ajax.reload();
        }) : ''

    );
    // this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
    //   dtInstance.ajax.reload();
    // });
  }







  // focusout_fun(value){

  //   let flg = true;
  //   // if(value.length>0 && typeof value == 'string'){
  //   //   for (let i=0; i<this.customerdataList.length; i++){
  //   //     if(this.customerdataList[i].name == value){
  //   //       flg = false;
  //   //       break;
  //   //     }
  //   //   }
  //   // }
  //   if(value.length>0 && typeof value == 'object'){
  //     flg = false;
  //   }
  //   if(flg==true){
  //     Swal.fire({
  //       title: 'Error',
  //       text: 'Please Enter Valid Customer Name',
  //       icon: 'error',
  //     }).then(() => {
  //       this.Seller_form.controls.seller_name.setValue('');
  //     });
  //   }
  // }

  onTabClick(): void {

    // let patchData = new FormData();
    // patchData.append('regDetailID', this.id);
    // patchData.append('regPersonsID', this.prsn_id);
    // 

    // this.billingservice.getOnlySellerData(patchData).subscribe(resp => {
    //   
    //   if(resp.data){
    //     this.Seller_form.patchValue({
    //       seller_title: resp.data[0].title,
    //       seller_name: resp.data[0].name,
    //       seller_area: resp.data[0].district,
    //       seller_caste: resp.data[0].caste,
    //       seller_mobile: resp.data[0].mobile_number,
    //       seller_altr_mobile: resp.data[0].alt_number,
    //       seller_aadhar: resp.data[0].aadhar_number,
    //       seller_pan: resp.data[0].pan_number,
    //       seller_address: resp.data[0].address,
    //       seller_city: resp.data[0].city,
    //       seller_country: resp.data[0].country,
    //       seller_state: resp.data[0].state,
    //     })
    //   }
    // });
  }

  editReg(id:any, prsn_id:any) {

    let patchbData = new FormData();
    patchbData.append('regDetailID', id);
    patchbData.append('regPersonsID', prsn_id);
    this.billingservice.fetch_regdata(patchbData).pipe(takeUntil(this.destroy$)).subscribe(Response => {

      if (Response.data) {
        this.regDetailForm.patchValue({
          BuyerName: Response.data[0].buyerName,
          regDetailID: Response.data[0].id,
          regPersonsID: Response.data[0].regPersonsID,
          regbkngDate: Response.data[0].booking_date,
          regDate: Response.data[0].registry_date,
          RegStage: Response.data[0].stage,
          RegStatus: Response.data[0].stage_status,
          PaymentStatus: Response.data[0].payment_status,
          PaymentPlan: Response.data[0].payment_plan,
          totalAmount: this.toMoneyString(Response.data[0].total_amount),
          amount_per_sqft: this.toMoneyString(Response.data[0].amount_per_sqft),
          // bkPlotSize: plotSize,
          reg_remarks: Response.data[0].remarks,
          discountAmount: this.toMoneyString(Response.data[0].discount),
          plotLength: Response.data[0].plot_length,
          plotDepth: Response.data[0].plot_depth,
        }, { emitEvent: false });
        this.regDetailForm.get('bkPlotSize')?.disable({ emitEvent: false });
      }

      this.regMeasurement.get('totalAmountSqftValue')?.setValue(this.regDetailForm.get('amount_per_sqft')?.value, { emitEvent: false });
      this.regMeasurement.get('totalAmountValue')?.setValue(this.regDetailForm.get('totalAmount')?.value, { emitEvent: false });

    })


    this.billingservice.getAllPaidAmntValue(patchbData).pipe(takeUntil(this.destroy$)).subscribe(resp => {

      const discountValue = this.toMoney(this.regDetailForm.get('discountAmount')?.value);
      const totAmnt = this.toMoney(this.regDetailForm.get('totalAmount')?.value);
      const remAmnt = this.toMoney(totAmnt - (this.toMoney(resp.DATA[0][0]) + discountValue));

      this.regDetailForm.patchValue({
        remainingAmount: this.toMoneyString(remAmnt),
      }, { emitEvent: false });
    });

  }

  onchangeDiscount(event: Event) {
    const discountValue = this.toMoney((event.target as HTMLSelectElement).value);
    const totAmnt = this.toMoney(this.regDetailForm.get('totalAmount')?.value);
    const paidAmount = this.toMoney(this.regDetailForm.get('paidAmount')?.value);

    if (this.isPaidAmountValid(totAmnt, paidAmount, discountValue)) {
      this.regDetailForm.patchValue({ discountAmount: this.toMoneyString(discountValue) }, { emitEvent: false });
      this.updateRemainingAmount(totAmnt);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Paid Amount Should be Less than or Equal To Total Amount',
        showConfirmButton: false,
        timer: 3000
      });
    }
  }

  onChangePlotAmt(e: any): void {
    const plotSqft = this.toNumberLoose(this.regDetailForm.get('bkPlotSize')?.value);
    const plotAmt = this.toMoney(this.regDetailForm.get('amount_per_sqft')?.value);
    const paidAmount = this.toMoney(this.regDetailForm.get('paidAmount')?.value);
    const discountValue = this.toMoney(this.regDetailForm.get('discountAmount')?.value);

    const plotTotalAmount = this.toMoney(plotSqft * plotAmt);
    if (this.isPaidAmountValid(plotTotalAmount, paidAmount, discountValue)) {
      this.regDetailForm.patchValue({
        amount_per_sqft: this.toMoneyString(plotAmt),
        totalAmount: this.toMoneyString(plotTotalAmount)
      }, { emitEvent: false });
      this.updateRemainingAmount(plotTotalAmount);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Paid Amount Should be Less than or Equal To Total Amount',
        showConfirmButton: false,
        timer: 3000
      });
    }
  }

  onChangeperSqft(e: any): void {
    const plotSize = this.toNumberLoose(this.regDetailForm.get('bkPlotSize')?.value);
    const totalAmnt = this.toMoney(this.regDetailForm.get('totalAmount')?.value);
    const paidAmount = this.toMoney(this.regDetailForm.get('paidAmount')?.value);
    const discountValue = this.toMoney(this.regDetailForm.get('discountAmount')?.value);

    if (!plotSize || !totalAmnt) {
      this.updateRemainingAmount(totalAmnt);
      return;
    }

    if (this.isPaidAmountValid(totalAmnt, paidAmount, discountValue)) {
      const setPerSqftValue = this.toMoney(totalAmnt / plotSize);
      this.regDetailForm.patchValue({
        amount_per_sqft: this.toMoneyString(setPerSqftValue)
      }, { emitEvent: false });
      this.updateRemainingAmount(totalAmnt);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Paid Amount Should be Less than or Equal To Total Amount',
        showConfirmButton: false,
        timer: 3000
      });
    }
  }


  accheadData(acc_head: any) {

    let acc_headData = { acc_head };
  }

  ViewPaymentDetail(title: any, trans_id: any) {

    this.modalTitle = title;
    this.submit_btn = false;
    this.isButtonDisabled = false;
    this.plan_save_transaction_form.reset();
    this.isView = false;

    this.modalTitle.includes('View')
      ? this.plan_save_transaction_form.disable()
      : (this.plan_save_transaction_form.enable(), this.isView = true);

    this.billingservice.view_PaymentDetail(trans_id).pipe(takeUntil(this.destroy$)).subscribe(Response => {

      // ✅ FIX: Safety check
      if (!Response || !Response.DATA || !Response.DATA.length) {
        Swal.fire('Error', 'No data found', 'error');
        return;
      }

      // ✅ FIX: Convert array → object (VERY IMPORTANT)
      const data: any = {};
      Response.COLUMNS.forEach((col:any, i:any) => {
        data[col] = Response.DATA[0][i];
      });

      // ================= MODE HANDLING =================

      if (data.trans_mode === 'Online') {
        this.isDDSelected = false;
        this.isCQSelected = false;
        this.onSelectPlanPaymentMode('Online');

        this.plan_save_transaction_form.patchValue({
          plan_save_online_transferred_from: data.trans_online_transferred_from,
          plan_save_online_bank_name: data.trans_online_bank_name,
          plan_save_online_acc_holder_name: data.trans_online_acc_holder_name,
        });
      }

      if (data.trans_mode === 'Cash') {
        this.isDDSelected = false;
        this.isCQSelected = false;
        this.onSelectPlanPaymentMode('Cash');

        this.plan_save_transaction_form.patchValue({
          plan_save_transaction_mode: 'Cash',
          plan_save_cash_submitted_by: data.trans_cash_submitted_by,
        });
      }

      if (data.trans_mode === 'DD') {
        this.isDDSelected = true;
        this.isCQSelected = false;
        this.onSelectPlanPaymentMode('DD');

        this.plan_save_transaction_form.patchValue({
          plan_save_dd_bank_name: data.trans_dd_bank_name,
          plan_save_dd_name: data.trans_dd_name,
          plan_save_dd_number: data.trans_dd_number,

          plan_save_dd_submit_date: data.trans_dd_submit_date
            ? this.datePipe.transform(data.trans_dd_submit_date, 'dd/MM/yyyy')
            : null,

          plan_save_dd_clear_date: data.trans_cheque_clear_date
            ? this.datePipe.transform(data.trans_cheque_clear_date, 'dd/MM/yyyy')
            : null,
        });
      }

      if (data.trans_mode === 'Cheque') {
        this.isDDSelected = false;
        this.isCQSelected = true;
        this.onSelectPlanPaymentMode('Cheque');

        this.plan_save_transaction_form.patchValue({
          plan_save_chequeNumber: data.trans_cheque_number,

          plan_save_chequeDate: data.trans_cheque_date
            ? this.datePipe.transform(data.trans_cheque_date, 'dd/MM/yyyy')
            : null,

          plan_save_chequeSubmitDate: data.trans_cheque_submit_date
            ? this.datePipe.transform(data.trans_cheque_submit_date, 'dd/MM/yyyy')
            : null,

          plan_save_chequeClearDate: data.trans_cheque_clear_date
            ? this.datePipe.transform(data.trans_cheque_clear_date, 'dd/MM/yyyy')
            : null,

          plan_save_chequeName: data.trans_cheque_name,
        });
      }

      // ================= COMMON =================

      this.previousamount = Number(data.trans_amount || 0);

      this.previousTransactionMeta = {
        acc_head: data.trans_acc_head,
        subhead: data.trans_acc_subhead,
        bank_name: data.trans_cheque_bank_name
      };

      this.plan_save_transaction_form.patchValue({

        plan_transaction_id: data.transaction_id,
        plan_save_transaction_booking_id: data.trans_booking_id,

        plan_save_transaction_date: data.trans_date
          ? this.datePipe.transform(data.trans_date, 'dd/MM/yyyy')
          : null,

        plan_save_transaction_mode: data.trans_mode,
        plan_save_status: data.trans_status,
        plan_save_amount: data.trans_amount,
        plan_save_recieved_by: data.trans_recieved_by,
        plan_save_transaction_accHead: data.trans_acc_head,
        plan_save_transaction_accHSubHead: data.trans_acc_subhead,
        plan_save_cheque_bank_name: data.trans_cheque_bank_name,

        plan_save_all_recieved_date: data.trans_all_recieved_date
          ? this.datePipe.transform(data.trans_all_recieved_date, 'dd/MM/yyyy')
          : null,
      });
    });
  }


  updateBookingDetail(): boolean {
    // this.isChecked = false;
    this.submitted = false;
    //if(this.Seller_form.valid){
    let bookingData: any = new FormData();

    bookingData.append('regDetailID', this.regDetailForm.get('regDetailID')?.value);
    bookingData.append('regPersonsID', this.regDetailForm.get('regPersonsID')?.value);

    bookingData.append('regbkngDate', this.regDetailForm.get('regbkngDate')?.value);
    bookingData.append('regDate', this.regDetailForm.get('regDate')?.value);
    bookingData.append('reg_remarks', this.regDetailForm.get('reg_remarks')?.value);
    bookingData.append('RegStage', this.regDetailForm.get('RegStage')?.value);
    bookingData.append('RegStatus', this.regDetailForm.get('RegStatus')?.value);
    bookingData.append('PaymentPlan', this.regDetailForm.get('PaymentPlan')?.value);

    bookingData.append('bkPlotSize', this.regDetailForm.get('bkPlotSize')?.value);
    bookingData.append('bkPlotLength', this.regDetailForm.get('plotLength')?.value);
    bookingData.append('bkPlotDepth', this.regDetailForm.get('plotDepth')?.value);
    bookingData.append('bkAmountPerSqft', this.toMoneyString(this.regDetailForm.get('amount_per_sqft')?.value));
    bookingData.append('totalAmount', this.toMoneyString(this.regDetailForm.get('totalAmount')?.value));
    bookingData.append('buyerName', this.regDetailForm.get('BuyerName')?.value);
    // bookingData.append('PaymentStatus', this.regDetailForm.get('PaymentStatus').value);
    // bookingData.append('PaymentPlan', this.regDetailForm.get('PaymentPlan').value);

    const totAmnt = this.toMoney(this.regDetailForm.get('totalAmount')?.value);
    const paidAmnt = this.toMoney(this.regDetailForm.get('paidAmount')?.value);
    const discountValue = this.toMoney(this.regDetailForm.get('discountAmount')?.value);

    if (this.isPaidAmountValid(totAmnt, paidAmnt, discountValue)) {
      this.regDetailForm.patchValue({
        amount_per_sqft: this.toMoneyString(this.regDetailForm.get('amount_per_sqft')?.value),
        totalAmount: this.toMoneyString(totAmnt),
        paidAmount: this.toMoneyString(paidAmnt),
        discountAmount: this.toMoneyString(discountValue)
      }, { emitEvent: false });
      this.updateRemainingAmount(totAmnt);

      this.billingservice.updated_BookingDetail(bookingData).pipe(takeUntil(this.destroy$)).subscribe((Response) => {
        if (Response) {
          this.router.onSameUrlNavigation = 'reload';
          this.ngOnInit();
        }
      });
      return true;
    }
    else {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Paid Amount Should be Less than or Equal To Total Amount',
        showConfirmButton: false,
        timer: 3000
      });
      return false;
    }


  }

  updateBookingDetailBuyer() {
    Swal.fire({
      title: 'Are you sure you want to save these details?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, save it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {

        // this.isChecked = false;
        this.submitted = false;
        //if(this.Seller_form.valid){
        let bookingData: any = new FormData();


        bookingData.append('id', this.buyer_form.get('buyer_id')?.value);
        bookingData.append('booking_id', this.buyer_form.get('booking_id')?.value);
        bookingData.append('company_id', this.buyer_form.get('company_id')?.value);
        bookingData.append('id', this.buyer_form.get('buyer_id')?.value);
        bookingData.append('person_type', 'Buyer');
        bookingData.append('title', this.buyer_form.get('buyer_title')?.value);
        bookingData.append('name', this.buyer_form.get('buyer_name')?.value);


        bookingData.append('mobile_number', this.buyer_form.get('buyer_mobile')?.value);
        bookingData.append('caste', this.buyer_form.get('buyer_caste')?.value);
        bookingData.append('alt_number', this.buyer_form.get('buyer_altr_mobile')?.value);
        bookingData.append('guardian_name', this.buyer_form.get('buyer_spouse')?.value);
        bookingData.append('guardian_type', this.buyer_form.get('buyer_caretaker')?.value);
        bookingData.append('occupation', this.buyer_form.get('buyer_occupation')?.value);
        bookingData.append('aadhar_Number', this.buyer_form.get('buyer_aadhar')?.value);
        bookingData.append('buyer_aadhar_img', this.buyer_form.get('buyer_aadhar_img')?.value);
        bookingData.append('pan_number', this.buyer_form.get('buyer_pan')?.value);
        bookingData.append('buyer_pan_img', this.buyer_form.get('buyer_pan_img')?.value);
        bookingData.append('address', this.buyer_form.get('buyer_address')?.value);
        bookingData.append('country', this.buyer_form.get('buyer_country')?.value);
        bookingData.append('state', this.buyer_form.get('buyer_state')?.value);
        bookingData.append('city', this.buyer_form.get('buyer_city')?.value);
        bookingData.append('created_by', this.buyer_form.get('created_by')?.value);
        bookingData.append('created_dt', this.buyer_form.get('created_dt')?.value);
        bookingData.append('updated_By', this.buyer_form.get('updated_By')?.value);
        bookingData.append('updated_Dt', this.buyer_form.get('updated_Dt')?.value);
        bookingData.append('buyer_area', this.buyer_form.get('buyer_area')?.value);


        const isBookingValid = this.updateBookingDetail();
        if (!isBookingValid) {
          return;
        }

        this.billingservice.updatebookingBuyerSeller(bookingData).pipe(takeUntil(this.destroy$)).subscribe((Response) => {
          if (Response == true) {

            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: Response.MESSAGE,
              showConfirmButton: false,
              timer: 2000,

            }).then(() => {

              // this.rerender();
              // this.reload();
              this.router.onSameUrlNavigation = 'reload';
              this.ngOnInit();

              //  window.location.reload();
              // this.router.navigate(['/reg-record']);
            });

          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: 'Booking Creation Failed',
              showConfirmButton: false,
              timer: 3000
            });
          }
        });

      } else {
        Swal.fire({
          icon: 'info',
          title: 'Cancelled',
          text: 'No changes were made.',
          showConfirmButton: false,
          timer: 1500
        });
      }
    });


  }
  updateBookingDetailSeller() {
    // this.isChecked = false;
    this.submitted = false;
    //if(this.Seller_form.valid){
    let bookingData: any = new FormData();


    bookingData.append('id', this.Seller_form.get('seller_id')?.value);
    bookingData.append('company_id', this.Seller_form.get('company_id')?.value);
    bookingData.append('booking_id', this.Seller_form.get('booking_id')?.value);
    bookingData.append('person_type', 'seller');
    bookingData.append('title', this.Seller_form.get('seller_title')?.value);
    bookingData.append('name', this.Seller_form.get('seller_name')?.value);

    bookingData.append('mobile_number', this.Seller_form.get('seller_mobile')?.value);
    bookingData.append('caste', this.Seller_form.get('seller_caste')?.value);
    bookingData.append('alt_number', this.Seller_form.get('seller_altr_mobile')?.value);

    bookingData.append('occupation', this.Seller_form.get('seller_occupation')?.value);
    bookingData.append('aadhar_Number', this.Seller_form.get('seller_aadhar')?.value);
    bookingData.append('Seller_aadhar_img', this.Seller_form.get('seller_aadhar_img')?.value);
    bookingData.append('pan_number', this.Seller_form.get('seller_pan')?.value);
    bookingData.append('Seller_pan_img', this.Seller_form.get('seller_pan_img')?.value);
    bookingData.append('address', this.Seller_form.get('seller_address')?.value);
    bookingData.append('country', this.Seller_form.get('seller_country')?.value);
    bookingData.append('state', this.Seller_form.get('seller_state')?.value);
    bookingData.append('city', this.Seller_form.get('seller_city')?.value);
    bookingData.append('created_by', this.Seller_form.get('created_by')?.value);
    bookingData.append('created_dt', this.Seller_form.get('created_dt')?.value);
    bookingData.append('updated_By', this.Seller_form.get('updated_By')?.value);
    bookingData.append('updated_Dt', this.Seller_form.get('updated_Dt')?.value);

    const isBookingValid = this.updateBookingDetail();
    if (!isBookingValid) {
      return;
    }

    this.billingservice.updatebookingBuyerSeller(bookingData).pipe(takeUntil(this.destroy$)).subscribe((Response) => {
      if (Response == true) {

        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: Response.MESSAGE,
          showConfirmButton: false,
          timer: 2000
        });
        //this.Seller_form.reset();
        //this.regDetailForm.reset();
        //this.router.navigate(['/-record']);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Booking Creation Failed',
          showConfirmButton: false,
          timer: 3000
        });
      }
    })


  }

  ExportTOExcel() {

    this.DatatableParameter.person_type = "Buyer";
    this.DatatableParameter.booking_id = this.id;

    this.booking_id = this.DatatableParameter.booking_id


    const buyName = this.buyer_form.value.buyer_name;



    const formData = new FormData();


    if (this.booking_id) {
      formData.append('booking_id', this.booking_id);
    }

    const xhr = new XMLHttpRequest();
    xhr.open('POST', environment.APIEndpoint + `booking.Reg_excelData&reload=1`, true);
    xhr.responseType = 'blob';
    xhr.onload = function () {
      if (xhr.status === 200) {
        const blob = new Blob([xhr.response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
        saveAs(blob, buyName + '.xlsx');

      } else {
        console.error('Unexpected response status:', xhr.status);
      }
    };

    xhr.onerror = function () {
      console.error('An error occurred during the transaction');
    };

    xhr.send(formData);

  }


  // onChangeSizeValue(e: any): void {

  //   if (this.regMeasurement.get('mSize').value != 0) {

  //     const mSizeValue = this.regMeasurement.get('mSize').value;
  //     const [length, depth] = mSizeValue.split('*');
  //     let updateSize = length * depth;

  //     this.regMeasurement.get('mRakba').setValue(updateSize);
  //     const updatePlotSize = this.regMeasurement.get('mRakba').value;
  //     this.regDetailForm.get('bkPlotSize').setValue(updatePlotSize);
  //     this.regDetailForm.get('plotLength').setValue(length);
  //     this.regDetailForm.get('plotDepth').setValue(depth);

  //   } else if (this.regMeasurement.get('mSize').value == 0 || this.regMeasurement.get('mSize').value == '') {

  //     this.regMeasurement.get('mRakba').setValue(0);
  //     this.regDetailForm.get('bkPlotSize').setValue(0);
  //   }
  // }

  updateRegDetailsMeasurement() {

    this.submitted = false;
    let bookingData: any = new FormData();
    let rakba = this.regMeasurement.get('mRakba')?.value;
    let billDate = this.regMeasurement.get('mBill')?.value;

    this.regDetailForm.get('bkPlotSize')?.setValue(rakba);
    this.regDetailForm.get('regbkngDate')?.setValue(billDate);
    let rakbaPlotSize = this.regDetailForm.get('bkPlotSize')?.value;
    let billDateBkngDate = this.regDetailForm.get('regbkngDate')?.value;

    bookingData.append('regDetailID', this.regDetailForm.get('regDetailID')?.value);
    bookingData.append('regPersonsID', this.regDetailForm.get('regPersonsID')?.value);

    bookingData.append('regbkngDate', billDateBkngDate);
    bookingData.append('regDate', this.regDetailForm.get('regDate')?.value);
    bookingData.append('RegStage', this.regDetailForm.get('RegStage')?.value);
    bookingData.append('RegStatus', this.regDetailForm.get('RegStatus')?.value);
    bookingData.append('PaymentPlan', this.regDetailForm.get('PaymentPlan')?.value);

    bookingData.append('bkPlotSize', rakbaPlotSize);

    bookingData.append('bkAmountPerSqft', this.regDetailForm.get('amount_per_sqft')?.value);
    bookingData.append('totalAmount', this.regDetailForm.get('totalAmount')?.value);
    bookingData.append('buyerName', this.regDetailForm.get('BuyerName')?.value);


    this.billingservice.updated_BookingDetail(bookingData).pipe(takeUntil(this.destroy$)).subscribe((Response) => {


    });
  }



  saveMore() {

    this.submit_btn2 = !this.regMeasurement.valid;
    if (this.submit_btn2) return;

    const rawProductIds = this.regMeasurement.get('product_id')?.value || '';

    //  Convert to array (works for single + CSV)
    const productIdsArr = rawProductIds
      .split(',')
      .map((x: string) => x.trim())
      .filter((x: string) => x);

    const salesRate = this.regMeasurement.get('totalAmountSqftValue')?.value || '';

    //  Validate booking
    const isBookingValid = this.updateBookingDetail();
    if (!isBookingValid) return;

    //  Create API calls dynamically
    const apiCalls = productIdsArr.map((id: string, idx: number) => {
      let formData = new FormData();
      formData.append('ProductId', id);
      formData.append('SalesRate', salesRate);

      const row = this.measurements?.at(idx) as FormGroup | undefined;
      const front = row ? (row.get('mFrontLength')?.value ?? '') : '';
      const depth = row ? (row.get('mDepthLength')?.value ?? '') : '';
      const area = row ? (row.get('mRakba')?.value ?? '') : '';

      // Send updated measurements (backend keys vary; include common variants)
      formData.append('front', front);
      formData.append('depth', depth);
      formData.append('plotArea', area);

      return this.productservice.updateMeasuredPlotDetails(formData);
    });

    //  Execute all APIs in parallel
    forkJoin(apiCalls).pipe(takeUntil(this.destroy$)).subscribe((responses) => {

      //  Refresh once (not per API)
      this.refreshAllData().pipe(takeUntil(this.destroy$)).subscribe(() => {

        this.reload();

        const isSuccess = (responses as any[]).every(res => res?.data);

        if (isSuccess) {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'All plots updated successfully',
            showConfirmButton: false,
            timer: 3000
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Partial Failure!',
            text: 'Some plots failed to update',
            showConfirmButton: false,
            timer: 3000
          });
        }

      });

    });

  }

  refreshAllData() {
    return forkJoin({
      reg: of(this.editReg(this.id, this.prsn_id)),
      info: of(this.getInfo(this.id)),
      stages: of(this.StagesStatuslist()),
      employee: of(this.employeetypenamelist()),
      lookup: of(this.lookupdatalist()),
      buyer: of(this.datatableCode()),
      seller: of(this.sellerdatatableCode()),
      witness: of(this.witnessdatatableCode()),
      payment: of(this.paymentDetailDatatableCode()),
      accHead: of(this.getAccHead()),
      subHead: of(this.getAllAccSubHead()),
      bank: of(this.getAllBankDetails()),
      plan: of(this.paymentPlanDatatableCode())
    });
  }

  ExportPaymentTOExcel() {

    this.paymentDetaildatatableParameter.person_type = "Buyer";
    this.paymentDetaildatatableParameter.booking_id = this.id;

    this.booking_id = this.paymentDetaildatatableParameter.booking_id


    const buyName = this.buyer_form.value.buyer_name;

    const formData = new FormData();


    if (this.booking_id) {
      formData.append('booking_id', this.booking_id);
    }

    const xhr = new XMLHttpRequest();
    xhr.open('POST', environment.APIEndpoint + `booking.PaymentDetails_excelData&reload=1`, true);
    xhr.responseType = 'blob';
    xhr.onload = function () {
      if (xhr.status === 200) {

        const blob = new Blob([xhr.response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
        saveAs(blob, buyName + '-PaymentDetails.xlsx');

      } else {
        console.error('Unexpected response status:', xhr.status);
      }
    };

    xhr.onerror = function () {
      console.error('An error occurred during the transaction');
    };

    xhr.send(formData);

  }

  add_attorneyDetails() {
    this.submitted = true;
    if (this.regattorneyDetails.valid) {
      let attorneyDetaildata = new FormData();
      attorneyDetaildata.append('attLandlordId', this.regattorneyDetails.get('attLandlordId')?.value);
      attorneyDetaildata.append('AttorneyId', this.regattorneyDetails.get('AttorneyId')?.value);
      attorneyDetaildata.append('landlord_id', this.regattorneyDetails.get('landlord_id')?.value);
      attorneyDetaildata.append('powerName', this.regattorneyDetails.get('regpowerName')?.value);
      attorneyDetaildata.append('powerNumber', this.regattorneyDetails.get('regpowerNumber')?.value);
      attorneyDetaildata.append('KhasraNo', this.regattorneyDetails.get('regKhasraNo')?.value);
      attorneyDetaildata.append('powerRakba', this.regattorneyDetails.get('regpowerRakba')?.value);
      attorneyDetaildata.append('diversion', this.regattorneyDetails.get('regdiversion')?.value);
      attorneyDetaildata.append('powerDate', this.regattorneyDetails.get('regpowerDate')?.value);
      attorneyDetaildata.append('signTime', this.regattorneyDetails.get('regsignTime')?.value);
      attorneyDetaildata.append('powerPustak', this.regattorneyDetails.get('regpowerPustak')?.value);
      attorneyDetaildata.append('powerGranth', this.regattorneyDetails.get('regpowerGranth')?.value);
      attorneyDetaildata.append('powerVilekh', this.regattorneyDetails.get('regpowerVilekh')?.value);

      this.billingservice.add_attorneyDetails(attorneyDetaildata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
        this.closeModal();
        if (Response.CODE == 200) {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: Response.MESSAGE,
            showConfirmButton: false,
            timer: 2000
          });
          // this.rerender();
          this.reload();
          this.regattorneyDetails.reset();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Field required!',
            showConfirmButton: false,
            timer: 3000
          });
        }
        this.submitted = false;
      });
    }
  }

  view_edit_Attorney(flg: any, attr_id: any, landloard_id: any) {
    this.flg = flg;
    this.attorneymodal.nativeElement.click();
    let patchData = new FormData();
    patchData.append('landlord_id', landloard_id);
    patchData.append('AttorneyId', attr_id);
    this.billingservice.getAttorneydata(patchData).pipe(takeUntil(this.destroy$)).subscribe(Response => {
      if (Object.keys(Response).length > 0) {
        this.regattorneyDetails.patchValue({
          AttorneyId: Response.AttorneyId,
          attLandlordId: Response.attLandlordId,
          landlord_id: Response.landlord_id,
          regpowerName: Response.poa_name,
          regKhasraNo: Response.khasra_number,
          regpowerNumber: Response.poa_number,
          regpowerRakba: Response.rakba,
          regdiversion: Response.isDiverted,
          regsignTime: Response.time,
          regpowerDate: Response.date,
          regpowerPustak: Response.book_number,
          regpowerGranth: Response.granth,
          regpowerVilekh: Response.vilekh_number,
        })
      }

    })
    // this.PopupTitle = "Edit Attorney";


  }


  result(tabName: any) {
    this.activeTab = tabName;
  }


  public closeModal() {

    this.transCond = false;
    this.transCondSR = false;
    this.transCondR = false;
    this.transCond1 = false;
    this.transCond2 = false;
    this.transCond3 = false;
    this.transCond4 = false;
    this.transCond5 = false;
    this.transCond6 = false;
    this.transCond69 = false;
    // this.transaction_form.reset();
    this.closebutton.forEach((item: any) => {
      item.nativeElement.click()
    });


  }
  public donecloseModal() {


    // this.transaction_form.reset();
    // this.plan_done_transaction_form.reset();
    this.closebutton1.forEach((item: any) => {
      item.nativeElement.click();
    });


  }

  public savePlancloseModal() {

    this.plan_save_transaction_form.reset();
    this.closebutton.forEach((item: any) => {
      item.nativeElement.click()
    });


  }
  public donePlancloseModal() {

    // this.plan_done_transaction_form.reset();
    this.closebutton1.forEach((item: any) => {
      item.nativeElement.click()
    });


  }

  lookupdatalist() {
    let lookupTitel = "Title";
    let Titledata = new FormData();
    Titledata.append('lookupname', lookupTitel);
    this.hrservice.fetch_lookupdata(Titledata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
      this.resplookupTitel = Response.data
    });
    let lookupCategory = "Category";
    let Categorydata = new FormData();
    Categorydata.append('lookupname', lookupCategory);
    this.hrservice.fetch_lookupdata(Categorydata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
      this.resplookupCategory = Response.data
    });
    let lookupBank = "Bank";
    let bankdata = new FormData();
    bankdata.append('lookupname', lookupBank);
    this.hrservice.fetch_lookupdata(bankdata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
      this.resplookupBankk = Response.data
    });
    // <----------------cheque status------>
    let lookupStatus = "Status"
    let Statusdata = new FormData();
    Statusdata.append('lookupname', lookupStatus);
    this.crmservice.fetch_lookupdata(Statusdata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
      this.respStatus = Response.data;

    });
    ///unit of measurment

    let uom = new FormData();
    uom.append("CompanyId", '');
    this.productservice.fetchProductUOMList(uom).pipe(takeUntil(this.destroy$)).subscribe(Response => {
      this.umoData = Response.data;

    });
    // dairection or facing
    let facing = new FormData();
    facing.append("LookupTypeId", 'e544bd3f-caa1-11eb-9bcd-063127f6ced7');
    this.productservice.fetchLookUpDataByID(facing).pipe(takeUntil(this.destroy$)).subscribe(Response => {
      this.facing = Response.data;
    })
    // payent plane reasons
    let reason = new FormData();
    reason.append("LookupTypeId", 'd43ad69b-6c8b-11ec-9924-063127f6ced7');
    this.productservice.fetchLookUpDataByID(reason).pipe(takeUntil(this.destroy$)).subscribe(Response => {

      this.reason = Response.data.map((reason: any) => ({
        LookupValue: reason.LookupValue,
        LookupDataId: reason.LookupDataId,
      }));

    });


  }


  UploadImage(files: FileList, event:any, index = 0) {

    this.labelImport_arr[index].nativeElement.innerText = Array.from(files)
      .map(f => f.name)
      .join(', ');
    // this.labelImport.nativeElement.innerText = Array.from(files)
    // .map(f => f.name)
    // .join(', ');

    let filecontent = event.target.files[0];
    // this.Adharimagename = filecontent.name
    let reader = new FileReader(); // HTML5 FileReader API
    let file = event.target.files[0];
    if (event.target.files && event.target.files[0]) {
      reader.readAsDataURL(file);

      // When file uploads set it to file formcontrol
      reader.onload = () => {
        // this.image= { adharimage : reader.result}
        // this.imagedata(this.image)
        this.editFile = false;
        this.removeUpload = true;

      }
      // ChangeDetectorRef since file is loading outside the zone
      this.cd.markForCheck();
    }

  }
  // PanImage(files: FileList, event) {

  //   this.labelImport1.nativeElement.innerText = Array.from(files)
  //   .map(f => f.name)
  //   .join(', ');
  //   let filecontent = event.target.files[0];
  //   // this.panimagename = filecontent.name
  //   let reader = new FileReader(); // HTML5 FileReader API
  //   let file = event.target.files[0];
  //   if (event.target.files && event.target.files[0]) {
  //   reader.readAsDataURL(file);

  //   // When file uploads set it to file formcontrol
  //   reader.onload = () => {
  //       // this.image= { panimage : reader.result}
  //       // this.imagedata(this.image)

  //       this.editFile = false;
  //       this.removeUpload = true;

  //   }
  //   // ChangeDetectorRef since file is loading outside the zone
  //   this.cd.markForCheck();
  //   }


  // }

  StagesStatuslist() {
    let StagesStatus = "";
    let StagesStatusdata = new FormData();
    StagesStatusdata.append('StagesStatus', StagesStatus);
    this.respStages = null;
    this.billingservice.fetch_StagesData(StagesStatusdata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
      this.respStages = Response.data;
    });
  }

  GetAllStagesStatusList() {

    let StagesStatusdata = new FormData();
    // StagesStatusdata.append('StagesStatus', value);
    // this.respStagesStatus = "";
    this.billingservice.get_erpstageStatus(StagesStatusdata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
      this.respStagesStatus = Response.data;
    });


  }
  // onChangeStatus(value) {

  //   let StagesStatusdata = new FormData();
  //   StagesStatusdata.append('StagesStatus', value);
  //   // this.respStagesStatus = "";
  //   this.billingservice.get_erpstageStatus(StagesStatusdata).subscribe(Response => {


  //     this.respStagesStatus = Response.data;
  //   });


  // }
  PaymentPlanlist() {
    let PaymentPlan = "";
    let PaymentPlandata = new FormData();
    PaymentPlandata.append('StagesStatus', PaymentPlan);
    this.billingservice.get_PaymentPlan(PaymentPlandata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
      this.respPPlan = Response.data;
    });
  }

  // Statuslist() {
  //   let StatusList= "";
  //   let StatusData = new FormData();
  //   StatusData.append('StagesStatus',StatusList);
  //      this.respStagesStatus = null;
  //   this.billingservice.get_erpstageStatus(StatusData).subscribe(Response => {
  //    this.respStagesStatus = Response.data;
  //   });
  // }
  PaymentStatuslist() {
    let PaymentStatus = "";
    let PaymentStatusdata = new FormData();
    PaymentStatusdata.append('StagesStatus', PaymentStatus);
    this.billingservice.fetch_PaymentStatus(PaymentStatusdata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
      this.respPStatus = Response.data;
    });
  }




  // onSelectPaymentMode(value) {

  //   if (value == 'Bank') {
  //     this.transCond = true;
  //     this.transCond1 = true;
  //     this.transCond2 = false;
  //     this.transCond3 = false;

  //   }
  //   if (value == 'Cash') {
  //     this.transaction_form.get('transaction_chequeDate').clearValidators();
  //     this.transaction_form.get('transaction_chequeNo').clearValidators();
  //     this.transaction_form.get('transaction_chequeName').clearValidators();


  //     this.transCond = true;
  //     this.transCond1 = false;
  //     this.transCond2 = true;
  //     this.transCond3 = false;
  //   }
  //   if (value == 'Cheque') {

  //     this.transaction_form.get('transaction_chequeDate').setValidators(Validators.required);
  //     this.transaction_form.get('transaction_chequeNo').setValidators(Validators.required);
  //     this.transaction_form.get('transaction_chequeName').setValidators(Validators.required);
  //     this.transCond = true;
  //     this.transCond1 = false;
  //     this.transCond2 = false;
  //     this.transCond3 = true;
  //   }
  //   if (value == 0) {
  //     this.transaction_form.get('transaction_chequeDate').clearValidators();
  //     this.transaction_form.get('transaction_chequeNo').clearValidators();
  //     this.transaction_form.get('transaction_chequeName').clearValidators();
  //     this.transCond = false;
  //     this.transCond1 = false;
  //     this.transCond2 = false;
  //     this.transCond3 = false;
  //   }
  // }

  onSelectPlanPaymentMode(value: string | number) {
    if (value === 'Cash') {
      this.plan_save_transaction_form.patchValue({
        plan_save_transaction_accHead: 'firm',
        plan_save_transaction_accHSubHead: 'Manoj Rajput Property Layout Pvt Ltd',
      });
      this.plan_save_transaction_form.get('plan_save_transaction_accHead')?.disable();
      this.plan_save_transaction_form.get('plan_save_transaction_accHSubHead')?.disable();
    } else {
      this.plan_save_transaction_form.get('plan_save_transaction_accHead')?.enable();
      this.plan_save_transaction_form.get('plan_save_transaction_accHSubHead')?.enable();
    }

    if (value === 'Cheque') {

      this.plan_save_transaction_form.get('plan_save_cash_submitted_by')?.clearValidators();
      this.plan_save_transaction_form.get('plan_save_cash_date')?.clearValidators();

      this.plan_save_transaction_form.get('plan_save_dd_bank_name')?.clearValidators();
      this.plan_save_transaction_form.get('plan_save_dd_name')?.clearValidators();
      this.plan_save_transaction_form.get('plan_save_dd_number')?.clearValidators();

      this.plan_save_transaction_form.get('plan_save_online_transferred_from')?.clearValidators();
      this.plan_save_transaction_form.get('plan_save_online_bank_name')?.clearValidators();
      this.plan_save_transaction_form.get('plan_save_online_acc_holder_name')?.clearValidators();
      this.plan_save_transaction_form.get('plan_save_online_recieved_date')?.clearValidators();

      this.transCond = true;
      this.transCondSR = true;
      this.transCondR = true;
      this.transCond393 = true;
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
      this.plan_save_transaction_form.get('plan_save_chequeClearDate');
      this.plan_save_transaction_form.get('plan_save_chequeDate');

    }

    if (value == 'Online') {


      this.plan_save_transaction_form.get('plan_save_cash_submitted_by')?.clearValidators();
      this.plan_save_transaction_form.get('plan_save_cash_date')?.clearValidators();

      this.plan_save_transaction_form.get('plan_save_dd_bank_name')?.clearValidators();
      this.plan_save_transaction_form.get('plan_save_dd_name')?.clearValidators();
      this.plan_save_transaction_form.get('plan_save_dd_number')?.clearValidators();

      this.plan_save_transaction_form.get('plan_save_chequeName')?.clearValidators();
      this.plan_save_transaction_form.get('plan_save_chequeNumber')?.clearValidators();
      this.plan_save_transaction_form.get('plan_save_chequeSubmitDate')?.clearValidators();
      this.plan_save_transaction_form.get('plan_save_chequeClearDate')?.clearValidators();
      this.plan_save_transaction_form.get('plan_save_chequeDate')?.clearValidators();



      this.transCond = true;
      this.transCondSR = false;
      this.transCondR = false;

      this.transCond393 = true;
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

    if (value == 'Cash') {


      this.plan_save_transaction_form.get('plan_save_online_transferred_from')?.clearValidators();
      this.plan_save_transaction_form.get('plan_save_online_bank_name')?.clearValidators();
      this.plan_save_transaction_form.get('plan_save_online_acc_holder_name')?.clearValidators();
      this.plan_save_transaction_form.get('plan_save_online_recieved_date')?.clearValidators();


      this.plan_save_transaction_form.get('plan_save_dd_bank_name')?.clearValidators();
      this.plan_save_transaction_form.get('plan_save_dd_name')?.clearValidators();
      this.plan_save_transaction_form.get('plan_save_dd_number')?.clearValidators();

      this.plan_save_transaction_form.get('plan_save_chequeName')?.clearValidators();
      this.plan_save_transaction_form.get('plan_save_chequeNumber')?.clearValidators();
      this.plan_save_transaction_form.get('plan_save_chequeSubmitDate')?.clearValidators();
      this.plan_save_transaction_form.get('plan_save_chequeClearDate')?.clearValidators();
      this.plan_save_transaction_form.get('plan_save_chequeDate')?.clearValidators();


      this.plan_save_transaction_form.get('plan_save_cash_submitted_by');
      this.plan_save_transaction_form.get('plan_save_cash_date');


      this.transCond = true;
      this.transCondSR = true;
      this.transCondR = true;
      this.transCond33 = false;
      this.transCond393 = false;
      this.transCond44 = false;
      this.transCond464 = true;
      this.transCond55 = true;
      this.transCond66 = false;
      this.isDDSelected = false;
      this.isCQSelected = false;

      this.plan_save_transaction_form.patchValue({
        plan_save_transaction_accHead: 'firm',
        plan_save_transaction_accHSubHead: 'Manoj Rajput Property Layout Pvt Ltd',
      });
      this.plan_done_transaction_form.get('plan_done_transaction_accHead')?.disable();
      this.plan_done_transaction_form.get('plan_done_transaction_accHSubHead')?.disable();

    }
    if (value == 'DD') {

      this.plan_save_transaction_form.get('plan_save_online_transferred_from')?.clearValidators();
      this.plan_save_transaction_form.get('plan_save_online_bank_name')?.clearValidators();
      this.plan_save_transaction_form.get('plan_save_online_acc_holder_name')?.clearValidators();
      this.plan_save_transaction_form.get('plan_save_online_recieved_date')?.clearValidators();

      this.plan_save_transaction_form.get('plan_save_cash_submitted_by')?.clearValidators();
      this.plan_save_transaction_form.get('plan_save_cash_date')?.clearValidators();

      this.plan_save_transaction_form.get('plan_save_chequeName')?.clearValidators();
      this.plan_save_transaction_form.get('plan_save_chequeNumber')?.clearValidators();
      this.plan_save_transaction_form.get('plan_save_chequeSubmitDate')?.clearValidators();
      this.plan_save_transaction_form.get('plan_save_chequeClearDate')?.clearValidators();
      this.plan_save_transaction_form.get('plan_save_chequeDate')?.clearValidators();



      this.plan_save_transaction_form.get('plan_save_dd_bank_name');
      this.plan_save_transaction_form.get('plan_save_dd_name');
      this.plan_save_transaction_form.get('plan_save_dd_number');


      this.transCond = true;
      this.transCondSR = true;
      this.transCondR = true;
      this.transCond393 = true;
      this.transCond33 = false;
      this.transCond44 = false;
      this.transCond464 = true;
      this.transCond55 = false;
      this.transCond66 = true;
      this.isDDSelected = true;
      this.isCQSelected = false;

    }

    if (value == 0) {

      this.plan_save_transaction_form.get('plan_save_chequeName')?.clearValidators();
      this.plan_save_transaction_form.get('plan_save_chequeNumber')?.clearValidators();
      this.plan_save_transaction_form.get('plan_save_chequeSubmitDate')?.clearValidators();
      this.plan_save_transaction_form.get('plan_save_chequeClearDate')?.clearValidators();
      this.plan_save_transaction_form.get('plan_save_chequeDate')?.clearValidators();

      this.plan_save_transaction_form.get('plan_save_online_transferred_from')?.clearValidators();
      this.plan_save_transaction_form.get('plan_save_online_bank_name')?.clearValidators();
      this.plan_save_transaction_form.get('plan_save_online_acc_holder_name')?.clearValidators();
      this.plan_save_transaction_form.get('plan_save_online_recieved_date')?.clearValidators();


      this.plan_save_transaction_form.get('plan_save_cash_submitted_by')?.clearValidators();
      this.plan_save_transaction_form.get('plan_save_cash_date')?.clearValidators();

      this.plan_save_transaction_form.get('plan_save_dd_bank_name')?.clearValidators();
      this.plan_save_transaction_form.get('plan_save_dd_name')?.clearValidators();
      this.plan_save_transaction_form.get('plan_save_dd_number')?.clearValidators();

      this.transCond = false;
      this.transCondSR = false;
      this.transCondR = false;
      this.transCond33 = false;
      this.transCond393 = false;
      this.transCond44 = false;
      this.transCond464 = false;
      this.transCond55 = false;
      this.transCond66 = false;
    }
  }


  onSelectDonePlanPaymentMode(value: any) {

    if (value == 'Cheque') {
      this.plan_done_transaction_form.get('plan_done_chequeName');
      this.plan_done_transaction_form.get('plan_done_chequeNumber');
      this.plan_done_transaction_form.get('plan_done_chequeSubmitDate');
      this.plan_done_transaction_form.get('plan_done_chequeClearDate');
      this.plan_done_transaction_form.get('plan_done_chequeDate');


      this.transCond = true;
      this.transCondSR = true;
      this.transCondR = true;
      this.transCond33 = true;
      this.transCond353 = true;
      this.transCond44 = false;
      this.transCond444 = true;
      this.transCond55 = false;
      this.transCond66 = false;
      this.isDDSelected = false;
      this.isCQSelected = true;
    }

    if (value == 'Online') {
      this.plan_done_transaction_form.get('plan_done_online_transferred_from');
      this.plan_done_transaction_form.get('plan_done_online_bank_name');
      this.plan_done_transaction_form.get('plan_done_online_acc_holder_name');
      this.plan_done_transaction_form.get('plan_done_online_recieved_date');


      this.transCond = true;
      this.transCondR = false;
      this.transCondSR = false;
      this.transCond33 = false;
      this.transCond353 = true;
      this.transCond44 = true;
      this.transCond444 = true;
      this.transCond55 = false;
      this.transCond66 = false;
      this.isDDSelected = false;
      this.isCQSelected = false;

    }
    if (value == 'Cash') {

      this.plan_done_transaction_form.get('plan_done_cash_submitted_by');
      this.plan_done_transaction_form.get('plan_done_cash_date');

      this.transCond = true;
      this.transCondR = true;
      this.transCondSR = true;
      this.transCond33 = false;
      this.transCond353 = false;
      this.transCond44 = false;
      this.transCond444 = true;
      this.transCond55 = true;
      this.transCond66 = false;
      this.isDDSelected = false;
      this.isCQSelected = false;

    }
    if (value == 'DD') {


      this.plan_done_transaction_form.get('plan_done_dd_bank_name');
      this.plan_done_transaction_form.get('plan_done_dd_name');
      this.plan_done_transaction_form.get('plan_done_dd_number');


      this.transCond = true;
      this.transCondR = true;
      this.transCondSR = true;
      this.transCond33 = false;
      this.transCond353 = true;
      this.transCond44 = false;
      this.transCond444 = true;
      this.transCond55 = false;
      this.transCond66 = true;
      this.isDDSelected = true;
      this.isCQSelected = false;

    }

    if (value == 0) {
      this.transCond = false;
      this.transCondR = false;
      this.transCondSR = false;
      this.transCond33 = false;
      this.transCond353 = false;
      this.transCond44 = false;
      this.transCond444 = false;
      this.transCond55 = false;
      this.transCond66 = false;
      this.isDDSelected = false;
      this.isCQSelected = false;
    }
  }



  onSelectPaymentPlanMode(value: any) {

    // this.paymentPlan_form.get('payment_plan_chequeName').clearValidators();
    // this.paymentPlan_form.get('payment_plan_chequeNo').clearValidators();
    // this.paymentPlan_form.get('payment_plan_paidTo').clearValidators();

    // this.paymentPlan_form.get('online_received_date').clearValidators();
    // this.paymentPlan_form.get('online_account_holder_name').clearValidators();
    // this.paymentPlan_form.get('online_bank_name').clearValidators();
    // this.paymentPlan_form.get('online_transferred_from').clearValidators();

    // this.paymentPlan_form.get('plan_cash_submittedBy').clearValidators();
    // this.paymentPlan_form.get('plan_cash_date').clearValidators();

    // this.paymentPlan_form.get('planDD_bank_name').clearValidators();
    // this.paymentPlan_form.get('planDD_name_on_dd').clearValidators();
    // this.paymentPlan_form.get('planDD_dd_number').clearValidators();


    if (value == 'DD') {


      this.paymentPlan_form.get('payment_plan_chequeName')?.clearValidators();
      this.paymentPlan_form.get('payment_plan_chequeNo')?.clearValidators();
      this.paymentPlan_form.get('payment_plan_paidTo')?.clearValidators();

      // this.paymentPlan_form.get('online_received_date').clearValidators();
      // this.paymentPlan_form.get('online_received_date').updateValueAndValidity();
      // this.paymentPlan_form.get('online_account_holder_name').clearValidators();
      // this.paymentPlan_form.get('online_bank_name').clearValidators();
      // this.paymentPlan_form.get('online_transferred_from').clearValidators();

      this.paymentPlan_form.get('plan_cash_submittedBy')?.clearValidators();
      this.paymentPlan_form.get('plan_cash_date')?.clearValidators();


      this.paymentPlan_form.get('planDD_bank_name');
      this.paymentPlan_form.get('planDD_name_on_dd');
      // this.paymentPlan_form.get('planDD_dd_amount');
      this.paymentPlan_form.get('planDD_dd_number');


      this.transCond = false;
      this.transCond1 = false;
      this.transCond2 = false;
      this.transCond3 = false;
      this.transCond4 = false;
      this.transCond5 = false;
      this.transCond6 = true;
      this.transCond69 = true;


    }
    if (value == 'Cash') {

      this.paymentPlan_form.get('payment_plan_chequeName')?.clearValidators();
      this.paymentPlan_form.get('payment_plan_chequeNo')?.clearValidators();
      this.paymentPlan_form.get('payment_plan_paidTo')?.clearValidators();

      // this.paymentPlan_form.get('online_received_date').clearValidators();
      // this.paymentPlan_form.get('online_received_date').updateValueAndValidity();
      // this.paymentPlan_form.get('online_account_holder_name').clearValidators();
      // this.paymentPlan_form.get('online_bank_name').clearValidators();
      // this.paymentPlan_form.get('online_transferred_from').clearValidators();


      this.paymentPlan_form.get('planDD_bank_name')?.clearValidators();
      this.paymentPlan_form.get('planDD_name_on_dd')?.clearValidators();
      this.paymentPlan_form.get('planDD_dd_number')?.clearValidators();


      // this.paymentPlan_form.get('plan_cash_date');

      // this.paymentPlan_form.get('plan_cash_submittedBy');


      this.transCond = false;
      this.transCond1 = false;
      this.transCond2 = false;
      this.transCond3 = false;
      this.transCond4 = false;
      this.transCond5 = true;
      this.transCond6 = false;
      this.transCond69 = false;
    }

    if (value == 'Online') {


      this.paymentPlan_form.get('payment_plan_chequeName')?.clearValidators();
      this.paymentPlan_form.get('payment_plan_chequeNo')?.clearValidators();
      this.paymentPlan_form.get('payment_plan_paidTo')?.clearValidators();


      this.paymentPlan_form.get('plan_cash_submittedBy')?.clearValidators();
      this.paymentPlan_form.get('plan_cash_date')?.clearValidators();

      this.paymentPlan_form.get('planDD_bank_name')?.clearValidators();
      this.paymentPlan_form.get('planDD_name_on_dd')?.clearValidators();
      this.paymentPlan_form.get('planDD_dd_number')?.clearValidators();

      // this.paymentPlan_form.get('online_transferred_from');
      // this.paymentPlan_form.get('online_bank_name');
      // this.paymentPlan_form.get('online_account_holder_name');
      // this.paymentPlan_form.get('online_received_date');
      this.transCond = false;
      this.transCond1 = false;
      this.transCond2 = false;
      this.transCond3 = false;
      this.transCond4 = true;
      this.transCond5 = false;
      this.transCond6 = false;
      this.transCond69 = false;

    }
    if (value == 'Cheque') {


      // this.paymentPlan_form.get('online_received_date').clearValidators();
      // this.paymentPlan_form.get('online_received_date').updateValueAndValidity();
      // this.paymentPlan_form.get('online_account_holder_name').clearValidators();
      // this.paymentPlan_form.get('online_bank_name').clearValidators();
      // this.paymentPlan_form.get('online_transferred_from').clearValidators();

      this.paymentPlan_form.get('plan_cash_submittedBy')?.clearValidators();
      this.paymentPlan_form.get('plan_cash_date')?.clearValidators();

      this.paymentPlan_form.get('planDD_bank_name')?.clearValidators();
      this.paymentPlan_form.get('planDD_name_on_dd')?.clearValidators();
      this.paymentPlan_form.get('planDD_dd_number')?.clearValidators();


      this.paymentPlan_form.get('payment_plan_chequeNo');
      this.paymentPlan_form.get('payment_plan_chequeName');
      this.transCond = true;
      this.transCond1 = false;
      this.transCond2 = false;
      this.transCond3 = true;
      this.transCond4 = false;
      this.transCond5 = false;
      this.transCond6 = false;
      this.transCond69 = true;
    }
    if (value == 0) {

      this.paymentPlan_form.get('payment_plan_chequeName')?.clearValidators();
      this.paymentPlan_form.get('payment_plan_chequeNo')?.clearValidators();
      this.paymentPlan_form.get('payment_plan_paidTo')?.clearValidators();

      // this.paymentPlan_form.get('online_received_date').clearValidators();
      // this.paymentPlan_form.get('online_account_holder_name').clearValidators();
      // this.paymentPlan_form.get('online_bank_name').clearValidators();
      // this.paymentPlan_form.get('online_transferred_from').clearValidators();

      this.paymentPlan_form.get('plan_cash_submittedBy')?.clearValidators();
      this.paymentPlan_form.get('plan_cash_date')?.clearValidators();

      this.paymentPlan_form.get('planDD_bank_name')?.clearValidators();
      this.paymentPlan_form.get('planDD_name_on_dd')?.clearValidators();
      this.paymentPlan_form.get('planDD_dd_number')?.clearValidators();


      this.transCond = false;
      this.transCond1 = false;
      this.transCond2 = false;
      this.transCond3 = false;
      this.transCond4 = false;
      this.transCond5 = false;
      this.transCond6 = false;
      this.transCond69 = false;
    }
  }

  paymentDetailDatatableCode() {

    this.paymentDetaildatatableParameter.person_type = "buyer";
    this.paymentDetaildatatableParameter.booking_id = this.id;
    const that = this;
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });

    this.dtOptions6 = {
      processing: true,
      serverSide: true,
      pageLength: 25,
      dom: 'lrtip',
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
      columnDefs: [
        { orderable: false, targets: 6 },
      ],
      ajax: (dataTablesParameters: any, callback) => {
        // Object.assign(dataTablesParameters, this.witDatatableParameter);
        that.http.post<DataTablesResponse>(environment.APIEndpoint + 'transaction.fetchPaymentDetails&reload=1', Object.assign(dataTablesParameters, this.paymentDetaildatatableParameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {


          that.PaymentDetaildata = resp.data;
          that.paidAmount();

          callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsTotal,
            data: []
          });
        });
      }
    };
  }

  save_regPaymentPlanForm() {
    if (this.isButtonDisabled) {
      return;
    }
    this.submit_btn = true;
    var value1 = {
      // buyer_id: this.prsn_id,
      // booking_id: this.id,
      date: this.paymentPlan_form.get("paymentPlan_date")?.value,
      // cq_recieved_on: this.paymentPlan_form.get("payment_plan_cheque_rec_date").value,
      amount: this.paymentPlan_form.get("paymentPlan_amount")?.value,
      reason: this.paymentPlan_form.get("paymentPlan_reason")?.value,
      status: this.paymentPlan_form.get("paymentPlan_status")?.value,
      mode: this.paymentPlan_form.get("paymentPlan_mode")?.value

    };


    if (Object.values(value1).every(value => value)) {

      const amount = this.paymentPlan_form.get("paymentPlan_amount")?.value;
      const amountErrors = [];

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

      let checkPayMode = this.paymentPlan_form.get("paymentPlan_mode")?.value;
      var additionalValue = null;

      if (checkPayMode === 'Cheque') {
        additionalValue = {
          chequeDate: this.paymentPlan_form.get("payment_plan_cheque_rec_date")?.value,
          // chequeName: this.paymentPlan_form.get("payment_plan_chequeName").value,
          // chequeNo: this.paymentPlan_form.get("payment_plan_chequeNo").value,
          // recievedBy: this.paymentPlan_form.get("payment_plan_paidTo").value
        };
        if (!Object.values(additionalValue).every(value => value)) {
          this.validatedNowSave = false;
          Swal.fire('Error', 'Please fill all Cheque details including Cheque Received On', 'error');
          return;
        }
      } else if (checkPayMode === 'DD') {
        additionalValue = {
          ddBankName: this.paymentPlan_form.get("planDD_bank_name")?.value,
          ddName: this.paymentPlan_form.get("planDD_name_on_dd")?.value,
          ddNumber: this.paymentPlan_form.get("planDD_dd_number")?.value,
          recievedBy: this.paymentPlan_form.get("payment_plan_paidTo")?.value
        };
      }

      if (Object.values(value1).every(value => value) || Object.values(additionalValue || {}).every(value => value)) {
        this.validatedNowSave = true;
      }
    } else {
      this.validatedNowSave = false;
    }


    if (this.validatedNowSave) {

      // this.submit_btn = true;s
      let regPaymentPlanData = new FormData();
      regPaymentPlanData.append("id", this.paymentPlan_form.get("paymentPlan_id")?.value);
      regPaymentPlanData.append("buyer_id", this.prsn_id);
      regPaymentPlanData.append("booking_id", this.id);

      // const paymentPlanDate = this.paymentPlan_form.get("paymentPlan_date").value;
      // const dateObj = new Date(paymentPlanDate);
      // const day = dateObj.getDate().toString().padStart(2, '0'); 
      // const month = String(dateObj.getMonth() + 1).padStart(2, '0'); 
      // const year = dateObj.getFullYear();
      // const formattedDate = `${month}/${day}/${year}`;
      // regPaymentPlanData.append("date", formattedDate);
      regPaymentPlanData.append("date", this.paymentPlan_form.get("paymentPlan_date")?.value);
      regPaymentPlanData.append("amount", this.paymentPlan_form.get("paymentPlan_amount")?.value);

      this.reasons = this.paymentPlan_form.get("paymentPlan_reason")?.value;

      // let i;
      // this.setting_reason_id = '';
      // this.reason_array = [];
      // for(i=0;i<this.reasons.length;i++){
      //   this.reason_array.push(this.reasons[i].id);
      //   this.setting_reason_id = this.reason_array.join(',');
      // }

      regPaymentPlanData.append("reason", this.reasons);
      regPaymentPlanData.append("status", this.paymentPlan_form.get("paymentPlan_status")?.value);
      regPaymentPlanData.append("mode", this.paymentPlan_form.get("paymentPlan_mode")?.value);
      regPaymentPlanData.append("recievedBy", this.paymentPlan_form.get("payment_plan_paidTo")?.value);

      let checkPayMode = this.paymentPlan_form.get("paymentPlan_mode")?.value;

      if (checkPayMode == 'Cheque') {

        regPaymentPlanData.append("chequeName", this.paymentPlan_form.get("payment_plan_chequeName")?.value);
        regPaymentPlanData.append("chequeNo", this.paymentPlan_form.get("payment_plan_chequeNo")?.value);
        regPaymentPlanData.append("cqRecDate", this.paymentPlan_form.get("payment_plan_cheque_rec_date")?.value);
      }
      if (checkPayMode == 'Online') {

        // regPaymentPlanData.append("onlineTransferredFrom", this.paymentPlan_form.get("online_transferred_from").value);
        // regPaymentPlanData.append("onlineBankName", this.paymentPlan_form.get("online_bank_name").value);
        // regPaymentPlanData.append("onlineAccHolderName", this.paymentPlan_form.get("online_account_holder_name").value);
        // regPaymentPlanData.append("onlineRecievedDate", this.paymentPlan_form.get("online_received_date").value);
      }
      if (checkPayMode == 'Cash') {

        // regPaymentPlanData.append("cashAmount", this.paymentPlan_form.get("plan_cash_amount").value);
        // regPaymentPlanData.append("cashRecievedBy", this.paymentPlan_form.get("plan_cash_recievedBy").value);
        // regPaymentPlanData.append("cashSubmittedBy", this.paymentPlan_form.get("plan_cash_submittedBy").value);
        // regPaymentPlanData.append("cashDate", this.paymentPlan_form.get("plan_cash_date").value);
      }
      if (checkPayMode == 'DD') {

        regPaymentPlanData.append("ddBankName", this.paymentPlan_form.get("planDD_bank_name")?.value);
        regPaymentPlanData.append("ddName", this.paymentPlan_form.get("planDD_name_on_dd")?.value);
        // regPaymentPlanData.append("ddAmount", this.paymentPlan_form.get("planDD_dd_amount").value);
        regPaymentPlanData.append("ddNumber", this.paymentPlan_form.get("planDD_dd_number")?.value);
      }


      this.isButtonDisabled = true;
      this.billingservice.addPaymentPlan(regPaymentPlanData).pipe(takeUntil(this.destroy$)).subscribe({
        next: (resp) => {
          this.isButtonDisabled = false;
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
            this.reload();
            this.paymentPlan_form.reset();
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Field required!',
              showConfirmButton: false,
              timer: 3000
            });
          }
        },
        error: () => {
          this.isButtonDisabled = false;
          Swal.fire({
            icon: 'error',
            title: 'Something went wrong!',
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


  insertSavePayment() {

    if (this.isButtonDisabled) {
      return;
    }

    const findTotAmount = this.toMoney(this.regDetailForm.get('totalAmount')?.value);
    const findPaidAmount = this.toMoney(this.regDetailForm.get('paidAmount')?.value);
    const currentPaidAmount = this.toMoney(this.plan_save_transaction_form.get('plan_save_amount')?.value);
    const mode = this.plan_save_transaction_form.get("plan_save_transaction_mode")?.value;
    const transaction_id = this.plan_save_transaction_form.get('plan_transaction_id')?.value;

    //  FIX: Adjust only for validation (NOT bank logic)
    let adjustedPaidAmount = findPaidAmount;

    if (transaction_id) {
      adjustedPaidAmount = this.toMoney(findPaidAmount - this.toMoney(this.previousamount));
    }

    const finalPaidAmount = this.toMoney(adjustedPaidAmount + currentPaidAmount);

    if (this.toPaise(finalPaidAmount) <= this.toPaise(findTotAmount)) {

      this.nowSetValidateValue = false;

      const transValue = {
        trans_mode: this.plan_save_transaction_form.get('plan_save_transaction_mode')?.value,
        trans_amount: this.plan_save_transaction_form.get('plan_save_amount')?.value,
        trans_status: this.plan_save_transaction_form.get('plan_save_status')?.value,
        trans_acc_head: this.plan_save_transaction_form.get('plan_save_transaction_accHead')?.value,
        trans_acc_subhead: this.plan_save_transaction_form.get('plan_save_transaction_accHSubHead')?.value,
        trans_all_recieved_date: this.plan_save_transaction_form.get('plan_save_all_recieved_date')?.value
      };

      if (Object.values(transValue).every(value => value)) {

        //  FIX: Convert to number (removed regex)
        const plan_save_amount = this.toMoney(this.plan_save_transaction_form.get("plan_save_amount")?.value);
        const amountErrors = [];

        if (!plan_save_amount || isNaN(plan_save_amount)) {
          amountErrors.push("Amount is required");
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

        const mode = this.plan_save_transaction_form.get("plan_save_transaction_mode")?.value;

        let plan_save_additionalValue: any = {};

        if (mode === 'Cheque') {
          plan_save_additionalValue = {
            trans_cheque_name: this.plan_save_transaction_form.get('plan_save_chequeName')?.value,
            trans_cheque_number: this.plan_save_transaction_form.get('plan_save_chequeNumber')?.value,
            trans_cheque_submit_date: this.plan_save_transaction_form.get('plan_save_chequeSubmitDate')?.value,
            trans_cheque_clear_date: this.plan_save_transaction_form.get('plan_save_chequeClearDate')?.value,
            trans_cheque_date: this.plan_save_transaction_form.get('plan_save_chequeDate')?.value,
          };
        }

        if (mode === 'Cash') {
          plan_save_additionalValue = {
            trans_cash_submitted_by: this.plan_save_transaction_form.get('plan_save_cash_submitted_by')?.value,
          };
        }

        if (mode === 'DD') {
          plan_save_additionalValue = {
            trans_dd_name: this.plan_save_transaction_form.get('plan_save_dd_name')?.value,
            trans_dd_number: this.plan_save_transaction_form.get('plan_save_dd_number')?.value,
          };
        }

        //  FIX: Safe validation function
        const validateFields = (fields: any): string[] => {
          const errors : string[] = [];
          if (!fields) return errors;

          if (mode === 'Cheque') {
            if (!fields.trans_cheque_name) errors.push("Sender's Bank Name is required");
            if (!/^[A-Za-z\s]+$/.test(fields.trans_cheque_name)) errors.push("Sender's Bank Name must only contain letters");
            if (!/^\d+$/.test(fields.trans_cheque_number)) errors.push("Cheque No must be numeric");
          }

          if (mode === 'Cash') {
            if (!fields.trans_cash_submitted_by) errors.push("Submitted By is required");
          }

          if (mode === 'DD') {
            if (!fields.trans_dd_name) errors.push("Name on DD is required");
            if (!/^\d+$/.test(fields.trans_dd_number)) errors.push("DD Number must be numeric");

            const ddSubmitDate = this.plan_save_transaction_form.get('plan_save_dd_submit_date')?.value;
            if (!ddSubmitDate) errors.push("DD Submit Date is required");

            const ddClearDate = this.plan_save_transaction_form.get('plan_save_dd_clear_date')?.value;
            if (!ddClearDate) errors.push("DD Clear Date is required");
          }

          return errors;
        };

        const validationErrors = validateFields(plan_save_additionalValue);

        const isAdditionalValid = Object.values(plan_save_additionalValue).every(v => v !== null && v !== '');

        if (validationErrors.length > 0) {
          Swal.fire({
            title: 'Validation Errors',
            text: validationErrors.join('\n , '),
            icon: 'error',
            confirmButtonText: 'Okay'
          });
          return;
        }

        if (Object.values(transValue).every(value => value) && isAdditionalValid) {
          this.nowSetValidateValue = true;
        } else {
          this.nowSetValidateValue = false;
        }

      } else {
        Swal.fire('Alert', 'Some fields are missing', 'info');
      }

      if (this.nowSetValidateValue) {

        this.plan_save_transaction_form.controls['booking_id'].setValue(this.id);

        let savePayment = new FormData();

        //  CLEAN PAYLOAD (NO add/subtract logic anymore)
        savePayment.append('transaction_id', this.plan_save_transaction_form.get('plan_transaction_id')?.value);
        savePayment.append('booking_id', this.plan_save_transaction_form.get('booking_id')?.value);
        savePayment.append('trans_date', this.plan_save_transaction_form.get('plan_save_transaction_date')?.value);
        savePayment.append('trans_mode', mode);
        savePayment.append('trans_all_recieved_date', this.plan_save_transaction_form.get('plan_save_all_recieved_date')?.value);

        savePayment.append('trans_amount', this.toMoneyString(currentPaidAmount));
        savePayment.append('trans_status', this.plan_save_transaction_form.get('plan_save_status')?.value);
        savePayment.append('trans_recieved_by', this.plan_save_transaction_form.get('plan_save_recieved_by')?.value);
        savePayment.append('trans_acc_head', this.plan_save_transaction_form.get('plan_save_transaction_accHead')?.value);
        savePayment.append('trans_acc_subhead', this.plan_save_transaction_form.get('plan_save_transaction_accHSubHead')?.value);
        savePayment.append('buyer_id', this.prsn_id);

        this.measurements.controls.forEach((control, index) => {
          const blockNumber = control.get('mBlockNumber')?.value;

          if (blockNumber) { savePayment.append('block_number', blockNumber); }
        });

        // ================= MODE BASED =================

        if (mode === 'Cheque') {
          savePayment.append('trans_cheque_name', this.plan_save_transaction_form.get('plan_save_chequeName')?.value);
          savePayment.append('trans_cheque_number', this.plan_save_transaction_form.get('plan_save_chequeNumber')?.value);
          savePayment.append('trans_cheque_submit_date', this.plan_save_transaction_form.get('plan_save_chequeSubmitDate')?.value);
          savePayment.append('trans_cheque_clear_date', this.plan_save_transaction_form.get('plan_save_chequeClearDate')?.value);
          savePayment.append('trans_cheque_date', this.plan_save_transaction_form.get('plan_save_chequeDate')?.value);
          savePayment.append('trans_cheque_bank_name', this.plan_save_transaction_form.get('plan_save_cheque_bank_name')?.value);
        }

        if (mode === 'Online') {
          savePayment.append('trans_online_transferred_from', this.plan_save_transaction_form.get('plan_save_online_transferred_from')?.value);
          savePayment.append('trans_online_bank_name', this.plan_save_transaction_form.get('plan_save_online_bank_name')?.value);
          savePayment.append('trans_online_acc_holder_name', this.plan_save_transaction_form.get('plan_save_online_acc_holder_name')?.value);
          savePayment.append('trans_online_recieved_date', this.plan_save_transaction_form.get('plan_save_online_recieved_date')?.value);
          savePayment.append('trans_cheque_bank_name', this.plan_save_transaction_form.get('plan_save_cheque_bank_name')?.value);
        }

        if (mode === 'Cash') {
          savePayment.append('trans_cash_submitted_by', this.plan_save_transaction_form.get('plan_save_cash_submitted_by')?.value);
          savePayment.append('trans_cash_date', this.plan_save_transaction_form.get('plan_save_cash_date')?.value);
        }

        if (mode === 'DD') {
          savePayment.append('trans_dd_bank_name', this.plan_save_transaction_form.get('plan_save_dd_bank_name')?.value);
          savePayment.append('trans_dd_name', this.plan_save_transaction_form.get('plan_save_dd_name')?.value);
          savePayment.append('trans_dd_number', this.plan_save_transaction_form.get('plan_save_dd_number')?.value);
          savePayment.append('trans_dd_submit_date', this.plan_save_transaction_form.get('plan_save_dd_submit_date')?.value);
          savePayment.append('trans_cheque_clear_date', this.plan_save_transaction_form.get('plan_save_dd_clear_date')?.value);
          savePayment.append('trans_cheque_bank_name', this.plan_save_transaction_form.get('plan_save_cheque_bank_name')?.value);
        }

        this.isButtonDisabled = true;
        this.billingservice.addPaymentDetail(savePayment).pipe(takeUntil(this.destroy$)).subscribe({
          next: (Response) => {
            this.isButtonDisabled = false;

            if (Response.data.CODE == 200 || Response) {
              Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: Response.data.MESSAGE,
                showConfirmButton: false,
                timer: 2000
              });

              this.plan_save_transaction_form.reset();
              this.reload();
              this.closeModal();
              this.submit_btn = false;

            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Failed',
                showConfirmButton: false,
                timer: 3000
              });
            }
          },
          error: () => {
            this.isButtonDisabled = false;
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: 'Failed',
              showConfirmButton: false,
              timer: 3000
            });
          }
        });

      } else {
        this.isButtonDisabled = false;
        this.submitted = true;
        this.submit_btn = true;
        Swal.fire('Alert', 'Please Fill all the fields', 'info');
      }

    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Paid Amount Should be Less than or Equal To Total Amount',
        showConfirmButton: false,
        timer: 3000
      });
    }
  }



  modalClose() {

    this.plan_save_transaction_form.reset();
    let value = 0;
    this.onSelectPaymentMode(value);
  }

  savePlanmodalClose() {

    this.plan_save_transaction_form.reset();
    this.plan_save_transaction_form.markAsUntouched();

    let value = 0;

    this.onSelectPlanPaymentMode(value);
    this.savePlancloseModal();
    this.plan_save_transaction_form.enable();
    this.isButtonDisabled = false;
  }

  DonePayment() {

    const findTotAmount = this.toMoney(this.regDetailForm.get('totalAmount')?.value);
    const findPaidAmount = this.toMoney(this.regDetailForm.get('paidAmount')?.value);
    const rotationAmount = this.toMoney(this.plan_done_transaction_form.get('plan_done_rotation_amnt')?.value);

    let getCurrentPaidAmount = this.toMoney(this.plan_done_transaction_form.get('plan_done_amount')?.value);
    getCurrentPaidAmount = rotationAmount ? 0 : getCurrentPaidAmount;
    const finalPaidAmount = this.toMoney(findPaidAmount + getCurrentPaidAmount);


    if (this.toPaise(finalPaidAmount) <= this.toPaise(findTotAmount)) {

      this.submit_btn = true;
      this.showTheValue = false;
      var plan_done_transValue = {
        trans_date: this.plan_done_transaction_form.get('plan_done_transaction_date')?.value,
        plan_done_all_recieved_date: this.plan_done_transaction_form.get('plan_done_all_recieved_date')?.value,
        // plan_done_cash_submitted_by: this.plan_done_transaction_form.get('plan_done_cash_submitted_by').value,
        // plan_done_recieved_by: this.plan_done_transaction_form.get('plan_done_recieved_by').value,
        trans_mode: this.plan_done_transaction_form.get('plan_done_transaction_mode')?.value,
        trans_amount: this.plan_done_transaction_form.get('plan_done_amount')?.value,
        trans_status: this.plan_done_transaction_form.get('plan_done_status')?.value,
        //trans_recieved_by: this.plan_done_transaction_form.get('plan_done_recieved_by').value,
        trans_acc_head: this.plan_done_transaction_form.get('plan_done_transaction_accHead')?.value,
        trans_acc_subhead: this.plan_done_transaction_form.get('plan_done_transaction_accHSubHead')?.value
      }


      if (Object.values(plan_done_transValue).every(value => value)) {

        // Validate amount
        const plan_done_amount = this.plan_done_transaction_form.get("plan_done_amount")?.value;
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

        let checkPayMode = this.plan_done_transaction_form.get("plan_done_transaction_mode")?.value;
        var plan_done_additionalValue = null;

        if (checkPayMode === 'Cheque') {
          plan_done_additionalValue = {
            trans_cheque_name: this.plan_done_transaction_form.get('plan_done_chequeName')?.value,
            trans_cheque_number: this.plan_done_transaction_form.get('plan_done_chequeNumber')?.value,
            trans_cheque_submit_date: this.plan_done_transaction_form.get('plan_done_chequeSubmitDate')?.value,
            trans_cheque_clear_date: this.plan_done_transaction_form.get('plan_done_chequeClearDate')?.value,
            trans_cheque_date: this.plan_done_transaction_form.get('plan_done_chequeDate')?.value,
            trans_cheque_bank_name: this.plan_done_transaction_form.get('plan_done_cheque_bank_name')?.value,
          };
        } else if (checkPayMode === 'Online') {
          plan_done_additionalValue = {
            // trans_online_transferred_from: this.plan_done_transaction_form.get('plan_done_online_transferred_from').value,
            // trans_online_bank_name: this.plan_done_transaction_form.get('plan_done_online_bank_name').value,
            // trans_online_acc_holder_name: this.plan_done_transaction_form.get('plan_done_online_acc_holder_name').value,
            // trans_online_recieved_date: this.plan_done_transaction_form.get('plan_done_online_recieved_date').value,
          };
        } else if (checkPayMode === 'Cash') {

          plan_done_additionalValue = {
            trans_cash_submitted_by: this.plan_done_transaction_form.get('plan_done_cash_submitted_by')?.value,

            // trans_cash_date: this.plan_done_transaction_form.get('plan_done_cash_date').value,
          };
        } else if (checkPayMode === 'DD') {
          plan_done_additionalValue = {
            // trans_dd_bank_name: this.plan_done_transaction_form.get('plan_done_dd_bank_name').value,
            trans_dd_name: this.plan_done_transaction_form.get('plan_done_dd_name')?.value,
            trans_dd_number: this.plan_done_transaction_form.get('plan_done_dd_number')?.value,
            trans_dd_submit_date: this.plan_done_transaction_form.get('plan_done_dd_submit_date')?.value,
            trans_dd_clear_date: this.plan_done_transaction_form.get('plan_done_dd_clear_date')?.value,
          };
        }

        const validateFields = (fields: any) => {
          const errors = [];

          // Custom validation logic
          if (checkPayMode === 'Cheque') {
            if (!fields.trans_cheque_name) errors.push("Cheque Name is required");
            if (!/^[A-Za-z\s]+$/.test(fields.trans_cheque_name)) errors.push("Cheque Name must only contain letters");
            if (!/^\d+$/.test(fields.trans_cheque_number)) errors.push("Cheque No must be numeric");
          } else if (checkPayMode === 'Online') {
            // if (!fields.trans_online_transferred_from) errors.push("Transferred From is required");
            // if (!/^[A-Za-z\s]+$/.test(fields.trans_online_transferred_from)) errors.push("Transferred From must only contain letters");

            // if (!fields.trans_online_acc_holder_name) errors.push("Account Holder Name is required");
            // if (!/^[A-Za-z\s]+$/.test(fields.trans_online_acc_holder_name)) errors.push("Account Holder Name must only contain letters");
          } else if (checkPayMode === 'Cash') {
            // if (!fields.trans_cash_submitted_by) errors.push("Submitted By is required");
            if (!/^[A-Za-z\s]+$/.test(fields.trans_cash_submitted_by)) errors.push("Submitted By must only contain letters");
            // Removed validation for cashDate
          } else if (checkPayMode === 'DD') {

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

          if (Object.values(plan_done_transValue || {}).every(value => value) && Object.values(plan_done_additionalValue || {}).every(value => value)) {

            this.showTheValue = true;
          } else {

            this.showTheValue = false;
          }
        }


      } else {
        Swal.fire('Alert', 'Some fields are missing', 'info');
      }



      if (this.showTheValue) {

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
            const rotationAmount = this.plan_done_transaction_form.get('plan_done_rotation_amnt')?.value;


            doneFormData.append('transaction_id', this.plan_done_transaction_form.get('done_transaction_id')?.value);
            doneFormData.append('booking_id', this.id);
            doneFormData.append('trans_date', this.plan_done_transaction_form.get('plan_done_transaction_date')?.value);
            doneFormData.append('trans_mode', this.plan_done_transaction_form.get('plan_done_transaction_mode')?.value);
            if (rotationAmount == 0 || rotationAmount == null || rotationAmount == '0') {
              doneFormData.append('trans_amount', this.plan_done_transaction_form.get('plan_done_amount')?.value);
            } else {
              doneFormData.append('trans_amount', (0).toString());
              doneFormData.append('show_amount', this.plan_done_transaction_form.get('plan_done_amount')?.value);
            }
            doneFormData.append('rotation_amnt', rotationAmount);
            doneFormData.append('trans_status', this.plan_done_transaction_form.get('plan_done_status')?.value);
            doneFormData.append('trans_recieved_by', this.plan_done_transaction_form.get('plan_done_recieved_by')?.value);
            doneFormData.append('trans_all_recieved_date', this.plan_done_transaction_form.get('plan_done_all_recieved_date')?.value);
            doneFormData.append('trans_acc_head', this.plan_done_transaction_form.get('plan_done_transaction_accHead')?.value);
            doneFormData.append('trans_acc_subhead', this.plan_done_transaction_form.get('plan_done_transaction_accHSubHead')?.value);
            doneFormData.append('buyer_id', this.prsn_id);

            this.measurements.controls.forEach((control, index) => {
              const blockNumber = control.get('mBlockNumber')?.value;

              if (blockNumber) {
                console.log(blockNumber)
                doneFormData.append('block_number', blockNumber);
              }
            });


            if (this.plan_done_transaction_form.get('plan_done_transaction_mode')?.value == 'Cheque') {
              doneFormData.append('trans_cheque_name', this.plan_done_transaction_form.get('plan_done_chequeName')?.value);
              doneFormData.append('trans_cheque_number', this.plan_done_transaction_form.get('plan_done_chequeNumber')?.value);
              doneFormData.append('trans_cheque_submit_date', this.plan_done_transaction_form.get('plan_done_chequeSubmitDate')?.value);
              doneFormData.append('trans_cheque_clear_date', this.plan_done_transaction_form.get('plan_done_chequeClearDate')?.value);
              doneFormData.append('trans_cheque_date', this.plan_done_transaction_form.get('plan_done_chequeDate')?.value);
              doneFormData.append('trans_cheque_bank_name', this.plan_done_transaction_form.get('plan_done_cheque_bank_name')?.value);
            }

            if (this.plan_done_transaction_form.get('plan_done_transaction_mode')?.value == 'Online') {
              doneFormData.append('trans_online_transferred_from', this.plan_done_transaction_form.get('plan_done_online_transferred_from')?.value);
              doneFormData.append('trans_online_bank_name', this.plan_done_transaction_form.get('plan_done_online_bank_name')?.value);
              doneFormData.append('trans_online_acc_holder_name', this.plan_done_transaction_form.get('plan_done_online_acc_holder_name')?.value);
              doneFormData.append('trans_cheque_bank_name', this.plan_done_transaction_form.get('plan_done_cheque_bank_name')?.value);
              // doneFormData.append('trans_online_recieved_date', this.plan_done_transaction_form.get('plan_done_online_recieved_date').value);
            }

            if (this.plan_done_transaction_form.get('plan_done_transaction_mode')?.value == 'Cash') {
              doneFormData.append('trans_cash_submitted_by', this.plan_done_transaction_form.get('plan_done_cash_submitted_by')?.value);
              // doneFormData.append('trans_cash_date', this.plan_done_transaction_form.get('plan_done_cash_date').value);
            }

            if (this.plan_done_transaction_form.get('plan_done_transaction_mode')?.value == 'DD') {
              doneFormData.append('trans_dd_bank_name', this.plan_done_transaction_form.get('plan_done_dd_bank_name')?.value);
              doneFormData.append('trans_dd_name', this.plan_done_transaction_form.get('plan_done_dd_name')?.value);
              doneFormData.append('trans_dd_number', this.plan_done_transaction_form.get('plan_done_dd_number')?.value);
              doneFormData.append('trans_dd_submit_date', this.plan_done_transaction_form.get('plan_done_dd_submit_date')?.value);
              doneFormData.append('trans_cheque_clear_date', this.plan_done_transaction_form.get('plan_done_dd_clear_date')?.value);
              doneFormData.append('trans_cheque_bank_name', this.plan_done_transaction_form.get('plan_done_cheque_bank_name')?.value);

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
    else {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Paid Amount Should be Less than or Equal To Total Amount',
        showConfirmButton: false,
        timer: 3000
      });
    }

    return;
  }



  donePlanmodalClose() {
    // this.plan_done_transaction_form.clearValidators();
    // this.plan_done_transaction_form.updateValueAndValidity();
    this.plan_done_transaction_form.reset();
    let value = 0;

    this.onSelectDonePlanPaymentMode(value);
    this.donePlancloseModal();
    this.plan_done_transaction_form.enable();
  }
  modalClosed() {

    this.paymentPlan_form.reset();
    this.closeModal();
    this.paymentPlan_form.enable();
    this.isButtonDisabled = false;
  }


  // public imagedata(data :any ){

  //     if(data.empimage){
  //     this.empimagedata=data.empimage
  //     }
  //     if(data.adharimage){
  //     this.adharimagedata=data.adharimage
  //     }
  //     if(data.panimage){
  //     this.panimagedata=data.panimage
  //     }
  // }
  // CheckReason(id) {
  //   return this.reason.find(x => x.LookupDataId === id).LookupValue;
  // }

  CheckReason(ids: any): string {

    if (!ids) return '';

    const idArray = Array.isArray(ids) ? ids : (typeof ids === 'string' && ids.includes(',')) ? ids.split(',') : [ids];

    const reasons = idArray.map(id => {
      const found = this.reason.find((r: any) => r.LookupDataId == id);
      return found ? found.LookupValue : 'Unknown';
    });

    return reasons.filter(r => r).join(', ');
  }

  DeletePayment(id:any, acc_head:any, acc_sub_head:any, bank_name:any, amount:any) {

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
            this.reload();
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


  UpdateWitnessData() {
    const isBookingValid = this.updateBookingDetail();
    if (!isBookingValid) {
      return;
    }
    Swal.fire({
      icon: 'success',
      title: 'Success!',
      showConfirmButton: false,
      timer: 2000,

    }).then(() => {

      this.router.onSameUrlNavigation = 'reload';
    });
  }

  UpdateAttorneyData() {
    const isBookingValid = this.updateBookingDetail();
    if (!isBookingValid) {
      return;
    }
    Swal.fire({
      icon: 'success',
      title: 'Success!',
      showConfirmButton: false,
      timer: 2000,

    }).then(() => {

      this.router.onSameUrlNavigation = 'reload';
    });
  }

  UpdatePaymentDetailData() {
    const isBookingValid = this.updateBookingDetail();
    if (!isBookingValid) {
      return;
    }
    Swal.fire({
      icon: 'success',
      title: 'Success!',
      showConfirmButton: false,
      timer: 2000,

    }).then(() => {

      this.router.onSameUrlNavigation = 'reload';
    });
  }

  UpdatePaymentPlanData() {
    const isBookingValid = this.updateBookingDetail();
    if (!isBookingValid) {
      return;
    }
    Swal.fire({
      icon: 'success',
      title: 'Success!',
      showConfirmButton: false,
      timer: 2000,

    }).then(() => {

      this.router.onSameUrlNavigation = 'reload';
    });
  }

  UpdateAttachmentData() {
    const isBookingValid = this.updateBookingDetail();
    if (!isBookingValid) {
      return;
    }
    Swal.fire({
      icon: 'success',
      title: 'Success!',
      showConfirmButton: false,
      timer: 2000,

    }).then(() => {

      this.router.onSameUrlNavigation = 'reload';
    });
  }


  get measurements(): FormArray {
    return this.regMeasurement.get('measurements') as FormArray;
  }

  // createMeasurementGroup(data?: any): FormGroup {
  //   return this._fb.group({
  //     mVillage: [data?.mVillage || ''],
  //     mSize: [data?.mSize || ''],
  //     mMouja: [data?.mMouja || ''],
  //     mRakba: [data?.mRakba || ''],
  //     mPlotNumber: [data?.mPlotNumber || ''],
  //     mBlockNumber: [data?.mBlockNumber || '']
  //   });
  // }



  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.dtTrigger1.unsubscribe();
    this.dtTrigger2.unsubscribe();
    this.dtTrigger3.unsubscribe();
    this.dtTrigger4.unsubscribe();
    this.dtTrigger5.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}




export interface UpdateMeasurementData {
  regMeasurement: FormGroup;
  resp: any;
}


export function updateMeasurementFields(data: UpdateMeasurementData): any {
  const { regMeasurement, resp } = data;

  const updatedValues = {
    mPlotNumber: resp['plotDetails']['custom7'],
    mKhasra: resp['plotDetails']['custom7'],
    mMeasurmentunit: resp['plotDetails']['UOM'],
    mRakba: resp['regDetails']['plot_size'],
    mVillage: resp['plotDetails']['custom6'],
    mSize: resp['plotDetails']['custom4'] + '*' + resp['plotDetails']['custom5'],
    registry_booking_id: resp['regBuyer']['booking_id'],
    company_id: resp['regBuyer']['company_id'],
  };

  regMeasurement.get('mPlotNumber')?.setValue(updatedValues.mPlotNumber);
  regMeasurement.get('mKhasra')?.setValue(updatedValues.mKhasra);
  regMeasurement.get('mMeasurmentunit')?.setValue(updatedValues.mMeasurmentunit);
  regMeasurement.get('mRakba')?.setValue(updatedValues.mRakba);
  regMeasurement.get('mVillage')?.setValue(updatedValues.mVillage);
  regMeasurement.get('mSize')?.setValue(updatedValues.mSize);
  regMeasurement.get('registry_booking_id')?.setValue(updatedValues.registry_booking_id);
  regMeasurement.get('company_id')?.setValue(updatedValues.company_id);

  return updatedValues;
}


