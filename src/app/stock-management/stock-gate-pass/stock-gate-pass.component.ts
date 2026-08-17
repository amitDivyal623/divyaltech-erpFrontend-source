import { Component, ElementRef, OnInit, OnDestroy, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder, AbstractControl, FormArray } from '@angular/forms';
import { ProjectService } from 'src/app/services/project.service';
import { distinctUntilChanged, switchMap, map, takeUntil } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { forkJoin, Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { CrmService } from 'src/app/services/crm.service';
import { StockService } from 'src/app/services/stock.service';
import Swal from 'sweetalert2';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbCalendar, NgbDateAdapter, NgbDate, NgbDateParserFormatter, NgbDateStruct, NgbInputDatepickerConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MachineReadingPopupComponent } from '../../shared/machine-reading-popup/machine-reading-popup.component';
import { HrService } from 'src/app/services/hr.service';
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
  selector: 'app-stock-gate-pass',
  templateUrl: './stock-gate-pass.component.html',
  styleUrls: ['./stock-gate-pass.component.scss']
})
export class StockGatePassComponent implements OnInit, OnDestroy {
  submitted: boolean;
  private destroy$ = new Subject<void>();
  dtOptions: DataTables.Settings = {};
  dtOptionsGatePass: DataTables.Settings = {};
  dtOptionsMachine: DataTables.Settings = {};
  dtOptionsConsumption: DataTables.Settings = {};
  dtOptionsRentItemGatePass: DataTables.Settings = {};


  dtTriggerGatePass = new Subject<void>();
  dtTriggerMachine = new Subject<void>();
  dtTriggerConsumption = new Subject<void>();
  dtTriggerRentItemGatePass = new Subject<void>();


  fieldStatus: boolean = false;
  setData: boolean = false;
  isButtonDisabled: boolean = false;
  searchMachineForm: FormGroup;
  searchConsumptionForm: FormGroup;
  searchRentItemGatePassForm: FormGroup;
  addMachineReading = new FormGroup({
    date: new FormControl('', Validators.required),
    startReading: new FormControl('', Validators.required),
    stopReading: new FormControl('', Validators.required),
    machineStart: new FormControl('', Validators.required),
    machineStop: new FormControl('', Validators.required),
    extendedTime: new FormControl('', Validators.pattern(/^[.\d]+$/)),
    vendertype: new FormControl('', Validators.required),
    vechiceltype: new FormControl('', Validators.required),
    reading: new FormControl('')
  });





  warehouseList: any[];

  projectsList: any[];
  vehicleList: any[];
  employee: any[];
  materialsList: any[];
  workContractData: any[];
  rowMaterialsList: any[][] = [];
  rowCategoryList: any[][] = [];
  rowSubCategoryList: any[][] = [];
  rowUnitsList: any[][] = [];
  filteredMaterialsListByRow: any[][] = [];
  rowRawMaterialsList: any[][] = [];



  // @ViewChildren(DataTableDirective) dtElement: any;
  @ViewChild('closebutton') closebutton: ElementRef;
  @ViewChildren(DataTableDirective)
  dtElements!: QueryList<DataTableDirective>;
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  @ViewChild('closeMaterialConModal') closeMaterialConModal;

  isProjectType = false;
  selectedTransferType = false;
  gatePassForm: FormGroup;
  isHideWorkSave: boolean;
  isHideAddMaterial: boolean;
  submit_btn: boolean;
  isConSaveDisabled: boolean = false;
  isQuantityValid: boolean = true;

  materialUnitsList: any[] = [];
  convertUnitDropdown: string[] = [];

  baseUnitName: string = '';
  filteredMaterialsList: any[];
  machineReadingData: any[];
  consumptionListsData: any[];
  rentItemGatePassData: any[];
  getMaterialUsedData: any[];
  categoryLists = [];
  subcategoryLists = [];
  filteredSubcategoryLists: any[];
  filteredSubcategoryListsSearch: any[];
  filteredSubcategoryListsConsumption: any[] = [];
  filteredMaterialsListConsumption: any[] = [];

  rentedItemsList: any[] = [];
  categoryList: any[] = [];
  subCategoryList: any[] = [];
  itemsList: any[] = [];

  filteredSubCategoryList: any[] = [];
  filteredItemsList: any[] = [];



  isSaveDisabled: boolean;
  gatePassDatatableparameter: { item: any, from: any, to: any, gate_pass_number: any, transferType: any, toProject: any, toWarehouse: any, category: any, subCategory: any };
  machineReadingDatatableParameter: { from: any, to: any, project_name: any, vehicle_name: any, gate_pass: any };
  consumptionListsDatatableParameter: { from: any, to: any, project_id: any, gate_pass: any, item: any, category: any, subCategory: any };
  rentItemGatePassDatatableParameter: { gate_pass: any, item: any, issued_date: any, project_id: any, fromWarehouse: any };
  activeICMTab: string = 'Gate Pass';
  machineTitle: string;
  readingDate: any;
  respcontractor: any;
  vechicalList: any;
  reading: any;
  startReading: any;
  stopReading: any;
  machineStart: any;
  machineStop: any;
  extendedTime: any;
  vendertype: any;
  vechiceltype: any;
  vendorId: any;
  saveButton1: any;
  respProject: any;
  projectId: any;
  private gatePassFilterSessionKey = 'gatePassFilters';


  constructor(private modalService: NgbModal, private hrservice: HrService, private http: HttpClient, private router: Router, private ProjectService: ProjectService, private crmservice: CrmService, private fb: FormBuilder, private stockService: StockService, private datepipe: DatePipe, private activatedRoute: ActivatedRoute) {
    this.gatePassDatatableparameter = { item: '', from: '', to: '', gate_pass_number: '', transferType: '', toProject: '', toWarehouse: '', category: '', subCategory: '' }
    this.machineReadingDatatableParameter = { from: '', to: '', project_name: '', vehicle_name: '', gate_pass: '' }
    this.consumptionListsDatatableParameter = { from: '', to: '', project_id: '', gate_pass: '', item: '', category: '', subCategory: '' }
    this.rentItemGatePassDatatableParameter = { gate_pass: '', item: '', issued_date: '', project_id: '', fromWarehouse: '' }
  }

  searchGateForm = new FormGroup({
    category: new FormControl(null),
    subCategory: new FormControl(null),
    item: new FormControl(null),   // MUST be null
    from: new FormControl(null),
    to: new FormControl(null),
    gate_pass_number: new FormControl(null),
    transferType: new FormControl(null),

    to_project: new FormControl(null),     // NEW
    to_warehouse: new FormControl(null),   // NEW

    quantity: new FormControl(null),
    baseUnit: new FormControl({ value: null, disabled: true }),
    convertToUnit: new FormControl(null),
    convertedValue: new FormControl({ value: null, disabled: true })
  });

  materialConsumedForm = new FormGroup({
    consumption_id: new FormControl(),
    consumedDate: new FormControl('', Validators.required),
    gatePass: new FormControl('', Validators.required),
    projectName: new FormControl(''),
    //   consumedMaterial: new FormControl(),
    //   balanceQuantity: new FormControl(),
    //   consumedUnit: new FormControl(),
    //   usedQuantity: new FormControl(),
    //   consumedScrap: new FormControl(),
    //   consumedRate: new FormControl(),
    //   consumedAmount: new FormControl(),
  });

