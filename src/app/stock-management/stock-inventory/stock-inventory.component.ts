import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, OnInit, OnDestroy, ViewChild, ViewChildren } from '@angular/core';
import { FormControl, FormControlName, FormGroup, Validators } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { StockService } from 'src/app/services/stock.service';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { DatePipe } from '@angular/common';
import { ProjectService } from 'src/app/services/project.service';
import { ActivatedRoute, Router } from '@angular/router';

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
  selector: 'app-stock-inventory',
  templateUrl: './stock-inventory.component.html',
  styleUrls: ['./stock-inventory.component.scss']
})
export class StockInventoryComponent implements OnInit, OnDestroy {

  searchContract = new FormGroup({
    from: new FormControl(),
    to: new FormControl(),
    item_name: new FormControl(),
    item: new FormControl(),
    warehouse: new FormControl(),
    amount: new FormControl(),
    current_balance: new FormControl(),
    po_balance: new FormControl(),
    po_no: new FormControl(),
    category: new FormControl(),
    subcategory: new FormControl(),
    total_amount: new FormControl(),
  });
  inventoryForm = new FormGroup({
    inventory_id: new FormControl(),
    date: new FormControl('', Validators.required),
    bill_no: new FormControl(),
    challan_no: new FormControl(),
    po_number: new FormControl(),
    item: new FormControl(),
    category: new FormControl(),
    subcategory: new FormControl(),
    unit: new FormControl(),
    excess: new FormControl({ value: '', disabled: true }),
    short: new FormControl({ value: '', disabled: true }),
    rejected: new FormControl(),
    accepted: new FormControl({ value: '', disabled: true }),
    add_stock: new FormControl(),
    current_balance: new FormControl(),
    ordered_quantity: new FormControl({ value: '', disabled: true }),
    recieved_quantity: new FormControl({ value: '', disabled: true }),
    po_balance: new FormControl({ value: '', disabled: true }),
    warehouse: new FormControl('', Validators.required),
    rate: new FormControl(),
    amount: new FormControl(),
    project_name: new FormControl(),
    vendor_name: new FormControl(),
    company_name: new FormControl(),

  });

  stockSummaryGrp = new FormGroup({
    from: new FormControl(),
    to: new FormControl(),
    warehouse: new FormControl(),
    category: new FormControl(),
    subCategory: new FormControl(),
    item: new FormControl(),
    unitConversion: new FormControl(),
    currentBalance: new FormControl({ value: 0, disabled: true })
  });

  respcontractor: any;
  workContractData: any;
  isButtonDisabled: Boolean = false;
  totalCurrentBalance = 0;

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  dtOptions1: DataTables.Settings = {};
  dtTrigger1: Subject<any> = new Subject<any>();
  @ViewChildren(DataTableDirective) dtElement: any;
  @ViewChild('closebutton') closebutton: ElementRef;




  // summaryDtElement: DataTableDirective;
  private destroy$ = new Subject<void>();
  isHideSave: boolean = true;
  formSubmitted = false;
  materialsList = [];
  projectLists = [];
  poLists = [];
  categoryLists = [];
  subcategoryLists = [];
  warehouselists = [];
  vendorLists = [];
  companyLists = [];
  originalAccepted: any;
  stockSummary: [];



  inventoryDatatableparameter: { from: any, to: any, item_name: any, item: any, warehouse: any, amount: any, po_no: any, po_balance: any, category: any, subcategory: any };
  stockSummaryDatatableparameter: { from: any, to: any, warehouse: any, item: any, groupid: any, subgroupid: any };
  filteredSubcategoryLists: any[];
  filteredMaterialsList: any[];
  filteredMaterialsListSearch: any[];
  materialsListSearch: any[];
  filteredSubcategoryListsSearch: any[];
  convertUnitDropdown: any;
  inventoryUnitDropdown: string[] = [];
  inventoryUnitConversionData: any[] = [];
  inventoryOriginalBalance = 0;
  inventoryAddStockBase = 0;
  unitConversionData: any;
  originalBalance: number;
  modalTitle = 'Add New Entry';

  constructor(private http: HttpClient, private stockService: StockService, private datepipe: DatePipe, private ProjectService: ProjectService, private route: ActivatedRoute, private router: Router) {
    this.inventoryDatatableparameter = { from: '', to: '', item_name: '', item: '', warehouse: '', amount: '', po_no: '', po_balance: '', category: '', subcategory: '' };
    this.stockSummaryDatatableparameter = { from: '', to: '', warehouse: '', item: '', groupid: '', subgroupid: '' };
  }

