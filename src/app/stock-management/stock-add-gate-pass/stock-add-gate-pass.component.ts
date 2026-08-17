import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ProjectService } from 'src/app/services/project.service';
import { distinctUntilChanged, switchMap, map, takeUntil, filter } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CrmService } from 'src/app/services/crm.service';
import { StockService } from 'src/app/services/stock.service';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-stock-add-gate-pass',
  templateUrl: './stock-add-gate-pass.component.html',
  styleUrls: ['./stock-add-gate-pass.component.scss']
})
export class StockAddGatePassComponent implements OnInit, OnDestroy {

  headerTitle: any;
  purchaseOrderForm: any;
  isEditOrViewMode: any;
  gatePassForm!: FormGroup;
  private destroy$ = new Subject<void>();

  materials: any;
  gatePassId: any;
  mode: any;
  employeeLists: any;
  warehouseLists: any;
  products: any;
  showAddButton: any;
  grandCgst: any;
  grandSgst: any;
  grandIgst: any;
  grandTotal: any;
  showSubmitButton: any;
  selectedTransferType: string = '';
  disableConsumeFields: boolean = false;
  projectsList: any[];
  warehouseList: any[];
  vehicleList: any[];
  employee: any[];
  disableRemoveButtons = false;
  hideSaveButton = false;
  hideAddMaterialButton = false;


  constructor(private fb: FormBuilder, private ProjectService: ProjectService, private crmservice: CrmService, private stockService: StockService, private router: Router, private route: ActivatedRoute, private datePipe: DatePipe) { }

