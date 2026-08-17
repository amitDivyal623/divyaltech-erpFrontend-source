import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StockService } from 'src/app/services/stock.service';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { DatePipe } from '@angular/common';



@Component({
  selector: 'app-stock-add-grn',
  templateUrl: './stock-add-grn.component.html',
  styleUrls: ['./stock-add-grn.component.scss']
})
export class StockAddGrnComponent implements OnInit, OnDestroy {


  GENList: any[];
  itemTable: any[] = [];
  mode: any;
  grnId: any;
  userRole: string = '';
  canViewFinancials: boolean = false;
  canShowPayButton: boolean = false;

  pageTitle = 'ADD Goods Received Note';
  currentGrnNo: string = '';
  isSavingGRN: boolean = false;


  private destroy$ = new Subject<void>();
  private readonly decimalRequiredPattern = '^[0-9]*\\.?[0-9]+$';
  private readonly decimalOptionalPattern = '^([0-9]*\\.?[0-9]+)?$';


  GRNFormGrp = new FormGroup({
    grn_date: new FormControl('', Validators.required),
    gen_no: new FormControl('', Validators.required),

    bill_no: new FormControl({ value: '', disabled: true }),
    challan_no: new FormControl({ value: '', disabled: true }),
    vehcile_no: new FormControl({ value: '', disabled: true }),
    po_no: new FormControl({ value: '', disabled: true }),
    from_vendor: new FormControl({ value: '', disabled: true }),
    company_name: new FormControl({ value: '', disabled: true }),
    // rate: new FormControl({ value: '', disabled: true }),
    grand_total: new FormControl({ value: '', disabled: true }),
    to_warehouse: new FormControl({ value: '', disabled: true }),
    to_warehouse_id: new FormControl({ value: '', disabled: true }),
    requested_by: new FormControl({ value: '', disabled: true }),
    contact: new FormControl({ value: '', disabled: true }),
    remarks: new FormControl(),
    items: new FormArray([])
  });



  constructor(private stockService: StockService, private router: Router, private route: ActivatedRoute, private datePipe: DatePipe) { }

