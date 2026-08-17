import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, ChangeDetectorRef, TemplateRef, Injectable, OnDestroy, asNativeElements } from '@angular/core';
import { NgbCalendar, NgbDateAdapter, NgbDate, NgbModule, NgbDateParserFormatter, NgbDateStruct, NgbInputDatepickerConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { debounceTime, distinctUntilChanged, map, startWith, skip, takeUntil } from 'rxjs/operators';
import { CrmService } from '../../../services/crm.service';
import { ProjectService } from '../../../services/project.service';
import { HrService } from 'src/app/services/hr.service';
import { DataTableDirective } from 'angular-datatables';
import Swal from 'sweetalert2';
import { DatePipe } from '@angular/common';
import { environment } from 'src/environments/environment';
import { ProductService } from 'src/app/services/product.service';
import { BillingService } from 'src/app/services/billing.service';
import { BookingRegistryModalComponent } from 'src/app/shared/booking-registry-modal/booking-registry-modal.component';
import { forkJoin } from 'rxjs';
import { CrmEnquiryService } from '../../../shared/crm-enquiry.service';


class notesmangment {
  Date: string;
  Details: string;
}

class BookingSales {
  Info: string;
  PlotType: String;
  BookingStatus: string;
}
class taskDataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}
class Tasks {
  CompanyId: string;
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
class EnquiryManagement {
  CompanyId: string;
  EnquiryId: string;
  EnqDate: string;
  EnqType: string;
  VisitorName: string;
  RefferedBy: string;
  MobileNumber: string;
  CityId: string;
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
@Injectable()
export class CustomAdapter extends NgbDateAdapter<string> {

  readonly DELIMITER = '-';
  customerId: any;
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
 * This Service handles how the date is rendered and parsed from keyboard i.e. in the bound input field.
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
  selector: 'app-crm-enquiry-details',
  templateUrl: './crm-enquiry-details.component.html',
  styleUrls: ['./crm-enquiry-details.component.css'],
  providers: [
    NgbInputDatepickerConfig,
    { provide: NgbDateAdapter, useClass: CustomAdapter },
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
    { provide: DatePipe }
  ]
})

export class AddCrmEnquiryComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  // isViewMode: boolean = false;

  DatatableParameter1 = {
    visitor_name: '',
    visitor_datetime: '',
    CompanyId: '',
    Customer_id: '',
    dateFrom: '',
    dateTo: '',
  };
  viewedNoteId: number | null = null;

  amtPaid = { 0: false };
  paidDate = { 0: false };
  reason = { 0: false };
  chequeDate = { 0: false };
  chequeNumber = { 0: false };
  transactionId = { 0: false };
  payedTo = { 0: false };
  bankName = { 0: false };
  submitDate = { 0: false };
  selectedValue = '0';
  pipe = new DatePipe('en-US');
  date = new Date();
  myFormat: any;
  [x: string]: any;

  visitorData: any[] = []; // Initialize visitorData

  dtOptions: DataTables.Settings = {};
  dtOptions1: DataTables.Settings = {};
  dtOptions2: DataTables.Settings = {};
  dtOptions3: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  dtTrigger1: Subject<any> = new Subject<any>();
  dtTrigger2: Subject<any> = new Subject<any>();
  dtTrigger3: Subject<any> = new Subject<any>();
  dataa: Tasks[];
  bookdata: BookingSales[];
  customerdataList = [];
  customerData = [];
  keyword = 'name';
  respStatus = [];
  resp: any;
  imageUrl: any = '';
  editFile: boolean = true;
  div1: boolean = true;
  followupadd: boolean;
  taskActionButton: boolean = true;
  hideTaskButton: boolean = true;
  hideEditNotesIcon: boolean = true;
  isHideTaskSave: boolean = true;
  hideDeleteNotesIcon: boolean = true;
  hideAddMoreFollowUpButton: boolean = false;
  hideNotesViewnotesModal: boolean = true;
  isAddingTask: boolean = false;
  removeUpload: boolean = false;
  paymentdetail: FormGroup;
  MoreFollowUps: FormGroup;
  addCrmEnquirygroup: FormGroup;

  OnlyPLotShownBY = new FormGroup({
    selectedPlotShownBy: new FormControl(''),
  });

  constructor(private crmservice: CrmService, private route: ActivatedRoute, private ngbCalendar: NgbCalendar, private cd: ChangeDetectorRef, private activatedRoute: ActivatedRoute, private dateAdapter: NgbDateAdapter<string>, private router: Router, public http: HttpClient, private CrmService: CrmService, private hrservice: HrService, private ProjectService: ProjectService, private chRef: ChangeDetectorRef, private datePipe: DatePipe, private formBuilder: FormBuilder, private productService: ProductService, private billingservice: BillingService, private modalService: NgbModal, private crmEnquiryService: CrmEnquiryService, private fb: FormBuilder) {
    if (sessionStorage.getItem('token') == undefined && sessionStorage.getItem('UserName') == undefined) {
      this.router.navigate(['/']);
    }
    this.paymentdetail = formBuilder.group({
      address: formBuilder.array([])
    });
    this.MoreFollowUps = formBuilder.group({
      address: formBuilder.array([])
    });

  }
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  @ViewChild(DataTableDirective) datatable_directive: any;

  @ViewChild('notesclosebutton') notesclosebutton;
  @ViewChild('headerclick') headerclick;
  @ViewChild('nheaderclick') nheaderclick;
  @ViewChild('vheaderclick') vheaderclick;
  @ViewChild('bheaderclick') bheaderclick;
  @ViewChild('NgbdDatepicker') d: NgbDateStruct;
  @ViewChild('fileInput') el: ElementRef;
  @ViewChild('closebutton') closebutton;
  @ViewChild('closebutton1') closebutton1;
  @ViewChild('labelImport') labelImport: ElementRef;
  @ViewChild('notesModalButton') notesModalButton: ElementRef;
  @ViewChild('taskEditModel') taskEditModel: ElementRef;
  @ViewChild('addmodal') addmodal: ElementRef;
  @ViewChild('addbookingmodal') addbookingmodal: ElementRef;
  @ViewChild('swiper') swiper: ElementRef;
  @ViewChild('title') title: ElementRef;
  public model: any;
  productdata = [];
  productdataList = [];
  minDate = { year: 1900, month: 1, day: 1 };
  maxDate = { year: 2099, month: 12, day: 31 };
  taskmngDatatableParameter = { Assignee: '', reporters: '', taskDate: '', tastStatus: '', Tasktype: '', EnquiryId: '' };
  notesModalHadding: any;
  VisitorModalHadding: any;
  attachmentModalHadding: any;
  attachmentstatus: any;
  previousStageId: any = null;
  lastStageValue: any = null;
  isNotesSaved = false;


  attachmentimageName;
  fileuploads;
  filecontent;
  status;
  notesdata: notesmangment[];

  task_status = new FormGroup({
    tstatus: new FormControl('')
  });

  taskActionFrom = new FormGroup({
    taskAction: new FormControl('')
  });

