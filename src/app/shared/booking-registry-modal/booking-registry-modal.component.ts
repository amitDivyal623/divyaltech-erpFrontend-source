import { Component, OnInit, OnDestroy, Input, ViewChild, Injectable, ElementRef } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbCalendar, NgbDateAdapter, NgbDate, NgbModule, NgbDateParserFormatter, NgbDateStruct, NgbInputDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { BillingService } from 'src/app/services/billing.service';
import { CrmService } from 'src/app/services/crm.service';
import { HrService } from 'src/app/services/hr.service';
import { ProductService } from 'src/app/services/product.service';
import Swal from 'sweetalert2';
import { DatePipe } from '@angular/common';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { RegistryRecordComponent } from 'src/app/booking-registry/registry-record/registry-record.component';
import { AddCrmEnquiryComponent } from 'src/app/crm/crm-enquiry/add-crm-enquiry/crm-enquiry-details.component';
import { forkJoin, Subject } from 'rxjs';


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
  selector: 'app-booking-registry-modal',
  templateUrl: './booking-registry-modal.component.html',
  styleUrls: ['./booking-registry-modal.component.scss'],
  providers: [
    NgbInputDatepickerConfig,
    { provide: NgbDateAdapter, useClass: CustomAdapter },
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter }
  ]
})
export class BookingRegistryModalComponent implements OnInit, OnDestroy {
  onFocused($event: any) {
    throw new Error('Method not implemented.');
  }
  private destroy$ = new Subject<void>();
  @Input() flg!: string;
  @Input() id!: string;
  @Input() header!: string;
  @Input() submitted!: boolean;
  @Input() bkPayment!: any[];
  @Input() bkAmtPaid!: any[];
  @Input() bkPaidDate!: any[];
  @Input() bkChequeNo!: any[];
  @Input() bkchequeDate!: any[];
  @Input() bkTransactionId!: any[];
  @Input() paidCustomerNm!: any[];
  @Input() bkRemark!: any[];
  @Input() bksubmitdate!: any[];
  @Input() bkbankName!: any[];
  @Input() setData!: boolean;
  @Input() bkCustomerNm!: string;
  @Input() bkCustId!: string;
  @Input() bkEnqId!: string;
  @Input() bkMobileNo!: string;
  @Input() bkCity!: string;
  @Input() bkState!: string;
  @Input() bkAddress!: string;
  @Input() bkCategory!: string;
  @Input() bktitle!: string;
  @Input() datatable_directive: any;
  @Input() bheaderclick: any;
  editMode: Boolean = false;
  Access = false;
  keyword = 'name';
  amtPaid = { 0: false };
  paidDate = { 0: false };
  reason = { 0: false };
  chequeDate = { 0: false };
  chequeNumber = { 0: false };
  transactionId = { 0: false };
  payedTo = { 0: false };
  bankName = { 0: false };
  submitDate = { 0: false };
  productdataList: any[] = [];
  customerdataList = [];
  productdata: any[] = [];
  customerData = [];
  @ViewChild('closebutton') closebutton!: ElementRef;
  @ViewChild('NgbdDatepicker') d!: NgbDateStruct;
  @Input() bookedPlotData: any;
  minDate = { year: 1900, month: 1, day: 1 };
  maxDate = { year: 2099, month: 12, day: 31 };
  paymentdetail: FormGroup;
  addBookingDetail!: FormGroup;
  customerSuggestion: any;
  product: any;
  bookingHeading!: string;
  resplookupTitel: any;
  resplookupCategory: any;
  resplookupBank: any;
  resplookupremark: any;
  respPPlan: any;
  hideSubmitbutton: boolean = true;

