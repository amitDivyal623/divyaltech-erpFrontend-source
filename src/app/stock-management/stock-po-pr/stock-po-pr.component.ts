import { Component, ElementRef, OnInit, OnDestroy, ViewChild, ViewChildren } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators, FormArray, FormControlName } from '@angular/forms';
import { forkJoin, from, Subject } from 'rxjs';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { ProjectService } from 'src/app/services/project.service';
import { distinctUntilChanged, switchMap, map, takeUntil, take } from 'rxjs/operators';
import { CrmService } from 'src/app/services/crm.service';
import { StockService } from 'src/app/services/stock.service';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
import { DataTableDirective } from 'angular-datatables';
import { DatePipe } from '@angular/common';
import { AfterViewChecked } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AdminService } from 'src/app/services/admin.service';

class DataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}
@Component({
  selector: 'app-stock-po-pr',
  templateUrl: './stock-po-pr.component.html',
  styleUrls: ['./stock-po-pr.component.scss']
})

export class StockPoPrComponent implements OnInit, OnDestroy {

  minDate = { year: 1900, month: 1, day: 1 };
  maxDate = { year: 2099, month: 12, day: 31 };
  activeTab = 'Vendor';
  @ViewChild('closebutton') closebutton;
  @ViewChildren(DataTableDirective) dtElement: any;
  @ViewChild('closePRModal') closePRModal: ElementRef;

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  dtOptions1: DataTables.Settings = {};
  dtTrigger1: Subject<any> = new Subject<any>();
  private destroy$ = new Subject<void>();
  projectsList: any[];
  employee: any[];
  categoryLists = [];
  subcategoryLists = [];
  materialsList = [];
  categorySearchLists = [];
  subcategorySearchLists = [];
  materialsSearchList = [];
  prDetailsData = [];
  poDetailsData = [];
  unitListByIndex: any[] = [];
  max_id = Number;
  purchaseRequestList: any[];
  allEmployeesList: any[];
  filteredSubcategoryLists: any[];
  filteredMaterialsList: any[];
  filteredSearchSubcategoryLists: any[];
  filteredSearchMaterialsList: any[];
  filteredSubcategoryListsByIndex: { [key: number]: any[] } = {};
  filteredMaterialsListByIndex: { [key: number]: any[] } = {};
  hidePRSaveButton: boolean = true;
  previewData: any;
  showModal = false;
  isProjectCoordinator: boolean = false;



  purchaseRequestForm: FormGroup;
  prDatatableParameter: { prNumber: any; requestedDate: any, requestedBy: any, submittedBy: any, projectName: any, itemCategory: any, itemSubCategory: any, itemName: any };
  poDatatableParameter: {};
  poForm: FormGroup;

  constructor(private adminservice: AdminService, private fb: FormBuilder, private ProjectService: ProjectService, private crmservice: CrmService, private stockService: StockService, private http: HttpClient, private datePipe: DatePipe, private router: Router, private activateRoute: ActivatedRoute) {
    this.prDatatableParameter = { prNumber: "", requestedDate: "", requestedBy: "", submittedBy: "", projectName: "", itemCategory: "", itemSubCategory: "", itemName: "" };
    this.poDatatableParameter = {};
  }

  searchPRForm = new FormGroup({
    prNumber: new FormControl(),
    requestedDate: new FormControl(),
    requestedBy: new FormControl(),
    submittedBy: new FormControl(),
    projectName: new FormControl(),
    itemCategory: new FormControl(),
    itemSubCategory: new FormControl(),
    itemName: new FormControl(),
  });

  PRPOformGroup = new FormGroup({
    PRPending: new FormControl(),
    POPending: new FormControl(),
  });

  ngOnInit(): void {
    this.purchaseRequestForm = this.fb.group({
      request_id: [''],
      purchase_request_no: [''],
      projectName: ['', Validators.required],
      requested_by: [''],
      request_date: ['', Validators.required],
      contact_no: [''],
      submitted_by: [''],
      priority: [''],
      status: [''],
      description: [''],
      materials: this.fb.array([])
    });

    this.prDatatablecode();
    this.poDatatablecode();
    this.getProjectsLists();
    this.getSearchCategoryLists();
    this.getSearchSubCategoryLists();
    this.getSearchAllMaterialLists();
    // this.fetchMaxId();
    this.fetchAllPR();
    this.fetchAllEmployees();

    this.activateRoute.queryParams.pipe(take(1), takeUntil(this.destroy$)).subscribe(params => {
      const tabParam = params['tab'];

      if (this.isProjectCoordinator) {
        // Force PR tab if user is Project Coordinator
        this.activeTab = 'Vendor';
      } else {
        this.activeTab = tabParam || 'Vendor';
      }

      if (tabParam) {
        this.router.navigate([], { queryParams: {}, replaceUrl: true });
      }
    });


    this.poForm = this.fb.group({
      purchaseOrders: this.fb.array([])
    });

    const roleString = sessionStorage.getItem('UserRole') || '';
    const roles = roleString.split(',').map(r => r.trim());

    this.isProjectCoordinator = roles.includes('Project Coordinator');
  }



  get materials(): FormArray {
    return this.purchaseRequestForm.get('materials') as FormArray;
  }


  createMaterial(): FormGroup {
    return this.fb.group({
      itemCategory: ['', Validators.required],
      itemSubCategory: ['', Validators.required],
      itemName: ['', Validators.required],
      master_item_id: [''],
      quantity: [0, [Validators.required, Validators.min(1)]],
      unit: ['', Validators.required],
      currentBalance: [{ value: 0, disabled: true }, Validators.required],
      hsnCode: ['']
    });
  }

