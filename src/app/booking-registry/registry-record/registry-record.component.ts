import { Component, OnInit, ViewChild, Injectable, OnDestroy } from '@angular/core';
import { NgbCalendar, NgbDateAdapter, NgbDate, NgbDateParserFormatter, NgbDateStruct, NgbInputDatepickerConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { from, Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { DataTableDirective } from 'angular-datatables';
import { environment } from 'src/environments/environment';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { BookingRegistryModalComponent } from 'src/app/shared/booking-registry-modal/booking-registry-modal.component';
import { BillingService } from 'src/app/services/billing.service';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { updateMeasurementFields } from 'src/app/shared/add-booking-registry/add-booking-registry.component';
import { NgxSpinnerService } from 'ngx-spinner';
import { CrmService } from 'src/app/services/crm.service';

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

class Registry {
  payment_status: string;
  registry_target_date: string;
  booking_date: string;
  buyerName: string;
  divertion_date: string;
  stage: string;
  stage_name: string;
  status: string;
  plot_size: string;
  plot_depth: string;
  plot_length: string;
}

class DataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}

@Component({
  selector: 'app-registry-record',
  templateUrl: './registry-record.component.html',
  styleUrls: ['./registry-record.component.css'],
  providers: [
    NgbInputDatepickerConfig,
    { provide: NgbDateAdapter, useClass: CustomAdapter },
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter }
  ]
})

export class RegistryRecordComponent implements OnInit, OnDestroy {
  blockplotdataList: any[];
  blockPlotSuggestion: any[];
  keyword = 'product_code';
  blockplotdata: { product_code: any; }[];
  static regDatatableCode(regDatatableCode: any) {
    throw new Error('Method not implemented.');
  }

  // respStages = [];
  // respStages1 = [];


  @ViewChild(DataTableDirective) datatable_directive: any;
  minDate = { year: 1900, month: 1, day: 1 };
  maxDate = { year: 2099, month: 12, day: 31 };
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  private destroy$ = new Subject<void>();
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  regdata: Registry[];
  resp: any;
  regMeasurement = new FormGroup({
    mPlotNumber: new FormControl('')
  });
  srcRegistryForm = new FormGroup({
    from_booking_date: new FormControl(''),
    to_booking_date: new FormControl(''),
    from_registry_date: new FormControl(''),
    to_registry_date: new FormControl(''),
    payment_plan: new FormControl(''),
    status: new FormControl(''),
    stage: new FormControl(''),
    payment_status: new FormControl(''),
    buyer_name: new FormControl(''),
    BlockPlotSearch: new FormControl(''),
  });

  DatatableParameter = { RegPaymentStatus: '', RegFromBookingDt: '', RegToBookingDt: '', RegFromRegistryDt: '', RegToRegistryDt: '', RegStatus: '', RegStage: '', RegPaymentPlan: '', RegBuyerName: '', regDetailID: '', BlockPlotSearch: '' };
  respStages = [];
  respValues = [];
  regValues = [];
  BalenceValue = [];
  filteredStages = [];
  respStagesStatus: any;
  respPPlan: any;
  respPStatus: any;
  CrmUserRole: boolean;
  CRMAdmin: boolean = false;
  canViewExcelExports: boolean;
  canViewBookingList: boolean;
  constructor(private billingservice: BillingService, private crmService: CrmService, private router: Router, private spinner: NgxSpinnerService, public http: HttpClient, private datePipe: DatePipe, private ngbCalendar: NgbCalendar, private dateAdapter: NgbDateAdapter<string>, private modalService: NgbModal,
    private fb: FormBuilder) {

    this.regMeasurement = this.fb.group({
      mPlotNumber: [''],
      mKhasra: [''],
      mMeasurmentunit: [''],
      mRakba: [''],
      mVillage: [''],
      mSize: [''],
      registry_booking_id: [''],
      company_id: [''],
    });
  }




  addRegistry(type = "", id: any = '', prsn_id = '') {
    this.router.navigate(['/edit-booking', id, prsn_id, type], { queryParams: { tab: 'buyer' } });
  }


  addBookingRegistry() {
    const initialState: any = { 'coments': 'Registry' };
    const modalRef = this.modalService.open(BookingRegistryModalComponent, { size: 'lg', backdrop: 'static', keyboard: true });
    modalRef.componentInstance.flg = "addBookingRegistry";
    modalRef.componentInstance.datatable_directive = this.datatable_directive;


  }
  edit_view_registry() {
    this.router.navigate(['/edit-view-registry'], { state: { id: '1' } });
  }


