import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, OnDestroy, ViewChild, ViewChildren, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormControlName, FormGroup, Validators, FormBuilder, FormArray } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { forkJoin, Subject } from 'rxjs';
import { AdminService } from 'src/app/services/admin.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { distinctUntilChanged, switchMap, map, takeUntil } from 'rxjs/operators';
import { ProjectService } from 'src/app/services/project.service';

class DataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}
@Component({
  selector: 'app-item-master',
  templateUrl: './item-master.component.html',
  styleUrls: ['./item-master.component.scss']
})
export class ItemMasterComponent implements OnInit, OnDestroy {

  @ViewChildren(DataTableDirective) dtElement: any;
  @ViewChild('closeGroupbutton') closeGroupbutton: ElementRef;
  @ViewChild('closeUnitbutton') closeUnitbutton: ElementRef;
  @ViewChild('closeStatebutton') closeStatebutton: ElementRef;
  @ViewChild('closeCompanybutton') closeCompanybutton: ElementRef;
  @ViewChild('closeMasterItem') closeMasterItem: ElementRef;
  @ViewChild('closeSubGroupbutton') closeSubGroupbutton: ElementRef;

  private destroy$ = new Subject<void>();

  dtOptions: DataTables.Settings = {};
  // dtOptions2: DataTables.Settings = {};
  dtOptions3: DataTables.Settings = {};
  dtOptions4: DataTables.Settings = {};
  dtOptions5: DataTables.Settings = {};
  dtOptions6: DataTables.Settings = {};
  itemDatatableParameter: { item_id: '', item_name: '', category: '', subCategory: '' };
  companyDatatableParameter: {};
  categoryDatatableParameter: { group_id: '' };
  subcategoryDatatableParameter: { group_id: '', sub_group_id: '' };
  unitDatatableParameter: { unit_id: '' };
  stateDatatableParameter: { state_id: '' };
  showAllGroups: any[];
  itemDatalists: any[];
  companyDatalists: any[];
  categoryDatalists: any[];
  subCategoryDatalists: any[];
  subUnitDatalists: any[];
  StateDatalists: any[];
  showAllSubGroups: any[] = [];
  showSubGrpsById: any[] = [];
  showAllStates: any[];
  showAllUnits: any[];
  max_id: Number;
  submitted: any;
  modalTitle: any;
  isHideSave: boolean;
  submittedState = false;
  submittedUnit = false;
  submittedGroup = false;
  submittedSubGroup = false;
  filterSubGroupList: any[] = [];
  categoryLists = [];
  subcategoryLists = [];
  isSubGroupLoading = false;

  filteredSubcategoryLists: any[];
  filteredMaterialsList: any[];
  filteredMaterialsListSearch: any[];
  materialsListSearch: any[];
  filteredSubcategoryListsSearch: any[];
  compareById = (a: any, b: any) => String(a) === String(b);





  dtTrigger: Subject<any> = new Subject<any>();
  // dtTrigger2: Subject<any> = new Subject<any>();
  dtTrigger3: Subject<any> = new Subject<any>();
  dtTrigger4: Subject<any> = new Subject<any>();
  dtTrigger5: Subject<any> = new Subject<any>();
  dtTrigger6: Subject<any> = new Subject<any>();

  AddGroups = new FormGroup({
    group_name: new FormControl('', Validators.required),
    group_id: new FormControl(),
  });

  AddSubGroups = new FormGroup({
    subgroupid: new FormControl(),
    group_name: new FormControl('', Validators.required),
    sub_group_name: new FormControl('', Validators.required),
  });

  itemMasterForm = new FormGroup({
    master_item_id: new FormControl(),
    groupName: new FormControl('', Validators.required),
    subGroupName: new FormControl('', Validators.required),
    item_id: new FormControl(),
    itemName: new FormControl('', Validators.required),
    quantity: new FormControl(),
    basicRate: new FormControl(),
    item_description: new FormControl(),
    basic_unit: new FormControl('', Validators.required),
    rent: new FormControl(false),
    alt_unit: new FormControl(''),
    hsn_code: new FormControl(),
    remarks: new FormControl(),

    unitConversions: new FormArray([])
  });

  AddUnits = new FormGroup({
    unit_name: new FormControl('', Validators.required),
    unit_id: new FormControl(),
  });

  AddStates = new FormGroup({
    state_id: new FormControl(),
    state_name: new FormControl('', Validators.required),
  });

  AddCompany = new FormGroup({
    master_company_id: new FormControl(),
    company_name: new FormControl('', Validators.required),
    gst_no: new FormControl('', Validators.required),
    pan_no: new FormControl('', Validators.required),
    state: new FormControl('', Validators.required),
    company_address: new FormControl('', Validators.required),
  });


  get unitConversions(): FormArray {
    return this.itemMasterForm.get('unitConversions') as FormArray;
  }


  removeConversionRow(index: number) {
    this.unitConversions.removeAt(index);
  }


  getBasicUnitName(): string {
    const selectedId = this.itemMasterForm.get('basic_unit')?.value;
    const unit = this.showAllUnits.find(u => u.unit_id == selectedId);
    return unit ? unit.unit_name : '';
  }