  constructor(private formBuilder: FormBuilder, private crmservice: CrmService, private productService: ProductService, private billingservice: BillingService, private datePipe: DatePipe, private hrservice: HrService, public modal: NgbActiveModal, private CrmService: CrmService,) {
    this.paymentdetail = formBuilder.group({
      address: formBuilder.array([])
    });
  }
  ngOnInit(): void {
    this.addBookingDetail = this.formBuilder.group({
      regDetailID: new FormControl('',),
      regPersonID: new FormControl('',),
      regPlotID: new FormControl('',),
      bktype: new FormControl('',),
      bkCustId: new FormControl(''),
      bkEnqId: new FormControl(''),
      bktitle: new FormControl('', Validators.required),
      bkCustomerNm: new FormControl('', Validators.required),
      bkbkAge: new FormControl('',),
      bkCategory: new FormControl('', Validators.required),
      bkMobileNo: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]\d*$/)]),
      bkBookingName: new FormControl('', Validators.required),
      bkAlternate: new FormControl('',),
      bkTehsil: new FormControl('', Validators.pattern('^[a-zA-Z \-\']+')),
      bkDistrict: new FormControl('', Validators.pattern('^[a-zA-Z \-\']+')),
      bkCity: new FormControl('', Validators.pattern('^[a-zA-Z \-\']+')),
      bkState: new FormControl('', Validators.pattern('^[a-zA-Z \-\']+')),
      bkPincode: new FormControl(''),
      bkOccupation: new FormControl('', Validators.pattern('^[a-zA-Z \-\']+')),
      bkCaretaker: new FormControl(''),
      // bkSpouse: new FormControl('',Validators.required),
      bkSpouse: new FormControl(''),
      bkAddress: new FormControl('', Validators.required),
      bkTargetDate: new FormControl('', Validators.required),
      booking_date: new FormControl('', Validators.required),
      bknumber: new FormControl(''),
      bkPaymentPlan: new FormControl('', Validators.required),
      totalAmount: new FormControl(''),
      totalArea: new FormControl(''),
      totalPlotAmtPerSqft: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*([.][0-9]+)?$')]),
      plots: this.formBuilder.array([this.createPlotFormGroup()])
    });
    if (this.bookedPlotData) {
      this.bookingHeading = "Edit the Registry";

      if (this.flg == 'viewBooking') {
        this.addBookingDetail.disable();
        this.hideSubmitbutton = false;
      }
      // this.PaymentPlanlist();

      // const selectedPlan = this.respPPlan.find(plan => plan.plan_name === this.bookedPlotData.payment_plan);   
      this.addBookingDetail.get('bkCustomerNm')?.disable();
      this.addBookingDetail.patchValue({
        bkCategory: this.bookedPlotData.category,
        bkOccupation: this.bookedPlotData.occupation,
        bkCaretaker: this.bookedPlotData.caretaker,
        bkSpouse: this.bookedPlotData.spouse_gr_name,
        bkbkAge: this.bookedPlotData.age,
        bkAlternate: this.bookedPlotData.alt_number,
        bkAddress: this.bookedPlotData.address,
        bkBookingName: this.bookedPlotData.buyerName,
        bkPincode: this.bookedPlotData.zipcode,
        bkTehsil: this.bookedPlotData.tah,
        bkDistrict: this.bookedPlotData.district,
        bkCity: this.bookedPlotData.city,
        bkState: this.bookedPlotData.state,
        bkPaymentPlan: this.bookedPlotData.payment_plan,
        // bkPaymentPlan: selectedPlan ? selectedPlan.erpPlanID : '',
        // bkTargetDate: this.bookedPlotData.registry_date,
        bkTargetDate: this.datePipe.transform(this.bookedPlotData.registry_date, 'dd/MM/yyyy'),
        booking_date: this.datePipe.transform(this.bookedPlotData.booking_date, 'dd/MM/yyyy'),

        bknumber: this.bookedPlotData.book_number,
        regDetailID: this.bookedPlotData.details_id,
        regPersonID: this.bookedPlotData.persons_id,
        regPlotID: this.bookedPlotData.plot_id,
      });

      // Populate plots FormArray with the existing plot data
      const plotsFormArray = this.plots;
      plotsFormArray.removeAt(0); // Remove the initial empty plot

      const plotFormGroup = this.formBuilder.group({
        bkPlotName: new FormControl(this.bookedPlotData.plot_name, Validators.required),
        productId: new FormControl(this.bookedPlotData.product_id || ''),
        bkPlotSqft: new FormControl(this.bookedPlotData.plot_area),
        bkPlotAmt: [this.bookedPlotData.amount_per_sqft, [Validators.required, Validators.pattern('^[0-9]*([.][0-9]+)?$')]],
        bkPlotTotalAmt: new FormControl(this.bookedPlotData.total_amount),
        bkKhasraNo: new FormControl(this.bookedPlotData.khasra_number),
        bkRawKhasraNo: new FormControl(this.bookedPlotData.raw_khasra_number || ''),
        bkFront: new FormControl(this.bookedPlotData.plot_length),
        bkDepth: new FormControl(this.bookedPlotData.plot_depth)
      });

      plotsFormArray.push(plotFormGroup);
    }

    if (this.flg == "addBookingRegistry") {
      this.bookingHeading = "Add New Registry"
    }
    else {
      this.bookingHeading = "Add New Booking";

      let getEnquiryId = new FormData();
      getEnquiryId.append('EnquiryId', this.id);
      this.CrmService.getCrmEnquiryMngmt(getEnquiryId).pipe(takeUntil(this.destroy$)).subscribe(Response => {

        this.addBookingDetail.patchValue({
          bkEnqId: Response.data[0].EnquiryId,
          bkCustId: Response.data[0].CustomerId,
          bkCustomerNm: Response.data[0].VisitorName,
          bkMobileNo: Response.data[0].MobileNumber,
          bkCity: Response.data[0].CityId,
          bkState: Response.data[0].State,
          bkAddress: Response.data[0].Address,
          bkCategory: Response.data[0].Category,
          bktitle: Response.data[0].Title,
        })
      })
    }
    this.lookupdatalist();
    this.PaymentPlanlist();
    if (this.setData == true) {

    }

  }



  createPlotFormGroup(): FormGroup {
    return this.formBuilder.group({
      bkPlotName: new FormControl('', Validators.required),
      productId: new FormControl(''),
      bkPlotSqft: new FormControl(''),
      bkPlotAmt: ['', [Validators.required, Validators.pattern('^[0-9]*([.][0-9]+)?$')]],
      bkPlotTotalAmt: new FormControl(''),
      bkKhasraNo: new FormControl(''),
      bkRawKhasraNo: new FormControl(''),
      bkFront: new FormControl(''),
      bkDepth: new FormControl(''),
      allSides: new FormControl('')
    });
  }

  get plots(): FormArray {
    return this.addBookingDetail.get('plots') as FormArray;
  }

  addPlot(): void {
    this.plots.insert(0, this.createPlotFormGroup());
    this.calculateTotalAmount();
  }

  removePlot(index: number): void {
    if (this.plots.length > 1) {
      this.plots.removeAt(index);
    } else {
      Swal.fire('Alert', 'At least one plot is required', 'info');
    }
    this.calculateTotalAmount();
  }

  getPlotFormGroup(index: number): FormGroup {
    return this.plots.at(index) as FormGroup;
  }

  onChangeSearch(e: string): void {
    if (e.length >= 3) {
      this.productlistData(e);
    } else {
      this.productdataList = [];
    }
  }


  selectEvent(item: any, index?: number): void {
    const plotIndex = index !== undefined ? index : 0;
    const plotForm = this.getPlotFormGroup(plotIndex);

    plotForm.get('productId')?.setValue(item.id);

    let productData = new FormData();
    productData.append('productId', item.id);

    this.productService.productData(productData).pipe(takeUntil(this.destroy$)).subscribe((Response) => {

      //  ERROR CASE (404)
      if (Response.CODE === 404) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: Response.MESSAGE
        });

        this.clearPlot(plotForm);
        this.calculateTotalAmount();
        return;
      }

      const newKhasra = Response.DATA[0][22]; // custom7 -> land khasra no.

      //  CHECK: Compare with existing plots
      const isMismatch = this.plots.controls.some((control, i: number) => {
        const group = control as FormGroup;
        if (i === plotIndex) return false; // skip current row

        const existingKhasra = group.get('bkKhasraNo')?.value;
        return existingKhasra && existingKhasra !== newKhasra;
      });

      if (isMismatch) {
        Swal.fire({
          icon: 'warning',
          title: 'Khasra Mismatch',
          text: 'The entered plot has a different Khasra number, so it cannot be added here.'
        });

        this.clearPlot(plotForm);
        this.calculateTotalAmount();
        return;
      }
      //  SUCCESS CASE
      const rate = Response.DATA[0][11];
      const sqft = Response.DATA[0][10];
      const rawKhasra = Response.DATA[0][28]; // custom3 -> c3 -> RawLand khasra No.

      this.addBookingDetail.get('totalPlotAmtPerSqft')?.setValue(this.roundTo2(rate));
      const allSides = Response.DATA[0][29]; // assuming custom14
      plotForm.patchValue({
        bkPlotAmt: rate,
        bkKhasraNo: newKhasra,
        bkRawKhasraNo: rawKhasra,
        bkPlotSqft: sqft,
        bkPlotTotalAmt: rate * sqft,
        bkFront: Response.DATA[0][19],
        bkDepth: Response.DATA[0][20],
        allSides: allSides
      });
      this.calculateTotalAmount();
    });

    this.productdataList = [];
  }

  onChangeTotalPerSqft(event: any): void {
    const value = parseFloat(event.target.value) || 0;

    this.plots.controls.forEach((control, index: number) => {

      const plotGroup = control as FormGroup;
      const sqft = parseFloat(plotGroup.get('bkPlotSqft')?.value) || 0;

      if (sqft > 0) {
        const total = this.roundTo2(sqft * value);

        plotGroup.patchValue({
          bkPlotAmt: value,
          bkPlotTotalAmt: total
        });
      }
    });

    this.calculateTotalAmount();

  }

  onChangeTotalAmount(event: any): void {
    const totalAmount = parseFloat(event.target.value) || 0;
    const totalArea = parseFloat(this.addBookingDetail.get('totalArea')?.value) || 0;

    if (totalArea <= 0) return;

    let rate = totalAmount / totalArea;
    rate = this.roundTo2(rate);

    //  Update global per sqft field
    this.addBookingDetail.get('totalPlotAmtPerSqft')?.setValue(rate);

    //  Update all plots
    this.plots.controls.forEach((control) => {
      const plotGroup = control as FormGroup;
      const sqft = parseFloat(plotGroup.get('bkPlotSqft')?.value) || 0;

      if (sqft > 0) {
        const total = this.roundTo2(sqft * rate);
        plotGroup.patchValue({
          bkPlotAmt: rate,
          bkPlotTotalAmt: total
        });
      }
    });
  }

  onChangeFrontOrDepth(index: number): void {
    const plotForm = this.getPlotFormGroup(index);
    const front = parseFloat(plotForm.get('bkFront')?.value) || 0;
    const depth = parseFloat(plotForm.get('bkDepth')?.value) || 0;
    const rate = parseFloat(plotForm.get('bkPlotAmt')?.value) || 0;

    const area = this.roundTo2(front * depth);
    const total = this.roundTo2(area * rate);

    plotForm.patchValue({
      bkPlotSqft: area,
      bkPlotTotalAmt: total
    });

    this.calculateTotalAmount();
  }

  onChangePlotArea(index: number): void {
    const plotForm = this.getPlotFormGroup(index);
    const area = parseFloat(plotForm.get('bkPlotSqft')?.value) || 0;
    const rate = parseFloat(plotForm.get('bkPlotAmt')?.value) || 0;

    const total = this.roundTo2(area * rate);

    plotForm.patchValue({
      bkPlotTotalAmt: total
    });

    this.calculateTotalAmount();
  }

  clearPlot(plotForm: FormGroup) {
    plotForm.patchValue({
      bkPlotName: null,
      bkPlotAmt: null,
      bkKhasraNo: null,
      bkPlotSqft: null,
      bkPlotTotalAmt: null,
      bkFront: null,
      bkDepth: null,
      productId: null
    });
  }


  selectCust(e: any): void {
    this.addBookingDetail.get('regDetailID')?.setValue(e.id);
    this.addBookingDetail.get('bkCustomerNm')?.setValue(e.name);
    let customerData = new FormData();
    customerData.append('CustomerId', e.id);
    this.crmservice.getCrmCustomerMngmt(customerData).pipe(takeUntil(this.destroy$)).subscribe(resp => {

      console.log(resp);
      this.addBookingDetail.get('bkBookingName')?.setValue(resp.DATA[0][2] + ' ' + resp.DATA[0][3])
      this.addBookingDetail.get('bkAddress')?.setValue(resp.DATA[0][8]);
      this.addBookingDetail.get('bkCity')?.setValue(resp.DATA[0][9]);
      this.addBookingDetail.get('bkState')?.setValue(resp.DATA[0][10]);
      this.addBookingDetail.get('bkMobileNo')?.setValue(resp.DATA[0][6]);
      this.addBookingDetail.get('bkAlternate')?.setValue(resp.DATA[0][19]);
      this.addBookingDetail.get('bktitle')?.setValue(resp.DATA[0][21]);
      this.addBookingDetail.get('bkCategory')?.setValue(resp.DATA[0][20]);
      this.addBookingDetail.get('bkPincode')?.setValue(resp.DATA[0][12]);
      this.addBookingDetail.get('bkEnqId')?.setValue(resp.DATA[0][25]);
    });

    this.customerdataList = [];
  }

  roundTo2(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }


  productlistData(e: any): void {
    let productlist = new FormData();
    productlist.append('value', e);
    productlist.append('type', 'Plot');
    this.crmservice.getregproduct(productlist).pipe(takeUntil(this.destroy$)).subscribe((resp) => {

      this.product = resp.data;

      this.productdata = [] as any[];
      for (let i = 0; i < this.product.length; i++) {
        this.productdata.push({
          id: this.product[i].ProductId,
          name: this.product[i].ProductName
        });
      }
      //  GET ALL SELECTED PRODUCT IDs
      const selectedIds = this.plots.controls
        .map((g) => (g as FormGroup).get('productId')?.value)
        .filter(id => id);

      //  FILTER OUT ALREADY SELECTED PLOTS
      this.productdata = this.productdata.filter(item => {
        return !selectedIds.includes(item.id);
      });

      this.productdata.sort(this.alphanumericSort);

      //  FINAL LIST
      this.productdataList = this.productdata;
    });
  }

  alphanumericSort(a: any, b: any): number {
    const aParts = a.name.match(/(\d+|\D+)/g) || [];
    const bParts = b.name.match(/(\d+|\D+)/g) || [];

    const maxLength = Math.max(aParts.length, bParts.length);

    for (let i = 0; i < maxLength; i++) {
      const aPart = aParts[i] || '';
      const bPart = bParts[i] || '';

      const aNum = parseInt(aPart, 10);
      const bNum = parseInt(bPart, 10);

      if (!isNaN(aNum) && !isNaN(bNum)) {
        if (aNum !== bNum) {
          return aNum - bNum;
        }
      } else {
        // Handling special characters and non-numeric parts
        const cmp = aPart.localeCompare(bPart, undefined, { numeric: true, sensitivity: 'base' });
        if (cmp !== 0) {
          return cmp;
        }
      }
    }

    return 0;
  }



  onCustomerSearch(e: string) {
    if (e.length >= 3) {
      this.customerlistData(e);
    } else {
      this.customerdataList = [];
    }
  }

  customerlistData(e: string) {
    let customerlist = new FormData();
    customerlist.append('value', e);

    this.crmservice.getCustomerDetail(customerlist).pipe(takeUntil(this.destroy$)).subscribe((resp) => {

      this.customerSuggestion = resp.data;
      this.customerData = this.customerSuggestion.map((item: any) => ({
        id: item.CustomerId,
        name: item.Name,
        phone: item.PhoneNumber
      }));
      this.customerdataList = this.customerData;
    });
  }




  PaymentPlanlist() {
    let PaymentPlan = "";
    let PaymentPlandata = new FormData();
    PaymentPlandata.append('StagesStatus', PaymentPlan);
    this.billingservice.get_PaymentPlan(PaymentPlandata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
      this.respPPlan = Response.data;
    });
  }


  insertBookingDetail() {
    this.submitted = false;
    if (this.addBookingDetail.valid) {

      if (!this.validateCommonPlotAmtPerSqft()) {
        return;
      }

      const plotsArray = this.plots.value;

      // Collect all plot data and combine as CSV
      const plotNames: string[] = [];
      const plotSqfts: number[] = [];
      const plotAmts: number[] = [];
      const plotTotalAmts: number[] = [];
      const plotKhasraNumbers: string[] = [];
      const plotRawKhasraNumbers: string[] = [];
      const plotFronts: number[] = [];
      const plotDepths: number[] = [];
      const plotSizes: string[] = [];
      const productIds: number[] = [];

      plotsArray.forEach((plot: any) => {
        // Plot Name
        let bkPlotValue = plot.bkPlotName;
        let plot_name = typeof bkPlotValue === "object" ? bkPlotValue.name : bkPlotValue;
        plotNames.push(plot_name);

        // Other plot details
        plotSqfts.push(plot.bkPlotSqft || '');
        plotAmts.push(plot.bkPlotAmt || '');
        plotTotalAmts.push(plot.bkPlotTotalAmt || '');
        plotKhasraNumbers.push(plot.bkKhasraNo || '');
        plotRawKhasraNumbers.push(plot.bkRawKhasraNo || '');
        productIds.push(plot.productId || '');
        const front = parseFloat(plot.bkFront) || 0;
        const depth = parseFloat(plot.bkDepth) || 0;

        plotFronts.push(front);
        plotDepths.push(depth);

        // Calculate plot size
        const size = front * depth;
        plotSizes.push(size.toString());
      });

      // Convert arrays to CSV format
      const csvPlotNames = plotNames.join(',');
      // const csvPlotSqfts = plotSqfts.join(',');
      // const csvPlotAmts = plotAmts.join(',');
      const csvPlotTotalAmts = plotTotalAmts.join(',');
      const csvPlotKhasraNumbers = plotKhasraNumbers.join(',');
      const csvPlotRawKhasraNumbers = plotRawKhasraNumbers.join(',');
      const csvPlotFronts = plotFronts.join(',');
      const csvPlotDepths = plotDepths.join(',');
      const csvProductIds = productIds.join(',');
      const csvPlotSizes = plotSizes.join(',');

      // Create single bookingData FormData
      let bookingData: any = new FormData();

      bookingData.append('regDetailID', this.addBookingDetail.get('regDetailID')?.value);
      bookingData.append('customerId', this.addBookingDetail.get('regDetailID')?.value);
      bookingData.append('regPersonID', this.addBookingDetail.get('regPersonID')?.value);
      bookingData.append('regPlotID', this.addBookingDetail.get('regPlotID')?.value);
      bookingData.append('bktype', 'Buyer');

      bookingData.append('bkCustId', this.addBookingDetail.get('bkCustId')?.value);
      bookingData.append('bkEnqId', this.addBookingDetail.get('bkEnqId')?.value);

      bookingData.append('bktitle', this.addBookingDetail.get('bktitle')?.value);
      bookingData.append('bkCustomerNm', this.addBookingDetail.get('bkBookingName')?.value);
      bookingData.append('bkAddress', this.addBookingDetail.get('bkAddress')?.value);
      bookingData.append('bkbkAge', this.addBookingDetail.get('bkbkAge')?.value);
      bookingData.append('bkCategory', this.addBookingDetail.get('bkCategory')?.value);
      bookingData.append('bkOccupation', this.addBookingDetail.get('bkOccupation')?.value);
      bookingData.append('bkCaretaker', this.addBookingDetail.get('bkCaretaker')?.value);
      bookingData.append('bkSpouse', this.addBookingDetail.get('bkSpouse')?.value);
      bookingData.append('bkMobileNo', this.addBookingDetail.get('bkMobileNo')?.value);
      bookingData.append('bkAlternate', this.addBookingDetail.get('bkAlternate')?.value);
      bookingData.append('bkTehsil', this.addBookingDetail.get('bkTehsil')?.value);
      bookingData.append('bkDistrict', this.addBookingDetail.get('bkDistrict')?.value);
      bookingData.append('bkCity', this.addBookingDetail.get('bkCity')?.value);
      bookingData.append('bkState', this.addBookingDetail.get('bkState')?.value);
      bookingData.append('bkPincode', this.addBookingDetail.get('bkPincode')?.value);
      bookingData.append('bknumber', this.addBookingDetail.get('bknumber')?.value);
      bookingData.append('bkTargetDate', this.addBookingDetail.get('bkTargetDate')?.value);
      bookingData.append('booking_date', this.addBookingDetail.get('booking_date')?.value);
      bookingData.append('bkPaymentPlan', this.addBookingDetail.get('bkPaymentPlan')?.value);

      // Append CSV plot data
      bookingData.append('bkPlotName', csvPlotNames);
      bookingData.append('bkPlotSqft', this.addBookingDetail.get('totalArea')?.value);
      bookingData.append('bkPlotAmt', this.addBookingDetail.get('totalPlotAmtPerSqft')?.value);
      bookingData.append('bkPlotTotalAmt', this.addBookingDetail.get('totalAmount')?.value);
      bookingData.append('bkKhasraNo', csvPlotKhasraNumbers);
      bookingData.append('bkRawKhasraNo', csvPlotRawKhasraNumbers);
      bookingData.append('bkFront', csvPlotFronts);
      bookingData.append('bkDepth', csvPlotDepths);
      bookingData.append('bkPlotSize', csvPlotSizes);
      bookingData.append('productId', csvProductIds);

      if (this.flg == 'editBooking') {
        bookingData.append('bkPlotTotAmnt', csvPlotTotalAmts);
      }

      this.billingservice.add_BookingDetail(bookingData).pipe(takeUntil(this.destroy$)).subscribe((Response) => {

        if (Response.CODE == 200) {

          // update plots data in the products table
          this.updatePlotsInProductTable(this.plots.value);

          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'All plots added successfully',
            showConfirmButton: false,
            timer: 2000
          });
          this.addBookingDetail.reset();
          this.datatable_directive ? this.datatable_directive.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.ajax.reload();
          }) : '';

          this.modal.close(this.addBookingDetail.value);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: Response.MESSAGE,
            showConfirmButton: false,
            timer: 3000
          });
        }
      });
    }
    else {
      this.submitted = true;
      Swal.fire('Alert', 'Fill all required fields first', 'info');
    }

  }


  private validateCommonPlotAmtPerSqft(): boolean {
    const totalRateRaw = this.addBookingDetail.get('totalPlotAmtPerSqft')?.value;
    const totalRate = this.roundTo2(parseFloat(totalRateRaw) || 0);

    const mismatch = this.plots.controls.some((control) => {
      const plotGroup = control as FormGroup;
      const plotRateRaw = plotGroup.get('bkPlotAmt')?.value;
      const plotRate = this.roundTo2(parseFloat(plotRateRaw) || 0);
      return plotRate !== totalRate;
    });

    if (mismatch) {
      Swal.fire({
        icon: 'info',
        title: 'Alert',
        text: 'Total Plot Amt (per sqft) should be common for all plots. Please make all Plot Amt (per sqft) values match before saving.'
      });
      return false;
    }

    return true;
  }


  updatePlotsInProductTable(plots: any[]) {
    const updateCalls = plots.map(plot => {
      let payload = new FormData();

      payload.append('productId', plot.productId);
      // payload.append('khasraNo', plot.bkKhasraNo || '');
      // payload.append('rawKhasraNo', plot.bkRawKhasraNo || '');
      payload.append('plotArea', plot.bkPlotSqft || '');
      payload.append('plotAmount', plot.bkPlotAmt || '');
      // payload.append('plotTotalAmount', plot.bkPlotTotalAmt || '');
      payload.append('front', plot.bkFront || '');
      payload.append('depth', plot.bkDepth || '');

      // Add more fields if your API needs

      return this.productService.updatePlot(payload);
    });

    // Run all APIs in parallel
    forkJoin(updateCalls).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        console.log('All plots updated successfully', res);
      },
      error: (err) => {
        console.error('Some plot updates failed', err);
      }
    });
  }


  reload() {
    throw new Error('Method not implemented.');
  }
  public closeModal() {
    this.closebutton.nativeElement.click();
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
      this.resplookupBank = Response.data
    });
    let lookupRemark = "Remark";
    let remarkdata = new FormData();
    remarkdata.append('lookupname', lookupRemark);
    this.hrservice.fetch_lookupdata(remarkdata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
      this.resplookupremark = Response.data
    });
  }

  calculateTotalAmount(): void {
    let totalAmount = 0;
    let totalArea = 0;

    this.plots.controls.forEach((control) => {
      const plotGroup = control as FormGroup;
      const plotAmt = parseFloat(plotGroup.get('bkPlotTotalAmt')?.value) || 0;
      const plotArea = parseFloat(plotGroup.get('bkPlotSqft')?.value) || 0;

      totalAmount += plotAmt;
      totalArea += plotArea;
    });

    totalAmount = this.roundTo2(totalAmount);
    totalArea = this.roundTo2(totalArea);

    this.addBookingDetail.get('totalAmount')?.setValue(totalAmount);
    this.addBookingDetail.get('totalArea')?.setValue(totalArea);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
