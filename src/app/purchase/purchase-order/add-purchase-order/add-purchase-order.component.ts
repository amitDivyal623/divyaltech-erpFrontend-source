import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, Subject, forkJoin } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { StockService } from 'src/app/services/stock.service';
import { ProjectService } from 'src/app/services/project.service';
import { PurchaseOrderService } from 'src/app/services/purchase-order.service';
import { HrService } from 'src/app/services/hr.service';
import Swal from 'sweetalert2';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';



@Component({
  selector: 'app-add-purchase-order',
  templateUrl: './add-purchase-order.component.html',
  styleUrls: ['./add-purchase-order.component.css']
})
export class AddPurchaseOrderComponent implements OnInit, OnDestroy {

  minDate = { year: 1900, month: 1, day: 1 };
  maxDate = { year: 2099, month: 12, day: 31 };
  private destroy$ = new Subject<void>();
  // productList: FormGroup;
  purchaseOrderForm: FormGroup;
  PRLists: any[] = [];
  AllItemsListings: any[] = [];

  vendorNameState: any[] = [];
  companyNameState: any[] = [];
  warehouseLists: any[] = [];
  employeeLists: any[] = [];
  showCgstSgst: Boolean = false;
  showIgst: Boolean = false;
  grandTotal: number = 0;
  grandCgst: number = 0;
  grandSgst: number = 0;
  grandIgst: number = 0;
  selectedEmployeeId: string = '';
  selectedVendor: string = '';
  selectedCompany: string = '';
  submitted = false;
  globalVendorState: string = '';
  globalCompanyState: string = '';
  vendorStates: string[] = [];
  companyStates: string[] = [];
  max_id = Number;
  showAddButton = true;
  showRemoveButton = true;
  showSubmitButton = true;
  isViewMode = true;
  mode: string | null = null;
  isEditOrViewMode: boolean = false;
  headerTitle: string | undefined;
  isSubmitting: boolean = false;
  projectsList: any[];



  constructor(private fb: FormBuilder, private stockService: StockService, private POService: PurchaseOrderService, private projectService: ProjectService, private hrService: HrService, private router: Router, private route: ActivatedRoute, private datepipe: DatePipe) {
    // this.productList = fb.group({
    //   products: fb.array([])
    // })
  }

  ngOnInit(): void {
    this.purchaseOrderForm = this.fb.group({
      purchase_order_id: new FormControl(''),
      poNumber: new FormControl(''),
      prNumber: new FormControl('', Validators.required),
      orderDate: new FormControl('', Validators.required),
      expiryDate: new FormControl('', Validators.required),
      orderType: new FormControl('purchase_order'),
      orderBy: new FormControl('', Validators.required),
      toWarehouse: new FormControl('', Validators.required),
      vendorName: new FormControl(''),
      companyName: new FormControl(''),
      remarks: new FormControl(''),
      grandCgst: new FormControl(''),
      grandSgst: new FormControl(''),
      grandIgst: new FormControl(''),
      grandTotal: new FormControl(''),
      projectName: new FormControl(''),
      globalGST: new FormControl(),
      productList: this.fb.array([])
    });

    this.addProduct();
    this.getPRLists();
    this.fetchVendorNameState();
    // this.fetchCompanyNameState();
    this.fetchAllWarehouse();
    this.fetchAllEmpoyee();
    this.fetchMaxPOId();
    this.getProjectsLists();

    const purchaseOrderId = this.route.snapshot.paramMap.get('purchase_order_id');
    this.mode = this.route.snapshot.queryParamMap.get('mode');

    this.isEditOrViewMode = this.mode === 'edit' || this.mode === 'view';
    this.headerTitle = this.mode === 'edit' ? 'Edit Purchase Order' : this.mode === 'view' ? 'View Purchase Order' : 'Add Purchase Order';

    if (!purchaseOrderId) {
      this.purchaseOrderForm.patchValue({
        orderDate: this.datepipe.transform(new Date(), 'yyyy-MM-dd')
      });
    }

    if (purchaseOrderId) {
      const isViewMode = this.mode === 'view';
      const isEditMode = this.mode === 'edit';

      this.fetchPurchaseOrderDetails(purchaseOrderId, isViewMode);

      if (isViewMode || isEditMode) {
        this.disableProductFields(); // disable fields when in view/edit
        this.purchaseOrderForm.get('prNumber')?.disable();
        this.purchaseOrderForm.get('globalGST')?.disable();
      }
    }

  }

  disableProductFields(): void {
    const productList = this.purchaseOrderForm.get('productList') as FormArray;

    productList.controls.forEach((group: FormGroup) => {
      const disableFields = ['rate', 'vendorName', 'companyName', 'discount', 'gst', 'tamount', 'description'];
      disableFields.forEach(field => {
        const control = group.get(field);
        if (control) {
          control.disable();
        }
      });
    });
  }

