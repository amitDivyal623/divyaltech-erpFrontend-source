import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ProjectService } from 'src/app/services/project.service';
import { StockService } from 'src/app/services/stock.service';
import { CrmService } from 'src/app/services/crm.service';
import Swal from 'sweetalert2';
import { Router, ActivatedRoute } from '@angular/router';
import { NotificationService } from 'src/app/services/notification.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-stock-add-rent-item-gate-pass',
  templateUrl: './stock-add-rent-item-gate-pass.component.html',
  styleUrls: ['./stock-add-rent-item-gate-pass.component.scss']
})
export class StockAddRentItemGatePassComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  rentForm!: FormGroup;

  categoryLists: any[][] = [];
  subcategoryLists: any[] = [];
  materialsList: any[] = [];
  projectsList: any[] = [];

  warehouseList: any[] = [];
  rentedItemsLists: any[] = [];

  filteredSubcategories: any[][] = [];
  filteredItems: any[][] = [];
  isSaveDisabled = false;
  gate_pass_id: any = '';
  item_row_id: any = '';
  actionType: any = '';
  isViewMode = false;
  isEditMode = false;
  isEditPatch = false

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private crmService: CrmService,
    private stockService: StockService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.rentForm = this.fb.group({
      gate_pass_id: [''],
      issueDate: ['', Validators.required],
      issueTime: ['', Validators.required],
      gatePass: ['', Validators.required],
      projectName: [''],
      notes: [''],
      items: this.fb.array([this.createItem()])
    });

    this.getData();
    this.getProjectLists();

    this.activatedRoute.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {

      this.gate_pass_id = params['gate_pass_id'] || '';
      this.item_row_id = params['item_row_id'] || '';
      this.actionType = params['action'] || '';
      this.isViewMode = this.actionType === 'view';
      this.isEditMode = this.actionType === 'edit';

      if (this.gate_pass_id && this.item_row_id) {

        this.getRentGatePassEditData();

      }

    });
  }

  getRentGatePassEditData() {

    let formData = new FormData();

    formData.append('gate_pass_id', this.gate_pass_id);

    this.stockService.getRentGatePassEditData(formData).pipe(takeUntil(this.destroy$)).subscribe((resp: any) => {
      console.log(resp);
      if (!resp || resp.length === 0) {
        return;
      }

      const header = resp[0];

      // ================= HEADER PATCH =================

      const issueDateTime = new Date(header.issue_datetime);

      const issueDate = issueDateTime.toISOString().split('T')[0];

      const issueTime =
        issueDateTime.getHours().toString().padStart(2, '0') +
        ':' +
        issueDateTime.getMinutes().toString().padStart(2, '0');

      this.rentForm.patchValue({
        gate_pass_id: header.gate_pass_id,
        issueDate: issueDate,
        issueTime: issueTime,
        gatePass: header.gate_pass_no,
        projectName: header.project_id,
        notes: header.notes
      });

      // ================= CLEAR ITEMS =================

      this.items.clear();

      // ================= ITEMS =================

      resp.forEach((row: any, index: number) => {

        const itemGroup = this.createItem();

        // ================= PATCH ITEM =================

        itemGroup.patchValue({

          item_row_id: row.item_row_id,

          fromWarehouse: row.warehouse_id,

          category: row.groupid,

          subCategory: row.subgroupid,

          item: row.item_id,

          currentQty: row.current_qty,

          issuedQty: row.issued_qty,

          receivedQty: row.total_received_qty,

          balanceQty: row.balance_qty

        });

        // ================= ENABLE TEMPORARY =================

        itemGroup.get('category')?.enable({ emitEvent: false });
        itemGroup.get('subCategory')?.enable({ emitEvent: false });
        itemGroup.get('item')?.enable({ emitEvent: false });

        // ================= PUSH FIRST =================

        this.items.push(itemGroup);

        // ================= FILTER DATA =================
        this.onWarehouseChange(index, true);

        this.onCategoryChange(index, true);

        this.onSubCategoryChange(index, true);

        // ================= PATCH AGAIN =================

        itemGroup.patchValue({

          fromWarehouse: row.warehouse_id,

          category: row.groupid,

          subCategory: row.subgroupid,

          item: row.item_id

        });

        // ================= DISABLE ITEM FIELDS =================

        itemGroup.get('fromWarehouse')?.disable();
        itemGroup.get('category')?.disable();
        itemGroup.get('subCategory')?.disable();
        itemGroup.get('item')?.disable();
        itemGroup.get('currentQty')?.disable();
        itemGroup.get('issuedQty')?.disable();
        itemGroup.get('receivedQty')?.disable();
        itemGroup.get('balanceQty')?.disable();

        // ================= RECEIPTS =================

        const receiptIds =
          row.receipt_ids ? row.receipt_ids.split(',') : [];

        const receiptDates =
          row.received_dates ? row.received_dates.split(',') : [];

        const receiptQtys =
          row.received_qtys ? row.received_qtys.split(',') : [];

        const receiptsArray = itemGroup.get('receipts') as FormArray;

        receiptIds.forEach((r: any, rIndex: number) => {

          const receiptGroup = this.createReceipt();

          receiptGroup.patchValue({

            receipt_id: receiptIds[rIndex],

            receivedAt: receiptDates[rIndex],

            receivedQty: receiptQtys[rIndex]

          });

          // existing receipt fields disabled
          receiptGroup.disable();

          receiptsArray.push(receiptGroup);

        });

        // this.items.push(itemGroup);

      });

      // ================= VIEW MODE =================

      if (this.isViewMode) {

        this.rentForm.disable();

      }

      // ================= EDIT MODE =================

      if (this.isEditMode) {

        // enable only header fields

        this.rentForm.get('issueDate')?.disable();
        this.rentForm.get('issueTime')?.disable();
        this.rentForm.get('gatePass')?.disable();
        this.rentForm.get('projectName')?.disable();
        this.rentForm.get('notes')?.disable();

      }

    });

  }

  // ================= FORM =================
  get items(): FormArray {
    return this.rentForm.get('items') as FormArray;
  }

  getReceipts(i: number): FormArray {
    return this.items.at(i).get('receipts') as FormArray;
  }

  createItem(): FormGroup {
    return this.fb.group({
      item_row_id: [''],
      fromWarehouse: [null, Validators.required],
      category: [{ value: null, disabled: true }, Validators.required],
      subCategory: [{ value: null, disabled: true }, Validators.required],
      item: [{ value: null, disabled: true }, Validators.required],
      currentQty: [{ value: 0, disabled: true }],
      issuedQty: [0, Validators.required],
      receivedQty: [{ value: 0, disabled: true }],
      balanceQty: [{ value: 0, disabled: true }],
      receipts: this.fb.array([])
    });
  }

  createReceipt(): FormGroup {
    return this.fb.group({
      receipt_id: [''],
      receivedAt: [this.getCurrentDateTime(), Validators.required],
      receivedQty: ['', Validators.required]
    });
  }

  getCurrentDateTime(): string {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  // ================= ADD / REMOVE =================
  addItem() {
    this.items.insert(0, this.createItem());

    // optional: refresh to maintain consistency
    this.refreshAllItemFilters();
  }

  removeItem(i: number) {
    this.items.removeAt(i);

    //  refresh all filters after removal
    this.refreshAllItemFilters();
  }

  addReceipt(i: number) {

    const receipt = this.createReceipt();

    // new manually added receipt should be editable
    receipt.enable();

    this.getReceipts(i).push(receipt);

  }

  canAddReceipt(i: number): boolean {

    const issued =+ this.items.at(i).get('issuedQty')?.value || 0;

    const received =+ this.items.at(i).get('receivedQty')?.value || 0;

    return received < issued;

  }

  removeReceipt(i: number, j: number) {
    this.getReceipts(i).removeAt(j);
    this.calculateTotals(i);
  }

  // ================= DATA =================
  getData() {

    if (this.isSaveDisabled) return; // prevent double submit
    this.isSaveDisabled = true;

    this.stockService.getAllrentedItemsLists(new FormData()).pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.rentedItemsLists = res || [];
      //  Unique warehouses
      this.warehouseList = this.getUnique(this.rentedItemsLists, 'warehouse_id', 'warehouse_name');
      this.isSaveDisabled = false;
      return;
    });

  }

  getUnique(data: any[], valueKey: string, labelKey: string) {
    const map = new Map();

    data.forEach(item => {
      map.set(item[valueKey], {
        id: item[valueKey],
        name: item[labelKey]
      });
    });

    return Array.from(map.values());
  }

  // ================= FILTER =================

  onWarehouseChange(i: number, isEditPatch = false) {

    const row = this.items.at(i);
    const warehouse = row.get('fromWarehouse')?.value;

    if (warehouse) {
      row.get('category')?.enable();
      row.get('subCategory')?.enable();
      row.get('item')?.enable();
    } else {
      row.get('category')?.disable();
      row.get('subCategory')?.disable();
      row.get('item')?.disable();
    }

    const filtered = this.rentedItemsLists.filter(
      x => x.warehouse_id === warehouse
    );

    //  categories (same as before)
    // this.categoryLists = this.getUnique(filtered, 'groupid', 'groupname');
    this.categoryLists[i] = this.getUnique(filtered, 'groupid', 'groupname');

    //  NEW: show all items directly
    this.filteredItems[i] = filtered.map(x => ({
      item_id: x.master_item_id,
      item: x.itemname,
      groupid: x.groupid,
      subgroupid: x.subgroupid,
      current_balance: x.current_balance
    }));

    this.filteredSubcategories[i] = [];

    if (!isEditPatch) {

      this.items.at(i).patchValue({
        category: null,
        subCategory: null,
        item: null
      });

    }
  }

  onCategoryChange(i: number, isEditPatch = false) {
    const warehouse = this.items.at(i).get('fromWarehouse')?.value;
    const category = this.items.at(i).get('category')?.value;

    const filtered = this.rentedItemsLists.filter(
      x => x.warehouse_id === warehouse && x.groupid === category
    );

    this.filteredSubcategories[i] = this.getUnique(
      filtered,
      'subgroupid',
      'subgroupname'
    );

    this.filteredItems[i] = [];

    if (!isEditPatch) {

      this.items.at(i).patchValue({
        subCategory: null,
        item: null
      });

    }
  }

  onSubCategoryChange(i: number, isEditPatch = false) {
    const warehouse = this.items.at(i).get('fromWarehouse')?.value;
    const category = this.items.at(i).get('category')?.value;
    const sub = this.items.at(i).get('subCategory')?.value;

    const selectedItems = this.getSelectedItemIds();

    this.filteredItems[i] = this.rentedItemsLists
      .filter(x =>
        x.warehouse_id === warehouse &&
        x.groupid === category &&
        x.subgroupid === sub &&
        (
          !selectedItems.includes(x.master_item_id) ||
          this.items.at(i).get('item')?.value === x.master_item_id // allow current row value
        )
      )
      .map(x => ({
        item_id: x.master_item_id,
        item: x.itemname,
        current_balance: x.current_balance
      }));
  }

  onItemChange(i: number) {
    const itemId = this.items.at(i).get('item')?.value;

    const selected = this.rentedItemsLists.find(
      x => x.master_item_id === itemId
    );

    if (selected) {

      //  Auto-fill category & subcategory
      this.items.at(i).patchValue({
        category: selected.groupid,
        subCategory: selected.subgroupid,
        currentQty: selected.current_balance || 0
      });

      //  Update subcategory dropdown
      const warehouse = this.items.at(i).get('fromWarehouse')?.value;

      const subFiltered = this.rentedItemsLists.filter(
        x => x.warehouse_id === warehouse && x.groupid === selected.groupid
      );

      this.filteredSubcategories[i] = this.getUnique(
        subFiltered,
        'subgroupid',
        'subgroupname'
      );

      //  Update items again (respect duplicate prevention)
      this.onSubCategoryChange(i);
    }

    this.calculateTotals(i);

    // refresh duplicate logic
    this.refreshAllItemFilters();
  }


  refreshAllItemFilters() {
    this.items.controls.forEach((_, index) => {
      const sub = this.items.at(index).get('subCategory')?.value;
      if (sub) {
        this.onSubCategoryChange(index);
      }
    });
  }

  // ================= CALCULATIONS =================
  onIssuedChange(i: number) {
    const row = this.items.at(i);

    let issued = Number(row.get('issuedQty')?.value || 0);
    const current = Number(row.get('currentQty')?.value || 0);

    if (issued > current) issued = current;

    row.patchValue({ issuedQty: issued }, { emitEvent: false });

    this.calculateTotals(i);
  }

  onReceiptChange(i: number, j: number) {
    const receiptsArray = this.getReceipts(i);
    const row = this.items.at(i);

    const issued = Number(row.get('issuedQty')?.value || 0);

    let otherSum = 0;

    receiptsArray.controls.forEach((ctrl, index) => {
      if (index !== j) {
        otherSum += Number(ctrl.get('receivedQty')?.value || 0);
      }
    });

    const currentControl = receiptsArray.at(j).get('receivedQty');

    let currentValue = Number(currentControl?.value || 0);

    const maxAllowed = issued - otherSum;

    //  silent restriction
    if (currentValue > maxAllowed) {
      currentValue = maxAllowed < 0 ? 0 : maxAllowed;

      currentControl?.setValue(currentValue, { emitEvent: false });
    }

    // update totals
    this.calculateTotals(i);
  }

  calculateTotals(i: number) {
    const row = this.items.at(i);

    const current = Number(row.get('currentQty')?.value || 0);
    const issued = Number(row.get('issuedQty')?.value || 0);

    const receipts = this.getReceipts(i).getRawValue();

    let totalReceived = receipts.reduce(
      (sum: number, r: any) => sum + Number(r.receivedQty || 0),
      0
    );

    // optional safety: received should not exceed issued
    if (totalReceived > issued) {
      totalReceived = issued;
    }

    const balance = (current - issued) + totalReceived;

    row.patchValue({
      receivedQty: totalReceived,
      balanceQty: balance
    }, { emitEvent: false });
  }


  getFirstError(): string {

    //  Header fields
    if (this.rentForm.get('issueDate')?.invalid) return 'Issue Date is required';
    if (this.rentForm.get('issueTime')?.invalid) return 'Issue Time is required';
    if (this.rentForm.get('gatePass')?.invalid) return 'Gate Pass is required';
    // if (this.rentForm.get('projectName')?.invalid) return 'Project is required';

    //  Items array
    for (let i = 0; i < this.items.length; i++) {
      const row = this.items.at(i);

      if (row.get('fromWarehouse')?.invalid) return `Row ${i + 1}: Warehouse is required`;
      if (row.get('category')?.invalid) return `Row ${i + 1}: Category is required`;
      if (row.get('subCategory')?.invalid) return `Row ${i + 1}: Sub Category is required`;
      if (row.get('item')?.invalid) return `Row ${i + 1}: Item is required`;
      if (row.get('issuedQty')?.invalid) return `Row ${i + 1}: Issued Qty is required`;

      //  Receipts
      const receipts = this.getReceipts(i);
      for (let j = 0; j < receipts.length; j++) {
        const r = receipts.at(j);

        if (r.get('receivedAt')?.invalid) {
          return `Row ${i + 1}, Receipt ${j + 1}: Date is required`;
        }

        if (r.get('receivedQty')?.invalid) {
          return `Row ${i + 1}, Receipt ${j + 1}: Qty is required`;
        }
      }
    }

    return 'Please fill all required fields';
  }


  getSelectedItemIds(): string[] {
    return this.items.controls
      .map(ctrl => ctrl.get('item')?.value)
      .filter(val => val); // remove null/undefined
  }

  isFieldInvalid(control: any, field: string): boolean {
    return control.get(field)?.invalid && (control.get(field)?.touched || control.get(field)?.dirty);
  }

  getProjectLists() {
    this.projectService.getAllProjectsLists(new FormData()).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.projectsList = resp.data;
    });
  }


  buildPayload() {
    const raw = this.rentForm.getRawValue();

    return {
      gate_pass_id: raw.gate_pass_id || '', // for edit mode

      issueDate: raw.issueDate,
      issueTime: raw.issueTime,
      gatePass: raw.gatePass,
      projectName: raw.projectName,
      notes: raw.notes,

      items: raw.items.map((item: any) => ({
        item_row_id: item.item_row_id || '',

        fromWarehouse: item.fromWarehouse,
        category: item.category,
        subCategory: item.subCategory,
        item: item.item,

        currentQty: Number(item.currentQty || 0),
        issuedQty: Number(item.issuedQty || 0),
        receivedQty: Number(item.receivedQty || 0),
        balanceQty: Number(item.balanceQty || 0),

        receipts: (item.receipts || []).map((r: any) => ({
          receipt_id: r.receipt_id || '',
          receivedAt: r.receivedAt,
          receivedQty: Number(r.receivedQty || 0)
        }))
      }))
    };
  }


  // ================= SAVE =================
  save() {

    if (this.items.length === 0) {

      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'At least one item is required'
      }).then(() => {
        this.isSaveDisabled = false;
      });
      return;
    }

    if (this.rentForm.invalid) {
      this.rentForm.markAllAsTouched();

      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: this.getFirstError()
      }).then(() => {
        this.isSaveDisabled = false;
      });
      return;
    }
    this.isSaveDisabled = true;
    const raw = this.rentForm.getRawValue();

    //  enrich items with item_name
    const items = raw.items.map((item: any, i: number) => {

      const selectedItem = (this.filteredItems[i] || [])
        .find((x: any) => x.item_id === item.item);

      return {
        ...item,

        item_id: item.item, // rename for backend clarity
        item_name: selectedItem ? selectedItem.item : '' //  add name
      };
    });

    let formData = new FormData();

    //  HEADER
    formData.append('gate_pass_id', raw.gate_pass_id || '');
    formData.append('issueDate', raw.issueDate);
    formData.append('issueTime', raw.issueTime);
    formData.append('gatePass', raw.gatePass);
    formData.append('projectName', raw.projectName);
    formData.append('notes', raw.notes || '');

    //  ITEMS (with item_name)
    formData.append('items', JSON.stringify(items));

    this.stockService.saveRentgatePass(formData).pipe(takeUntil(this.destroy$)).subscribe({
      next: (resp: any) => {
        Swal.fire({
          icon: 'success',
          title: 'Saved',
          text: 'Rent item gate pass saved successfully',
          confirmButtonText: 'OK'
        }).then(() => {
          // After success, navigate back to gate pass list and open rent item tab
          this.notificationService.triggerFollowupRefresh();
          this.router.navigate(['stock-gate-pass'], { queryParams: { tab: 'rentItemGatePass' } });
        });
      },
      error: (err: any) => {
        console.error(err);
        this.isSaveDisabled = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error while saving rent gate pass',
        });
      }
    });
  }


  goBackToRentGatePassList() {

    // clear form data
    this.rentForm.reset();

    // clear items
    this.items.clear();

    // clear local arrays
    this.filteredItems = [];
    this.filteredSubcategories = [];
    this.categoryLists = [];

    // clear route related vars
    this.gate_pass_id = '';
    this.item_row_id = '';
    this.actionType = '';

    // redirect back with tab selected
    this.router.navigate(['stock-gate-pass'], { queryParams: { tab: 'rentItemGatePass' } });

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}