  ngOnInit(): void {
    this.fetchGenData();

    this.mode = this.route.snapshot.queryParamMap.get('mode');
    this.grnId = this.route.snapshot.paramMap.get('grn_id');
    if (this.grnId) {
      this.getGrnDetailsById(this.grnId);
      // this.pageTitle = 'View Goods Received Note';
    }

    const roleStr = (sessionStorage.getItem('UserRole') || '').toLowerCase();
    const roles = roleStr.split(',').map(r => r.trim());
    const allowedRoles = ['accountant', 'accounts internal', 'admin', 'administrator'];
    this.canViewFinancials = roles.some(r => allowedRoles.includes(r));
    this.canShowPayButton = roles.some(r => ['accountant', 'admin', 'administrator'].includes(r));

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getGrnDetailsById(grnId) {
    let formData = new FormData();
    formData.append('grn_id', grnId);

    this.stockService.getGrnDetailsById(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe(resp => {

        const d = resp.data?.[0];
        if (!d) return;

        this.currentGrnNo = d.grn_no || '';

        // Patch header fields
        this.GRNFormGrp.patchValue({
          grn_date: this.datePipe.transform(d.grn_date, 'yyyy-MM-dd'),
          bill_no: d.bill_no,
          challan_no: d.challan_no,
          vehcile_no: d.vehicle_no,
          po_no: d.po_no,
          from_vendor: d.from_vendor,
          company_name: d.company_name,
          // rate: d.rate,
          grand_total: d.grand_total,
          requested_by: d.requested_by,
          contact: d.contact,
          remarks: d.remarks,
          gen_no: d.gen_no,
          to_warehouse: d.to_warehouse,
        });

        const itemNames = (d.item_name || "").split(",");
        const descriptions = (d.item_description || "").split(",");
        const unitNames = (d.unit || "").split(",");
        const qtyList = (d.quantity || "").split(",");
        const receivedList = (d.received_qty || "").split(",");
        const shortList = (d.short_qty || "").split(",");
        const excessList = (d.excess_qty || "").split(",");
        const rejectedList = (d.rejected_qty || "").split(",");
        const acceptedList = (d.accepted_qty || "").split(",");
        const poBalanceList = (d.po_balance || "").split(",");
        const rateList = (d.rate || "").split(",");

        const discountList = (d.discount || "").split(",");
        const amountList = (d.amount || "").split(",");

        const itemsFA = this.GRNFormGrp.get('items') as FormArray;
        itemsFA.clear();

        itemNames.forEach((name, i) => {
          itemsFA.push(
            new FormGroup({
              item_name: new FormControl(name.trim()),
              item_description: new FormControl(descriptions[i] || ''),
              unit: new FormControl(unitNames[i] || ''),
              quantity: new FormControl(qtyList[i] || '0'),

              received_qty: new FormControl(receivedList[i] || '0'),
              short_qty: new FormControl(shortList[i] || '0'),
              excess_qty: new FormControl(excessList[i] || '0'),
              rejected_qty: new FormControl(rejectedList[i] || '0'),
              accepted: new FormControl(acceptedList[i] || '0'),
              po_balance: new FormControl(poBalanceList[i] || '0'),
              rate: new FormControl(rateList[i] || '0'),
              discount: new FormControl(discountList[i] || '0'),
              amount: new FormControl(amountList[i] || '0')
            })
          );
        });

        this.GRNFormGrp.disable();
        this.pageTitle = this.currentGrnNo ? `View Goods Received Note (${this.currentGrnNo}) ` : 'Add Goods Received Note';
      });

    this.recalcGrandTotal();

  }


  createItemRow(item: string, qty: string): FormGroup {
    return new FormGroup({
      item_name: new FormControl(item),
      item_description: new FormControl(''),
      quantity: new FormControl(qty),

      received_qty: new FormControl('', [Validators.required, Validators.pattern(this.decimalRequiredPattern)]),
      short_qty: new FormControl(''),
      excess_qty: new FormControl(''),
      accepted: new FormControl('', [Validators.required, Validators.pattern(this.decimalRequiredPattern)]),
      rate: new FormControl(''),
      amount: new FormControl(''),
      discount: new FormControl(''),
      // grand_total: new FormControl(''),
    });
  }


  fetchGenData() {
    let formData = new FormData();
    this.stockService.fetchGenData(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.GENList = resp.data
    });
  }

  onGenSelect(gen_no: any) {

    if (!gen_no) {
      return;
    }

    let formData = new FormData();
    formData.append('gen_id', gen_no);

    this.stockService.fetchGENByName(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe(resp => {
        const d = resp.data?.[0];
        if (!d) return;

        // Patch top section fields
        this.GRNFormGrp.patchValue({
          bill_no: d.bill_no,
          challan_no: d.challan_no,
          vehcile_no: d.vehicle_no,
          po_no: d.selected_po,
          from_vendor: d.from_vendor,
          company_name: d.company_name,
          // rate: d.rate,
          grand_total: d.grand_total,
          to_warehouse: d.to_warehouse,
          to_warehouse_id: d.to_warehouse_id,
          requested_by: d.requested_by_name,
          contact: d.contact
        });

        // Parse item names + quantities
        const items = d.item_name?.split(',') || [];
        const descriptions = d.item_description?.split(',') || [];
        const qty = d.quantity?.split(',') || [];
        const itemIds = d.item_id?.split(',') || [];
        const groupIds = d.group_id?.split(',') || [];
        const subGroupIds = d.sub_group_id?.split(',') || [];
        const units = d.unit?.split(',') || [];
        const rates = d.rate?.split(',') || [];
        const amounts = d.amount?.split(',') || [];

        const itemsFA = this.GRNFormGrp.get('items') as FormArray;
        itemsFA.clear(); // remove old rows

        // Create rows with new controls (including rejected_qty and po_balance)
        items.forEach((item, index) => {
          itemsFA.push(
            new FormGroup({
              item_id: new FormControl(itemIds[index] || ''),
              group_id: new FormControl(groupIds[index] || ''),
              sub_group_id: new FormControl(subGroupIds[index] || ''),
              unit: new FormControl(units[index] || ''),
              item_name: new FormControl(item.trim()),
              item_description: new FormControl(descriptions[index] || ''),
              quantity: new FormControl(qty[index] ? qty[index].trim() : ''),

              // editable by user
              received_qty: new FormControl('', [Validators.required, Validators.pattern(this.decimalRequiredPattern)]),
              // short & excess are disabled (computed)
              short_qty: new FormControl({ value: '', disabled: true }),
              excess_qty: new FormControl({ value: '', disabled: true }),

              // rejected is editable numeric
              rejected_qty: new FormControl('',  [Validators.pattern(this.decimalOptionalPattern)]),

              // accepted editable numeric
              accepted: new FormControl('', [Validators.required, Validators.pattern(this.decimalRequiredPattern)]),

              // po_balance computed (disabled)
              po_balance: new FormControl({ value: '', disabled: true }),

              rate: new FormControl(rates[index] ? rates[index].trim() : '', [Validators.pattern('^[0-9]*$')]),
              discount: new FormControl('', [Validators.pattern('^[0-9]*$')]),

              // amount disabled (computed later)
              amount: new FormControl({ value: amounts[index] ? amounts[index].trim() : '', disabled: true })
            })
          );
        });

      });
  }


  allowDecimalNumbers(event: KeyboardEvent) {
    const key = event.key;
    if (key.length !== 1) {
      return;
    }

    const input = event.target as HTMLInputElement | null;
    const value = input?.value ?? '';
    const selectionStart = input?.selectionStart ?? value.length;
    const selectionEnd = input?.selectionEnd ?? value.length;
    const nextValue = value.slice(0, selectionStart) + key + value.slice(selectionEnd);

    if (!/^[0-9]*\.?[0-9]*$/.test(nextValue)) {
      event.preventDefault();
    }
  }

  // numeric-only keypress filter
  allowOnlyNumbers(event: KeyboardEvent) {
    const key = event.key;
    if (key.length !== 1) {
      return;
    }

    if (!/^[0-9]$/.test(key)) {
      event.preventDefault();
    }
  }

  // Called when received_qty changes
  onReceivedQtyChange(index: number) {
    const itemsFA = this.GRNFormGrp.get('items') as FormArray;
    const row = itemsFA.at(index) as FormGroup;

    const qty = Number(row.get('quantity')?.value) || 0;
    const received = Number(row.get('received_qty')?.value) || 0;
    const rejected = Number(row.get('rejected_qty')?.value) || 0;

    // short/excess logic
    if (received > qty) {
      row.get('excess_qty')?.setValue(received - qty);
      row.get('short_qty')?.setValue(0);
    } else if (received < qty) {
      row.get('short_qty')?.setValue(qty - received);
      row.get('excess_qty')?.setValue(0);
    } else {
      row.get('short_qty')?.setValue(0);
      row.get('excess_qty')?.setValue(0);
    }

    // Accepted = received - rejected
    const accepted = Math.max(0, received - rejected);
    row.get('accepted')?.setValue(accepted);

    // PO Balance = received - accepted
    const poBalance = Math.max(0, qty - accepted);
    row.get('po_balance')?.setValue(poBalance);

    this.onRateOrDiscountChange(index);

  }


  onRejectedQtyChange(index: number) {
    const itemsFA = this.GRNFormGrp.get('items') as FormArray;
    const row = itemsFA.at(index) as FormGroup;

    const qty = Number(row.get('quantity')?.value) || 0;
    const received = Number(row.get('received_qty')?.value) || 0;
    const rejected = Number(row.get('rejected_qty')?.value) || 0;

    // Accepted = received - rejected
    const accepted = Math.max(0, received - rejected);
    row.get('accepted')?.setValue(accepted);

    // PO Balance = received - accepted
    const poBalance = Math.max(0, qty - accepted);
    row.get('po_balance')?.setValue(poBalance);

    this.onRateOrDiscountChange(index);

  }


  // Called when accepted changes
  onAcceptedChange(index: number) {
    this.updatePoBalance(index);
    this.onRateOrDiscountChange(index);
  }

  // compute and set po_balance = max(0, quantity - accepted)
  private updatePoBalance(index: number) {
    const itemsFA = this.GRNFormGrp.get('items') as FormArray;
    const row = itemsFA.at(index) as FormGroup;

    const qty = Number(row.get('quantity')?.value) || 0;
    const accepted = Number(row.get('accepted')?.value) || 0;

    const balance = Math.max(0, qty - accepted);
    row.get('po_balance')?.setValue(balance);
  }


  onRateOrDiscountChange(index: number) {
    const itemsFA = this.GRNFormGrp.get('items') as FormArray;
    const row = itemsFA.at(index) as FormGroup;

    const accepted = Number(row.get('accepted')?.value) || 0;
    const rate = Number(row.get('rate')?.value) || 0;
    const discount = Number(row.get('discount')?.value) || 0;
    // amount = (accepted * rate) - discount
    const amount = (accepted * rate) - discount;

    row.get('amount')?.setValue(amount >= 0 ? amount : 0); // no negative amount
    this.recalcGrandTotal();
  }

  onBack() {

    // 1. Clear all main GRN form fields (including disabled ones)
    this.GRNFormGrp.reset();

    // 2. Clear items FormArray completely
    const itemsFA = this.GRNFormGrp.get('items') as FormArray;
    if (itemsFA && itemsFA.length > 0) {
      itemsFA.clear();
    }

    // 3. Clear any API-loaded lists
    this.GENList = [];
    this.itemTable = [];

    // 4. Complete the destroy$ subject to auto-unsubscribe
    this.destroy$.next();
    this.destroy$.complete();

    // 5. Navigate back
    this.router.navigate(['stock-goods-received-notes']);
  }

  markAllItemFieldsTouched() {
    const itemsFA = this.GRNFormGrp.get('items') as FormArray;
    itemsFA.controls.forEach((row: any) => {
      row.get('received_qty')?.markAsTouched();
      row.get('accepted')?.markAsTouched();
    });
  }


  onSaveGRN() {

    if (this.isSavingGRN) {
      return;
    }
    this.GRNFormGrp.get('grn_date')?.markAsTouched();
    this.GRNFormGrp.get('gen_no')?.markAsTouched();
    this.markAllItemFieldsTouched(); // mark table fields

    // --- Build validation message dynamically ---
    let validationMsg = '';

    if (this.GRNFormGrp.get('grn_date')?.invalid) {
      validationMsg += '• Date is required.<br>';
    }
    if (this.GRNFormGrp.get('gen_no')?.invalid) {
      validationMsg += '• GE Number is required.<br>';
    }

    // check table rows
    const itemsFA = this.GRNFormGrp.get('items') as FormArray;

    itemsFA.controls.forEach((row, index) => {
      const itemName = row.get('item_name')?.value || `Item ${index + 1}`;

      if (row.get('received_qty')?.invalid) {
        validationMsg += `• Received Qty is required for Item <b>${itemName}</b>.<br>`;
      }
      if (row.get('accepted')?.invalid) {
        validationMsg += `• Accepted Qty is required for Item <b>${itemName}</b>.<br>`;
      }

    });

    // If any validation failed → show Swal message
    if (validationMsg !== '') {
      Swal.fire({
        icon: 'warning',
        title: 'Required Fields Missing',
        html: validationMsg,
        confirmButtonColor: '#3085d6'
      });
      return;
    }
    this.isSavingGRN = true;

    const formValues = this.GRNFormGrp.getRawValue(); // includes disabled fields
    const fd = new FormData();

    // Append main GRN fields
    fd.append('grn_date', formValues.grn_date || '');
    fd.append('gen_no', formValues.gen_no || '');
    fd.append('bill_no', formValues.bill_no || '');
    fd.append('challan_no', formValues.challan_no || '');
    fd.append('vehcile_no', formValues.vehcile_no || '');
    fd.append('po_no', formValues.po_no || '');
    fd.append('from_vendor', formValues.from_vendor || '');
    fd.append('company_name', formValues.company_name || '');
    // fd.append('rate', formValues.rate || '');
    fd.append('grand_total', formValues.grand_total || '');
    fd.append('to_warehouse', formValues.to_warehouse || '');
    fd.append('to_warehouse_id', formValues.to_warehouse_id || '');
    fd.append('requested_by', formValues.requested_by || '');
    fd.append('contact', formValues.contact || '');
    fd.append('remarks', formValues.remarks || '');

    const items = formValues.items || [];

    const itemNames = items.map((x: any) => this.safeString(x.item_name)).join(',');
    const quantities = items.map((x: any) => this.safeNumeric(x.quantity)).join(',');
    const receivedQty = items.map((x: any) => this.safeNumeric(x.received_qty)).join(',');
    const shortQty = items.map((x: any) => this.safeNumeric(x.short_qty)).join(',');
    const excessQty = items.map((x: any) => this.safeNumeric(x.excess_qty)).join(',');
    const rejectedQty = items.map((x: any) => this.safeNumeric(x.rejected_qty)).join(',');
    const acceptedQty = items.map((x: any) => this.safeNumeric(x.accepted)).join(',');
    const poBalance = items.map((x: any) => this.safeNumeric(x.po_balance)).join(',');
    const rate = items.map((x: any) => this.safeNumeric(x.rate)).join(',');
    const discount = items.map((x: any) => this.safeNumeric(x.discount)).join(',');
    const amount = items.map((x: any) => this.safeNumeric(x.amount)).join(',');

    const itemIds = items.map((x: any) => this.safeString(x.item_id)).join(',');
    const groupIds = items.map((x: any) => this.safeString(x.group_id)).join(',');
    const subGroupIds = items.map((x: any) => this.safeString(x.sub_group_id)).join(',');
    const units = items.map((x: any) => this.safeString(x.unit)).join(',');
    const descriptions = items.map((x:any) => this.safeString(x.item_description)).join(',');

    fd.append('item_names', itemNames);
    fd.append('quantities', quantities);
    fd.append('received_qty', receivedQty);
    fd.append('short_qty', shortQty);
    fd.append('excess_qty', excessQty);
    fd.append('rejected_qty', rejectedQty);
    fd.append('accepted_qty', acceptedQty);
    fd.append('po_balance', poBalance);
    fd.append('rate', rate);
    fd.append('discount', discount);
    fd.append('amount', amount);

    fd.append('item_id', itemIds);
    fd.append('group_id', groupIds);
    fd.append('sub_group_id', subGroupIds);
    fd.append('unit', units);
    fd.append('item_description', descriptions);

    this.stockService.saveGRN(fd).pipe(takeUntil(this.destroy$)).subscribe({
      next: (resp) => {

        const grnNo = resp?.grn_no || null;

        if (grnNo) {
          Swal.fire({
            icon: 'success',
            title: 'GRN Saved Successfully!',
            html: `<strong>Your GRN No is:</strong> <br> <h3>${grnNo}</h3>`,
            confirmButtonColor: '#28a745'
          }).then(() => {

            this.GRNFormGrp.reset();
            const itemsFA = this.GRNFormGrp.get('items') as FormArray;
            itemsFA.clear();
            this.GENList = [];
            this.itemTable = [];

            //  No need to unlock because we navigate
            this.router.navigate(['stock-goods-received-notes']);
          });
        }
      },

      error: () => {
        //  CHANGE #3: Unlock if API fails
        this.isSavingGRN = false;

        Swal.fire('Error', 'Failed to save GRN. Try again.', 'error');
      }
    });
  }

  // Replace existing safeValue(...) with these two helpers

  private safeNumeric(value: any): string {
    // Trim strings, treat empty as zero. If numeric string -> keep numeric string.
    if (value === null || value === undefined) return '0';
    const s = String(value).trim();
    if (s === '') return '0';
    // If it's a valid number (integer), keep as-is; otherwise return '0'
    // Accept numeric strings like "0", "10", "500"
    return !isNaN(Number(s)) ? s : '0';
  }

  private safeString(value: any): string {
    // For textual fields (item_name) — return trimmed string or '0' if blank
    if (value === null || value === undefined) return '0';
    const s = String(value).trim();
    return s === '' ? '0' : s;
  }

  redirectToTransaction() {
    const grnDate = this.GRNFormGrp.get('grn_date').value;
    const vendorName = this.GRNFormGrp.get('from_vendor').value;
    const billNumber = this.GRNFormGrp.get('bill_no')?.value;
    const challanNumber = this.GRNFormGrp.get('challan_no')?.value;
    const remarks = this.GRNFormGrp.get('remarks')?.value;
    const amount = this.GRNFormGrp.get('grand_total')?.value;
    const po_no = this.GRNFormGrp.get('po_no')?.value;

    const docType = billNumber ? 'bill_no' : 'challan_no';
    const docNumber = billNumber || challanNumber; // only one will exist

    this.router.navigate(
      ['/reg-trans-list'],
      {
        queryParams: {
          tab: 'expense',
          openModal: 'add',
          vendorName: vendorName,
          docType: docType,
          docNumber: docNumber,
          description: remarks,
          fromDate: grnDate,
          amount: amount,
          po_no: po_no,
          toDate: grnDate   // same date for single-day filter
        }
      }
    );
  }


  private recalcGrandTotal() {
    const itemsFA = this.GRNFormGrp.get('items') as FormArray;
    let total = 0;

    itemsFA.controls.forEach((row: FormGroup) => {
      total += Number(row.get('amount')?.value) || 0;
    });

    this.GRNFormGrp.get('grand_total')?.setValue(total.toFixed(2), { emitEvent: false });
  }


}
