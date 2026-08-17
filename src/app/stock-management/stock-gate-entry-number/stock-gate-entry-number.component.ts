import { Component, OnInit, OnDestroy, ElementRef, ViewChild, ViewChildren } from '@angular/core';
import { StockService } from 'src/app/services/stock.service';
import { distinctUntilChanged, switchMap, map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { DataTableDirective } from 'angular-datatables';
import { ProjectService } from 'src/app/services/project.service';
import { CrmService } from 'src/app/services/crm.service';
import { DatePipe } from '@angular/common';
import { invalid } from 'moment';


class DataTablesResponse {
  iTotalDisplayRecords(iTotalDisplayRecords: any) {
    throw new Error('Method not implemented.');
  }
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}
// Interface for PO Item
interface POItem {
  name: string;
  quantity: number;
  unit: string;
}

// Interface for PO Data
interface POData {
  orderedBy: string;
  toWarehouse: string;
  fromVendor: string;
  items: POItem[];
}

// Interface for Gate Entry Form
interface GateEntryForm {
  poNumber: string;
  challanNo: string;
  billNo: string;
  vehicleNo: string;
  geNo: string;
}

@Component({
  selector: 'app-stock-gate-entry-number',
  templateUrl: './stock-gate-entry-number.component.html',
  styleUrls: ['./stock-gate-entry-number.component.scss']
})
export class StockGateEntryNumberComponent implements OnInit, OnDestroy {

  // Form Model
  gateEntryForm!: FormGroup;
  private destroy$ = new Subject<void>();
  poOptions: any[] = [];
  selectedPODetails: any = null;
  selectedPOData: any[] = [];
  gateEntryTableData: any[] = [];
  warehouseList: any[];
  employee: any[];
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  @ViewChildren(DataTableDirective) dtElement: any;
  @ViewChild('gateEntryModal') gateEntryModal!: ElementRef;
  selectedPO: string = '';
  // selectedPOData: { name: string; quantity: string }[] = [];
  // selectedPOData: POData | null = null;
  showPODetails: boolean = false;
  showSuccessPopup: boolean = false;
  generatedGENumber: string = '';
  gateEntryDatatableParameter: { gateEntry: '', vehicleNo: '', toWarehouse: '', orderedBy: '' };

  searchGateEntryForm = new FormGroup({
    gateEntry: new FormControl(''),
    vehicleNo: new FormControl(''),
    toWarehouse: new FormControl(''),
    orderedBy: new FormControl(''),

  });

  constructor(private stockService: StockService, private datePipe: DatePipe, private fb: FormBuilder, private http: HttpClient, private ProjectService: ProjectService, private crmservice: CrmService) {
    this.gateEntryDatatableParameter = { gateEntry: '', vehicleNo: '', toWarehouse: '', orderedBy: '' }
  }

  ngOnInit(): void {
    this.getDispatchedPOLists();
    this.gateEntryForm = this.fb.group({
      gate_entry_id: [''],
      gate_entry_date: ['', Validators.required],
      challanNo: [''],
      bill_date: [''],
      billNo: [''],
      vehicleNo: [''],
      poNumber: ['', Validators.required],
      vendor: [''],
      company_name: [''],
      rate: [''],
      total_amount: [''],
      discount: [''],
      grand_total: [''],
      orderedBy: [''],
      toWarehouse: [''],
      to_warehouse_id: [''],
      project_id: ['']
    });
    this.GateEntryDatatablecode();
    this.getWarehouselists();
    this.employeetypenamelist();
  }

  getDispatchedPOLists() {
    let formData = new FormData();
    formData.append('dispatched', '1');

    this.stockService.getDispatchedPOLists(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe(resp => {

        // Map only PO numbers to dropdown format
        this.poOptions = resp.data.map((po: any) => ({
          value: po.purchase_order_number,
          label: po.purchase_order_number
        }));
      });
  }

  employeetypenamelist() {
    let employeelist = new FormData();
    this.crmservice.getEmployee(employeelist).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.employee = resp.data;
    });
  }

  getWarehouselists() {
    let formData = new FormData();
    formData.append('statue_enabled', '1');
    this.ProjectService.getWarehouselists(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.warehouseList = resp.data;
    });
  }

  // private generateGENumber(): string {
  //   const timestamp = Date.now();
  //   const random = Math.floor(Math.random() * 1000);
  //   return `GE${timestamp}${random}`;
  // }

  // Called when PO selection changes

  onPOSelectionChange(poValue: string): void {
    if (!poValue) {
      this.clearPOData();
      return;
    }

    const formData = new FormData();
    formData.append('poValue', poValue);

    this.stockService.onPOSelectionChange(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe(resp => {

        if (resp.data && resp.data.length > 0) {
          const po = resp.data[0];

          const items = po.item_name ? po.item_name.split(',') : [];
          const quantities = po.quantity ? po.quantity.split(',') : [];
          const poBalances = po.po_balance ? po.po_balance.split(',') : [];

          this.selectedPOData = items.map((item: string, index: number) => ({
            name: item.trim(),
            quantity: poBalances.length
              ? (poBalances[index]?.trim() || '0')
              : (quantities[index]?.trim() || '0'),
            item_id: po.item_id ? po.item_id.split(',')[index]?.trim() : '',
            group_id: po.group_id ? po.group_id.split(',')[index]?.trim() : '',
            sub_group_id: po.sub_group_id ? po.sub_group_id.split(',')[index]?.trim() : '',
            to_warehouse_id: po.to_warehouse_id ? po.to_warehouse_id.split(',')[index]?.trim() : '',
            project_id: po.project_id ? po.project_id.split(',')[index]?.trim() : '',
            unit: po.unit ? po.unit.split(',')[index]?.trim() : '',
            item_description: po.item_description ? po.item_description.split(',')[index]?.trim(): ''
          })).filter(item => item.quantity !== '0'); // hide zero po_balance items;


          this.selectedPODetails = {
            vendor_name: po.vendor_name,
            ordered_by: po.ordered_by,
            to_warehouse: po.to_warehouse
          };

          this.gateEntryForm.patchValue({
            vendor: po.vendor_name,
            company_name: po.company_name,
            rate: po.rate,
            total_amount: po.total_amount,
            discount: po.discount,
            grand_total: po.grand_total,
            orderedBy: po.ordered_by,
            toWarehouse: po.to_warehouse,
            to_warehouse_id: po.to_warehouse_id,
            project_id: po.project_id,
          });
        } else {
          this.clearPOData();
        }
      });
  }


  clearPOData(): void {
    // Only clear PO-related data but retain other form fields if needed
    this.gateEntryForm.patchValue({
      poNumber: '',
      vendor: '',
      company_name: '',
      rate: '',
      total_amount: '',
      discount: '',
      grand_total: '',
      orderedBy: '',
      toWarehouse: '',
      to_warehouse_id: '',
      project_id: '',
    });

    this.selectedPODetails = null;
    this.selectedPOData = [];
  }


  onSubmit(): void {
    if (this.gateEntryForm.get('poNumber')?.invalid || this.gateEntryForm.get('gate_entry_date')?.invalid || this.gateEntryForm.get('bill_date')?.invalid ) {
      this.gateEntryForm.get('poNumber')?.markAsTouched();
      this.gateEntryForm.get('gate_entry_date')?.markAsTouched();
      this.gateEntryForm.get('bill_date')?.markAsTouched();
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please select all Required fields before saving.'
      });
      return;
    }

    const formData = new FormData();
    const gate_entry_id = this.gateEntryForm.get('gate_entry_id')?.value;
    if (gate_entry_id) formData.append('gate_entry_id', gate_entry_id);
    formData.append('gate_entry_date', this.gateEntryForm.get('gate_entry_date')?.value);
    formData.append('challanNo', this.gateEntryForm.get('challanNo')?.value);
    formData.append('billNo', this.gateEntryForm.get('billNo')?.value);
    formData.append('bill_date', this.gateEntryForm.get('bill_date')?.value);
    formData.append('vehicleNo', this.gateEntryForm.get('vehicleNo')?.value);
    formData.append('poNumber', this.gateEntryForm.get('poNumber')?.value);
    formData.append('vendor', this.gateEntryForm.get('vendor')?.value);
    formData.append('company_name', this.gateEntryForm.get('company_name')?.value);
    formData.append('rate', this.gateEntryForm.get('rate')?.value);
    formData.append('total_amount', this.gateEntryForm.get('total_amount')?.value);
    formData.append('discount', this.gateEntryForm.get('discount')?.value);
    formData.append('grand_total', this.gateEntryForm.get('grand_total')?.value);
    formData.append('orderedBy', this.gateEntryForm.get('orderedBy')?.value);
    formData.append('toWarehouse', this.gateEntryForm.get('toWarehouse')?.value);
    formData.append('to_warehouse_id', this.gateEntryForm.get('to_warehouse_id')?.value);
    formData.append('project_id', this.gateEntryForm.get('project_id')?.value);

    const itemNames = this.selectedPOData.map(i => i.name).join(',');
    const itemQuantities = this.selectedPOData.map(i => i.quantity).join(',');
    const itemIds = this.selectedPOData.map(i => i.item_id).join(',');
    const groupIds = this.selectedPOData.map(i => i.group_id).join(',');
    const subGroupIds = this.selectedPOData.map(i => i.sub_group_id).join(',');
    // const toWarehouseIds = this.selectedPOData.map(i => i.to_warehouse_id).join(',');
    const units = this.selectedPOData.map(i => i.unit).join(',');
    const item_descriptions = this.selectedPOData.map(i => i.item_description).join(',');

    formData.append('itemNames', itemNames);
    formData.append('itemQuantities', itemQuantities);
    formData.append('itemIds', itemIds);
    formData.append('groupIds', groupIds);
    formData.append('subGroupIds', subGroupIds);
    // formData.append('toWarehouseIds',toWarehouseIds);
    formData.append('unit', units);
    formData.append('item_description',item_descriptions);

    Swal.fire({
      title: 'Saving Gate Entry...',
      text: 'Please wait while we process your request.',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.stockService.saveGateEntryForm(formData).pipe(takeUntil(this.destroy$)).subscribe({
      next: (resp) => {

        setTimeout(() => {
          Swal.close();
          if (resp.action === 'create') {
            Swal.fire({
              icon: 'success',
              title: 'Gate Entry Approved',
              html: `Note this number and proceed with the GRN.<br><br><b></b> <span style="font-size:18px; font-weight:600;">${resp.gen_no}</span>`,
              allowOutsideClick: false,
              allowEscapeKey: false,
              confirmButtonText: 'OK'
            }).then(() => {
              this.closeModal();
              this.rerender();
            });
          } else if (resp.action === 'update') {
            Swal.fire({
              icon: 'success',
              title: 'Gate Entry Updated',
              text: 'The gate entry details have been successfully updated.',
              allowOutsideClick: false,
              allowEscapeKey: false,
              confirmButtonText: 'OK'
            }).then(() => {
              this.closeModal();
              this.rerender();
            });
          }
          else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: resp.message || 'Failed to create Gate Entry.'
            });
          }

        }, 400);
      },
      error: () => {
        Swal.close();
        Swal.fire({
          icon: 'error',
          title: 'Server Error',
          text: 'Something went wrong while saving the Gate Entry.'
        });
      }
    });
  }


  viewGateEntry(type: string, gate_entry_id: string): void {
    // Reset form state first
    this.gateEntryForm.reset();
    this.selectedPOData = [];
    this.selectedPODetails = null;

    // Enable/disable form depending on mode
    if (type === 'view_gate_entry') {
      this.gateEntryForm.disable();
    } else if (type === 'edit_gate_entry') {
      this.gateEntryForm.enable();
      this.gateEntryForm.get('poNumber')?.disable();
      this.gateEntryForm.get('vendor')?.disable();
      this.gateEntryForm.get('orderedBy')?.disable();
      this.gateEntryForm.get('toWarehouse')?.disable();
      this.gateEntryForm.get('to_warehouse_id')?.disable();
      this.gateEntryForm.get('project_id')?.disable();
    }

    // Fetch Gate Entry Data
    const formData = new FormData();
    formData.append('gate_entry_id', gate_entry_id);

    this.stockService.fetchGateEntryBiId(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe(resp => {

        if (resp.data && resp.data.length > 0) {
          const entry = resp.data[0];
   
          // Patch form with response data
          this.gateEntryForm.patchValue({
            gate_entry_id: entry.gate_entry_id || '',
            gate_entry_date: entry.gate_entry_date ? this.datePipe.transform(entry.gate_entry_date, 'yyyy-MM-dd') : '',
            challanNo: entry.challan_no || '',
            billNo: entry.bill_no || '',
            bill_date: entry.bill_date ? this.datePipe.transform(entry.bill_date, 'yyyy-MM-dd') : '',
            vehicleNo: entry.vehicle_no || '',
            poNumber: entry.selected_po || '',
            vendor: entry.from_vendor || '',
            company_name: entry.company_name || '',
            rate: entry.rate || '',
            total_amount: entry.total_amount || '',
            discount: entry.discount || '',
            grand_total: entry.grand_total || '',
            orderedBy: entry.ordered_by || '',
            toWarehouse: entry.to_warehouse || '',
            to_warehouse_id: entry.to_warehouse_id || '',
            project_id: entry.project_id || '',
          });

          // Set PO selection dropdown value
          setTimeout(() => {
            this.gateEntryForm.get('poNumber')?.setValue(entry.selected_po);
            this.onPOSelectionChange(entry.selected_po);
          }, 0);

          // Populate PO-based details if available
          const items = entry.item_name ? entry.item_name.split(',') : [];
          const quantities = entry.quantity ? entry.quantity.split(',') : [];

          this.selectedPOData = items.map((item: string, index: number) => ({
            name: item.trim(),
            quantity: quantities[index]?.trim() || '0'
          }));

          this.selectedPODetails = {
            vendor_name: entry.from_vendor,
            ordered_by: entry.ordered_by,
            to_warehouse: entry.to_warehouse
          };
        }
      });
  }

  removeGateEntry(gate_entry_id) {
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
        transation_form.append('gate_entry_id', gate_entry_id);
        this.stockService.removeGateEntry(transation_form).pipe(takeUntil(this.destroy$)).subscribe(Response => {
          if (Response.data == true) {
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'Gate Entry Deleted Sucessfully',
              showConfirmButton: false,
              timer: 2000
            });
            this.rerender();
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

  searchGateEntry() {
    this.GateEntryDatatablecode();
    this.rerender();
  }

  resetGateEntry() {
    this.searchGateEntryForm.get('gateEntry').setValue('');
    this.searchGateEntryForm.get('vehicleNo').setValue('');
    this.searchGateEntryForm.get('toWarehouse').setValue('');
    this.searchGateEntryForm.get('orderedBy').setValue('');

    this.GateEntryDatatablecode();
    this.rerender();
  }

  GateEntryDatatablecode() {
    this.gateEntryDatatableParameter.gateEntry = this.searchGateEntryForm.get('gateEntry').value;
    this.gateEntryDatatableParameter.vehicleNo = this.searchGateEntryForm.get('vehicleNo').value;
    this.gateEntryDatatableParameter.toWarehouse = this.searchGateEntryForm.get('toWarehouse').value;
    this.gateEntryDatatableParameter.orderedBy = this.searchGateEntryForm.get('orderedBy').value;

    const that = this;
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });
    this.dtOptions = {
      processing: true,
      serverSide: true,
      pageLength: 10,
      dom: 'lrtip',
      lengthMenu: [[5, 10, 25, 50, 300], [5, 10, 25, 50, 300]],
      columnDefs: [
        { orderable: false, targets: [0, 9] } // blank + action
      ],
      columns: [
        { data: 'dummy' }, // first blank column
        { data: 'gen_no' },
        { data: 'selected_po' },
        { data: 'vehicle_no' },
        { data: 'from_vendor' },
        { data: 'to_warehouse' },
        { data: 'ordered_by' },
        { data: 'item_name' },
        { data: 'quantity' },
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
          ...this.gateEntryDatatableParameter,
          order_column: orderColumnIndex,
          order_dir: orderDir,
          order_column_name: orderColumnName
        };

        that.http.post<DataTablesResponse>(environment.APIEndpoint + 'stock.fetchEntryPassData&reload=1', Object.assign(dataTablesParameters, this.gateEntryDatatableParameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {
 
          that.gateEntryTableData = resp.data;
          callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsTotal,
            data: []
          });
        });
      }
    }
  }



  resetForm(): void {
    //  Resets all form fields to initial state (empty)
    this.gateEntryForm.reset({
      challanNo: '',
      billNo: '',
      vehicleNo: '',
      poNumber: '',
      vendor: '',
      company_name: '',
      rate: '',
      total_amount: '',
      discount: '',
      grand_total: '',
      orderedBy: '',
      toWarehouse: ''
    });

    //  Clear selected PO details and table data
    this.selectedPODetails = null;
    this.selectedPOData = [];
  }

  closeModal(): void {
    this.gateEntryForm.reset({
      challanNo: '',
      billNo: '',
      vehicleNo: '',
      poNumber: '',
      vendor: '',
      company_name: '',
      rate: '',
      total_amount: '',
      discount: '',
      grand_total: '',
      orderedBy: '',
      toWarehouse: '',
      to_warehouse_id: '',
      project_id: '',
    });
    this.gateEntryForm.markAsPristine();
    this.gateEntryForm.markAsUntouched();
    this.selectedPODetails = null;
    this.selectedPOData = [];
    const closeBtn = this.gateEntryModal?.nativeElement.querySelector('[data-dismiss="modal"]') as HTMLElement;
    if (closeBtn) closeBtn.click();
    this.gateEntryForm.enable();
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
    // this.dtTrigger.unsubscribe();

    this.destroy$.next();
    this.destroy$.complete();

    // if (this.dtElement && this.dtElement.dtInstance) {
    //   this.dtElement.dtInstance.then(dt => dt.destroy());
    // }

  }
}