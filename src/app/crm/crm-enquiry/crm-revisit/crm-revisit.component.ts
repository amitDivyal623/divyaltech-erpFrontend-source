import { Component, Injectable, OnInit, OnDestroy, ViewChild } from '@angular/core';
import {
  NgbDateAdapter,
  NgbDateParserFormatter,
  NgbDateStruct,
} from '@ng-bootstrap/ng-bootstrap';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { DatePipe } from '@angular/common';
import Swal from 'sweetalert2';
import { CrmService } from '../../../services/crm.service';
import { HrService } from 'src/app/services/hr.service';
import { ProductService } from '../../../services/product.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Injectable()
export class RevisitDateAdapter extends NgbDateAdapter<string> {
  readonly DELIMITER = '-';

  fromModel(value: string | null): NgbDateStruct | null {
    if (value) {
      const date = value.split(this.DELIMITER);
      return {
        day: parseInt(date[0], 10),
        month: parseInt(date[1], 10),
        year: parseInt(date[2], 10),
      };
    }
    return null;
  }

  toModel(date: NgbDateStruct | null): string | null {
    return date
      ? date.day + this.DELIMITER + date.month + this.DELIMITER + date.year
      : null;
  }
}

@Injectable()
export class RevisitDateParserFormatter extends NgbDateParserFormatter {
  readonly DELIMITER = '/';

  parse(value: string): NgbDateStruct | null {
    if (value) {
      const date = value.split(this.DELIMITER);
      return {
        day: parseInt(date[0], 10),
        month: parseInt(date[1], 10),
        year: parseInt(date[2], 10),
      };
    }
    return null;
  }

  format(date: NgbDateStruct | null): string {
    return date
      ? ('0' + date.day).slice(-2) +
          this.DELIMITER +
          ('0' + date.month).slice(-2) +
          this.DELIMITER +
          date.year
      : '';
  }
}

@Component({
  selector: 'app-crm-revisit',
  templateUrl: './crm-revisit.component.html',
  styleUrls: ['./crm-revisit.component.css'],
  providers: [
    { provide: NgbDateAdapter, useClass: RevisitDateAdapter },
    { provide: NgbDateParserFormatter, useClass: RevisitDateParserFormatter },
    DatePipe,
  ],
})
export class CrmRevisitComponent implements OnInit, OnDestroy {
  [x: string]: any;

  private destroy$ = new Subject<void>();

  @ViewChild('closebutton') closebutton;
  @ViewChild('notes') notes;
  @ViewChild('addNewRevisit') addNewRevisit;

  keyword = 'name';
  minDate = { year: 1900, month: 1, day: 1 };
  maxDate = this.getCurrentDate();
  minDate1 = this.getCurrentDate();
  maxDate1 = { year: 2034, month: 1, day: 1 };

  submitted = false;
  isSaveButtonDisabled = false;
  additionalFollow = false;
  customerSelected = false;
  more_detail_btn = true;
  plot_details: any = {};

  customerdataList = [];
  customerNoopFilter = (items: any[], query: string) => items;
  productdata = [];
  productdataList = [];
  employeedataList = [];
  employeeSearchLoading = false;

  plotField: FormGroup;

  addRevisit = new FormGroup({
    visitor_id: new FormControl(''),
    taskId: new FormControl(''),
    visitproductId: new FormControl(''),
    customer_id: new FormControl(''),
    visitor_name: new FormControl('', Validators.required),
    visitor_date: new FormControl('', Validators.required),
    visitors_Time: new FormControl('', Validators.required),
    visitors_no: new FormControl('', [
      Validators.required,
      Validators.maxLength(10),
      Validators.minLength(10),
      Validators.pattern(/^[0-9]\d*$/),
    ]),
    alter_Name: new FormControl(''),
    alter_Number: new FormControl(''),
  });

  OnlyPLotShownBY = new FormGroup({
    selectedPlotShownBy: new FormControl(''),
  });

  nextFollowup = new FormGroup({
    followup_date: new FormControl('', Validators.required),
    followup_Time: new FormControl('', Validators.required),
    followup_notes: new FormControl('', Validators.required),
  });

  constructor(
    private _fb: FormBuilder,
    private CrmService: CrmService,
    private hrservice: HrService,
    private productService: ProductService,
    private spinner: NgxSpinnerService
  ) {
    this.plotField = this._fb.group({
      plotFieldArrayForm: this._fb.array([]),
    });
  }

  ngOnInit(): void {
    this.employeelistData();
  }

