import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, OnDestroy, ViewChildren } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { takeUntil } from 'rxjs/operators';
import { StockService } from 'src/app/services/stock.service';
import { FormControl, FormControlName, FormGroup } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';


class DataTablesResponse {
  iTotalDisplayRecords(iTotalDisplayRecords: any) {
    throw new Error('Method not implemented.');
  }
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}
@Component({
  selector: 'app-stock-goods-received-notes',
  templateUrl: './stock-goods-received-notes.component.html',
  styleUrls: ['./stock-goods-received-notes.component.scss']
})
export class StockGoodsReceivedNotesComponent implements OnInit, OnDestroy {

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  grnTableData: any[];
  @ViewChildren(DataTableDirective) dtElement: any;
  private destroy$ = new Subject<void>();
  grnDatatableparameter: { from: any, to: any, grn_no: any, gate_entry_no: any, vehicle_no: any }
  GENList: any[];
  canShowPayButton = false;




  searchGRNForm = new FormGroup({
    from: new FormControl(),
    to: new FormControl(),
    grn_no: new FormControl(),
    gate_entry_no: new FormControl(),
    vehicle_no: new FormControl(),
  })

  constructor(private router: Router, private http: HttpClient, private stockService: StockService, private sanitizer: DomSanitizer) {
    this.grnDatatableparameter = { from: '', to: '', grn_no: '', gate_entry_no: '', vehicle_no: '' }
  }

  ngOnInit(): void {
    this.setRoleAccess();
    this.datatablecode();
    this.fetchGenData();
  }

  private setRoleAccess(): void {
    const roles = new Set(
      (sessionStorage.getItem('UserRole') || '')
        .split(',')
        .map(role => role.trim())
        .filter(Boolean)
    );

    this.canShowPayButton =
      roles.has('Admin') ||
      roles.has('Administrator') ||
      roles.has('Accountant');
  }