  getSearchCategoryLists() {
    let formData = new FormData();
    this.ProjectService.getAllCategoryLists(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.categorySearchLists = resp.data;
    });
  }
  getSearchSubCategoryLists() {
    let formData = new FormData();
    this.ProjectService.getAllSubCategoryLists(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.subcategorySearchLists = resp.data;
      this.filteredSearchSubcategoryLists = [...this.subcategorySearchLists];
    });
  }
  getSearchAllMaterialLists() {
    let formData = new FormData();
    this.ProjectService.getAllMaterialsLists(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.materialsSearchList = resp.data;
      this.filteredSearchMaterialsList = [...this.materialsSearchList];
    });
  }
  onSearchCategoryChange(selected: any) {

    const groupId = typeof selected === 'string'
      ? selected
      : selected?.group_id;

    if (groupId) {
      this.filteredSearchSubcategoryLists = this.subcategorySearchLists.filter(
        sub => sub.group_id === groupId
      );
    } else {
      this.filteredSearchSubcategoryLists = [];
    }

    this.searchPRForm.get('itemSubCategory')?.setValue(null); // ✅ use null
  }
  onSearchSubCategoryChange(selected: any) {

    const subGroupId = typeof selected === 'string'
      ? selected
      : selected?.sub_group_id;

    if (subGroupId) {
      this.filteredSearchMaterialsList = this.materialsSearchList.filter(
        mat => mat.sub_group_id === subGroupId
      );
    } else {
      this.filteredSearchMaterialsList = [];
    }

    this.searchPRForm.get('itemName')?.setValue(null); // ✅ use null
  }
  onSearchItemChange(selectedItem: any) {
    if (!selectedItem) return;

    const subCategoryId = selectedItem.sub_group_id;
    const categoryId = selectedItem.group_id;

    // update form
    this.searchPRForm.patchValue({
      itemCategory: categoryId || '',
      itemSubCategory: subCategoryId || '',
      itemName: selectedItem.itemname
    });

    // update filtered lists
    this.filteredSearchSubcategoryLists = this.subcategorySearchLists.filter(
      sub => sub.group_id === categoryId
    );
    this.filteredSearchMaterialsList = this.materialsSearchList.filter(
      mat => mat.sub_group_id === subCategoryId
    );
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

  getAllMaterialLists() {
    let formData = new FormData();
    this.ProjectService.getAllMaterialsLists(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.materialsList = resp.data;
      this.filteredMaterialsList = [...this.materialsList];
    });
  }

  onMaterialChange(selectedMaterial: any, index: number) {

    const materialForm = this.materials.at(index) as FormGroup;

    if (selectedMaterial) {
      const selectedCategoryId = selectedMaterial.group_id;
      const selectedSubCategoryId = selectedMaterial.sub_group_id;
      const selectedMaterialName = selectedMaterial.itemname;
      const selectedmasterItemId = selectedMaterial.master_item_id;

      // Set category & subcategory for this row
      materialForm.patchValue({
        itemCategory: selectedCategoryId,
        itemSubCategory: selectedSubCategoryId,
        itemName: selectedMaterialName,
        master_item_id: selectedmasterItemId,
      });

      // Filter subcategories for this row only
      this.filteredSubcategoryListsByIndex[index] = this.subcategoryLists.filter(
        sub => sub.group_id === selectedCategoryId
      );

      // Filter materials for this row only
      this.filteredMaterialsListByIndex[index] = this.materialsList.filter(
        item =>
          item.group_id === selectedCategoryId &&
          item.sub_group_id === selectedSubCategoryId
      );

      this.loadUnitsForMaterial(selectedmasterItemId, index);

      let cbFormData = new FormData();
      cbFormData.append('groupid', selectedMaterial.group_id);
      cbFormData.append('subgroupid', selectedMaterial.sub_group_id);
      cbFormData.append('itemname', selectedMaterial.itemname);
      this.ProjectService.getTotalCurrentBalance(cbFormData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
        const current_balance = resp.data[0]?.current_balance;
        materialForm.get('currentBalance')?.setValue(current_balance);
      })

    } else {
      // Reset row if user clears selection
      materialForm.patchValue({
        itemCategory: '',
        itemSubCategory: '',
        itemName: '',
        unit: ''
      });

      this.unitListByIndex[index] = [];
      // materialForm.get('unit')?.setValue('');

      // Reset filtered lists for this row
      this.filteredSubcategoryListsByIndex[index] = [...this.subcategoryLists];
      this.filteredMaterialsListByIndex[index] = [...this.materialsList];
    }
  }


  private loadUnitsForMaterial(materialId: string, index: number, preselectedUnit: string = '', preselectedHsnCode: string = ''): void {
    if (!materialId) {
      this.unitListByIndex[index] = [];
      return;
    }

    const materialForm = this.materials.at(index) as FormGroup;
    const formData = new FormData();
    formData.append('itemName', materialId);

    this.ProjectService.getUnitsByMaterial(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((resp) => {
        const units = [...(resp.data || [])];
        const normalizedUnit = (preselectedUnit || '').trim();
        const normalizedHsnCode = (preselectedHsnCode || '').trim();

        if (normalizedUnit && !units.some(unit => unit.unit_name === normalizedUnit)) {
          units.push({
            unit_name: normalizedUnit,
            hsncode: normalizedHsnCode
          });
        }

        this.unitListByIndex[index] = units;

        const unitToSet = normalizedUnit || units[0]?.unit_name || '';
        const hsnToSet = normalizedHsnCode && normalizedHsnCode !== 'null'
          ? normalizedHsnCode
          : (units[0]?.hsncode && units[0]?.hsncode !== 'null' ? units[0].hsncode : '');

        materialForm.patchValue({
          unit: unitToSet,
          hsnCode: hsnToSet
        }, { emitEvent: false });
      });
  }

  prDatatablecode() {
    this.prDatatableParameter.prNumber = this.searchPRForm.get('prNumber').value;
    this.prDatatableParameter.requestedDate = this.searchPRForm.get('requestedDate').value;
    this.prDatatableParameter.requestedBy = this.searchPRForm.get('requestedBy').value;
    this.prDatatableParameter.submittedBy = this.searchPRForm.get('submittedBy').value;
    this.prDatatableParameter.projectName = this.searchPRForm.get('projectName').value;
    this.prDatatableParameter.itemCategory = this.searchPRForm.get('itemCategory').value;
    this.prDatatableParameter.itemSubCategory = this.searchPRForm.get('itemSubCategory').value;
    this.prDatatableParameter.itemName = this.searchPRForm.get('itemName').value;

    const that = this;
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });
    this.dtOptions = {
      processing: true,
      serverSide: true,
      dom: 'lrtip',
      pageLength: 25,
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
      columnDefs: [
        { orderable: false, targets: 0 }
      ],
      ajax: (DatatableParameter: any, callback) => {
        that.http.post<DataTablesResponse>(environment.APIEndpoint + 'stock.fetchPRDetails&reload=1', Object.assign(DatatableParameter, this.prDatatableParameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {
          that.prDetailsData = resp.data
          //After PRs are loaded, call the PO check API
          if (that.prDetailsData.length > 0) {
            const prNumbers = that.prDetailsData.map(pr => pr.purchase_request_no);
            that.checkPOExistence(prNumbers);
          }
          callback({ recordsTotal: resp.recordsTotal, recordsFiltered: resp.recordsFiltered, data: [] });
        });
      }
    }
  }


  checkPOExistence(prNumbers: string[]) {
    const formData = new FormData();
    formData.append('pr_numbers', JSON.stringify(prNumbers));

    this.stockService.checkPOExistence(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((resp: any) => {

        if (resp && resp.data) {
          // Extract purchase numbers from API
          const existingPRs = resp.data.map((x: any) => x.purchase_number);
          // Mark which PRs already exist in PO
          this.prDetailsData.forEach(pr => {
            pr.hasPO = existingPRs.includes(pr.purchase_request_no);
          });
          //  Calculate counts
          const totalCount = this.prDetailsData.length;
          const hasPOCount = this.prDetailsData.filter(pr => pr.hasPO).length;
          const editableCount = totalCount - hasPOCount;
          this.PRPOformGroup.get('PRPending').setValue(editableCount);

        }
      });
  }



  onDispatchClick(index: number, event: Event): void {
    event.stopPropagation();

    const poArray = this.poForm.get('purchaseOrders') as FormArray;
    const control = poArray.at(index);
    const vendor = this.poDetailsData[index];
    const newStatus = !control.get('dispatched').value;

    const formData = new FormData();
    formData.append('purchase_order_id', vendor.purchase_order_id);
    formData.append('dispatched', newStatus ? '1' : '0');

    this.stockService.updatePODispatchStatus(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (resp: any) => {
          const updatedValue = resp === 1;
          control.get('dispatched').setValue(updatedValue);

          const totalCount = poArray.length;
          const dispatchedCount = poArray.controls.filter(c => c.get('dispatched').value).length;
          const difference = totalCount - dispatchedCount;

          this.PRPOformGroup.get('POPending').setValue(difference);

          Swal.fire({
            title: updatedValue ? 'PO has been Dispatched' : 'PO Dispatch status reverted',
            icon: updatedValue ? 'success' : 'info',
            timer: 1500,
            showConfirmButton: false
          });
        },
        () => {
          Swal.fire({
            title: 'Error updating dispatch status',
            icon: 'error',
            timer: 1500,
            showConfirmButton: false
          });
        }
      );
  }






  // onDispatchChange(vendor: any, event: any): void {
  //   const isChecked = event.target.checked;
  //   let formData = new FormData();
  //   formData.append('purchase_order_id',vendor.purchase_order_id);
  //   formData.append('dispatched', isChecked);

  //   this.stockService.updatePODispatchStatus(formData).pipe(takeUntil(this.destroy$)).subscribe(() => {
  //       vendor.dispatched = isChecked;
  //       if (isChecked) {
  //         Swal.fire({
  //           title: 'PO has been Dispatched',
  //           icon: 'success',
  //           timer: 1500,
  //           showConfirmButton: false
  //         });
  //       }
  //     });
  // }


  // poDatatablecode() {
  //   this.poDatatableParameter = "";
  //   const that = this;
  //   const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });
  //   this.dtOptions1 = {
  //     processing: true,
  //     serverSide: true,
  //     dom: 'lrtip',
  //     pageLength: 25,
  //     lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
  //     columnDefs: [
  //       { orderable: false, targets: 0 }
  //     ],
  //     ajax: (DatatableParameter: any, callback) => {
  //       that.http.post<DataTablesResponse>(environment.APIEndpoint + 'stock.fetchPoDatatable&reload=1', Object.assign(DatatableParameter, this.poDatatableParameter), { responseType: 'json', headers }).subscribe(resp => {
  //         that.poDetailsData = resp.data;

  //         callback({ recordsTotal: resp.recordsTotal, recordsFiltered: resp.recordsFiltered, data: [] });
  //       });
  //     }
  //   }
  // }


  poDatatablecode() {
    this.poDatatableParameter = "";
    const that = this;
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });

    this.dtOptions1 = {
      processing: true,
      serverSide: true,
      dom: 'lrtip',
      pageLength: 25,
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
      columnDefs: [{ orderable: false, targets: 0 }],
      ajax: (DatatableParameter: any, callback) => {
        that.http.post<DataTablesResponse>(
          environment.APIEndpoint + 'stock.fetchPoDatatable&reload=1',
          Object.assign(DatatableParameter, this.poDatatableParameter),
          { responseType: 'json', headers }
        ).pipe(takeUntil(this.destroy$)).subscribe(resp => {

          //  Store the raw response data
          that.poDetailsData = resp.data;

          //  Create FormArray based on backend values
          const poArray = that.fb.array(
            resp.data.map((po: any) =>
              that.fb.group({
                purchase_order_id: [po.purchase_order_id],
                dispatched: [po.dispatched === '1']
              })
            )
          );

          //  Update the form
          that.poForm.setControl('purchaseOrders', poArray);

          //  Calculate dispatched and pending count
          const totalCount = poArray.length;
          const dispatchedCount = poArray.controls.filter(c => c.get('dispatched').value).length;
          const difference = totalCount - dispatchedCount;


          //  Update your PRPOformGroup control for display
          that.PRPOformGroup.get('POPending').setValue(difference);


          callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsFiltered,
            data: []
          });
        });
      }
    };
  }


  setActiveTab(tabName: string) {
    this.activeTab = tabName;

    if (tabName === 'Vendor') {
      // Purchase Request Tab
      if (!this.dtOptions) {
        // Initialize DataTable for the first time
        this.prDatatablecode();
      } else {
        // Refresh existing table to fetch latest PR data
        this.reload('purchase_request');
      }
    }

    if (tabName === 'Machinery') {
      // Purchase Order Tab
      if (!this.dtOptions1) {
        // Initialize PO table for the first time
        this.poDatatablecode();
      } else {
        // Refresh existing table to fetch latest PO data
        this.reload('purchase_order');
      }
    }
  }

  editPR(type: string, request_id: any) {

    this.hidePRSaveButton = (type == 'editPR');
    this.unitListByIndex = [];

    let projects$ = this.ProjectService.getAllProjectsLists(new FormData());
    let employees$ = this.crmservice.getEmployeeAndContact(new FormData());
    let category$ = this.ProjectService.getAllCategoryLists(new FormData());
    let subCategory$ = this.ProjectService.getAllSubCategoryLists(new FormData());
    let material$ = this.ProjectService.getAllMaterialsLists(new FormData());

    forkJoin([projects$, employees$, category$, subCategory$, material$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([projects, employees, categories, subCategories, materials]) => {
        // assign lookup values once all are loaded
        this.projectsList = projects.data;
        this.employee = employees.data;
        this.categoryLists = categories.data;
        this.subcategoryLists = subCategories.data;
        this.materialsList = materials.data;

        if (type === 'viewPR') {
          this.purchaseRequestForm.disable();
        }

        let formData = new FormData();
        formData.append('request_id', request_id);

        this.stockService.getPRById(formData)
          .pipe(takeUntil(this.destroy$))
          .subscribe(resp => {
            const row = resp.data[0];

            this.purchaseRequestForm.patchValue({
              request_id: row.request_id,
              purchase_request_no: row.purchase_request_no,
              projectName: row.project,
              requested_by: row.requested_by,
              request_date: this.datePipe.transform(row.request_date, "yyyy-MM-dd"),
              contact_no: row.contact,
              submitted_by: row.submitted_by,
              priority: row.priority,
              status: row.status,
              description: row.description
            });

            // clear existing materials first
            this.materials.clear();

            // split CSV strings into arrays
            const items = row.item?.split(",") || [];
            const balances = row.current_balance?.split(",") || [];
            const quantities = row.quantity?.split(",") || [];
            const units = row.unit?.split(",").map(unit => unit.trim()) || [];
            const hsnCodes = row.hsn_code?.split(",").map(code => code.trim()) || [];
            const groupIds = row.groupid?.split(",") || [];
            const subGroupIds = row.subgroupid?.split(",") || [];
            const masterItemIds = row.master_item_id?.split(",") || [];

            // loop through and add materials
            items.forEach((itm, i) => {
              // Create material using the same method and push (not insert at 0)
              const materialGroup = this.createMaterial();
              this.materials.push(materialGroup);

              // Set category and trigger dependent subcategories
              materialGroup.patchValue({ itemCategory: groupIds[i] || '' });
              this.onCategoryChange({ target: { value: groupIds[i] } }, i);

              // Set subcategory and trigger dependent items
              materialGroup.patchValue({ itemSubCategory: subGroupIds[i] || '' });
              this.onSubCategoryChange({ target: { value: subGroupIds[i] } }, i);

              // Finally set item and other fields
              materialGroup.patchValue({
                itemName: itm || '',
                // currentBalance: balances[i] || '',
                quantity: quantities[i] || '',
                unit: units[i] || '',
                hsnCode: hsnCodes[i] || '',
                master_item_id: masterItemIds[i] || ''
              });

              // Set currentBalance separately since it's disabled
              // Use setValue with {emitEvent: false} or temporarily enable it
              materialGroup.get('currentBalance')?.setValue(balances[i] || '', { emitEvent: false });
              this.loadUnitsForMaterial(masterItemIds[i] || '', i, units[i] || '', hsnCodes[i] || '');


              if (!this.hidePRSaveButton) {
                materialGroup.disable();
              } else {
                this.purchaseRequestForm.enable();
                materialGroup.enable();
                this.materials.controls.forEach(control => {
                  control.enable();
                  // Keep currentBalance disabled for all materials
                  control.get('currentBalance')?.disable();
                });
                this.purchaseRequestForm.get('contact_no')?.disable();
                this.purchaseRequestForm.get('purchase_request_no')?.disable();
              }
            });
          });
      });
  }


  ngAfterViewInit(): void {
    this.dtTrigger.next();
    this.dtTrigger1.next();
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

  addMaterial(): void {
    // this.filteredMaterialsListByIndex = {};
    this.filteredSubcategoryListsByIndex = this.shiftIndexedLookupOnInsert(this.filteredSubcategoryListsByIndex, 0);
    this.filteredMaterialsListByIndex = this.shiftIndexedLookupOnInsert(this.filteredMaterialsListByIndex, 0);
    this.unitListByIndex.splice(0, 0, []);
    this.materials.insert(0, this.createMaterial());
  }

  removeMaterial(index: number): void {
    this.materials.removeAt(index);
    this.filteredSubcategoryListsByIndex = this.shiftIndexedLookupOnRemove(this.filteredSubcategoryListsByIndex, index);
    this.filteredMaterialsListByIndex = this.shiftIndexedLookupOnRemove(this.filteredMaterialsListByIndex, index);
    this.unitListByIndex.splice(index, 1);
  }

  private shiftIndexedLookupOnInsert<T>(lookup: { [key: number]: T }, insertIndex: number): { [key: number]: T } {
    const shiftedLookup: { [key: number]: T } = {};

    Object.keys(lookup).forEach((key) => {
      const numericKey = Number(key);
      const nextKey = numericKey >= insertIndex ? numericKey + 1 : numericKey;
      shiftedLookup[nextKey] = lookup[numericKey];
    });

    return shiftedLookup;
  }

  private shiftIndexedLookupOnRemove<T>(lookup: { [key: number]: T }, removedIndex: number): { [key: number]: T } {
    const shiftedLookup: { [key: number]: T } = {};

    Object.keys(lookup).forEach((key) => {
      const numericKey = Number(key);

      if (numericKey < removedIndex) {
        shiftedLookup[numericKey] = lookup[numericKey];
      } else if (numericKey > removedIndex) {
        shiftedLookup[numericKey - 1] = lookup[numericKey];
      }
    });

    return shiftedLookup;
  }

  result(tabName: any) {
    this.activeTab = tabName;
  }

  openModal() {

    this.hidePRSaveButton = true;

    // Reset form
    this.purchaseRequestForm.reset();
    this.materials.clear();
    this.unitListByIndex = [];

    // Fetch max id JUST-IN-TIME
    this.stockService.fetchMaxId(new FormData())
      .pipe(takeUntil(this.destroy$))
      .subscribe(resp => {

        const nextId = (Number(resp) || 0) + 1;
        const formattedPR = `PR-${String(nextId).padStart(4, '0')}`;
        const formattedDate = new Date().toISOString().split('T')[0];

        this.purchaseRequestForm.patchValue({
          purchase_request_no: formattedPR,
          request_date: formattedDate
        });

        this.purchaseRequestForm.enable();
        this.purchaseRequestForm.get('contact_no')?.disable();
        this.purchaseRequestForm.get('purchase_request_no')?.disable();

      });

    // Load dropdown data (unchanged)
    forkJoin([
      this.ProjectService.getAllProjectsLists(new FormData()),
      this.crmservice.getEmployeeAndContact(new FormData()),
      this.ProjectService.getAllCategoryLists(new FormData()),
      this.ProjectService.getAllSubCategoryLists(new FormData()),
      this.ProjectService.getAllMaterialsLists(new FormData())
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([projects, employees, categories, subCategories, materials]) => {
        this.projectsList = projects.data;
        this.employee = employees.data;
        this.categoryLists = categories.data;
        this.subcategoryLists = subCategories.data;
        this.materialsList = materials.data;
        this.filteredSubcategoryLists = [...this.subcategoryLists];
        this.filteredMaterialsList = [...this.materialsList];
        this.setDefaultEmployee();
      });

  }


  // Extract employee selection to separate method
  private setDefaultEmployee() {
    const currentUser = sessionStorage.getItem('UserName')?.trim().toLowerCase();

    if (!currentUser || !this.employee?.length) {
      console.warn('No username or employee list available');
      return;
    }

    const matchedEmployee = this.employee.find(
      (emp: any) => emp.employeename?.trim().toLowerCase() === currentUser
    );


    if (matchedEmployee) {
      // Use setTimeout to ensure form is ready
      setTimeout(() => {
        this.purchaseRequestForm.patchValue({
          submitted_by: matchedEmployee.employeeid
        }, { emitEvent: false }); // Prevent triggering value change events

      }, 0);
    } else {
      console.warn('No matching employee found for user:', currentUser);
    }
  }


  SubmitPR(): void {

    if (this.materials.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'No Materials Added',
        text: 'Please add at least one material before saving.',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (this.purchaseRequestForm.valid) {

      let formData = new FormData();

      const request_id = this.purchaseRequestForm.get('request_id').value;
      if (request_id) formData.append('request_id', request_id);

      formData.append('project', this.purchaseRequestForm.get('projectName').value);
      formData.append('purchase_request_no', this.purchaseRequestForm.get('purchase_request_no').value);
      formData.append('requestedBy', this.purchaseRequestForm.get('requested_by').value);
      formData.append('requestDate', this.purchaseRequestForm.get('request_date').value);
      formData.append('contactNo', this.purchaseRequestForm.get('contact_no').value);
      formData.append('submittedBy', this.purchaseRequestForm.get('submitted_by').value);
      formData.append('priority', this.purchaseRequestForm.get('priority').value);
      formData.append('status', this.purchaseRequestForm.get('status').value);
      formData.append('description', this.purchaseRequestForm.get('description').value);

      const materialsArray = this.materials.value;

      const itemNames = materialsArray.map(m => m.itemName).join(',');
      const master_item_id = materialsArray.map(m => m.master_item_id).join(',');
      const quantities = materialsArray.map(m => m.quantity).join(',');
      const units = materialsArray.map(m => m.unit).join(',');
      const currentBalances = materialsArray.map(m => m.currentBalance).join(',');
      const hsnCodes = materialsArray.map(m => m.hsnCode).join(',');
      const categories = materialsArray.map(m => m.itemCategory).join(',');
      const subCategories = materialsArray.map(m => m.itemSubCategory).join(',');

      // Append comma-separated strings to FormData
      formData.append('categories', categories);
      formData.append('subcategories', subCategories);
      formData.append('items', itemNames);
      formData.append('master_item_id', master_item_id);
      formData.append('currentBalance', currentBalances);
      formData.append('quantity', quantities);
      formData.append('units', units);
      formData.append('hsncode', hsnCodes);

      this.stockService.savePurchaseRequest(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
        if (resp == true) {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Work Details saved successfully!',
            timer: 2000,
            showConfirmButton: false
          });
          this.closePRModal.nativeElement.click();
          this.purchaseRequestForm.reset();
          this.reload('purchase_request');
          // this.fetchMaxId();
        } else if (resp == false) {
          Swal.fire({
            icon: 'error',
            title: 'Duplicate Entry',
            text: 'The PR Already Exists',
            timer: 2000,
            showConfirmButton: false,
          });
        }
        else {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Error While Saving the Data.',
            confirmButtonText: 'OK'
          });
        }
      });

    } else {
      this.purchaseRequestForm.markAllAsTouched();
      Swal.fire({
        icon: 'error',
        title: 'Form is Incomplete',
        text: 'Please fill all the required fields before saving.',
        confirmButtonText: 'OK'
      });
    }
  }

  cancelPR() {
    const materialsArray = this.purchaseRequestForm.get('materials') as FormArray;
    materialsArray.clear();
    this.unitListByIndex = [];

    this.purchaseRequestForm.reset();
    this.purchaseRequestForm.get('contact_no')?.disable();
    this.purchaseRequestForm.get('purchase_request_no')?.disable();

    this.filteredSubcategoryLists = [...this.subcategoryLists];
    this.filteredMaterialsList = [...this.materialsList];

    this.filteredSubcategoryListsByIndex = {};
    this.filteredMaterialsListByIndex = {};
  }

  deletePR(request_id: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.value) {
        let formData = new FormData();
        formData.append('request_id', request_id);
        this.stockService.deletePRDetail(formData).pipe(takeUntil(this.destroy$)).subscribe(Response => {
          if (Response) {
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'PR Deleted Successfully',
              showConfirmButton: false,
              timer: 2000
            });
            this.reload('purchase_request');
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: 'PR Data Deletion Failed',
              showConfirmButton: false,
              timer: 3000
            });
          }
        });
      }
    });
  }

  getProjectsLists() {
    let formData = new FormData();
    this.ProjectService.getAllProjectsLists(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.projectsList = resp.data;
    });
  }

  employeetypenamelist() {
    let employeelist = new FormData();
    this.crmservice.getEmployeeAndContact(employeelist).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.employee = resp.data;
    });
  }

  onCategoryChange(event: any, index: number) {
    const selectedCategoryId = event.target.value;
    this.filteredSubcategoryListsByIndex[index] = this.subcategoryLists.filter(
      sub => sub.group_id == selectedCategoryId
    );

    // Reset subcategory value for this row
    this.materials.at(index).get('itemSubCategory')?.setValue('');
  }

  onSubCategoryChange(event: any, index: number) {
    const selectedSubCategoryId = event.target.value;
    const selectedGroup = this.materials.at(index) as FormGroup;
    const selectedCategoryId = selectedGroup.get('itemCategory')?.value;

    // Filter materials for this row only
    this.filteredMaterialsListByIndex[index] = this.materialsList.filter(
      item =>
        item.group_id === selectedCategoryId &&
        item.sub_group_id === selectedSubCategoryId
    );

    // Reset the itemName for this row
    selectedGroup.patchValue({
      itemName: ''
    });
  }

  onEmployeeSelect(event: Event): void {
    const selectedEmployeeId = (event.target as HTMLSelectElement).value;
    const selectedEmployee = this.employee.find(emp => emp.employeeid === selectedEmployeeId);

    if (selectedEmployee) {
      this.purchaseRequestForm.patchValue({
        contact_no: selectedEmployee.mobileno
      });
    } else {
      this.purchaseRequestForm.patchValue({ contact_no: '' });
    }
  }

  // fetchMaxId() {
  //   let formdata = new FormData();
  //   this.stockService.fetchMaxId(formdata).pipe(takeUntil(this.destroy$)).subscribe(resp => {
  //     this.max_id = resp;
  //     
  //   });
  // }

  searchPR() {
    this.prDatatablecode();
    this.reload('purchase_request');
  }

  resetPR() {

    this.searchPRForm.get('projectName')?.setValue(null);
    this.searchPRForm.get('itemCategory')?.setValue(null);
    this.searchPRForm.get('itemSubCategory')?.setValue(null);
    this.searchPRForm.get('itemName')?.setValue(null);
    this.searchPRForm.get('prNumber')?.setValue(null);
    this.searchPRForm.get('requestedDate')?.setValue('');
    this.searchPRForm.get('requestedBy')?.setValue(null);
    this.searchPRForm.get('submittedBy')?.setValue(null);
    this.prDatatablecode();
    this.reload('purchase_request');

    this.filteredSubcategoryLists = [...this.subcategoryLists];
    this.filteredMaterialsList = [...this.materialsList];

    this.filteredSearchSubcategoryLists = [...this.subcategorySearchLists];
    this.filteredSearchMaterialsList = [...this.materialsSearchList];
  }

  reload(tableType: string) {
    if (tableType === 'purchase_request') {
      this.dtElement.toArray()[0].dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        this.dtTrigger.next(null);
      });
    } else if (tableType === 'purchase_order') {
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

  route(link: any) {
    // this.router.navigate(['/' + link]);
    this.router.navigate(['/add-purchase-order'], {
      queryParams: { menuSource: 'stock' }
    });
  }

  // onQuantityChange(event: any, index: number): void {
  //   const materialGroup = this.materials.at(index);
  //   const currentBalance = Number(materialGroup.get('currentBalance')?.value);
  //   let enteredQuantity = Number(event.target.value);

  //   if (enteredQuantity > currentBalance) {
  //     enteredQuantity = currentBalance;
  //     materialGroup.patchValue({ quantity: currentBalance });
  //   }
  // }

  // ViewPurchaseOrder(type,purchase_order_id){
  //   
  // }

  ViewPurchaseOrder(action: string, purchaseOrderId: any): void {
    // Navigate to the PO page with ID in the URL
    this.router.navigate(
      ['add-purchase-order', purchaseOrderId],
      { queryParams: { mode: action } } // optional: to pass action type (view/edit)
    );
  }

  deletePurchaseOrder(purchaseOrderId) {

    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.value) {
        let formData = new FormData();
        formData.append('purchaseOrderId', purchaseOrderId);
        this.stockService.deletePODetail(formData).pipe(takeUntil(this.destroy$)).subscribe(Response => {
          if (Response) {
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'PO Deleted Successfully',
              showConfirmButton: false,
              timer: 2000
            });
            this.reload('purchase_order');
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: 'PO Data Deletion Failed',
              showConfirmButton: false,
              timer: 3000
            });
          }
        });
      }
    });
  }

  fetchAllPR() {
    let formDta = new FormData();
    this.stockService.fetchAllPR(formDta).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.purchaseRequestList = resp.data;
    });
  }
  fetchAllEmployees() {
    this.stockService.fetchAllEmployees(new FormData()).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.allEmployeesList = resp.data;
    });
  }

  downloadPurchaseOrder(purchase_order_id: any) {
    const formData = new FormData();
    formData.append('purchase_order_id', purchase_order_id);

    this.stockService.downloadPurchaseOrder(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe(resp => {
        if (resp?.data?.length) {
          this.previewData = resp.data[0];

          //  Process items data dynamically
          this.previewData = this.processItems(this.previewData);

          // Show the modal after processing
          this.showModal = true;
        }
      });
  }

  //  Split comma-separated values into multiple rows
  processItems(data: any) {
    // If API already returns array items
    if (data.items && Array.isArray(data.items)) return data;

    const itemNames = (data.item_name || '').split(',');
    const hsns = (data.hsncode || '').split(',');
    const gsts = (data.gst || '').split(',');
    const qtys = (data.quantity || '').split(',');
    const rates = (data.rate || '').split(',');
    const amts = (data.amount || '').split(',');

    const maxLength = Math.max(
      itemNames.length, hsns.length, gsts.length,
      qtys.length, rates.length, amts.length
    );

    const items = Array.from({ length: maxLength }).map((_, i) => ({
      item_name: itemNames[i]?.trim() || '',
      hsncode: hsns[i]?.trim() || '',
      gst: gsts[i]?.trim() || '',
      quantity: qtys[i]?.trim() || '',
      rate: rates[i]?.trim() || '',
      amount: amts[i]?.trim() || ''
    }));

    //  Calculate total (sum of all numeric amounts)
    const totalAmount = amts
      .map(a => parseFloat(a?.trim() || '0'))
      .filter(a => !isNaN(a))
      .reduce((sum, val) => sum + val, 0);

    //  Return structured data
    return {
      ...data,
      items,
      total_amount: totalAmount.toFixed(2) // Keep 2 decimal places
    };
  }


  // downloadPDF() {
  //   const element = document.getElementById('poContent');
  //   if (!element) {
  //     console.error('Content element not found');
  //     return;
  //   }

  //   const clonedElement = element.cloneNode(true) as HTMLElement;
  //   const printWindow = window.open('', '_blank', 'width=900,height=1000');

  //   if (!printWindow) {
  //     alert('Please allow popups for this site to download PDF');
  //     return;
  //   }

  //   printWindow.document.open();
  //   printWindow.document.write(`
  //     <!DOCTYPE html>
  //     <html>
  //       <head>
  //         <title>Purchase Order - ${this.previewData.purchase_order_number || ''}</title>
  //         <style>
  //           * {
  //             margin: 0;
  //             padding: 0;
  //             box-sizing: border-box;
  //           }
  //           body { 
  //             margin: 25px; 
  //             font-family: Arial, sans-serif;
  //             color: #000;
  //           }
  //           .container {
  //             width: 100%;
  //             max-width: 1200px;
  //             margin: 0 auto;
  //             border: 2px solid #000;
  //             padding: 20px;
  //             border-radius: 6px;
  //           }

  //           table { 
  //             width: 100%; 
  //             margin-bottom: 1rem;
  //             border-collapse: collapse;
  //           }

  //           table th, table td { 
  //             font-size: 14px; 
  //             vertical-align: middle;
  //             padding: 8px;
  //             border: 1px solid #000;  /* strong dark border */
  //             text-align: left;
  //           }

  //           table th:first-child,
  //           table td:first-child {
  //             text-align: center;
  //             width: 50px;
  //           }

  //           .thead-light th {
  //             background-color: #f1f1f1;
  //             font-weight: bold;
  //             border: 1px solid #000;
  //           }

  //           h4 { 
  //             font-weight: bold; 
  //             text-align: center; 
  //             margin-bottom: 15px;
  //             font-size: 22px;
  //             border-bottom: 2px solid #000;
  //             padding-bottom: 5px;
  //           }

  //           h6 {
  //             font-weight: bold;
  //             margin-top: 10px;
  //             margin-bottom: 10px;
  //             font-size: 16px;
  //             text-decoration: underline;
  //           }

  //           p {
  //             margin-bottom: 5px;
  //             font-size: 14px;
  //           }

  //           .text-right {
  //             text-align: right;
  //             font-weight: bold;
  //           }

  //           .row {
  //             display: flex;
  //             flex-wrap: wrap;
  //             margin-bottom: 1rem;
  //           }

  //           .col-md-6 {
  //             flex: 0 0 50%;
  //             max-width: 50%;
  //             padding-right: 15px;
  //             padding-left: 15px;
  //             box-sizing: border-box;
  //           }

  //           .totals {
  //             margin-top: 20px;
  //             padding: 10px;
  //             border-top: 2px solid #000;
  //             border-bottom: 2px solid #000;
  //           }

  //           @media print {
  //             @page { 
  //               margin: 10mm;
  //               size: A4;
  //             }
  //             .row { page-break-inside: avoid; }
  //             .container { border: 2px solid #000; }
  //           }
  //         </style>
  //       </head>
  //       <body onload="window.print(); window.close();">
  //         ${clonedElement.innerHTML}
  //       </body>
  //     </html>
  //   `);
  //   printWindow.document.close();
  // }
  downloadPDF() {
    const element = document.getElementById('poContent');
    if (!element) {
      console.error('Content element not found');
      return;
    }

    const clonedElement = element.cloneNode(true) as HTMLElement;
    const printWindow = window.open('', '_blank', 'width=900,height=1000');

    if (!printWindow) {
      alert('Please allow popups for this site to download PDF');
      return;
    }

    printWindow.document.open();
    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Purchase Order - ${this.previewData.purchase_order_number || ''}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body { 
            margin: 15px;
            font-family: Arial, sans-serif;
            color: #000;
          }
          .container {
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            border: 2px solid #000;
            padding: 20px;
            border-radius: 6px;
          }
              .page-border {
            border: 2px solid #000;
            padding: 25px;
            min-height: 95vh;
          }
              h4 { 
            font-weight: bold; 
            text-align: center; 
            margin-bottom: 15px;
            font-size: 22px;
          }

          table { 
            width: 100%; 
            margin-bottom: 1rem;
            border-collapse: collapse;
          }

          table th, table td { 
            font-size: 14px; 
            vertical-align: middle;
            padding: 8px;
            border: 1px solid #000;
            text-align: left;
          }

          table th:first-child,
          table td:first-child {
            text-align: center;
            width: 50px;
          }

          .thead-light th {
            background-color: #f1f1f1;
            font-weight: bold;
            border: 1px solid #000;
          }

          h4 { 
            font-weight: bold; 
            text-align: center; 
            margin-bottom: 15px;
            font-size: 22px;
           
            padding-bottom: 5px;
          }

          h6 {
            font-weight: bold;
            margin-top: 10px;
            margin-bottom: 10px;
            font-size: 16px;
          }

          p {
            margin-bottom: 5px;
            font-size: 14px;
          }

          .text-right {
            text-align: right;
            font-weight: bold;
          }

          .row {
            display: flex;
            flex-wrap: wrap;
            margin-bottom: 1rem;
          }

          .col-md-6 {
            flex: 0 0 50%;
            max-width: 50%;
            padding-right: 15px;
            padding-left: 15px;
            box-sizing: border-box;
          }

          .totals {
            margin-top: 20px;
            padding: 10px;
            border-top: 2px solid #000;
            border-bottom: 2px solid #000;
          }

          /* === Supplier + Company Box (matches your screenshot) === */
.po-details-box {
  border: 1px solid #000;
  margin-bottom: 15px;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
}


.po-details-box .left-box {
  border-right: 1px solid #000;
}



.po-details-box table {
  width: 100%;
  border-collapse: collapse;
}

.po-details-box td {
  padding: 3px 6px;
  font-size: 14px;
  vertical-align: top;
  line-height: 1.4;
}


          @media print {
            @page { 
              margin: 10mm;
              size: A4;
            }
            .row { page-break-inside: avoid; }
            .container { border: 2px solid #000; }
          }
        </style>
      </head>
      <body onload="window.print(); window.close();">
        <div class="page-border">
          ${clonedElement.innerHTML}
        </div>
      </body>
    </html>
  `);
    printWindow.document.close();
  }


  closePdfModal() {
    this.showModal = false;
    this.previewData = null;
  }


  openPurchaseOrderPreview(data: any) {
    this.previewData = this.processItems(data);
    this.showModal = true;
  }




}