  ngOnInit(): void {

    this.machineTitle = 'Add New Entry';

    this.gatePassForm = this.fb.group({
      gatepass_id: [''],
      transferType: [''],
      date: ['', Validators.required],
      materials: this.fb.array([this.createMaterial()], this.validateMaterialsArray.bind(this)),
      description: [''],
      warehouseLists: [''],
      projectName: [''],
      fromWarehouse: [''],
      toWarehouse: [''],
      vehicleNameNo: [''],
      issuedTo: [''],
      issuedBy: [''],
      gatePass: [''],

    });

    this.searchMachineForm = this.fb.group({
      from: [''],
      to: [''],
      project: [''],
      vehicle: [''],
      gate_pass_number: [''],
      totalTimeSpent: [{ value: '', disabled: true }],  // NEW
      totalRun: [{ value: '', disabled: true }]
    });

    this.searchConsumptionForm = this.fb.group({
      from: [''],
      to: [''],
      project: [''],
      gate_pass: [''],

      category: [null],
      subCategory: [null],
      item: [null]
    });


    this.activeICMTab = 'Gate Pass';
    this.restoreGatePassFilters();
    // If navigated here with a `tab` query param, open that tab (useful after redirects)
    this.activatedRoute.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const tab = params?.tab;
      if (tab) {
        this.setTab(tab);
        // remove query params from URL to avoid re-triggering on back/refresh
        this.router.navigate([], { queryParams: {}, replaceUrl: true });
      }
    });
    this.gatePassDatatablecode();
    // this.dtTriggerGatePass.next();

    this.getWarehouselists();
    this.getAllMaterialLists();
    this.getProjectsLists();
    this.getVehicleslists();
    this.employeetypenamelist();
    this.projectlist();
    // this.getAllMaterialLists();


    this.machineReadingDatatblecode();
    this.consumptionListsDatatablecode();


    this.materialConsumedForm = this.fb.group({
      consumption_id: [''],
      consumedDate: [''],
      gatePass: [''],
      projectName: [''],
      consumedMaterials: this.fb.array([]),
      // consumedMaterial: ['',Validators.required],
      // balanceQuantity: [''],
      // usedQuantity: [''],
      // consumedScrap: [''],
      // consumedRate: [''],
      // consumedAmount: [''],

    });

    this.searchRentItemGatePassForm = this.fb.group({
      gate_pass: [''],
      item: [null],
      issued_date: [''],
      project: [''],
      fromWarehouse: ['']
    });

    this.rentItemGatePassDatatablecode();
    this.getCategoryLists();
    this.getSubCategoryLists();
    this.getAllRentedItemsList();


    this.searchGateForm.get('quantity')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.calculateConversion());

    this.searchGateForm.get('convertToUnit')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.calculateConversion());

    this.searchGateForm.get('baseUnit')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.calculateConversion());

    this.searchGateForm.get('transferType')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {

      if (value === 'project_type') {
        this.searchGateForm.patchValue({
          to_warehouse: null
        });
      }

      if (value === 'warehouse_type') {
        this.searchGateForm.patchValue({
          to_project: null
        });
      }

    });
  }



  onSubCategoryChangeSearch(event: any) {

    const selectedCategoryId = this.searchGateForm.get('category')?.value;
    const selectedSubCategoryId = event?.sub_group_id; // FIX

    this.filteredMaterialsList = this.materialsList.filter(item =>
      item.group_id === selectedCategoryId &&
      item.sub_group_id === selectedSubCategoryId
    );

    this.searchGateForm.patchValue({ item: null });
  }


  onCategoryChangeSearch(event: any) {

    const selectedCategoryId = event.group_id; //  FIX

    this.filteredSubcategoryListsSearch = this.subcategoryLists
      .filter(sub => sub.group_id === selectedCategoryId)
      .sort((a, b) =>
        (a.sub_group_name ?? '').localeCompare(b.sub_group_name ?? '')
      );

    this.filteredMaterialsList = [];

    this.searchGateForm.patchValue({
      subCategory: null,
      item: null
    });
  }


  onMaterialChangeSearch(selectedMaterial: any) {

    if (selectedMaterial) {

      const selectedCategoryId = selectedMaterial.group_id;
      const selectedSubCategoryId = selectedMaterial.sub_group_id;

      this.searchGateForm.patchValue({
        category: selectedCategoryId,
        subCategory: selectedSubCategoryId,
        baseUnit: selectedMaterial.unit_name,
        quantity: null,
        convertToUnit: null,
        convertedValue: null
      });

      this.filteredSubcategoryListsSearch = this.subcategoryLists
        .filter(sub => sub.group_id === selectedCategoryId);

      this.filteredMaterialsList = this.materialsList.filter(item =>
        item.group_id === selectedCategoryId &&
        item.sub_group_id === selectedSubCategoryId
      );

      // const formData = new FormData();
      // formData.append('master_item_id', selectedMaterial.master_item_id);

      // this.ProjectService.getUnitsFromConversionTable(formData)
      //   .pipe(takeUntil(this.destroy$))
      //   .subscribe(resp => {

      //     this.materialUnitsList = resp?.data || [];

      //     // Build dropdown (unique units)
      //     const units = new Set<string>();

      //     this.materialUnitsList.forEach(row => {
      //       units.add(row.basic_unit_name);
      //       units.add(row.alt_unit_name);
      //     });

      //     this.convertUnitDropdown = Array.from(units);

      //   });

    } else {

      this.searchGateForm.patchValue({
        category: null,
        subCategory: null,
        item: null,
        baseUnit: null,
        quantity: null,
        convertToUnit: null,
        convertedValue: null
      });

      this.filteredMaterialsList = [...this.materialsList];
      this.filteredSubcategoryListsSearch = [...this.subcategoryLists];
      this.materialUnitsList = [];
      this.convertUnitDropdown = [];
    }
  }



  calculateConversion() {

    const qty = Number(this.searchGateForm.get('quantity')?.value);
    const fromUnit = this.searchGateForm.get('baseUnit')?.value;
    const toUnit = this.searchGateForm.get('convertToUnit')?.value;

    if (!qty || !fromUnit || !toUnit) {
      this.searchGateForm.patchValue({ convertedValue: null });
      return;
    }

    // Same unit
    if (fromUnit === toUnit) {
      this.searchGateForm.patchValue({ convertedValue: qty });
      return;
    }

    let qtyInBase = qty;

    // If fromUnit is alternate → convert to base first
    const fromRow = this.materialUnitsList.find(r =>
      r.alt_unit_name === fromUnit
    );

    if (fromRow) {
      qtyInBase =
        (qty / Number(fromRow.alt_value)) *
        Number(fromRow.basic_value);
    }

    // If converting to alternate
    const toRow = this.materialUnitsList.find(r =>
      r.alt_unit_name === toUnit
    );

    let result = null;

    if (toRow) {
      result =
        (qtyInBase / Number(toRow.basic_value)) *
        Number(toRow.alt_value);
    } else {
      // If target is base unit
      result = qtyInBase;
    }

    this.searchGateForm.patchValue({
      convertedValue: result ? result.toFixed(2) : null
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

  restoreGatePassFilters() {

    const saved = sessionStorage.getItem(this.gatePassFilterSessionKey);
    if (!saved) return;

    const filters = JSON.parse(saved);

    // Patch form values first
    this.searchGateForm.patchValue({
      category: filters.category ?? null,
      subCategory: filters.subCategory ?? null,
      item: filters.item ?? null,
      from: filters.from ?? '',
      to: filters.to ?? '',
      gate_pass_number: filters.gate_pass_number ?? '',
      transferType: filters.transferType ?? null,
      to_project: filters.to_project ?? null,
      to_warehouse: filters.to_warehouse ?? null
    });

    //  Safeguard for undefined lists

    if (filters.category && Array.isArray(this.subcategoryLists)) {
      this.filteredSubcategoryListsSearch =
        this.subcategoryLists.filter(sub =>
          sub.group_id == filters.category
        );
    }

    if (filters.category && filters.subCategory && Array.isArray(this.materialsList)
    ) {
      this.filteredMaterialsList =
        this.materialsList.filter(item =>
          item.group_id == filters.category &&
          item.sub_group_id == filters.subCategory
        );
    }
  }



  clearMaterialsConsumed() {
    const formArray = this.materialConsumedForm.get('consumedMaterials') as FormArray;

    formArray.clear();
    this.addConsumedMaterial();
    this.materialConsumedForm.reset();
    this.isConSaveDisabled = false;
    // Explicitly reset dropdowns for safety
    setTimeout(() => {
      formArray.controls.forEach(ctrl => {
        ctrl.get('consumedMaterial')?.setValue('');
      });
    });
  }

  addConsumedMaterial() {
    this.consumedMaterials.push(this.createConsumedMaterial());
  }

  removeConsumedMaterial(index: number) {
    this.consumedMaterials.removeAt(index);
  }
  get consumedMaterials(): FormArray {
    return this.materialConsumedForm.get('consumedMaterials') as FormArray;
  }

  createConsumedMaterial(): FormGroup {
    return this.fb.group({
      consumedMaterial: ['', Validators.required],
      consumption_id: [''],
      balanceQuantity: [''],
      originalBalance: [''],
      usedQuantity: [''],
      consumedScrap: [''],
      consumedUnit: [''],
      consumedRate: [''],
      consumedAmount: [''],
      consumedWarehouse: [''],
      category: [''],
      subCategory: ['']
    });
  }

  // getAvailableMaterials(index: number) {
  //   const selectedMaterials = this.consumedMaterials.controls
  //     .map((control, i) => i !== index ? control.get('consumedMaterial')?.value : null)
  //     .filter(val => val); // remove empty/null

  //   return this.getMaterialUsedData.filter(m =>
  //     !selectedMaterials.includes(m.material_id)
  //   );
  // }

  getAvailableMaterials(index: number) {
    if (!this.getMaterialUsedData) return []; // <-- FIX

    const selectedMaterials = this.consumedMaterials.controls
      .map((control, i) => i !== index ? control.get('consumedMaterial')?.value : null)
      .filter(val => val);

    return this.getMaterialUsedData.filter(m =>
      !selectedMaterials.includes(m.material_id)
    );
  }


  onDateSelected(event: any) {
    event.target.blur(); // closes the picker once value is chosen
    this.getMaterialsUsedLists();
  }

  getMaterialsUsedLists() {
    let formData = new FormData();
    const project_id = this.materialConsumedForm.get('projectName')?.value;
    formData.append('project_id', project_id);
    formData.append('consumedDate', this.materialConsumedForm.get('consumedDate')?.value);
    this.ProjectService.getMaterialsUsedLists(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.getMaterialUsedData = resp.data;
    });
  }

  setTab(tabName: string) {
    if (this.activeICMTab === tabName) return;

    this.activeICMTab = tabName;

    setTimeout(() => {   // ✅ wait for DOM to become visible

      if (tabName === 'Gate Pass') {
        this.reloadTable(0);
      }

      else if (tabName === 'machinereading') {
        this.reloadTable(1);
      }

      else if (tabName === 'consumption') {
        this.reloadTable(2);
      }

      else if (tabName === 'rentItemGatePass') {
        this.reloadTable(3);
      }

    }, 0);
  }


  projectlist() {
    let projectlist = new FormData();

    this.hrservice.projectlist(projectlist).pipe(takeUntil(this.destroy$)).subscribe(Response => {

      this.respProject = (Response.data || []).sort((a: any, b: any) =>
        a.projectName?.toLowerCase().localeCompare(b.projectName?.toLowerCase())
      );

    });
  }




  getAllMaterialLists() {
    let formData = new FormData();
    this.ProjectService.getAllMaterialsLists(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {

      this.materialsList = resp.data;
      this.filteredMaterialsList = [...this.materialsList];
      this.updateFilteredMaterialsForAllRows();
    });
  }

  getAllRentedItemsList() {
    const formData = new FormData();
    this.stockService.getAllrentedItemsLists(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((resp: any) => {
        this.rentedItemsList = Array.isArray(resp) ? resp : (resp?.data || []);
      });
  }

  clearItemSelection() {
    this.searchGateForm.patchValue({ item: null });
    this.filteredMaterialsList = [...this.materialsList];
  }


  // Get materials form array
  get materials(): FormArray {
    return this.gatePassForm.get('materials') as FormArray;
  }

  // Create a new material form group
  createMaterial(): FormGroup {
    return this.fb.group({
      fromWarehouse: [''],
      category: [''],
      subcategory: [''],
      materialUsed: ['', Validators.required],
      quantity: [''],
      out_time: [''],
      current_balance: [{ value: '', disabled: true }],
      unit: [''],
      showExtraFields: [false],
      used_quantity: [''],
      scrap: [''],
      rate: [''],
      amount: [{ value: '', disabled: true }],
      balance: [''],
    });
  }

  // getAllMaterialLists(){
  //     let formData = new FormData();
  //     this.ProjectService.getAllMaterialsLists(formData).pipe(takeUntil(this.destroy$)).subscribe(resp =>{
  //         this.materialsList = resp.data;
  //     });
  // }  

  // onWarehouseChange(event: Event){
  //   const godownId = (event.target as HTMLSelectElement).value;
  //   let formData = new FormData();
  //   formData.append('godown_id',godownId);
  //   this.ProjectService.getWarehouseFromInventory(formData).pipe(takeUntil(this.destroy$)).subscribe(resp =>{
  //     
  //     this.materialsList = resp.data;
  //   });
  // }



  addMaterial() {
    this.materials.push(this.createMaterial());
    const newIndex = this.materials.length - 1;
    this.rowMaterialsList[newIndex] = [];
    this.rowCategoryList[newIndex] = [];
    this.rowSubCategoryList[newIndex] = [];
    this.rowUnitsList[newIndex] = [];
    this.filteredMaterialsListByRow[newIndex] = [];
    this.updateFilteredMaterialsForAllRows();

    setTimeout(() => {
      const row = this.materials.at(newIndex) as FormGroup;
      row.get('materialUsed')?.setValue('');
    });
  }



  // removeMaterial(index: number) {
  //   this.materials.removeAt(index);
  //   this.updateFilteredMaterialsForAllRows();
  // }

  removeMaterial(index: number) {
    this.materials.removeAt(index);

    this.rowMaterialsList.splice(index, 1);
    this.filteredMaterialsListByRow.splice(index, 1);
    this.rowUnitsList.splice(index, 1);
    this.rowCategoryList.splice(index, 1);
    this.rowSubCategoryList.splice(index, 1);

    this.updateFilteredMaterialsForAllRows();
  }

  validateMaterialsArray(control: AbstractControl): { [key: string]: any } | null {
    const formArray = control as FormArray;

    if (!formArray || formArray.length === 0) {
      return { noMaterials: true };
    }
    const hasMaterialUsed = formArray.controls.some(
      group => group.get('materialUsed')?.value && group.get('materialUsed')?.value !== ''
    );
    if (!hasMaterialUsed) {
      return { noMaterialUsed: true };
    }
    return null;
  }

  employeetypenamelist() {
    let employeelist = new FormData();
    this.crmservice.getEmployee(employeelist).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.employee = resp.data;
    });
  }

  getVehicleslists() {
    let formData = new FormData();
    formData.append('status_enabled', '1');
    this.ProjectService.getVehicleslists(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.vehicleList = resp.data;
    });
  }

  getWarehouselists() {
    let formData = new FormData();
    formData.append('statue_enabled', '1');
    this.ProjectService.getWarehouselists(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.warehouseList = resp.data;
    });
  }


  getProjectsLists() {
    let formData = new FormData();
    this.ProjectService.getAllProjectsLists(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.projectsList = resp.data;
    });
  }

  // onTransferTypeChange(event: any) {
  //   const selectedType = event.target.value;

  //   this.selectedTransferType = selectedType !== '';
  //   this.isProjectType = selectedType === 'project_type';

  //   // Reset fields when switching type
  //   if (this.isProjectType) {
  //     this.gatePassForm.patchValue({
  //       warehouseLists: '',
  //       projectName: '',
  //       fromWarehouse: '',
  //       toWarehouse: ''
  //     });
  //   } else {
  //     this.gatePassForm.patchValue({
  //       fromWarehouse: '',
  //       toWarehouse: '',
  //       warehouseLists: '',
  //       projectName: ''
  //     });

  //     // Reset checkbox values for all materials
  //     const materialsArray = this.gatePassForm.get('materials') as FormArray;
  //     materialsArray.controls.forEach(control => {
  //       control.get('showExtraFields')?.setValue(false);
  //     });
  //   }
  // }



  saveMaterialForm() {
    this.submitted = true;

    if (this.gatePassForm.valid) {
      this.isSaveDisabled = true;
      const materialsArray = this.gatePassForm.getRawValue().materials;

      const transferType = this.gatePassForm.get('transferType')?.value;
      const fromWarehouseLists = this.gatePassForm.get('warehouseLists')?.value;
      const toProjectName = this.gatePassForm.get('projectName')?.value;
      const fromWarehouse = this.gatePassForm.get('fromWarehouse')?.value;
      const toWarehouse = this.gatePassForm.get('toWarehouse')?.value;

      const saveRequests = materialsArray.map((m: any) => {
        const formData = new FormData();

        // Gate Pass Fields
        const gatepass_id = this.gatePassForm.get('gatepass_id')?.value;
        if (gatepass_id) formData.append('gatepass_id', gatepass_id);

        formData.append('transferType', transferType);
        formData.append('date', this.gatePassForm.get('date')?.value);
        formData.append('fromWarehouseLists', fromWarehouseLists);
        formData.append('toProjectName', toProjectName);
        formData.append('fromWarehouse', fromWarehouse);
        formData.append('toWarehouse', toWarehouse);
        formData.append('vehicleNameNo', this.gatePassForm.get('vehicleNameNo')?.value);
        formData.append('issuedTo', this.gatePassForm.get('issuedTo')?.value);
        formData.append('issuedBy', this.gatePassForm.get('issuedBy')?.value);
        formData.append('gatePass', this.gatePassForm.get('gatePass')?.value);
        formData.append('description', this.gatePassForm.get('description')?.value);

        // Material Fields
        formData.append('materialUsed', m.materialUsed);
        formData.append('quantity', m.quantity);
        formData.append('unit', m.unit);
        formData.append('out_time', m.out_time);
        formData.append('current_balance', m.current_balance);

        if (m.showExtraFields) {
          formData.append('flag', '1');
          formData.append('used_quantity', m.used_quantity);
          formData.append('scrap', m.scrap);
          formData.append('rate', m.rate);
          formData.append('amount', m.amount);
          if (m.used_quantity != null && m.scrap != null) {
            const balance = Number(m.quantity || 0) - (Number(m.used_quantity || 0) + Number(m.scrap || 0));
            formData.append('balance', balance.toString());
          }
        }

        // === Always called ===
        const requests = [this.stockService.saveGatePassDetails(formData)];

        //  Conditional Logic: Only ONE API will run 
        if (transferType === 'project_type' && fromWarehouseLists && toProjectName) {
          //  Project transfer
          const consumptionData = new FormData();
          // consumptionData.append('transferType', transferType);
          consumptionData.append('project_id', toProjectName);
          consumptionData.append('date', this.gatePassForm.get('date')?.value);
          consumptionData.append('warehouse_id', fromWarehouseLists);
          consumptionData.append('vehicle_id', this.gatePassForm.get('vehicleNameNo')?.value);
          consumptionData.append('issued_to_id', this.gatePassForm.get('issuedTo')?.value);
          consumptionData.append('issued_by_id', this.gatePassForm.get('issuedBy')?.value);
          consumptionData.append('gatePass', this.gatePassForm.get('gatePass')?.value);
          consumptionData.append('description', this.gatePassForm.get('description')?.value);

          // Material-specific fields
          consumptionData.append('materialUsed', m.materialUsed);
          consumptionData.append('quantity', m.quantity);
          consumptionData.append('unit', m.unit);
          consumptionData.append('out_time', m.out_time);

          requests.push(this.stockService.saveWarehouseToProject(consumptionData));

        } else if (fromWarehouse && toWarehouse) {
          //  Warehouse transfer
          let warehouseTransferData = new FormData();
          const selectedMaterial = this.materialsList.find(mat => mat.item === m.materialUsed);

          if (selectedMaterial) {
            warehouseTransferData.append('groupid', selectedMaterial.groupid);
            warehouseTransferData.append('subgroupid', selectedMaterial.subgroupid);
            warehouseTransferData.append('item_id', selectedMaterial.item_id);
            warehouseTransferData.append('item', selectedMaterial.item);
          }
          warehouseTransferData.append('date', this.gatePassForm.get('date')?.value);
          warehouseTransferData.append('unit', m.unit);
          warehouseTransferData.append('currentBalance', m.quantity);
          warehouseTransferData.append('warehouse', toWarehouse)

          requests.push(this.stockService.saveWarehouseToWarehouse(warehouseTransferData));
        }

        return forkJoin(requests); // Executes both APIs (1 always + 1 conditional)
      });

      // Execute all materials together
      forkJoin(saveRequests).pipe(takeUntil(this.destroy$)).subscribe({
        next: (responses) => {
          // responses: array of [ [api1, api2], ...]
          const allSaved = responses.every(resGroup => resGroup[0].data === true);

          if (allSaved) {
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'Material details saved successfully!',
              timer: 3000,
              showConfirmButton: false
            });

            this.closebutton.nativeElement.click();
            this.gatePassForm.reset();
            this.materials.clear();
            this.reloadTable(0);
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: 'Some materials could not be saved.',
              confirmButtonText: 'OK'
            });
          }
        },
        error: () => {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Error while saving the data.',
            confirmButtonText: 'OK'
          });
        }
      });

    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Form',
        text: 'Please fill all required fields before saving.',
      });
    }
  }

  ViewGatePass(type: any, item: any) {

    const formattedDate = this.datepipe.transform(
      item.date,
      'yyyy-MM-dd HH:mm:ss'
    );

    this.router.navigate(
      ['stock-add-gate-pass'],
      {
        queryParams: {
          mode: type,
          gate_pass: item.gate_pass,
          date: formattedDate
        }
      }
    );

  }

  removeGatePass(row: any) {
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

        transation_form.append('gatepass_id', row.gatepass_id);
        this.stockService.removeGatePass(transation_form).pipe(takeUntil(this.destroy$)).subscribe(Response => {
          if (Response.data == true) {

            if (row.transfer_type === 'project_type') {

              const projectForm = new FormData();
              projectForm.append('gate_pass', row.gate_pass);
              projectForm.append('date', row.date);
              projectForm.append('from_warehouse_id', row.from_warehouse_id);
              projectForm.append('to_project_name', row.to_project_name);
              projectForm.append('issued_material', row.issued_material);
              projectForm.append('quantity', row.quantity);
              projectForm.append('out_time', row.out_time);
              projectForm.append('consumed', row.consumed);

              this.stockService.updateProjectBalanceAfterDelete(projectForm).pipe(takeUntil(this.destroy$)).subscribe(() => { });

            }
            else if (row.transfer_type === 'warehouse_type') {

              const warehouseForm = new FormData();
              warehouseForm.append('gatepass_id', row.gatepass_id);
              warehouseForm.append('from_warehouse_id', row.from_warehouse_id);
              warehouseForm.append('to_warehouse_id', row.to_warehouse_id);
              warehouseForm.append('issued_material', row.issued_material);
              warehouseForm.append('quantity', row.quantity);

              this.stockService.updateWarehouseBalanceAfterDelete(warehouseForm).pipe(takeUntil(this.destroy$)).subscribe(() => { });

            }
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'Gate Pass Deleted Sucessfully',
              showConfirmButton: false,
              timer: 2000
            });
            this.reloadTable(0);
          }
          else {
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: 'Failed',
              showConfirmButton: false,
              timer: 3000
            });
          }
        });
      }
    });
  }
  clearMaterials() {
    this.selectedTransferType = false;
    this.gatePassForm.reset();
    this.gatePassForm.enable();

    this.materials.clear();
    this.isHideWorkSave = true;
    this.isHideAddMaterial = false;
    this.isProjectType = false;
    this.submit_btn = false;
    this.submitted = false;
    this.rowUnitsList = [];
    // this.isSaveDisabled = false;

    this.materials.push(
      this.fb.group({
        materialUsed: ['', Validators.required],
        quantity: [''],
        current_balance: [''],
        out_time: [''],
        unit: [''],
        altUnit: [''],
        showExtraFields: [false],
        used_quantity: [''],
        scrap: [''],
        rate: [''],
        amount: [''],
      })
    );
    this.rowUnitsList.push([])
  }


  openConsumptionModal() {
    // Enable form for Add mode
    this.materialConsumedForm.enable();

    // Reset flags
    this.isQuantityValid = true;
    this.isConSaveDisabled = false;

    // Clear previous data
    this.materialConsumedForm.reset();
    this.consumedMaterials.clear();

    // Add one empty material row (optional but recommended)
    this.addConsumedMaterial();
  }


  openGatePassModal() {
    this.router.navigate(['/stock-add-gate-pass']);
    // this.gatePassForm.enable();
    // const materialsArray = this.gatePassForm.get('materials') as FormArray;

    // Disable only current_balance for each material row
    // materialsArray.controls.forEach(materialGroup => {
    //   materialGroup.get('current_balance')?.disable();
    // });
    // this.isHideWorkSave = true;
    // this.isHideAddMaterial = true;
    // this.isSaveDisabled = false;
  }

  openRentItemGatePass() {
    this.router.navigate(['/stock-add-rent-item-gate-pass']);
  }

  route(link: any) {
    this.router.navigate(['/' + link]);
  }

  onQuantityChange(changedField: 'usedQuantity' | 'consumedScrap', index: number): void {
    const selectedGroup = this.consumedMaterials.at(index) as FormGroup;

    const usedQty = Number(selectedGroup.get('usedQuantity')?.value) || 0;
    const scrapQty = Number(selectedGroup.get('consumedScrap')?.value) || 0;
    const totalUsed = usedQty + scrapQty;

    // always compute from this row's own baseline, set on material select / edit load -
    // not a shared component field, so multiple rows don't clobber each other's baseline
    const materialBalance = Number(selectedGroup.get('originalBalance')?.value) || 0;

    if (totalUsed > materialBalance) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Quantity',
        text: 'Used Quantity + Scrap cannot be greater than Balance Quantity'
      });

      selectedGroup.patchValue(
        { balanceQuantity: materialBalance },
        { emitEvent: false }
      );
      this.isQuantityValid = false;
      return;
    } else {

      const updatedBalance = materialBalance - totalUsed;
      selectedGroup.patchValue(
        { balanceQuantity: updatedBalance },
        { emitEvent: false }
      );

      this.isQuantityValid = true;
    }
  }




  onMaterialChange(selectedItems: any[], index: number) {
    const row = this.materials.at(index) as FormGroup;

    if (!selectedItems || selectedItems.length === 0) {
      row.patchValue({
        current_balance: '',
        unit: ''
      }, { emitEvent: false });

      this.updateFilteredMaterialsForAllRows();
      return;
    }

    const sourceList =
      (this.rowMaterialsList[index] && this.rowMaterialsList[index].length)
        ? this.rowMaterialsList[index]
        : this.materialsList;

    const lastSelected = selectedItems[selectedItems.length - 1];
    const selectedObj = sourceList.find(m => m.item === lastSelected);

    if (selectedObj) {
      row.patchValue({
        category: selectedObj.groupid,
        subcategory: Array.from(new Set([
          ...(row.get('subcategory')?.value || []),
          selectedObj.subgroupid
        ])),
        current_balance: selectedObj.current_balance
      }, { emitEvent: false });

      this.loadUnitsForMaterial(lastSelected, index, selectedObj.unit || undefined);
    }

    this.updateFilteredMaterialsForAllRows();
  }



  loadUnitsForMaterial(materialName: string, index: number, preselectedUnit?: string) {
    let formData = new FormData();
    formData.append('itemName', materialName);

    this.ProjectService.getUnitsByMaterial(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      const unitData = resp.data || [];
      this.rowUnitsList[index] = unitData;

      if (unitData && unitData.length > 0) {
        const unitToSet = preselectedUnit || unitData[0].unit_name;
        (this.materials.at(index) as FormGroup).patchValue({ unit: unitToSet }, { emitEvent: false });
      }
    });
  }

  onCategoryChange(e: any, index: number) {
    const row = this.materials.at(index) as FormGroup;

    // ALWAYS read from form, NOT from $event
    const selectedGroupId = row.get('category')?.value;

    const data = this.rowRawMaterialsList[index] || [];

    if (!selectedGroupId) {
      row.patchValue({
        subcategory: [],
        materialUsed: [],
        current_balance: '',
        unit: ''
      }, { emitEvent: false });

      this.rowSubCategoryList[index] = [];
      this.updateFilteredMaterialsForAllRows();
      return;
    }

    this.rowSubCategoryList[index] = Array.from(
      new Map(
        data
          .filter(x => x.groupid == selectedGroupId)
          .map(x => [x.subgroupid, { subgroupid: x.subgroupid, subgroupname: x.subgroupname }])
      ).values()
    );

    row.patchValue({
      subcategory: [],
      materialUsed: [],
      current_balance: '',
      unit: ''
    }, { emitEvent: false });

    this.updateFilteredMaterialsForAllRows();
  }




  onSubcategoryChange(e: any, index: number) {
    const row = this.materials.at(index) as FormGroup;
    const selectedSubs = row.get('subcategory')?.value || [];

    // just refilter list, do NOT clear materialUsed here
    this.updateFilteredMaterialsForAllRows();

    // AFTER filtering, remove only invalid materials
    const currentMaterials = row.get('materialUsed')?.value || [];

    const filtered = this.filteredMaterialsListByRow[index] || [];

    const stillValid = currentMaterials.filter((item: any) =>
      filtered.some(x => x.item === item)
    );

    // If some selected materials were removed by the filter,
    // update the selection to only valid ones.
    row.patchValue({
      materialUsed: stillValid
    }, { emitEvent: false });
  }


  onWarehouseChange(event: Event, index: number) {
    const godownId = (event.target as HTMLSelectElement).value;
    if (!godownId) return;

    const formData = new FormData();
    formData.append('godown_id', godownId);

    this.ProjectService.getWarehouseFromInventory(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe(resp => {

        const data = resp.data || [];

        // VERY IMPORTANT: store RAW data
        this.rowRawMaterialsList[index] = data.slice();   // untouched original list

        // This list can change during filtering
        this.rowMaterialsList[index] = data.slice();

        // Build unique category list
        this.rowCategoryList[index] = Array.from(
          new Map(
            data.map(x => [x.groupid, { groupid: x.groupid, groupname: x.groupname }])
          ).values()
        );

        // Build all subcategories initially
        this.rowSubCategoryList[index] = Array.from(
          new Map(
            data.map(x => [x.subgroupid, { subgroupid: x.subgroupid, subgroupname: x.subgroupname }])
          ).values()
        );

        const row = this.materials.at(index) as FormGroup;

        row.patchValue({
          category: '',
          subcategory: [],
          materialUsed: [],
          current_balance: '',
          unit: ''
        }, { emitEvent: false });

        this.rowUnitsList[index] = [];

        this.updateFilteredMaterialsForAllRows();
      });
  }


  updateFilteredMaterialsForAllRows() {
    const controls = this.materials.controls;

    const selectedMaterials = controls
      .map(c => c.get('materialUsed')?.value || [])
      .reduce((acc, curr) => acc.concat(curr), [])
      .filter(v => v);


    this.filteredMaterialsListByRow = controls.map((control: AbstractControl, idx: number) => {

      const currentSelection = control.get('materialUsed')?.value || [];
      const groupid = control.get('category')?.value;
      const subgroups = control.get('subcategory')?.value || [];

      const sourceList = (this.rowMaterialsList[idx] && this.rowMaterialsList[idx].length)
        ? this.rowMaterialsList[idx]
        : this.materialsList;

      let list = sourceList.slice();

      if (groupid) list = list.filter(m => m.groupid == groupid);
      if (subgroups.length) list = list.filter(m => subgroups.includes(m.subgroupid));

      list = list.filter(m => {
        const globalSelected = selectedMaterials.includes(m.item);
        const rowSelected = currentSelection.includes(m.item);
        return rowSelected || !globalSelected;
      });

      currentSelection.forEach((item: any) => {
        if (!list.find(x => x.item === item)) {
          control.patchValue({
            materialUsed: [],
            current_balance: '',
            unit: ''
          }, { emitEvent: false });

          this.rowUnitsList[idx] = [];
        }
      });

      return list;
    });
  }




  updateQuantity(index: number) {
    const materialGroup = this.materials.at(index) as FormGroup;

    let quantity = Number(materialGroup.get('quantity')?.value) || 0;
    let used_quantity = Number(materialGroup.get('used_quantity')?.value) || 0;
    let scrap = Number(materialGroup.get('scrap')?.value) || 0;

    const totalUsed = used_quantity + scrap;

    // Case 1: User is typing quantity
    if (quantity > totalUsed) {
      // Quantity is greater than total used -> simply update the difference
      // Remaining balance will be quantity - totalUsed
      // No action needed for used_quantity/scrap here
    } else if (quantity < totalUsed) {
      //  Case 2: Quantity decreased -> adjust scrap first, then used_quantity
      let diff = totalUsed - quantity;

      if (scrap >= diff) {
        scrap -= diff;  // reduce scrap first
      } else {
        diff -= scrap;
        scrap = 0;
        used_quantity = Math.max(0, used_quantity - diff); // then reduce used_quantity
      }
    }

    //  Update values back to the form
    materialGroup.patchValue(
      {
        used_quantity: used_quantity,
        scrap: scrap
      },
      { emitEvent: false }
    );
  }

  updateAmount(index: number) {
    const group = this.materials.at(index) as FormGroup;
    const usedQty = group.get('used_quantity')?.value || 0;
    const rate = group.get('rate')?.value || 0;
    const amount = usedQty * rate;

    const formattedAmount = Number.isInteger(amount) ? amount : amount.toFixed(2);
    group.get('amount')?.setValue(formattedAmount, { emitEvent: false });
  }

  searchGate() {

    const from = this.searchGateForm.get('from')?.value;
    const to = this.searchGateForm.get('to')?.value;

    // 🔹 Date validation (only if one is filled)
    if (from || to) {

      // Case 1: One field empty
      if (!from || !to) {
        Swal.fire({
          icon: 'warning',
          title: 'Invalid Date Range',
          text: 'Please select both From and To dates.'
        });
        return;
      }

      // Case 2: To date before From date
      if (new Date(to) < new Date(from)) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Date Range',
          text: 'To date cannot be before From date.'
        });
        return;
      }
    }

    // 🔹 Prepare filter object explicitly (safer than saving full form)
    const filterData = {
      category: this.searchGateForm.get('category')?.value,
      subCategory: this.searchGateForm.get('subCategory')?.value,
      item: this.searchGateForm.get('item')?.value,
      from: from,
      to: to,
      gate_pass_number: this.searchGateForm.get('gate_pass_number')?.value,
      transferType: this.searchGateForm.get('transferType')?.value,
      to_project: this.searchGateForm.get('to_project')?.value,
      to_warehouse: this.searchGateForm.get('to_warehouse')?.value
    };

    // 🔹 Save filters in session
    sessionStorage.setItem(
      this.gatePassFilterSessionKey,
      JSON.stringify(filterData)
    );

    // 🔹 Reload Datatable
    this.gatePassDatatablecode();
    this.reloadTable(0);
  }


  resetGate() {

    this.searchGateForm.reset({
      category: null,
      subCategory: null,
      item: null,   // MUST be null
      from: null,
      to: null,
      gate_pass_number: null,
      transferType: null,
      to_project: null,      // added
      to_warehouse: null
    });

    // Reset filtered lists
    this.filteredSubcategoryListsSearch = [...this.subcategoryLists];
    this.filteredMaterialsList = [...this.materialsList];

    // Remove saved filters
    sessionStorage.removeItem(this.gatePassFilterSessionKey);

    // Reload data
    this.gatePassDatatablecode();
    this.reloadTable(0);
  }


  addnewMachine() {
    this.submitted = false;
    this.fieldStatus = false;
    this.setData = false;
    this.addMachineReading.reset();
    this.machineTitle = 'Add new Entry';
    this.addMachineReading.enable();
    this.isButtonDisabled = false;
    this.openMachineReadingModel();
  }

  openMachineReadingModel() {
    const modalRef = this.modalService.open(MachineReadingPopupComponent, { size: 'lg', backdrop: 'static', keyboard: true });
    modalRef.componentInstance.machineTitle = this.machineTitle;
    modalRef.componentInstance.date = this.readingDate;
    modalRef.componentInstance.respcontractor = this.respcontractor;
    modalRef.componentInstance.vechicalList = this.vechicalList;
    modalRef.componentInstance.isButtonDisabled = this.isButtonDisabled;
    modalRef.componentInstance.submitted = this.submitted;
    modalRef.componentInstance.reading = this.reading;
    modalRef.componentInstance.startReading = this.startReading;
    modalRef.componentInstance.stopReading = this.stopReading;
    modalRef.componentInstance.machineStart = this.machineStart;
    modalRef.componentInstance.machineStop = this.machineStop;
    modalRef.componentInstance.extendedTime = this.extendedTime;
    modalRef.componentInstance.vendertype = this.vendertype;
    modalRef.componentInstance.vechiceltype = this.vechiceltype;
    modalRef.componentInstance.vendorId = this.vendorId;
    modalRef.componentInstance.setData = this.setData;
    modalRef.componentInstance.fieldStatus = this.fieldStatus;
    modalRef.componentInstance.saveButton1 = this.saveButton1;
    modalRef.componentInstance.respProject = this.respProject;
    modalRef.componentInstance.projectId = this.projectId;
    modalRef.result.then((response: any) => {
      this.reloadTable(1);
    }, () => { });

  }

  reload() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  viewMachine(type: any, readingid: any) {
    this.submitted = false;

    if (type === 'view_machine') {
      this.fieldStatus = true;
      this.machineTitle = 'View Entry';
    } else {
      this.fieldStatus = false;
      this.machineTitle = 'Add new Entry';
    }

    let formData = new FormData();
    formData.append('readingid', readingid);
    this.hrservice.fetchMachineDataById(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {

      const machineData = resp.data[0];
      const modalRef = this.modalService.open(MachineReadingPopupComponent, { size: 'lg', backdrop: 'static', keyboard: true });
      modalRef.componentInstance.respProject = this.respProject;
      modalRef.componentInstance.fieldStatus = this.fieldStatus;
      modalRef.componentInstance.machineTitle = this.machineTitle;
      modalRef.componentInstance.machineData = machineData;

      modalRef.result.then((result) => {

        if (result?.success) {
          this.reloadTable(1);
        }
      }).catch(() => { });
    });

    // this.openMachineReadingModel();
  }


  deleteMachine(readingid: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes !',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        let formData = new FormData();
        formData.append('readingid', readingid);

        this.hrservice.DeletemachineByid(formData).pipe(takeUntil(this.destroy$)).subscribe(
          (resp) => {
            if (resp.data === true) {   //  Only show success if deletion was successful
              Swal.fire('Deleted!', 'The material entry has been deleted.', 'success');
              this.reloadTable(1);
            } else {
              Swal.fire('Error!', 'Failed to delete the entry.', 'error');
            }
          },
          (error) => {
            Swal.fire('Error!', 'Something went wrong while deleting.', 'error');
          }
        );
      } else {
        Swal.fire('Cancelled', 'The material entry is safe.', 'error');
      }
    });
  }

  gatePassDatatablecode() {
    this.gatePassDatatableparameter.from = this.searchGateForm.get('from')?.value;
    this.gatePassDatatableparameter.to = this.searchGateForm.get('to')?.value;
    this.gatePassDatatableparameter.gate_pass_number = this.searchGateForm.get('gate_pass_number')?.value;
    this.gatePassDatatableparameter.transferType = this.searchGateForm.get('transferType')?.value;
    this.gatePassDatatableparameter.item = this.searchGateForm.get('item')?.value;
    this.gatePassDatatableparameter.toProject = this.searchGateForm.get('to_project')?.value;
    this.gatePassDatatableparameter.toWarehouse = this.searchGateForm.get('to_warehouse')?.value;
    this.gatePassDatatableparameter.category = this.searchGateForm.get('category')?.value;
    this.gatePassDatatableparameter.subCategory = this.searchGateForm.get('subCategory')?.value;

    const that = this;
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });

    this.dtOptionsGatePass = {
      processing: true,
      serverSide: true,
      pageLength: 10,
      dom: 'lrtip',
      lengthMenu: [[5, 10, 25, 50, 100], [5, 10, 25, 50, 100]],
      columnDefs: [
        { orderable: false, targets: [0, 10] }
      ],

      columns: [
        { data: 'dummy' }, // first blank column
        { data: 'date' },
        { data: 'transfer_type' },
        { data: 'gate_pass' },
        { data: 'issued_material' },
        { data: 'quantity' },
        { data: 'from_warehouse_name' },
        { data: 'to_project_name' },
        { data: 'to_warehouse_name' },
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
          ...this.gatePassDatatableparameter,
          order_column: orderColumnIndex,
          order_dir: orderDir,
          order_column_name: orderColumnName
        };

        that.http.post<DataTablesResponse>(environment.APIEndpoint + 'stock.fetchgatePassData&reload=1', params, { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {
          that.workContractData = resp.data;
          callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsTotal,
            data: [] // UI renders using Angular, not DataTables
          });
        });
      }
    };
  }

  machineReadingDatatblecode() {
    this.machineReadingDatatableParameter.from = this.searchMachineForm.get('from')?.value;
    this.machineReadingDatatableParameter.to = this.searchMachineForm.get('to')?.value;
    this.machineReadingDatatableParameter.project_name = this.searchMachineForm.get('project')?.value;
    this.machineReadingDatatableParameter.vehicle_name = this.searchMachineForm.get('vehicle')?.value;
    this.machineReadingDatatableParameter.gate_pass = this.searchMachineForm.get('gate_pass_number')?.value;

    this.fetchTotalRunAndTime();

    const that = this;
    const headers = new HttpHeaders({ 'content-Type': 'text/plain' });

    this.dtOptionsMachine = {
      processing: true,
      serverSide: true,
      pageLength: 10,
      dom: 'lrtip',
      lengthMenu: [[5, 10, 25, 50, 100], [5, 10, 25, 50, 100]],
      columnDefs: [{ orderable: false, targets: [0, 10] }],
      columns: [],

      ajax: (dataTableparameters: any, callback) => {
        const orderColumnIndex = dataTableparameters.order[0].column;
        const orderDir = dataTableparameters.order[0].dir;
        const orderColumnName = dataTableparameters.columns[orderColumnIndex].data;

        const params = {
          ...dataTableparameters,
          ...this.machineReadingDatatableParameter,
          order_column: orderColumnIndex,
          order_dir: orderDir,
          order_column_name: orderColumnName
        };

        that.http.post<DataTablesResponse>(
          environment.APIEndpoint + 'machine.fetchData&reload=1',
          params,
          { responseType: 'json', headers }
        ).pipe(takeUntil(this.destroy$)).subscribe(resp => {
          that.machineReadingData = resp.data;
          console.log(resp.data);
          callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsTotal,
            data: [] // UI renders using Angular, not DataTables
          });
        });
      }

    }
  }


  fetchTotalRunAndTime() {

    const that = this;
    const headers = new HttpHeaders({ 'content-Type': 'text/plain' });

    const params = {
      ...this.machineReadingDatatableParameter
    };

    that.http.post(
      environment.APIEndpoint + 'machine.fetchTotalRunAndTime&reload=1',
      params,
      { headers }
    ).pipe(takeUntil(this.destroy$)).subscribe((resp: any) => {

      that.searchMachineForm.patchValue({
        totalTimeSpent: resp?.total_time_spent ?? 0,
        totalRun: resp?.total_run ?? 0
      });

    }, error => {
      console.error('Summary API Error:', error);
    });

  }

  consumptionListsDatatablecode() {
    this.consumptionListsDatatableParameter.from = this.searchConsumptionForm.get('from')?.value;
    this.consumptionListsDatatableParameter.to = this.searchConsumptionForm.get('to')?.value;
    this.consumptionListsDatatableParameter.project_id = this.searchConsumptionForm.get('project')?.value;
    this.consumptionListsDatatableParameter.gate_pass = this.searchConsumptionForm.get('gate_pass')?.value;
    this.consumptionListsDatatableParameter.category = this.searchConsumptionForm.get('category')?.value;
    this.consumptionListsDatatableParameter.subCategory = this.searchConsumptionForm.get('subCategory')?.value;
    this.consumptionListsDatatableParameter.item = this.searchConsumptionForm.get('item')?.value;

    const that = this;
    const headers = new HttpHeaders({ 'content-Type': 'text/plain' });

    this.dtOptionsConsumption = {
      processing: true,
      serverSide: true,
      pageLength: 10,
      dom: 'lrtip',
      lengthMenu: [[5, 10, 25, 50, 100], [5, 10, 25, 50, 100]],
      columnDefs: [{ orderable: false, targets: [0, 10] }],
      columns: [],

      ajax: (dataTableparameters: any, callback) => {
        const orderColumnIndex = dataTableparameters.order[0].column;
        const orderDir = dataTableparameters.order[0].dir;
        const orderColumnName = dataTableparameters.columns[orderColumnIndex].data;

        const params = {
          ...dataTableparameters,
          ...this.consumptionListsDatatableParameter,
          order_column: orderColumnIndex,
          order_dir: orderDir,
          order_column_name: orderColumnName
        };

        that.http.post<DataTablesResponse>(
          environment.APIEndpoint + 'project.fetchMaterialConsumption&reload=1',
          params,
          { responseType: 'json', headers }
        ).pipe(takeUntil(this.destroy$)).subscribe(resp => {
          that.consumptionListsData = resp.data;

          callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsTotal,
            data: [] // UI renders using Angular, not DataTables
          });
        });
      }

    }
  }

  rentItemGatePassDatatablecode() {
    this.rentItemGatePassDatatableParameter.gate_pass = this.searchRentItemGatePassForm.get('gate_pass')?.value;
    this.rentItemGatePassDatatableParameter.item = this.searchRentItemGatePassForm.get('item')?.value;
    this.rentItemGatePassDatatableParameter.issued_date = this.searchRentItemGatePassForm.get('issued_date')?.value;
    this.rentItemGatePassDatatableParameter.project_id = this.searchRentItemGatePassForm.get('project')?.value;
    this.rentItemGatePassDatatableParameter.fromWarehouse = this.searchRentItemGatePassForm.get('fromWarehouse')?.value;

    const that = this;
    const headers = new HttpHeaders({ 'content-Type': 'text/plain' });

    this.dtOptionsRentItemGatePass = {
      processing: true,
      serverSide: true,
      pageLength: 10,
      dom: 'lrtip',
      lengthMenu: [[5, 10, 25, 50, 100], [5, 10, 25, 50, 100]],
      columnDefs: [{ orderable: false, targets: [0] }],
      columns: [],

      ajax: (dataTableparameters: any, callback) => {
        const orderColumnIndex = dataTableparameters.order[0].column;
        const orderDir = dataTableparameters.order[0].dir;
        const orderColumnName = dataTableparameters.columns[orderColumnIndex].data;

        const params = {
          ...dataTableparameters,
          ...this.rentItemGatePassDatatableParameter,
          order_column: orderColumnIndex,
          order_dir: orderDir,
          order_column_name: orderColumnName
        };

        that.http.post<DataTablesResponse>(
          environment.APIEndpoint + 'stock.fetchRentItemGatePassData&reload=1',
          params,
          { responseType: 'json', headers }
        ).pipe(takeUntil(this.destroy$)).subscribe(resp => {
          that.rentItemGatePassData = resp.data;
          console.log(resp.data);
          callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsTotal,
            data: []
          });
        });
      }
    };
  }


  ngAfterViewInit(): void {
    this.dtTriggerGatePass.next();
    this.dtTriggerMachine.next();
    this.dtTriggerConsumption.next();
    this.dtTriggerRentItemGatePass.next();
  }

  reloadTable(index: number) {
    const dt = this.dtElements?.toArray()[index];
    if (!dt) return;

    dt.dtInstance.then((instance: DataTables.Api) => {

      // 1️⃣ Reload data (server-side)
      instance.ajax.reload(() => {

        // 2️⃣ VERY IMPORTANT: recalc columns AFTER visible
        instance.columns.adjust();

      }, false);

    });
  }


  saveMaterialConsumption() {
    this.submitted = true;

    if (this.materialConsumedForm.valid) {
      this.isConSaveDisabled = true;
      const project_id = this.materialConsumedForm.get('projectName').value;
      const consumption_id = this.materialConsumedForm.get('consumption_id')?.value;
      const consumedDate = this.materialConsumedForm.get('consumedDate')?.value;
      const gatePass = this.materialConsumedForm.get('gatePass')?.value;

      const consumedMaterialsArray = this.consumedMaterials.controls;

      consumedMaterialsArray.forEach((group: FormGroup) => {
        let formData = new FormData();

        formData.append('project_id', project_id);
        // if (consumption_id) {
        //     formData.append('consumption_id', consumption_id);
        // }
        formData.append('date', consumedDate);
        formData.append('gatePass', gatePass);

        const materialId = group.get('consumedMaterial')?.value;
        formData.append('consumedMaterial', materialId);


        const selectedMaterial = this.getMaterialUsedData.find(
          (m: any) => m.material_id == materialId
        );
        if (selectedMaterial) {
          formData.append('item', selectedMaterial.material_used);
        }

        if (group.get('consumption_id')?.value) {
          formData.append('consumption_id', group.get('consumption_id')?.value);
        }
        formData.append('balanceQuantity', group.get('balanceQuantity')?.value);
        formData.append('consumedUnit', group.get('consumedUnit')?.value);
        formData.append('usedQuantity', group.get('usedQuantity')?.value);
        formData.append('consumedScrap', group.get('consumedScrap')?.value);
        formData.append('consumedRate', group.get('consumedRate')?.value);
        formData.append('consumedAmount', group.get('consumedAmount')?.value);
        formData.append('consumedWarehouse', project_id);


        this.ProjectService.saveMaterialConsumption(formData)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (resp: any) => {
              if (resp.data == true) {
                Swal.fire({
                  icon: 'success',
                  title: 'Saved Successfully',
                  text: 'Material consumption data has been saved.',
                  timer: 2000,
                  showConfirmButton: false,
                });

                // Close modal & reload only after last iteration
                if (group === consumedMaterialsArray[consumedMaterialsArray.length - 1]) {
                  this.reloadTable(2);
                  this.closeMaterialConModal.nativeElement.click();
                }
              } else {
                this.isConSaveDisabled = false;
                Swal.fire({
                  icon: 'error',
                  title: 'Save Failed',
                  text: resp?.message || 'Something went wrong while saving.',
                });
              }
            },
            error: (err) => {
              this.isConSaveDisabled = false;
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Server error occurred. Please try again later.',
              });
            },
          });
      });
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Form',
        text: 'Please fill all required fields before saving.',
      });
    }
  }


  // rerender(): void {
  //   if (!this.dtElement) return;

  //   this.dtElement.forEach((dtEl: any) => {
  //     if (dtEl.dtInstance) {
  //       dtEl.dtInstance.then((dt: DataTables.Api) => {
  //         dt.destroy();
  //       });
  //     }
  //   });

  //   // Trigger ONLY active table
  //   setTimeout(() => {
  //     if (this.activeICMTab === 'Gate Pass') {
  //       this.dtTriggerGatePass.next();
  //     } else if (this.activeICMTab === 'machinereading') {
  //       this.dtTriggerMachine.next();
  //     } else if (this.activeICMTab === 'consumption') {
  //       this.dtTriggerConsumption.next();
  //     }
  //   });
  // }


  // ngOnDestroy(): void {
  //   this.dtTrigger.unsubscribe();

  //   this.destroy$.next();
  //   this.destroy$.complete();

  //   if (this.dtElement && this.dtElement.dtInstance) {
  //     this.dtElement.dtInstance.then(dt => dt.destroy());
  //   }

  // }

  ngOnDestroy(): void {
    this.dtTriggerGatePass?.unsubscribe();
    this.dtTriggerMachine?.unsubscribe();
    this.dtTriggerConsumption?.unsubscribe();
    this.dtTriggerRentItemGatePass?.unsubscribe();

    this.destroy$.next();
    this.destroy$.complete();
  }




  onMaterialUsedChange(event: any, index: number) {

    const selectedId = event.target.value;
    const selectedMaterial = this.getMaterialUsedData.find(
      (m: any) => m.material_id === selectedId
    );
    if (selectedMaterial) {
      const selectedGroup = this.consumedMaterials.at(index) as FormGroup;

      const rowBalance = Number(selectedMaterial.balance) || 0;
      selectedGroup.patchValue(
        {
          balanceQuantity: rowBalance,
          originalBalance: rowBalance,
          consumedUnit: selectedMaterial.unit || '',
          consumedWarehouse: selectedMaterial.warehouse_id || '',
          usedQuantity: 0,
          consumedScrap: 0,

          category: selectedMaterial.groupname || '',
          subCategory: selectedMaterial.subgroupname || ''
        },
        { emitEvent: false }
      );
      selectedGroup.get('balanceQuantity')?.disable();
      selectedGroup.get('consumedUnit')?.disable();

      this.isQuantityValid = true;
    }
  }


  editMaterialConsumed(type: 'view_consumed' | 'edit_consumed', consumption_id: any, index: number) {
    /* ---------------------------------------
     Enable / Disable form based on mode
    ---------------------------------------- */
    if (type === 'view_consumed') {
      this.materialConsumedForm.disable();
      this.isQuantityValid = false;
    } else {
      this.materialConsumedForm.enable();
      this.isQuantityValid = true;
    }

    const formData = new FormData();
    formData.append('consumption_id', consumption_id);

    this.ProjectService.getConsumedMaterials(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe(resp => {
        const row = resp?.data?.[0];
        if (!row) return;


        /* ---------------------------------------
         Date formatting
        ---------------------------------------- */
        const parsedDate = new Date(row.date);
        const formattedDate = parsedDate.toISOString().slice(0, 16);

        /* ---------------------------------------
         Patch non-dropdown fields first
        ---------------------------------------- */
        this.materialConsumedForm.patchValue(
          {
            consumedDate: formattedDate,
            gatePass: row.gatePass
          },
          { emitEvent: false }
        );

        /* ---------------------------------------
         Reset FormArray
        ---------------------------------------- */
        this.consumedMaterials.clear();

        const materialGroup = this.createConsumedMaterial();
        this.consumedMaterials.push(materialGroup);

        const usedQty = Number(row.used_qauntity) || 0;
        const scrapQty = Number(row.scrap) || 0;
        const currBal = Number(row.balance_quantity) || 0;

        // Track this row's own original balance baseline
        const originalBalance = currBal + usedQty + scrapQty;

        /* ---------------------------------------
         WAIT FOR PROJECTS → PATCH PROJECT
        ---------------------------------------- */
        const projectInterval = setInterval(() => {
          if (this.projectsList && this.projectsList.length > 0) {
            clearInterval(projectInterval);

            this.materialConsumedForm.patchValue(
              {
                projectName: row.project_id
              },
              { emitEvent: false }
            );

            // Load materials for selected project
            this.getMaterialsUsedLists();

            /* ---------------------------------------
             WAIT FOR MATERIALS → PATCH MATERIAL
            ---------------------------------------- */
            const materialInterval = setInterval(() => {
              if (
                this.getMaterialUsedData &&
                this.getMaterialUsedData.length > 0
              ) {
                clearInterval(materialInterval);

                materialGroup.patchValue(
                  {
                    consumption_id: row.consumption_id,
                    consumedMaterial: row.material_id,
                    balanceQuantity: currBal,
                    originalBalance: originalBalance,
                    usedQuantity: usedQty,
                    consumedScrap: scrapQty,
                    consumedUnit: row.unit,
                    consumedRate: row.rate,
                    consumedAmount: row.total_amount
                  },
                  { emitEvent: false }
                );

                /* ---------------------------------------
                 Disable logic
                ---------------------------------------- */
                if (type === 'view_consumed') {
                  materialGroup.disable();
                } else {
                  materialGroup.get('balanceQuantity')?.disable();
                  materialGroup.get('consumedUnit')?.disable();
                  materialGroup.get('consumedMaterial')?.disable();

                  if (row.updated_by && row.updated_dt) {
                    materialGroup.get('consumedMaterial')?.disable();
                    materialGroup.get('usedQuantity')?.disable();
                    materialGroup.get('consumedScrap')?.disable();
                  }
                }
              }
            }, 100);
          }
        }, 100);
      });
  }

  onTransferTypeChange(event: any) {

    const value = event.target.value;

    if (value === 'project_type') {
      this.searchGateForm.patchValue({
        to_warehouse: null
      });
    }

    if (value === 'warehouse_type') {
      this.searchGateForm.patchValue({
        to_project: null
      });
    }
  }

  onRateChange(index: number): void {
    const selectedGroup = this.consumedMaterials.at(index) as FormGroup;

    const usedQty = Number(selectedGroup.get('usedQuantity')?.value) || 0;
    const scrapQty = Number(selectedGroup.get('consumedScrap')?.value) || 0;
    const rate = Number(selectedGroup.get('consumedRate')?.value) || 0;

    const totalAmount = (usedQty + scrapQty) * rate;

    selectedGroup.patchValue(
      { consumedAmount: totalAmount },
      { emitEvent: false }
    );
  }


  searchMachine() {

    const from = this.searchMachineForm.get('from')?.value;
    const to = this.searchMachineForm.get('to')?.value;

    // Validate date range
    if (from && to && new Date(to) < new Date(from)) {

      Swal.fire({
        icon: 'warning',
        title: 'Invalid Date Range',
        text: 'To Date cannot be before From Date.',
        confirmButtonColor: '#3085d6'
      });

      return; // Stop further execution
    }

    this.machineReadingDatatblecode();
    this.reloadTable(1);
  }

  resetMachine() {
    this.searchMachineForm.reset();

    this.machineReadingDatatblecode();
    this.reloadTable(1);
  }


  searchConsumption() {
    this.consumptionListsDatatablecode();
    this.reloadTable(2);
  }

  resetConsumption() {

    this.searchConsumptionForm.reset();

    // Clear dependent dropdown lists
    this.filteredSubcategoryListsConsumption = [];
    this.filteredMaterialsListConsumption = [];

    // If you want full list again after reset (recommended)
    // Uncomment below line if needed
    this.filteredSubcategoryListsConsumption = [...this.subcategoryLists];
    this.filteredMaterialsListConsumption = [...this.materialsList];

    this.consumptionListsDatatablecode();
    this.reloadTable(2);
  }

  searchRentItemGatePass() {
    this.rentItemGatePassDatatablecode();
    this.reloadTable(3);
  }

  resetRentItemGatePass() {
    this.searchRentItemGatePassForm.reset({
      gate_pass: '',
      item: null,
      issued_date: '',
      project: ''
    });

    this.rentItemGatePassDatatablecode();
    this.reloadTable(3);
  }


  onCategoryChangeConsumption(event: any) {
    const selectedCategoryId = event.target.value;

    this.filteredSubcategoryListsConsumption = this.subcategoryLists
      .filter(sub => sub.group_id === selectedCategoryId)
      .sort((a, b) =>
        (a.sub_group_name ?? '').localeCompare(b.sub_group_name ?? '')
      );

    this.filteredMaterialsListConsumption = [];

    this.searchConsumptionForm.patchValue({
      subCategory: '',
      item: ''
    });
  }


  onSubCategoryChangeConsumption(event: any) {

    const selectedCategoryId =
      this.searchConsumptionForm.get('category')?.value;

    const selectedSubCategoryId = event.target.value;

    this.filteredMaterialsListConsumption =
      this.materialsList.filter(item =>
        item.group_id === selectedCategoryId &&
        item.sub_group_id === selectedSubCategoryId
      );

    this.searchConsumptionForm.patchValue({ item: '' });
  }



  onMaterialChangeConsumption(selectedMaterial: any) {

    if (selectedMaterial) {

      const selectedCategoryId = selectedMaterial.group_id;
      const selectedSubCategoryId = selectedMaterial.sub_group_id;

      this.searchConsumptionForm.patchValue({
        category: selectedCategoryId,
        subCategory: selectedSubCategoryId
      });

      this.filteredSubcategoryListsConsumption =
        this.subcategoryLists.filter(sub =>
          sub.group_id === selectedCategoryId
        );

      this.filteredMaterialsListConsumption =
        this.materialsList.filter(item =>
          item.group_id === selectedCategoryId &&
          item.sub_group_id === selectedSubCategoryId
        );

    } else {

      this.searchConsumptionForm.patchValue({
        category: null,
        subCategory: null,
        item: null
      });

      this.filteredMaterialsListConsumption = [...this.materialsList];
      this.filteredSubcategoryListsConsumption = [...this.subcategoryLists];
    }
  }


  deleteRentGatePass(gate_pass_id: string, item_row_id: string) {

    Swal.fire({
      title: 'Are you sure?',
      text: 'This will delete the gate pass and restore stock inventory.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel'
    }).then((result) => {

      if (result.isConfirmed) {

        let formData = new FormData();

        formData.append('gate_pass_id', gate_pass_id);
        formData.append('item_row_id', item_row_id);

        this.stockService.deleteRentGatePass(formData)
          .pipe(takeUntil(this.destroy$))
          .subscribe((resp: any) => {
            console.log(resp);
            if (resp) {

              Swal.fire({
                icon: 'success',
                title: 'Deleted',
                text: 'Gate pass deleted successfully'
              });

              //  refresh table
              this.searchRentItemGatePass();

            } else {

              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: resp.message || 'Unable to delete gate pass'
              });

            }

          }, error => {

            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Something went wrong'
            });

          });

      }

    });

  }


  viewRentGatePass(gate_pass_id: any, item_row_id: any) {

    this.router.navigate(
      ['/stock-add-rent-item-gate-pass'],
      {
        queryParams: {
          gate_pass_id: gate_pass_id,
          item_row_id: item_row_id,
          action: 'view'
        }
      }
    );

  }

  editRentGatePass(gate_pass_id: any, item_row_id: any) {

    this.router.navigate(
      ['/stock-add-rent-item-gate-pass'],
      {
        queryParams: {
          gate_pass_id: gate_pass_id,
          item_row_id: item_row_id,
          action: 'edit'
        }
      }
    );

  }




}


