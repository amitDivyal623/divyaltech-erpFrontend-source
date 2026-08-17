import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, OnInit, OnDestroy, ViewChild, ViewChildren } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { StockService } from 'src/app/services/stock.service';
import { takeUntil } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { VendorService } from 'src/app/services/vendor.service';

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
  selector: 'app-account-vendor-details',
  templateUrl: './account-vendor-details.component.html',
  styleUrls: ['./account-vendor-details.component.scss']
})
export class AccountVendorDetailsComponent implements OnInit, OnDestroy {

  model_add: any;
  model_view: any;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  dtOptions1: DataTables.Settings = {};
  dtTrigger1: Subject<any> = new Subject<any>();
  @ViewChildren(DataTableDirective) dtElement: any;
  @ViewChild('closebutton') closebutton: ElementRef;
  vendorLists: any[];
  isLedgerDisabled = true;
  isLoading = false;




  isViewMode = false;
  private destroy$ = new Subject<void>();
  creditDataLists: any[];
  debitDataLists: any[];
  vendorDatatableParameter: { from: any, to: any, vendor_name : any }
  debitDatatableParameter: { from: any, to: any, vendor_name : any, payment_mode: any }

  creditForm = new FormGroup({
    vendor_name: new FormControl(),
    credit_date: new FormControl(),
    po_no: new FormControl(),
    items: new FormControl(),
    warehouse: new FormControl(),
    accepted_qty: new FormControl(),
    rate: new FormControl(),
    amount: new FormControl(),
    remarks: new FormControl(),

  });

  debitForm = new FormGroup({
    vendor_name: new FormControl(),
    date: new FormControl(),
    deb_acc_name: new FormControl(),
    payment_mode: new FormControl(),
    cheque_no: new FormControl(),
    amount: new FormControl(),
    bank_name: new FormControl(),
    description: new FormControl(),
  })

  vendorTransForm = new FormGroup({
    from_date: new FormControl(),
    to_date: new FormControl(),
    vendor_name: new FormControl(),
    credit_amnt: new FormControl(),
    debit_amnt: new FormControl(),
    balance: new FormControl(),
    ledger: new FormControl(),
    overall_balance: new FormControl(),
  });

  searchVendorCredit = new FormGroup({
    from: new FormControl(),
    to: new FormControl(),
    vendor_name: new FormControl(),
  })
  searchVendorDebit = new FormGroup({
    from: new FormControl(),
    to: new FormControl(),
    vendor_name: new FormControl(),
    payment_mode: new FormControl(),
  })



  constructor(private http: HttpClient, private stockService: StockService, private router: Router, private vendorService: VendorService) {
    this.vendorDatatableParameter = { from: '', to: '', vendor_name: '' }
    this.debitDatatableParameter = { from: '', to: '', vendor_name: '',payment_mode: '' }
  }