  addCrmNotes = new FormGroup({
    notes_id: new FormControl(''),
    //notes_date:new FormControl('',Validators.required),
    detail: new FormControl('', Validators.required)
  });
  bookingform = new FormGroup({
    plot_type: new FormControl('', Validators.required),
    booking_status: new FormControl('')
  })
  employeetypenamelis() {
    let employeelist = new FormData();
    this.CrmService.getEmployee(employeelist).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.employee = resp.data;
    });
  }
  addTask = new FormGroup({
    status: new FormControl('', Validators.required),
    // date : new FormControl('',Validators.required),
    // reporter: new FormControl('',Validators.required),
    // assignee:new FormControl('',Validators.required),
    // task_title: new FormControl('',Validators.required),
    contact_no: new FormControl(),
    task_description: new FormControl('', Validators.required),
    // task_completion: new FormControl(''),
    taskAction: new FormControl('', Validators.required),
    visited_plot: new FormControl(''),
    // taskResult : new FormControl(''),
    task_action_response: new FormControl(''),
    task_action_response_logs: new FormControl(''),
    visitor_name: new FormControl(''),
    last_followup_date: new FormControl(''),
    task_id: new FormControl(''),
    customer_id: new FormControl(''),
    enquiry_id: new FormControl('')
  });


  addCrmEnquiry = this.form = this.formBuilder.group({
    EnquiryId: new FormControl('',),
    Enquiry_date: new FormControl('', Validators.required),
    enquiry_cust: new FormControl('', Validators.required),
    enquiry_mode: new FormControl(''),
    enquiry_no: new FormControl('', [Validators.required, Validators.maxLength(10), Validators.pattern(/^[0-9]\d*$/), Validators.minLength(10)]),
    enquiry_reference: new FormControl('', Validators.required),
    enquiry_state: new FormControl('', Validators.required),
    city_enquiry: new FormControl('', Validators.required),
    enquiry_address: new FormControl('', Validators.required),
    tags: new FormControl([]),
    txt_introduce_by: new FormControl(''),
    introduce_by_m: new FormControl('')
  });
  addBookingDetail = this.form = this.formBuilder.group({

    bkCustId: new FormControl(''),
    bktype: new FormControl('',),
    bktitle: new FormControl('', Validators.required),
    bkCustomerNm: new FormControl('', Validators.required),
    bkbkAge: new FormControl('',),
    bkCategory: new FormControl('', Validators.required),
    bkMobileNo: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]\d*$/)]),
    bkAlternate: new FormControl('',),
    bkTehsil: new FormControl('', Validators.pattern('^[a-zA-Z \-\']+')),
    bkDistrict: new FormControl('', Validators.pattern('^[a-zA-Z \-\']+')),
    bkCity: new FormControl('', Validators.pattern('^[a-zA-Z \-\']+')),
    bkState: new FormControl('', Validators.pattern('^[a-zA-Z \-\']+')),
    bkPincode: new FormControl('', Validators.required),
    bkOccupation: new FormControl('', Validators.pattern('^[a-zA-Z \-\']+')),
    bkCaretaker: new FormControl('', Validators.required),
    bkSpouse: new FormControl('', Validators.required),
    bkAddress: new FormControl('', Validators.required),
    bkPlotName: new FormControl('', Validators.required),
    productId: new FormControl(''),
    bkPlotSqft: new FormControl(''),
    bkPlotAmt: new FormControl(''),
    bkKhasraNo: new FormControl(''),
    bkTargetDate: new FormControl('', Validators.required),
    bkFront: new FormControl(''),
    bkDepth: new FormControl(''),
    checkupWitness: new FormControl(''),
    bkFirstName: new FormControl(''),
    bkGurdian: new FormControl(''),
    bkFirstAddress: new FormControl(''),
    checkupWitnesstwo: new FormControl(''),
    bkSecondName: new FormControl(''),
    bkSecoGurdian: new FormControl(''),
    bkSecondAddress: new FormControl(''),
  });
  task_Assignee = new FormGroup({
    TaskAssigne: new FormControl('', Validators.required)
  });
  nextFollowup = new FormGroup({
    followup_date: new FormControl('', Validators.required),
    followup_Time: new FormControl('', Validators.required),
    followup_notes: new FormControl('', Validators.required),
  });
  nextFollowupedit = new FormGroup({
    editfollowup_date: new FormControl('', Validators.required),
    editfollowup_Time: new FormControl('', Validators.required),
    editfollowup_notes: new FormControl('', Validators.required),
  });

  taskDetails = new FormGroup({
    description: new FormControl('', Validators.required),
    title: new FormControl('', Validators.required),
    follwoupDetails: new FormControl(''),
    status: new FormControl('', Validators.required),
    taskAction: new FormControl(''),
    customer_name: new FormControl('', Validators.required)
  });

  DatatableParameter = { notesType: '', Customer_id: '' };
  attachmentDatatableParameter = { Customer_id: '' };
  BookingDatatableParameter = { regPersonsID: '', CustomerId: '' };
  // taskDatatableParameter = {CompanyId: '', Customer_id : ''};
  workDatatableParameter = { Customer_id: '' };

  viewenquiry() { this.router.navigate(['/crm-enquiry-view']); }

  myControl = new FormControl();
  options: string[] = ['One', 'Two', 'Three'];
  filteredOptions!: Observable<string[]>;
  ngOnChanges() { }

  ngOnInit(): void {



    this.addCrmEnquiry = this.fb.group({
      Enquiry_date: [''],
      enquiry_cust: [''],
      enquiry_no: [''],
      enquiry_mode: [''],
      enquiry_reference: [''],
      city_enquiry: [''],
      stage: [''],
      enquiry_address: [''],
      EnquiryId: [''],
      enquiry_state: [''],
      tags: [[]],
      introduced_by_view: ['']
    });

    // Set form data to the service
    this.crmEnquiryService.setForm(this.addCrmEnquiry);


    this.StagesStatuslist();
    this.isShown = false;
    this.isHide = false;
    this.filteredOptions = this.myControl.valueChanges

      .pipe(
        startWith(''),
        map(value => this._filter(value))
      );
    this.Method = this.activatedRoute.snapshot.paramMap.get('method');
    this.EnquiryIds = this.activatedRoute.snapshot.paramMap.get('id');
    this.CustomerIds = this.activatedRoute.snapshot.paramMap.get('customerID');



    if (this.Method == 'add') {
      this.div1 = false;
      this.enquiryactive = '';
    } else {


      this.enquiryview = false;
      if (this.Method == 'view') {

        this.taskActionButton = false;
        this.hideEditNotesIcon = false;
        this.hideTaskButton = false;
        this.hideDeleteNotesIcon = false;
        this.hideNotesViewnotesModal = false;
        $('#headerEnquiryTitle').text('View Customer Profile');
        this.enquiryview = true;
        setTimeout(() => {
          $('.form-control').prop('disabled', true);
          $('.custom-file-input').prop('disabled', true);
          $('.enquryButton').hide();
        }, 500);
      }
      this.editenquiry(this.EnquiryIds);
      this.notesdatatabl();
      this.bookingDatatable();
      this.enquiryactive = 'active';
    }
    this.CrmUserRole = false;
    if (sessionStorage.getItem('UserRole') == 'CRM User') {
      this.CrmUserRole = true;
    }
    this.CRMAdmin = false;
    if (sessionStorage.getItem('UserRole') == 'CRM Admin') {
      this.CRMAdmin = true;
    }
    this.addCrmEnquiry.controls['enquiry_mode'].setValue('2');
    this.datatableCode();
    this.employeetypenamelis();
    // this.lookupdatalist();
    this.getTaskActionlist();
    this.lookupdatalist();
    this.employeelistData(event);
    this.enquiryModeList();
    this.customerTags();

    this.addCrmEnquiry.get('stage')?.valueChanges
      .pipe(skip(1), takeUntil(this.destroy$))
      .subscribe(value => {
        this.onStageChange(value);
      });
  }


  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  onEmployeeSearch(e) {
    if (e.length > 0) {
      this.employeelistData(e);
    } else {
      this.employeedataList = [];
    }
  }

  employeelistData(e) {
    let customerlist = new FormData();
    //  customerlist.append('value', e);

    this.hrservice.getEmployeeDetail(customerlist).pipe(takeUntil(this.destroy$)).subscribe((resp) => {
      this.customerSuggestion = resp.data;
      this.customerData = this.customerSuggestion.map(item => ({
        id: item.EmployeeId,
        name: item.EmployeeName
      }));
      this.employeedataList = this.customerData; // Assign directly
    });
  }


  addNewAddressGroup() {
    const add = this.paymentdetail.get('address') as FormArray;
    add.push(this.formBuilder.group({
      bkPayment: [],
      bkAmtPaid: [],
      bkPaidDate: [],
      bkChequeNo: [],
      bkchequeDate: [],
      bkTransactionId: [],
      paidCustomerNm: [],
      bkRemark: [],
      bksubmitdate: [],
      bkbankName: [],
    }))
  }
  // deleteAddressGroup(index: number) {
  //   const add = this.paymentdetail.get('address') as FormArray;
  //   add.removeAt(index)
  // }

  private _filter(value: string): string[] {
    //this.productlistData();
    const filterValue = value.toLowerCase();
    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }

  lookupdatalist() {
    let lookupStatus = "Status";
    let Statusdata = new FormData();
    Statusdata.append('lookupname', lookupStatus);
    this.crmservice.fetch_lookupdata(Statusdata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
      const allowedStatuses = ['active', 'completed','pending'];
      this.respStatus = (Response?.data || []).filter((item: any) =>
        allowedStatuses.includes((item?.LookupValue || '').toString().trim().toLowerCase())
      );
      this.applyDefaultStatusIfEmpty();
    });
  }


  addTaskModal() {
    this.addTask.reset();
    this.nextFollowup.reset();
    this.followupadd = true;
    this.additionalFollow = false;
    this.isAddingTask = true;
    this.Notesubmitted = false;
    this.addmodal.nativeElement.click();
    this.taskHeading = "Add New Task";
    this.addTask.controls.visitor_name.setValue(this.visitorName);
    this.addTask.controls.visitor_name.disable();
    this.addTask.controls.contact_no.setValue(this.addCrmEnquiry.get('enquiry_no').value);
    this.addTask.controls.contact_no.disable();
    this.addTask.controls.customer_id.setValue(this.CustomerId);
    this.hideAddMoreFollowUpButton = false;
    this.isHideTaskSave = true;
    this.applyDefaultStatusIfEmpty();
    this.applyDefaultTaskActionIfEmpty();
    // this.addTask.controls.task_action_response.disable();
    // this.addTask.controls.task_completion.disable();
    // this.nextFollowup.disable();
  }

  selectEvent(item) {
    this.addBookingDetail.get('productId').setValue(item.id);
    let productData = new FormData();
    productData.append('productId', item.id);
    this.productService.productData(productData).pipe(takeUntil(this.destroy$)).subscribe((Response) => {
      this.addBookingDetail.get('bkPlotAmt').setValue(Response.DATA[0][11]);
      this.addBookingDetail.get('bkKhasraNo').setValue(Response.DATA[0][22]);
      this.addBookingDetail.get('bkPlotSqft').setValue(Response.DATA[0][10]);
      this.addBookingDetail.get('bkFront').setValue(Response.DATA[0][19]);
      this.addBookingDetail.get('bkDepth').setValue(Response.DATA[0][20]);
    });
    this.productdataList = [];
  }
  selectCust(e) {
    this.customerdataList = [];
  }
  onChangeSearch(e) {
    if (e.length > 2) {
      this.productlistData(e);
    } else {
      this.productdataList = [];
    }
  }
  onCustomerSearch(e) {
    if (e.length > 2) {
      this.customerlistData(e);
    } else {
      this.customerdataList = [];
    }
  }
  customerlistData(e) {
    let customerlist = new FormData();
    customerlist.append('value', e);
    this.CrmService.getCustomerDetail(customerlist).pipe(takeUntil(this.destroy$)).subscribe((resp) => {
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
  onFocused(e) { }
  productlistData(e) {
    let productlist = new FormData();
    productlist.append('value', e);
    productlist.append('type', 'Land');
    this.CrmService.getproduct(productlist).pipe(takeUntil(this.destroy$)).subscribe((resp) => {
      this.product = resp.data;
      let i;
      this.productdata = [];
      for (i = 0; i < this.product.length; i++) {
        this.productdata.push({
          id: this.product[i].ProductId,
          name: this.product[i].ProductName,
        });
      }
      this.productdataList = [this.productdata];
      this.productdataList = this.productdataList[0];
    });
  }

  editbookingPage(plot_id, enquiry_id, reg_detail_id, type) {
    const initialState: any = { 'coments': 'Booking' };
    // const modalRef = this.modalService.open(BookingRegistryModalComponent, { size: 'lg', backdrop: 'static', keyboard: true });
    // modalRef.componentInstance.flg = "addBooking";
    // modalRef.componentInstance.datatable_directive = this.datatable_directive;
    // modalRef.componentInstance.bheaderclick = this.bheaderclick;
    // modalRef.componentInstance.id = this.EnquiryIds ;
    const enquirry_id = this.activatedRoute.snapshot.paramMap.get('id');
    let getEnquiryId = new FormData();
    getEnquiryId.append('EnquiryId', enquirry_id);
    getEnquiryId.append('reg_detail_id', reg_detail_id);

    this.CrmService.getBookedPlotDetails(getEnquiryId).pipe(takeUntil(this.destroy$)).subscribe(Response => {

      const plotData = Response.data[0]; // you can do a null check here too

      // open modal only after data is received
      const modalRef = this.modalService.open(BookingRegistryModalComponent, { size: 'lg', backdrop: 'static', keyboard: true });
      if (type == 'view') {
        modalRef.componentInstance.flg = "viewBooking";
      } else {
        modalRef.componentInstance.flg = "editBooking";
      }
      modalRef.componentInstance.datatable_directive = this.datatable_directive;
      modalRef.componentInstance.bheaderclick = this.bheaderclick;
      modalRef.componentInstance.id = this.EnquiryIds;

      //  Pass the data to the modal
      modalRef.componentInstance.bookedPlotData = plotData;

    });

    // this.visitedPlotsData();


    // let getPlotDetails = new FormData();

    // getPlotDetails.append('plotId', plot_id);
    // getPlotDetails.append('EnqId', enquiry_id);
    // getPlotDetails.append('personType', 'Buyer');

    // this.billingservice.getCrmPLotData(getPlotDetails).subscribe(resp => {

    // })


    // // this.submitted = false;

  }

  bookingPage() {
    const initialState: any = { 'coments': 'Booking' };
    const modalRef = this.modalService.open(BookingRegistryModalComponent, { size: 'lg', backdrop: 'static', keyboard: true });
    modalRef.componentInstance.flg = "addBooking";
    modalRef.componentInstance.datatable_directive = this.datatable_directive;
    modalRef.componentInstance.bheaderclick = this.bheaderclick;
    modalRef.componentInstance.id = this.EnquiryIds;

    let getEnquiryId = new FormData();
    getEnquiryId.append('EnquiryId', this.enquiryBk);
    this.CrmService.getCrmEnquiryMngmt(getEnquiryId).pipe(takeUntil(this.destroy$)).subscribe(Response => {

      this.addBookingDetail.patchValue({
        bkCustId: Response.data[0].EnquiryId,
        bkCustomerNm: Response.data[0].VisitorName,
        bkMobileNo: Response.data[0].MobileNumber,
        bkCity: Response.data[0].CityId,
        bkState: Response.data[0].State,
        bkAddress: Response.data[0].Address,
        bkCategory: Response.data[0].Category,
        bktitle: Response.data[0].Title,
      });
    });

    this.visitedPlotsData();

    modalRef.result.then(
      (result) => {
        this.bsReload();
      }
    );


    // this.submitted = false;

  }


  visitedPlotsData() {
    let visitedPlotsFormData = new FormData();
    visitedPlotsFormData.append('type', 'VisitedPlots');

    this.CrmService.getproduct(visitedPlotsFormData).pipe(takeUntil(this.destroy$)).subscribe((resp) => {
      this.visitedPlots = resp.data.map(plot => ({
        id: plot.PlotId,
        name: plot.PlotName
      }));
    });
  }


  getTaskActionlist() {
    let actionData = new FormData();
    this.CrmService.getTaskAction(actionData).pipe(takeUntil(this.destroy$)).subscribe(Response => {
      this.taskAction = Response.data
      this.applyDefaultTaskActionIfEmpty();
    });
  }

  private getDefaultCallTaskActionId(): string {
    if (!Array.isArray(this.taskAction)) {
      return '';
    }

    const callAction = this.taskAction.find((action: any) =>
      (action?.LookupValue || '').toString().trim().toLowerCase() === 'call'
    );

    return callAction?.LookupDataId ? String(callAction.LookupDataId) : '';
  }

  private applyDefaultTaskActionIfEmpty(): void {
    const taskActionControl = this.addTask.get('taskAction');
    if (!taskActionControl) {
      return;
    }

    const currentValue = taskActionControl.value;
    if (currentValue !== null && currentValue !== undefined && currentValue !== '') {
      return;
    }

    const defaultCallActionId = this.getDefaultCallTaskActionId();
    if (defaultCallActionId) {
      taskActionControl.setValue(defaultCallActionId);
    }
  }

  private applyDefaultStatusIfEmpty(): void {
    const statusControl = this.addTask.get('status');
    if (!statusControl) {
      return;
    }

    const currentValue = statusControl.value;
    if (currentValue !== null && currentValue !== undefined && currentValue !== '') {
      return;
    }

    const activeStatus = (this.respStatus || []).find((status: any) =>
      (status?.LookupValue || '').toString().trim().toLowerCase() === 'active'
    );

    if (activeStatus?.LookupDataId) {
      statusControl.setValue(String(activeStatus.LookupDataId));
    }
  }

  ngAfterContentInit() {
    // this.myFormat=this.pipe.transform(this.date,'dd-MM-yyyy')
    // this.addCrmEnquiry.controls['Enquiry_date'].setValue(this.myFormat);
  }
  addtask() {
    this.submitted = false;
    this.saveButton = true;
    this.addTask.reset();
  }
  Newnotesadd() {
    this.addCrmNotes.reset();
    this.Notesubmitted = false;
    this.notesModalHadding = 'Add New Notes'
    // this.notesModalButton.nativeElement.click();
  }

  editTaskAssigne() {
    if (sessionStorage.getItem('UserRole') == 'Admin' || sessionStorage.getItem('UserRole') == 'HR Admin' || sessionStorage.getItem('UserRole') == 'CRM Admin') {
      this.AccessAssigne = false;
    }
  }

  editTaskAssigne1() {
    if (sessionStorage.getItem('UserRole') == 'Admin' || sessionStorage.getItem('UserRole') == 'HR Admin' || sessionStorage.getItem('UserRole') == 'CRM Admin') {
      this.AccessAssigne1 = false;
    }
  }

  btnReload() {
    this.headerclick.nativeElement.click();
  }


  generateFullReport() {
    const enquiryId = this.activatedRoute.snapshot.paramMap.get('id') || this.EnquiryIds;

    if (!enquiryId) {
      Swal.fire('Alert', 'Enquiry id not found.', 'info');
      return;
    }

    const reportFormData = new FormData();
    reportFormData.append('enquiry_id', enquiryId);
    this.isGeneratingFullReport = true;

    this.crmservice.generateFullReport(reportFormData).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.isGeneratingFullReport = false;

        const hasReportData =
          response &&
          (
            (Array.isArray(response.CUSTOMER) && response.CUSTOMER.length > 0) ||
            (Array.isArray(response.BOOKING) && response.BOOKING.length > 0) ||
            (Array.isArray(response.TASKS) && response.TASKS.length > 0) ||
            (Array.isArray(response.NOTES) && response.NOTES.length > 0) ||
            (Array.isArray(response.VISITORS) && response.VISITORS.length > 0)
          );

        if (!hasReportData) {
          Swal.fire({
            icon: 'info',
            title: 'No Data',
            text: response?.MESSAGE || 'No report data available for this enquiry.',
            showConfirmButton: false,
            timer: 2500
          });
          return;
        }

        this.openFullReportPreview(response, enquiryId);
      },
      error: () => {
        this.isGeneratingFullReport = false;
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Failed to generate full report.',
          showConfirmButton: false,
          timer: 3000
        });
      }
    });
  }

  private openFullReportPreview(reportData: any, enquiryId: string) {
    const reportWindow = window.open('', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');

    if (!reportWindow) {
      Swal.fire('Alert', 'Please allow popups to view the full report.', 'info');
      return;
    }

    reportWindow.document.write(this.buildFullReportHtml(reportData, enquiryId));
    reportWindow.document.close();
  }

  private buildFullReportHtml(reportData: any, enquiryId: string): string {

    type ReportColumn = { key: string; label: string; type?: 'date' | 'time'; preserveLines?: boolean };
    type ReportDetailRow = { label: string; value: any; type?: 'date' | 'time'; preserveLines?: boolean };

    const customer = Array.isArray(reportData?.CUSTOMER) ? reportData.CUSTOMER[0] || {} : {};
    const visitors = Array.isArray(reportData?.VISITORS) ? reportData.VISITORS : [];
    const tasks = Array.isArray(reportData?.TASKS) ? reportData.TASKS : [];
    const notes = Array.isArray(reportData?.NOTES) ? reportData.NOTES : [];
    const bookingRows = Array.isArray(reportData?.BOOKING) ? reportData.BOOKING : [];
    const customerName = this.getReportFirstValue(customer, ['FULLNAME', 'VISITOR_NAME', 'visitor_name']) || enquiryId;
    const customerPhone = this.getReportFirstValue(customer, ['PHONENUMBER', 'VISITOR_MOBILE', 'visitor_mobile', 'visitor_Mobile']) || `Enquiry ID: ${enquiryId || ''}`;
    const customerStage = this.getCustomerProfileStage(customer);
    const primaryCustomerRows: ReportDetailRow[] = [
      { label: 'Stage', value: customerStage },
      { label: 'Full Name', value: customer?.FULLNAME },
      { label: 'Contact Person', value: customer?.CONTACTBY },
      { label: 'Phone Number', value: customer?.PHONENUMBER },
      { label: 'Alt Number', value: customer?.ALTNUMBER },
      { label: 'Email ID', value: customer?.EMIALID },
      { label: 'Assigned Tags', value: customer?.TAGS }
    ];
    const normalizedVisitors = visitors.map((visitor: any) => ({
      ...visitor,
      REPORT_VISITED_PLOT: visitor?.VISITED_PLOT || visitor?.VISITED_PLOTS || '',
      REPORT_PLOT_RATE: visitor?.PLOT_RATE || visitor?.RATE || '',
      REPORT_PLOT_SHOWN_BY: visitor?.PLOT_SHOWN_BY || visitor?.PLOTSHOWNBY || ''
    }));
    const siteVisitColumns: ReportColumn[] = [
      { key: 'VISITOR_DATE', label: 'Visitor Date', type: 'date' },
      { key: 'VISITOR_TIME', label: 'Visitor Time', type: 'time' },
      { key: 'REPORT_VISITED_PLOT', label: 'Visited Plot' },
      { key: 'PLOT_NO', label: 'Plot No' },
      { key: 'PLOT_DIMENSION', label: 'Plot Dimension' },
      { key: 'PLOT_AREA', label: 'Plot Area' },
      { key: 'REPORT_PLOT_RATE', label: 'Plot Rate' },
      { key: 'REPORT_PLOT_SHOWN_BY', label: 'Plot Shown By' }
    ];


    // ---------------- TASKS (UPDATED LOGIC) ----------------
    const normalizedTasks: any[] = [];

    tasks.forEach((task: any) => {
      const logs = String(task?.RESPONSE_LOGS || '').split('\n').filter(l => l.trim());

      if (logs.length) {
        logs.forEach((log: string, index: number) => {
          if (log.includes('->')) {
            const [date, text] = log.split('->');

            normalizedTasks.push({
              TASK_ACTION: task.TASK_ACTION,
              TASK_STATUS: task.TASK_STATUS,
              RESPONSE_DATE: date?.trim(),
              RESPONSE_TEXT: text?.trim(),
              isFirst: index === 0,
              rowSpan: index === 0 ? logs.length : 0
            });
          }
        });
      } else {
        normalizedTasks.push({
          TASK_ACTION: task.TASK_ACTION,
          TASK_STATUS: task.TASK_STATUS,
          RESPONSE_DATE: '',
          RESPONSE_TEXT: '',
          isFirst: true,
          rowSpan: 1
        });
      }
    });

    const taskColumns: ReportColumn[] = [
      { key: 'TASK_ACTION', label: 'Task Action' },
      { key: 'TASK_STATUS', label: 'Task Status' },
      { key: 'NEXT_FOLLOWUP_DATE', label: 'Follow-Up Date', type: 'date' },
      { key: 'RESPONSE_DATE', label: 'Response Date' },
      { key: 'RESPONSE_TEXT', label: 'Response' }
    ];
    const normalizedNotes = notes.map((note: any) => ({
      ...note,
      REPORT_NOTE_DATE: note?.DATE || note?.NOTES_DATE || note?.NotesDate || note?.CREATED_DATE || ''
    }));
    const notesColumns: ReportColumn[] = [
      { key: 'REPORT_NOTE_DATE', label: 'Date', type: 'date' },
      { key: 'DETAIL', label: 'Notes', preserveLines: true }
    ];
    const normalizedBookingRows = bookingRows.map((booking: any) => ({
      ...booking,
      REPORT_BOOKING_DATE:
        booking?.BOOKING_DATE ||
        ''
    }));
    const bookingColumns: ReportColumn[] = [
      { key: 'REPORT_BOOKING_DATE', label: 'Booking Date', type: 'date' },
      { key: 'REGISTRY_DATE', label: 'Registry Date', type: 'date' },
      { key: 'PLOT_NAME', label: 'Plot Name' },
      { key: 'PLOT_NO', label: 'Plot No' },
      { key: 'PLOT_AREA', label: 'Plot Area' },
      { key: 'PLOT_AMOUNT_PER_SQFT', label: 'Plot Amount Per Sqft' },
      { key: 'PLOT_TOTAL_AMOUNT', label: 'Plot Total Amount' }
    ];

    return `
      <html>
        <head>
          <title>Customer Profile Report - ${this.escapeHtml(customerName || enquiryId)}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background: #f5f7fb;
              color: #1f2937;
              margin: 0;
              padding: 24px;
            }
            .report-wrapper {
              max-width: 1200px;
              margin: 0 auto;
            }
            .report-header {
              background: linear-gradient(135deg, #0f766e, #155e75);
              color: #fff;
              padding: 20px 24px;
              border-radius: 12px;
              margin-bottom: 20px;
            }
            .report-header h1 {
              margin: 0 0 6px 0;
              font-size: 28px;
            }
            .report-header p {
              margin: 0;
              font-size: 14px;
              opacity: 0.92;
            }
            .section-card {
              background: #fff;
              border-radius: 12px;
              box-shadow: 0 6px 18px rgba(15, 23, 42, 0.08);
              padding: 18px;
              margin-bottom: 20px;
            }
            .section-title {
              font-size: 20px;
              font-weight: 700;
              margin: 0 0 14px 0;
              color: #0f172a;
            }
            .section-subtitle {
              font-size: 15px;
              font-weight: 700;
              margin: 18px 0 10px 0;
              color: #155e75;
              text-transform: uppercase;
              letter-spacing: 0.04em;
            }
            .table-wrap {
              overflow-x: auto;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              background: #fff;
            }
            th, td {
              border: 1px solid #dbe2ea;
              padding: 10px 12px;
              text-align: left;
              vertical-align: top;
              font-size: 14px;
            }
            th {
              background: #e2e8f0;
              color: #0f172a;
              font-weight: 700;
            }
            tr:nth-child(even) td {
              background: #f8fafc;
            }
            .detail-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
              gap: 12px;
            }
            .detail-item {
              border: 1px solid #dbe2ea;
              border-radius: 10px;
              padding: 12px 14px;
              background: #f8fafc;
            }
            .detail-label {
              display: block;
              font-size: 12px;
              font-weight: 700;
              color: #475569;
              text-transform: uppercase;
              letter-spacing: 0.04em;
              margin-bottom: 6px;
            }
            .detail-value {
              font-size: 14px;
              color: #0f172a;
              line-height: 1.5;
              word-break: break-word;
            }
            .empty-state {
              padding: 16px;
              border: 1px dashed #cbd5e1;
              border-radius: 10px;
              background: #f8fafc;
              color: #475569;
              font-size: 14px;
            }
            @media print {
              body {
                background: #fff;
                padding: 0;
              }
              .section-card {
                box-shadow: none;
                border: 1px solid #dbe2ea;
              }
            }
          </style>
        </head>
        <body>
          <div class="report-wrapper">
            <div class="report-header">
              <h1>Customer Profile</h1>
              <p>${this.escapeHtml(customerName || enquiryId)} | ${this.escapeHtml(customerPhone)}</p>
            </div>
            <section class="section-card">
              <h2 class="section-title">Customer Profile</h2>
              <div class="section-subtitle">1. Primary Customer Details</div>
              ${this.buildFullReportDetailGrid(primaryCustomerRows)}
            </section>
            <section class="section-card">
              <h2 class="section-title">Site Visit Tracker</h2>
              <div class="section-subtitle">2. Visited Plots</div>
              ${this.buildFullReportTable(normalizedVisitors, siteVisitColumns)}
            </section>
            <section class="section-card">
              <h2 class="section-title">Follow-up &amp; Interaction Logs</h2>
              <div class="section-subtitle">3.1 Tasks</div>
              ${this.buildTaskTableWithRowspan(normalizedTasks)}
              <div class="section-subtitle">3.2 Notes</div>
              ${this.buildFullReportTable(normalizedNotes, notesColumns, 'No notes available.')}
            </section>
            <section class="section-card">
              <h2 class="section-title">Booking &amp; Transaction Details</h2>
              <div class="section-subtitle">4. Booking Information</div>
              ${this.buildFullReportTable(normalizedBookingRows, bookingColumns, 'No booking details available.')}
            </section>
          </div>
        </body>
        </html>
        `;
  }

  private buildFullReportTable(
    rows: any[],
    columns: Array<{ key: string; label: string; type?: 'date' | 'time'; preserveLines?: boolean }>,
    emptyMessage: string = 'No data available.'
  ): string {
    if (!Array.isArray(rows) || rows.length === 0) {
      return `<div class="empty-state">${this.escapeHtml(emptyMessage)}</div>`;
    }

    const tableHead = columns
      .map((column) => `<th>${this.escapeHtml(column.label)}</th>`)
      .join('');

    const tableRows = rows
      .map((row) => `
        <tr>
          ${columns
          .map((column) => `<td>${this.formatFullReportDisplayValue((row as Record<string, any>)?.[column.key], column)}</td>`)
          .join('')}
        </tr>
      `)
      .join('');

    return `
      <div class="table-wrap">
        <table>
          <thead>
            <tr>${tableHead}</tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </div>
    `;
  }

  private buildTaskTableWithRowspan(data: any[]): string {
    if (!data || !data.length) {
      return `<div class="empty-state">No tasks available.</div>`;
    }

    const header = `
      <thead>
        <tr>
          <th>Task Action</th>
          <th>Task Status</th>
          <th>Response Date</th>
          <th>Response</th>
        </tr>
      </thead>
    `;

    const body = data.map((row: any) => {
      return `
      <tr>
        ${row.isFirst
          ? `<td rowspan="${row.rowSpan}">${this.escapeHtml(row.TASK_ACTION || '')}</td>`
          : ''
        }
        ${row.isFirst
          ? `<td rowspan="${row.rowSpan}">${this.escapeHtml(row.TASK_STATUS || '')}</td>`
          : ''
        }
        <td>${this.escapeHtml(row.RESPONSE_DATE || '')}</td>
        <td>${this.escapeHtml(row.RESPONSE_TEXT || '')}</td>
      </tr>
    `;
    }).join('');

    return `
    <div class="table-wrap">
      <table>
        ${header}
        <tbody>${body}</tbody>
      </table>
    </div>
  `;
  }

  private buildFullReportDetailGrid(
    rows: Array<{ label: string; value: any; type?: 'date' | 'time'; preserveLines?: boolean }>,
    emptyMessage: string = 'No data available.'
  ): string {
    const validRows = (rows || []).filter((row) => row && (row.value !== undefined && row.value !== null && String(row.value).trim() !== ''));

    if (validRows.length === 0) {
      return `<div class="empty-state">${this.escapeHtml(emptyMessage)}</div>`;
    }

    return `
      <div class="detail-grid">
        ${validRows.map((row) => `
          <div class="detail-item">
            <span class="detail-label">${this.escapeHtml(row.label)}</span>
            <div class="detail-value">${this.formatFullReportDisplayValue(row.value, { type: row.type, preserveLines: row.preserveLines ?? true })}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  private formatFullReportDisplayValue(
    value: any,
    options: { type?: 'date' | 'time'; preserveLines?: boolean } = {}
  ): string {
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    if (options.type === 'date') {
      return this.escapeHtml(this.formatReportDate(value));
    }

    if (options.type === 'time') {
      return this.escapeHtml(this.formatReportTime(value));
    }

    if (typeof value === 'object') {
      return this.escapeHtml(JSON.stringify(value));
    }

    const escapedValue = this.escapeHtml(String(value));
    return options.preserveLines ? escapedValue.replace(/\r?\n/g, '<br>') : escapedValue;
  }

  private formatReportDate(value: any): string {
    if (!value) {
      return '-';
    }

    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return String(value);
    }

    return this.datePipe.transform(date, 'dd-MM-yyyy') || String(value);
  }

  private formatReportTime(value: any): string {
    if (!value) {
      return '-';
    }

    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return String(value);
    }

    return this.datePipe.transform(date, 'hh:mm a') || String(value);
  }

  private getReportFirstValue(source: Record<string, any>, keys: string[]): string {
    for (const key of keys) {
      const value = source?.[key];
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        return String(value);
      }
    }

    return '';
  }

  private getCustomerProfileStage(customer: Record<string, any>): string {
    const selectedStageId = this.addCrmEnquiry?.get('stage')?.value || this.getReportFirstValue(customer, ['STAGE', 'STATUS', 'ENQUIRY_STATUS']);

    const cancelStageId = 'c4a8e1d2-9f73-4b6a-8d5c-21e7f0a9b3de';
    if (String(selectedStageId || '') === cancelStageId) {
      return 'Cancel';
    }

    const stageList = Array.isArray(this.respStages) ? this.respStages : [];
    const matchedStage = stageList.find((stage: any) =>
      String(stage?.erpStageID || '') === String(selectedStageId || '')
    );

    if (matchedStage?.stage_name) {
      return String(matchedStage.stage_name);
    }

    const fallbackStageName = this.getReportFirstValue(customer, ['STAGE_NAME', 'stage_name']);
    if (fallbackStageName) {
      return fallbackStageName;
    }

    return selectedStageId || 'N/A';
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  noteReload() {
    this.nheaderclick.nativeElement.click();
  }

  bsReload() {
    this.bheaderclick.nativeElement.click();
  }

  // vReload(){
  //   this.vheaderclick.nativeElement.click();
  // }

  public taskModalshow() {
    this.addmodal.nativeElement.click();
  }


  StagesStatuslist() {
    let StagesStatus = "";
    let StagesStatusdata = new FormData();
    StagesStatusdata.append('StagesStatus', StagesStatus);
    this.billingservice.fetch_TopThreeStagesData(StagesStatusdata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
      this.respStages = Response.data;
    });
  }

  // onChangeStatus(e) {
  //   let StageId = e.target.value;
  //   let StagesStatusdata = new FormData();
  //   StagesStatusdata.append('StageId', StageId);
  //   this.billingservice.fetch_StagesStatusData(StagesStatusdata).subscribe(Response => {
  //     this.respStagesStatus = Response.data;
  //   });
  // }

  editTaskdesp(type, taskId) {

    /* ===== View Mode / Edit Mode ===== */
    if (type === 'view_task') {
      this.addTask.disable();
      this.nextFollowup.disable();
      this.MoreFollowUps.disable();

      const addressArray = this.MoreFollowUps.get('address') as FormArray;
      addressArray.controls.forEach((group: FormGroup) => {
        group.get('fuDate').disable();
      });

      this.addTask.get('task_action_response_logs').enable();
      this.isHideTaskSave = false;
      this.hideAddMoreFollowUpButton = false;

    } else {
      this.isHideTaskSave = true;
      this.hideAddMoreFollowUpButton = true;
      this.addTask.enable();
      this.nextFollowup.enable();
      this.MoreFollowUps.enable();
    }

    this.followupadd = true;
    this.isAddingTask = false;
    this.additionalFollow = false;
    this.nextFollowup.reset();
    const formArray = this.MoreFollowUps.get('address') as FormArray;

    /* ===== Sequential API Calls: need selectedPlotShownBy from taskDetails for visitedPlots request ===== */
    this.crmservice.getTaskDetails(taskId).pipe(takeUntil(this.destroy$)).subscribe(taskDetails => {

      const Response = taskDetails;
      const selectedPlotShownBy =
        Response?.DATA && Response.DATA[0] ? Response.DATA[0][42] : null;

      this.crmservice.getVisitedPlots(taskId, this.EnquiryIds, selectedPlotShownBy)
        .pipe(takeUntil(this.destroy$))
        .subscribe(visitedPlots => {

          // Patch visited plot field irrespective of taskDetails presence so the UI always shows what we got.
          const visitedPlotText = this.extractVisitedPlotText(visitedPlots);
          this.addTask.patchValue({ visited_plot: visitedPlotText });

          if (Response.DATA) {

            const taskDescp = Response.DATA[0][3];
            const nextFollowUp = Response.DATA[0][24];
            const moreFollowUp = Response.DATA[0][39];

            /* ===== Intelligent Task Description Selection ===== */
            if (taskDescp && nextFollowUp && (!moreFollowUp || moreFollowUp === '[]')) {
              this.addTask.patchValue({ task_description: nextFollowUp });
            }
            else if (taskDescp && nextFollowUp && moreFollowUp && moreFollowUp !== '[]') {
              try {
                let rawData = JSON.parse(moreFollowUp);
                if (Array.isArray(rawData) && rawData.length > 0) {
                  let lastValue = rawData[rawData.length - 1];
                  this.addTask.patchValue({ task_description: lastValue });
                }
              } catch (error) {
                console.error('Error parsing followup description:', error);
              }
            }
            else {
              this.addTask.patchValue({ task_description: nextFollowUp });
            }

            /* ===== Main Task Data ===== */
            this.addTask.patchValue({
              visitor_name: Response.DATA[0][25],
              status: Response.DATA[0][8],
              contact_no: Response.DATA[0][35],
              last_followup_date: Response.DATA[0][4]
                ? this.datePipe.transform(Response.DATA[0][4], 'yyyy-MM-dd')
                : '',
              taskAction: Response.DATA[0][40],
              task_id: Response.DATA[0][1],
              customer_id: Response.DATA[0][26],
              enquiry_id: Response.DATA[0][36],
              task_action_response_logs: Response.DATA[0][41],
              task_action_response: ''
            });
            this.applyDefaultTaskActionIfEmpty();

            this.OnlyPLotShownBY.patchValue({
              selectedPlotShownBy: Response.DATA[0][42],
            });

            /* ===== Next Followup ===== */
            if (nextFollowUp) {
              // this.nextFollowup.patchValue({
              //   followup_notes: nextFollowUp
              // });

              this.nextFollowup.controls['followup_date']
                .setValue(this.datePipe.transform(Response.DATA[0][22], 'dd-MM-yyyy'));

              this.nextFollowup.controls['followup_Time']
                .setValue(this.datePipe.transform(Response.DATA[0][23], 'hh:mm'));
            }

            /* ===== More Followups ===== */
            if (Response.DATA[0][37] && Response.DATA[0][38] && Response.DATA[0][39]) {

              let moreFollowupDate = Response.DATA[0][37];
              let moreFollowupTime = Response.DATA[0][38];
              let moreFollowupDesc = Response.DATA[0][39];

              if (typeof moreFollowupDesc === 'string') {
                try {
                  moreFollowupDesc = JSON.parse(moreFollowupDesc);
                  moreFollowupTime = JSON.parse(moreFollowupTime);
                  moreFollowupDate = JSON.parse(moreFollowupDate);
                } catch (e) {
                  console.error("Invalid JSON in followups:", e);
                }
              }

              const dates = (Array.isArray(moreFollowupDate) ? moreFollowupDate : moreFollowupDate.split(','));
              const times = (Array.isArray(moreFollowupTime) ? moreFollowupTime : moreFollowupTime.split(','));
              const descs = (Array.isArray(moreFollowupDesc) ? moreFollowupDesc : moreFollowupDesc.split(','));

              for (let i = 0; i < descs.length; i++) {
                this.addNewFollowUpGroup();

                formArray.at(i).patchValue({
                  // fuDesp: descs[i]?.trim(),
                  fuTime: times[i]?.trim(),
                  fuDate: dates[i]?.trim()
                });
              }

              formArray.controls.forEach(group =>
                type === 'view_task' ? group.disable() : group.enable()
              );

              this.isChangeDisableColor = type !== 'view_task';
            }

            /* ===== Fresh Followups in Edit Mode ===== */
            if (type !== 'view_task') {

              this.nextFollowup.reset();

              const formArrayClear = this.MoreFollowUps.get('address') as FormArray;

              while (formArrayClear.length !== 0) {
                formArrayClear.removeAt(0);
              }

              this.hideAddMoreFollowUpButton = true;
              this.isHideFollowUps = true;
            }

          }

          /* ===== Visited Plots Response ===== */
          if (visitedPlots && visitedPlots.DATA) {
            this.visitedPlotsList = visitedPlots.DATA;
          }

        });
    });

    this.isHideFollowUps = false;
    this.taskHeading = "Edit Task";
    this.activeTaskField = 'active';
    $('#taskHeading').text('Edit Task Detail');
    this.taskModalshow();
  }

  private extractVisitedPlotText(visitedPlotsResponse: any): string {
    // Normalize the varied response shapes we've seen from this endpoint.
    const rawList =
      visitedPlotsResponse?.DATA ||
      visitedPlotsResponse?.data ||
      visitedPlotsResponse?.visitedPlots ||
      (Array.isArray(visitedPlotsResponse) ? visitedPlotsResponse : []);

    if (!Array.isArray(rawList)) {
      this.visitedPlotsList = [];
      return '';
    }

    this.visitedPlotsList = rawList;

    const plotNames = rawList.map((item: any) => {
      if (!item) { return ''; }
      if (typeof item === 'string') { return item; }
      if (Array.isArray(item)) { return ''; } // arrays are unexpected here; ignore
      return item.ProductName || item.product_name || '';
    }).filter(name => !!name);

    return [...new Set(plotNames)].join(', ');
  }


  public closeModal1() {
    this.closebutton1.nativeElement.click();
  }

  showFollowup(e) {
    if (e.target.checked) {
      this.additionalFollow = true;
    }
    else {
      this.additionalFollow = false;
    }
  }
  showWitness(e) {
    // this.addBookingDetail.controls['checkupWitness'].clearValidators();
    this.addBookingDetail.controls['bkFirstName'].clearValidators();
    this.addBookingDetail.controls['bkGurdian'].clearValidators();
    this.addBookingDetail.controls['bkFirstAddress'].clearValidators();
    if (e.target.checked) {
      // this.isChecked = false;
      // this.addBookingDetail.controls['checkupWitness'].setValidators([Validators.required]);
      this.addBookingDetail.controls['bkFirstName'].setValidators([Validators.required]);
      this.addBookingDetail.controls['bkGurdian'].setValidators([Validators.required]);
      this.addBookingDetail.controls['bkFirstAddress'].setValidators([Validators.required]);
      this.addBookingDetail.controls['bkFirstName'].enable();
      this.addBookingDetail.controls['bkGurdian'].enable();
      this.addBookingDetail.controls['bkFirstAddress'].enable();
    }
    else {
      this.addBookingDetail.controls['checkupWitness'].clearValidators;
      this.addBookingDetail.controls['bkFirstName'].clearValidators;
      this.addBookingDetail.controls['bkGurdian'].clearValidators;
      this.addBookingDetail.controls['bkFirstAddress'].clearValidators;
      this.addBookingDetail.controls['bkFirstName'].reset();
      this.addBookingDetail.controls['bkGurdian'].reset();
      this.addBookingDetail.controls['bkFirstAddress'].reset();
      this.addBookingDetail.controls['bkFirstName'].disable();
      this.addBookingDetail.controls['bkGurdian'].disable();
      this.addBookingDetail.controls['bkFirstAddress'].disable();

    }
  }
  showWitnesstwo(e) {
    // this.addBookingDetail.controls['checkupWitnesstwo'].clearValidators();
    this.addBookingDetail.controls['bkSecondName'].clearValidators();
    this.addBookingDetail.controls['bkSecoGurdian'].clearValidators();
    this.addBookingDetail.controls['bkSecondAddress'].clearValidators();
    if (e.target.checked) {
      this.addBookingDetail.controls['bkSecondName'].setValidators([Validators.required]);
      this.addBookingDetail.controls['bkSecoGurdian'].setValidators([Validators.required]);
      this.addBookingDetail.controls['bkSecondAddress'].setValidators([Validators.required]);
      this.addBookingDetail.controls['bkSecondName'].enable();
      this.addBookingDetail.controls['bkSecoGurdian'].enable();
      this.addBookingDetail.controls['bkSecondAddress'].enable();
    }
    else {
      // this.addBookingDetail.controls['checkupWitnesstwo'].clearValidators;
      this.addBookingDetail.controls['bkSecondName'].clearValidators;
      this.addBookingDetail.controls['bkSecoGurdian'].clearValidators;
      this.addBookingDetail.controls['bkSecondAddress'].clearValidators;
      this.addBookingDetail.controls['bkSecondName'].disable();
      this.addBookingDetail.controls['bkSecoGurdian'].disable();
      this.addBookingDetail.controls['bkSecondAddress'].disable();
    }
  }
  OnSelectPayment(value, index = "") {
    let paymentMode = typeof (value) == "object" ? value.target.value : value;


    if (paymentMode == 1) {
      this.paymentdetail.controls.address.get(index.toString()).get("bkAmtPaid").setValidators([Validators.required]);
      this.paymentdetail.controls.address.get(index.toString()).get("bkPaidDate").setValidators([Validators.required]);
      this.paymentdetail.controls.address.get(index.toString()).get("paidCustomerNm").setValidators([Validators.required]);
      this.paymentdetail.controls.address.get(index.toString()).get("bkRemark").setValidators([Validators.required]);
      this.amtPaid[index] = true;
      this.paidDate[index] = true;
      this.reason[index] = true;
      this.bankName[index] = false;
      this.chequeDate[index] = false;
      this.chequeNumber[index] = false;
      this.transactionId[index] = false;
      this.payedTo[index] = true;
      this.submitDate[index] = false;
      this.paymentdetail.controls.address.get(index.toString()).get("bkbankName").clearValidators();
      this.paymentdetail.controls.address.get(index.toString()).get("bksubmitdate").clearValidators();
      this.paymentdetail.controls.address.get(index.toString()).get("bkTransactionId").clearValidators();
      this.paymentdetail.controls.address.get(index.toString()).get("bkChequeNo").clearValidators();
      this.paymentdetail.controls.address.get(index.toString()).get("bkchequeDate").clearValidators();
    } else if (paymentMode == 3) {
      this.paymentdetail.controls.address.get(index.toString()).get("bkAmtPaid").setValidators([Validators.required]);
      this.paymentdetail.controls.address.get(index.toString()).get("bkbankName").setValidators([Validators.required]);
      this.paymentdetail.controls.address.get(index.toString()).get("bksubmitdate").setValidators([Validators.required]);
      this.paymentdetail.controls.address.get(index.toString()).get("bkChequeNo").setValidators([Validators.required]);
      this.paymentdetail.controls.address.get(index.toString()).get("bkchequeDate").setValidators([Validators.required]);
      this.paymentdetail.controls.address.get(index.toString()).get("paidCustomerNm").setValidators([Validators.required]);
      this.paymentdetail.controls.address.get(index.toString()).get("bkRemark").setValidators([Validators.required]);
      this.amtPaid[index] = true;
      this.paidDate[index] = false;
      this.reason[index] = true;
      this.chequeDate[index] = true;
      this.chequeNumber[index] = true;
      this.transactionId[index] = false;
      this.payedTo[index] = true;
      this.bankName[index] = true;
      this.submitDate[index] = true;
      this.paymentdetail.controls.address.get(index.toString()).get("bkPaidDate").clearValidators();
      this.paymentdetail.controls.address.get(index.toString()).get("bkTransactionId").clearValidators();
    } else {
      this.paymentdetail.controls.address.get(index.toString()).get("bkTransactionId").setValidators([Validators.required]);
      this.paymentdetail.controls.address.get(index.toString()).get("bkAmtPaid").setValidators([Validators.required]);
      this.paymentdetail.controls.address.get(index.toString()).get("bkbankName").setValidators([Validators.required]);
      this.paymentdetail.controls.address.get(index.toString()).get("bkPaidDate").setValidators([Validators.required]);
      this.paymentdetail.controls.address.get(index.toString()).get("bkRemark").setValidators([Validators.required]);
      this.amtPaid[index] = true;
      this.paidDate[index] = true;
      this.reason[index] = true;
      this.chequeDate[index] = false;
      this.chequeNumber[index] = false;
      this.transactionId[index] = true;
      this.payedTo[index] = false;
      this.bankName[index] = true;
      this.submitDate[index] = false;
      this.paymentdetail.controls.address.get(index.toString()).get("bksubmitdate").clearValidators();
      this.paymentdetail.controls.address.get(index.toString()).get("paidCustomerNm").clearValidators();
      this.paymentdetail.controls.address.get(index.toString()).get("bkChequeNo").clearValidators();
      this.paymentdetail.controls.address.get(index.toString()).get("bkchequeDate").clearValidators();
    }
  }
  displaySave1() {
    this.showSave1 = true;
  }

  hideSave1() {
    this.showSave1 = false;
  }

  saveMsg1(taskId) {
    if (this.taskDetails.controls['follwoupDetails'].valid) {
      this.crmservice.updatefollowup(this.taskDetails.controls['follwoupDetails'].value, taskId).pipe(takeUntil(this.destroy$)).subscribe(Response => { this.resp = Response, this.hideSave() });
      Swal.fire({
        title: 'Success',
        icon: 'success',
        text: 'Followup Details saved successfully!',
        showConfirmButton: false,
        timer: 3000,
      });
      this.showSave1 = false;
      this.headerclick.nativeElement.click();
      this.nheaderclick.nativeElement.click();
      this.vheaderclick.nativeElement.click();
      this.reload();
    }
  }
  insertBookingDetail() {
    // this.isChecked = false;
    this.submitted = false;
    if (this.addBookingDetail.valid) {
      this.bkPayment = [];
      this.bkAmtPaid = [];
      this.bkPaidDate = [];
      this.bkChequeNo = [];
      this.bkchequeDate = [];
      this.bkTransactionId = [];
      this.paidCustomerNm = [];
      this.bkRemark = [];
      this.bksubmitdate = [];
      this.bkbankName = [];
      for (let i = 0; i < this.paymentdetail.value.address.length; i++) {

        this.bkAmtPaid.push(
          this.paymentdetail.controls.address.value[i].bkAmtPaid,
        );
        this.bkPaidDate.push(
          this.paymentdetail.controls.address.value[i].bkPaidDate,
        );
        this.bkChequeNo.push(
          this.paymentdetail.controls.address.value[i].bkChequeNo,
        );
        this.bkchequeDate.push(
          this.paymentdetail.controls.address.value[i].bkchequeDate,
        );
        this.bkTransactionId.push(
          this.paymentdetail.controls.address.value[i].bkTransactionId,
        );
        this.paidCustomerNm.push(
          this.paymentdetail.controls.address.value[i].paidCustomerNm,
        );
        this.bkRemark.push(
          this.paymentdetail.controls.address.value[i].bkRemark,
        );
        this.bksubmitdate.push(
          this.paymentdetail.controls.address.value[i].bksubmitdate,
        );
        this.bkbankName.push(
          this.paymentdetail.controls.address.value[i].bkbankName,
        );
        this.bkPayment.push(
          this.paymentdetail.controls.address.value[i].bkPayment,
        );
      }

      let bookingData: any = new FormData();
      // bookingData.append('plotShownBy', this.plotShownBy);
      bookingData.append('bkPayment', this.bkPayment);
      bookingData.append('bkAmtPaid', this.bkAmtPaid);
      bookingData.append('bkPaidDate', this.bkPaidDate);
      bookingData.append('bkChequeNo', this.bkChequeNo);
      bookingData.append('bkchequeDate', this.bkchequeDate);
      bookingData.append('bkTransactionId', this.bkTransactionId);
      bookingData.append('paidCustomerNm', this.paidCustomerNm);
      bookingData.append('bksubmitdate', this.bksubmitdate);
      bookingData.append('bkbankName', this.bkbankName);
      bookingData.append('bkRemark', this.bkRemark);
      bookingData.append('bktype', 'Buyer');
      bookingData.append('bktitle', this.addBookingDetail.get('bktitle').value);
      bookingData.append('bkCustomerNm', this.addBookingDetail.get('bkCustomerNm').value);
      bookingData.append('bkbkAge', this.addBookingDetail.get('bkbkAge').value);
      bookingData.append('bkCategory', this.addBookingDetail.get('bkCategory').value);
      bookingData.append('bkOccupation', this.addBookingDetail.get('bkOccupation').value);
      bookingData.append('bkCaretaker', this.addBookingDetail.get('bkCaretaker').value);
      bookingData.append('bkSpouse', this.addBookingDetail.get('bkSpouse').value);
      bookingData.append('bkMobileNo', this.addBookingDetail.get('bkMobileNo').value);
      bookingData.append('bkAlternate', this.addBookingDetail.get('bkAlternate').value);
      bookingData.append('bkTehsil', this.addBookingDetail.get('bkTehsil').value);
      bookingData.append('bkDistrict', this.addBookingDetail.get('bkDistrict').value);
      bookingData.append('bkCity', this.addBookingDetail.get('bkCity').value);
      bookingData.append('bkState', this.addBookingDetail.get('bkState').value);
      bookingData.append('bkPincode', this.addBookingDetail.get('bkPincode').value);
      bookingData.append('productId', this.addBookingDetail.get('productId').value);
      bookingData.append('bkPlotName', this.addBookingDetail.get('bkPlotName').value.name);
      bookingData.append('bkPlotSqft', this.addBookingDetail.get('bkPlotSqft').value);
      bookingData.append('bkPlotAmt', this.addBookingDetail.get('bkPlotAmt').value);
      bookingData.append('bkKhasraNo', this.addBookingDetail.get('bkKhasraNo').value);
      bookingData.append('bkFront', this.addBookingDetail.get('bkFront').value);
      bookingData.append('bkDepth', this.addBookingDetail.get('bkDepth').value);
      bookingData.append('bkTargetDate', this.addBookingDetail.get('bkTargetDate').value);

      if (this.addBookingDetail.get('checkupWitness').value == true) {
        bookingData.append('checkupWitness', '1');
        bookingData.append('bkFirstName', this.addBookingDetail.get('bkFirstName').value);
        bookingData.append('bkGurdian', this.addBookingDetail.get('bkGurdian').value);
        bookingData.append('bkFirstAddress', this.addBookingDetail.get('bkFirstAddress').value);
      }
      else {
        bookingData.append('checkupWitness', '');
      }
      if (this.addBookingDetail.get('checkupWitnesstwo').value == true) {
        bookingData.append('checkupWitnesstwo', '1');
        bookingData.append('bkSecondName', this.addBookingDetail.get('bkSecondName').value);
        bookingData.append('bkSecoGurdian', this.addBookingDetail.get('bkSecoGurdian').value);
        bookingData.append('bkSecondAddress', this.addBookingDetail.get('bkSecondAddress').value);
      }
      else {
        bookingData.append('checkupWitnesstwo', '');
      }
      for (var pair of bookingData.entries()) {

      }
      this.billingservice.add_BookingDetail(bookingData).pipe(takeUntil(this.destroy$)).subscribe((Response) => {

        if (Response.CODE == 200) {

          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: Response.MESSAGE,
            showConfirmButton: false,
            timer: 2000
          });
          this.addBookingDetail.reset();
          this.closeModal();
          this.reload();
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
    } else {
      this.submitted = true;
      Swal.fire('Alert', 'Fill all required fields first', 'info');
    }

  }



  insertTask() {
    this.applyDefaultStatusIfEmpty();
    this.applyDefaultTaskActionIfEmpty();

    if (this.addTask.valid) {

      let taskFormData = new FormData();
      taskFormData.append('task_id', this.addTask.get('task_id').value);

      const safeValue = (val: any) => (val !== null && val !== undefined && val !== '' ? val : '');
      taskFormData.append('customerId', safeValue(this.addTask.get('customer_id')?.value));

      taskFormData.append('contactNo', this.addTask.get('contact_no').value);
      taskFormData.append('taskAction', this.addTask.get('taskAction').value);
      taskFormData.append('status', this.addTask.get('status').value);
      taskFormData.append('task_action_response_logs', this.addTask.get('task_action_response_logs').value);

      const enquiry_id = this.addTask.get('enquiry_id').value;
      if (enquiry_id) {
        taskFormData.append('enquiry_id', enquiry_id);
      } else {
        taskFormData.append('enquiry_id', this.activatedRoute.snapshot.paramMap.get('id'));
      }

      let plotShowBy = typeof (this.OnlyPLotShownBY.get('selectedPlotShownBy').value) == "object"
        ? this.OnlyPLotShownBY.get('selectedPlotShownBy').value.name
        : this.OnlyPLotShownBY.get('selectedPlotShownBy').value;

      let plotShownByType = this.OnlyPLotShownBY.get('selectedPlotShownBy')?.value;

      if (typeof plotShownByType === 'object') {
        taskFormData.append('plotShownBy', plotShowBy);
      } else {
        taskFormData.append('plotShownBy', this.OnlyPLotShownBY.get('selectedPlotShownBy').value);
      }

      let existingLogs = this.addTask.get('task_action_response_logs').value || "";
      let newResponse = this.addTask.get('task_action_response').value;
      const latestTaskActionResponse = (newResponse && newResponse.trim() !== '')
        ? newResponse.trim()
        : (this.addTask.get('task_description').value || '');
      this.addTask.get('task_description')?.setValue(latestTaskActionResponse);

      if (this.nextFollowup.get('followup_date').value) {
        taskFormData.append('next_followup_date', this.nextFollowup.get('followup_date').value);
        taskFormData.append('next_followup_time', this.nextFollowup.get('followup_Time').value);
        taskFormData.append('next_followup_description', latestTaskActionResponse);
      }

      /* ===== SMART LOG APPEND (NO BLANK ENTRIES) ===== */
      const currentDate = new Date();
      const formattedDate =
        currentDate.getDate().toString().padStart(2, '0') + '-' +
        (currentDate.getMonth() + 1).toString().padStart(2, '0') + '-' +
        currentDate.getFullYear();

      if (newResponse && newResponse.trim() !== '') {
        let taskActionResponse = formattedDate + ' -> ' + newResponse.trim();
        existingLogs = existingLogs
          ? `${taskActionResponse}\n\n${existingLogs}`
          : taskActionResponse;
      }

      taskFormData.append('task_action_response', existingLogs);
      /* ================================================= */

      /* ===== FOLLOWUP PRIORITY (MATCHED WITH TM) ===== */
      const addressArray = this.MoreFollowUps.get('address') as FormArray;
      let followUpDates = addressArray.controls.map(c => c.value.fuDate);
      let followUpTimes = addressArray.controls.map(c => c.value.fuTime);

      // Last Followup Date Priority: More → Next → Existing
      if (followUpDates.length > 0) {
        taskFormData.append("last_followup_date", followUpDates[followUpDates.length - 1]);
      }
      else if (this.nextFollowup.get('followup_date').value) {
        taskFormData.append("last_followup_date", this.nextFollowup.get('followup_date').value);
      }
      else {
        taskFormData.append("last_followup_date", this.addTask.get("last_followup_date").value);
      }

      taskFormData.append("taskDescription", latestTaskActionResponse);

      // Always send More Followups (prevent DB old data reuse)
      if (followUpDates.length > 0) {
        taskFormData.append(
          "moreFollowUpDate",
          followUpDates.length === 1 ? followUpDates[0] : JSON.stringify(followUpDates)
        );

        taskFormData.append("moreFollowUpTime", JSON.stringify(followUpTimes));
        taskFormData.append("moreFollowUpNotes", JSON.stringify(followUpDates.map(() => '')));
      }
      else {
        taskFormData.append("moreFollowUpDate", '');
        taskFormData.append("moreFollowUpTime", '[]');
        taskFormData.append("moreFollowUpNotes", '[]');
      }
      /* ================================================= */

      this.crmservice.saveTaskDetails(taskFormData).pipe(takeUntil(this.destroy$)).subscribe(resp => {

        if (resp.CODE == 200) {
          Swal.fire({
            icon: 'success',
            title: 'Success !',
            text: resp.MESSAGE,
            showConfirmButton: false,
            timer: 2000,
          });
          this.closebutton.nativeElement.click();
          this.headerclick.nativeElement.click();
          this.taskModalClosed();
          this.datatableCode();
          this.rerender();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Field required!',
            showConfirmButton: false,
            timer: 3000
          });
        }
      });

    } else {
      this.submitted = true;
      Swal.fire('Alert', 'Fill all required fields first', 'info');
    }
  }

  
  hideTaskAssgine() {
    this.AccessAssigne = true;
  }

  hideTaskAssgine1() {
    this.AccessAssigne1 = true;
  }

  saveTaskAssgine(taskID) {
    if (this.task_Assignee.controls['TaskAssigne'].valid) {
      let taskAssigne = new FormData();
      taskAssigne.append('TaskAssigne', this.task_Assignee.controls['TaskAssigne'].value);
      taskAssigne.append('taskId', taskID);
      this.hrservice.updateAssignee(taskAssigne).pipe(takeUntil(this.destroy$)).subscribe(Response => {
        this.resp = Response;
        if (Response.code == 200) {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: Response.massage,
            showConfirmButton: false,
            timer: 2000
          });
          this.AccessAssigne = true;
          this.reload();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Update Follow up Failed',
            showConfirmButton: false,
            timer: 3000
          });
        }
      });
      this.reload();
    } else {
      Swal.fire({
        //position: 'top',
        title: 'Alert',
        icon: 'info',
        text: 'Follow up should not be empty!',
        showConfirmButton: false,
        timer: 3000,
      });
    }
  }

  saveTaskAssgine1(taskID) {
    if (this.taskActionFrom.controls['taskAction'].valid) {
      let taskAssigne = new FormData();
      taskAssigne.append('taskAction', this.addTask.controls['taskAction'].value);
      taskAssigne.append('taskId', taskID);
      this.hrservice.updatetaskaction(taskAssigne).pipe(takeUntil(this.destroy$)).subscribe(Response => {
        this.resp = Response;
        if (Response.code == 200) {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: Response.massage,
            showConfirmButton: false,
            timer: 2000
          });
          this.AccessAssigne1 = true;
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Update Title Failed',
            showConfirmButton: false,
            timer: 3000
          });
        }
      });
      this.headerclick.nativeElement.click();
      // this.nheaderclick.nativeElement.click();
      this.reload();
    } else {
      Swal.fire({
        //position: 'top',
        title: 'Alert',
        icon: 'info',
        text: 'Title should not be empty!',
        showConfirmButton: false,
        timer: 3000,
      });
    }
  }

  editenquiry(EnquiryId) {
    let getEnquiryId = new FormData();
    getEnquiryId.append('EnquiryId', EnquiryId);
    this.CrmService.getCrmEnquiryMngmt(getEnquiryId).pipe(takeUntil(this.destroy$)).subscribe(Response => {

      if (Response.data.length) {
        if (Response.data[0].EnqType != "") {
          // this.OnSelectValue(Response.data[0].EnqType);
        }
        this.addCrmEnquiry.patchValue({
          EnquiryId: Response.data[0].EnquiryId,
          enquiry_cust: Response.data[0].VisitorName,
          enquiry_mode: Response.data[0].EnqType,
          txt_introduce_by: Response.data[0].introduce_by,
          introduce_by_m: Response.data[0].introduce_by,
          introduced_by_view: Response.data[0].introduce_by,
          enquiry_no: Response.data[0].MobileNumber,
          //enquiry_reference: Response.data[0].RefferedBy,
          enquiry_state: Response.data[0].State,
          stage: Response.data[0].Status,
          city_enquiry: Response.data[0].CityId,
          enquiry_address: Response.data[0].Address,
          tags: this.parseTagCsv(Response.data[0].tag_ids)
        });
        this.visitorName = Response.data[0].VisitorName;
        this.CustomerId = Response.data[0].CustomerId;
        this.bookMobileNum = Response.data[0].MobileNumber;
        this.bookedCity = Response.data[0].CityId;
        this.bookedState = Response.data[0].State;
        this.bookedAddress = Response.data[0].Address;
        this.bookedCategory = Response.data[0].Category;
        this.bookedTitle = Response.data[0].Title;
        this.enquiryBk = Response.data[0].EnquiryId;
        if (Response.data[0].EnqDate != "") {
          this.addCrmEnquiry.controls.Enquiry_date.setValue(Response.data[0].EnqDate);
        } else {
          this.CreatedDt = (Response.data[0].CreatedDt.toString()).split('/');
          var d = new Date(Number(this.CreatedDt[2]), Number(this.CreatedDt[1]) - 1, Number(this.CreatedDt[0]));
          this.CreatedDt = this.datePipe.transform(d, 'dd-MM-yyyy');
          this.addCrmEnquiry.controls.Enquiry_date.setValue(this.CreatedDt);
        }
        if (Response.data[0].RefferedBy != "") {
          this.addCrmEnquiry.controls.enquiry_reference.setValue(Response.data[0].RefferedBy);
        } else {
          this.addCrmEnquiry.controls.enquiry_reference.setValue(Response.data[0].ContactBy);
        }
        //this.addCrmEnquiry.controls.Enquiry_date.setValue(Response.data[0].EnqDate);
      }
    });
    this.addCrmEnquiry.enable();
    $('#headerEnquiryTitle').text('Edit Customer Profile');
  }

  insertenquiryDetail() {
    if (this.addCrmEnquiry.valid) {
      this.submitted = false;
      let EnquiryData = new FormData();
      EnquiryData.append('status', this.addCrmEnquiry.get('stage').value);
      EnquiryData.append('EnquiryId', this.addCrmEnquiry.get('EnquiryId').value);
      EnquiryData.append('enquiry_cust', this.addCrmEnquiry.get('enquiry_cust').value);
      EnquiryData.append('enquiry_mode', this.addCrmEnquiry.get('enquiry_mode').value);
      EnquiryData.append('enquiry_no', this.addCrmEnquiry.get('enquiry_no').value);
      EnquiryData.append('enquiry_reference', this.addCrmEnquiry.get('enquiry_reference').value);
      EnquiryData.append('city_enquiry', this.addCrmEnquiry.get('city_enquiry').value);
      EnquiryData.append('enquiry_address', this.addCrmEnquiry.get('enquiry_address').value);
      EnquiryData.append('enquiry_state', this.addCrmEnquiry.get('enquiry_state').value);
      EnquiryData.append('tags', this.addCrmEnquiry.get('tags').value);

      EnquiryData.append('Enquiry_date', this.addCrmEnquiry.get('Enquiry_date').value);

      if (this.addCrmEnquiry.get('enquiry_mode').value == 3) {
        if (this.addCrmEnquiry.get('introduce_by_m')?.value != null) {
          this.introduce_by = this.addCrmEnquiry.get('introduce_by_m').value;
        } else {
          this.introduce_by = '';
        }
      } else {
        if (this.addCrmEnquiry.get('txt_introduce_by')?.value != null) {
          this.introduce_by = this.addCrmEnquiry.get('txt_introduce_by').value;
        } else {
          this.introduce_by = '';
        }
      }
      EnquiryData.append('introduce_by', this.introduce_by);

      this.CrmService.addCrmEnquiryMngmt(EnquiryData).pipe(takeUntil(this.destroy$)).subscribe(Response => {
        if (Response.CODE == 200) {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: Response.MESSAGE,
            showConfirmButton: false,
            timer: 2000
          });
          this.addCrmEnquiry.reset();
          this.router.navigate(['/crm-enquiry']);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Task Creation Failed',
            showConfirmButton: false,
            timer: 3000
          });
        }
      });
    } else {
      this.submitted = true;
      //this.validateAllFormFields(this.form);
      Swal.fire('Alert', 'Fill all required fields first', 'info');
    }
  }



  customerTags() {
    let lookupTags = "";
    let Tagsdata = new FormData();
    Tagsdata.append('lookupname', lookupTags);
    this.hrservice.fetchTagsLists(Tagsdata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
      this.respcusTags = Response.data || [];
    });
  }

  SelectedTagsValue(event: any) {
    const ids = (event || []).map((e: any) => e?.lookupdataid ?? e);
    const csv = ids.join(',');
    this.addCrmEnquiry.get('tags')?.setValue(ids);
    // this.addCrmEnquiry.get('tag_ids')?.setValue(csv);
  }

  private parseTagCsv(csv: string): string[] {
    if (!csv) { return []; }
    return csv.split(',').map((id: string) => id.trim()).filter((id: string) => id);
  }

  insertnotesDetail() {
    this.isNotesSaved = true;
    if (this.addCrmNotes.valid) {
      this.Notesubmitted = false;
      let notesData = new FormData();
      notesData.append('notes_id', this.addCrmNotes.get('notes_id').value);
      notesData.append('notes', this.addCrmNotes.get('detail').value);
      notesData.append('Customer_id', this.addCrmEnquiry.get('EnquiryId').value);
      notesData.append('NoteType', 'Enquiry');
      this.CrmService.addCrmNotes(notesData).pipe(takeUntil(this.destroy$)).subscribe(Response => {
        if (Response) {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: Response.MESSAGE,
            showConfirmButton: false,
            timer: 2000
          });
          this.addCrmNotes.reset();
          this.reload();
          // this.addCrmNotes.reset();
          this.notesclosebutton.nativeElement.click();
          this.noteReload();
          this.bsReload();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Task Creation Failed',
            showConfirmButton: false,
            timer: 3000
          });
        }
      });
    } else {
      this.Notesubmitted = false;
      Swal.fire({
        icon: 'error',
        title: 'Required fields empty',
        text: 'Please enter the mandatory fields',
        showConfirmButton: false,
        timer: 3000
      });
    }
  }

  notesdatatabl() {
    this.DatatableParameter.notesType = 'Enquiry';

    this.DatatableParameter.Customer_id = this.EnquiryIds;
    const that = this;
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });


    this.dtOptions1 = {
      processing: true,
      serverSide: true,
      dom: 'lrtip',
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
      // columnDefs: [
      //     { orderable: false, targets: 9 }
      // ],
      order: [[2, "desc"]],
      ajax: (dataTablesParameters: any, callback) => {
        Object.assign(dataTablesParameters, this.DatatableParameter);
        that.http.post<DataTablesResponse>(environment.APIEndpoint + 'CrmEnquiryDetails.fetchnotes&reload=1', Object.assign(dataTablesParameters, this.DatatableParameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {
          that.notesdata = resp.data;
          callback({ recordsTotal: resp.recordsTotal, recordsFiltered: resp.recordsTotal, data: [] });
        });
      }
    };
  }

  bookingDatatable() {
    this.BookingDatatableParameter.regPersonsID = this.EnquiryIds;
    this.BookingDatatableParameter.CustomerId = this.CustomerIds;

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.dtOptions2 = {
      processing: true,
      serverSide: true,
      dom: 'lrtip',
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
      order: [[2, "desc"]],
      columnDefs: [{ orderable: false, targets: -1 }],
      ajax: (dataTablesParameters: any, callback) => {
        Object.assign(dataTablesParameters, this.BookingDatatableParameter);
        this.http.post<DataTablesResponse>(
          `${environment.APIEndpoint}booking.fetch_bookingSales&reload=1`, dataTablesParameters, { headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {
            console.log(resp);
            this.bookdata = resp.data;

            callback({
              recordsTotal: resp.recordsTotal,
              recordsFiltered: resp.recordsFiltered, // Adjust if needed
              data: []
            });
          },
            error => {
              console.error("Error fetching data", error);
              callback({ recordsTotal: 0, recordsFiltered: 0, data: [] });
            }
          );
      }
    };
  }



  deleteCustBookEntry(id, enquiry_id, reg_detail_id) {

    let removeRegistryData = new FormData();

    removeRegistryData.append('PersonsId', id);
    removeRegistryData.append('EnquiryId', enquiry_id);
    removeRegistryData.append('bookingId', reg_detail_id);
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'

    }).then((result) => {
      if (result.value) {

        this.billingservice.deleteitem(removeRegistryData).pipe(takeUntil(this.destroy$)).subscribe(response => {


          if (response) {
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: response.MESSAGE,
              showConfirmButton: false,
              timer: 2000
            });
            this.reload();
            this.bsReload();
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


  editNotes(notes_id) {
    this.hrservice.notesdata(notes_id).pipe(takeUntil(this.destroy$)).subscribe(Response => {
      this.addCrmNotes.patchValue({
        detail: Response.DATA[0][2],
        notes_id: Response.DATA[0][0]
      });
    });
    this.notesModalHadding = 'Edit Notes'
    this.notesModalButton.nativeElement.click();

  }
  datatableCode() {
    this.taskmngDatatableParameter.Tasktype = 'CRMTask';
    this.taskmngDatatableParameter.EnquiryId = this.activatedRoute.snapshot.paramMap.get('id');
    const that = this;
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });
    this.dtOptions = {
      processing: true,
      serverSide: true,
      dom: 'lrtip',
      pageLength: 50,
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
      columnDefs: [
        { orderable: false, targets: 4 }
      ],
      ajax: (dataTablesParameters: any, callback) => {
        Object.assign(dataTablesParameters, this.taskmngDatatableParameter);
        that.http.post<taskDataTablesResponse>(environment.APIEndpoint + 'tasks.fetch_task&reload=1', Object.assign(dataTablesParameters, this.taskmngDatatableParameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {
          that.dataa = resp.data;
          callback({ recordsTotal: resp.recordsTotal, recordsFiltered: resp.recordsTotal, data: [] });
        });
      }
    };
  }

  Access
  // ViewTask(id) {
  //   this.router.navigate(['crm-task-details',id,'view']);
  // }

  // editTask(id){
  //   this.router.navigate(['/crm-task-details',id,'edit']);
  // }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
  editTaskTitle() {
    this.Access = false;
  }
  hideTaskTitleSave() {
    this.Access = true;
  }
  saveTaskTitle(taskID) {
    if (this.taskDetails.controls['title'].valid) {
      this.CrmService.updateTitle(this.taskDetails.controls['title'].value, taskID).pipe(takeUntil(this.destroy$)).subscribe(Response => {
        this.resp = Response,
          this.Access = true;
      });
      Swal.fire({
        //position: 'top',
        title: 'Success',
        icon: 'success',
        text: 'Task title updated successfully!',
        showConfirmButton: false,
        timer: 3000,
      });
      this.headerclick.nativeElement.click();
      // this.nheaderclick.nativeElement.click();
      this.reload();
    } else {
      Swal.fire({
        //position: 'top',
        title: 'Alert',
        icon: 'info',
        text: 'Title should not be empty!',
        showConfirmButton: false,
        timer: 3000,
      });
    }
  }
  displaySave() {
    this.showSave = true;
    this.writeAccess = false;
  }

  saveEditTask() {
    if ($("#nextFollowedit").is(':checked') == true ? this.taskDetails.valid && this.nextFollowupedit.valid : this.taskDetails.valid) {
      let edittaskData = new FormData();
      edittaskData.append('TaskId', this.taskId);
      // edittaskData.append('task_title',this.taskDetails.get('title').value);
      edittaskData.append('task_description', this.taskDetails.get('description').value);
      edittaskData.append('taskFollowup', this.taskDetails.get('follwoupDetails').value);
      edittaskData.append('status', this.taskDetails.get('status').value);
      edittaskData.append('taskAction', this.taskDetails.get('taskAction').value);
      edittaskData.append('followUpDate', this.nextFollowupedit.get('editfollowup_date').value);
      edittaskData.append('followUpTime', this.nextFollowupedit.get('editfollowup_Time').value);
      // edittaskData.append('followup_notes', this.nextFollowupedit.get('editfollowup_notes').value);
      edittaskData.append('followcheck', $("#nextFollowedit").prop('checked'));
      edittaskData.append('Tasktype', 'CRMTask');
      edittaskData.append('customerId', this.taskDetails.get('customer_name').value.id);
      this.crmservice.updateTask(edittaskData).pipe(takeUntil(this.destroy$)).subscribe(Response => {
        if (Response.CODE == 200) {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: Response.MESSAGE,
            showConfirmButton: false,
            timer: 2000
          });
          this.reload();
          this.closeModal1();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Task Creation Failed',
            showConfirmButton: false,
            timer: 3000
          });
        }
      });
    } else {
      this.submitted = true;
      Swal.fire('Alert', 'Fill all required fields first', 'info');
    }
  }

  saveMsg(taskId) {
    if (this.taskDetails.controls['description'].valid) {
      this.CrmService.updateDescription(this.taskDetails.controls['description'].value, taskId).pipe(takeUntil(this.destroy$)).subscribe(Response => { this.resp = Response, this.hideSave() });
      Swal.fire({
        //position: 'top',
        title: 'Success',
        icon: 'success',
        text: 'Description saved successfully!',
        showConfirmButton: false,
        timer: 3000,
      });
      this.headerclick.nativeElement.click();
      // this.nheaderclick.nativeElement.click();
      this.reload();
    }
  }
  showConfirmation(editable) {
    if (this.task_status.controls['tstatus'].disabled && editable == true) {
      Swal.fire({
        icon: 'info',
        text: 'Do you want to change the task status?',
        // showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: `Yes`,
        //denyButtonText: `No`,
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          this.task_status.controls['tstatus'].enable();
        }
      });
    }
  }
  showMsg(taskId) {
    if (this.task_status.controls['tstatus'].value != '') {
      let taskStatus = this.task_status.controls['tstatus'].value;
      this.CrmService.updateTaskStatus(taskStatus, taskId).pipe(takeUntil(this.destroy$)).subscribe(Response => { this.resp = Response });
      Swal.fire({
        //position: 'top',
        icon: 'success',
        title: 'Success',
        text: 'Status changed successfully!',
        showConfirmButton: false,
        timer: 3000,
      });
      this.task_status.controls['tstatus'].disable();
      this.headerclick.nativeElement.click();
      // this.nheaderclick.nativeElement.click();
      this.reload();
    }
  }
  hideSave() {
    this.showSave = false;
    this.writeAccess = true;
  }
  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table
      dtInstance.destroy();

      // Clear the trigger
      this.dtTrigger.complete();

      // Reinitialize the trigger
      this.dtTrigger = new Subject<DataTables.Settings>();

      // Trigger the new DataTable
      this.dtTrigger.next();
    });
  }



  deletTask(taskID) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.value) {
        this.CrmService.deleteitem(taskID).pipe(takeUntil(this.destroy$)).subscribe(Response => {

          if (Response) {
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: Response.MESSAGE,
              showConfirmButton: false,
              timer: 2000
            });
            this.headerclick.nativeElement.click();
            // this.nheaderclick.nativeElement.click();
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

  public closeModal() {
    this.hideAddMoreFollowUpButton = false;
    this.followupadd = false;
    this.isAddingTask = false;
    this.closebutton.nativeElement.click();
    const addressArray = this.MoreFollowUps.get('address') as FormArray;
    // Remove all address groups forcefully
    addressArray.clear();
  }


  public taskModalClosed() {
    const addressArray = this.MoreFollowUps.get('address') as FormArray;
    addressArray.clear();

    this.addTask.reset();
    this.addTask.enable();
    this.additionalFollow = false;
    this.isAddingTask = false;
  }

  redirect(link) {
    this.router.navigate(['/' + link]);
  }

  DeleteNotes(id) {
    let removeEnquiryData = new FormData();
    removeEnquiryData.append('notesid', id);
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.value) {
        this.CrmService.deleteEnquiryNotes(removeEnquiryData).pipe(takeUntil(this.destroy$)).subscribe(Response => {
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
    });
  }
  reload() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }
  isFieldValid(field: string) {
    return !this.form.get(field).valid && this.form.get(field).touched;
  }

  displayFieldCss(field: string) {
    return {
      'has-error': this.isFieldValid(field),
      'has-feedback': this.isFieldValid(field)
    };
  }
  onCustomerId() {
    this.addTask.controls['customer_id'].reset();
  }
  // public onOptionsSelected(value, result = "") {
  //   let action_id = typeof (value) == "object" ? value.target.value : value;
  //   let getaction_id = new FormData();
  //   getaction_id.append('action_id',action_id);
  //   this.crmservice.gettaskresult(getaction_id).subscribe(Response =>{
  //     this.respresStatus = Response.data
  //     this.addTask.patchValue({
  //       taskResult: result
  //     });
  //   });
  // }
  addbookingdata() {
    this.bookingSubmitted = false;
    let bookingData = new FormData();
    bookingData.append('plot_type', this.bookingform.get('plot_type').value);
    bookingData.append('booking_status', this.bookingform.get('booking_status').value);
    bookingData.append('Customer_id', this.EnquiryIds);
    this.ProjectService.addbooking(bookingData).pipe(takeUntil(this.destroy$)).subscribe(Response => {
      if (Response) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: Response.MESSAGE,
          showConfirmButton: false,
          timer: 2000
        });
        this.bookingform.reset();
        this.reload();
        //this.attachmentclosebutton.nativeElement.click();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Task Creation Failed',
          showConfirmButton: false,
          timer: 3000
        });
      }
    });
  }
  formatDetails(details: string): string {
    if (!details) return '';
    return details.replace(/,\s*(Shown By|Notes)/gi, ',\n$1');
  }


  addNewFollowUpGroup() {
    this.isHideFollowUps = true;
    this.editMode = true;
    const add = this.MoreFollowUps.get('address') as FormArray;
    add.push(this.formBuilder.group({

      fuDesp: [],
      fuDate: [],
      fuTime: [],

    }));
  }


  deleteAddressGroup(index: number) {

    this.editMode = false;
    const addressArray = this.MoreFollowUps.get('address') as FormArray;

    if (index >= 0 && index < addressArray.length) {
      addressArray.removeAt(index);
    } else {
      console.warn('Invalid index:', index);
    }

    // this.fuDesp[index] = false;
    this.fuDate[index] = false;
    this.fuTime[index] = false;

  }


  enquiryModeList() {
    let formData = new FormData();
    formData.append('lookupTypeId', '79ac32a7-ef7c-11f0-9534-065da37009bd');
    this.CrmService.getEnquiryModeList(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.enquiryModeData = resp.data;
    });
  }

  onStageChange(stageId: any) {

    if (!stageId) return;

    const selectedStage = this.respStages.find(
      (s: any) => s.erpStageID == stageId
    );

    if (!selectedStage) return;

    // 👉 Store previous ONLY when modal-triggering condition
    if (selectedStage.stage_name?.toLowerCase() === 'not interested') {

      // store current (before change effect spreads)
      this.previousStageId = this.lastStageValue;

      this.addCrmNotes.reset();
      this.notesModalHadding = 'Add Reason (Not Interested)';
      this.Notesubmitted = false;

      setTimeout(() => {
        this.isNotesSaved = false;
        this.notesModalButton?.nativeElement?.click();
      });
    }

    // always update last value
    this.lastStageValue = stageId;
  }

  storePreviousStage() {
    this.previousStageId = this.addCrmEnquiry.get('stage')?.value;
  }

  onNotesCancel() {
    if (!this.isNotesSaved && this.previousStageId !== null) {
      this.addCrmEnquiry.get('stage')?.setValue(this.previousStageId);
    }
  }

}

