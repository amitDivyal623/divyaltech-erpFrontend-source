import { Component, Injectable, OnInit, OnDestroy, ViewChildren } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HrService } from 'src/app/services/hr.service';
import Swal from 'sweetalert2';
import { ProjectService } from 'src/app/services/project.service';
import { ViewChild, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { NgbDateAdapter, NgbDateStruct, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { distinctUntilChanged, switchMap, map, takeUntil } from 'rxjs/operators';

class DataTablesResponse {
  iTotalDisplayRecords(iTotalDisplayRecords: any) {
    throw new Error('Method not implemented.');
  }
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}

@Injectable()
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

/**
 * This Service handles how the date is rendered and parsed from keyboard i.e. in the bound input field.x
 */

@Injectable()
export class CustomDateParserFormatter extends NgbDateParserFormatter {

  readonly DELIMITER = '/';

  parse(value: string): NgbDateStruct | null {
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

  format(date: NgbDateStruct | null): string {
    return date ? ("0" + date.day).slice(-2) + this.DELIMITER + ("0" + date.month).slice(-2) + this.DELIMITER + date.year : '';
  }
}

@Component({
  selector: 'app-project-work-contract',
  templateUrl: './project-work-contract.component.html',
  styleUrls: ['./project-work-contract.component.scss']
})
export class ProjectWorkContractComponent implements OnInit, OnDestroy {

  role: any;
  respType: any;
  respStatus: any;
  myBooks: any;
  isButtonDisabled: any;
  respcontractor: any;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  @ViewChild('closebutton') closebutton: ElementRef;
  @ViewChildren(DataTableDirective) dtElement: any;
  workContractData: any;
  contractDatatableparameter: { searchVendorName: any, searchContractCode: any };
  private destroy$ = new Subject<void>();


  constructor(private hrservice: HrService, private projectservice: ProjectService, private http: HttpClient) {
    this.contractDatatableparameter = { searchVendorName: "", searchContractCode: "" };
  }

  ngOnInit(): void {
    this.contractorlist();
    this.contractDatatablecode();
  }

  searchContract = new FormGroup({
    searchVendorName: new FormControl(),
    searchContractCode: new FormControl(),
  });

  addWorkContract = new FormGroup({
    vendor_name: new FormControl('', Validators.required),
    vendor_id: new FormControl(),
    contract_id: new FormControl(),
    contract_code: new FormControl('', Validators.required),
    contract_description: new FormControl('', Validators.required),
  });

  contractorlist() {
    let projectlist = new FormData();
    projectlist.append('statusValue', '1');
    this.hrservice.contractorList(projectlist).pipe(takeUntil(this.destroy$)).subscribe(Response => {
      this.respcontractor = Response.data
    });
  }

  searchLists() {
    this.contractDatatablecode();
    this.reload();
  }

  lookupFormreset() {
    this.addWorkContract.reset();
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }


  addContractData() {
    if (this.addWorkContract.valid) {

      let formData = new FormData();
      formData.append('vendorId', this.addWorkContract.get('vendor_name').value);
      formData.append('contract_id', this.addWorkContract.get('contract_id').value);
      formData.append('contractCode', this.addWorkContract.get('contract_code').value);
      formData.append('contractDescription', this.addWorkContract.get('contract_description').value);

      this.projectservice.addWorkContract(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
        console.log(resp.CODE);
        if (resp.CODE == 200) {
          this.closebutton.nativeElement.click();
          Swal.fire({
            title: 'Success!',
            text: 'Work contract has been added successfully.',
            icon: 'success',
            timer: 3000,
            showConfirmButton: false,
            timerProgressBar: true
          }).then(() => {
            this.addWorkContract.reset();
            this.reload();
          });

        } else {
          Swal.fire({
            title: 'Error!',
            text: 'Failed to add work contract. Contact UR Dev.',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#d33'
          });
        }
      });
    } else {
      console.log(' Form Invalid');
      Swal.fire('Error', 'Failed to delete selected entries.', 'error');
      this.markFormGroupTouched(this.addWorkContract);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      control.updateValueAndValidity();
    });
  }

  contractDatatablecode() {
    this.contractDatatableparameter.searchVendorName = this.searchContract.get('searchVendorName').value;
    this.contractDatatableparameter.searchContractCode = this.searchContract.get('searchContractCode').value;

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
      columns: [
        { data: 'dummy' }, // first blank column
        { data: 'vendor_id' },
        { data: 'contract_code' },
        { data: 'contract_description' },
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
          ...this.contractDatatableparameter,
          order_column: orderColumnIndex,
          order_dir: orderDir,
          order_column_name: orderColumnName
        };


        that.http.post<DataTablesResponse>(environment.APIEndpoint + 'project_work_contract.fetchWokrContract&reload=1',params, { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {

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

  reload() {
    this.dtElement.forEach((item) => {
      if (item.dtInstance) {
        item.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.ajax.reload();
        });
      }
    });
  }

  ViewContractDetail(type, contract_id) {
    let formData = new FormData();

    type == 'View_Contract' ? this.addWorkContract.disable() : this.addWorkContract.enable();
    formData.append('contract_id', contract_id);
    this.projectservice.fetchWokrContractData(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.addWorkContract.patchValue({
        contract_id: resp.data[0].contract_id,
        vendor_name: resp.data[0].vendor_id,
        contract_code: resp.data[0].contract_code,
        contract_description: resp.data[0].contract_description,
      });
    });
  }

  removeContract(contract_id) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the contract.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes !',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        let formData = new FormData();
        formData.append('contract_id', contract_id);

        this.projectservice.removeContractData(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
          console.log(resp);

          if (resp === true || resp?.success) {
            Swal.fire({
              title: 'Deleted!',
              text: 'The contract has been deleted successfully.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            }).then(() => {
              this.reload();
            });
          } else {
            Swal.fire({
              title: 'Error!',
              text: 'Failed to delete the contract. Please try again.',
              icon: 'error'
            });
          }
        });
      }
    });
  }

  resetSearch() {
    this.searchContract.get('searchVendorName').setValue('');
    this.searchContract.get('searchContractCode').setValue('');
    this.contractDatatablecode();
    this.reload();
  }


  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();

    this.destroy$.next();
    this.destroy$.complete();

    if (this.dtElement && this.dtElement.dtInstance) {
      this.dtElement.dtInstance.then(dt => dt.destroy());
    }

  }

}
