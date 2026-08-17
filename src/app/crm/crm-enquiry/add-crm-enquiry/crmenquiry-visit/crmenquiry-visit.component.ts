import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
  TemplateRef,
  Injectable,
  OnDestroy,
} from '@angular/core';
import {
  NgbCalendar,
  NgbDateAdapter,
  NgbDate,
  NgbModule,
  NgbDateParserFormatter,
  NgbDateStruct,
  NgbInputDatepickerConfig,
  NgbTimepicker,
  NgbTimeStruct,
} from '@ng-bootstrap/ng-bootstrap';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { CrmService } from '../../../../services/crm.service';
import { BillingService } from 'src/app/services/billing.service';
import { ProjectService } from '../../../../services/project.service';
import { HrService } from 'src/app/services/hr.service';
import { DataTableDirective } from 'angular-datatables';
import Swal from 'sweetalert2';
import { DatePipe, formatCurrency } from '@angular/common';
import { environment } from 'src/environments/environment';
import { ProductService } from '../../../../services/product.service';
import { AdminService } from '../../../../services/admin.service';
import { map, startWith, takeUntil } from 'rxjs/operators';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { CrmEnquiryService } from '../../../../shared/crm-enquiry.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { event } from 'jquery';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
// import {NotesDetailsComponent} from '../../../../project/project-mgmt/notes-details/notes-details.component';


class VisitorManagement {
  [x: string]: any;
  visitor_id: string;
  visitor_name: string;
  visitor_datetime: string;
  vistdate: string;
  notes: string;
  status: string;
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

  fromModel(value: string | null): NgbDateStruct | null {
    if (value) {
      let date = value.split(this.DELIMITER);
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
  selector: 'app-crmenquiry-visit',
  templateUrl: './crmenquiry-visit.component.html',
  styleUrls: ['./crmenquiry-visit.component.css'],
  providers: [
    NgbInputDatepickerConfig,
    { provide: NgbDateAdapter, useClass: CustomAdapter },
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
    { provide: DatePipe },
  ],
})
export class CRMEnquiryVisitComponent implements OnDestroy {
  private destroy$ = new Subject<void>();
  // selectedValue = '';
  pipe = new DatePipe('en-US');

  date = new Date();
  save_btn = true;
  [x: string]: any;
  dtOptions: DataTables.Settings = {};
  dtOptions1: DataTables.Settings = {};
  dtOptions2: DataTables.Settings = {};
  dtOptions3: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  dataTablesParameters: any
  imageUrl: any = '';
  // editFile: boolean = true;
  hideEditVisitIcon: boolean = true;
  hideDeleteVisitIcon: boolean = true;
  removeUpload: boolean = false;
  plotField: FormGroup;
  isButtonDisabled: boolean = false;
  isDisabled: boolean = false;
  canExportVisitorExcel: boolean = false;
  model: NgbDateStruct;
  tmodel: NgbTimeStruct;
  // Mdlttl: string = 'test';
  plot_details: any = {};

  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  @ViewChild('closebutton') closebutton;
  @ViewChild('notes') notes;
  @ViewChild('removebutton') removebutton;
  @ViewChild('vheaderclick') vheaderclick;
  @ViewChild('Visitormodal') Visitormodal;
  @ViewChild('Visitordata') Visitordata;
  @ViewChild('ngbDatepicker') dte: NgbDateStruct;
  @ViewChild('ngbTimepicker') tim: NgbTimepicker;
  @ViewChild('addNewVisits') addNewVisits;
  @ViewChild('TABLE', { static: false }) TABLE: ElementRef;

  data: VisitorManagement[];
  modal: any;
  model2: string;
  productdata = [];
  productdataList = [];
  keyword = 'name';
  minDate = { year: 1900, month: 1, day: 1 };
  maxDate = this.getCurrentDate();

  maxDate1 = { year: 2034, month: 1, day: 1 };
  minDate1 = this.getCurrentDate();


  customerdataList = [];
  customerData = [];

  OnlyPLotShownBY = new FormGroup({
    selectedPlotShownBy: new FormControl(''),
  });
  addCrmVisitor = new FormGroup({
    visitor_id: new FormControl(''),
    taskId: new FormControl(''),
    visitproductId: new FormControl(''),
    plotShownByEmployee: new FormControl(''),
    visitor_name: new FormControl('', Validators.required),
    visitor_date: new FormControl('', Validators.required),
    visitors_Time: new FormControl('', Validators.required),
    visitors_no: new FormControl('', [
      Validators.required,
      Validators.maxLength(10),
      Validators.pattern(/^[0-9]\d*$/),
      Validators.minLength(10),
    ]),
    alter_Name: new FormControl(''),
    alter_Number: new FormControl(''),
  });
  searchCrmVisitor = new FormGroup({
    filtervisitor_name: new FormControl(''),
    filtervisiting_date: new FormControl(''),
    dateTo: new FormControl(''),
    dateFrom: new FormControl(''),
    enquiry_mode: new FormControl(''),
    introduced_by: new FormControl(''),
    shown_by: new FormControl(''),
  });
  nextFollowup = new FormGroup({
    followup_date: new FormControl('', Validators.required),
    followup_Time: new FormControl('', Validators.required),
    followup_notes: new FormControl('', Validators.required),
  });