  addConversionRow(data: any = null) {

    const group = new FormGroup({
      conversion_id: new FormControl(data ? data.conversion_id : null),

      // Always take basic unit from main form
      basic_unit_id: new FormControl(
        data ? data.basic_unit_id : this.itemMasterForm.get('basic_unit')?.value
      ),

      basic_value: new FormControl(
        data ? data.basic_value : '',
        Validators.required
      ),

      alt_unit_id: new FormControl(
        data ? data.alt_unit_id : '',
        Validators.required
      ),

      alt_value: new FormControl(
        data ? data.alt_value : '',
        Validators.required
      )
    });

    this.unitConversions.push(group);
  }


  filterStateForm = new FormGroup({
    state_id: new FormControl(),
  });
  filterUnitForm = new FormGroup({
    unit_id: new FormControl(),
  });
  filterCategoryForm = new FormGroup({
    group_id: new FormControl(),
  });
  filterSubCategoryForm = new FormGroup({
    group_id: new FormControl(),
    sub_group_id: new FormControl(),
  });
  filterItemForm = new FormGroup({
    item_id: new FormControl(),
    item_name: new FormControl(),
    category: new FormControl(),
    subCategory: new FormControl(),
  });

  constructor(private adminservice: AdminService, private http: HttpClient, private fb: FormBuilder, private ProjectService: ProjectService, private cdr: ChangeDetectorRef) {
    this.itemDatatableParameter = { item_id: '', item_name: '', category: '', subCategory: '' };
    this.companyDatatableParameter = {};
    this.categoryDatatableParameter = { group_id: '' };
    this.subcategoryDatatableParameter = { group_id: '', sub_group_id: '' };
    this.unitDatatableParameter = { unit_id: '' };
    this.stateDatatableParameter = { state_id: '' };
  }

  ngOnInit(): void {
    this.getGroupLists();
    this.getSubGroupLists();
    this.itemMasterDatatablecode();
    // this.itemCompanyDatatableCode();
    this.itemCategoryDatatableCode();
    this.itemSubCategoryDatatableCode();
    this.itemUnitDatatableCode();
    this.itemStateDatatableCode();
    this.getUnitLists();
    this.getStatesLists();
    this.getCategoryLists();
    this.getSubCategoryLists();
    this.getAllMaterialListsSearch();
    this.fetchMaxId();

    this.filterSubCategoryForm.get('group_id').valueChanges.pipe(takeUntil(this.destroy$)).subscribe(groupId => {
      this.onSearchCategoryChange(groupId);
    });

    this.itemMasterForm.get('basic_unit')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.unitConversions.clear();
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

  getAllMaterialListsSearch() {
    let formData = new FormData();
    this.ProjectService.getAllMaterialsLists(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.materialsListSearch = resp.data;
      this.filteredMaterialsListSearch = [...this.materialsListSearch];

    });
  }

  onCategoryChange(event: any) {
    const categoryId = event.target.value;

    // Filter subcategories
    this.filteredSubcategoryListsSearch = this.subcategoryLists.filter(
      sub => sub.group_id === categoryId
    );

    // Clear dependent fields
    this.filterItemForm.patchValue({
      subCategory: null,
      item_name: null
    });

    // Clear items until sub-category selected
    this.filteredMaterialsListSearch = [];
  }

  onSubCategoryChange(event: any) {
    const subCategoryId = event.target.value;
    const categoryId = this.filterItemForm.get('category')?.value;

    this.filteredMaterialsListSearch = this.materialsListSearch.filter(
      item =>
        item.group_id === categoryId &&
        item.sub_group_id === subCategoryId
    );

    // Clear selected item
    this.filterItemForm.patchValue({ item_name: null });
  }




  clearItemSelectionSerach() {
    this.filterItemForm.patchValue({ item_name: null });
    this.filteredMaterialsListSearch = [...this.materialsListSearch];
  }

  openSubGroupModal() {
    this.modalTitle = 'add_subcategory';
    this.isHideSave = true;
    this.submittedSubGroup = false;

    this.getGroupLists();
    this.fetchMaxId();
    this.getUnitLists();
  }


  openItemModal() {
    this.modalTitle = 'add_item';
    this.isHideSave = true;
    this.submitted = false;
  }


  openGroupModal() {
    this.modalTitle = 'add_category';
    this.isHideSave = true;
    this.submittedGroup = false;
  }


  openUnitModal() {
    this.modalTitle = 'add_unit';
    this.isHideSave = true;
    this.submittedUnit = false;
  }


  openStateModal() {
    this.modalTitle = 'add_state';
    // this.getStatesLists();
    this.isHideSave = true;
    this.submittedState = false;
  }


  clearGroupField() {
    this.submittedGroup = false;

    this.AddGroups.reset();

    Object.keys(this.AddGroups.controls).forEach(key => {
      const control = this.AddGroups.get(key);
      control?.setErrors(null);
      control?.markAsPristine();
      control?.markAsUntouched();
      control?.updateValueAndValidity();
    });

    this.AddGroups.enable();
  }


  clearSubGroupField() {
    this.submittedSubGroup = false;

    this.AddSubGroups.reset();

    Object.keys(this.AddSubGroups.controls).forEach(key => {
      const control = this.AddSubGroups.get(key);
      control?.setErrors(null);
      control?.markAsPristine();
      control?.markAsUntouched();
      control?.updateValueAndValidity();
    });

    this.AddSubGroups.enable();
  }


