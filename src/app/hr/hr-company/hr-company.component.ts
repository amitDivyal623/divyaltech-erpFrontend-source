import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, OnInit, OnDestroy, ViewChild, ViewChildren } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NgbDateAdapter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { distinctUntilChanged, switchMap, map, takeUntil } from 'rxjs/operators';
import { AdminService } from 'src/app/services/admin.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';



class DataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}
export class CustomAdapter extends NgbDateAdapter<string> {
  readonly DELIMITER = '-';
  fromModel(value: string | null): NgbDateStruct | null {
    if (value) {
      let date = value.split(this.DELIMITER);
      return {
        day: parseInt(date[0], 10),
        month: parseInt(date[1], 10),
        year: parseInt(date[2], 10)
      };
    }
    return null;
  }
  toModel(date: NgbDateStruct | null): string | null {
    return date ? date.day + this.DELIMITER + date.month + this.DELIMITER + date.year : null;
  }
}
@Component({
  selector: 'app-hr-company',
  templateUrl: './hr-company.component.html',
  styleUrls: ['./hr-company.component.scss']
})
export class HrCompanyComponent implements OnInit, OnDestroy {
  hradminTab: any;
  hrUserTab: any;
  Admin: any;
  employeeTab: any;
  Administrator: any;
  CRMAdmin: any;
  searchTask: any;
  employee: any;
  minDate: any;
  maxDate: any;
  respStatus: any;
  companyDatalists: any[];

  @ViewChild('closeCompanybutton') closeCompanybutton: ElementRef;

  private destroy$ = new Subject<void>();
  isHideSave: boolean;
  showAllStates: any;
  companyDatatableParameter: {};
  @ViewChildren(DataTableDirective) dtElement: any;
  dtOptions2: DataTables.Settings = {};
  dtTrigger2: Subject<any> = new Subject<any>();
  modalTitle: any;
  headerImagePreview: string | ArrayBuffer | null = null;
  selectedImageFile: File | null = null;

  constructor(private adminservice: AdminService, private http: HttpClient) {
    this.companyDatatableParameter = {};
  }

  AddCompany = new FormGroup({
    master_company_id: new FormControl(),
    company_name: new FormControl('', Validators.required),
    gst_no: new FormControl('', Validators.required),
    pan_no: new FormControl('', Validators.required),
    state: new FormControl('', Validators.required),
    company_address: new FormControl('', Validators.required),
    company_header_image: new FormControl(''),
    company_footer_details: new FormControl(''),
    company_header_image_id: new FormControl('')
  });

  AddStates = new FormGroup({
    state_id: new FormControl(),
    state_name: new FormControl('', Validators.required),
  });

  ngOnInit(): void {
    this.itemCompanyDatatableCode();
    this.CRMAdmin = false;
    if (sessionStorage.getItem('UserRole') == 'CRM Admin') {
      this.CRMAdmin = true;
    }
  }

  openStateModal() {
    this.getStatesLists();
    this.isHideSave = true;
  }

  getStatesLists() {
    let formData = new FormData();
    this.adminservice.getAllStates(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.showAllStates = resp.data;
    });
  }

  saveCompanyName() {
    if (this.AddCompany.invalid) {
      this.AddCompany.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'All fields are required!',
        text: 'Please fill in all the mandatory fields before saving.',
        confirmButtonText: 'OK'
      });

      return;
    } else {
      let formData = new FormData();
      const master_company_id = this.AddCompany.get('master_company_id').value;
      if (master_company_id) {
        formData.append('master_company_id', master_company_id);
      }
      formData.append('companyName', this.AddCompany.get('company_name').value);
      formData.append('gstNo', this.AddCompany.get('gst_no').value);
      formData.append('panNo', this.AddCompany.get('pan_no').value);
      formData.append('stateName', this.AddCompany.get('state').value);
      formData.append('companyAddress', this.AddCompany.get('company_address').value);

      // if (this.selectedImageFile) {
      //   const imageFile = new File(
      //     [this.selectedImageFile],
      //     this.selectedImageFile.name,
      //     { type: 'image/png;charset=UTF-8' }
      //   );
      //   formData.append('companyHeaderImage', imageFile);
      //   formData.append('companyHeaderImageName', imageFile.name);
      // }

      this.adminservice.saveCompany(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
        if (resp == true) {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'State saved successfully!',
            timer: 2000,
            showConfirmButton: false
          });
          this.closeCompanybutton.nativeElement.click();
          this.AddStates.reset();
          this.headerImagePreview = null;
          this.selectedImageFile = null;
          this.reload('company');
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Duplicate Entry!',
            text: 'The entry could not be saved as a similar record already exists.',
            confirmButtonText: 'OK'
          });
        }
      });
    }
  }

  onCompanyHeaderImageChange(files: FileList, event: Event) {
    if (files && files.length > 0) {
      const file = files[0];
      this.AddCompany.patchValue({
        company_header_image: file
      });
      this.AddCompany.get('company_header_image')?.updateValueAndValidity();
      const labelElement = document.getElementById('company_header_image')?.nextElementSibling;
      if (labelElement) {
        labelElement.textContent = file.name;
      }
    }
  }

  resetCompanyForm() {
    this.AddCompany.reset();
    this.AddCompany.enable();

    // Clear the preview
    this.headerImagePreview = null;

    // Clear file input field manually
    const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
    if (fileInput) {
      fileInput.value = '';
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

  itemCompanyDatatableCode() {
    this.companyDatatableParameter = "";

    const that = this;
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });
    this.dtOptions2 = {
      processing: true,
      serverSide: true,
      dom: 'lrtip',
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
      columnDefs: [
        { orderable: false, targets: 0 }
      ],
      ajax: (dataTablesParameters: any, callback) => {
        Object.assign(dataTablesParameters, this.companyDatatableParameter);
        that.http.post<DataTablesResponse>(environment.APIEndpoint + 'admin.fetchAllCompanyDetails&reload=1', Object.assign(dataTablesParameters, this.companyDatatableParameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {
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

  onHeaderImageSelect(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedImageFile = file;
      this.AddCompany.patchValue({ company_header_image: file });
      const reader = new FileReader();
      reader.onload = () => (this.headerImagePreview = reader.result);
      reader.readAsDataURL(file);
    }
  }
}