  ngOnInit(): void {
    // this.datatablecode();
    this.initSummaryDatatable();
    this.getAllMaterialLists();
    this.getProjectsLists();
    this.getDispatchedPOLists();
    this.getWarehouseLists();
    this.getVendorsLists();
    this.getCompanyLists();
    this.getCategoryLists();
    this.getSubCategoryLists();
    this.getAllMaterialListsSearch();
    this.setupSummaryFilters();

    this.setupFieldEnableLogic();
    const controlsToWatch = [
      'ordered_quantity',
      'recieved_quantity',
      'short',
      'excess',
      'rejected'
    ];

    controlsToWatch.forEach(field => {
      this.inventoryForm.get(field)?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.calculateValues();
      });
    });

    //  NEW: Watch for changes in accepted to auto-update amount
    this.inventoryForm.get('accepted')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.onRateChange();
    });
    this.inventoryForm.get('add_stock')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.onAddStockInput(value);
    });


    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params.credit_date || params.po_no) {

        const patch: any = {};

        if (params.credit_date) {
          const date = this.formatDateForInput(params.credit_date);
          patch.from = date;
          patch.to = date;
        }

        if (params.po_no) {
          patch.po_no = params.po_no;
        }

        this.searchContract.patchValue(patch);
      }

      this.datatablecode();
    });

  }


  formatDateForInput(dateStr: string): string {
    const d = new Date(dateStr);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }


  getAllMaterialListsSearch() {
    let formData = new FormData();
    this.ProjectService.getAllMaterialsLists(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.materialsListSearch = resp.data;
      this.filteredMaterialsListSearch = [...this.materialsListSearch];

    });
  }

  clearItemSelectionSerach() {
    this.stockSummaryGrp.patchValue({ item: null });
    this.filteredMaterialsListSearch = [...this.materialsListSearch];
  }


  calculateValues() {
    const ordered = Number(this.inventoryForm.get('ordered_quantity')?.value) || 0;
    const received = Number(this.inventoryForm.get('recieved_quantity')?.value) || 0;
    const rejected = Number(this.inventoryForm.get('rejected')?.value) || 0;

    let short = 0;
    let excess = 0;
    let accepted = 0;
    let po_balance = 0;

    // --- PO Balance ---
    po_balance = ordered - received;
    if (po_balance < 0) po_balance = 0;

    // --- Excess and Short ---
    if (ordered > received) {
      excess = 0;
      short = ordered - received;
    } else if (received > ordered) {
      short = 0;
      excess = received - ordered;
    } else {
      short = 0;
      excess = 0;
    }

    // --- Accepted ---
    accepted = received - rejected;
    if (accepted < 0) accepted = 0;

    // Update form values without triggering another valueChanges loop
    this.inventoryForm.patchValue({
      po_balance,
      short,
      excess,
      accepted
    }, { emitEvent: false });

    //  Automatically recalc amount when accepted changes
    this.onRateChange();
  }


  // onRateChange() {
  //   const rate = Number(this.inventoryForm.get('rate')?.value) || 0;
  //   const accepted = Number(this.inventoryForm.get('accepted')?.value) || 0;
  //   const amount = rate * accepted;

  //   this.inventoryForm.patchValue({ amount }, { emitEvent: false });
  // }

  onRateChange() {
    const rate = Number(this.inventoryForm.get('rate')?.value) || 0;
    const accepted = Number(this.inventoryForm.get('accepted')?.value) || 0;
    const addStock = Number(this.inventoryAddStockBase) || 0;

    const billNo = this.inventoryForm.get('bill_no')?.value;
    const challanNo = this.inventoryForm.get('challan_no')?.value;
    const poNumber = this.inventoryForm.get('po_number')?.value;

    let amount = 0;

    if (billNo || challanNo || poNumber) {
      amount = rate * accepted;
    } else {
      amount = rate * addStock;
    }

    this.inventoryForm.patchValue({ amount }, { emitEvent: false });
  }


  searchstockSummary(): void {
    const {
      from,
      to,
      warehouse,
      category,
      subCategory,
      item
    } = this.stockSummaryGrp.value;

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

    this.stockSummaryGrp.get('currentBalance')?.setValue(null);
    this.stockSummaryGrp.get('unitConversion')?.setValue(null);
    this.convertUnitDropdown = [];
    this.unitConversionData = [];
    this.originalBalance = 0;
    const formData = new FormData();

    if (warehouse) formData.append('warehouse', warehouse);
    if (category) formData.append('category', category);
    if (subCategory) formData.append('subCategory', subCategory);
    if (item) formData.append('item', item);

    this.stockService.fetchTotalCurrentbalance(formData).pipe(takeUntil(this.destroy$)).subscribe({
      next: (totalBalance) => {

        this.stockSummaryGrp.get('currentBalance')?.setValue(totalBalance);
        this.originalBalance = Number(totalBalance); // always store basic unit balance
        if (item) {

          const unitFormData = new FormData();
          unitFormData.append('master_item_id', item);

          this.ProjectService.getUnitsFromConversionTable(unitFormData)
            .pipe(takeUntil(this.destroy$))
            .subscribe(resp => {

              const data = resp?.data || [];

              if (!data.length) return;

              // 🔹 Store full conversion data
              this.unitConversionData = data;

              // 🔹 Extract unique units
              const unitSet = new Set<string>();

              data.forEach(row => {
                if (row.basic_unit_name) {
                  unitSet.add(row.basic_unit_name);
                }
                if (row.alt_unit_name) {
                  unitSet.add(row.alt_unit_name);
                }
              });

              // 🔹 Convert to array
              this.convertUnitDropdown = Array.from(unitSet);

              // 🔹 Ensure basic unit comes first
              const basicUnit = data[0].basic_unit_name;
              this.convertUnitDropdown = [
                basicUnit,
                ...this.convertUnitDropdown.filter(u => u !== basicUnit)
              ];
              if (this.convertUnitDropdown.length) {
                this.stockSummaryGrp
                  .get('unitConversion')
                  ?.setValue(this.convertUnitDropdown[0]);
              }

            });
        }
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch current balance. Please try again.'
        });
      }
    });

    this.initSummaryDatatable();
    this.reload('stock-summary');
  }




  resetStockSummary(): void {

    // Reset complete form
    this.stockSummaryGrp.reset();

    // Explicitly clear calculated / dependent controls
    this.stockSummaryGrp.get('currentBalance')?.setValue(null);
    this.stockSummaryGrp.get('unitConversion')?.setValue(null);

    // Clear dynamic dropdown data
    this.convertUnitDropdown = [];

    // Clear stored conversion mapping
    this.unitConversionData = [];

    // Reset stored original balance
    this.originalBalance = 0;

    // Reset form state
    this.stockSummaryGrp.markAsPristine();
    this.stockSummaryGrp.markAsUntouched();

    // Reload table
    this.initSummaryDatatable();
    this.reload('stock-summary');
  }


  searchInventory() {
    this.datatablecode();
    this.reload('stock-inventory');
  }

  resetInventory() {
    this.searchContract.get('from').setValue('');
    this.searchContract.get('to').setValue('');
    this.searchContract.get('item_name').setValue('');
    this.searchContract.get('item').setValue('');
    this.searchContract.get('warehouse').setValue('');
    this.searchContract.get('amount').setValue('');
    this.searchContract.get('po_balance').setValue('');
    this.searchContract.get('po_no').setValue('');
    this.searchContract.get('category').setValue('');
    this.searchContract.get('subcategory').setValue('');

    this.filteredSubcategoryLists = [...this.subcategoryLists];
    this.filteredMaterialsList = [...this.materialsList];
    this.searchContract.get('total_amount')?.setValue('');
    this.searchContract.get('current_balance')?.setValue('');

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true   // important: does not add history entry
    });

    this.datatablecode();
    this.reload('stock-inventory');
  }

  getAllMaterialLists() {
    let formData = new FormData();
    this.ProjectService.getAllMaterialsLists(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.materialsList = resp.data;
      this.filteredMaterialsList = [...this.materialsList];

    });
  }

  getWarehouseLists() {
    let formData = new FormData();
    this.ProjectService.getAllWarehouselists(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.warehouselists = resp.data;
    });
  }

  getVendorsLists() {
    let formData = new FormData();
    this.ProjectService.getVendorsLists(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.vendorLists = resp.data;
    });
  }

  getCompanyLists() {
    let formData = new FormData();
    this.ProjectService.getCompanyLists(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.companyLists = resp.data;
    });
  }

  getProjectsLists() {
    let formData = new FormData();
    this.ProjectService.getAllProjectsLists(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.projectLists = resp.data;
    });
  }

  getDispatchedPOLists() {
    let formData = new FormData();
    this.stockService.getDispatchedPOLists(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.poLists = resp.data;
    });
  }

  getCategoryLists() {
    let formData = new FormData();
    this.ProjectService.getAllCategoryLists(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.categoryLists = resp.data;
    });
  }

  getSubCategoryLists() {
    let formData = new FormData();
    this.ProjectService.getAllSubCategoryLists(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.subcategoryLists = resp.data;
      this.filteredSubcategoryLists = [...this.subcategoryLists];
    });
  }


  onCategoryChange(event: any) {
    const selectedCategoryId = event.target.value;

    this.filteredSubcategoryLists = this.subcategoryLists
      .filter(sub => sub.group_id === selectedCategoryId)
      .sort((a, b) => {
        const nameA = (a.subgroup_name ?? '').toString();
        const nameB = (b.subgroup_name ?? '').toString();
        return nameA.localeCompare(nameB);
      });

    this.filteredMaterialsList = [];
    this.inventoryForm.patchValue({ subcategory: '', item: '' });
  }

  onSubCategoryChange(event: any) {
    const selectedCategoryId = this.inventoryForm.get('category')?.value;
    const selectedSubCategoryId = event.target.value;
    this.filteredMaterialsList = this.materialsList.filter(
      item =>
        item.group_id === selectedCategoryId &&
        item.sub_group_id === selectedSubCategoryId
    );
    this.inventoryForm.patchValue({ item: '' });
  }

  onMaterialChange(selectedMaterial: any) {

    this.inventoryForm.get('warehouse')?.reset();
    this.inventoryForm.get('current_balance')?.reset();
    if (selectedMaterial) {
      const selectedCategoryId = selectedMaterial.group_id;
      const selectedSubCategoryId = selectedMaterial.sub_group_id;
      const selectedMaterialId = selectedMaterial.master_item_id;

      this.inventoryForm.get('category')?.setValue(selectedCategoryId);

      this.filteredSubcategoryLists = this.subcategoryLists.filter(
        sub => sub.group_id === selectedCategoryId
      );

      this.inventoryForm.get('subcategory')?.setValue(selectedSubCategoryId);

      // Filter items belonging to same category + subcategory
      this.filteredMaterialsList = this.materialsList.filter(
        item =>
          item.group_id === selectedCategoryId &&
          item.sub_group_id === selectedSubCategoryId
      );

      // Load units (basic + conversions) for dropdown
      this.loadInventoryUnits(selectedMaterialId);
    } else {
      // Reset if user clears the selection
      this.inventoryForm.get('category')?.reset();
      this.inventoryForm.get('subcategory')?.reset();
      this.inventoryForm.get('unit')?.reset();
      this.inventoryUnitConversionData = [];
      this.inventoryOriginalBalance = 0;
      this.inventoryUnitDropdown = [];
      this.filteredMaterialsList = [...this.materialsList];
    }
  }

  private loadInventoryUnits(masterItemId: any, presetUnit?: string) {
    if (!masterItemId) {
      this.inventoryUnitDropdown = [];
      this.inventoryForm.get('unit')?.reset();
      this.inventoryUnitConversionData = [];
      return;
    }

    const formData = new FormData();
    formData.append('master_item_id', masterItemId);

    this.ProjectService.getUnitsFromConversionTable(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe(resp => {
        const data = resp?.data || [];

        if (!data.length) {
          this.inventoryUnitDropdown = [];
          this.inventoryForm.get('unit')?.reset();
          this.inventoryUnitConversionData = [];
          return;
        }

        this.inventoryUnitConversionData = data;

        const unitSet = new Set<string>();

        data.forEach(row => {
          if (row.basic_unit_name) {
            unitSet.add(row.basic_unit_name);
          }
          if (row.alt_unit_name) {
            unitSet.add(row.alt_unit_name);
          }
        });

        const allUnits = Array.from(unitSet);
        const basicUnit = data[0].basic_unit_name;

        this.inventoryUnitDropdown = basicUnit
          ? [basicUnit, ...allUnits.filter(u => u !== basicUnit)]
          : allUnits;

        const selectedUnit = presetUnit || (this.inventoryUnitDropdown[0] || '');
        if (selectedUnit) {
          this.inventoryForm.get('unit')?.setValue(selectedUnit);
          this.updateInventoryDisplays(selectedUnit);
        }
      });
  }

  private convertValueFromBasic(value: number, unit: string): number {
    if (!unit || !this.inventoryUnitConversionData?.length) return value;
    const basicUnit = this.inventoryUnitConversionData[0]?.basic_unit_name;
    if (unit === basicUnit) return value;
    const row = this.inventoryUnitConversionData.find((r: any) => r.alt_unit_name === unit);
    if (!row) return value;
    const basicValue = Number(row.basic_value) || 0;
    const altValue = Number(row.alt_value) || 0;
    if (!basicValue) return value;
    return (value * altValue) / basicValue;
  }

  private convertValueToBasic(displayValue: number, unit: string): number {
    if (!unit || !this.inventoryUnitConversionData?.length) return displayValue;
    const basicUnit = this.inventoryUnitConversionData[0]?.basic_unit_name;
    if (unit === basicUnit) return displayValue;
    const row = this.inventoryUnitConversionData.find((r: any) => r.alt_unit_name === unit);
    if (!row) return displayValue;
    const basicValue = Number(row.basic_value) || 0;
    const altValue = Number(row.alt_value) || 0;
    if (!altValue) return displayValue;
    return (displayValue * basicValue) / altValue;
  }

  private updateInventoryDisplays(selectedUnit?: string) {
    const unit = selectedUnit || this.inventoryForm.get('unit')?.value;
    const balanceControl = this.inventoryForm.get('current_balance');
    const addStockControl = this.inventoryForm.get('add_stock');

    const convertedBalance = Math.round(this.convertValueFromBasic(Number(this.inventoryOriginalBalance) || 0, unit) * 100) / 100;
    balanceControl?.setValue(convertedBalance);

    // Keep Add Stock UI value as-is; only update stored base quantity for backend
    const addStockDisplay = Number(addStockControl?.value) || 0;
    this.inventoryAddStockBase = this.convertValueToBasic(addStockDisplay, unit);
  }

  onInventoryUnitChange(selectedUnit: string) {
    this.updateInventoryDisplays(selectedUnit);
    this.onRateChange();
  }

  onAddStockInput(displayValue: string | number) {
    const unit = this.inventoryForm.get('unit')?.value;
    const numeric = Number(displayValue) || 0;
    this.inventoryAddStockBase = this.convertValueToBasic(numeric, unit);
    this.onRateChange();
  }

  clearItemSelection() {
    this.inventoryForm.patchValue({
      item: '',
      warehouse: '',
      current_balance: ''
    });
    this.filteredMaterialsList = [...this.materialsList];
    this.inventoryForm.get('unit')?.reset();
    this.inventoryUnitDropdown = [];
    this.inventoryUnitConversionData = [];
    this.inventoryOriginalBalance = 0;
    this.inventoryForm.get('category')?.reset();
    this.inventoryForm.get('subcategory')?.reset();
  }

  clearItemSelectionSummary() {
    this.stockSummaryGrp.get('item')?.setValue(null);
    this.filteredMaterialsListSearch = [...this.materialsListSearch];
  }

  datatablecode() {
    this.inventoryDatatableparameter.from = this.searchContract.get('from')?.value;
    this.inventoryDatatableparameter.to = this.searchContract.get('to')?.value;
    this.inventoryDatatableparameter.item_name = this.searchContract.get('item_name')?.value;
    this.inventoryDatatableparameter.item = this.searchContract.get('item')?.value;
    this.inventoryDatatableparameter.warehouse = this.searchContract.get('warehouse')?.value;
    this.inventoryDatatableparameter.amount = this.searchContract.get('amount')?.value;
    this.inventoryDatatableparameter.po_balance = this.searchContract.get('po_balance')?.value;
    this.inventoryDatatableparameter.po_no = this.searchContract.get('po_no')?.value;
    this.inventoryDatatableparameter.category = this.searchContract.get('category')?.value;
    this.inventoryDatatableparameter.subcategory = this.searchContract.get('subcategory')?.value;

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
        that.http.post<DataTablesResponse>(environment.APIEndpoint + 'stock.fetchStocksData&reload=1', Object.assign(dataTablesParameters, this.inventoryDatatableparameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {
          console.log(resp.data);
          that.workContractData = resp.data;
          callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsTotal,
            data: []
          });
        });
      }
    }
  }

  initSummaryDatatable() {

    this.stockSummaryDatatableparameter.from = this.stockSummaryGrp.get('from').value;
    this.stockSummaryDatatableparameter.to = this.stockSummaryGrp.get('to').value;
    this.stockSummaryDatatableparameter.warehouse = this.stockSummaryGrp.get('warehouse').value;
    this.stockSummaryDatatableparameter.item = this.stockSummaryGrp.get('item').value;
    this.stockSummaryDatatableparameter.groupid = this.stockSummaryGrp.get('category').value;
    this.stockSummaryDatatableparameter.subgroupid = this.stockSummaryGrp.get('subCategory').value;

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
        this.http.post<any>(
          environment.APIEndpoint + 'stock.fetchStockSummary&reload=1', Object.assign(dataTablesParameters, this.stockSummaryDatatableparameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {
            this.stockSummary = resp.data;
            console.log(resp.data);
            this.totalCurrentBalance = this.stockSummary.reduce((a: number, b: any) => a + Number(b.current_balance || 0), 0);
            callback({
              recordsTotal: resp.recordsTotal,
              recordsFiltered: resp.recordsTotal,
              data: []
            });
          });
      }
    };
  }

  appendSafe(formData, key, value) {
    formData.append(key, value ?? '');
  }


  addInventoryData() {
    this.formSubmitted = true;
    if (this.inventoryForm.valid) {

      this.isButtonDisabled = true;
      let formData = new FormData();
      const inventory_id = this.inventoryForm.get('inventory_id').value;

      if (inventory_id) {
        formData.append('inventory_id', inventory_id);
      }

      const currentBalance = Number(this.inventoryOriginalBalance) || 0;
      const addStock = Number(this.inventoryAddStockBase) || 0;
      const accepted = Number(this.inventoryForm.get('accepted').value) || 0;

      const billNo = this.inventoryForm.get('bill_no').value;
      const challanNo = this.inventoryForm.get('challan_no').value;
      const poNumber = this.inventoryForm.get('po_number').value;

      let finalCurrentBalance = currentBalance;

      if (!inventory_id) {
        if (billNo || challanNo || poNumber) {
          finalCurrentBalance = currentBalance + accepted;
        } else {
          finalCurrentBalance = currentBalance + addStock;
        }
      }
      else {
        const originalAccepted = Number(this.originalAccepted) || 0;

        if (accepted !== originalAccepted) {
          if (billNo || challanNo || poNumber) {
            finalCurrentBalance = currentBalance + (accepted - originalAccepted);
          } else {
            finalCurrentBalance = currentBalance + addStock;
          }
        } else {
          finalCurrentBalance = currentBalance + addStock;
        }
      }

      this.appendSafe(formData, 'date', this.inventoryForm.get('date').value);
      this.appendSafe(formData, 'bill_no', this.inventoryForm.get('bill_no').value);
      this.appendSafe(formData, 'challan_no', this.inventoryForm.get('challan_no').value);
      this.appendSafe(formData, 'po_number', this.inventoryForm.get('po_number').value);
      this.appendSafe(formData, 'group_id', this.inventoryForm.get('category').value);
      this.appendSafe(formData, 'sub_group_id', this.inventoryForm.get('subcategory').value);


      // ------------------- MATCH MATERIAL (unchanged except debug comments) -------------------
      const selectedItemId = this.inventoryForm.get('item').value;

      const matchedMaterial = this.filteredMaterialsList.find(material =>
        material.group_id === this.inventoryForm.get('category').value &&
        material.sub_group_id === this.inventoryForm.get('subcategory').value &&
        material.master_item_id === selectedItemId
      );


      this.appendSafe(formData, 'item', matchedMaterial ? matchedMaterial.itemname : '');
      this.appendSafe(formData, 'item_id', matchedMaterial ? matchedMaterial.master_item_id : '');
      // Always persist unit in basic unit (first option in dropdown) even if user selects an alternate unit for display
      const selectedUnit = this.inventoryForm.get('unit').value;
      const basicUnit = this.inventoryUnitConversionData?.[0]?.basic_unit_name || selectedUnit;
      this.appendSafe(formData, 'unit', basicUnit);
      this.appendSafe(formData, 'excess', this.inventoryForm.get('excess').value);
      this.appendSafe(formData, 'short', this.inventoryForm.get('short').value);
      this.appendSafe(formData, 'vendor_name', this.inventoryForm.get('vendor_name').value);
      this.appendSafe(formData, 'company_name', this.inventoryForm.get('company_name').value);
      this.appendSafe(formData, 'rejected', this.inventoryForm.get('rejected').value);
      this.appendSafe(formData, 'accepted', this.inventoryForm.get('accepted').value);
      this.appendSafe(formData, 'current_balance', finalCurrentBalance.toString());
      this.appendSafe(formData, 'add_stock', this.inventoryAddStockBase);
      this.appendSafe(formData, 'ordered_quantity', this.inventoryForm.get('ordered_quantity').value);
      this.appendSafe(formData, 'recieved_quantity', this.inventoryForm.get('recieved_quantity').value);
      this.appendSafe(formData, 'po_balance', this.inventoryForm.get('po_balance').value);
      this.appendSafe(formData, 'warehouse', this.inventoryForm.get('warehouse').value);
      this.appendSafe(formData, 'rate', this.inventoryForm.get('rate').value);
      this.appendSafe(formData, 'amount', this.inventoryForm.get('amount').value);
      this.appendSafe(formData, 'project_name', this.inventoryForm.get('project_name').value);

      this.stockService.saveInventoryData(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
        if (resp) {
          this.closebutton.nativeElement.click();
          Swal.fire({
            title: 'Success!',
            text: 'Inventory has been Saved successfully.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            timerProgressBar: true
          }).then(() => {
            this.inventoryForm.reset();
            this.reload('stock-inventory');
          });

        } else if (resp === false) {
          this.isButtonDisabled = false;

          const warehouseId = this.inventoryForm.get('warehouse').value;
          const warehouseObj = this.warehouselists.find(w => w.godown_id === warehouseId);
          const warehouseName = warehouseObj ? warehouseObj.godown_name : warehouseId;

          const categoryId = this.inventoryForm.get('category').value;
          const categoryObj = this.categoryLists.find(c => c.group_id === categoryId);
          const categoryName = categoryObj ? categoryObj.group_name : categoryId;

          const subcategoryId = this.inventoryForm.get('subcategory').value;
          const subcategoryObj = this.filteredSubcategoryLists.find(s => s.sub_group_id === subcategoryId);
          const subcategoryName = subcategoryObj ? subcategoryObj.sub_group_name : subcategoryId;

          const itemName = this.inventoryForm.get('item').value;

          Swal.fire({
            title: 'Duplicate Entry!',
            text: `The warehouse "${warehouseName}" already exists for "${categoryName}" -> "${subcategoryName}" -> "${itemName}".`,
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#d33'
          });
        }
        else {
          this.isButtonDisabled = false;
          Swal.fire({
            title: 'Error!',
            text: 'Failed to add Inevntory. Contact UR Dev.',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#d33'
          });
        }

      });

    } else {
      Swal.fire('Alert', 'Some fields are missing', 'info');
    }
  }


  onFilterChange() {
    const categoryId = this.searchContract.get('category')?.value || '';
    const subcategoryId = this.searchContract.get('subcategory')?.value || '';
    const itemName = this.searchContract.get('item')?.value || '';

    this.filteredSubcategoryLists = categoryId
      ? this.subcategoryLists.filter(sub => sub.group_id === categoryId)
      : [...this.subcategoryLists];

    this.filteredMaterialsList = this.materialsList.filter(item => {
      return (
        (!categoryId || item.group_id === categoryId) &&
        (!subcategoryId || item.sub_group_id === subcategoryId)
      );
    });

    this.getTotalAmount(categoryId, subcategoryId, itemName);
  }

  getTotalAmount(categoryId: string, subcategoryId: string, itemName: string) {
    let formData = new FormData();

    if (categoryId) formData.append('category_id', categoryId);
    if (subcategoryId) formData.append('subcategory_id', subcategoryId);
    if (itemName) formData.append('item_name', itemName);

    this.ProjectService.getTotalAmount(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe(resp => {
        const totalAmount = resp.amount || 0;
        const currenbal = resp.current_balance || 0;
        this.searchContract.get('total_amount')?.setValue(totalAmount);
        this.searchContract.get('current_balance')?.setValue(currenbal);
      });
  }

  opeModal() {
    // Set modal title for add flow
    this.modalTitle = 'Add New Entry';
    // Enable entire form first
    this.inventoryForm.enable();

    // Always disable these fields initially
    const fieldsToDisable = [
      'current_balance',
      'ordered_quantity',
      'recieved_quantity',
      'excess',
      'rejected',
      'accepted',
      'po_balance'
    ];

    fieldsToDisable.forEach(field => {
      this.inventoryForm.get(field)?.disable({ emitEvent: false });
    });

    // Load dropdown data
    this.getCategoryLists();
    this.getSubCategoryLists();
    this.getAllMaterialLists();

    // Initialize filtered lists
    this.filteredSubcategoryLists = [...this.subcategoryLists];
    this.filteredMaterialsList = [...this.materialsList];
    this.inventoryUnitDropdown = [];
    this.inventoryForm.get('unit')?.reset();
    this.inventoryUnitConversionData = [];
    this.inventoryOriginalBalance = 0;

    // Show save button
    this.isHideSave = true;

    // Trigger logic once to ensure correct initial enable/disable state
    this.toggleQuantityFields?.();
  }


  ViewInventory(type, inventory_id) {
    const isViewMode = type === 'view_inventory';
    this.isHideSave = !isViewMode;
    this.modalTitle = isViewMode ? 'View Entry' : 'Add New Entry';
    if (type == 'view_inventory') {
      this.inventoryForm.disable();
      this.inventoryForm.get('unit')?.disable();
      this.inventoryForm.get('current_balance')?.disable();
      this.isHideSave = false;
    } else {
      this.inventoryForm.enable();
      this.inventoryForm.get('unit')?.disable();
      this.inventoryForm.get('current_balance')?.disable();
      this.isHideSave = true;
    }
    let formData = new FormData();
    formData.append('inventory_id', inventory_id);
    this.stockService.getInventorybyId(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {

      const row = resp.data[0];

      const warehouseValue = this.mapIdFromList(
        row.warehouse,
        this.warehouselists,
        'godown_id',
        'godown_name'
      );

      const vendorValue = this.mapIdFromList(
        row.vendor_name,
        this.vendorLists,
        'vendorid',
        'vendorname'
      );

      const companyValue = this.mapIdFromList(
        row.company_name,
        this.companyLists,
        'master_company_id',
        'company_name'
      );


      // Filter subcategories by the API group_id
      this.filteredSubcategoryLists = this.subcategoryLists.filter(
        sub => sub.group_id === row.group_id
      );

      // Filter materials by the API group_id and sub_group_id
      this.filteredMaterialsList = this.materialsList.filter(
        item => item.group_id === row.group_id && item.sub_group_id === row.sub_group_id
      );
      this.inventoryForm.patchValue({
        inventory_id: row.inventory_id,
        date: this.datepipe.transform(row.date, 'yyyy-MM-dd'),
        bill_no: row.bill_no,
        challan_no: row.challan_no,
        po_number: row.po_number,
        item: row.item_id,
        unit: row.unit,
        excess: row.excess,
        short: row.short,
        vendor_name: vendorValue,
        company_name: companyValue,
        rejected: row.rejected,
        accepted: row.accepted,
        add_stock: 0,
        current_balance: row.current_balance,
        ordered_quantity: row.ordered_quantity,
        recieved_quantity: row.recieved_quantity,
        po_balance: row.po_balance,
        warehouse: warehouseValue,
        rate: row.rate,
        // amount: row.amount,
        project_name: row.project_name,
        category: row.group_id,
        subcategory: row.sub_group_id
      });

      this.inventoryForm.get('amount')?.setValue(row.amount);
      this.inventoryOriginalBalance = Number(row.current_balance) || 0;
      this.loadInventoryUnits(row.item_id, row.unit);

      //  Store the original accepted value for later comparison
      this.originalAccepted = Number(row.accepted) || 0;
      this.setFormMode(isViewMode);
    });

  }



  private mapIdFromList(
    value: any,
    list: any[],
    idKey: string,
    nameKey: string
  ): any {

    if (!value || !list?.length) {
      return value;
    }

    const matched = list.find(
      x => x[idKey] === value || x[nameKey] === value
    );

    return matched ? matched[idKey] : value;
  }


  private setFormMode(isViewMode: boolean): void {
    // Fields that are always disabled
    const alwaysDisabledFields = ['current_balance'];

    if (isViewMode) {
      // Disable entire form in view mode
      this.inventoryForm.disable();
    } else {
      // Enable form in edit mode
      this.inventoryForm.enable();

      // Always keep these fields disabled
      alwaysDisabledFields.forEach(field => {
        this.inventoryForm.get(field)?.disable();
      });

      // Apply conditional field logic
      this.toggleQuantityFields();
    }
  }

  removeInventory(item: any) {
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

        // Safely append all required fields
        transation_form.append('inventory_id', item.inventory_id || '');
        transation_form.append('accepted', item.accepted || '');
        transation_form.append('groupid', item.groupid || '');
        transation_form.append('subgroupid', item.subgroupid || '');
        transation_form.append('item', item.item || '');
        transation_form.append('warehouse', item.warehouses || '');

        this.stockService.removeInventory(transation_form)
          .pipe(takeUntil(this.destroy$))
          .subscribe(Response => {
            if (Response) {
              Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Inventory Deleted Successfully',
                showConfirmButton: false,
                timer: 2000
              });
              this.reload('stock-inventory');
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Failed to delete inventory',
                showConfirmButton: false,
                timer: 3000
              });
            }
          });
      }
    });
  }

  CancelButton() {
    this.inventoryForm.reset();
    this.filteredSubcategoryLists = [...this.subcategoryLists];
    this.filteredMaterialsList = [...this.materialsList];
    this.isButtonDisabled = false;
    this.inventoryOriginalBalance = 0;
    this.inventoryUnitConversionData = [];
    this.inventoryUnitDropdown = [];
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
    this.dtTrigger1.next();
    // this.dtTriggerSummary.next();
  }

  // rerender(): void {
  //   this.dtElement.forEach((item) => {
  //     if (item.dtInstance) {
  //       item.dtInstance.then((dtInstance: DataTables.Api) => {
  //         dtInstance.destroy();
  //       });
  //     }
  //   });
  //   this.dtTrigger.next();
  // }

  // rerenderSummary() {
  //   return;
  //   // if (this.summaryDtElement) {
  //   //   this.summaryDtElement.dtInstance.then((dt: DataTables.Api) => {
  //   //     dt.destroy();
  //   //     this.dtTriggerSummary.next();   // ✔ safe reinit
  //   //   });
  //   // } else {
  //   //   this.dtTriggerSummary.next();
  //   // }
  // }


  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.dtTrigger1.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();

    if (this.dtElement && this.dtElement.dtInstance) {
      this.dtElement.dtInstance.then(dt => dt.destroy());
    }
  }

  onTabChange(id: string) {
    // if (id === 'tabSummary') {
    //   if (!this.dtOptionsSummary || Object.keys(this.dtOptionsSummary).length === 0) {
    //     this.initSummaryDatatable();
    //   }
    //   this.rerenderSummary();
    // }
  }


  setupFieldEnableLogic() {
    const controlFields = ['bill_no', 'challan_no', 'po_number'];

    controlFields.forEach(field => {
      this.inventoryForm.get(field)?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.toggleQuantityFields();
      });
    });
  }

  toggleQuantityFields() {
    const bill = this.inventoryForm.get('bill_no')?.value?.trim();
    const challan = this.inventoryForm.get('challan_no')?.value?.trim();
    const po = this.inventoryForm.get('po_number')?.value?.trim();

    // If any of these 3 fields are filled, enable the quantity-related fields
    const shouldEnable = !!(bill || challan || po);

    const quantityFields = [
      'ordered_quantity',
      'recieved_quantity',
      'short',
      'excess',
      'rejected',
      'accepted',
      'po_balance'
    ];

    // Enable/disable quantity fields based on condition
    quantityFields.forEach(fieldName => {
      const control = this.inventoryForm.get(fieldName);
      if (shouldEnable) {
        control?.enable({ emitEvent: false });
      } else {
        control?.disable({ emitEvent: false });
        control?.reset(); // Clear value when disabled
      }
    });

    // Now handle the Add Stock field based on the same condition
    const addStockControl = this.inventoryForm.get('add_stock');

    if (shouldEnable) {
      // When bill/challan/po exists → quantity fields are active → disable Add Stock
      addStockControl?.disable({ emitEvent: false });
    } else {
      // When none exist → quantity fields are disabled → enable Add Stock
      addStockControl?.enable({ emitEvent: false });
    }
  }


  onChangeWarehouse(event: any) {
    const selectedWarehouseId = event.target.value;
    const selectedWarehouseName = event.target.options[event.target.selectedIndex].text;
    const selectedItem = this.inventoryForm.get('item')?.value;

    if (!selectedItem) {
      this.inventoryForm.get('warehouse')?.reset();

      Swal.fire({
        icon: 'warning',
        title: 'Item Required',
        text: 'Please select an Item first. Warehouse can be selected only after choosing an Item.',
        confirmButtonText: 'OK'
      });
      return;
    }

    //  Warehouse not selected
    if (!selectedWarehouseId) {
      return;
    }

    //  Both selected → proceed with API call
    let formData = new FormData();
    formData.append('selectedItem', selectedItem);
    formData.append('selectedWarehouseId', selectedWarehouseId);
    this.stockService.fetchCurrentBalFromWarehouseAndItem(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      const CurrentBal = Number(resp) || 0;
      this.inventoryOriginalBalance = CurrentBal;
      this.updateInventoryDisplays();

    });
  }


  reload(tableType: string) {
    if (tableType === 'stock-inventory') {
      this.dtElement.toArray()[0].dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        this.dtTrigger.next(null);
      });
    }
    else if (tableType === 'stock-summary') {
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

  setupSummaryFilters() {
    this.stockSummaryGrp.get('category')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(categoryId => {
      let list = categoryId
        ? this.subcategoryLists.filter(s => s.group_id === categoryId)
        : [...this.subcategoryLists];

      this.filteredSubcategoryListsSearch = this.getUniqueSubcategories(list);

      this.stockSummaryGrp.patchValue({ subCategory: '', item: null }, { emitEvent: false });
      this.filteredMaterialsListSearch = [];
    });

    this.stockSummaryGrp.get('subCategory')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(subCategoryId => {
      const categoryId = this.stockSummaryGrp.get('category')?.value;

      this.filteredMaterialsListSearch = this.materialsList.filter(m => {
        return (
          (!categoryId || m.group_id === categoryId) &&
          (!subCategoryId || m.sub_group_id === subCategoryId)
        );
      });

      this.stockSummaryGrp.patchValue({ item: null }, { emitEvent: false });
    });

    this.stockSummaryGrp.get('item')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(masterItemId => {
      if (!masterItemId) return;

      const itemObj = this.materialsList.find(
        m => m.master_item_id === masterItemId
      );

      if (!itemObj) return;

      this.stockSummaryGrp.patchValue(
        {
          category: itemObj.group_id,
          subCategory: itemObj.sub_group_id
        },
        { emitEvent: false }
      );

      const filteredSubs = this.subcategoryLists.filter(
        s => s.group_id === itemObj.group_id
      );
      this.filteredSubcategoryListsSearch = this.getUniqueSubcategories(filteredSubs);

      this.filteredMaterialsListSearch = this.materialsList.filter(
        m => m.sub_group_id === itemObj.sub_group_id
      );
    });
  }

  getUniqueSubcategories(list: any[]) {
    const map = new Map();
    list.forEach(s => {
      if (!map.has(s.sub_group_id)) {
        map.set(s.sub_group_id, s);
      }
    });
    return Array.from(map.values());
  }


  // onItemChangeSummary(selectedValue: any) {
  //   const current_balance = this.stockSummaryGrp.get('currentBalance')?.value;
  //   const formData = new FormData();
  //   formData.append('master_item_id', selectedValue.master_item_id);

  //   this.ProjectService.getUnitsFromConversionTable(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
  //          
  //   });

  // }


  onUnitChange(selectedUnit: string) {

    const balanceControl = this.stockSummaryGrp.get('currentBalance');

    if (!selectedUnit || !this.unitConversionData?.length) {
      balanceControl?.setValue(this.originalBalance);
      return;
    }

    const basicUnit = this.unitConversionData[0].basic_unit_name;

    if (selectedUnit === basicUnit) {
      balanceControl?.setValue(this.originalBalance);
      return;
    }

    const conversionRow = this.unitConversionData
      .find(row => row.alt_unit_name === selectedUnit);

    if (!conversionRow) return;

    const basicValue = Number(conversionRow.basic_value) || 0;
    const altValue = Number(conversionRow.alt_value) || 0;
    const originalBalance = Number(this.originalBalance) || 0;

    if (!basicValue) return;

    const converted = (originalBalance * altValue) / basicValue;
    balanceControl?.setValue(Math.round(converted * 100) / 100);
  }

}
