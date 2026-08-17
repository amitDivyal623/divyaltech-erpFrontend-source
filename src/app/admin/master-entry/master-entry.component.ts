import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef, OnDestroy, ElementRef } from '@angular/core';
import { from, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { StringLiteralLike } from 'typescript';
import { DataTableDirective } from 'angular-datatables';
import { environment } from 'src/environments/environment';


class MasterEntry {
  CompanyId: string;
  LookupDataId: string;
  LookupTypeId: string;
  LookupValue: string;
  LookupShortName: string;
  Status: string;
  CreatedBy: string;
  CreatedDt: string;
  UpdatedBy: string;
  UpdatedDt: string;
}

class DataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}

@Component({
  selector: 'app-master-entry',
  templateUrl: './master-entry.component.html',
  styleUrls: ['./master-entry.component.css']
})
export class MasterEntryComponent implements OnInit, OnDestroy {
  dtOptions: DataTables.Settings = {};
  isButtonDisabled: boolean = false;
  dtTrigger: Subject<any> = new Subject<any>();
  private destroy$ = new Subject<void>();
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  @ViewChild('closebutton') closebutton;
  @ViewChild('editCloseBtn') editCloseBtn: ElementRef;
  DatatableParameter = { HeadNames: '' };
  mode: 'view' | 'edit' = 'edit';

  dataa: MasterEntry[];
  myBooks: string[];
  modal: any;
  addLookUpData = new FormGroup({
    txtheadname: new FormControl('', Validators.required),
    txtlookupvalue: new FormControl('', Validators.required),
    txtlookupshortname: new FormControl('', Validators.required),
    txtstatus: new FormControl('')
  });
  editLookUpData = new FormGroup({
    txtheadname: new FormControl('', Validators.required),
    txtlookupvalue: new FormControl('', Validators.required),
    txtlookupshortname: new FormControl('', Validators.required),
    LookupDataId: new FormControl(''),
    txtstatus: new FormControl('')
  });
  searchLookupData = new FormGroup({
    HeadName: new FormControl('', Validators.required)
  });