  onSearchCategoryChange(groupId: string): void {

    // reset sub-category
    this.filterSubCategoryForm.get('sub_group_id').setValue('');
    this.filterSubGroupList = [];

    if (!groupId) {
      return;
    }

    const formData = new FormData();
    formData.append('groupId', groupId);

    this.adminservice.getSubGroupById(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe(resp => {
        this.filterSubGroupList = resp.data || [];
      });
  }

  // onItemChange(selectedItem: any) {

  //   if (!selectedItem) {
  //     this.filterItemForm.reset();
  //     this.filteredSubcategoryListsSearch = [...this.subcategoryLists];
  //     this.filteredMaterialsListSearch = [...this.materialsListSearch];
  //     return;
  //   }

  //   const categoryId = selectedItem.group_id;
  //   const subCategoryId = selectedItem.sub_group_id;

  //   // Filter subcategories
  //   this.filteredSubcategoryListsSearch = this.subcategoryLists.filter(
  //     sub => sub.group_id === categoryId
  //   );

  //   // Set values (CORRECT keys)
  //   this.filterItemForm.patchValue({
  //     category: categoryId,
  //     subCategory: subCategoryId
  //   });

  //   // Filter items
  //   this.filteredMaterialsListSearch = this.materialsListSearch.filter(
  //     item =>
  //       item.group_id === categoryId &&
  //       item.sub_group_id === subCategoryId
  //   );
  // }



  saveGroupName() {
    this.submittedGroup = true;

    if (this.AddGroups.invalid) {

      //  force validation UI
      Object.keys(this.AddGroups.controls).forEach(key => {
        const control = this.AddGroups.get(key);
        control?.markAsTouched();
        control?.updateValueAndValidity();
      });

      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please enter Category name'
      });

      return;
    }

    let formdata = new FormData();
    const group_id = this.AddGroups.get('group_id').value;

    if (group_id) {
      formdata.append('group_id', group_id);
    }

    formdata.append('groupName', this.AddGroups.get('group_name').value);

