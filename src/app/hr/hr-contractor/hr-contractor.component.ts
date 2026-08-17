import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, OnInit, OnDestroy, ViewChild, ViewChildren } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AdminService } from 'src/app/services/admin.service';
import { ContractorService } from 'src/app/services/contractor.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

class DataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}
@Component({
  selector: 'app-hr-contractor',
  templateUrl: './hr-contractor.component.html',
  styleUrls: ['./hr-contractor.component.scss']
})
export class HrContractorComponent implements OnInit, OnDestroy {
  addContractData() {
    throw new Error('Method not implemented.');
  }

  dtOptions2: DataTables.Settings = {};
  dtTrigger2: Subject<any> = new Subject<any>();
  companyDatalists: any;
  AddCompany: any;
  showAllStates: any;
  modalTitle: any;
  @ViewChild('closeContractorModal', { static: false })
  closeContractorModal: ElementRef;
  private destroy$ = new Subject<void>();
  @ViewChildren(DataTableDirective) dtElement: any;
  contractorDatatableParameter: { name: any, mobile: any };
  contractorrs: any[] = [];

  isHideSave: any;
  isViewMode: boolean = false;   // clean boolean flag



  AddContractor = new FormGroup({
    contractor_id: new FormControl(''),
    name: new FormControl('', Validators.required),      // validation added
    mobile: new FormControl('', [
      Validators.required,
      Validators.pattern('^[0-9]{10}$')                  // validation added
    ]),
    address: new FormControl('', Validators.required),  // validation added
    account_no: new FormControl(''),
    bank_name: new FormControl(''),
    ifsc_code: new FormControl(''),
  });

  searchContractor = new FormGroup({
    name: new FormControl(''),
    mobile: new FormControl('')
  });

  respcontractor: any;
  addWorkContract: any;
  isButtonDisabled: any;

  constructor(private contractorService: ContractorService, private http: HttpClient, private adminservice: AdminService) {
    this.contractorDatatableParameter = { name: '', mobile: '' };
  }

  ngOnInit(): void {
    this.contractorDatatablecode();
    this.getallContractors();
  }

  getallContractors() {
    let formData = new FormData();

    this.contractorService.getallContractors(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.contractorrs = resp;
    });
  }

  openContractorModal() {
    this.modalTitle = 'add_contractor';
    this.isViewMode = false;         // Save button visible
    this.AddContractor.reset();
    this.AddContractor.enable();
  }

  searchContractorForm() {
    this.contractorDatatablecode();
    this.reload('company');
  }

  resetContractorForm() {
    this.searchContractor.get('name').setValue('');
    this.searchContractor.get('mobile').setValue('');

    this.contractorDatatablecode();
    this.reload('company');
  }


  contractorDatatablecode() {
    this.contractorDatatableParameter.name = this.searchContractor.get('name').value;
    this.contractorDatatableParameter.mobile = this.searchContractor.get('mobile').value;

    const that = this;
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });
    this.dtOptions2 = {
      processing: true,
      serverSide: true,
      dom: 'lrtip',
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
      pageLength: 10,
      columnDefs: [
        { orderable: false, targets: 0 }
      ],
      ajax: (dataTablesParameters: any, callback) => {
        Object.assign(dataTablesParameters, this.contractorDatatableParameter);
        that.http.post<DataTablesResponse>(environment.APIEndpoint + 'contractor.fetchAllContractorDetails&reload=1', Object.assign(dataTablesParameters, this.contractorDatatableParameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {

          that.companyDatalists = resp.data;
          callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsTotal,
            data: [],
          })
        });
      }
    }
  }


  saveContractor() {

    if (this.isButtonDisabled) return;   // prevent double click

    if (this.AddContractor.invalid) {

      let msg = '';

      if (this.AddContractor.get('name')?.invalid) {
        msg = 'Contractor Name is required';
      }
      else if (this.AddContractor.get('mobile')?.invalid) {
        msg = 'Enter a valid 10 digit Mobile Number';
      }
      else if (this.AddContractor.get('address')?.invalid) {
        msg = 'Address is required';
      }

      Swal.fire({
        icon: 'warning',
        title: 'Invalid Input',
        text: msg,
        confirmButtonColor: '#3085d6'
      });

      this.AddContractor.markAllAsTouched();
      return;
    }

    // 🔒 Disable button immediately
    this.isButtonDisabled = true;

    const formData = new FormData();
    const raw = this.AddContractor.getRawValue();

    Object.keys(raw).forEach(key => {
      formData.append(key, raw[key] ? raw[key] : '');
    });

    this.contractorService.saveContractor(formData).pipe(takeUntil(this.destroy$)).subscribe(
      (resp: any) => {

        if (resp === false || resp?.success === false) {

          this.isButtonDisabled = false;   // re-enable on failure

          Swal.fire({
            icon: 'error',
            title: 'Duplicate Contractor',
            text: 'This contractor name already exists'
          });
          return;
        }

        Swal.fire({
          icon: 'success',
          title: 'Saved',
          text: 'Contractor saved successfully',
          timer: 1500,
          showConfirmButton: false
        });

        this.AddContractor.reset();
        this.closeContractorModal.nativeElement.click();

        this.isButtonDisabled = false;   // reset state for next open
        this.reload('company');

      },
      (err) => {

        this.isButtonDisabled = false;   // re-enable if API error

        const msg = err?.error?.message || err?.error || 'Something went wrong';

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: msg
        });
      }
    );
  }


  editContractorDetail(type: string, contractor_id: string) {

    this.modalTitle = type;

    if (type === 'view_contractor') {
      this.isViewMode = true;        // Hide Save button
      this.AddContractor.disable();  // Disable form
    } else {
      this.isViewMode = false;       // Show Save button
      this.AddContractor.enable();   // Enable form
    }

    const formData = new FormData();
    formData.append('contractor_id', contractor_id);

    this.adminservice.fetchContractorById(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe(resp => {

        const data = resp[0];

        this.AddContractor.patchValue({
          contractor_id: data.contractor_id,
          name: data.name,
          mobile: data.mobile,
          address: data.address,
          bank_name: data.bank_name,
          account_no: data.account_no,
          ifsc_code: data.ifsc_code
        });

      });
  }

  deleteContractorDetail(contractor_id: string) {
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
        formData.append('contractor_id', contractor_id);

        this.adminservice.DeleteContractorById(formData).pipe(takeUntil(this.destroy$)).subscribe(
          (resp) => {
            if (resp === true) {   //  Only show success if deletion was successful
              Swal.fire('Deleted!', 'The material entry has been deleted.', 'success');
              this.reload();
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

  reload(tableType?: string) {
    if (tableType === 'company') {
      // Reload only company table
      this.dtElement.toArray()[0].dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        this.dtTrigger2.next(null);
      });
    } else {
      // Reload all tables 
      this.dtElement.forEach((dtElement: DataTableDirective) => {
        dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.destroy();
        });
      });
      // Trigger all tables
      this.dtTrigger2.next(null);
    }
  }

  ngAfterViewInit(): void {
    this.dtTrigger2.next();
  }

  ngOnDestroy(): void {
    this.dtTrigger2.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();

    if (this.dtElement && this.dtElement.dtInstance) {
      this.dtElement.dtInstance.then(dt => dt.destroy());
    }
  }

  resetCompanyForm() {
    throw new Error('Method not implemented.');
  }

}