  constructor(private router: Router, private http: HttpClient, private adminservice: AdminService, private chRef: ChangeDetectorRef) { }
  ngOnInit() {
    this.datatableCode();
    //this.types$ = this.getTypeT();
    let LookUpData = new FormData();

    const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });
    this.adminservice.fetchLookUpTypeList(LookUpData).pipe(takeUntil(this.destroy$)).subscribe(
      data => {
        var res = data.data
        this.myBooks = res as string[];		// FILL THE ARRAY WITH DATA.
      },

    );
  }
  datatableCode() {
    this.DatatableParameter.HeadNames = this.searchLookupData.get('HeadName').value;
    const that = this;
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });
    this.dtOptions = {
      processing: true,
      serverSide: true,
      dom: 'lrtip',
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
      columnDefs: [
        { orderable: false, targets: 0 }
      ],
      ajax: (dataTablesParameters: any, callback) => {
        Object.assign(dataTablesParameters, this.DatatableParameter);
        that.http.post<DataTablesResponse>(environment.APIEndpoint + 'admin.fetch_lookupData&reload=1', Object.assign(dataTablesParameters, this.DatatableParameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {
          that.dataa = resp.data;
          callback({ recordsTotal: resp.recordsTotal, recordsFiltered: resp.recordsTotal, data: [] });
        });
      }
    };
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
  public closeModal() {
    this.closebutton.nativeElement.click();
  }
  redirect(link) {
    this.router.navigate(['/' + link]);
  }
  fetchTaskList() {
    this.adminservice.fetchLookUpDataList().pipe(takeUntil(this.destroy$)).subscribe(Response => { });
  }


  getitem(LookupDataId: string, mode: 'view' | 'edit') {
    this.mode = mode;
    this.editLookUpData.enable();

    let LookUpData = new FormData();
    LookUpData.append('LookupDataId', LookupDataId);
    // const headers = new HttpHeaders({ 'Content-Type': 'text/plain'});
    this.adminservice.fetchLookUpDataByID(LookUpData).pipe(takeUntil(this.destroy$)).subscribe(Response => {
      if (Response.data.length) {
        this.editLookUpData.patchValue({
          txtheadname: Response.data[0].LookupTypeId,
          txtlookupvalue: Response.data[0].LookupValue,
          txtlookupshortname: Response.data[0].LookupShortName,
          LookupDataId: Response.data[0].LookupDataId,
          txtstatus: Response.data[0].Status == 1
        });
        if (this.mode === 'view') {
          this.editLookUpData.disable();
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Item Creation Failed',
          showConfirmButton: false,
          timer: 3000
        });
      }
    });
  }

  LookupSearch() {
    this.datatableCode();
    this.rerender();
  }

  LookupReset() {
    this.searchLookupData.get('HeadName').setValue('');
    this.datatableCode();
    this.rerender();
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  insertLookUpData() {
    this.isButtonDisabled = false;
    if (this.addLookUpData.valid) {
      this.isButtonDisabled = true;

      let LookUpData = new FormData();
      LookUpData.append('LookupTypeId', this.addLookUpData.get('txtheadname').value);
      LookUpData.append('LookupValue', this.addLookUpData.get('txtlookupvalue').value);
      LookUpData.append('LookupShortName', this.addLookUpData.get('txtlookupshortname').value);
      if (this.addLookUpData.get('txtstatus').value == 'true' && this.addLookUpData.get('txtstatus').value != '')
        LookUpData.append('Status', '1');
      else
        LookUpData.append('Status', '0');
      this.adminservice.addLookupData(LookUpData).pipe(takeUntil(this.destroy$)).subscribe(Response => {
        if (Response.CODE == 200) {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: Response.MESSAGE,
            showConfirmButton: false,
            timer: 2000
          });
          this.reload();
          this.addLookUpData.reset();
          this.closeModal();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Task Creation Failed',
            showConfirmButton: false,
            timer: 3000
          });
        }
      });
    } else {
      this.isButtonDisabled = false;

      Swal.fire('Alert', 'Fill all required fields first', 'info');
    }
  }
  updateLookUpData() {
    if (this.editLookUpData.valid) {
      let LookUpData = new FormData();
      LookUpData.append('LookupDataId', this.editLookUpData.get('LookupDataId').value);
      LookUpData.append('LookupTypeId', this.editLookUpData.get('txtheadname').value);
      LookUpData.append('LookupValue', this.editLookUpData.get('txtlookupvalue').value);
      LookUpData.append('LookupShortName', this.editLookUpData.get('txtlookupshortname').value);
      if (this.editLookUpData.get('txtstatus').value == 'true' && this.editLookUpData.get('txtstatus').value != '')
        LookUpData.append('Status', '1');
      else
        LookUpData.append('Status', '0');
      this.adminservice.updateLookUpData(LookUpData).pipe(takeUntil(this.destroy$)).subscribe(Response => {
        if (Response.CODE == 200) {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: Response.MESSAGE,
            showConfirmButton: false,
            timer: 2000
          });
          this.reload();
          this.editLookUpData.reset();
          this.editCloseBtn.nativeElement.click();

        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Task Creation Failed',
            showConfirmButton: false,
            timer: 3000
          });
        }
      });
    } else {
      Swal.fire('Alert', 'Fill all required fields first', 'info');
    }
  }
  deletlookupData(id) {
    let removeLookupData = new FormData();
    removeLookupData.append('lookupdataid', id);
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'

    }).then((result) => {
      if (result.value) {

        this.adminservice.deleteitem(removeLookupData).pipe(takeUntil(this.destroy$)).subscribe(response => {

          if (response) {
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: response.MESSAGE,
              showConfirmButton: false,
              timer: 2000
            });
            this.reload();
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: 'item Delete Failed',
              showConfirmButton: false,
              timer: 3000
            });
          }
        });
      }
    })
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
    });
  }
  reload() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }
  lookupFormreset() {
    this.addLookUpData.reset();
    this.isButtonDisabled = false;
  }

}
