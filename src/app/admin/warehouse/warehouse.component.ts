import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, OnInit, OnDestroy, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AdminService } from 'src/app/services/admin.service';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';

class DataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}
@Component({
  selector: 'app-warehouse',
  templateUrl: './warehouse.component.html',
  styleUrls: ['./warehouse.component.scss']
})
export class WarehouseComponent implements OnInit, OnDestroy {
  addMasterForm: FormGroup;
  searchWarehouse: FormGroup;
  
  private destroy$ = new Subject<void>();
  @ViewChild('addMasterFormDir') addMasterFormDir!: FormGroupDirective;
  @ViewChildren(DataTableDirective) dtElement: any;
  @ViewChild('closeWarehousebutton') closeWarehousebutton: ElementRef;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  states = [];
  warehouseDatalists = [];
  wareDataParameter = {warehouseName:'', state:'', status:''};
  nextId: any;
  isHideButton: boolean = true;

  constructor(private fb: FormBuilder, private adminservice: AdminService,private activatedRoute: ActivatedRoute,private http:HttpClient) {
    this.wareDataParameter = { warehouseName: '', state: '', status: '' }
  }



  ngOnInit(): void {
    this.addMasterForm = this.fb.group({
      godown_id: [''],
      warehouseName: ['', Validators.required],
      warehouseCode: ['', Validators.required],
      state: ['', Validators.required],
      statusEnabled: [''],
      address: ['', Validators.required]
    });   
    this.searchWarehouse = this.fb.group({
      warehouseName: [''],
      state: [null],
      status: [''],
    });
    this.wareHouseDatatableCode();
    this.getStatesLists();
  }


  searchWarehouses(){
    this.wareHouseDatatableCode();
    this.reload('warehouse');
  }

  resetWarehouse(){
    this.searchWarehouse.get('warehouseName').setValue('');
    this.searchWarehouse.get('state').setValue(null);
    this.searchWarehouse.get('status').setValue('');

    this.wareHouseDatatableCode();
    this.reload('warehouse');
  }

  wareHouseDatatableCode(){
    this.wareDataParameter.warehouseName = this.searchWarehouse.get('warehouseName').value;
    this.wareDataParameter.state = this.searchWarehouse.get('state').value;
    this.wareDataParameter.status = this.searchWarehouse.get('status').value;

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
      ajax: (dataTablesParameters: any, callback) => {
        Object.assign(dataTablesParameters, this.wareDataParameter);
        that.http.post<DataTablesResponse>(environment.APIEndpoint + 'admin.fetchWarehouseDetails&reload=1', Object.assign(dataTablesParameters, this.wareDataParameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {
          that.warehouseDatalists = resp.data;
          callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsTotal,
            data: [],
          });
        });
      }
    };    
  }


  // Called when modal is opened 
  onModalOpen() {
    this.isHideButton = true;
    this.addMasterForm.enable();
    let formData = new FormData();
    this.adminservice.getMaxWarehouseId(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
        this.nextId = resp + 1; 
    });
    this.addMasterForm.get('warehouseCode').disable();
    this.getStatesLists();
  }

  getStatesLists(){
    let formData = new FormData();
    this.adminservice.getAllStates(formData).pipe(takeUntil(this.destroy$)).subscribe(resp =>{
      this.states = resp.data;
    });
  }

  /** Called on blur of warehouse name */
  generateWarehouseCode() {

    const name = this.addMasterForm.get('warehouseName')?.value;
    if (!name || !this.nextId) return;

    // take first letter of each word
    const initials = name.split(/\s+/)
                         .filter(w => w.length > 0)
                         .map(w => w[0].toUpperCase())
                         .join('-');

    const code = `${initials}-${this.nextId}`;
    this.addMasterForm.patchValue({ warehouseCode: code });
    
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }  



  saveMasterEntry() {
    // const project_id = this.activatedRoute.snapshot.paramMap.get('id');
    if (this.addMasterForm.invalid) {
      // show all errors immediately
      Object.values(this.addMasterForm.controls).forEach(c => c.markAsTouched());

      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fill all required fields before submitting!',
        confirmButtonText: 'OK'
      });

      return;
    }

    let formData = new FormData();
    const godown_id = this.addMasterForm.get('godown_id').value;
    if(godown_id){
      formData.append('godown_id',godown_id);
    }
    formData.append('godown_name',this.addMasterForm.get('warehouseName').value);
    formData.append('godown_code', this.addMasterForm.get('warehouseCode').value);
    formData.append('state', this.addMasterForm.get('state').value);
    formData.append('address', this.addMasterForm.get('address').value);
    const statusEnabled = this.addMasterForm.get('statusEnabled').value ? '1' : '0';
    formData.append('statusEnabled', statusEnabled);    
    this.adminservice.saveWareHouse(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
       if(resp){
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Warehouse saved successfully!',
          confirmButtonText: 'OK'
        });    
        this.closeWarehousebutton.nativeElement.click();
        this.reload('warehouse'); 
       } else {
         Swal.fire({
          icon:'error',
          title: 'errro in saving the value',
          confirmButtonText: 'OK'
         });
         return;
        // this.closeWarehousebutton.nativeElement.click();
        // this.reload('warehouse'); 
       }
    });

    // Example success message after API call
    // Swal.fire({
    //   icon: 'success',
    //   title: 'Success',
    //   text: 'Master entry saved successfully!',
    //   confirmButtonText: 'OK'
    // });
  }

  onModalClose() {
   
    this.addMasterFormDir?.resetForm();  
    this.addMasterForm.reset();         
  }

  editWarehouseDetail(type,godown_id){
    this.getStatesLists();
    if(type == 'view_warehouse'){
     this.addMasterForm.disable();
     this.isHideButton = false;
    } else {
     this.addMasterForm.enable();
     this.isHideButton = true;
    }

    let formData = new FormData();
    formData.append('godown_id',godown_id);
    this.adminservice.getWareByid(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      console.log(resp.data[0]);
      this.addMasterForm.patchValue({
       godown_id: resp.data[0].godown_id,
       warehouseName: resp.data[0].godown_name,
       warehouseCode: resp.data[0].godown_code,
       state: resp.data[0].state,
       address: resp.data[0].address,
       statusEnabled: resp.data[0].status_enabled == 1 ? true: false,
      });

    });

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.dtElement && this.dtElement.dtInstance) {
    this.dtElement.dtInstance.then(dt => dt.destroy());
    }       
  }  

  reload(tableType?: string) {
    if(tableType === 'warehouse'){
      //Reload only warehouse table
      this.dtElement.toArray()[0].dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        this.dtTrigger.next(null);
      });
    }else {
      // Reload all tables 
      this.dtElement.forEach((dtElement: DataTableDirective) => {
        dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.destroy();
        });
      });
      // Trigger all tables
      this.dtTrigger.next(null);
    }
  }  

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
    });
  }  

  deleteWarehouseDetail(godown_id){
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
        formData.append('godown_id', godown_id.toString());

        this.adminservice.deleteWarehouseById(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
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

}