  fetchMaxPOId() {
    this.purchaseOrderForm.get('poNumber')?.disable();
    let formdata = new FormData();
    this.stockService.fetchMaxPOId(formdata).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.max_id = resp;

      const nextId = (Number(this.max_id) || 0) + 1;
      const formattedPR = `PO-${String(nextId).padStart(4, '0')}`;
      const currentPoNumber = this.purchaseOrderForm.get('poNumber')?.value;
      if (!currentPoNumber) {
        this.purchaseOrderForm.patchValue({
          poNumber: formattedPR
        });
      }
    });
  }


  get products(): FormArray {
    return this.purchaseOrderForm.get("productList") as FormArray
  }
  addProduct() {
    this.products.push(this.newProducts());
    const index = this.products.length - 1;
    const globalGST = this.purchaseOrderForm.get('globalGST')?.value;
    if (globalGST !== null && globalGST !== undefined && globalGST !== '') {
      this.products.at(index).patchValue({ gst: globalGST }, { emitEvent: false });
      this.recalculateProductAmounts(index);
    }
  }
  newProducts(): FormGroup {
    return this.fb.group({
      itemId: new FormControl(''),
      itemName: new FormControl(''),
      vendorName: new FormControl('', Validators.required),
      companyName: new FormControl('', Validators.required),
      unit: new FormControl(''),
      quantity: new FormControl(''),
      rate: new FormControl('', Validators.required),
      amount: new FormControl(''),
      gst: new FormControl(''),
      cgst: new FormControl(''),
      sgst: new FormControl(''),
      igst: new FormControl(''),
      tamount: new FormControl(''),
      discount: new FormControl(''),
      reqDate: new FormControl(''),
      description: new FormControl('')
    });
  }

  removeProduct(i) {
    this.products.removeAt(i);
    this.calculateGrandTotal();
  }
  setProductValue(i) {
    this.products.at(i).setValue({
      itemId: this.products.at(i).value.itemId,
      itemName: this.products.at(i).value.itemName,
      vendorName: this.products.at(i).value.vendorName,
      companyName: this.products.at(i).value.companyName,
      unit: this.products.at(i).value.unit,
      quantity: this.products.at(i).value.quantity,
      reqDate: this.products.at(i).value.reqDate
    });
  }

  getPRLists() {
    let formData = new FormData();
    this.POService.getPRLists(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.PRLists = resp.data;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // onPRChange(event: any): void {
  //   let formData = new FormData();

  //   formData.append('request_id', event.target.value);
  //   this.POService.getItemsOnPRChange(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
  //     this.AllItemsListings = resp.data;
  //   });
  // }


  onPRChange(event: any): void {
    const prNumber = event.target.value;
    if (!prNumber) return;

    let formData = new FormData();
    formData.append('request_id', prNumber);

    this.POService.getItemsOnPRChange(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe(resp => {
        this.AllItemsListings = resp.data || [];

        this.purchaseOrderForm.patchValue({ projectName: this.AllItemsListings?.[0]?.project });
        this.purchaseOrderForm.get('projectName')?.disable();
        // Clear existing rows
        this.products.clear();

        // Add new rows for each item from backend
        this.AllItemsListings.forEach((item: any) => {
          this.products.push(this.fb.group({
            itemId: new FormControl(item.item_id || ''),
            itemName: new FormControl(item.item || ''),
            unit: new FormControl(item.unit || ''),
            vendorName: new FormControl(item.vendorName || '', Validators.required),
            companyName: new FormControl(item.companyName || '', Validators.required),
            quantity: new FormControl(item.quantity || ''),
            rate: new FormControl(item.rate || '', Validators.required),
            amount: new FormControl(item.amount || ''),
            gst: new FormControl(item.gst || ''),
            cgst: new FormControl(item.cgst || ''),
            sgst: new FormControl(item.sgst || ''),
            igst: new FormControl(item.igst || ''),
            tamount: new FormControl(item.total_amount || ''),
            discount: new FormControl(item.discount || ''),
            reqDate: new FormControl(item.reqDate || ''),
            description: new FormControl('')
          }));
        });

        const globalGST = this.purchaseOrderForm.get('globalGST')?.value;
        if (globalGST !== null && globalGST !== undefined && globalGST !== '') {
          this.onGlobalGSTChange(globalGST);
        }
      });

  }

  fetchVendorNameState() {
    let formData = new FormData();
    this.POService.fetchVendorNameState(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.vendorNameState = resp.data;
    });
  }

  // fetchCompanyNameState() {
  //   let formData = new FormData();
  //   this.POService.fetchCompanyNameState(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
  //     this.companyNameState = resp.data;
  //   });
  // }

  fetchAllWarehouse() {
    let formData = new FormData();
    this.projectService.getAllWarehouselists(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.warehouseLists = resp.data;
    })
  }

  fetchAllEmpoyee() {
    let formdata = new FormData();
    this.hrService.getEmployee(formdata).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.employeeLists = resp.data;
      const currentUser = sessionStorage.getItem('UserName');
      if (currentUser) {
        const lowerUser = currentUser.toLowerCase();

        const foundEmployee = this.employeeLists.find(
          (emp: any) => emp.EmployeeName?.toLowerCase() === lowerUser
        );

        if (foundEmployee) {
          this.selectedEmployeeId = foundEmployee.EmployeeId;  //  Auto-select if matched
        } else {
          this.selectedEmployeeId = null;           //  Leave unselected
        }
      }
    });
  }

  onGlobalVendorChange(value: string) {
    if (!value) return;
    const [vendorName, vendorState] = value.split('||');
    this.globalVendorState = vendorState;

    this.purchaseOrderForm.get('vendorName')?.setValue(vendorName, { emitEvent: false });

    const selectedVendorData = this.vendorNameState.find((vendor: any) =>
      vendor.vendor_name === vendorName && vendor.state_name === vendorState
    );

    let companyName = this.purchaseOrderForm.get('companyName')?.value || '';
    if (selectedVendorData?.company_name) {
      companyName = selectedVendorData.company_name;
      this.globalCompanyState = selectedVendorData.state_name || '';
      this.purchaseOrderForm.get('companyName')?.setValue(companyName, { emitEvent: false });
    }

    this.products.controls.forEach((group: FormGroup, index: number) => {
      group.patchValue({ vendorName, companyName }, { emitEvent: false });
      this.vendorStates[index] = vendorState;
      this.companyStates[index] = this.globalCompanyState || '';
      this.updateTaxControls(index);
    });
  }

  onGlobalCompanyChange(value: string) {
    if (!value) return;
    const [companyName, companyState] = value.split('||');
    this.globalCompanyState = companyState;

    this.purchaseOrderForm.get('companyName')?.setValue(companyName, { emitEvent: false });

    const selectedCompanyData = this.vendorNameState.find((vendor: any) =>
      vendor.company_name === companyName && vendor.state_name === companyState
    );

    let vendorName = this.purchaseOrderForm.get('vendorName')?.value || '';
    if (selectedCompanyData?.vendor_name) {
      vendorName = selectedCompanyData.vendor_name;
      this.globalVendorState = selectedCompanyData.state_name || '';
      this.purchaseOrderForm.get('vendorName')?.setValue(vendorName, { emitEvent: false });
    }

    this.products.controls.forEach((group: FormGroup, index: number) => {
      group.patchValue({ vendorName, companyName }, { emitEvent: false });
      this.vendorStates[index] = this.globalVendorState || '';
      this.companyStates[index] = companyState;
      this.updateTaxControls(index);
    });
  }

  private getVendorCompanyMapping(
    field: 'vendor' | 'company',
    value: string,
    state: string
  ): any {
    return this.vendorNameState.find((vendor: any) =>
      field === 'vendor'
        ? vendor.vendor_name === value && vendor.state_name === state
        : vendor.company_name === value && vendor.state_name === state
    );
  }

  onVendorChange(value: string, index: number) {
    const parts = value ? value.split('||') : [];
    const vendorName = parts[0] || '';
    const vendorState = parts[1] || '';
    const selectedVendorData = this.getVendorCompanyMapping('vendor', vendorName, vendorState);
    const companyName = selectedVendorData?.company_name || this.products.at(index).get('companyName')?.value || '';
    const companyState = selectedVendorData?.state_name || this.companyStates[index] || '';

    this.products.at(index).patchValue({ vendorName, companyName }, { emitEvent: false });
    this.vendorStates[index] = vendorState;
    this.companyStates[index] = companyState;
    this.updateTaxControls(index);
  }

  onCompanyChange(value: string, index: number) {
    const parts = value ? value.split('||') : [];
    const companyName = parts[0] || '';
    const companyState = parts[1] || '';
    const selectedCompanyData = this.getVendorCompanyMapping('company', companyName, companyState);
    const vendorName = selectedCompanyData?.vendor_name || this.products.at(index).get('vendorName')?.value || '';
    const vendorState = selectedCompanyData?.state_name || this.vendorStates[index] || '';

    this.products.at(index).patchValue({ vendorName, companyName }, { emitEvent: false });
    this.vendorStates[index] = vendorState;
    this.companyStates[index] = companyState;
    this.updateTaxControls(index);
  }


  updateTaxControls(index: number) {
    const productGroup = this.products.at(index);
    const vendorState = this.vendorStates[index];
    const companyState = this.companyStates[index];

    if (vendorState && companyState) {
      if (vendorState === companyState) {
        productGroup.get('cgst')?.enable({ emitEvent: false });
        productGroup.get('sgst')?.enable({ emitEvent: false });
        productGroup.get('igst')?.disable({ emitEvent: false });
      } else {
        productGroup.get('cgst')?.disable({ emitEvent: false });
        productGroup.get('sgst')?.disable({ emitEvent: false });
        productGroup.get('igst')?.enable({ emitEvent: false });
      }
      this.recalculateProductAmounts(index);
    } else {
      productGroup.get('cgst')?.disable({ emitEvent: false });
      productGroup.get('sgst')?.disable({ emitEvent: false });
      productGroup.get('igst')?.disable({ emitEvent: false });
      this.recalculateProductAmounts(index);
    }
  }


  onRateChange(index: number) {
    this.recalculateProductAmounts(index);
  }

  onDiscountChange(index: number) {
    this.recalculateProductAmounts(index);
  }


  onGstChange(index: number) {
    this.recalculateProductAmounts(index);
  }

  onGlobalGSTChange(value: any) {
    this.purchaseOrderForm.get('globalGST')?.setValue(value, { emitEvent: false });

    this.products.controls.forEach((group: FormGroup, index: number) => {
      group.patchValue({ gst: value }, { emitEvent: false });
      this.recalculateProductAmounts(index);
    });
  }

  private recalculateProductAmounts(index: number): void {
    const productGroup = this.products.at(index);
    const quantity = parseFloat(productGroup.get('quantity')?.value) || 0;
    const rate = parseFloat(productGroup.get('rate')?.value) || 0;
    const discount = parseFloat(productGroup.get('discount')?.value) || 0;
    const gst = parseFloat(productGroup.get('gst')?.value) || 0;
    const baseAmount = (quantity * rate) - discount;
    const gstAmount = baseAmount * gst;
    const cgstControl = productGroup.get('cgst');
    const sgstControl = productGroup.get('sgst');
    const igstControl = productGroup.get('igst');

    productGroup.get('amount')?.setValue(baseAmount.toFixed(2), { emitEvent: false });

    // Calculate percentage values
    const gstPercentage = gst * 100; // Convert to percentage
    const halfGstPercentage = gst * 50; // Half for CGST/SGST

    // Format percentage - show decimals only if not a whole number
    const formatPercentage = (value: number): string => {
      return value % 1 === 0 ? value.toFixed(0) : value.toFixed(2);
    };

    const gstPercentageStr = formatPercentage(gstPercentage);
    const halfGstPercentageStr = formatPercentage(halfGstPercentage);

    if (igstControl?.enabled) {
      // IGST gets full GST percentage and amount
      igstControl.setValue(`${gstAmount.toFixed(2)} (${gstPercentageStr}%)`, { emitEvent: false });
      cgstControl?.setValue('0 (0%)', { emitEvent: false });
      sgstControl?.setValue('0 (0%)', { emitEvent: false });
    } else if (cgstControl?.enabled && sgstControl?.enabled) {
      // CGST and SGST split the percentage and amount equally
      const splitAmount = (gstAmount / 2).toFixed(2);
      cgstControl.setValue(`${splitAmount} (${halfGstPercentageStr}%)`, { emitEvent: false });
      sgstControl.setValue(`${splitAmount} (${halfGstPercentageStr}%)`, { emitEvent: false });
      igstControl?.setValue('0 (0%)', { emitEvent: false });
    } else {
      cgstControl?.setValue('0 (0%)', { emitEvent: false });
      sgstControl?.setValue('0 (0%)', { emitEvent: false });
      igstControl?.setValue('0 (0%)', { emitEvent: false });
    }

    // Calculate total amount = base amount + GST amount
    const totalAmount = baseAmount + gstAmount;
    productGroup.get('tamount')?.setValue(totalAmount.toFixed(2), { emitEvent: false });

    this.calculateGrandTotal();
  }


  calculateTotalAmount(index: number) {
    this.recalculateProductAmounts(index);
  }

  calculateGrandTotal() {
    let total = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;
    this.products.controls.forEach((group) => {
      const amount = parseFloat(group.get('tamount')?.value) || 0;
      total += amount;
      // Extract CGST, SGST, IGST numeric values
      const cgstVal = this.extractNumericValue(group.get('cgst')?.value);
      const sgstVal = this.extractNumericValue(group.get('sgst')?.value);
      const igstVal = this.extractNumericValue(group.get('igst')?.value);

      totalCgst += cgstVal;
      totalSgst += sgstVal;
      totalIgst += igstVal;
    });

    this.grandTotal = total;
    this.grandCgst = totalCgst;
    this.grandSgst = totalSgst;
    this.grandIgst = totalIgst;
    this.purchaseOrderForm.get('grandTotal')?.setValue(total.toFixed(2));
    this.purchaseOrderForm.get('grandCgst')?.setValue(totalCgst.toFixed(2));
    this.purchaseOrderForm.get('grandSgst')?.setValue(totalSgst.toFixed(2));
    this.purchaseOrderForm.get('grandIgst')?.setValue(totalIgst.toFixed(2));
  }

  private extractNumericValue(value: any): number {
    if (!value) return 0;
    const stringValue = value.toString().trim();
    // Split by '(' and take the first part, then trim and parse
    const numericPart = stringValue.split('(')[0].trim();
    const parsed = parseFloat(numericPart);
    return isNaN(parsed) ? 0 : parsed;
  }

  formatDate(date: NgbDateStruct): string {
    if (!date) return '';
    const month = date.month.toString().padStart(2, '0');
    const day = date.day.toString().padStart(2, '0');
    return `${day}-${month}-${date.year}`; // YYYY-MM-DD
  }

  savePurchaseOrder() {
    if (this.isSubmitting) return;
    this.isSubmitting = true;
    const safeValue = (val: any) => (val !== null && val !== undefined && val !== '' ? val : 0);
    if (this.purchaseOrderForm.valid) {
      const products = this.products.getRawValue();;

      //  Step 1: Group products by vendorName + companyName
      const groupedProducts = products.reduce((acc, item) => {
        const key = `${item.vendorName}-${item.companyName}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      }, {} as { [key: string]: any[] });

      // Step 2: Get base PO number and prepare for increment
      const basePOString = this.purchaseOrderForm.get('poNumber')?.value || 'PO-0000';

      // Extract numeric part from formatted PO number (e.g., 'PO-0022' -> 22)
      const basePONumber = parseInt(basePOString.replace('PO-', '')) || 0;
      const groupKeys = Object.keys(groupedProducts);
      const isMultipleGroups = groupKeys.length > 1;

      //  Step 3: Build API calls array
      const apiCalls = [];

      Object.keys(groupedProducts).forEach((key, index) => {
        const group = groupedProducts[key];

        const formData = new FormData();

        const purchase_order_id = this.purchaseOrderForm.get('purchase_order_id').value;
        if (purchase_order_id) formData.append('purchase_order_id', purchase_order_id);


        // Determine PO number: increment for multiple groups, use same for single group
        const currentPONumber = isMultipleGroups ? (basePONumber + index) : basePONumber;
        // Reformat back to 'PO-XXXX' format
        const formattedPONumber = `PO-${String(currentPONumber).padStart(4, '0')}`;

        formData.append('poNumber', formattedPONumber);
        formData.append('prNumber', this.purchaseOrderForm.get('prNumber')?.value);
        formData.append('orderDate', this.purchaseOrderForm.get('orderDate')?.value);
        formData.append('expiry_date', this.purchaseOrderForm.get('expiryDate')?.value);
        formData.append('order_type', this.purchaseOrderForm.get('orderType')?.value);
        formData.append('ordered_by', this.purchaseOrderForm.get('orderBy')?.value);
        formData.append('toWarehouse', this.purchaseOrderForm.get('toWarehouse')?.value);
        formData.append('projectName', this.purchaseOrderForm.get('projectName')?.value);
        formData.append('globalGST', this.purchaseOrderForm.get('globalGST')?.value);

        const vendorNameGlobal = this.purchaseOrderForm.get('vendorName')?.value || '';
        const companyNameGlobal = this.purchaseOrderForm.get('companyName')?.value || '';

        let [vendorName, vendorState] = vendorNameGlobal.split('||');
        if (!vendorState) vendorState = this.globalVendorState || '';
        let [companyName, companyState] = companyNameGlobal.split('||');
        if (!companyState) companyState = this.globalCompanyState || '';

        // formData.append('vendorNameGlobal', vendorName || '');
        // formData.append('vendorStateGlobal', vendorState || '');
        // formData.append('companyNameGlobal', companyName || '');
        // formData.append('companyStateGlobal', companyState || '');
        formData.append('remarks', this.purchaseOrderForm.get('remarks')?.value);
        // formData.append('grandCgst', this.purchaseOrderForm.get('grandCgst')?.value);
        // formData.append('grandSgst', this.purchaseOrderForm.get('grandSgst')?.value);
        // formData.append('grandIgst', this.purchaseOrderForm.get('grandIgst')?.value);
        // formData.append('grandTotal', this.purchaseOrderForm.get('grandTotal')?.value);

        //  Step 4: Append product data

        if (group.length > 1) {
          // Multiple products with same vendor + company → comma separated
          formData.append('itemName', group.map(p => p.itemName).join(','));
          formData.append('itemId', group.map(p => p.itemId).join(','));
          formData.append('unit', group.map(p => p.unit).join(','));
          formData.append('description', group.map(p => p.description || '').join(','));

          // Use the stored state arrays as primary source, fallback to splitting form values
          formData.append(
            'vendorName',
            (group[0].vendorName.split('||')[0] || group[0].vendorName)
          );
          formData.append(
            'vendorNameGlobal',
            (group[0].vendorName.split('||')[0] || group[0].vendorName)
          );


          formData.append('vendorState', group.map((p, idx) => {
            // Try to get from vendorStates array first, then fallback to splitting
            return this.vendorStates[idx] || p.vendorName.split('||')[1] || '';
          }).join(','));
          formData.append('vendorStateGlobal', group.map((p, idx) => {
            // Try to get from vendorStates array first, then fallback to splitting
            return this.vendorStates[idx] || p.vendorName.split('||')[1] || '';
          }).join(','));

          formData.append(
            'companyName',
            (group[0].companyName.split('||')[0] || group[0].companyName)
          );
          formData.append(
            'companyNameGlobal',
            (group[0].companyName.split('||')[0] || group[0].companyName)
          );

          formData.append('companyState', group.map((p, idx) => {
            // Try to get from companyStates array first, then fallback to splitting
            return this.companyStates[idx] || p.companyName.split('||')[1] || '';
          }).join(','));
          formData.append('companyStateGlobal', group.map((p, idx) => {
            // Try to get from companyStates array first, then fallback to splitting
            return this.companyStates[idx] || p.companyName.split('||')[1] || '';
          }).join(','));

          // Rest of your code remains the same...
          formData.append('quantity', group.map(p => p.quantity).join(','));
          formData.append('rate', group.map(p => p.rate).join(','));
          formData.append('discount', group.map(p => p.discount).join(','));
          formData.append('amount', group.map(p => p.amount).join(','));
          formData.append('gst', group.map(p => p.gst).join(','));
          formData.append('tamount', group.map(p => p.tamount).join(','));


          // Store comma-separated cgst, sgst, igst values
          const cgstValues = group.map(p => safeValue(p.cgst)).join(',');
          const sgstValues = group.map(p => safeValue(p.sgst)).join(',');
          const igstValues = group.map(p => safeValue(p.igst)).join(',');

          formData.append('cgst', cgstValues);
          formData.append('sgst', sgstValues);
          formData.append('igst', igstValues);

          // Calculate the SUM of all cgst, sgst, igst values in this group
          const totalCgst = group.reduce((sum, p) => {
            const value = safeValue(p.cgst).toString().split('(')[0].trim();
            return sum + parseFloat(value || 0);
          }, 0);

          const totalSgst = group.reduce((sum, p) => {
            const value = safeValue(p.sgst).toString().split('(')[0].trim();
            return sum + parseFloat(value || 0);
          }, 0);

          const totalIgst = group.reduce((sum, p) => {
            const value = safeValue(p.igst).toString().split('(')[0].trim();
            return sum + parseFloat(value || 0);
          }, 0);

          const totalAmount = group.reduce((sum, p) => {
            return sum + parseFloat(p.tamount || 0);
          }, 0);



          // Append the summed grand totals
          formData.append('grandCgst', totalCgst.toFixed(2));
          formData.append('grandSgst', totalSgst.toFixed(2));
          formData.append('grandIgst', totalIgst.toFixed(2));
          formData.append('grandTotal', totalAmount.toFixed(2));


        } else {
          // Single product → append directly (no comma separation)
          const p = group[0];

          const index = this.products.value.findIndex(prod =>
            prod.itemId === p.itemId &&
            prod.itemName === p.itemName &&
            prod.vendorName === p.vendorName &&
            prod.companyName === p.companyName
          );

          const [vendorNameOnly, vendorStateOnly] = p.vendorName.split('||');
          const [companyNameOnly, companyStateOnly] = p.companyName.split('||');

          formData.append('itemName', p.itemName);
          formData.append('itemId', p.itemId);
          formData.append('description', p.description || '');
          formData.append('vendorName', vendorNameOnly || p.vendorName);
          formData.append('vendorNameGlobal', vendorNameOnly || p.vendorName);
          formData.append('vendorState', this.vendorStates[index] || vendorStateOnly || '');
          formData.append('vendorStateGlobal', this.vendorStates[index] || vendorStateOnly || '');
          formData.append('companyName', companyNameOnly || p.companyName);
          formData.append('companyNameGlobal', companyNameOnly || p.companyName);
          formData.append('companyState', this.companyStates[index] || companyStateOnly || '');
          formData.append('companyStateGlobal', this.companyStates[index] || companyStateOnly || '');
          formData.append('unit', p.unit);
          formData.append('quantity', p.quantity);
          formData.append('rate', p.rate);
          formData.append('discount', p.discount);
          formData.append('amount', p.amount);
          formData.append('gst', p.gst);
          formData.append('cgst', safeValue(p.cgst));
          formData.append('sgst', safeValue(p.sgst));
          formData.append('igst', safeValue(p.igst));
          formData.append('grandCgst', safeValue(p.cgst).split('(')[0].trim());
          formData.append('grandSgst', safeValue(p.sgst).split('(')[0].trim());
          formData.append('grandIgst', safeValue(p.igst).split('(')[0].trim());
          formData.append('tamount', p.tamount);
          formData.append('grandTotal', p.tamount);
        }


        apiCalls.push(this.POService.savePOData(formData));
      });

      //  Step 5: If multiple groups → forkJoin
      forkJoin(apiCalls).pipe(takeUntil(this.destroy$)).subscribe({
        next: (responses) => {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Purchase Order saved successfully!',
            confirmButtonColor: '#28a745',
          }).then(() => {
            this.isSubmitting = false;
            // Reset form and component state
            this.purchaseOrderForm.reset();
            (this.purchaseOrderForm.get('productList') as FormArray).clear();

            this.PRLists = [];
            this.AllItemsListings = [];
            this.vendorNameState = [];
            // this.companyNameState = [];
            this.warehouseLists = [];
            this.employeeLists = [];
            this.vendorStates = [];
            this.companyStates = [];

            this.showCgstSgst = false;
            this.showIgst = false;
            this.grandTotal = 0;
            this.selectedEmployeeId = '';
            this.selectedVendor = '';
            this.selectedCompany = '';
            this.submitted = false;
            this.globalVendorState = '';
            this.globalCompanyState = '';

            // Navigate after cleanup
            this.router.navigate(['/stock-po-pr'], { queryParams: { tab: 'Machinery' } });
          });
        },
        error: (err) => {
          console.error('Error saving PO:', err);
          this.isSubmitting = false;
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to save Purchase Order. Please try again.',
            confirmButtonColor: '#d33',
          });
        }
      });

    } else {
      this.isSubmitting = false;
      this.submitted = true;
      this.purchaseOrderForm.markAllAsTouched();
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fill in all the required fields before saving!',
        confirmButtonColor: '#d33',
        confirmButtonText: 'OK'
      });
    }
  }

  goBackToPO(): void {
    // Clear form and product list
    this.purchaseOrderForm.reset();
    const productList = this.purchaseOrderForm.get('productList') as FormArray;
    productList.clear();

    // Reset flags
    this.isViewMode = false;
    this.showSubmitButton = false;
    this.showAddButton = false;
    this.showRemoveButton = false;

    // Redirect to PO/PR page with PO tab active
    this.router.navigate(['/stock-po-pr'], { queryParams: { tab: 'Machinery' } });
  }




  async fetchPurchaseOrderDetails(purchaseOrderId: string, isViewMode: boolean): Promise<void> {
    this.isViewMode = isViewMode;
    this.purchaseOrderForm.enable();

    this.showAddButton = !isViewMode;
    this.showRemoveButton = !isViewMode;
    this.showSubmitButton = !isViewMode;

    try {
      // Wait for ALL dropdown data to load first using your original logic
      await this.loadAllDropdownData();

      // Now fetch the PO details - KEEPING YOUR EXACT PATCHING LOGIC
      const formData = new FormData();
      formData.append('purchaseOrderId', purchaseOrderId);

      this.POService.getPurchaseOrderById(formData).pipe(takeUntil(this.destroy$)).subscribe((response: any) => {
        const data = response?.data?.[0];
        console.log(data);
        if (!data) return;
        const orderDateFormatted = this.datepipe.transform(data.order_date, 'yyyy-MM-dd');
        const expiryDateFormatted = this.datepipe.transform(data.expiry_date, 'yyyy-MM-dd');

        // YOUR EXACT PATCHING LOGIC - NO CHANGES
        this.purchaseOrderForm.patchValue({
          purchase_order_id: data.purchase_order_id,
          poNumber: data.purchase_order_number || '',
          prNumber: data.purchase_number || '',
          orderDate: orderDateFormatted || '',
          expiryDate: expiryDateFormatted || '',
          orderType: data.order_type || 'purchase_order',
          orderBy: data.ordered_by || '',
          toWarehouse: data.to_warehouse || '',
          // projectName: data.projectName || '',
          vendorName: data.vendor_name_global || '',     // only name here
          companyName: data.company_name_global || '',   // only name here
          globalGST: data.gst_global,
          remarks: data.remarks || '',
          grandCgst: data.grand_cgst || '',
          grandSgst: data.grand_sgst || '',
          grandIgst: data.grand_igst || '',
          grandTotal: data.grand_total || '',
          projectName: data.project_name || '',
 
        });

        // YOUR EXACT GLOBAL STATE LOGIC
        this.globalVendorState = data.vendor_state_global || '';
        this.globalCompanyState = data.company_state_global || '';




        // YOUR EXACT VIEW MODE LOGIC
        if (this.mode === 'view' || this.mode === 'edit') {
          setTimeout(() => this.disableProductFields(), 200);
          this.purchaseOrderForm.get('projectName')?.disable();
          this.purchaseOrderForm.get('globalGST')?.disable();
          // this.purchaseOrderForm.get('vendorName')?.disable();
          // this.purchaseOrderForm.get('companyName')?.disable();
        }

        // YOUR EXACT PRODUCT LIST LOGIC
        if (data && data.item_name) {
          this.setProductList([data]); // wrap `data` in an array since setProductList expects an array
        }

      }, (err) => {
        console.error('Error fetching PO data:', err);
      });

    } catch (error) {
      console.error('Error loading dropdown data:', error);
    }
  }

  private async loadAllDropdownData(): Promise<void> {
    // Using your original promise logic with proper async/await
    const vendorPromise = new Promise<void>((resolve) => {
      this.fetchVendorNameState();
      const checkVendor = setInterval(() => {
        if (this.vendorNameState?.length) {
          clearInterval(checkVendor);
          resolve();
        }
      }, 50);
    });

    const companyPromise = new Promise<void>((resolve) => {
      // this.fetchCompanyNameState();
      const checkCompany = setInterval(() => {
        if (this.vendorNameState?.length) {
          clearInterval(checkCompany);
          resolve();
        }
      }, 50);
    });

    const employeePromise = new Promise<void>((resolve) => {
      this.fetchAllEmpoyee();
      setTimeout(resolve, 200);
    });

    const warehousePromise = new Promise<void>((resolve) => {
      this.fetchAllWarehouse();
      setTimeout(resolve, 200);
    });

    const prListPromise = new Promise<void>((resolve) => {
      this.getPRLists();
      setTimeout(resolve, 200);
    });

    // Wait for all promises using await (better than .then())
    await Promise.all([vendorPromise, companyPromise, employeePromise, warehousePromise, prListPromise]);

  }

  setProductList(productsData: any[]): void {
    const productFormArray = this.purchaseOrderForm.get('productList') as FormArray;
    productFormArray.clear();

    productsData.forEach((product) => {
      const itemIds = product.itemId?.split(',') || [''];
      const itemNames = product.item_name?.split(',') || [''];
      const units = product.unit?.split(',') || [''];
      const quantities = product.quantity?.split(',') || [''];
      const rates = product.rate?.split(',') || [''];
      const discounts = product.discount?.split(',') || [''];
      const amounts = product.amount?.split(',') || [''];
      const gstValues = product.gst?.split(',') || [''];
      const cgsts = product.cgst?.split(',') || [''];
      const sgsts = product.sgst?.split(',') || [''];
      const igsts = product.igst?.split(',') || [''];
      const totalAmounts = product.total_amount?.split(',') || [''];
      const description = product.item_description?.split(',') || [''];

      // vendor & company states
      const vendorStates = product.vendor_state?.split(',') || [];
      const companyStates = product.company_state?.split(',') || [];

      itemNames.forEach((item, i) => {
        productFormArray.push(
          this.fb.group({
            itemName: [item || ''],
            itemId: [itemIds[i] || ''],
            unit: [units[i] || ''],
            description: [description[i] || ''],
            quantity: [quantities[i] || ''],
            rate: [rates[i] || ''],
            discount: [discounts[i] || ''],
            amount: [amounts[i] || ''],
            gst: [gstValues[i] || ''],
            cgst: [cgsts[i] || ''],
            sgst: [sgsts[i] || ''],
            igst: [igsts[i] || ''],
            tamount: [totalAmounts[i] || ''],

            // vendor & company name with state (important)
            vendorName: [
              (product.vendor_name || '') + '||' + (vendorStates[i] || vendorStates[0] || '')
            ],
            companyName: [
              (product.company_name || '') + '||' + (companyStates[i] || companyStates[0] || '')
            ],

            grandTotal: [product.grand_total || 0]
          })
        );

        // also maintain state arrays if used in template [value]
        this.vendorStates[i] = vendorStates[i] || vendorStates[0] || '';
        this.companyStates[i] = companyStates[i] || companyStates[0] || '';
      });
    });
  }

  onExpiryDateChange(): void {
    const orderDate = this.purchaseOrderForm.get('orderDate')?.value;
    const expiryDate = this.purchaseOrderForm.get('expiryDate')?.value;

    if (orderDate && expiryDate && new Date(expiryDate) < new Date(orderDate)) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Expiry Date',
        text: 'Expiry date cannot be before the order date!',
        confirmButtonColor: '#3085d6',
      });

      // Reset expiry date field
      this.purchaseOrderForm.get('expiryDate')?.setValue('');
    }
  }

  getUniqueStates(stateString: string): string {
    if (!stateString) return '';
    const states = stateString.split(',').map(s => s.trim()).filter(Boolean);
    // Remove duplicates
    const uniqueStates = Array.from(new Set(states));
    return uniqueStates.join(', ');
  }

  getProjectsLists() {
    let formData = new FormData();
    this.projectService.getAllProjectsLists(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.projectsList = resp.data;
    });
  }

}