  custEnquiryEdit(custEnq: string,buyerName: string,mobile_number: string) {

    // if (!custEnq) {
    //   Swal.fire({ icon: 'error', title: 'Cannot Redirect', text: 'No customer profile linked to this record.', showConfirmButton: false, timer: 2500 });
    //   return;
    // }

    const formData = new FormData();
    formData.append('customer_id', custEnq);
    formData.append('buyer_name', buyerName);
    formData.append('mobile_number', mobile_number);

    this.crmService.getEnquiryIdFromBuyerId(formData).pipe(takeUntil(this.destroy$)).subscribe(
      resp => {
        if (!resp || resp.length === 0) {
          Swal.fire({ icon: 'warning', title: 'Not Found', text: 'No enquiry found for this customer.', showConfirmButton: false, timer: 2500 });
          return;
        }
        const enquiryId = resp[0].enquiry_id;
        if (!enquiryId) {
          Swal.fire({ icon: 'warning', title: 'Not Found', text: 'Enquiry ID is missing for this customer.', showConfirmButton: false, timer: 2500 });
          return;
        }
        this.router.navigate(['/crm-enquiry-details/' + enquiryId + '/edit']);
      },
      _err => {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to fetch enquiry details. Please try again.', showConfirmButton: false, timer: 2500 });
      }
    );
  }