    this.adminservice.saveGroupName(formdata)
      .pipe(takeUntil(this.destroy$))
      .subscribe(resp => {

        if (resp?.data === true) {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: resp.message,   //  message from backend
            timer: 2000,
            showConfirmButton: false
          });

          this.closeGroupbutton.nativeElement.click();
          this.clearGroupField();   //  important
          this.getGroupLists();
          this.reload('category');

        } else {
          Swal.fire({
            icon: 'error',
            title: 'Duplicate Entry!',
            text: resp.message || 'Category already exists',
            confirmButtonText: 'OK'
          });
        }
      }, error => {
        console.error('Error saving group:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'An error occurred while saving the group. Please try again.',
          confirmButtonText: 'OK'
        });
      });
  }


  saveSubGroupName() {
    this.submittedSubGroup = true;

    if (this.AddSubGroups.invalid) {

      //  force validation UI
      Object.keys(this.AddSubGroups.controls).forEach(key => {
        const control = this.AddSubGroups.get(key);
        control?.markAsTouched();
        control?.updateValueAndValidity();
      });

      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please select Category and enter Sub Category name'
      });

      return;
    }

    let formData = new FormData();
    const subgroupid = this.AddSubGroups.get('subgroupid').value;

    if (subgroupid) {
      formData.append('subgroupid', subgroupid);
    }

    formData.append('groupNme', this.AddSubGroups.get('group_name').value);
    formData.append('subGroupNme', this.AddSubGroups.get('sub_group_name').value);

    this.adminservice.saveSubGroup(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe(resp => {

        if (resp?.data === true) {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: resp.message,   //  message from backend
            timer: 2000,
            showConfirmButton: false
          });

          this.closeSubGroupbutton.nativeElement.click();
          this.clearSubGroupField();
          this.getSubGroupLists(); 
          this.reload('subCategory');

        } else {
          Swal.fire({
            icon: 'error',
            title: 'Duplicate Entry!',
            text: resp.message || 'Sub-Category already exists for this Category',
            confirmButtonText: 'OK'
          });
        }
      });
  }


  getGroupLists() {
    let formData = new FormData();
    formData.append('status', '1');
    this.adminservice.GetAllGroupName(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.showAllGroups = resp.data;
    });
  }

  getSubGroupLists() {
    let formData = new FormData();
    formData.append('status', '1');

    this.adminservice.GetAllSubGroupName(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe(resp => {

        this.showAllSubGroups = resp.data || [];
        this.showSubGrpsById = [];

      });
  }

  onChangeGroupName() {
    const selectedGroupId = this.itemMasterForm.get('groupName')?.value;

    this.showSubGrpsById = [];
    this.itemMasterForm.patchValue({ subGroupName: '' });

    if (!selectedGroupId) return;

    this.showSubGrpsById = this.showAllSubGroups.filter(
      sub => sub.groupid === selectedGroupId
    );
  }

  fetchMaxId() {
    let formdata = new FormData();
    this.adminservice.fetchMaxId(formdata).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.max_id = resp;
    });
  }

  onChangeGrpAndSubGrp() {
    const grp_id = this.itemMasterForm.get('groupName').value;
    const sub_grp_id = this.itemMasterForm.get('subGroupName').value;

    const selectedGrp = this.showAllGroups.find(grp => grp.groupid == grp_id);
    const selectedSubGrp = this.showSubGrpsById.find(subgrp => subgrp.subgroupid == sub_grp_id);

    if (selectedGrp && selectedSubGrp) {
      const getInitials = (text: string): string => {
        return text
          .trim()
          .split(/\s+/)                      // split on spaces
          .map(word => word.charAt(0).toUpperCase()) // take first character in uppercase
          .join('');
      };

      const grpInitials = getInitials(selectedGrp.groupname);
      const subGrpInitials = getInitials(selectedSubGrp.subgroupname);
      const maxId = Number(this.max_id) || 0;
      const newCode = `${grpInitials}-${subGrpInitials}-${maxId + 1}`;
      this.itemMasterForm.patchValue({ item_id: newCode });
    } else {
      console.warn('Group or Subgroup not selected properly.');
    }
  }

  closeItemModal() {

    this.submitted = false;

    this.itemMasterForm.reset();
    this.itemMasterForm.patchValue({ rent: false });
    this.unitConversions.clear();

    this.itemMasterForm.markAsPristine();
    this.itemMasterForm.markAsUntouched();
    this.itemMasterForm.enable();

  }


  SaveItemMaster() {
    this.submitted = true;

    const masterItem_id = this.itemMasterForm.get('master_item_id')?.value;

    if (this.itemMasterForm.valid) {

      let formData = new FormData();

      if (masterItem_id) {
        formData.append('master_item_id', masterItem_id);
      }

      // ===== Existing Fields =====
      formData.append('itemId', this.itemMasterForm.get('item_id')?.value || '');
      formData.append('itemName', this.itemMasterForm.get('itemName')?.value || '');
      formData.append('quantity', this.itemMasterForm.get('quantity')?.value || '');
      formData.append('itemDescription', this.itemMasterForm.get('item_description')?.value || '');
      formData.append('groupName', this.itemMasterForm.get('groupName')?.value || '');
      formData.append('subGroupName', this.itemMasterForm.get('subGroupName')?.value || '');
      formData.append('basicUnit', this.itemMasterForm.get('basic_unit')?.value || '');
      formData.append('alt_unit', this.itemMasterForm.get('alt_unit')?.value || '');
      formData.append('basicRate', this.itemMasterForm.get('basicRate')?.value || '');
      formData.append('hsnCode', this.itemMasterForm.get('hsn_code')?.value || '');
      formData.append('remarks', this.itemMasterForm.get('remarks')?.value || '');
      formData.append('rent', this.itemMasterForm.get('rent')?.value ? '1' : '0');

      // ===== UNIT CONVERSION LOGIC =====

      const basicUnitId = this.itemMasterForm.get('basic_unit')?.value;
      const altUnitId = this.itemMasterForm.get('alt_unit')?.value;

      const basicUnitObj = this.showAllUnits.find(u => u.unit_id === basicUnitId);
      const altUnitObj = this.showAllUnits.find(u => u.unit_id === altUnitId);

      let enrichedConversions: any[] = [];

      // If conversion rows exist → use them
      if (this.unitConversions && this.unitConversions.value.length > 0) {

        enrichedConversions = this.unitConversions.value.map((conv: any) => {

          const altUnitObjFromRow = this.showAllUnits.find(
            u => u.unit_id === conv.alt_unit_id
          );

          return {
            basic_unit_id: basicUnitId,
            basic_unit_name: basicUnitObj?.unit_name || '',
            basic_value: conv.basic_value || 0,

            alt_unit_id: conv.alt_unit_id,
            alt_unit_name: altUnitObjFromRow?.unit_name || '',
            alt_value: conv.alt_value || 0
          };
        });

      } else {

        // ===== DEFAULT FALLBACK (NO CONVERSION ROW ADDED) =====
        enrichedConversions.push({
          basic_unit_id: basicUnitId,
          basic_unit_name: basicUnitObj?.unit_name || '',
          basic_value: 0,

          alt_unit_id: altUnitId,
          alt_unit_name: altUnitObj?.unit_name || '',
          alt_value: 0
        });
      }

      // Append JSON
      formData.append('unitConversions', JSON.stringify(enrichedConversions));

      // ===== API CALL =====
      this.adminservice.saveItemMaster(formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe(resp => {

          if (resp?.data == true) {

            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: resp.message,
              timer: 2000,
              showConfirmButton: false
            });

            this.reload('item');
            this.closeMasterItem.nativeElement.click();
            this.itemMasterForm.reset();
            this.itemMasterForm.patchValue({ rent: false });
            this.unitConversions.clear();
            this.fetchMaxId();

          } else {

            Swal.fire({
              icon: 'error',
              title: 'Duplicate Entry!',
              text: resp.message || 'Item already exists.',
              confirmButtonText: 'OK'
            });

          }

        });

    } else {

      this.itemMasterForm.markAllAsTouched();

      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fill all required fields before saving.',
      });

    }
  }




  editItemDetail(type, master_item_id) {

    this.modalTitle = type;

    let formData = new FormData();
    formData.append('master_item_id', master_item_id);

    this.adminservice.fetchItemDataById(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe(resp => {
        const data = resp.data[0];
        const conversions = resp.conversions || [];

        this.itemMasterForm.patchValue({
          master_item_id: data.master_item_id,
          item_id: data.item_id,
          itemName: data.item_name,
          quantity: data.quantity,
          item_description: data.item_description,
          groupName: data.group_id,
          // subGroupName: data.sub_group_id,
          basic_unit: data.basic_unit,
          rent: data?.rent == '1',
          alt_unit: data.alt_unit,
          basicRate: data.basic_rate,
          hsn_code: data.hsn_code,
          remarks: data.remarks
        });

        this.onChangeGroupName();
        this.itemMasterForm.patchValue({
          subGroupName: data.sub_group_id
        });
        this.unitConversions.clear();

        // Delay FormArray population to next change detection cycle
        setTimeout(() => {

          conversions
            .filter(conv => !(+conv.basic_value === 0 && +conv.alt_value === 0))
            .forEach(conv => this.addConversionRow(conv));

        }, 0);

        if (this.modalTitle.includes('view_item')) {
          this.itemMasterForm.disable();
          this.isHideSave = false;
        } else {
          this.itemMasterForm.enable();
          this.isHideSave = true;
        }

      });
  }


  removeItemDetail(master_item_id) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this item?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes !',
      cancelButtonText: 'No',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        let formData = new FormData();
        formData.append('master_item_id', master_item_id.toString());

        this.adminservice.DeleteItemDataById(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
          if (resp === true) {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Item has been deleted successfully.',
              timer: 2000,
              showConfirmButton: false
            });
            this.reload('item');
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Delete Failed!',
              text: 'Something went wrong. The Item was not deleted.',
              confirmButtonText: 'OK'
            });
          }
        });
      }
    });
  }

  editCompanyDetail(type, master_company_id) {
    this.getStatesLists();
    this.modalTitle = type;
    this.modalTitle.includes('view_company')
      ? (this.AddCompany.disable(), this.isHideSave = false)
      : (this.AddCompany.enable(), this.isHideSave = true);
    let formData = new FormData();
    formData.append('master_company_id', master_company_id);

    this.adminservice.fetchCompanyDataById(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.AddCompany.patchValue({
        master_company_id: resp.data[0].master_company_id,
        company_name: resp.data[0].company_name,
        gst_no: resp.data[0].gst_no,
        pan_no: resp.data[0].pan_no,
        state: resp.data[0].state_name,
        company_address: resp.data[0].company_address,
      });
    });
  }

  editCategoryDetail(type, groupid) {
    this.modalTitle = type;
    this.modalTitle.includes('view_category')
      ? (this.AddGroups.disable(), this.isHideSave = false)
      : (this.AddGroups.enable(), this.isHideSave = true);
    let formData = new FormData();
    formData.append('groupid', groupid);

    this.adminservice.fetchCategoryDataById(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.AddGroups.patchValue({
        group_name: resp.data[0].groupname,
        group_id: resp.data[0].groupid
      });
    });
  }

  editsubCategoryDetail(type, subgroupid) {

    this.modalTitle = type;

    const groupFD = new FormData();
    groupFD.append('status', '1');

    this.adminservice.GetAllGroupName(groupFD)
      .pipe(takeUntil(this.destroy$))
      .subscribe(groupResp => {

        /* step 1: load group list */
        this.showAllGroups = groupResp.data;

        const subFD = new FormData();
        subFD.append('subgroupid', subgroupid);

        /* step 2: fetch subcategory data */
        this.adminservice.fetchSubCategoryDataById(subFD)
          .pipe(takeUntil(this.destroy$))
          .subscribe(subResp => {

            const data = subResp.data[0];

            /* step 3: patch values */
            this.AddSubGroups.patchValue({
              subgroupid: data.subgroupid,
              sub_group_name: data.subgroupName,
              group_name: data.groupid
            });

            /* step 4: apply view/edit logic AFTER patch */
            if (this.modalTitle.includes('view_subcategory')) {
              this.AddSubGroups.disable();
              this.isHideSave = false;
            } else {
              this.AddSubGroups.enable();
              this.isHideSave = true;
            }

          });

      });
  }



  editUnitDetail(type, unit_id) {
    // this.getUnitLists();
    this.modalTitle = type;
    this.modalTitle.includes('view_unit')
      ? (this.AddUnits.disable(), this.isHideSave = false)
      : (this.AddUnits.enable(), this.isHideSave = true);
    let formData = new FormData();
    formData.append('unit_id', unit_id);

    this.adminservice.fetchUnitDataById(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.AddUnits.patchValue({
        unit_id: resp.data[0].unit_id,
        unit_name: resp.data[0].unit_name
      });
    });
  }

  editStateDetail(type, state_id) {
    // this.getUnitLists();
    this.modalTitle = type;
    this.modalTitle.includes('view_state')
      ? (this.AddStates.disable(), this.isHideSave = false)
      : (this.AddStates.enable(), this.isHideSave = true);
    let formData = new FormData();
    formData.append('state_id', state_id);

    this.adminservice.fetchStateDataById(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.AddStates.patchValue({
        state_id: resp.data[0].state_id,
        state_name: resp.data[0].state_name
      });
    });
  }

  deleteCompanyDetail(master_company_id) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this company?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes !',
      cancelButtonText: 'No',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        let formData = new FormData();
        formData.append('master_company_id', master_company_id.toString());

        this.adminservice.deleteCompanyById(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
          if (resp === true) {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Company has been deleted successfully.',
              timer: 2000,
              showConfirmButton: false
            });
            this.reload('company');
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Delete Failed!',
              text: 'Something went wrong. The company was not deleted.',
              confirmButtonText: 'OK'
            });
          }
        });
      }
    });
  }

  deleteCategoryDetail(groupid) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this category?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes !',
      cancelButtonText: 'No',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        let formData = new FormData();
        formData.append('groupid', groupid.toString());

        this.adminservice.deleteCategoryById(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
          if (resp === true) {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Category has been deleted successfully.',
              timer: 2000,
              showConfirmButton: false
            });
            this.reload('category');
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Delete Failed!',
              text: 'Something went wrong. The category was not deleted.',
              confirmButtonText: 'OK'
            });
          }
        });
      }
    });
  }

  deletesubCategoryDetail(subgroupid) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this Sub-category?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes !',
      cancelButtonText: 'No',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        let formData = new FormData();
        formData.append('subgroupid', subgroupid.toString());

        this.adminservice.deleteSubCategoryById(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
          if (resp === true) {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Sub-Category has been deleted successfully.',
              timer: 2000,
              showConfirmButton: false
            });
            this.reload('subCategory');
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Delete Failed!',
              text: 'Something went wrong. The Subcategory was not deleted.',
              confirmButtonText: 'OK'
            });
          }
        });
      }
    });
  }

  deleteUnitDetail(unit_id) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this Unit ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes !',
      cancelButtonText: 'No',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        let formData = new FormData();
        formData.append('unit_id', unit_id.toString());

        this.adminservice.deleteUnitById(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
          if (resp === true) {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Unit has been deleted successfully.',
              timer: 2000,
              showConfirmButton: false
            });
            this.reload('unit');
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Delete Failed!',
              text: 'Something went wrong. Unit was not deleted.',
              confirmButtonText: 'OK'
            });
          }
        });
      }
    });
  }

  deleteStateDetail(state_id) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this State?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes !',
      cancelButtonText: 'No',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        let formData = new FormData();
        formData.append('state_id', state_id.toString());

        this.adminservice.deleteStateById(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
          if (resp === true) {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'State has been deleted successfully.',
              timer: 2000,
              showConfirmButton: false
            });
            this.reload('state');
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Delete Failed!',
              text: 'Something went wrong. State was not deleted.',
              confirmButtonText: 'OK'
            });
          }
        });
      }
    });
  }

  itemMasterDatatablecode() {
    this.itemDatatableParameter.item_id = this.filterItemForm.get('item_id').value;
    this.itemDatatableParameter.item_name = this.filterItemForm.get('item_name').value;
    this.itemDatatableParameter.category = this.filterItemForm.get('category').value;
    this.itemDatatableParameter.subCategory = this.filterItemForm.get('subCategory').value;

    const that = this;
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });
    this.dtOptions = {
      processing: true,
      serverSide: true,
      dom: 'lrtip',
      lengthMenu: [[5, 10, 25, 50, 100, 300], [5, 10, 25, 50, 100, 300]],
      pageLength: 10,
      columnDefs: [
        { orderable: false, targets: 0 }
      ],
      ajax: (dataTablesParameters: any, callback) => {
        Object.assign(dataTablesParameters, this.itemDatatableParameter);
        that.http.post<DataTablesResponse>(environment.APIEndpoint + 'admin.fetchAllItemsDetails&reload=1', Object.assign(dataTablesParameters, this.itemDatatableParameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {
          that.itemDatalists = resp.data;
          callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsTotal,
            data: [],
          });
        });
      }
    };
  }

  // itemCompanyDatatableCode(){
  //   this.companyDatatableParameter = "";

  //   const that = this;
  //   const headers = new HttpHeaders({'Content-Type': 'text/plain' });
  //   this.dtOptions2 = {
  //     processing: true,
  //     serverSide: true,
  //     dom: 'lrtip',
  //     lengthMenu: [[5, 10, 25, 50], [5, 10, 25,50]],
  //     columnDefs: [
  //       {orderable: false, targets: 0}
  //     ],
  //     ajax: (dataTablesParameters: any, callback) => {
  //       Object.assign(dataTablesParameters, this.companyDatatableParameter);
  //       that.http.post<DataTablesResponse>(environment.APIEndpoint + 'admin.fetchAllCompanyDetails&reload=1', Object.assign(dataTablesParameters, this.companyDatatableParameter), {responseType: 'json', headers }).subscribe(resp => {
  //        that.companyDatalists = resp.data;
  //        callback({
  //         recordsTotal: resp.recordsTotal,
  //         recordsFiltered: resp.recordsTotal,
  //         data: [],
  //        })
  //       });
  //     }
  //   }
  // }

  itemCategoryDatatableCode() {
    this.categoryDatatableParameter.group_id = this.filterCategoryForm.get('group_id').value;

    const that = this;
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });
    this.dtOptions3 = {
      processing: true,
      serverSide: true,
      dom: 'lrtip',
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
      pageLength: 10,
      columnDefs: [
        { orderable: false, targets: 0 }
      ],
      ajax: (dataTablesParameters: any, callback) => {
        Object.assign(dataTablesParameters, this.categoryDatatableParameter);
        that.http.post<DataTablesResponse>(environment.APIEndpoint + 'admin.fetchAllCategoryDetails&reload=1', Object.assign(dataTablesParameters, this.categoryDatatableParameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {
          that.categoryDatalists = resp.data;
          callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsTotal,
            data: [],
          })
        });
      }
    }
  }

  itemSubCategoryDatatableCode() {
    this.subcategoryDatatableParameter.group_id = this.filterSubCategoryForm.get('group_id').value;
    this.subcategoryDatatableParameter.sub_group_id = this.filterSubCategoryForm.get('sub_group_id').value;

    const that = this;
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });
    this.dtOptions4 = {
      processing: true,
      serverSide: true,
      dom: 'lrtip',
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
      pageLength: 10,
      columnDefs: [
        { orderable: false, targets: 0 }
      ],
      ajax: (dataTablesParameters: any, callback) => {
        Object.assign(dataTablesParameters, this.subcategoryDatatableParameter);
        that.http.post<DataTablesResponse>(environment.APIEndpoint + 'admin.fetchAllSubCategoryDetails&reload=1', Object.assign(dataTablesParameters, this.subcategoryDatatableParameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {
          that.subCategoryDatalists = resp.data;
          callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsTotal,
            data: [],
          })
        });
      }
    }
  }

  itemUnitDatatableCode() {
    this.unitDatatableParameter.unit_id = this.filterUnitForm.get('unit_id').value;

    const that = this;
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });
    this.dtOptions5 = {
      processing: true,
      serverSide: true,
      dom: 'lrtip',
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
      pageLength: 10,
      columnDefs: [
        { orderable: false, targets: 0 }
      ],
      ajax: (dataTablesParameters: any, callback) => {
        Object.assign(dataTablesParameters, this.unitDatatableParameter);
        that.http.post<DataTablesResponse>(environment.APIEndpoint + 'admin.fetchAllUnitDetails&reload=1', Object.assign(dataTablesParameters, this.unitDatatableParameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {
          that.subUnitDatalists = resp.data;
          callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsTotal,
            data: [],
          })
        });
      }
    }
  }

  itemStateDatatableCode() {
    this.stateDatatableParameter.state_id = this.filterStateForm.get('state_id').value;

    const that = this;
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });
    this.dtOptions6 = {
      processing: true,
      serverSide: true,
      dom: 'lrtip',
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
      pageLength: 10,
      columnDefs: [
        { orderable: false, targets: [0, 5] } // blank + action
      ],
      columns: [
        { data: 'dummy' },
        { data: 'sr_no' },      // Sr No
        { data: 'state_name' },  // State name
        { data: 'created_by' },  // Created By
        { data: 'created_dt' },  // Created Date
        { data: 'dummy' }       // Action
      ],

      ajax: (dataTablesParameters: any, callback) => {


        Object.assign(dataTablesParameters, this.stateDatatableParameter);
        that.http.post<DataTablesResponse>(environment.APIEndpoint + 'admin.fetchAllStateDetails&reload=1', Object.assign(dataTablesParameters, this.stateDatatableParameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {
          that.StateDatalists = resp.data;
          callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsTotal,
            data: [],
          });
        });
      }
    }
  }

  saveUnitName() {
    this.submittedUnit = true;

    if (this.AddUnits.invalid) {

      //  force validation UI
      Object.keys(this.AddUnits.controls).forEach(key => {
        const control = this.AddUnits.get(key);
        control?.markAsTouched();
        control?.updateValueAndValidity();
      });

      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please enter Unit name'
      });

      return;
    }

    let formData = new FormData();
    const unit_id = this.AddUnits.get('unit_id').value;

    if (unit_id) {
      formData.append('unit_id', unit_id);
    }

    formData.append('unitName', this.AddUnits.get('unit_name').value);

    this.adminservice.saveUnits(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe(resp => {

        if (resp?.data === true) {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: resp.message,   //  message from backend
            timer: 2000,
            showConfirmButton: false
          });

          this.closeUnitbutton.nativeElement.click();
          this.resetUnitForm();   //  use reset method
          this.reload('unit');

        } else {
          Swal.fire({
            icon: 'error',
            title: 'Duplicate Entry!',
            text: resp.message || 'Unit already exists',
            confirmButtonText: 'OK'
          });
        }
      });
  }


  saveStateName() {
    this.submittedState = true;

    if (this.AddStates.invalid) {

      //  Force validation UI
      Object.keys(this.AddStates.controls).forEach(key => {
        const control = this.AddStates.get(key);
        control?.markAsTouched();
        control?.updateValueAndValidity();
      });

      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please enter State name'
      });

      return;
    }

    // ---------- SAVE LOGIC ----------
    let formData = new FormData();
    const state_id = this.AddStates.get('state_id').value;

    if (state_id) {
      formData.append('state_id', state_id);
    }

    formData.append('stateName', this.AddStates.get('state_name').value);

    this.adminservice.saveStates(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe(resp => {

        if (resp?.data === true) {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: resp.message,   //  message from backend
            timer: 2000,
            showConfirmButton: false
          });

          this.closeStatebutton.nativeElement.click();
          this.resetStateForm(); //  important
          this.reload('state');

        } else {
          Swal.fire({
            icon: 'error',
            title: 'Duplicate Entry!',
            text: resp.message || 'State already exists',
            confirmButtonText: 'OK'
          });
        }
      });
  }


  // saveCompanyName(){
  //   if(this.AddCompany.valid){
  //     let formData = new FormData();
  //     const master_company_id = this.AddCompany.get('master_company_id').value;
  //     if(master_company_id){
  //       formData.append('master_company_id', master_company_id);
  //     }
  //     formData.append('companyName',this.AddCompany.get('company_name').value);
  //     formData.append('gstNo',this.AddCompany.get('gst_no').value);
  //     formData.append('panNo',this.AddCompany.get('pan_no').value);
  //     formData.append('stateName',this.AddCompany.get('state').value);
  //     formData.append('companyAddress',this.AddCompany.get('company_address').value);
  //     this.adminservice.saveCompany(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
  //       if (resp == true) {
  //         Swal.fire({
  //           icon: 'success',
  //           title: 'Success!',
  //           text: 'State saved successfully!',
  //           timer: 2000,
  //           showConfirmButton: false
  //         });
  //         this.closeCompanybutton.nativeElement.click();        
  //         this.AddStates.reset();     
  //         this.reload('company');

  //       } else {
  //         Swal.fire({
  //           icon: 'error',
  //           title: 'Duplicate Entry!',
  //           text: 'The entry could not be saved as a similar record already exists.',
  //           confirmButtonText: 'OK'
  //         });
  //       }
  //     });
  //   }
  // }

  getUnitLists() {
    let formData = new FormData();
    this.adminservice.getUnitLists(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.showAllUnits = resp.data;
    });
  }

  // resetCompanyForm(){
  //   this.AddCompany.reset();
  //   this.AddCompany.enable();
  // }

  resetUnitForm() {
    this.submittedUnit = false;

    this.AddUnits.reset();

    Object.keys(this.AddUnits.controls).forEach(key => {
      const control = this.AddUnits.get(key);
      control?.setErrors(null);
      control?.markAsPristine();
      control?.markAsUntouched();
      control?.updateValueAndValidity();
    });

    this.AddUnits.enable();
  }


  resetStateForm() {
    this.submittedState = false; //  important

    this.AddStates.reset();

    Object.keys(this.AddStates.controls).forEach(key => {
      const control = this.AddStates.get(key);
      control?.setErrors(null);
      control?.markAsPristine();
      control?.markAsUntouched();
      control?.updateValueAndValidity();
    });

    this.AddStates.enable();
  }


  getStatesLists() {
    let formData = new FormData();
    this.adminservice.getAllStates(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.showAllStates = resp.data;
    });
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
    // this.dtTrigger2.next(); 
    this.dtTrigger3.next();
    this.dtTrigger4.next();
    this.dtTrigger5.next();
    this.dtTrigger6.next();
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
    });
  }

  // reload() {  
  //   this.dtElement.forEach(item =>
  //     Object.keys(item.dtInstance).length ?
  //       item.dtInstance.then((dtInstance: DataTables.Api) => {
  //         dtInstance.ajax.reload();
  //       }) : ''
  //   );
  // }  

  reload(tableType?: string) {
    if (tableType === 'state') {
      //Reload only state table
      this.dtElement.toArray()[4].dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        this.dtTrigger6.next(null);
      });
    }
    else if (tableType === 'unit') {
      //Reload only unit table
      this.dtElement.toArray()[3].dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        this.dtTrigger5.next(null);
      });
    }
    else if (tableType == 'subCategory') {
      //Reload only sub-category table
      this.dtElement.toArray()[2].dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        this.dtTrigger4.next(null);
      });
    }
    else if (tableType === 'category') {
      //Reload only category table
      this.dtElement.toArray()[1].dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        this.dtTrigger3.next(null);
      });
    }
    // else if (tableType === 'company') {
    //   // Reload only company table
    //   this.dtElement.toArray()[1].dtInstance.then((dtInstance: DataTables.Api) => {
    //     dtInstance.destroy();
    //     // this.dtTrigger2.next(null);
    //   });
    // }
    else if (tableType === 'item') {
      // Reload only item table
      this.dtElement.toArray()[0].dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        this.dtTrigger.next(null);
      });
    } else {
      // Reload all tables 
      this.dtElement.forEach((dtElement: DataTableDirective) => {
        dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.destroy();
        });
      });
      // Trigger all tables
      this.dtTrigger6.next(null);
      this.dtTrigger5.next(null);
      this.dtTrigger4.next(null);
      this.dtTrigger3.next(null);
      // this.dtTrigger2.next(null);
      this.dtTrigger.next(null);
    }
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    // this.dtTrigger2.unsubscribe();    
    this.dtTrigger3.unsubscribe();
    this.dtTrigger4.unsubscribe();
    this.dtTrigger5.unsubscribe();
    this.dtTrigger6.unsubscribe();

    this.destroy$.next();
    this.destroy$.complete();

    if (this.dtElement && this.dtElement.dtInstance) {
      this.dtElement.dtInstance.then(dt => dt.destroy());
    }
  }



  searchState(): void {
    this.itemStateDatatableCode();
    this.reload('state');
  }
  resetState() {
    this.filterStateForm.get('state_id').setValue('');
    this.itemStateDatatableCode();
    this.reload('state');
  }

  searchUnit(): void {
    this.itemUnitDatatableCode();
    this.reload('unit');
  }
  resetUnit() {
    this.filterUnitForm.get('unit_id').setValue('');
    this.itemUnitDatatableCode();
    this.reload('unit');
  }

  searchCategory(): void {
    this.itemCategoryDatatableCode();
    this.reload('category');
  }
  resetCategory() {
    this.filterCategoryForm.get('group_id').setValue('');
    this.itemCategoryDatatableCode();
    this.reload('category');
  }

  searchSubCategory(): void {
    this.itemSubCategoryDatatableCode();
    this.reload('subCategory');
  }
  resetSubCategory() {
    this.filterSubCategoryForm.get('group_id').setValue('');
    this.filterSubCategoryForm.get('sub_group_id').setValue('');
    this.itemSubCategoryDatatableCode();
    this.reload('subCategory');
  }

  searchItem(): void {
    this.itemMasterDatatablecode();
    this.reload('item');
  }
  resetItem() {
    this.filterItemForm.reset();
    this.itemMasterDatatablecode();
    this.reload('item');
    this.filteredSubcategoryListsSearch = [...this.subcategoryLists];
    this.filteredMaterialsListSearch = [...this.materialsListSearch];
  }

}