  getCurrentDate() {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
    };
  }

  openRevisitModal() {
    this.isSaveButtonDisabled = false;
    this.submitted = false;
    this.additionalFollow = false;
    $('#revisit_nextFollow').prop('checked', false);
    this.addRevisit.reset();
    this.nextFollowup.reset();
    this.OnlyPLotShownBY.reset();
    this.customerdataList = [];
    this.productdataList = [];
    if (this.notes) {
      this.notes.nativeElement.value = null;
    }
    this.plot_details = {};
    this.removeFormArray();
    this.AddFormArrya(1);
    this.customerSelected = false;
    this.setDependentFieldsState(false);
    this.addNewRevisit.nativeElement.click();
  }

  private setDependentFieldsState(enabled: boolean) {
    ['visitors_no', 'alter_Name', 'alter_Number', 'visitor_date', 'visitors_Time'].forEach(
      (name) => {
        const control = this.addRevisit.get(name);
        if (enabled) {
          control.enable({ emitEvent: false });
        } else {
          control.disable({ emitEvent: false });
        }
      }
    );

    if (enabled) {
      this.plotField.enable({ emitEvent: false });
      this.OnlyPLotShownBY.enable({ emitEvent: false });
      this.nextFollowup.enable({ emitEvent: false });
    } else {
      this.plotField.disable({ emitEvent: false });
      this.OnlyPLotShownBY.disable({ emitEvent: false });
      this.nextFollowup.disable({ emitEvent: false });
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
    const customerlist = new FormData();
    customerlist.append('value', e);
    this.CrmService.searchCustomerByNameOrPhone(customerlist).pipe(takeUntil(this.destroy$)).subscribe((resp) => {

      this.customerdataList = (resp.data || []).map((item) => ({
        id: item.CustomerId,
        name: item.Name,
        phone: item.PhoneNumber,
        enquiryId: item.EnquiryId,
      }));
    });
  }

  selectCust(item) {
    // 'customer_id' holds EnquiryId here to match add_CrmVisitorDetail's expected Customer_id payload field
    this.addRevisit.controls['customer_id'].setValue(item?.enquiryId || '');
    this.customerdataList = [];
    this.customerSelected = !!item?.id;
    this.setDependentFieldsState(this.customerSelected);
    this.addRevisit.controls['visitors_no'].setValue(item?.phone || '');
  }

  onVisitorName() {
    this.addRevisit.controls['visitor_id'].reset();
    this.addRevisit.controls['customer_id'].reset();
    this.customerSelected = false;
    this.setDependentFieldsState(false);
  }

  onFocused(e) {}

  onPlotShownByFocus() {
    this.employeelistData();
  }

  onEmployeeSearch(e) {
    if (e.length >= 3) {
      this.searchEmployeeByName(e);
    } else if (e.length === 0) {
      // search box cleared: restore the full list instead of leaving the last narrowed search result
      this.employeelistData();
    }
    // 1-2 characters: ng-select filters the already-loaded list client-side on its own
  }

  employeelistData() {
    this.employeeSearchLoading = true;
    this.employeedataList = [];
    const employeelist = new FormData();
    this.hrservice.getEmployeeDetail(employeelist).pipe(takeUntil(this.destroy$)).subscribe(
      (resp) => {
        this.employeedataList = (resp.data || []).map((item) => ({
          id: item.EmployeeId,
          name: item.EmployeeName,
        }));
        this.employeeSearchLoading = false;
      },
      () => {
        this.employeeSearchLoading = false;
      }
    );
  }

  searchEmployeeByName(e) {
    this.employeeSearchLoading = true;
    this.employeedataList = [];
    const employeelist = new FormData();
    employeelist.append('value', e);
    this.hrservice.searchEmployeeByName(employeelist).pipe(takeUntil(this.destroy$)).subscribe(
      (resp) => {
        this.employeedataList = (resp.data || []).map((item) => ({
          id: item.EmployeeId,
          name: item.EmployeeName,
        }));
        this.employeeSearchLoading = false;
      },
      () => {
        this.employeeSearchLoading = false;
      }
    );
  }

  onChangeSearch(e: string): void {
    if (e.length >= 3) {
      this.productlistData(e);
    } else {
      this.productdataList = [];
    }
  }

  productlistData(e) {
    const productlist = new FormData();
    productlist.append('value', e);
    productlist.append('type', 'Land');
    this.CrmService.getproduct(productlist).pipe(takeUntil(this.destroy$)).subscribe((resp) => {
      const productdata = (resp.data || []).map((item) => ({
        id: item.ProductId,
        name: item.ProductName,
      }));
      productdata.sort(this.alphanumericSort);
      this.productdataList = productdata;
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
        const cmp = aPart.localeCompare(bPart, undefined, {
          numeric: true,
          sensitivity: 'base',
        });
        if (cmp !== 0) {
          return cmp;
        }
      }
    }
    return 0;
  }

  onPlotNameClick() {
    $('#revisit_plotShown').css('z-index', 1000);
  }

  selectEvent(item) {
    const idx = this.plotFieldForm.length - 1;
    this.plotFieldForm.controls[idx].get('productId').setValue(item.id);

    const productData = new FormData();
    productData.append('productId', item.id);
    this.productService.productData(productData).pipe(takeUntil(this.destroy$)).subscribe((Response) => {
      this.plotFieldForm.controls[idx].get('plotPrize').setValue(Response.DATA[0][11]);
      this.plotFieldForm.controls[idx].get('plotArea').setValue(Response.DATA[0][10]);
      this.plot_detils_set(idx, Response);
      $('.revisitProductDiv_' + idx).removeClass('hidden');
    });
    this.productdataList = [];
  }

  get plotFieldForm() {
    return this.plotField.get('plotFieldArrayForm') as FormArray;
  }

  newPlotField(): FormGroup {
    return this._fb.group({
      plotShown: new FormControl('', [Validators.required]),
      plotShownBy: new FormControl(''),
      plotPrize: new FormControl(''),
      plotArea: new FormControl(''),
      productId: new FormControl(''),
    });
  }

  addPlot() {
    this.more_detail_btn = true;
    this.plotFieldForm.push(this.newPlotField());
  }

  removeCurrentRow(i) {
    this.plotFieldForm.removeAt(i);
  }

  removeFormArray() {
    while (this.plotFieldForm.length) {
      this.plotFieldForm.removeAt(0);
    }
  }

  AddFormArrya(length) {
    for (let i = 0; i < length; i++) {
      this.addPlot();
    }
  }

  plot_detils_set(id, Response) {
    this.plot_details[id] =
      'Khasra No - ' +
      Response.DATA[0][22] +
      ' , Facing - ' +
      Response.DATA[0][16] +
      ' , Front - ' +
      Response.DATA[0][19] +
      ' , Depth - ' +
      Response.DATA[0][20] +
      ' , Land Use - ' +
      Response.DATA[0][18];
  }

  showFollowup(e) {
    this.additionalFollow = e.target.checked;
  }

  closeModal() {
    this.closebutton.nativeElement.click();
  }

  saveRevisit() {
    if (this.isSaveButtonDisabled) {
      return;
    }

    const followChecked = $('#revisit_nextFollow').is(':checked');
    const formValid = followChecked
      ? this.addRevisit.valid && this.nextFollowup.valid
      : this.addRevisit.valid;

    if (!formValid) {
      this.submitted = true;
      Swal.fire('Alert', 'Fill all required fields first', 'info');
      return;
    }

    this.submitted = false;
    this.isSaveButtonDisabled = true;
    this.spinner.show();

    const productId = [];
    const plotPrize = [];
    const plotName = [];

    for (let i = 0; i < this.plotFieldForm.length; i++) {
      const pid = this.plotFieldForm.controls[i].get('productId').value;
      if (pid && pid !== 'undefined') {
        productId.push(pid);
      }
      plotPrize.push(this.plotFieldForm.controls[i].get('plotPrize').value);
      const plotValue = this.plotFieldForm.controls[i].get('plotShown').value;
      plotName.push(plotValue?.name || plotValue);
    }

    const visitorData = new FormData();
    visitorData.append('status', '1');
    visitorData.append('visitor_id', this.addRevisit.get('visitor_id').value);
    visitorData.append('notes', this.notes?.nativeElement?.value || '');
    const visitorNameVal = this.addRevisit.get('visitor_name').value;
    visitorData.append('visitor_name', visitorNameVal?.name || visitorNameVal || '');
    visitorData.append('visitor_date', this.addRevisit.get('visitor_date').value);
    visitorData.append('visitors_Time', this.addRevisit.get('visitors_Time').value);
    visitorData.append('visitors_no', this.addRevisit.get('visitors_no').value);
    visitorData.append('alter_Name', this.addRevisit.get('alter_Name').value);
    visitorData.append('alter_Number', this.addRevisit.get('alter_Number').value);

    const plotShownByVal = this.OnlyPLotShownBY.get('selectedPlotShownBy')?.value;
    visitorData.append('plotShownBy', plotShownByVal?.name || plotShownByVal || '');

    visitorData.append('productId', productId.join(','));
    visitorData.append('plotPrize', plotPrize.join(','));
    visitorData.append('plotName', plotName.join(','));

    visitorData.append('followUpDate', this.nextFollowup.get('followup_date').value);
    visitorData.append('followUpTime', this.nextFollowup.get('followup_Time').value);
    visitorData.append('followup_notes', this.nextFollowup.get('followup_notes').value);
    visitorData.append('followcheck', String(followChecked));
    visitorData.append('taskId', this.addRevisit.get('taskId').value);
    visitorData.append('vistProductId', this.addRevisit.get('visitproductId').value);
    visitorData.append('Customer_id', this.addRevisit.get('customer_id').value);

    this.CrmService.addCrmVisitorMngmt(visitorData).pipe(takeUntil(this.destroy$)).subscribe(
      (Response) => {
        this.spinner.hide();
        this.isSaveButtonDisabled = false;

        if (Response.CODE == 200) {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: Response.MESSAGE,
            showConfirmButton: false,
            timer: 2000,
          });
          this.addRevisit.reset();
          this.nextFollowup.reset();
          this.removeFormArray();
          this.plot_details = {};
          this.customerSelected = false;
          this.closeModal();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Visitor Creation Failed',
            showConfirmButton: false,
            timer: 3000,
          });
        }
      },
      () => {
        this.spinner.hide();
        this.isSaveButtonDisabled = false;
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Visitor Creation Failed',
          showConfirmButton: false,
          timer: 3000,
        });
      }
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