  ngOnInit(): void {
    this.creditDatatablecode();
    this.debitDatatablecode();
    this.getVendorsLists();

    this.vendorTransForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.updateLedgerState();
    });
  }



  updateLedgerState(): void {
    const { from_date, to_date, vendor_name } = this.vendorTransForm.value;

    this.isLedgerDisabled = !(from_date && to_date && vendor_name);
  }


  searchVenCredit() {

    const {
      from,
      to
    } = this.searchVendorCredit.value;

    if ((from && !to) || (!from && to)) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Required',
        text: 'Please select both From and To dates.'
      });
      return;
    }

    if (from && to && new Date(to) < new Date(from)) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Date Range',
        text: 'To date cannot be earlier than From date.'
      });
      return;
    }


    this.creditDatatablecode();
    this.reload('stock-credit');
  }

  resetVenCredit() {
    this.searchVendorCredit.get('from').setValue('');
    this.searchVendorCredit.get('to').setValue('');
    this.searchVendorCredit.get('vendor_name').setValue('');

    this.creditDatatablecode();
    this.reload('stock-credit');
  }

  searchVenDebit() {

    const {
      from,
      to
    } = this.searchVendorDebit.value;

    if ((from && !to) || (!from && to)) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Required',
        text: 'Please select both From and To dates.'
      });
      return;
    }

    if (from && to && new Date(to) < new Date(from)) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Date Range',
        text: 'To date cannot be earlier than From date.'
      });
      return;
    }


    this.debitDatatablecode();
    this.reload('stock-debit');
  }

  resetVenDebit() {
    this.searchVendorDebit.get('from').setValue('');
    this.searchVendorDebit.get('to').setValue('');
    this.searchVendorDebit.get('vendor_name').setValue('');
    this.searchVendorDebit.get('payment_mode').setValue('');

    this.debitDatatablecode();
    this.reload('stock-debit');
  }

  getVendorsLists() {
    let formData = new FormData();
    this.stockService.getVendorsLists(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.vendorLists = resp;
    });
  }

  creditDatatablecode() {
    this.vendorDatatableParameter.from = this.searchVendorCredit.get('from').value;
    this.vendorDatatableParameter.to = this.searchVendorCredit.get('to').value;
    this.vendorDatatableParameter.vendor_name = this.searchVendorCredit.get('vendor_name').value;

    const that = this;
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });
    this.dtOptions = {
      processing: true,
      serverSide: true,
      pageLength: 10,
      dom: 'lrtip',
      lengthMenu: [[5, 10, 25, 50, 300], [5, 10, 25, 50, 300]],
      columnDefs: [
        { orderable: false, targets: 5 },
      ],
      ajax: (dataTablesParameters: any, callback) => {
        that.http.post<DataTablesResponse>(environment.APIEndpoint + 'stock.fetchCreditData&reload=1', Object.assign(dataTablesParameters, this.vendorDatatableParameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {
          that.creditDataLists = resp.data;

          callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsTotal,
            data: []
          });
        });
      }
    }
  }

  debitDatatablecode() {
    this.debitDatatableParameter.from = this.searchVendorDebit.get('from').value;
    this.debitDatatableParameter.to = this.searchVendorDebit.get('to').value;
    this.debitDatatableParameter.vendor_name = this.searchVendorDebit.get('vendor_name').value;
    this.debitDatatableParameter.payment_mode = this.searchVendorDebit.get('payment_mode').value;

    const that = this;
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });
    this.dtOptions1 = {
      processing: true,
      serverSide: true,
      pageLength: 10,
      dom: 'lrtip',
      lengthMenu: [[5, 10, 25, 50, 300], [5, 10, 25, 50, 300]],
      columnDefs: [
        { orderable: false, targets: 5 },
      ],
      ajax: (dataTablesParameters: any, callback) => {
        that.http.post<DataTablesResponse>(environment.APIEndpoint + 'stock.fetchDebitData&reload=1', Object.assign(dataTablesParameters, this.debitDatatableParameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {
          that.debitDataLists = resp.data;

          callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsTotal,
            data: []
          });
        });
      }
    }
  }

  resetCreditForm() {
    this.creditForm.reset();
    this.creditForm.enable();
    this.isViewMode = false;
  }

  resetDebitForm() {
    this.debitForm.reset();
    this.debitForm.enable();
    this.isViewMode = false;
  }

  openAddCreditModal() {
    this.resetCreditForm();
  }

  openAddDebitModal() {
    this.resetDebitForm();
  }

  openViewCredit(credit_id: any) {
    this.isViewMode = true;

    let formData = new FormData();
    formData.append('credit_id', credit_id);

    this.stockService.viewCredit(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe(resp => {
        if (resp && resp.length > 0) {
          const data = resp[0];

          this.creditForm.patchValue({
            vendor_name: data.vendor_name,
            credit_date: data.credit_date,
            po_no: data.po_no,
            items: data.items,
            warehouse: data.to_warehouse,
            accepted_qty: data.accepted_qty,
            rate: data.rate,
            amount: data.credit_amount,
            remarks: data.remarks
          });

          this.creditForm.disable();   // view mode lock
        }
      });
  }

  openViewDebit(debit_id: any) {
    this.isViewMode = true;

    let formData = new FormData();
    formData.append('debit_id', debit_id);

    this.stockService.viewDebit(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe(resp => {
        if (resp && resp.length > 0) {
          const data = resp[0];

          this.debitForm.patchValue({
            vendor_name: data.vendor_name,
            date: data.date,
            cheque_no: data.cheque_no,
            payment_mode: data.payment_mode,
            deb_acc_name: data.acc_sub_head,
            amount: data.amount,
            bank_name: data.acc_bank_name,
            description: data.description,
          });

          this.debitForm.disable();   // view mode lock
        }
      });
  }

  onCreditModalClose() {
    this.resetCreditForm();
  }

  onDebitModalClose() {
    this.resetDebitForm();
  }

  goToStockInventory(credit_date: string, po_no: string) {
    this.router.navigate(
      ['/stock-inventory'],
      { queryParams: { credit_date, po_no } }
    );
  }

  resetGateEntry() {
    this.vendorTransForm.reset();

    // Optional: explicitly enable fields if you disabled them earlier
    this.vendorTransForm.get('credit_amnt')?.enable();
    this.vendorTransForm.get('debit_amnt')?.enable();
    this.vendorTransForm.get('balance')?.enable();
  }



  ngAfterViewInit(): void {
    this.dtTrigger.next();
    this.dtTrigger1.next();

  }

  reload(tableType: string) {
    if (tableType === 'stock-credit') {
      this.dtElement.toArray()[0].dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        this.dtTrigger.next(null);
      });
    }
    else if (tableType === 'stock-debit') {
      this.dtElement.toArray()[1].dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        this.dtTrigger1.next(null);
      });
    }
    else {
      this.dtElement.forEach((dtElement: DataTableDirective) => {
        dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.destroy();
        });
      });
      this.dtTrigger.next(null);
    }
  }

  onVendorSelect(event: Event) {
    const vendorName = (event.target as HTMLSelectElement).value;
    const from_date = this.vendorTransForm.get('from_date')?.value;
    const to_date = this.vendorTransForm.get('to_date')?.value;


    const formData = new FormData();
    formData.append('vendorName', vendorName);
    formData.append('from_date', from_date);
    formData.append('to_date', to_date);

    this.stockService.onVendorSelect(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe(resp => {
        this.vendorTransForm.patchValue({
          credit_amnt: this.formatINR(resp.credit_amount),
          debit_amnt: this.formatINR(resp.debit_amount),
          balance: this.formatINR(resp.balance),
          overall_balance: this.formatINR(resp.overall_balance)
        });

      });
  }


  onDateChange() {
    const vendorName = this.vendorTransForm.get('vendor_name')?.value;

    // If vendor already selected, re-trigger vendor logic
    if (vendorName) {
      const fakeEvent = {
        target: { value: vendorName }
      } as unknown as Event;

      this.onVendorSelect(fakeEvent);
    }
  }


  openVendorLedger(): void {
    if (this.isLedgerDisabled) return;

    const { from_date, to_date, vendor_name } = this.vendorTransForm.value;

    if (!from_date || !to_date) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please select both From Date and To Date'
      });
      return;
    }

    if (new Date(to_date) < new Date(from_date)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Date Range',
        text: 'To Date cannot be earlier than From Date'
      });
      return;
    }

    const loaderStartTime = Date.now();

    Swal.fire({
      title: 'Please wait',
      text: 'Fetching vendor ledger...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading()
    });


    const formData = new FormData();
    formData.append('from_date', from_date);
    formData.append('to_date', to_date);
    formData.append('vendor_name', vendor_name);

    this.vendorService.openVendorLedger(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resp) => {

          const elapsed = Date.now() - loaderStartTime;
          const remaining = Math.max(3000 - elapsed, 0);

          setTimeout(() => {

            if (!resp || !resp.ledger || resp.ledger.length === 0) {
              Swal.close();
              Swal.fire({
                icon: 'info',
                title: 'No Data Available',
                text: `No ledger data available for vendor "${vendor_name}" for the selected date range.`
              });
              return;
            }

            const ledgerData = this.buildLedger(resp.ledger);

            Swal.close();

            const ledgerWindow = window.open('', '_blank');
            ledgerWindow!.document.write(
              this.generateLedgerHTML(
                ledgerData,
                vendor_name,
                from_date,
                to_date,
                resp.opening_balance
              )
            );
            ledgerWindow!.document.close();

          }, remaining);
        },

        error: () => {
          Swal.close();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load vendor ledger. Please try again.'
          });
        }
      });
  }



  private buildLedger(rawList: any[]) {

    const map = new Map<string, any>();

    let grandCredit = 0;
    let grandDebit = 0;
    let location = '';

    rawList.forEach(txn => {

      if (!location && txn.location) {
        location = txn.location;
      }

      const date = new Date(txn.txn_date).toLocaleDateString('en-GB');

      if (!map.has(date)) {
        map.set(date, {
          date,
          credits: [],
          debits: [],
          creditTotal: 0,
          debitTotal: 0
        });
      }

      const day = map.get(date);
      const amount = this.toNumber(txn.amount);

      if (txn.entry_type === 'CREDIT' && amount > 0) {

        day.credits.push({
          item: txn.items || '',
          quantity: txn.quantity || '',
          units: txn.units || '',        // ✅ NEW
          rate: txn.rate || '',
          amount: amount
        });

        day.creditTotal += amount;
        grandCredit += amount;
      }

      if (txn.entry_type === 'DEBIT' && amount > 0) {

        day.debits.push({
          debited_account_name: txn.debited_account_name || '—',
          payment_mode: txn.payment_mode || 'Cash',
          bank_name: txn.bank_name || '',
          cheque_no: txn.cheque_no || '',
          amount: amount
        });

        day.debitTotal += amount;
        grandDebit += amount;
      }
    });

    return {
      location,
      days: Array.from(map.values()),
      grandCredit,
      grandDebit,
      balance: grandCredit - grandDebit
    };
  }



  private toNumber(value: any): number {
    if (value === null || value === undefined || value === '') return 0;
    return Number(String(value).replace(/,/g, '')) || 0;
  }



  private generateLedgerHTML(data: any, vendor: string, from: string, to: string, openingBalance: number): string {
    console.log(data);
    const inr = (val: number) =>
      `₹ ${Number(val || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Vendor Ledger</title>

      <style>
        body {
          font-family: Arial, sans-serif;
          font-size: 11px;
          margin: 12px;
          color: #000;
          user-select: none;
        }

        h2 { margin: 0 0 4px 0; font-size: 16px; }

        .header {
          margin-bottom: 8px;
          position: relative;
        }

        .download-btn {
          padding: 6px 12px;
          font-size: 12px;
          background: #1976d2;
          color: #fff;
          border: none;
          cursor: pointer;
          position: absolute;
          top: 0;
          right: 0;
        }

        .date-box {
          border: 1.5px solid #000;
          padding: 6px;
          margin-bottom: 10px;
        }

        .date-title {
          font-weight: bold;
          font-size: 12px;
          margin-bottom: 6px;
        }

        .row { display: flex; gap: 6px; }
        .col { flex: 1; }

        .credit-box { background: #f0f0f0; padding: 5px; }
        .debit-box { background: #f8f8f8; padding: 5px; }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10.5px;
        }

        th, td {
          border: 1px solid #000;
          padding: 2px 4px;
        }

        th { background: #e0e0e0; }
        .right { text-align: right; }
        .total { font-weight: bold; }

        @media print {
          .download-btn { display: none; }
        }
      </style>
    </head>

    <body>

    <div class="header">
      <button class="download-btn" onclick="window.print()">Download PDF</button>
      <h2>Vendor Ledger</h2>

      <div><b>Vendor:</b> ${vendor}</div>
      <div><b>Location:</b> ${data.location || '-'}</div>

      <div><b>Period:</b> ${from} to ${to}</div>
      <div><b>Opening Balance:</b> ${inr(openingBalance)}</div>
    </div>


    ${data.days.map((day: any) => `
      <div class="date-box">
        <div class="date-title">Date : ${day.date}</div>

        <div class="row">

          <div class="col credit-box">
            <table>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Units</th>
                <th>Rate</th>
                <th>Amount (₹)</th>
              </tr>

              ${day.credits.map((c: any) => `
                <tr>
                  <td>${c.item}</td>
                  <td class="right">${c.quantity}</td>
                  <td>${c.units || '-'}</td>
                  <td class="right">${c.rate}</td>
                  <td class="right">${inr(c.amount)}</td>
                </tr>
              `).join('')}
              <tr class="total">
                <td colspan="4">Total Credit</td>
                <td class="right">${inr(day.creditTotal)}</td>
              </tr>
            </table>
          </div>

          <div class="col debit-box">
            <table>
              <tr>
                <th>Account</th><th>Mode</th><th>Bank</th><th>Amount (₹)</th>
              </tr>
              ${day.debits.map((d: any) => `
                <tr>
                  <td>${d.debited_account_name}</td>
                  <td>
                    ${d.cheque_no
                    ? `Cheque / ${d.cheque_no}`
                    : d.payment_mode}
                  </td>
                  <td>${d.bank_name || '-'}</td>
                  <td class="right">${inr(d.amount)}</td>
                </tr>
              `).join('')}
              <tr class="total">
                <td colspan="3">Total Debit</td>
                <td class="right">${inr(day.debitTotal)}</td>
              </tr>
            </table>
          </div>

        </div>
      </div>
    `).join('')}

    <hr>

    <table>
      <tr>
        <td>Opening Balance</td>
        <td class="right">${inr(openingBalance)}</td>
      </tr>
      <tr>
        <td>Total Credit</td>
        <td class="right">${inr(data.grandCredit)}</td>
      </tr>
      <tr>
        <td>Total Debit</td>
        <td class="right">${inr(data.grandDebit)}</td>
      </tr>
      <tr class="total">
        <td>Closing Balance</td>
        <td class="right">
          ${inr(openingBalance + data.grandCredit - data.grandDebit)}
        </td>
      </tr>
    </table>

    </body>
    </html>
    `;
  }



  private formatINR(value: any): string {
    const num = Number(value || 0);
    return `₹ ${num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }



  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.dtTrigger1.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();

    if (this.dtElement && this.dtElement.dtInstance) {
      this.dtElement.dtInstance.then(dt => dt.destroy());
    }
  }

}


interface LedgerDay {
  date: string;
  credits: CreditTxn[];
  debits: DebitTxn[];
  creditTotal: number;
  debitTotal: number;
}

interface CreditTxn {
  item: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface DebitTxn {
  debited_account_name: string;
  payment_mode: string;
  bank_name?: string;
  cheque_no?: string;
  amount: number;
}