  DatatableParameter = {
    visitor_name: '',
    visitor_datetime: '',
    CompanyId: '',
    Customer_id: '',
    dateFrom: '',
    dateTo: '',
    enquiry_mode: '',
    introduced_by: '',
    shown_by: '',
  };
  constructor(
    private spinner: NgxSpinnerService,
    private ngbCalendar: NgbCalendar,
    private _fb: FormBuilder,
    private dateAdapter: NgbDateAdapter<string>,
    private router: Router,
    public http: HttpClient,
    private CrmService: CrmService,
    private billingservice: BillingService,
    private hrservice: HrService,
    private chRef: ChangeDetectorRef,
    private datePipe: DatePipe,
    private activatedRoute: ActivatedRoute,
    private productService: ProductService,
    private adminservice: AdminService,
    private crmEnquiryService: CrmEnquiryService
  ) {
    this.plotField = this._fb.group({
      plotFieldArrayForm: this._fb.array([]),
    });
  }

  myControl = new FormControl();
  options: string[] = ['One', 'Two', 'Three'];
  filteredOptions!: Observable<string[]>;

  ngOnInit(): void {

    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value))
    );

    this.Method = this.activatedRoute.snapshot.paramMap.get('method');

    if (this.Method == 'view') {

      this.hideEditVisitIcon = false;
      this.hideDeleteVisitIcon = false;
    }




    if (this.router.url == '/crm-visitors') {
      this.enquiryvisitorTAb = false;
      this.visitorTAb = true;
    } else {
      this.enquiryvisitorTAb = true;
      this.visitorTAb = false;
    }

    this.lookuplist();
    this.addPlot();
    this.CrmUserRole = false;
    const userRole = sessionStorage.getItem('UserRole') || '';
    const userRoles = userRole.split(',').map(role => role.trim());
    if (userRole == 'CRM User') {
      this.CrmUserRole = true;
    }
    this.CRMAdmin = false;
    if (userRole == 'CRM Admin') {
      this.CRMAdmin = true;
    }
    this.canExportVisitorExcel = userRoles.includes('Sales Record');
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    this.employeelistData(event);
    this.datatableCode();

    this.enquiryModeList();
    this.getMarketingTeamsLists();
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


  private _filter(value: string): string[] {
    //this.productlistData();
    const filterValue = value.toLowerCase();

    return this.options.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }

  getCurrentDate() {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate()
    };
  }

  openVisitormodal() {

    //this.Mdlttl = 'Add New Visitor';
    //$('#modaltextheader').text('Add New Visitor');
    // this.addCrmVisitor.controls['visitors_no'].disable();
    this.isSaveButtonDisabled = false;
    this.OnlyPLotShownBY.enable();
    this.nextFollowup.enable();
    $('#visitors_Time').css('background-color', '#ffffff');
    $('#notes_id').css('background-color', '#ffffff');
    this.saveButton = true;
    this.removeFormArray();
    this.plot_details = {};
    this.addCrmVisitor.reset();
    this.nextFollowup.reset();
    $('#nextFollow').prop('checked', false);
    this.additionalFollow = false;
    // if (this.modalaction == 'edit') {
    //   $('#modaltextheader').text('Edit Visitor');
    // }else if (this.modalaction == 'view') {
    //   $('#modaltextheader').text('View Visitor');
    // }
    this.notes.nativeElement.value = null;
    this.submitted = false;
    // $('#modaltextheader').text('Add New Visitor');
    this.addCrmVisitor.enable();
    this.isButtonDisabled = false;
    this.AddFormArrya(1);
    // this.Access = false;
    // this.Mdlttl = 'Add New Visitor';
    // this.addCrmVisitor.controls['visitor_date'].setValue(this.datePipe.transform(this.date, 'dd-MM-yyyy'));
    // this.addCrmVisitor.controls['visitors_Time'].setValue(this.datePipe.transform(this.date, 'HH:mm'));
    this.EnquiryIds = this.activatedRoute.snapshot.paramMap.get('id');
    let getEnquiryId = new FormData();
    getEnquiryId.append('EnquiryId', this.EnquiryIds);
    this.CrmService.getCrmEnquiryMngmt(getEnquiryId).pipe(takeUntil(this.destroy$)).subscribe((Response) => {
      console.log(Response);

      if (Response.data.length) {
        const enquiry = Response.data[0];

        // Visitor Details
        this.addCrmVisitor.controls['visitor_name'].setValue(enquiry.VisitorName);
        this.addCrmVisitor.controls['visitors_no'].setValue(enquiry.MobileNumber);

        // Plot Shown By (from ContactBy)
        this.OnlyPLotShownBY.controls['selectedPlotShownBy'].setValue(enquiry.ContactBy);

        // Open modal
        this.addNewVisits.nativeElement.click();
      }
    });
  }


  onchangeTitle() {
    this.Mdlttl = 'Add New Visitor';

  }

  ExportTOExcel() {




    const formData = new FormData();

    if (this.router.url == '/crm-enquiry-details/' + this.id + '/edit' || this.router.url == '/crm-enquiry-details/' + this.id + '/view') {

      if (this.setFlagValue == true) {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'No Entry Available to Export',

        });
      } else {
        const customerId = this.activatedRoute.snapshot.paramMap.get('id');

        if (customerId) {
          formData.append('customerId', customerId);
        }

        const xhr = new XMLHttpRequest();
        xhr.open('POST', environment.APIEndpoint + `crm.VisitExportData&reload=1`, true);
        xhr.responseType = 'blob';
        xhr.onload = function () {
          if (xhr.status === 200) {
            const blob = new Blob([xhr.response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });

            saveAs(blob, 'visitorDetails.xlsx');
          } else {
            console.error('Unexpected response status:', xhr.status);
          }
        };

        xhr.onerror = function () {
          console.error('An error occurred during the transaction');
        };

        xhr.send(formData);
      }

    }

    if (this.router.url == '/crm-visitors') {


      const visitorsData = this.data.map(visitor => ({


        "Visitor Name": visitor.visitor_name,
        "Plot Details": visitor.Details,
        "Visited Plot": visitor.Plot,
        "Visitor Mobile": visitor.visitor_Mobile,
        "Visiting Date": this.datePipe.transform(visitor.visitor_datetime, 'dd/MM/yyyy'),
        "Visiting Time": this.datePipe.transform(visitor.visitor_datetime, 'h:mm a'),

      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(visitorsData);

      const columnWidth = 160 / 7.5;
      const cols = Object.keys(visitorsData[0]).map(col => {
        return col === 'Plot Details' ? { width: 700 / 7.5 } : { width: columnWidth };
      });

      ws['!cols'] = cols;

      XLSX.utils.book_append_sheet(wb, ws, 'Visitors Data');
      const fileName = 'crm_visitors_data.xlsx';
      XLSX.writeFile(wb, fileName);

    }

  }

  VisitorSearch() {
    this.DatatableParameter.visitor_name =
      this.searchCrmVisitor.get('filtervisitor_name').value;
    this.DatatableParameter.visitor_datetime = (<HTMLInputElement>(
      document.getElementById('filtervisiting_date')
    )).value;

    this.DatatableParameter.dateFrom = (<HTMLInputElement>(
      document.getElementById('attendanceDateFrom')
    )).value;
    this.DatatableParameter.dateTo = (<HTMLInputElement>(
      document.getElementById('attendanceDateTo')
    )).value;
    this.DatatableParameter.enquiry_mode = this.searchCrmVisitor.get('enquiry_mode').value;
    this.DatatableParameter.introduced_by = this.searchCrmVisitor.get('introduced_by').value;
    this.DatatableParameter.shown_by = this.searchCrmVisitor.get('shown_by').value;
    this.datatableCode();
    this.rerender();
  }

  resetVisitor() {


    this.DatatableParameter.visitor_name = '';
    this.DatatableParameter.visitor_datetime = '';
    this.DatatableParameter.dateFrom = '';
    this.DatatableParameter.dateTo = '';
    this.DatatableParameter.enquiry_mode = '';
    this.DatatableParameter.introduced_by = '';
    this.DatatableParameter.shown_by = '';


    this.searchCrmVisitor.get('filtervisitor_name').setValue('');
    this.searchCrmVisitor.get('filtervisiting_date').setValue('');
    this.searchCrmVisitor.get('dateFrom').setValue('');
    this.searchCrmVisitor.get('dateTo').setValue('');
    this.searchCrmVisitor.get('enquiry_mode').setValue('');
    this.searchCrmVisitor.get('introduced_by').setValue('');
    this.searchCrmVisitor.get('shown_by').setValue('');
    // (<HTMLInputElement>(document.getElementById('filtervisiting_date'))).value = '';
    // (<HTMLInputElement>(document.getElementById('attendanceDateFrom'))).value = '';
    // (<HTMLInputElement>(document.getElementById('attendanceDateTo'))).value = '';
    this.showIntroducedBy = false;
    this.searchCrmVisitor.get('introduced_by')?.reset();
    this.datatableCode();
    this.rerender();
    this.plot_details = {};

  }




  // ExportTOExcel() {
  //   // const form = this.crmEnquiryService.getForm();
  //   // if (form) {


  //   //   const formData = form.value;
  //   //   const addressData = { address: formData.enquiry_address }; 

  //   //   if (this.TABLE) {
  //   //     const table: HTMLTableElement = this.TABLE.nativeElement;


  //   //     if (table) {
  //   //       const tableData: any[] = XLSX.utils.sheet_to_json(XLSX.utils.table_to_sheet(table));


  //   //       // Merge address data with table data ensuring they are in the same row
  //   //       const combinedData = tableData.map((row, index) => {

  //   //         if (index === 0) {
  //   //           return { ...row, ...addressData };
  //   //         } else {
  //   //           return row;
  //   //         }
  //   //       });


  //   //       const combinedSheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(combinedData);


  //   //       const wb: XLSX.WorkBook = XLSX.utils.book_new();
  //   //       XLSX.utils.book_append_sheet(wb, combinedSheet, 'CombinedData');

  //   //       XLSX.writeFile(wb, 'VisiterSheet.xlsx');
  //   //     } else {
  //   //       console.error('Table element not found in the DOM.');
  //   //     }
  //   //   } else {
  //   //     console.error('TABLE template reference variable not defined.');
  //   //   }
  //   // } else {
  //   //   console.error('Form data not found.');
  //   // }


  //   let formData = new FormData();


  //   if (this.router.url !== '/crm-visitors') {
  //     let customerId = this.activatedRoute.snapshot.paramMap.get('id');


  //     if (customerId) {
  //       formData.append('customerId', customerId);
  //     }


  //     // const headers = new HttpHeaders({
  //     //   'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' 

  //     // });


  //     this.http.post(environment.APIEndpoint + `crm.VisitExportData&reload=1`,formData).subscribe(response => {

  //       
  //       // Stringify the JSON object
  //       const jsonString = JSON.stringify(response);

  //     
  //       // if (response instanceof Object) {
  //         const blob = new Blob([jsonString], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });

  //        
  //         saveAs(blob, 'visitorDetails.xlsx');
  //       // } else {
  //       //   console.error('Unexpected response type:', typeof response);
  //       // }

  //     });
  //   }
  // }




  lookuplist() {
    let lookupPlotBlock = 'Block';
    let plotblockdata = new FormData();
    plotblockdata.append('lookupname', lookupPlotBlock);
    this.hrservice.fetch_lookupdata(plotblockdata).pipe(takeUntil(this.destroy$)).subscribe((Response) => {
      this.resplookupPlotBlock = Response.data;
    });
  }

  selectEvent(item) {
    this.id = this.plotFieldForm.length - 1;
    this.plotFieldForm.controls[this.id].get('productId').setValue(item.id);
    let productData = new FormData();
    productData.append('productId', item.id);
    this.productService.productData(productData).pipe(takeUntil(this.destroy$)).subscribe((Response) => {





      this.plotFieldForm.controls[this.id].get('plotPrize').setValue(Response.DATA[0][11]);
      this.plotFieldForm.controls[this.id].get('plotArea').setValue(Response.DATA[0][10]);


      this.plot_detils_set(this.id, Response);
      // Add the dynamic attribute to the text field
      const inputElement = document.getElementById(`plotPrize_${this.id}`);
      if (inputElement) {
        (inputElement as HTMLInputElement).setAttribute('myattri', Response.DATA[0][3]);

      }


      const plotAreaElement = document.getElementById(`plotArea_${this.id}`);
      if (plotAreaElement) {
        (plotAreaElement as HTMLInputElement).setAttribute('myattri', Response.DATA[0][7]);
      }


      $('.productDiv_' + this.id).removeClass('hidden');

    });
    this.productdataList = [];
  }

  selectCust(e) {
    this.customerdataList = [];
  }


  onChangeSearch(e: string): void {
    if (e.length >= 3) {
      this.productlistData(e);

    }



    else {
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
  onFocused(e) { }

  datatableCode() {
    if (this.router.url != '/crm-visitors') {
      this.DatatableParameter.Customer_id =
        this.activatedRoute.snapshot.paramMap.get('id');
    }

    const that = this;
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });
    this.dtOptions = {
      processing: true,
      serverSide: true,
      dom: 'lrtip',
      pageLength: 50,
      lengthMenu: [
        [5, 10, 25, 50, 9999],
        [5, 10, 25, 50, 'All'],
      ],
      order: [[2, 'desc']],
      columnDefs: [{ orderable: false, targets: -1 }],
      ajax: (dataTablesParameters: any, callback) => {
        this.spinner.show();

        Object.assign(dataTablesParameters, this.DatatableParameter);
        that.http
          .post<DataTablesResponse>(environment.APIEndpoint + 'CrmVisitorMangement.fetch_CrmVisitorMngmt&reload=1', Object.assign(dataTablesParameters, this.DatatableParameter),
            { responseType: 'json', headers }
          )
          .pipe(takeUntil(this.destroy$))
          .subscribe((resp) => {

            if (resp.recordsTotal == 0) {
              this.setFlagValue = true;
            }


            that.data = resp.data;
            callback({
              recordsTotal: resp.recordsTotal,
              recordsFiltered: resp.recordsTotal,
              data: [],
            });
            this.spinner.hide();
          });
      },
    };


  }



  showFollowup(e) {
    if (e.target.checked) {
      this.additionalFollow = true;
    } else {
      this.additionalFollow = false;
    }
  }

  confirmationShown: { [key: number]: boolean } = {};


  previousValues: string[] = [];
  onPlotPrizeFocus(index: number): void {
    const inputElement = document.getElementById(`plotPrize_${index}`) as HTMLInputElement;
    if (inputElement) {
      this.previousValues[index] = inputElement.value; // Store the value in a property
    }
  }



  onPlotPrizeChange(event: Event, index: number): void {
    const inputElement = document.getElementById(`plotPrize_${index}`) as HTMLInputElement;

    if (inputElement) {
      const newValue = (event.target as HTMLInputElement).value;
      const productId = inputElement.getAttribute("myAttri");
      const previousValue = this.previousValues[index]; // Get the previously stored value

      if (productId) {

        if (!this.confirmationShown[index]) {
          const confirmation = window.confirm("Are you sure you want to change the plot prize?");
          if (!confirmation) {

            inputElement.value = previousValue;

            return;
          }

          this.confirmationShown[index] = true;
        }

        let formData = new FormData();
        formData.append('productId', productId);
        formData.append('salesRate', newValue);

        this.productService.UpdateProductPrice(formData).pipe(takeUntil(this.destroy$)).subscribe((response) => {

        });
      }
    }
  }





  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  public closeModal() {


    this.closebutton.nativeElement.click();
    this.save_btn = true;
  }

  public removeModal() {

    this.removebutton.nativeElement.click();
  }

  public Visitormodalshow() {

    this.Visitormodal.nativeElement.click();
    this.save_btn = true;
  }


  view(visitor_id, visitproductId) {

    this.Mdlttl = 'View Visitor';
    this.saveButton = false;
    this.save_btn = true;

    $('#visitors_Time').css('background-color', '#e9ecef');
    $('#notes_id').css('background-color', '#e9ecef');

    this.removeFormArray();

    let formData = new FormData();
    formData.append('visitor_id', visitor_id);
    formData.append('visitor_product_id', visitproductId);

    this.CrmService.getCrmVisitorMngmt(formData).pipe(takeUntil(this.destroy$)).subscribe((Response) => {

      /* ================= BASIC DETAILS ================= */

      this.addCrmVisitor.controls['visitor_date'].setValue(
        this.datePipe.transform(Response.DATA[0][3], 'dd-MM-yyyy')
      );

      this.addCrmVisitor.controls['visitors_Time'].setValue(
        this.datePipe.transform(Response.DATA[0][3], 'HH:mm')
      );

      this.addCrmVisitor.patchValue({
        visitor_id: Response.DATA[0][0],
        visitproductId: Response.DATA[0][1],
        visitor_name: Response.DATA[0][2],
        visitors_no: Response.DATA[0][10],
        alter_Name: Response.DATA[0][8],
        alter_Number: Response.DATA[0][11],
      });

      this.OnlyPLotShownBY.patchValue({
        selectedPlotShownBy: Response.DATA[0][12],
      });

      /* ================= FOLLOW-UP DETAILS (same as edit) ================= */

      const taskId = Response.DATA[0][13];

      if (taskId && taskId !== '') {

        $('#nextFollow').prop('checked', true);
        this.additionalFollow = true;

        this.nextFollowup.controls['followup_date'].setValue(
          this.datePipe.transform(Response.DATA[0][14], 'dd-MM-yyyy')
        );

        this.nextFollowup.controls['followup_Time'].setValue(
          this.datePipe.transform(Response.DATA[0][14], 'HH:mm')
        );

        this.nextFollowup.controls['followup_notes'].setValue(
          Response.DATA[0][15]
        );

      } else {

        $('#nextFollow').prop('checked', false);
        this.additionalFollow = false;
        this.nextFollowup.reset();
      }

      /* ================= NOTES ================= */

      this.notes.nativeElement.value = Response.DATA[0][4];

      /* ================= PLOT DETAILS ================= */

      let visproductData = new FormData();
      visproductData.append('visitproductId', Response.DATA[0][1]);

      this.productService
        .visitorproductDetails(visproductData)
        .pipe(takeUntil(this.destroy$))
        .subscribe((visitorProductList) => {

          this.visitorProductList = visitorProductList.DATA;
          this.AddFormArrya(this.visitorProductList.length);

          for (let i = 0; i < this.visitorProductList.length; i++) {

            let product_Data = new FormData();
            product_Data.append('productId', this.visitorProductList[i][3]);

            this.productService.productData(product_Data).pipe(takeUntil(this.destroy$)).subscribe((Res) => {

              this.plotFieldForm.controls[i].get('plotShown')
                .setValue(Res.DATA[0][1]);

              this.plotFieldForm.controls[i].get('plotPrize')
                .setValue(Res.DATA[0][11]);

              this.plotFieldForm.controls[i].get('plotArea')
                .setValue(Res.DATA[0][10]);

              this.plotFieldForm.controls[i].get('productId')
                .setValue(this.visitorProductList[i][3]);

              this.plot_detils_set(i, Res);
              $('.productDiv_' + i).removeClass('hidden');
            });
          }

          this.plotFieldForm.disable();
        });
    });

    /* ================= UI MODE ================= */

    this.activefield = 'active';
    this.modalaction = 'view';
    $('#modaltextheader').text('View Visitor');

    this.addCrmVisitor.disable();
    this.plotFieldForm.disable();
    this.nextFollowup.disable();
    this.OnlyPLotShownBY.disable();
    this.isButtonDisabled = true;

    this.addNewVisits.nativeElement.click();
  }



  edit(visitor_id, visitproductId) {


    this.isSaveButtonDisabled = false;
    this.addCrmVisitor.enable();
    this.plotFieldForm.enable();
    this.nextFollowup.enable();
    this.OnlyPLotShownBY.enable();
    this.Mdlttl = 'Edit Visitor';
    $('#visitors_Time').css('background-color', '#ffffff');
    $('#notes_id').css('background-color', '#ffffff');
    this.save_btn = true;
    this.saveButton = true;
    this.removeFormArray();
    let getvisitor_id_and_visitProductId = new FormData();
    getvisitor_id_and_visitProductId.append('visitor_id', visitor_id);
    getvisitor_id_and_visitProductId.append('visitor_product_id', visitproductId);
    this.CrmService.getCrmVisitorMngmt(getvisitor_id_and_visitProductId).pipe(takeUntil(this.destroy$)).subscribe((Response) => {

      this.addCrmVisitor.controls['visitor_date'].setValue(
        this.datePipe.transform(Response.DATA[0][3], 'dd-MM-yyyy')
      );
      this.addCrmVisitor.controls['visitors_Time'].setValue(
        this.datePipe.transform(Response.DATA[0][3], 'HH:mm')
      );

      this.addCrmVisitor.patchValue({
        visitor_id: Response.DATA[0][0],
        visitproductId: Response.DATA[0][1],
        visitor_name: Response.DATA[0][2],
        visitors_no: Response.DATA[0][10],
        alter_Name: Response.DATA[0][8],
        alter_Number: Response.DATA[0][11],
      });


      this.OnlyPLotShownBY.patchValue({
        selectedPlotShownBy: Response.DATA[0][12],
      });

      const taskId = Response.DATA[0][13];

      if (taskId && taskId !== '') {

        $('#nextFollow').prop('checked', true);
        this.additionalFollow = true;

        /* Fill follow-up date */
        this.nextFollowup.controls['followup_date'].setValue(
          this.datePipe.transform(Response.DATA[0][14], 'dd-MM-yyyy')
        );

        /* Fill follow-up time */
        this.nextFollowup.controls['followup_Time'].setValue(
          this.datePipe.transform(Response.DATA[0][14], 'HH:mm')
        );

        /* Fill description */
        this.nextFollowup.controls['followup_notes'].setValue(
          Response.DATA[0][15]
        );

      } else {

        $('#nextFollow').prop('checked', false);
        this.additionalFollow = false;
        this.nextFollowup.reset();
      }




      if (Response.DATA.length) {


        this.notes.nativeElement.value = Response.DATA[0][4];
        let visproductData = new FormData();

        visproductData.append('visitproductId', Response.DATA[0][1]);
        this.productService
          .visitorproductDetails(visproductData)
          .pipe(takeUntil(this.destroy$))
          .subscribe((visitorProductList) => {


            this.visitorProductList = visitorProductList.DATA;
            this.AddFormArrya(this.visitorProductList.length);
            //this.plotFieldForm.controls = this.visitorProductList.length;

            for (let i = 0; i < this.visitorProductList.length; i++) {
              let product_Data = new FormData();
              product_Data.append('productId', this.visitorProductList[i][3]);

              this.productService.productData(product_Data).pipe(takeUntil(this.destroy$)).subscribe((Res) => {

                this.plotFieldForm.controls[i]
                  .get('plotShown')
                  .setValue(Res.DATA[0][1]);
                // this.plotFieldForm.controls[i]
                //   .get('plotShownBy')
                //   .setValue(this.visitorProductList[i][4]);

                this.plotFieldForm.controls[i]
                  .get('plotPrize')
                  .setValue(Res.DATA[0][11]);
                this.plotFieldForm.controls[i]
                  .get('plotArea')
                  .setValue(Res.DATA[0][10]);
                this.plotFieldForm.controls[i]
                  .get('productId')
                  .setValue(this.visitorProductList[i][3]);
                this.plot_detils_set(i, Res);
                $('.productDiv_' + i).removeClass('hidden');

                this.plotName = Res?.DATA[0][1];

              });
            }
          });
        this.Access = false;
      }
    });
    this.activefield = 'active';
    this.modalaction = 'edit';
    $('#modaltextheader').text('Edit Visitor');
    // this.Visitormodalshow();
    // $('#modaltextheader').text('Edit Visitor Details');
    // this.Mdlttl = 'Edit Visitor Details';
    this.addCrmVisitor.enable();
    this.isButtonDisabled = false;
    this.addNewVisits.nativeElement.click();
  }

  isVisitorDateClicked = false;

  onPlotNameClick() {


    // this.isVisitorDateClicked = true;
    // this.isVisitorDateClicked = false;
    $('#plotShown').css('z-index', 1000);

  }



  delete(visitorId, visitproductId) {



    let removeVisitorData = new FormData();
    removeVisitorData.append('visitproductId', visitproductId);
    removeVisitorData.append('visitorId', visitorId);
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then((result) => {


      if (result.value) {
        this.CrmService.deleteCrmVisitorMngmt(removeVisitorData).pipe(takeUntil(this.destroy$)).subscribe(
          (Response) => {
            if (Response) {
              Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: Response.MESSAGE,
                showConfirmButton: false,
                timer: 2000,
              });
              this.reload();
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Visitor Delete Failed',
                showConfirmButton: false,
                timer: 3000,
              });
            }
          }
        );
      }
    });
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }


  vReload() {
    this.vheaderclick.nativeElement.click();
  }

  reload() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  selectedPlotShownBy: any;

  insertvisitorDetail() {

    if (this.isSaveButtonDisabled) {
      return;   //  Prevent double click
    }
    this.isSaveButtonDisabled = true;
    this.addCrmVisitor.enable();
    this.plotFieldForm.enable();
    this.nextFollowup.enable();
    this.submitted = false;
    this.save_btn = true;

    if (
      $('#nextFollow').is(':checked') == true
        ? this.addCrmVisitor.valid && this.nextFollowup.valid
        : this.addCrmVisitor.valid
    ) {
      this.submitted = false;

      this.plotShownBy = [];
      this.productId = [];
      this.plotPrize = [];
      this.plotName = [];

      for (let i = 0; i < this.plotField.value.plotFieldArrayForm.length; i++) {

        const pid = this.plotFieldForm.controls[i].get('productId').value;
        if (pid && pid !== 'undefined') {
          this.productId.push(pid);
        }

        // plotShownBy safe handling
        const plotShownByVal = this.plotFieldForm.controls[i].get('plotShownBy').value;
        this.plotShownBy.push(plotShownByVal?.name || plotShownByVal);

        // plotPrize
        this.plotPrize.push(
          this.plotFieldForm.controls[i].get('plotPrize').value
        );

        // plotName safe handling (FIXED)
        const plotValue = this.plotFieldForm.controls[i].get('plotShown').value;
        this.plotName.push(plotValue?.name || plotValue);
      }


      let visitorData = new FormData();

      if (this.router.url != '/crm-visitors') {
        this.Customer_id = this.activatedRoute.snapshot.paramMap.get('id');
      } else {
        this.Customer_id = '';
      }


      visitorData.append('status', '1');
      visitorData.append('visitor_id', this.addCrmVisitor.get('visitor_id').value);
      visitorData.append('notes', this.notes.nativeElement.value);
      visitorData.append('visitor_name', this.addCrmVisitor.get('visitor_name').value);
      visitorData.append('visitor_date', this.addCrmVisitor.get('visitor_date').value);
      visitorData.append('visitors_Time', this.addCrmVisitor.get('visitors_Time').value);
      visitorData.append('visitors_no', this.addCrmVisitor.get('visitors_no').value);
      visitorData.append('alter_Name', this.addCrmVisitor.get('alter_Name').value);
      visitorData.append('alter_Number', this.addCrmVisitor.get('alter_Number').value);

      const mainPlotShownVal = this.OnlyPLotShownBY.get('selectedPlotShownBy')?.value;
      visitorData.append('plotShownBy', mainPlotShownVal?.name || mainPlotShownVal);

      visitorData.append('productId', this.productId.join(','));
      visitorData.append('plotPrize', this.plotPrize.join(','));
      visitorData.append('plotName', this.plotName.join(','));


      visitorData.append('followUpDate', this.nextFollowup.get('followup_date').value);
      visitorData.append('followUpTime', this.nextFollowup.get('followup_Time').value);
      visitorData.append('followup_notes', this.nextFollowup.get('followup_notes').value);
      visitorData.append('followcheck', $('#nextFollow').prop('checked'));
      visitorData.append('taskId', this.addCrmVisitor.get('taskId').value);

      if (this.addCrmVisitor.get('visitor_name').value?.id != undefined) {
        this.Customer_id = this.addCrmVisitor.get('visitor_name').value.id;
      }


      visitorData.append('visitor_name', this.addCrmVisitor.get('visitor_name').value);
      visitorData.append('vistProductId', this.addCrmVisitor.get('visitproductId').value);
      visitorData.append('Customer_id', this.Customer_id);


      const mob = this.addCrmVisitor.get('visitors_no').value;
      const rawDate = this.addCrmVisitor.get('visitor_date').value;
      let formattedDate = null;

      if (typeof rawDate === 'string') {
        formattedDate = moment(rawDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
      } else if (rawDate instanceof Date) {
        formattedDate = moment(rawDate).format('YYYY-MM-DD');
      }

      const visitProdID = this.addCrmVisitor.get('visitproductId').value;

      this.CrmService.addCrmVisitorMngmt(visitorData).pipe(takeUntil(this.destroy$)).subscribe((Response) => {

        if (Response.CODE == 200) {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: Response.MESSAGE,
            showConfirmButton: false,
            timer: 2000,
          });
          this.plot_details = {};
          this.addCrmVisitor.reset();
          this.closeModal();
          this.reload();

          const formattedMob = `91${mob}`;
          if (formattedDate) {
            const inputMoment = moment(formattedDate, 'YYYY-MM-DD');
            const today = moment().startOf('day');
            const fiveDaysAgo = moment().subtract(3, 'days').startOf('day');

            if (inputMoment.isSameOrAfter(fiveDaysAgo) && inputMoment.isSameOrBefore(today)) {
              this.billingservice.wabridge(formattedMob, visitProdID, formattedDate).pipe(takeUntil(this.destroy$)).subscribe(resp => {

                if (resp === false) {

                } else {
                  Swal.fire({
                    title: 'Sending acknowledgment to customer...',
                    text: 'Please wait while we notify the customer.',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    didOpen: () => {
                      Swal.showLoading();
                    },
                  });
                  setTimeout(() => {
                    Swal.close();

                    Swal.fire({
                      icon: 'success',
                      title: 'Successfully Delivered !',
                      text: 'Notification successfully sent to the customer.',
                      showConfirmButton: false,
                      timer: 2000
                    });
                  }, 3000);
                }
              });
            } else {
              console.log('Date not in valid range. Skipping API call.');
            }
          }


        } else {
          this.isSaveButtonDisabled = false;
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Visitor Creation Failed',
            showConfirmButton: false,
            timer: 3000,
          });
        }
      });



    } else {
      this.save_btn = true;
      this.submitted = true;
      this.isSaveButtonDisabled = false;
      Swal.fire('Alert', 'Fill all required fields first', 'info');
    }
  }





  addPlot() {

    const plotFieldArray = this.plotField.get('plotFieldArrayForm') as FormArray;


    let allValid = true;


    plotFieldArray.controls.forEach((formGroup: FormGroup) => {
      const plotNameControl = formGroup.get('plotShown');
      if (plotNameControl && !plotNameControl.value) {
        allValid = false;
        plotNameControl.markAsTouched();
      }
    });

    // Check if all required fields are filled
    if (allValid) {

      this.more_detail_btn = true;
      this.plotFieldForm.push(this.newPlotField());


    } else {

    }
  }




  get plotFieldForm() {
    return this.plotField.get('plotFieldArrayForm') as FormArray;
  }



  newPlotField(): FormGroup {
    return this._fb.group({
      plotShown: new FormControl('', [Validators.required]),
      plotShownBy: new FormControl('', [Validators.required]),
      plotPrize: new FormControl(''),
      plotArea: new FormControl(''),
      plotNumber: new FormControl(''),
      plotSqrt: new FormControl(''),
      plotBlock: new FormControl(''),
      plotFacing: new FormControl(''),
      productId: new FormControl(''),
    });
  }
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
      this.productdata.sort(this.alphanumericSort);

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
  removeFormArray() {
    for (let i = 0; i < this.plotFieldForm.length; i++) {
      this.plotFieldForm.removeAt(i);
      i = 0;
    }
    this.plotFieldForm.removeAt(0);
  }

  removeCurrentRow(i) {
    this.plotFieldForm.removeAt(i);
  }
  AddFormArrya(length) {
    for (let i = 1; i <= length; i++) {
      this.addPlot();
    }
  }
  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
    });
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

  enquiryModeList() {
    let formData = new FormData();
    formData.append('lookupTypeId', '79ac32a7-ef7c-11f0-9534-065da37009bd');
    this.CrmService.getEnquiryModeList(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.enquiryModeData = resp.data;
    });
  }

  getMarketingTeamsLists() {
    let formData = new FormData();
    formData.append('lookupTypeId', 'b5c6adce-ef88-11f0-9534-065da37009bd');
    this.CrmService.getEnquiryModeList(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.marketingTeamMembersData = resp.data;
    });
  }

  onEnquiryModeChange(event: any) {
    const selectEl = event.target;
    const selectedIndex = selectEl.selectedIndex;

    // Get displayed text (name)
    const selectedName = selectEl.options[selectedIndex].text.trim();

    // Use ONLY name for logic
    this.showIntroducedBy = selectedName === 'Marketing Team';

    if (!this.showIntroducedBy) {
      this.searchCrmVisitor.get('introduced_by')?.reset();
    }
  }


  onVisitorName() {
    this.addCrmVisitor.controls['visitor_id'].reset();
  }
}

function getvisitor_id(getvisitor_id: any) {
  throw new Error('Function not implemented.');
}

function disable(): any {
  throw new Error('Function not implemented.');
}




function toggleTimepicker() {
  throw new Error('Function not implemented.');
}