  deletRegistryData(PersonsId, enquiry_id, booking_id, main_id) {

    let removeRegistryData = new FormData();

    removeRegistryData.append('PersonsId', PersonsId);
    removeRegistryData.append('EnquiryId', enquiry_id);
    removeRegistryData.append('bookingId', booking_id);
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

        let removeRegistryDataa = new FormData();

        removeRegistryDataa.append('main_id', main_id);
        this.billingservice.deleteitemm(removeRegistryDataa).pipe(takeUntil(this.destroy$)).subscribe(resp => {
          if (resp) {
            //console.log(true);
          }
        })
      }
    })
  }

  ngOnInit(): void {
    this.regDatatableCode();
    this.StagesStatuslist();
    this.erpStageStatus();
    this.PaymentPlanlist();

    // this.PaymentStatuslist();
    this.CrmUserRole = false;
    this.canViewExcelExports = false;
    this.canViewBookingList = false;
    if (sessionStorage.getItem('UserRole') == 'CRM User') {
      this.CrmUserRole = true;
    }
    this.CRMAdmin = false;
    if (sessionStorage.getItem('UserRole') == 'CRM Admin') {
      this.CRMAdmin = true;
    }

    const roles = new Set(
      (sessionStorage.getItem('UserRole') || '')
        .split(',')
        .map(role => role.trim())
        .filter(role => !!role)
    );
    this.canViewExcelExports =
      roles.has('Admin') ||
      roles.has('Administrator') ||
      roles.has('Sales Record');
    this.canViewBookingList =
      roles.has('Admin') ||
      roles.has('Administrator') ||
      roles.has('CRM Admin') ||
      roles.has('Sales Record');
  }

  regDatatableCode() {

    const storedFormValues = JSON.parse(sessionStorage.getItem('registryFormValues') || '{}');

    this.srcRegistryForm.get('buyer_name').setValue(storedFormValues.buyer_name);
    this.srcRegistryForm.get('from_booking_date')?.setValue(storedFormValues.from_booking_date);
    this.srcRegistryForm.get('to_booking_date')?.setValue(storedFormValues.to_booking_date);
    this.srcRegistryForm.get('from_registry_date')?.setValue(storedFormValues.from_registry_date);
    this.srcRegistryForm.get('to_registry_date')?.setValue(storedFormValues.to_registry_date);
    this.srcRegistryForm.get('status').setValue(storedFormValues.status);
    this.srcRegistryForm.get('payment_status').setValue(storedFormValues.payment_status);
    this.srcRegistryForm.get('stage').setValue(storedFormValues.stage);
    this.srcRegistryForm.get('BlockPlotSearch').setValue(storedFormValues.BlockPlotSearch)

    if (storedFormValues && Object.keys(storedFormValues).length > 0) {
      this.DatatableParameter.RegPaymentStatus = storedFormValues.payment_status;
      this.DatatableParameter.RegFromBookingDt = storedFormValues.from_booking_date;
      this.DatatableParameter.RegToBookingDt = storedFormValues.to_booking_date;
      this.DatatableParameter.RegFromRegistryDt = storedFormValues.from_registry_date;
      this.DatatableParameter.RegToRegistryDt = storedFormValues.to_registry_date;
      this.DatatableParameter.RegStatus = (Array.isArray(storedFormValues.status) && storedFormValues.status.length > 0) ? storedFormValues.status : '';
      this.DatatableParameter.RegStage = (Array.isArray(storedFormValues.stage) && storedFormValues.stage.length > 0) ? storedFormValues.stage : '';
      this.DatatableParameter.RegPaymentPlan = storedFormValues.payment_plan;
      this.DatatableParameter.RegBuyerName = storedFormValues.buyer_name;
      this.DatatableParameter.BlockPlotSearch = storedFormValues.BlockPlotSearch;
    } else {

      this.srcRegistryForm.reset();
      this.srcRegistryForm.get('from_booking_date')?.setValue('');
      this.srcRegistryForm.get('to_booking_date')?.setValue('');
      this.srcRegistryForm.get('from_registry_date')?.setValue('');
      this.srcRegistryForm.get('to_registry_date')?.setValue('');
      this.srcRegistryForm.get('payment_status').setValue('');
      this.srcRegistryForm.get('status').setValue([]);
      this.srcRegistryForm.get('stage').setValue([]);
      this.srcRegistryForm.get('buyer_name').setValue('');
      this.srcRegistryForm.get('payment_plan').setValue('');
      sessionStorage.setItem('registryFormValues', JSON.stringify(this.srcRegistryForm.value));
      this.DatatableParameter.RegPaymentStatus = this.srcRegistryForm.get('payment_status').value;
      this.DatatableParameter.RegFromBookingDt = this.srcRegistryForm.get('from_booking_date')?.value ?? '';
      this.DatatableParameter.RegToBookingDt = this.srcRegistryForm.get('to_booking_date')?.value ?? '';
      this.DatatableParameter.RegFromRegistryDt = this.srcRegistryForm.get('from_registry_date')?.value ?? '';
      this.DatatableParameter.RegToRegistryDt = this.srcRegistryForm.get('to_registry_date')?.value ?? '';
      this.DatatableParameter.RegPaymentPlan = this.srcRegistryForm.get('payment_plan').value;
      this.DatatableParameter.RegBuyerName = this.srcRegistryForm.get('buyer_name').value;
      this.DatatableParameter.BlockPlotSearch = this.srcRegistryForm.get('BlockPlotSearch').value;
    }
    this.DatatableParameter.regDetailID = '';
    const that = this;
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });
    this.dtOptions = {
      processing: true,
      serverSide: true,
      dom: 'lrtip',
      pageLength: 50,
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
      columnDefs: [
        { orderable: false, targets: -1 }
      ],
      order: [[3, 'desc']],
      ajax: (dataTablesParameters: any, callback) => {
        Object.assign(dataTablesParameters, this.DatatableParameter);
        that.http.post<DataTablesResponse>(environment.APIEndpoint + 'booking.fetch_bookingdetails&reload=1', Object.assign(dataTablesParameters, this.DatatableParameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {
         
          that.regdata = resp.data;
          callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsTotal,
            data: []
          });
        });
      }
    };
  }

  // RegRecordToExcel(){

  //    let RegPlan ="";
  //    let RegRecordData = new FormData();

  //    RegRecordData.append('RegPlan', RegPlan);

  //    this.billingservice.getRegRecToExcel(RegRecordData).subscribe(resp => {
  //     this.regValues = resp.data; 
  //     let excelData = [];

  //     const headerRow = [
  //       "Sr No.", "Seller Name", "Khasra Number", "Plot Num", "Block", "Buyer", "Registry Date","Size","Area","Stage/Status","Contact"
  //     ]

  //     excelData.push(headerRow);

  //     for(let i=0;i < this.regValues.length;i++){
  //       let row =[
  //         this.regValues[i]['Sr_No'],
  //         this.regValues[i]['Seller_Name'],
  //         this.regValues[i]['Khasra_Number'],
  //         this.regValues[i]['plot_num'],
  //         this.regValues[i]['block'],
  //         this.regValues[i]['Buyer_Name'],
  //         this.regValues[i]['Reg_Date'],
  //         this.regValues[i]['Size'],
  //         this.regValues[i]['Area'],
  //         this.regValues[i]['stage_status'],
  //         this.regValues[i]['Contact'],

  //       ];

  //       excelData.push(row);
  //     }
  //     const ws = XLSX.utils.aoa_to_sheet(excelData);
  //     ws['!cols'] = [
  //       { wch: 6 },  // Sr No.
  //       { wch: 25 }, // Seller Name
  //       { wch: 15 },  // Khasra Number
  //       { wch: 10 }, // Plot Num
  //       { wch: 10 }, // Block
  //       { wch: 20 }, // Buyer
  //       { wch: 15 },  // Registry Date
  //       { wch: 12 },   // Size
  //       { wch: 10 },  // Area
  //       { wch: 40 }, // Stage/Status
  //       { wch: 15 }, // Contact
  //     ];
  //     const wb = XLSX.utils.book_new();
  //     XLSX.utils.book_append_sheet(wb, ws, "Registration Data");
  //     XLSX.writeFile(wb, "Registry_Record.xlsx");
  //    });    

  // }

  RegRecordToExcel() {
    this.spinner.show();
    let RegPlan = "";
    let RegRecordData = new FormData();
    RegRecordData.append('RegPlan', RegPlan);

    this.billingservice.getRegRecToExcel(RegRecordData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      if (resp) {
        this.spinner.hide();
        this.regValues = resp.data;
        let excelData = [];

        const headerRow = [
          "Sr No.", "Seller Name", "Khasra Number", "Plot Num", "Block", "Buyer",
          "Registry Date", "Size", "Area", "Stage/Status", "Contact"
        ];

        excelData.push(headerRow);

        for (let i = 0; i < this.regValues.length; i++) {
          let row = [
            this.regValues[i]['Sr_No'],
            this.regValues[i]['Seller_Name'],
            this.regValues[i]['Khasra_Number'],
            this.regValues[i]['plot_num'],
            this.regValues[i]['block'],
            this.regValues[i]['Buyer_Name'],
            this.regValues[i]['Reg_Date'],
            this.regValues[i]['Size'],
            this.regValues[i]['Area'],
            this.regValues[i]['stage_status'],
            this.regValues[i]['Contact'],
          ];
          excelData.push(row);
        }


        const ws = XLSX.utils.aoa_to_sheet(excelData);
        ws['!cols'] = [
          { wch: 6 }, { wch: 25 }, { wch: 15 }, { wch: 10 }, { wch: 10 },
          { wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 10 }, { wch: 40 }, { wch: 15 }
        ];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Registration Data");


        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        const dataUrl = URL.createObjectURL(blob);


        const htmlContent = `
        <html>
          <head>
            <title>Registry Record Preview</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                padding: 40px 20px 20px; 
                position: relative; 
              }
              .download-container {
                position: absolute;
                right: 20px;
                top: 20px;
              }
              table { 
                border-collapse: collapse; 
                width: 100%; 
                margin-top: 20px; 
              }
              th, td { 
                border: 1px solid #ddd; 
                padding: 8px; 
                text-align: left; 
              }
              th { 
                background-color: #f2f2f2; 
              }
              .download-btn {
                padding: 10px 20px;
                background-color: #4CAF50;
                color: black;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                transition: background-color 0.3s;
              }
              .download-btn:hover { 
                background-color: #45a049; 
              }
              h2 {
                margin: 0;
                padding-bottom: 15px;
                border-bottom: 2px solid #eee;
              }
            </style>
          </head>
          <body>
            <div class="download-container">
              <a href="${dataUrl}" download="Registry_Record.xlsx">
                <button class="download-btn">Download Excel File</button>
              </a>
            </div>
            
            <h2>Registry Record Preview</h2>
            
            <table>
              ${excelData.map((row, index) => `
                <tr>
                  ${row.map(cell => `
                    ${index === 0 ?
            `<th>${this.escapeHtml(cell)}</th>` :
            `<td>${this.escapeHtml(cell)}</td>`}
                  `).join('')}
                </tr>
              `).join('')}
            </table>
          </body>
        </html>
       `;


        const previewWindow = window.open('', '_blank');
        if (previewWindow) {
          previewWindow.document.writeln(htmlContent);
          previewWindow.document.close();

          previewWindow.onbeforeunload = () => {
            URL.revokeObjectURL(dataUrl);
          };
        }
      }
    });
  }

  BalSheetToExcel() {
    this.spinner.show();
    let PersonType = 'Buyer';
    let formData = new FormData();
    formData.append('personType', PersonType);
    this.billingservice.getBalSheetlist(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {

      this.spinner.hide();
      this.BalenceValue = resp.data;
      let excelData = [];

      const headerRow = [
        "Sr No.", "Buyer Name", "Block-Plot", "Contact", "Dimensions", "Plot Area",
        "Total Amount", "Paid Amount", "Discount", "Balance", "Payment Plan"
      ];

      excelData.push(headerRow);

      // Initialize totals
      let totalAmountSum = 0;
      let paidAmountSum = 0;
      let balanceSum = 0;
      let discountSum = 0;

      // Function to format numbers as Indian currency
      const formatIndianCurrency = (num) => {
        if (num === null || num === undefined) return '0';
        num = Number(num);
        return num.toLocaleString('en-IN', {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2
        });
      };

      for (let i = 0; i < this.BalenceValue.length; i++) {
        let row = [
          this.BalenceValue[i]['Sr_No'],
          this.BalenceValue[i]['buyerName'],
          this.BalenceValue[i]['ProductCode'],
          this.BalenceValue[i]['Contact'],
          this.BalenceValue[i]['Dimensions'],
          this.BalenceValue[i]['plot_area'],
          formatIndianCurrency(this.BalenceValue[i]['total_amount']),
          formatIndianCurrency(this.BalenceValue[i]['paid_amount']),
          formatIndianCurrency(this.BalenceValue[i]['discount']),
          formatIndianCurrency(this.BalenceValue[i]['balance']),
          this.BalenceValue[i]['Payment_plan'],
        ];
        excelData.push(row);

        // Add to totals (convert to number first to avoid string concatenation)
        totalAmountSum += Number(this.BalenceValue[i]['total_amount']) || 0;
        paidAmountSum += Number(this.BalenceValue[i]['paid_amount']) || 0;
        discountSum += Number(this.BalenceValue[i]['discount']) || 0;
        balanceSum += Number(this.BalenceValue[i]['balance']) || 0;
      }

      // Add totals row
      const totalsRow = [
        '', '', '', '', '', 'TOTAL:',
        formatIndianCurrency(totalAmountSum),
        formatIndianCurrency(paidAmountSum),
        formatIndianCurrency(discountSum),
        formatIndianCurrency(balanceSum),
        ''
      ];
      excelData.push(totalsRow);

      const ws = XLSX.utils.aoa_to_sheet(excelData);
      ws['!cols'] = [
        { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
        { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }
      ];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Balance Sheet");

      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: "array" });
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const dataUrl = URL.createObjectURL(blob);

      const htmlContent = `
      <html>
        <head>
          <title> Balance List </title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 40px 20px 20px; 
              position: relative; 
            }
            .download-container {
              position: absolute;
              right: 20px;
              top: 20px;
            }
            table { 
              border-collapse: collapse; 
              width: 100%; 
              margin-top: 20px; 
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left; 
            }
            th { 
              background-color: #f2f2f2; 
            }
            .download-btn {
              padding: 10px 20px;
              background-color: #4CAF50;
              color: black;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              transition: background-color 0.3s;
            }
            .download-btn:hover { 
              background-color: #45a049; 
            }
            h2 {
              margin: 0;
              padding-bottom: 15px;
              border-bottom: 2px solid #eee;
            }
            .filter-container {
              display: flex;
              gap: 20px;
              margin: 15px 0;
              align-items: center;
              flex-wrap: wrap;
            }
            .filter-group {
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .filter-input {
              padding: 8px 12px;
              border: 1px solid #ddd;
              border-radius: 4px;
              width: 250px;
            }
            .filter-select {
              padding: 8px 12px;
              border: 1px solid #ddd;
              border-radius: 4px;
              background-color: white;
            }
            .total-row {
              font-weight: bold;
              background-color: #f2f2f2;
            }
            .currency {
              text-align: right;
            }
          </style>
        </head>
        <body>
          <div class="download-container">
            <a href="${dataUrl}" download="Balance_List.xlsx">
              <button class="download-btn">Download Excel File</button>
            </a>
          </div>
          
          <h2>Balance Lists Preview</h2>
          <!-- Filter Section 
            <div class="filter-container">
              <div class="filter-group">
                <label>Filter by Buyer:</label>
                <input 
                  type="text" 
                  id="buyerFilter" 
                  class="filter-input" 
                  placeholder="Type buyer name..."
                >
              </div>
              
              <div class="filter-group">
                <label>Payment Plan:</label>
                <select id="paymentFilter" class="filter-select">
                  <option value="all">All</option>
                  <option value="available">Available</option>
                  <option value="not-available">Not Available</option>
                </select>
              </div>
            </div>
          -->
          
          <table id="balanceTable">
            ${excelData.map((row, index) => `
              <tr class="${index === excelData.length - 1 ? 'total-row' : ''}">
                ${row.map((cell, cellIndex) => `
                  ${index === 0 ?
          `<th>${this.escapeHtml(cell)}</th>` :
          `<td class="${[6, 7, 8, 9].includes(cellIndex) ? 'currency' : ''}">${this.escapeHtml(cell)}</td>`}
                `).join('')}
              </tr>
            `).join('')}
          </table>

          <script>
            document.addEventListener('DOMContentLoaded', function() {
              const buyerFilter = document.getElementById('buyerFilter');
              const paymentFilter = document.getElementById('paymentFilter');
              const table = document.getElementById('balanceTable');
              
              // Function to format numbers as Indian currency
              function formatIndianCurrency(num) {
                if (num === null || num === undefined) return '0';
                num = num.toString().replace(/,/g, '');
                num = parseFloat(num);
                return isNaN(num) ? '0' : num.toLocaleString('en-IN', {
                  maximumFractionDigits: 2,
                  minimumFractionDigits: 2
                });
              }
              
              function filterTable() {
                const buyerValue = buyerFilter.value.toLowerCase();
                const paymentValue = paymentFilter.value;
                const rows = table.getElementsByTagName('tr');
                
                for (let i = 1; i < rows.length; i++) {
                  const cells = rows[i].getElementsByTagName('td');
                  const buyerName = cells[1].textContent.toLowerCase();
                  const paymentPlan = cells[10].textContent.trim().toLowerCase();
                  
                  const buyerMatch = buyerName.includes(buyerValue);        
                  
                  let paymentMatch = true;
                  if (paymentValue !== 'all') {
                    const isAvailable = paymentPlan.includes('available') && 
                                      !paymentPlan.includes('not available') &&
                                      !paymentPlan.includes('unavailable');
                    
                    paymentMatch = (paymentValue === 'available') ? 
                                  isAvailable : 
                                  !isAvailable;
                  }
                  
                  // Show or hide row based on both filters
                  rows[i].style.display = (buyerMatch && paymentMatch) ? '' : 'none';
                }
                
                // Update totals after filtering
                updateTotals();
              }
              
              function updateTotals() {
                let totalAmount = 0;
                let paidAmount = 0;
                let discount = 0;
                let balance = 0;
                
                const rows = table.getElementsByTagName('tr');
                
                // Start from 1 to skip header, end before last row (totals row)
                for (let i = 1; i < rows.length - 1; i++) {
                  if (rows[i].style.display !== 'none') {
                    const cells = rows[i].getElementsByTagName('td');
                    totalAmount += parseFloat(cells[6].textContent.replace(/,/g, '')) || 0;
                    paidAmount += parseFloat(cells[7].textContent.replace(/,/g, '')) || 0;
                    discount += parseFloat(cells[8].textContent.replace(/,/g, '')) || 0;
                    balance += parseFloat(cells[9].textContent.replace(/,/g, '')) || 0;
                  }
                }
                
                // Update totals row
                const totalsRow = rows[rows.length - 1];
                const totalCells = totalsRow.getElementsByTagName('td');
                totalCells[6].textContent = formatIndianCurrency(totalAmount);
                totalCells[7].textContent = formatIndianCurrency(paidAmount);
                totalCells[8].textContent = formatIndianCurrency(discount);
                totalCells[9].textContent = formatIndianCurrency(balance);
              }
              
              buyerFilter.addEventListener('keyup', filterTable);
              paymentFilter.addEventListener('change', filterTable);
            });
          </script>
        </body>
      </html>
      `;
      const previewWindow = window.open('', '_blank');
      if (previewWindow) {
        previewWindow.document.writeln(htmlContent);
        previewWindow.document.close();

        previewWindow.onbeforeunload = () => {
          URL.revokeObjectURL(dataUrl);
        };
      }
    });
  }

  // BalSheetToExcel(){
  //   console.log('caale');
  //   const mobNumber = 919685179913;

  //   this.billingservice.wabridge(mobNumber).subscribe(resp => {
  //      console.log(resp.DLRRESPONSE);
  //   });
  // }

  //  preveent HTML injection
  private escapeHtml(unsafe: any): string {
    if (unsafe === null || unsafe === undefined) return '';
    return unsafe.toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  BookingToExcel() {
    this.spinner.show();
    let BookingPlan = "";
    let BookingPlandata = new FormData();
    BookingPlandata.append('BookingList', BookingPlan);
    BookingPlandata.append('buyer_name', this.srcRegistryForm.get('buyer_name').value);

    this.billingservice.get_bookingListToExcel(BookingPlandata).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.respValues = resp.data;
      let excelData = [];
      this.spinner.hide();

      // Initialize balance total
      let balanceTotal = 0;

      const headerRow1 = [
        "Sr No", "Buyer Name", "Booking date", "Block/Plot", "khasra No.", "Contact Number",
        "Size", "Area",
        "Payment Details", "", "", "", "", "",
        "Reg Date", "Team name", "Remarks"
      ];
      const headerRow2 = [
        "", "", "", "", "",
        "", "",
        "Rate Sqft", "Total Amount", "Paid Amount", "At Reg", "FNC", "Balance",
        "", ""
      ];

      excelData.push(headerRow1);
      excelData.push(headerRow2);

      for (let i = 0; i < this.respValues.length; i++) {
        // Calculate balance total (convert to number)
        let rawBalance = this.respValues[i]['Balance'];

        // Clean it: remove commas, handle null/undefined/empty
        let numericBalance = Number(
          (rawBalance || '0').toString().replace(/,/g, '').trim()
        );

        balanceTotal += numericBalance;
        let row = [
          this.respValues[i]['Sr_No'],
          this.respValues[i]['Buyer_Name'],
          this.respValues[i]['Booking_date'],
          this.respValues[i]['Block_Plot'],
          this.respValues[i]['khasra_number'],
          this.respValues[i]['Contact_Number'],
          this.respValues[i]['Size'],
          this.respValues[i]['Area'],
          this.respValues[i]['Rate_Sqft'],
          this.respValues[i]['Total_Amount'],
          this.respValues[i]['Paid_Amount'],
          this.respValues[i]['At_Reg'],
          this.respValues[i]['FNC'],
          this.respValues[i]['Balance'],
          this.respValues[i]['Reg_Date'],
          this.respValues[i]['Team_name'],
          this.respValues[i]['remarks'],
        ];
        excelData.push(row);
      }

      // Add totals row
      const totalsRow = [
        'TOTAL', '', '', '', '', '', '', '',
        '', '', '', '', '',
        balanceTotal.toLocaleString('en-IN', { // Format as Indian currency
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }),
        '', '', ''
      ];
      excelData.push(totalsRow);

      const ws = XLSX.utils.aoa_to_sheet(excelData);

      ws['!cols'] = [
        { wch: 6 }, { wch: 20 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 14 },
        { wch: 10 }, { wch: 10 },
        { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
        { wch: 10 }, { wch: 10 }, { wch: 20 }
      ];

      ws['!rows'] = [{ hpx: 20 }, { hpx: 20 }];

      ws['!merges'] = [
        { s: { r: 0, c: 8 }, e: { r: 0, c: 13 } }, // Payment Details
        { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } },  // sr no.
        { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } },  // Buyer Name
        { s: { r: 0, c: 2 }, e: { r: 1, c: 2 } },  // booking date
        { s: { r: 0, c: 3 }, e: { r: 1, c: 3 } },  // Block/Plot
        { s: { r: 0, c: 4 }, e: { r: 1, c: 4 } },  // Khasra number
        { s: { r: 0, c: 5 }, e: { r: 1, c: 5 } },  // contact
        { s: { r: 0, c: 6 }, e: { r: 1, c: 6 } },  // size
        { s: { r: 0, c: 7 }, e: { r: 1, c: 7 } },  //area
        { s: { r: 0, c: 14 }, e: { r: 1, c: 14 } }, // Reg Date
        { s: { r: 0, c: 15 }, e: { r: 1, c: 15 } }, // Team name
        { s: { r: 0, c: 16 }, e: { r: 1, c: 16 } }, // Remarks
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Registration Data");
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const dataUrl = URL.createObjectURL(blob);
      const htmlContent = `
        <html>
          <head>
            <title>Booking List Preview</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              table { border-collapse: collapse; width: 100%; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .header-center { text-align: center !important; vertical-align: middle !important;}
              .download-btn { 
                padding: 10px 20px; 
                background-color: #4CAF50; 
                color: white; 
                border: none; 
                cursor: pointer; 
                margin-bottom: 20px;
              }
              .download-btn:hover { background-color: #45a049; }
              .text-align-center{ text-align: center;}
              .total-row td {
                font-weight: bold;
                background-color: #f2f2f2;
              }
              .currency {
                text-align: right;
              }
              .total-label {
                font-weight: bold;
              }
            </style>
          </head>
          <body>
            <a href="${dataUrl}" download="Booking_list.xlsx" style="float: right;">
              <button class="download-btn">Download Excel File</button>
            </a>
            <h2>Booking List Preview</h2>
            <table>
              <thead style="border: 2px solid darkgray">
                <tr>
                  <th rowspan="2" class="header-center">Sr No</th>
                  <th rowspan="2" class="header-center">Buyer Name</th>
                  <th rowspan="2" class="header-center">Booking date</th>
                  <th rowspan="2" class="header-center">Block/Plot</th>
                  <th rowspan="2" class="header-center">Khasra No.</th>
                  <th rowspan="2" class="header-center">Contact Number</th>
                  <th rowspan="2" class="header-center">Size</th>
                  <th rowspan="2" class="header-center">Area</th>
                  <th colspan="6" class="header-center">Payment Details</th>
                  <th rowspan="2" class="header-center">Reg Date</th>
                  <th rowspan="2" class="header-center">Team name</th>
                  <th rowspan="2" class="header-center">Remarks</th>
                </tr>
                <tr>
                  <th class="header-center">Rate Sqft</th>
                  <th class="header-center">Total Amount</th>
                  <th class="header-center">Paid Amount</th>
                  <th class="header-center">At Reg</th>
                  <th class="header-center">FNC</th>
                  <th class="header-center">Balance</th>
                </tr>
              </thead>
              <tbody>
                ${excelData.slice(2, -1).map(row => `
                  <tr>
                    ${row.map((cell, index) => `
                      <td class="${index === 13 ? 'currency' : ''}">${this.escapeHtml(cell)}</td>
                    `).join('')}
                  </tr>
                `).join('')}
                
                <!-- Total row -->
                <tr class="total-row">
                  ${excelData[excelData.length - 1].map((cell, index) => `
                    <td class="${index === 13 ? 'currency total-label' : ''}">
                      ${this.escapeHtml(cell)}
                    </td>
                  `).join('')}
                </tr>
              </tbody>
            </table>
          </body>
        </html>
      `;
      const previewWindow = window.open('', '_blank');
      if (previewWindow) {
        previewWindow.document.writeln(htmlContent);
        previewWindow.document.close();
        previewWindow.onbeforeunload = () => {
          URL.revokeObjectURL(dataUrl);
        };
      }
    });
  }

  ExportTOExcel() {

    let excelData = [];

    excelData.push([
      "Product Name", "Product Code", "Booking Date", "Buyer Name",
      "Old Khasra Number", "Total Amount", "Payment Plan",
      "Plot Size", "Registry Target Date", "Stage Name", "Stages Status"
    ]);

    for (let i = 0; i < this.regdata.length; i++) {
      let row = [
        this.regdata[i]['ProductName'],
        this.regdata[i]['ProductCode'],
        this.regdata[i]['booking_date'],
        this.regdata[i]['buyerName'],
        this.regdata[i]['old_khasra_number'],
        this.regdata[i]['total_amount'],
        this.regdata[i]['payment_plan'],
        this.regdata[i]['plot_size'],
        this.regdata[i]['registry_target_date'],
        this.regdata[i]['stage_name'],
        this.regdata[i]['stages_status']
      ];
      excelData.push(row);
    }


    const ws = XLSX.utils.aoa_to_sheet(excelData);

    ws['!cols'] = [
      { wch: 20 },  // Product Name
      { wch: 15 },  // Product Code
      { wch: 15 },  // Booking Date
      { wch: 30 },  // Buyer Name (set width to 170px equivalent in characters)
      { wch: 20 },  // Old Khasra Number
      { wch: 20 },  // Total Amount
      { wch: 20 },  // Payment Plan
      { wch: 15 },  // Plot Size
      { wch: 20 },  // Registry Target Date
      { wch: 20 },  // Stage Name
      { wch: 20 }   // Stages Status
    ];


    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registration Data");

    XLSX.writeFile(wb, "RegistrationData.xlsx");
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }


  registrySearch() {

    sessionStorage.setItem('registryFormValues', JSON.stringify(this.srcRegistryForm.value));
    sessionStorage.getItem(JSON.stringify(this.srcRegistryForm.value));
    const storedFormValues = JSON.parse(sessionStorage.getItem('registryFormValues') || '{}');

    if (this.router.url == '/reg-record') {

      const storedFormValues = JSON.parse(sessionStorage.getItem('registryFormValues'));

      if (storedFormValues) {

        this.srcRegistryForm.get('buyer_name').setValue(storedFormValues.buyer_name);
        this.regDatatableCode();
        this.rerender();
      } else {
        // console.log('No form values found in sessionStorage.');
      }
    }

  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
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


  get showBookingDateFilter(): boolean {
    const selectedStageIds = this.srcRegistryForm.get('stage')?.value;
    if (!selectedStageIds || !selectedStageIds.length ||
        (selectedStageIds.length === 1 && selectedStageIds[0] === '')) {
      return false;
    }
    return selectedStageIds.some((id: any) => {
      const stage = this.filteredStages.find((s: any) => s.id === id);
      return stage && stage.name === 'Booking';
    });
  }

  get showRegistryDateFilter(): boolean {
    const selectedStageIds = this.srcRegistryForm.get('stage')?.value;
    if (!selectedStageIds || !selectedStageIds.length ||
        (selectedStageIds.length === 1 && selectedStageIds[0] === '')) {
      return false;
    }
    return selectedStageIds.some((id: any) => {
      const stage = this.filteredStages.find((s: any) => s.id === id);
      return stage && stage.name === 'Registration';
    });
  }

  resetSearch() {
    this.srcRegistryForm.reset();
    this.srcRegistryForm.get('from_booking_date')?.setValue('');
    this.srcRegistryForm.get('to_booking_date')?.setValue('');
    this.srcRegistryForm.get('from_registry_date')?.setValue('');
    this.srcRegistryForm.get('to_registry_date')?.setValue('');
    this.srcRegistryForm.get('payment_status')?.setValue('');
    this.srcRegistryForm.get('status')?.setValue([]);
    this.srcRegistryForm.get('stage')?.setValue([]);
    this.srcRegistryForm.get('buyer_name')?.setValue('');
    this.srcRegistryForm.get('BlockPlotSearch')?.setValue('');
    this.srcRegistryForm.get('payment_plan')?.setValue('');
    sessionStorage.setItem('registryFormValues', JSON.stringify(this.srcRegistryForm.value));
    this.regDatatableCode();
    this.rerender();
  }

  StagesStatuslist() {
    let StagesStatus = "";
    let StagesStatusdata = new FormData();
    StagesStatusdata.append('StagesStatus', StagesStatus);

    this.billingservice.fetch_StagesData(StagesStatusdata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
      this.respStages = Response.data;
      this.filteredStages = this.respStages
        .filter(stage => stage.stage_name !== 'Contact' && stage.stage_name !== 'Lead' && stage.stage_name !== 'Deals')

        .map(stage => ({
          name: stage.stage_name,
          id: stage.erpStageID
        })

        );

    });
  }

  erpStageStatus() {
    let erpstageStatus = "";
    let erpstageStatusdata = new FormData();
    erpstageStatusdata.append('StagesStatus', erpstageStatus);
    this.billingservice.get_erpstageStatus(erpstageStatusdata).pipe(takeUntil(this.destroy$)).subscribe(Response => {

      this.respPStatus = Response.data.map(vars => ({
        status: vars.status,
      }));
    });
  }



  onChangeStatus(e) {
    let StageId = e.value;
    let StagesStatusdata = new FormData();
    StagesStatusdata.append('StageId', StageId);

    this.billingservice.fetch_StagesStatusData(StagesStatusdata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
      this.respStagesStatus = Response.data;
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


  onBlockPlotSearch(e) {
    if (e.length > 0) {
      this.blockPlotlistData(e);
    } else {
      this.blockplotdataList = [];
    }
  }

  blockPlotlistData(e) {
    let transType = typeof (e) == "object" ? e.target.value : e;
    let formData = new FormData();

    formData.append('value', transType);

    this.billingservice.getBlockPlotsLists(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {

      this.blockPlotSuggestion = resp.data;
      this.blockplotdata = this.blockPlotSuggestion.map(item => ({
        product_code: item.product_code
      }));
      this.blockplotdataList = this.blockplotdata;
    });
  }

  selectBp(e) {
    this.srcRegistryForm.get('BlockPlotSearch').setValue(e.product_code);
  }



  //  PaymentStatuslist(){
  //   let PaymentStatus = "";
  //   let PaymentStatusdata = new FormData();
  //   PaymentStatusdata.append('StagesStatus',PaymentStatus);
  //   this.billingservice.fetch_PaymentStatus(PaymentStatusdata).subscribe(Response => {
  //     this.respPStatus = Response.data;
  //   });
  // }

}