  ngOnInit(): void {
    this.gatePassForm = this.fb.group({
      transferType: ['', Validators.required],
      date: ['', Validators.required],
      projectName: [''],
      toWarehouse: [''],
      vehicleNameNo: [null],
      issuedTo: [null, Validators.required],
      issuedBy: [null, Validators.required],
      gatePass: ['', Validators.required],
      description: [''],
      materials: this.fb.array([])
    });

    this.getProjectsLists();
    this.getWarehouselists();
    this.getVehicleslists();
    this.employeetypenamelist();

    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {

      this.mode = params['mode'];
      const gatePass = params['gate_pass'];
      const date = params['date'];

      if (gatePass && date) {
        this.getGatePassDetailsById(gatePass, date);
      }

    });
  }

  getProjectsLists() {
    let formData = new FormData();
    this.ProjectService.getAllProjectsLists(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.projectsList = resp.data;
    });
  }

  getWarehouselists() {
    let formData = new FormData();
    formData.append('statue_enabled', '1');
    this.ProjectService.getWarehouselists(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.warehouseList = resp.data;
    });
  }

  getVehicleslists() {
    let formData = new FormData();
    formData.append('status_enabled', '1');
    this.ProjectService.getVehicleslists(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.vehicleList = (resp.data || []).map((vehicle: any) => ({
        ...vehicle,
        vehicleDisplay: [vehicle.vehiclename, vehicle.vehicleno].filter(Boolean).join(', ')
      }));
    });
  }

  employeetypenamelist() {
    let employeelist = new FormData();
    this.crmservice.getEmployee(employeelist).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.employee = resp.data;
    });
  }

  // Getter for materials array
  get materialsArray(): FormArray {
    return this.gatePassForm.get('materials') as FormArray;
  }

  // Full display name for a single-select field (list stores objects, form control stores only the id)
  getSelectedLabel(list: any[], value: any, valueKey: string, labelKey: string): string {
    if (!list || value === null || value === undefined) {
      return '';
    }
    const found = list.find(x => x[valueKey] === value);
    return found ? found[labelKey] : '';
  }

  // Full display names for the Materials multi-select (form control stores the selected item objects)
  getSelectedMaterialsLabel(materialIndex: number): string {
    const selected = this.materialsArray.at(materialIndex)?.get('materialsSelected')?.value || [];
    return Array.isArray(selected) ? selected.map((x: any) => x?.item).filter(Boolean).join(', ') : '';
  }

  // Create one material form block
  newMaterialForm(): FormGroup {
    return this.fb.group({
      fromWarehouse: [null, Validators.required],
      outTime: [''],

      category: [null, Validators.required],
      subCategory: [null, Validators.required],

      categoryList: [[]],
      subCategoryList: [[]],

      masterItems: [[]],
      availableItems: [[]],
      filteredAvailableItems: [[]], // availableItems minus materials already picked elsewhere for the same Warehouse/Category/Sub Category

      materialsSelected: [[], Validators.required], // multi-select required

      warehouseLoading: [false], // true while Category/Sub Category/Materials are being loaded for the selected warehouse
      materialsLoading: [false], // true while the items table is being built for the selected materials

      items: this.fb.array([])
    });
  }


  createItemRow(item: any): FormGroup {

    return this.fb.group({
      itemName: [item.item],

      baseBalance: [Number(item.current_balance)], // always basic
      displayBalance: [Number(item.current_balance)], // only UI

      unit: [''],
      unitList: [[]],
      conversionData: [[]],

      categoryName: [item.groupname],
      subCategoryName: [item.subgroupname],
      groupid: [item.groupid],
      subgroupid: [item.subgroupid],
      differenceBalance: [''],

      qty: ['', Validators.required],
      prevQty: [0],
      prevUsed: [0],
      prevScrap: [0],


      consume: [false], // NEW CHECKBOX

      used: [{ value: '', disabled: true }],
      scrap: [{ value: '', disabled: true }],
      rate: [{ value: '', disabled: true }],
      amount: [{ value: '', disabled: true }]
    });
  }


  getItemsArray(materialIndex: number): FormArray {
    return this.materialsArray.at(materialIndex).get('items') as FormArray;
  }

  // Add material block
  addMaterial() {
    this.materialsArray.insert(0, this.newMaterialForm());
  }


  // Remove material block
  removeMaterial(index: number) {
    this.materialsArray.removeAt(index);
    // removing a row can free up materials that other same-combo rows had lost access to
    this.refreshFilteredMaterialsAcrossRows();
  }
  // removeItemRow(materialIndex: number, rowIndex: number) {
  //   const itemsArray = this.getItemsArray(materialIndex);
  //   itemsArray.removeAt(rowIndex);
  // }

  removeItemRow(materialIndex: number, rowIndex: number) {
    const matGroup = this.materialsArray.at(materialIndex) as FormGroup;

    const itemsArray = matGroup.get('items') as FormArray;
    const selected = matGroup.get('materialsSelected')?.value || [];

    // item being removed
    const removedItem = itemsArray.at(rowIndex).get('itemName')?.value;

    // remove row
    itemsArray.removeAt(rowIndex);

    // remove same item from material dropdown selections
    const updatedSelected = selected.filter((x: any) => x.item !== removedItem);

    matGroup.get('materialsSelected')?.setValue(updatedSelected);
    this.refreshFilteredMaterialsAcrossRows();
  }

  onTransferTypeChange(event: any) {
    this.selectedTransferType = event.target.value;
    this.disableConsumeFields = (this.selectedTransferType === 'warehouse_type');

    const projectCtrl = this.gatePassForm.get('projectName');
    const warehouseCtrl = this.gatePassForm.get('toWarehouse');

    // Clear old validators first
    projectCtrl.clearValidators();
    warehouseCtrl.clearValidators();

    if (this.selectedTransferType === 'project_type') {
      projectCtrl.setValidators([Validators.required]);
    }
    else if (this.selectedTransferType === 'warehouse_type') {
      warehouseCtrl.setValidators([Validators.required]);
    }

    // Update validity
    projectCtrl.updateValueAndValidity();
    warehouseCtrl.updateValueAndValidity();
  }


  onWarehouseChange(selected: any, index: number) {

    const godownId = selected?.godown_id; // ✅ extract ID

    if (!godownId) return;

    if (!this.checkProjectWarehouseConflict('warehouse', index)) {
      return;
    }

    const materialForm = this.materialsArray.at(index) as FormGroup;
    materialForm.patchValue({ warehouseLoading: true }, { emitEvent: false });

    const formData = new FormData();
    formData.append('godown_id', godownId);

    this.ProjectService.getWarehouseFromInventory(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: resp => {
          const data = resp.data || [];

          const categories = data
            .reduce((acc: any[], it: any) => {
              if (!acc.find(x => x.groupid === it.groupid)) {
                acc.push({ groupid: it.groupid, groupname: it.groupname });
              }
              return acc;
            }, [])
            .sort((a, b) => a.groupname.localeCompare(b.groupname));

          materialForm.patchValue({
            masterItems: data,
            availableItems: [],
            materialsSelected: [],
            categoryList: categories,
            subCategoryList: [],
            category: '',
            subCategory: '',
            warehouseLoading: false
          }, { emitEvent: false });

          this.getItemsArray(index).clear();
          this.refreshFilteredMaterialsAcrossRows();
        },
        error: () => {
          materialForm.patchValue({ warehouseLoading: false }, { emitEvent: false });
        }
      });
  }


  checkProjectWarehouseConflict(
    changedField: 'project' | 'warehouse',
    index?: number
  ): boolean {

    const projectId = this.gatePassForm.get('projectName')?.value;
    const fromWarehouse = index !== undefined
      ? this.materialsArray.at(index).get('fromWarehouse')?.value
      : null;

    if (this.selectedTransferType === 'project_type'
      && projectId
      && fromWarehouse
      && projectId === fromWarehouse) {

      Swal.fire({
        icon: 'warning',
        title: 'Invalid Selection',
        text: 'To Project and From Warehouse cannot be the same.'
      });

      // reset only the field that was changed
      if (changedField === 'project') {
        this.gatePassForm.get('projectName')?.reset('');
      } else {
        this.materialsArray.at(index!).get('fromWarehouse')?.reset('');
      }

      return false;
    }

    return true;
  }

  onProjectChange() {
    // check against all material rows
    this.materialsArray.controls.forEach((_, i) => {
      this.checkProjectWarehouseConflict('project', i);
    });
  }



  onCategoryChange(selected: any, index: number) {

    const categoryId = typeof selected === 'string'
      ? selected
      : selected?.groupid;

    const materialForm = this.materialsArray.at(index) as FormGroup;

    if (!categoryId) {
      materialForm.patchValue({
        subCategoryList: [],
        subCategory: '',
        materialsSelected: [],
        availableItems: []
      }, { emitEvent: false });

      this.getItemsArray(index).clear();
      this.refreshFilteredMaterialsAcrossRows();
      return;
    }

    const allItems = materialForm.get('masterItems')?.value || [];

    const subCategories = allItems
      .filter((it: any) => it.groupid === categoryId)
      .reduce((acc: any[], it: any) => {
        if (!acc.find(x => x.subgroupid === it.subgroupid)) {
          acc.push({ subgroupid: it.subgroupid, subgroupname: it.subgroupname });
        }
        return acc;
      }, [])
      .sort((a, b) => a.subgroupname.localeCompare(b.subgroupname));

    materialForm.patchValue({
      subCategoryList: subCategories,
      subCategory: '',
      materialsSelected: [],
      availableItems: []
    }, { emitEvent: false });

    this.getItemsArray(index).clear();
    this.refreshFilteredMaterialsAcrossRows();
  }



  onSubCategoryChange(selected: any, index: number) {

    const subCategoryId = typeof selected === 'string'
      ? selected
      : selected?.subgroupid;

    const materialForm = this.materialsArray.at(index) as FormGroup;

    const categoryId = materialForm.get('category')?.value;

    if (!categoryId || !subCategoryId) {
      materialForm.patchValue({
        availableItems: [],
        materialsSelected: []
      }, { emitEvent: false });

      this.getItemsArray(index).clear();
      this.refreshFilteredMaterialsAcrossRows();
      return;
    }

    const allItems = materialForm.get('masterItems')?.value || [];

    const filtered = allItems.filter((it: any) =>
      it.groupid?.trim().toLowerCase() === categoryId?.trim().toLowerCase() &&
      it.subgroupid?.trim().toLowerCase() === subCategoryId?.trim().toLowerCase()
    );

    materialForm.patchValue({
      availableItems: filtered.sort((a, b) => a.item.localeCompare(b.item)),
      materialsSelected: []
    }, { emitEvent: false });

    this.getItemsArray(index).clear();
    this.refreshFilteredMaterialsAcrossRows();
  }

  // to apply the filetr that once a warehouse is filled, then in next entry it should not be available for the next warehouse list
  isWarehouseAvailable(currentIndex: number, warehouseId: string): boolean {
    return !this.materialsArray.controls.some((mg, idx) =>
      idx !== currentIndex &&
      mg.get('fromWarehouse')?.value === warehouseId
    );
  }

  // Materials already selected in another row for the SAME Warehouse -> Category ->
  // Sub Category combination shouldn't be pickable again here. Different combinations
  // (a different warehouse, category, or sub category) still get the full list.
  //
  // This recomputes into every row's `filteredAvailableItems` control rather than
  // being called directly from the template: ng-select treats a freshly-created
  // [items] array on every change-detection cycle as "the list changed" and resets
  // its internal selection state, which silently broke clicking an option to select
  // it. Patching a stable control (only reassigned when this runs) avoids that.
  private refreshFilteredMaterialsAcrossRows(): void {
    this.materialsArray.controls.forEach((materialForm, index) => {
      const allItems = materialForm.get('availableItems')?.value || [];

      const warehouseId = materialForm.get('fromWarehouse')?.value;
      const categoryId = materialForm.get('category')?.value;
      const subCategoryId = materialForm.get('subCategory')?.value;

      const usedElsewhere = new Set<string>();

      this.materialsArray.controls.forEach((mg, idx) => {
        if (idx === index) {
          return;
        }

        const sameCombo =
          mg.get('fromWarehouse')?.value === warehouseId &&
          mg.get('category')?.value === categoryId &&
          mg.get('subCategory')?.value === subCategoryId;

        if (!sameCombo) {
          return;
        }

        const selected = mg.get('materialsSelected')?.value || [];
        selected.forEach((it: any) => {
          if (it?.item_id) {
            usedElsewhere.add(it.item_id);
          }
        });
      });

      const filtered = allItems.filter((it: any) => !usedElsewhere.has(it.item_id));
      materialForm.patchValue({ filteredAvailableItems: filtered }, { emitEvent: false });
    });
  }


  // changed: added callback parameter
  loadUnitsForMaterial(
    materialId: string,
    materialIndex: number,
    rowIndex: number,
    preselectedUnit?: string,
    callback?: Function,   // changed
    onSettled?: Function   // called once the request succeeds or fails, for loader tracking
  ) {

    let formData = new FormData();
    formData.append('master_item_id', materialId);

    this.ProjectService.getUnitsFromConversionTable(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: resp => {

          const unitData = resp.data || [];
          const rowForm = this.getItemsArray(materialIndex).at(rowIndex) as FormGroup;

          let unitSet = new Set<string>();
          let basicUnit = '';

          unitData.forEach(u => {
            if (u.basic_unit_name && !basicUnit) {
              basicUnit = u.basic_unit_name;
            }
            if (u.alt_unit_name) {
              unitSet.add(u.alt_unit_name);
            }
          });

          unitSet.delete(basicUnit);

          const finalUnitList = basicUnit
            ? [basicUnit, ...Array.from(unitSet)]
            : Array.from(unitSet);

          rowForm.patchValue({
            unitList: finalUnitList,
            conversionData: unitData,
            unit: preselectedUnit || finalUnitList[0]
          }, { emitEvent: false });

          // changed: execute conversion AFTER units loaded
          if (callback) {
            callback(rowForm, unitData);
          }

          if (onSettled) {
            onSettled();
          }
        },
        error: () => {
          if (onSettled) {
            onSettled();
          }
        }
      });
  }


  onMaterialsSelectChangeNg(selectedItems: any[], materialIndex: number) {

    const materialForm = this.materialsArray.at(materialIndex) as FormGroup;
    materialForm.get('materialsSelected')?.setValue(selectedItems);
    // a selection here can affect what's still pickable in other same-combo rows
    this.refreshFilteredMaterialsAcrossRows();
    const itemsArray = this.getItemsArray(materialIndex);
    itemsArray.clear();

    if (!selectedItems || !selectedItems.length) {
      materialForm.patchValue({ materialsLoading: false }, { emitEvent: false });
      return;
    }

    materialForm.patchValue({ materialsLoading: true }, { emitEvent: false });

    let pending = selectedItems.length;
    const onRowSettled = () => {
      pending--;
      if (pending <= 0) {
        materialForm.patchValue({ materialsLoading: false }, { emitEvent: false });
      }
    };

    selectedItems.forEach((itemObj, rowIndex) => {
      itemsArray.push(this.createItemRow(itemObj));
      this.loadUnitsForMaterial(itemObj.item_id, materialIndex, rowIndex, undefined, undefined, onRowSettled);
    });
  }

  onUnitChange(materialIndex: number, rowIndex: number) {

    const rowForm = this.getItemsArray(materialIndex).at(rowIndex) as FormGroup;

    const selectedUnit = rowForm.get('unit')?.value;
    const conversionData = rowForm.get('conversionData')?.value || [];
    const baseBalance = Number(rowForm.get('baseBalance')?.value);

    let displayBalance = baseBalance;

    conversionData.forEach(u => {

      if (selectedUnit === u.basic_unit_name) {
        displayBalance = baseBalance;
      }

      if (selectedUnit === u.alt_unit_name) {

        const basicValue = Number(u.basic_value);
        const altValue = Number(u.alt_value);

        if (basicValue && altValue) {
          displayBalance = (baseBalance * altValue) / basicValue;
        }
      }

    });

    // ONLY change UI value
    rowForm.patchValue({
      displayBalance: Number(displayBalance.toFixed(2))
    }, { emitEvent: false });

  }

  onQtyChange(materialIndex: number, rowIndex: number) {

    const row = this.getItemsArray(materialIndex).at(rowIndex) as FormGroup;

    const selectedUnit = row.get('unit')?.value;
    const conversionData = row.get('conversionData')?.value || [];

    let qtyDisplay = Number(row.get('qty')?.value || 0);
    let displayBalance = Number(row.get('displayBalance')?.value || 0);
    let baseBalance = Number(row.get('baseBalance')?.value || 0);
    let prevQtyDisplay = Number(row.get('prevQty')?.value || 0);

    if (qtyDisplay < 0) {
      qtyDisplay = 0;
      row.patchValue({ qty: 0 }, { emitEvent: false });
    }

    //  Convert entered qty to BASIC
    let qtyInBasic = qtyDisplay;

    conversionData.forEach(u => {

      if (selectedUnit === u.alt_unit_name) {
        const basicValue = Number(u.basic_value);
        const altValue = Number(u.alt_value);

        if (basicValue && altValue) {
          qtyInBasic = (qtyDisplay * basicValue) / altValue;
        }
      }

    });

    // 🚀 Convert previous qty also to BASIC
    let prevQtyInBasic = prevQtyDisplay;

    conversionData.forEach(u => {

      if (selectedUnit === u.alt_unit_name) {
        const basicValue = Number(u.basic_value);
        const altValue = Number(u.alt_value);

        if (basicValue && altValue) {
          prevQtyInBasic = (prevQtyDisplay * basicValue) / altValue;
        }
      }

    });

    //  Validate against baseBalance
    if (qtyInBasic > baseBalance + prevQtyInBasic) {

      qtyInBasic = baseBalance + prevQtyInBasic;

      // Convert back to display for UI
      let correctedDisplayQty = qtyInBasic;

      conversionData.forEach(u => {

        if (selectedUnit === u.alt_unit_name) {
          const basicValue = Number(u.basic_value);
          const altValue = Number(u.alt_value);

          if (basicValue && altValue) {
            correctedDisplayQty = (qtyInBasic * altValue) / basicValue;
          }
        }

      });

      row.patchValue({ qty: correctedDisplayQty }, { emitEvent: false });
      qtyDisplay = correctedDisplayQty;
    }

    //  Calculate new base balance
    const diffBasic = qtyInBasic - prevQtyInBasic;
    const newBaseBalance = baseBalance - diffBasic;

    //  Convert new base balance to display
    let newDisplayBalance = newBaseBalance;

    conversionData.forEach(u => {

      if (selectedUnit === u.alt_unit_name) {
        const basicValue = Number(u.basic_value);
        const altValue = Number(u.alt_value);

        if (basicValue && altValue) {
          newDisplayBalance = (newBaseBalance * altValue) / basicValue;
        }
      }

    });

    row.patchValue({
      baseBalance: newBaseBalance,             //  internal
      displayBalance: Number(newDisplayBalance.toFixed(2)), // UI
      prevQty: qtyDisplay
    }, { emitEvent: false });

    // ----- Difference logic -----
    const used = Number(row.get('used')?.value || 0);
    const scrap = Number(row.get('scrap')?.value || 0);

    if (used + scrap > qtyDisplay) {
      const newScrap = Math.max(qtyDisplay - used, 0);
      row.patchValue({ scrap: newScrap }, { emitEvent: false });
    }

    const diff = qtyDisplay - (used + scrap);
    row.patchValue({ differenceBalance: diff }, { emitEvent: false });

  }


  onUsedChange(materialIndex: number, rowIndex: number) {

    const row = this.getItemsArray(materialIndex).at(rowIndex) as FormGroup;

    const selectedUnit = row.get('unit')?.value;
    const conversionData = row.get('conversionData')?.value || [];

    const qtyDisplay = Number(row.get('prevQty')?.value || 0);
    let usedDisplay = Number(row.get('used')?.value || 0);
    let scrapDisplay = Number(row.get('scrap')?.value || 0);

    if (usedDisplay < 0) usedDisplay = 0;

    // ---- Convert to BASIC ----
    let qtyBasic = qtyDisplay;
    let usedBasic = usedDisplay;
    let scrapBasic = scrapDisplay;

    conversionData.forEach((u: any) => {

      if (selectedUnit === u.alt_unit_name) {
        const basicValue = Number(u.basic_value);
        const altValue = Number(u.alt_value);

        if (basicValue && altValue) {
          qtyBasic = (qtyDisplay * basicValue) / altValue;
          usedBasic = (usedDisplay * basicValue) / altValue;
          scrapBasic = (scrapDisplay * basicValue) / altValue;
        }
      }

    });

    // ---- Limit used+scrap <= qty (in BASIC) ----
    if (usedBasic + scrapBasic > qtyBasic) {

      usedBasic = qtyBasic - scrapBasic;
      if (usedBasic < 0) usedBasic = 0;

      // convert back to display
      let correctedUsedDisplay = usedBasic;

      conversionData.forEach((u: any) => {
        if (selectedUnit === u.alt_unit_name) {
          const basicValue = Number(u.basic_value);
          const altValue = Number(u.alt_value);
          correctedUsedDisplay = (usedBasic * altValue) / basicValue;
        }
      });

      usedDisplay = correctedUsedDisplay;
    }

    row.patchValue({ used: Number(usedDisplay.toFixed(2)) }, { emitEvent: false });

    // ---- Difference (Display Layer Only) ----
    const diffDisplay = qtyDisplay - (usedDisplay + scrapDisplay);
    row.patchValue({ differenceBalance: Number(diffDisplay.toFixed(2)) }, { emitEvent: false });

    // ---- Amount Calculation (Display Unit Based) ----
    const rate = Number(row.get('rate')?.value || 0);
    const amount = (usedDisplay + scrapDisplay) * rate;
    row.patchValue({ amount: Number(amount.toFixed(2)) }, { emitEvent: false });
  }

  onScrapChange(materialIndex: number, rowIndex: number) {

    const row = this.getItemsArray(materialIndex).at(rowIndex) as FormGroup;

    const selectedUnit = row.get('unit')?.value;
    const conversionData = row.get('conversionData')?.value || [];

    const qtyDisplay = Number(row.get('prevQty')?.value || 0);
    let usedDisplay = Number(row.get('used')?.value || 0);
    let scrapDisplay = Number(row.get('scrap')?.value || 0);

    if (scrapDisplay < 0) scrapDisplay = 0;

    // ---- Convert to BASIC ----
    let qtyBasic = qtyDisplay;
    let usedBasic = usedDisplay;
    let scrapBasic = scrapDisplay;

    conversionData.forEach((u: any) => {

      if (selectedUnit === u.alt_unit_name) {
        const basicValue = Number(u.basic_value);
        const altValue = Number(u.alt_value);

        if (basicValue && altValue) {
          qtyBasic = (qtyDisplay * basicValue) / altValue;
          usedBasic = (usedDisplay * basicValue) / altValue;
          scrapBasic = (scrapDisplay * basicValue) / altValue;
        }
      }

    });

    // ---- Limit used+scrap <= qty (in BASIC) ----
    if (usedBasic + scrapBasic > qtyBasic) {

      scrapBasic = qtyBasic - usedBasic;
      if (scrapBasic < 0) scrapBasic = 0;

      // convert back to display
      let correctedScrapDisplay = scrapBasic;

      conversionData.forEach((u: any) => {
        if (selectedUnit === u.alt_unit_name) {
          const basicValue = Number(u.basic_value);
          const altValue = Number(u.alt_value);
          correctedScrapDisplay = (scrapBasic * altValue) / basicValue;
        }
      });

      scrapDisplay = correctedScrapDisplay;
    }

    row.patchValue({ scrap: Number(scrapDisplay.toFixed(2)) }, { emitEvent: false });

    const diffDisplay = qtyDisplay - (usedDisplay + scrapDisplay);
    row.patchValue({ differenceBalance: Number(diffDisplay.toFixed(2)) }, { emitEvent: false });

    const rate = Number(row.get('rate')?.value || 0);
    const amount = (usedDisplay + scrapDisplay) * rate;
    row.patchValue({ amount: Number(amount.toFixed(2)) }, { emitEvent: false });
  }


  updateAmount(row: FormGroup) {
    const used = Number(row.get('used')?.value || 0);
    const scrap = Number(row.get('scrap')?.value || 0);
    const rate = Number(row.get('rate')?.value || 0);

    row.patchValue({
      amount: (used + scrap) * rate
    }, { emitEvent: false });
  }


  onRateChange(materialIndex: number, rowIndex: number) {
    const row = this.getItemsArray(materialIndex).at(rowIndex) as FormGroup;

    const used = Number(row.get('used')?.value || 0);
    const scrap = Number(row.get('scrap')?.value || 0);
    const rate = Number(row.get('rate')?.value || 0);

    row.patchValue({
      amount: (used + scrap) * rate
    }, { emitEvent: false });
  }


  onConsumeToggle(materialIndex: number, rowIndex: number) {
    const row = this.getItemsArray(materialIndex).at(rowIndex) as FormGroup;
    const consume = row.get('consume')?.value;

    if (consume) {
      row.get('used')?.enable({ emitEvent: false });
      row.get('scrap')?.enable({ emitEvent: false });
      row.get('rate')?.enable({ emitEvent: false });
      row.get('amount')?.enable({ emitEvent: false });
    } else {
      row.get('used')?.disable({ emitEvent: false });
      row.get('scrap')?.disable({ emitEvent: false });
      row.get('rate')?.disable({ emitEvent: false });
      row.get('amount')?.disable({ emitEvent: false });

      // Optional: clear old values
      row.patchValue({
        used: '',
        scrap: '',
        rate: '',
        amount: ''
      }, { emitEvent: false });
    }
  }


  toggleInputsTS(index: number) {
    const inputs = document.querySelectorAll(".extra-" + index) as NodeListOf<HTMLInputElement>;
    inputs.forEach(input => {
      input.disabled = !input.disabled;
    });
  }

  calcAmountTS(index: number) {
    const rate: any = (document.getElementById("rate-" + index) as HTMLInputElement).value;
    const amountBox = document.getElementById("amount-" + index) as HTMLInputElement;

    amountBox.value = rate ? (rate * 1).toFixed(2) : "";
  }

  deleteRowTS(index: number) {
    const row = document.getElementById("row-" + index) as HTMLElement;
    if (row) row.remove();
  }


  validateGatePassForm(): { valid: boolean, message?: string } {

    // --- Existing form validations ---
    if (this.gatePassForm.get('transferType').invalid) {
      return { valid: false, message: 'Please select Transfer Type.' };
    }

    if (this.gatePassForm.get('date').invalid) {
      return { valid: false, message: 'Please select Date.' };
    }

    if (
      this.gatePassForm.get('transferType').value === 'project_type' &&
      this.gatePassForm.get('projectName').invalid
    ) {
      return { valid: false, message: 'Please select a Project.' };
    }

    if (
      this.gatePassForm.get('transferType').value === 'warehouse_type' &&
      this.gatePassForm.get('toWarehouse').invalid
    ) {
      return { valid: false, message: 'Please select a Warehouse.' };
    }

    if (this.gatePassForm.get('issuedTo').invalid) {
      return { valid: false, message: 'Please select Issued To.' };
    }

    if (this.gatePassForm.get('issuedBy').invalid) {
      return { valid: false, message: 'Please select Issued By.' };
    }

    if (this.gatePassForm.get('gatePass').invalid) {
      return { valid: false, message: 'Please enter Gate Pass.' };
    }

    // --- MATERIAL ARRAY VALIDATION ---
    const materialsArray = this.materialsArray;

    if (!materialsArray || materialsArray.length === 0) {
      return { valid: false, message: 'Please add at least one Material.' };
    }

    //  INDEX-WISE VALIDATIONS (MATERIAL BLOCK)
    for (let i = 0; i < materialsArray.length; i++) {

      const mat = materialsArray.at(i) as FormGroup;

      // Get warehouse name for message
      const warehouseId = mat.get('fromWarehouse').value;
      const warehouseName =
        this.warehouseList.find(w => w.godown_id == warehouseId)?.godown_name || 'Selected Warehouse';

      const items = mat.get('items') as FormArray;

      if (!items || items.length === 0) {
        return {
          valid: false,
          message: `Please add at least one item under Warehouse "${warehouseName}".`
        };
      }

      for (let j = 0; j < items.length; j++) {
        const row = items.at(j) as FormGroup;

        // ITEM NAME (for more meaningful messages)
        const itemName = row.get('itemName').value;

        // Quantity Required
        if (!row.get('qty').value || row.get('qty').invalid) {
          return {
            valid: false,
            message: `Please enter Quantity for item "${itemName}" under Warehouse "${warehouseName}".`
          };
        }
      }
    }



    return { valid: true };
  }





  saveMaterialForm() {
    this.gatePassForm.markAllAsTouched();
    const validation = this.validateGatePassForm();

    if (!validation.valid) {
      Swal.fire('Validation Error', validation.message, 'warning');
      return;
    }

    const header = {
      transferType: this.gatePassForm.get('transferType')?.value || '',
      date: this.gatePassForm.get('date')?.value || '',
      toProject: this.gatePassForm.get('projectName')?.value || '',
      toWarehouse: this.gatePassForm.get('toWarehouse')?.value || '',
      vehicleNameNo: this.gatePassForm.get('vehicleNameNo')?.value || '',
      issuedTo: this.gatePassForm.get('issuedTo')?.value || '',
      issuedBy: this.gatePassForm.get('issuedBy')?.value || '',
      gatePass: this.gatePassForm.get('gatePass')?.value || '',
      description: this.gatePassForm.get('description')?.value || ''
    };

    let apiCalls = [];

    this.materialsArray.controls.forEach((materialGroup: any) => {

      const itemsArray = materialGroup.get('items') as FormArray;

      let selected = materialGroup.get('materialsSelected')?.value;
      selected = Array.isArray(selected) ? selected : [selected];
      const selectedMatIds = selected.map((x: any) => x?.item_id || '0');

      let itemNames = [];
      let balances = [];
      let units = [];
      let categories = [];
      let subCategories = [];
      let quantities = [];
      let consumes = [];
      let usedList = [];
      let scrapList = [];
      let rates = [];
      let amounts = [];
      let diffBalanceList = [];
      let groupIds = [];
      let subGroupIds = [];

      itemsArray.controls.forEach((row: any) => {

        const selectedUnit = row.get('unit')?.value || '';
        const conversionData = row.get('conversionData')?.value || [];

        const baseBalance = Number(row.get('baseBalance')?.value || 0); // changed: always use baseBalance
        const rate = Number(row.get('rate')?.value || 0);

        let qtyDisplay = Number(row.get('qty')?.value || 0);
        let usedDisplay = Number(row.get('used')?.value || 0);
        let scrapDisplay = Number(row.get('scrap')?.value || 0);

        let qtyInBasic = qtyDisplay;      // changed: convert qty to basic
        let usedInBasic = usedDisplay;    // changed: convert used to basic
        let scrapInBasic = scrapDisplay;  // changed: convert scrap to basic

        conversionData.forEach((u: any) => {

          if (selectedUnit === u.alt_unit_name) {
            const basicValue = Number(u.basic_value);
            const altValue = Number(u.alt_value);

            if (basicValue && altValue) {
              qtyInBasic = (qtyDisplay * basicValue) / altValue;        // changed
              usedInBasic = (usedDisplay * basicValue) / altValue;      // changed
              scrapInBasic = (scrapDisplay * basicValue) / altValue;    // changed
            }
          }

        });

        const differenceInBasic = qtyInBasic - (usedInBasic + scrapInBasic); // changed: diff in basic

        const amountInBasic = (usedInBasic + scrapInBasic) * rate; // changed: amount calculated using basic values

        itemNames.push(row.get('itemName')?.value || '0');

        balances.push(baseBalance.toString()); // changed: send only base balance

        units.push(selectedUnit || '0');
        categories.push(row.get('categoryName')?.value || '0');
        subCategories.push(row.get('subCategoryName')?.value || '0');

        quantities.push(qtyInBasic.toString());     // changed: send qty in basic
        consumes.push(row.get('consume')?.value ? '1' : '0');
        usedList.push(usedInBasic.toString());      // changed: send used in basic
        scrapList.push(scrapInBasic.toString());    // changed: send scrap in basic
        rates.push(rate.toString());
        amounts.push(amountInBasic.toString());     // changed: send amount in basic
        diffBalanceList.push(differenceInBasic.toString()); // changed: diff in basic
        groupIds.push(row.get('groupid')?.value || '0');
        subGroupIds.push(row.get('subgroupid')?.value || '0');
      });

      const maxLen = Math.max(
        selectedMatIds.length,
        itemNames.length,
        balances.length,
        quantities.length
      );

      while (selectedMatIds.length < maxLen) selectedMatIds.push('0');
      while (itemNames.length < maxLen) itemNames.push('0');
      while (balances.length < maxLen) balances.push('0');
      while (quantities.length < maxLen) quantities.push('0');
      while (units.length < maxLen) units.push('0');
      while (categories.length < maxLen) categories.push('0');
      while (subCategories.length < maxLen) subCategories.push('0');
      while (consumes.length < maxLen) consumes.push('0');
      while (usedList.length < maxLen) usedList.push('0');
      while (scrapList.length < maxLen) scrapList.push('0');
      while (rates.length < maxLen) rates.push('0');
      while (amounts.length < maxLen) amounts.push('0');
      while (diffBalanceList.length < maxLen) diffBalanceList.push('0');
      while (groupIds.length < maxLen) groupIds.push('0');
      while (subGroupIds.length < maxLen) subGroupIds.push('0');

      const gatePassFormData = new FormData();
      gatePassFormData.append('transferType', header.transferType);
      gatePassFormData.append('date', header.date);
      gatePassFormData.append('toProject', header.toProject);
      gatePassFormData.append('toWarehouse', header.toWarehouse);
      gatePassFormData.append('vehicleNameNo', header.vehicleNameNo);
      gatePassFormData.append('issuedTo', header.issuedTo);
      gatePassFormData.append('issuedBy', header.issuedBy);
      gatePassFormData.append('gatePass', header.gatePass);
      gatePassFormData.append('description', header.description);
      gatePassFormData.append('fromWarehouse', materialGroup.get('fromWarehouse')?.value || '');
      gatePassFormData.append('outTime', materialGroup.get('outTime')?.value || '');
      gatePassFormData.append('materialsId', selectedMatIds.join(','));
      gatePassFormData.append('issuedMaterials', itemNames.join(','));
      gatePassFormData.append('currentBalance', balances.join(','));
      gatePassFormData.append('unit', units.join(','));
      gatePassFormData.append('category', groupIds.join(','));
      gatePassFormData.append('subCategory', subGroupIds.join(','));
      gatePassFormData.append('quantity', quantities.join(','));
      gatePassFormData.append('consumed', consumes.join(','));
      gatePassFormData.append('usedQuantity', usedList.join(','));
      gatePassFormData.append('scrap', scrapList.join(','));
      gatePassFormData.append('rate', rates.join(','));
      gatePassFormData.append('amount', amounts.join(','));
      gatePassFormData.append('differenceBalance', diffBalanceList.join(','));

      apiCalls.push(this.stockService.saveGatePassDetails(gatePassFormData));

      const fromWarehouse = materialGroup.get('fromWarehouse')?.value || '';
      const toProject = header.toProject || '';

      if (header.transferType === 'project_type' && fromWarehouse !== toProject) {

        const projectFormData = new FormData();
        projectFormData.append('project_id', header.toProject);
        projectFormData.append('date', header.date);
        projectFormData.append('vehicle_id', header.vehicleNameNo);
        projectFormData.append('issued_to_id', header.issuedTo);
        projectFormData.append('issued_by_id', header.issuedBy);
        projectFormData.append('gatePass', header.gatePass);
        projectFormData.append('description', header.description);
        projectFormData.append('fromWarehouse', materialGroup.get('fromWarehouse')?.value || '');
        projectFormData.append('outTime', materialGroup.get('outTime')?.value || '');
        projectFormData.append('materialsId', selectedMatIds.join(','));
        projectFormData.append('issuedMaterials', itemNames.join(','));
        projectFormData.append('currentBalance', balances.join(','));
        projectFormData.append('quantity', quantities.join(','));
        projectFormData.append('unit', units.join(','));

        apiCalls.push(this.stockService.saveWarehouseToProject(projectFormData));

      } else if (header.transferType === 'warehouse_type') {

        const warehouseFormData = new FormData();
        warehouseFormData.append('groupid', groupIds.join(','));
        warehouseFormData.append('subgroupid', subGroupIds.join(','));
        warehouseFormData.append('item_id', selectedMatIds.join(','));
        warehouseFormData.append('item', itemNames.join(','));
        warehouseFormData.append('date', header.date);
        warehouseFormData.append('unit', units.join(','));
        warehouseFormData.append('currentBalance', balances.join(','));
        warehouseFormData.append('quantity', quantities.join(','));
        warehouseFormData.append('fromWarehouse', materialGroup.get('fromWarehouse')?.value || '');
        warehouseFormData.append('towarehouse', header.toWarehouse);

        apiCalls.push(this.stockService.saveWarehouseToWarehouse(warehouseFormData));
      }
    });

    forkJoin(apiCalls).pipe(takeUntil(this.destroy$)).subscribe(results => {

      const allGood = results.every((res: any) => res.code === 200);

      if (allGood) {

        Swal.fire({
          icon: 'success',
          title: 'Gate Pass Transfer Successful',
          text: 'Your transfer has been completed successfully.'
        }).then(() => {

          this.gatePassForm.reset();
          this.materialsArray.clear();
          this.warehouseList = [];
          this.employee = [];
          this.projectsList = [];

          this.router.navigate(['/stock-gate-pass']);
        });

      }
    });
  }

  goBackToGatePass() {
    this.gatePassForm.reset();
    this.materialsArray.clear();
    this.warehouseList = [];
    this.employee = [];
    this.projectsList = [];

    this.router.navigate(['/stock-gate-pass']);
  }

  getGatePassDetailsById(gate_pass, date) {

    const formData = new FormData();
    formData.append('gate_pass', gate_pass);
    formData.append('date', date);

    this.stockService.fetchGatePassById(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe(resp => {

        if (!resp.data || !resp.data.length) return;

        const rows = resp.data;

        // 🔹 Patch header details from first row
        const d = rows[0];
        const formattedDate = this.datePipe.transform(d.date, "yyyy-MM-dd'T'HH:mm");

        this.selectedTransferType = d.transfer_type;

        this.gatePassForm.patchValue({
          transferType: d.transfer_type,
          date: formattedDate,
          description: d.description,
          projectName: d.to_project,
          toWarehouse: d.to_warehouse,
          vehicleNameNo: d.vehicle_no,
          issuedTo: d.issued_to,
          issuedBy: d.issued_by,
          gatePass: d.gate_pass
        });

        // 🔹 Clear previous materials
        this.materialsArray.clear();

        // 🔹 Loop through all rows (multiple items now)
        rows.forEach(row => {

          const matGroup = this.newMaterialForm();
          this.materialsArray.push(matGroup);

          matGroup.patchValue({
            fromWarehouse: row.from_warehouse,
            outTime: row.out_time,
            groupId: row.groupid,
            subGroupId: row.sub_groupid,
            materialId: row.material_id,
            quantity: row.quantity,
            unit: row.unit,
            rate: row.rate,
            amount: row.amount,
            balance: row.balance,
            consumed: row.consumed,
            usedQuantity: row.used_quantity,
            scrap: row.scrap,
            currentBalance: row.current_balance
          });

          // trigger dependent dropdown logic
          this.onWarehouseChangeManual(row, matGroup);

        });

      });

    // 🔹 View mode handling
    if (this.mode === 'view_gate_pass') {
      this.gatePassForm.disable({ emitEvent: false });
      this.disableRemoveButtons = true;
      this.hideSaveButton = true;
      this.hideAddMaterialButton = true;
    }

  }

  onWarehouseChangeManual(apiData, matGroup) {

    const fd = new FormData();
    fd.append('godown_id', apiData.from_warehouse);

    this.ProjectService.getWarehouseFromInventorywithCurrentbal(fd)
      .pipe(takeUntil(this.destroy$))
      .subscribe(resp => {
        const data = resp.data;

        const categories = data.reduce((acc, it) => {
          if (!acc.find(x => x.groupid === it.groupid)) {
            acc.push({ groupid: it.groupid, groupname: it.groupname });
          }
          return acc;
        }, []);

        matGroup.patchValue({
          masterItems: data,
          categoryList: categories
        }, { emitEvent: false });

        //  Now patch category
        const categoryId = apiData.groupid.split(',')[0];

        if (categoryId) {
          matGroup.patchValue({ category: categoryId }, { emitEvent: false });

          this.onCategoryChangeManual(apiData, matGroup);
        }
      });
  }


  onCategoryChangeManual(apiData, matGroup) {

    const catId = matGroup.get('category')?.value;
    const masterItems = matGroup.get('masterItems')?.value;

    const subcats = masterItems
      .filter(it => it.groupid === catId)
      .reduce((acc, it) => {
        if (!acc.find(x => x.subgroupid === it.subgroupid)) {
          acc.push({ subgroupid: it.subgroupid, subgroupname: it.subgroupname });
        }
        return acc;
      }, []);

    matGroup.patchValue({ subCategoryList: subcats });

    // patch subcategory

    const subId = apiData.sub_groupid.split(',')[0];

    if (subId) {
      matGroup.patchValue({ subCategory: subId }, { emitEvent: false });
      this.onSubCategoryChangeManual(apiData, matGroup);
    }
  }


  onSubCategoryChangeManual(apiData, matGroup) {

    const subId = matGroup.get('subCategory')?.value;
    const masterItems = matGroup.get('masterItems').value;

    const items = masterItems.filter(x => x.subgroupid === subId);
    matGroup.patchValue({ availableItems: items });

    const selectedItems = apiData.issued_material.split(',');
    const selectedList = items.filter(x => selectedItems.includes(x.item));

    matGroup.patchValue({ materialsSelected: selectedList });
    this.refreshFilteredMaterialsAcrossRows();

    // finally build table rows
    this.buildRows(apiData, matGroup);
  }


  buildRows(apiData, matGroup) {
    const itemsArray = matGroup.get('items') as FormArray;
    itemsArray.clear();

    const masterItems = matGroup.get('masterItems').value;

    const itemNames = apiData.issued_material.split(',');
    const qtyList = apiData.quantity.split(',');
    const usedList = apiData.used_quantity.split(',');
    const scrapList = apiData.scrap.split(',');
    const rateList = apiData.rate.split(',');
    const amountList = apiData.amount.split(',');
    const balanceList = apiData.current_balance.split(',');
    const unitsList = apiData.unit.split(',');
    const catIdList = apiData.groupid.split(',');
    const subIdList = apiData.sub_groupid.split(',');
    const consumeList = apiData.consumed.split(',');

    itemNames.forEach((name, idx) => {

      const apiItem = masterItems.find(x => x.item === name);

      const categoryName = apiItem?.groupname || '';
      const subCategoryName = apiItem?.subgroupname || '';

      const baseBalance = Number(balanceList[idx]);   // changed: treat as BASIC
      const qtyBasic = Number(qtyList[idx]);          // changed: BASIC
      const usedBasic = Number(usedList[idx]);        // changed: BASIC
      const scrapBasic = Number(scrapList[idx]);      // changed: BASIC
      const selectedUnit = unitsList[idx];

      const rowGroup = this.createItemRow({
        item: name,
        current_balance: baseBalance,
        groupname: categoryName,
        subgroupname: subCategoryName,
        groupid: catIdList[idx],
        subgroupid: subIdList[idx]
      });

      itemsArray.push(rowGroup);

      rowGroup.patchValue({
        baseBalance: baseBalance,             // changed
        displayBalance: baseBalance,          // changed
        rate: rateList[idx],
        consume: consumeList[idx] === '1'
      }, { emitEvent: false });

      // changed: load units + convert AFTER API resolves
      this.loadUnitsForMaterial(
        apiItem?.item_id,
        this.materialsArray.controls.indexOf(matGroup),
        idx,
        selectedUnit,
        (rowForm: FormGroup, conversionData: any[]) => {

          let qtyDisplay = qtyBasic;
          let usedDisplay = usedBasic;
          let scrapDisplay = scrapBasic;
          let displayBalance = baseBalance;

          conversionData.forEach((u: any) => {

            if (selectedUnit === u.alt_unit_name) {
              const basicValue = Number(u.basic_value);
              const altValue = Number(u.alt_value);

              if (basicValue && altValue) {
                qtyDisplay = (qtyBasic * altValue) / basicValue;
                usedDisplay = (usedBasic * altValue) / basicValue;
                scrapDisplay = (scrapBasic * altValue) / basicValue;
                displayBalance = (baseBalance * altValue) / basicValue;
              }
            }

          });

          rowForm.patchValue({
            unit: selectedUnit,
            qty: qtyDisplay,
            prevQty: qtyDisplay,
            used: usedDisplay,
            scrap: scrapDisplay,
            displayBalance: displayBalance,
            differenceBalance: qtyDisplay - (usedDisplay + scrapDisplay),
            // changed: calculate amount in display unit
            amount: Number(((usedDisplay + scrapDisplay) * Number(rateList[idx])).toFixed(2))
          }, { emitEvent: false });

        }
      );

    });

    if (this.mode === 'view_gate_pass') {

      matGroup.get('fromWarehouse')?.disable({ emitEvent: false });
      matGroup.get('category')?.disable({ emitEvent: false });
      matGroup.get('subCategory')?.disable({ emitEvent: false });
      matGroup.get('materialsSelected')?.disable({ emitEvent: false });
      matGroup.get('outTime')?.disable({ emitEvent: false });

      for (let i = 0; i < itemsArray.length; i++) {
        const row = itemsArray.at(i) as FormGroup;
        row.disable({ emitEvent: false });
      }
    }
  }

  allowOnlyNumbers(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;

    // Allow control keys
    if (
      charCode === 8 ||  // backspace
      charCode === 9 ||  // tab
      charCode === 37 || // left arrow
      charCode === 39 || // right arrow
      charCode === 46    // delete
    ) {
      return;
    }

    // Block non-numeric
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  blockNonNumericPaste(event: ClipboardEvent): void {
    const pastedText = event.clipboardData?.getData('text') || '';

    if (!/^[0-9]+$/.test(pastedText)) {
      event.preventDefault();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