  datatablecode() {
    this.grnDatatableparameter.from = this.searchGRNForm.get('from').value;
    this.grnDatatableparameter.to = this.searchGRNForm.get('to').value;
    this.grnDatatableparameter.grn_no = this.searchGRNForm.get('grn_no').value;
    this.grnDatatableparameter.gate_entry_no = this.searchGRNForm.get('gate_entry_no').value;
    this.grnDatatableparameter.vehicle_no = this.searchGRNForm.get('vehicle_no').value;


    const that = this;
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });

    this.dtOptions = {
      processing: true,
      serverSide: true,
      pageLength: 10,
      dom: 'lrtip',
      lengthMenu: [[5, 10, 25, 50, 100], [5, 10, 25, 50, 100]],
      columnDefs: [
        { orderable: false, targets: [0, 9] }
      ],

      columns: [
        { data: 'dummy' }, // first blank column
        { data: 'grn_no' },
        { data: 'grn_date' },
        { data: 'gate_entry_no' },
        { data: 'po_no' },
        { data: 'vehicle_no' },
        { data: 'from_vendor' },
        { data: 'requested_by' },
        { data: 'item_name' },
        { data: 'dummy' } // action column
      ],

      ajax: (dataTablesParameters: any, callback) => {

        // Extract sorting info
        const orderColumnIndex = dataTablesParameters.order[0].column;
        const orderDir = dataTablesParameters.order[0].dir;
        const orderColumnName = dataTablesParameters.columns[orderColumnIndex].data;

        // Build request payload
        const params = {
          ...dataTablesParameters,
          ...this.grnDatatableparameter,
          order_column: orderColumnIndex,
          order_dir: orderDir,
          order_column_name: orderColumnName
        };

        that.http.post<DataTablesResponse>(
          environment.APIEndpoint + 'stock.fetchgrnData&reload=1',
          params,
          { responseType: 'json', headers }
        ).pipe(takeUntil(this.destroy$)).subscribe(resp => {
          that.grnTableData = resp.data;
          console.log(resp.data);
          callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsTotal,
            data: [] // UI renders using Angular, not DataTables
          });
        });
      }
    };
  }

  fetchGenData() {
    let formData = new FormData();
    this.stockService.fetchGenData(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.GENList = resp.data
    });
  }

  searchGRN() {
    this.datatablecode();
    this.rerender();
  }

  resetGRN() {
    this.searchGRNForm.get('from').setValue('');
    this.searchGRNForm.get('to').setValue('');
    this.searchGRNForm.get('grn_no').setValue('');
    this.searchGRNForm.get('gate_entry_no').setValue('');
    this.searchGRNForm.get('vehicle_no').setValue('');

    this.datatablecode();
    this.rerender();
  }

  navigateToGRN() {
    this.router.navigate(['/stock-add-grn']);
  }


  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  rerender(): void {
    this.dtElement.forEach((item) => {
      if (item.dtInstance) {
        item.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.destroy();
        });
      }
    });
    this.dtTrigger.next();
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();

    this.destroy$.next();
    this.destroy$.complete();

    if (this.dtElement && this.dtElement.dtInstance) {
      this.dtElement.dtInstance.then(dt => dt.destroy());
    }

  }

  viewGRN(type, grn_id) {
    this.router.navigate(
      ['stock-add-grn', grn_id],
      { queryParams: { mode: type } }
    );
  }

  removeGRN(item) {

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
        transation_form.append('grn_id', item.grn_id || '');
        transation_form.append('accepted_qty', item.accepted_qty || '');

        this.stockService.removeGRN(transation_form)
          .pipe(takeUntil(this.destroy$))
          .subscribe(Response => {

            if (Response.code == 200) {
              Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'GRN Deleted Successfully',
                showConfirmButton: false,
                timer: 2000
              });
              this.rerender();
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Failed to delete GRN',
                showConfirmButton: false,
                timer: 3000
              });
            }
          });
      }
    });
  }


  openGRNPdf(grn_id: string) {
    Swal.fire({
      title: 'Preparing GRN Data in PDF',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading()
    });

    const formData = new FormData();
    formData.append('grn_id', grn_id);

    this.stockService.downloadGRN(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (resp: any) => {
          console.log(resp);
          if (!resp?.download_url) {
            Swal.fire({                 // ADDED: error Swal for invalid response
              icon: 'error',
              title: 'Failed to generate PDF',
              text: 'PDF download link not available'
            });
            return;
          }

          Swal.close();
          setTimeout(() => {
            window.open(resp.download_url, '_blank');
          }, 500);
        },
        (err) => {
          Swal.fire({                   // ADDED: error Swal for API failure
            icon: 'error',
            title: 'Error',
            text: 'Something went wrong while generating the PDF'
          });
        }
      );
  }


  redirectToTransaction(grn_id) {

    const startTime = Date.now();   // track when loader starts

    // Show loader immediately
    Swal.fire({
      title: 'Please wait',
      text: 'Redirecting to Transaction Page for Vendor Payment...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    let formData = new FormData();
    formData.append('grn_id', grn_id);

    this.stockService.getGrnDetailsById(formData).pipe(takeUntil(this.destroy$)).subscribe(
      resp => {

        const data = resp.data[0];

        const billNumber = data.bill_no;
        const challanNumber = data.challan_no;

        const docType = billNumber ? 'bill_no' : 'challan_no';
        const docNumber = billNumber || challanNumber;

        const elapsed = Date.now() - startTime;
        const remaining = 3000 - elapsed;   // ensure at least 3 seconds

        setTimeout(() => {

          Swal.close();

          this.router.navigate(
            ['/reg-trans-list'],
            {
              queryParams: {
                tab: 'expense',
                openModal: 'add',
                vendorName: data.from_vendor,
                docType: docType,
                docNumber: docNumber,
                description: data.remarks,
                amount: data.grand_total,
                po_no: data.po_no,
                fromDate: data.grn_date
              }
            }
          );

        }, remaining > 0 ? remaining : 0);
      },
      error => {
        Swal.close();
        Swal.fire('Error', 'Failed to load GRN details', 'error');
      }
    );
  }



}
