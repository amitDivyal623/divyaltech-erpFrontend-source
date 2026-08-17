import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, OnInit, OnDestroy, ViewChild, ViewChildren } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ContractorService } from 'src/app/services/contractor.service';
import { ProjectService } from 'src/app/services/project.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';


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
  selector: 'app-account-contractor-details',
  templateUrl: './account-contractor-details.component.html',
  styleUrls: ['./account-contractor-details.component.scss']
})
export class AccountContractorDetailsComponent implements OnInit, OnDestroy {
  respcontractor: any;
  isButtonDisabled: any;
  contractForm: any;
  contractCreditForm: any;
  contractDebitForm: any;
  private destroy$ = new Subject<void>();
  projectLists = [];
  isSaving = false;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  dtOptions1: DataTables.Settings = {};
  dtTrigger1: Subject<any> = new Subject<any>();
  dtOptions2: DataTables.Settings = {};
  dtTrigger2: Subject<any> = new Subject<any>();
  contractorCreditData: any[];
  contractorDebitData: any[];
  contractorWorkDetailsData: any[];
  @ViewChildren(DataTableDirective) dtElement: any;
  @ViewChild('closebutton') closebutton!: ElementRef<HTMLButtonElement>;
  @ViewChild('Creditclosebutton') Creditclosebutton!: ElementRef<HTMLButtonElement>;

  isViewMode: boolean = false;
  contractorTransForm: any;
  isLedgerEnabled = false;


  conCreditDatatableParameter: {}
  conDebitDatatableParameter: {}
  conWorkContractDatatableParameter: {}

  constructor(private fb: FormBuilder, private router: Router, private contractorService: ContractorService, private ProjectService: ProjectService, private http: HttpClient, private datePipe: DatePipe) {
    this.conCreditDatatableParameter = {}
    this.conDebitDatatableParameter = {}
    this.conWorkContractDatatableParameter = {}
  }

  ngOnInit(): void {
    this.contractForm = this.fb.group({
      contract_id: [''],
      contractor_name: ['', Validators.required],
      contact_no: [''],
      contract_date: ['', Validators.required],
      contract_name: [''],
      work_type: ['', Validators.required],
      project_name: ['', Validators.required],
      contract_description: [''],
      workDetails: this.fb.array([])
    });

    this.contractCreditForm = this.fb.group({
      credit_date: [''],
      contractor_name: [''],
      remarks: [''],
      credit_amount: ['']
    });

    this.contractDebitForm = this.fb.group({
      debit_date: [''],
      contractor_name: [''],
      payment_mode: [''],
      cheque_no: [''],
      debit_amount: [''],
      description: ['']
    });

    this.contractorTransForm = this.fb.group({
      from_date: [''],
      to_date: [''],
      contractor_name: [''],
      total_credit: [{ value: '', disabled: true }],
      total_debit: [{ value: '', disabled: true }],
      balance: [{ value: '', disabled: true }],
      overall_balance: [{ value: '', disabled: true }]
    });


    this.getContractorsLists();
    this.getProjectsLists();
    this.contractorCreditDatatablecode();
    this.contractorDebitDatatablecode();
    this.contractorWorkContractDatatablecode();

    this.contractorTransForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(val => {
      this.isLedgerEnabled = !!(val.from_date && val.to_date);
    });

  }

  getProjectsLists() {
    let formData = new FormData();
    this.ProjectService.getAllProjectsLists(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.projectLists = resp.data;
    });
  }

  getContractorsLists() {
    let formData = new FormData();

    this.contractorService.getContractorsLists(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.respcontractor = resp;
    })
  }

  onContractorSelect(event: any) {
    const contractorId = event.target.value;
    let formData = new FormData();

    formData.append('contractorId', contractorId);

    this.contractorService
      .onContractorSelect(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe(resp => {
        const mobile = resp.DATA[0][0];

        const contactCtrl = this.contractForm.get('contact_no');

        // Set value
        contactCtrl?.setValue(mobile);

        // Disable after setting
        contactCtrl?.disable();
      });
  }

  onContractorSelectTogetTotalCount() {
    const contractor_id = this.contractorTransForm.get('contractor_name')?.value;

    if (!contractor_id) return; // safety check

    const formData = new FormData();

    const from = this.contractorTransForm.get('from_date')?.value;
    const to = this.contractorTransForm.get('to_date')?.value;

    if (from) formData.append('from', from);
    if (to) formData.append('to', to);

    formData.append('contractor_id', contractor_id);

    this.contractorService.onContractorSelectTogetTotalCount(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe(resp => {
        this.contractorTransForm.patchValue({
          total_credit: resp.TOTAL_CREDIT,
          total_debit: resp.TOTAL_DEBIT,
          balance: resp.BALANCE,
          overall_balance: resp.OVERALL_BALANCE,
        });
      });
  }
  resetContractorTransForm() {
    this.contractorTransForm.reset({
      from_date: '',
      to_date: '',
      contractor_name: '',
      total_credit: '',
      total_debit: '',
      balance: ''
    });
  }



  ngAfterViewInit(): void {
    this.dtTrigger.next();
    this.dtTrigger1.next();
    this.dtTrigger2.next();

  }


  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.dtTrigger1.unsubscribe();
    this.dtTrigger2.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();

    if (this.dtElement && this.dtElement.dtInstance) {
      this.dtElement.dtInstance.then(dt => dt.destroy());
    }
  }

  get workDetails() {
    return this.contractForm.get('workDetails') as FormArray;
  }

  addWorkRow() {
    this.workDetails.insert(0, this.createWorkDetailRow());
  }



  removeWorkRow(index: number) {
    const row = this.workDetails.at(index);
    if (row.get('credit_created')?.value === 1) {
      return; // safety guard
    }
    this.workDetails.removeAt(index);
  }


  addContractData() {

    // prevent double click
    if (this.isSaving) {
      return;
    }

    /* ================= VALIDATION (UNCHANGED) ================= */
    if (this.contractForm.invalid) {

      this.contractForm.markAllAsTouched();

      let errorMsg = '';

      if (this.contractForm.get('contractor_name')?.hasError('required')) {
        errorMsg += '• Contractor Name is required<br>';
      }
      if (this.contractForm.get('contract_date')?.hasError('required')) {
        errorMsg += '• Contract Date is required<br>';
      }
      if (this.contractForm.get('work_type')?.hasError('required')) {
        errorMsg += '• Work Type is required<br>';
      }
      if (this.contractForm.get('project_name')?.hasError('required')) {
        errorMsg += '• Project Name is required<br>';
      }

      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        html: errorMsg
      });

      return; // STOP here if validation fails
    }

    /* ================= WORK DETAIL DATE VALIDATION ================= */

    const workDetailsArray = this.contractForm.get('workDetails') as FormArray;

    let workDetailErrorMsg = '';

    workDetailsArray.controls.forEach((control: AbstractControl, index: number) => {

      const creditDateControl = control.get('credit_date');

      if (!creditDateControl?.value) {
        creditDateControl?.markAsTouched();
        workDetailErrorMsg += `• Work Detail Row ${index + 1} - Date is required<br>`;
      }

    });

    if (workDetailErrorMsg) {
      Swal.fire({
        icon: 'warning',
        title: 'Work Detail Validation Error',
        html: workDetailErrorMsg
      });
      return;
    }



    /* ================= CONFIRMATION (NEW) ================= */
    Swal.fire({
      icon: 'warning',
      title: 'Confirmation Required',
      html: `
      Please confirm that you have reviewed the selected work details.<br><br>
      <b>Once a work detail is checked and saved, it cannot be unchecked or modified again.</b>
    `,
      showCancelButton: true,
      confirmButtonText: 'Confirm & Save',
      cancelButtonText: 'Review Again',
      reverseButtons: true
    }).then((result) => {

      if (!result.isConfirmed) {
        return; // user chose to review again
      }

      /* ================= SAVE LOGIC (UNCHANGED) ================= */
      this.isSaving = true; // lock button

      const formValue = this.contractForm.getRawValue();
      const formData = new FormData();

      if (formValue.contract_id) {
        formData.append('contract_id', formValue.contract_id);
      }

      formData.append('contractor_name', formValue.contractor_name);
      formData.append('contact_no', formValue.contact_no);
      formData.append('contract_date', formValue.contract_date);
      formData.append('contract_name', formValue.contract_name);
      formData.append('work_type', formValue.work_type);
      formData.append('project_name', formValue.project_name);
      formData.append('contract_description', formValue.contract_description);
      formData.append('work_details', JSON.stringify(formValue.workDetails));

      this.contractorService.addWorkContract(formData).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {

          Swal.fire({
            icon: 'success',
            title: 'Saved Successfully',
            timer: 1200,
            showConfirmButton: false
          }).then(() => {

            this.closebutton.nativeElement.click();
            this.reload('contractor-work-contract');
            this.reload('contractor-credit');
          });
        },

        error: () => {
          Swal.fire({
            icon: 'error',
            title: 'Something went wrong'
          });
        },
        complete: () => {
          this.isSaving = false; // unlock button
        }
      });
    });
  }


  onCancelContract() {
    this.contractForm.reset();

    // clear all work rows
    const workArray = this.contractForm.get('workDetails') as FormArray;
    workArray.clear();

    // optionally add one empty row again
    // this.addWorkRow();
  }

  onCancelCredit() {
    this.contractCreditForm.reset();
    this.Creditclosebutton.nativeElement.click();
  }


  contractorCreditDatatablecode() {
    this.conCreditDatatableParameter = ""

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
      ajax: (dataTablesParameters: any, callback) => {
        that.http.post<DataTablesResponse>(environment.APIEndpoint + 'contractor.fetchContractorCreditData&reload=1', Object.assign(dataTablesParameters, this.conCreditDatatableParameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {
          that.contractorCreditData = resp.data;

          callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsTotal,
            data: []
          });
        });
      }
    }
  }

  contractorDebitDatatablecode() {
    this.conDebitDatatableParameter = "";

    const that = this;
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });
    this.dtOptions1 = {
      processing: true,
      serverSide: true,
      pageLength: 10,
      dom: 'lrtip',
      lengthMenu: [[5, 10, 25, 50, 300], [5, 10, 25, 50, 300]],
      columnDefs: [
        { orderable: false, targets: 5 },
      ],
      ajax: (dataTablesParameters: any, callback) => {
        that.http.post<DataTablesResponse>(environment.APIEndpoint + 'contractor.fetchContractorDebitData&reload=1', Object.assign(dataTablesParameters, this.conDebitDatatableParameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {
          that.contractorDebitData = resp.data;

          callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsTotal,
            data: []
          });
        });
      }
    }
  }


  contractorWorkContractDatatablecode() {
    this.conWorkContractDatatableParameter = "";

    const that = this;
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });
    this.dtOptions2 = {
      processing: true,
      serverSide: true,
      pageLength: 10,
      dom: 'lrtip',
      lengthMenu: [[5, 10, 25, 50, 300], [5, 10, 25, 50, 300]],
      columnDefs: [
        { orderable: false, targets: 5 },
      ],
      ajax: (dataTablesParameters: any, callback) => {
        that.http.post<DataTablesResponse>(environment.APIEndpoint + 'contractor.fetchContractorWorkDetails&reload=1', Object.assign(dataTablesParameters, this.conWorkContractDatatableParameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {
          that.contractorWorkDetailsData = resp.data;

          callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsTotal,
            data: []
          });
        });
      }
    }
  }



  viewConWorkDt(contract_id: string, mode: 'view' | 'edit') {

    this.isViewMode = (mode === 'view');

    const formData = new FormData();
    formData.append('contract_id', contract_id);

    this.contractorService
      .getContractWorkDtByid(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe(resp => {
        console.log(resp);
        if (!resp || !resp.length) return;

        /* ---------- PATCH HEADER FROM FIRST ROW ---------- */
        const header = resp[0];

        if (this.isViewMode) {
          this.contractForm.disable({ emitEvent: false });
        } else {
          this.contractForm.enable({ emitEvent: false });
        }

        this.contractForm.patchValue({
          contract_id: header.contract_id,
          contractor_name: header.contractor_name,
          contact_no: header.contact_no,
          contract_name: header.contract_name,
          work_type: header.work_type,
          project_name: header.project_name,
          contract_description: header.contract_description,
          contract_date: this.datePipe.transform(header.contract_date, 'yyyy-MM-dd')
        });

        /* ---------- RESET WORK DETAILS ---------- */
        const workArr = this.workDetails;
        workArr.clear();

        /* ---------- BUILD ROWS (1 ROW = 1 DB ROW) ---------- */
        for (const rowData of resp) {

          const row = this.createWorkDetailRow();
          const isCredited = rowData.credit_created == 1;

          row.patchValue({
            work_detail_id: rowData.work_detail_id,
            credit_date: rowData.credit_date
              ? this.datePipe.transform(rowData.credit_date, 'yyyy-MM-dd')
              : '',
            description: rowData.description,
            amount: rowData.amount,
            isChecked: rowData.is_checked == 1,
            credit_created: rowData.credit_created
          });

          if (this.isViewMode) {
            row.disable({ emitEvent: false });
          }

          if (!this.isViewMode && isCredited) {
            row.disable({ emitEvent: false });
          }

          workArr.insert(0, row);

        }
      });
  }


  removeconWorkDt(contract_id: string) {

    Swal.fire({
      title: 'Are you sure?',
      text: 'This action will permanently delete the work details.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {

      if (result.isConfirmed) {

        const formData = new FormData();
        formData.append('contract_id', contract_id);

        this.contractorService
          .removeConWorkDt(formData)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (resp: any) => {

              if (resp === true || resp?.success === true) {

                Swal.fire({
                  icon: 'success',
                  title: 'Deleted!',
                  text: 'Work details have been deleted successfully.',
                  timer: 1500,
                  showConfirmButton: false
                }).then(() => {
                  this.reload('contractor-work-contract'); // reload table
                  this.reload('contractor-credit'); // reload table
                });

              } else {
                Swal.fire('Error', 'Unable to delete work details.', 'error');
              }
            },
            error: () => {
              Swal.fire('Error', 'Something went wrong. Please try again.', 'error');
            }
          });
      }
    });
  }

  reload(tableType: string) {
    if (tableType === 'contractor-credit') {
      this.dtElement.toArray()[0].dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        this.dtTrigger.next(null);
      });
    }
    else if (tableType === 'contractor-debit') {
      this.dtElement.toArray()[1].dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        this.dtTrigger1.next(null);
      });
    }
    else if (tableType === 'contractor-work-contract') {
      this.dtElement.toArray()[2].dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        this.dtTrigger2.next(null);
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


  openAddContractModal() {
    this.resetContractFormForNew();
  }

  resetContractFormForNew(): void {

    /* enable full form */
    this.contractForm.enable({ emitEvent: false });

    /* reset main form */
    this.contractForm.reset();

    /* clear workDetails array */
    const workArr = this.contractForm.get('workDetails') as FormArray;
    while (workArr.length) {
      workArr.removeAt(0);
    }

    /* reset mode flags */
    this.isViewMode = false;
    this.isSaving = false;
  }


  private createWorkDetailRow(): FormGroup {
    return this.fb.group({
      work_detail_id: [null],
      isChecked: [false],
      credit_date: ['', Validators.required],
      description: [''],
      amount: [''],
      credit_created: [0],   // keep for edit logic
      isEditing: [false]
    });
  }

  private clearWorkDetails(): void {
    const arr = this.contractForm.get('workDetails') as FormArray;
    while (arr.length !== 0) {
      arr.removeAt(0);
    }
  }


  openContractorCredit(credit_id) {
    let formData = new FormData();

    formData.append('credit_id', credit_id);

    this.contractorService.getContractCreditById(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      const data = resp[0];

      this.contractCreditForm.patchValue({
        contractor_name: data.contractor_name,
        credit_date: this.datePipe.transform(data.credit_date, 'yyyy-MM-dd'),
        credit_amount: data.credit_amount,
        remarks: data.remarks
      });

      this.contractCreditForm.disable();
    })
  }

  openContractorDebit(debit_id) {
    let formData = new FormData();

    formData.append('debit_id', debit_id);

    this.contractorService.getContractDebitById(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      const data = resp[0];

      this.contractDebitForm.patchValue({
        contractor_name: data.contractor_name,
        debit_date: this.datePipe.transform(data.debit_date, 'yyyy-MM-dd'),
        payment_mode: data.payment_mode,
        cheque_no: data.cheque_no,
        debit_amount: data.debit_amount,
        description: data.description
      });

      this.contractDebitForm.disable();
    });
  }


  redirectToTransaction(credit_id) {

    const startTime = Date.now();   // track when loader starts

    // Show loader immediately
    Swal.fire({
      title: 'Please wait',
      text: 'Redirecting to Transaction Page for Contractor Payment...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    let formData = new FormData();
    formData.append('credit_id', credit_id);

    this.contractorService.getContractCreditById(formData).pipe(takeUntil(this.destroy$)).subscribe(
      resp => {

        const data = resp[0];
        const contractor_name = data.contractor_name;
        const credit_amount = data.credit_amount;
        const credit_date = data.credit_date;
        const remarks = data.remarks;

        const elapsed = Date.now() - startTime;
        const remaining = 3000 - elapsed;   // ensure at least 3 seconds

        setTimeout(() => {

          Swal.close();

          this.router.navigate(
            ['/reg-trans-list'],
            {
              queryParams: {
                tab: 'expense',
                openModal: 'add',
                contractor_name: contractor_name,
                credit_amount: credit_amount,
                credit_date: credit_date,
                remarks: remarks
              }
            }
          );

        }, remaining > 0 ? remaining : 0);
      },
      error => {
        Swal.close();
        Swal.fire('Error', 'Failed to load GRN details', 'error');
      }
    );
  }


  openLedger() {
    const fromDate = this.contractorTransForm.get('from_date')?.value;
    const toDate = this.contractorTransForm.get('to_date')?.value;
    const contractorName = this.contractorTransForm.get('contractor_name')?.value;

    // 3️⃣ Date range validation
    if (new Date(toDate) < new Date(fromDate)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Date Range',
        text: 'To Date cannot be earlier than From Date.',
        confirmButtonText: 'OK'
      });
      return;
    }

    const loaderStartTime = Date.now();

    Swal.fire({
      title: 'Please wait',
      text: 'Fetching Contractor ledger...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading()
    });

    const formData = new FormData();
    formData.append('from_date', fromDate);
    formData.append('to_date', toDate);
    formData.append('contractor_name', contractorName);

    this.contractorService.getContractorLedger(formData).pipe(takeUntil(this.destroy$)).subscribe(
      {
        next: (resp) => {
          const elapsed = Date.now() - loaderStartTime;
          const remaining = Math.max(3000 - elapsed, 0);
          const contractorDisplayName = resp.ledger?.[0]?.contractor_name || 'Contractor';
          setTimeout(() => {

            if (!resp || !resp.ledger || resp.ledger.length === 0) {
              Swal.close();
              Swal.fire({
                icon: 'info',
                title: 'No Data Available',
                text: `No ledger data available for vendor "${contractorDisplayName}" for the selected date range.`
              });
              return;
            }


            Swal.close();

            const ledgerData = this.buildContractorLedger(resp.ledger);

            const ledgerWindow = window.open('', '_blank');
            ledgerWindow!.document.write(
              this.generateContractorLedgerHTML(
                ledgerData,
                contractorDisplayName,
                fromDate,
                toDate,
                resp.opening_balance
              )
            );
            ledgerWindow!.document.close();


          }, remaining);
        },

        error: () => {
          Swal.close();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load vendor ledger. Please try again.'
          });
        }
      });
  }


  private buildContractorLedger(rawList: any[]) {

    const map = new Map<string, any>();

    let grandCredit = 0;
    let grandDebit = 0;
    let location = '';

    rawList.forEach(txn => {

      if (!location && txn.location) {
        location = txn.location;
      }

      const date = new Date(txn.txn_date).toLocaleDateString('en-GB');

      if (!map.has(date)) {
        map.set(date, {
          date,
          credits: [],
          debits: [],
          creditTotal: 0,
          debitTotal: 0
        });
      }

      const day = map.get(date);
      const amount = this.toNumber(txn.txn_amount);

      /* CREDIT → Work / Bill Raised */
      if (txn.entry_type?.toLowerCase() === 'credit' && amount > 0) {

        day.credits.push({
          project_name: txn.project_name || '-',
          description: txn.txn_description || '-',   // ✅ already present
          amount
        });

        day.creditTotal += amount;
        grandCredit += amount;
      }

      /* DEBIT → Payment Made */
      if (txn.entry_type?.toLowerCase() === 'debit' && amount > 0) {

        day.debits.push({
          payment_mode: txn.payment_mode || 'Cash',
          cheque_no: txn.cheque_no || '',
          description: txn.txn_description || '-',   // ✅ ADDED
          amount
        });

        day.debitTotal += amount;
        grandDebit += amount;
      }
    });

    return {
      location,
      days: Array.from(map.values()),
      grandCredit,
      grandDebit,
      balance: grandCredit - grandDebit
    };
  }



  private toNumber(value: any): number {
    if (value === null || value === undefined || value === '') return 0;
    return Number(String(value).replace(/,/g, '')) || 0;
  }

  private generateContractorLedgerHTML(data: any, contractor: string, from: string, to: string, openingBalance: number): string {

    const inr = (val: number) =>
      `₹ ${Number(val || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Contractor Ledger</title>

      <style>
        body { font-family: Arial; font-size: 11px; margin: 12px; }
        h2 { margin-bottom: 4px; }
        .download-btn {
          position: absolute; right: 12px; top: 12px;
          padding: 6px 12px; background: #1976d2; color: #fff; border: none;
        }
        table { width: 100%; border-collapse: collapse; font-size: 10.5px; }
        th, td { border: 1px solid #000; padding: 3px; }
        th { background: #eee; }
        .right { text-align: right; }
        .total { font-weight: bold; }
        .date-box { border: 1.5px solid #000; margin-bottom: 10px; padding: 6px; }
        @media print { .download-btn { display: none; } }
      </style>
    </head>

    <body>

    <button class="download-btn" onclick="window.print()">Download PDF</button>

    <h2>Contractor Ledger</h2>
    <div><b>Contractor:</b> ${contractor}</div>
    <div><b>Location:</b> ${data.location || '-'}</div>
    <div><b>Period:</b> ${from} to ${to}</div>
    <div><b>Opening Balance:</b> ${inr(openingBalance)}</div>

    <br>

    ${data.days.map((day: any) => `
    <div class="date-box">
      <div class="date-title"><b>Date :</b> ${day.date}</div>

      <div style="display:flex; gap:8px;">

        <!-- CREDIT TABLE -->
        <div style="flex:1;">
          <table>
            <tr>
              <th colspan="3">CREDIT (Work / Bill)</th>
            </tr>
            <tr>
              <th>Project</th>
              <th>Description</th>
              <th>Amount (₹)</th>
            </tr>

            ${day.credits.map((c: any) => `
              <tr>
                <td>${c.project_name}</td>
                <td>${c.description}</td>
                <td class="right">${inr(c.amount)}</td>
              </tr>
            `).join('')}

            <tr class="total">
              <td colspan="2">Total Credit</td>
              <td class="right">${inr(day.creditTotal)}</td>
            </tr>
          </table>
        </div>

        <!-- DEBIT TABLE -->
        <div style="flex:1;">
          <table>
            <tr>
              <th colspan="3">DEBIT (Payment)</th>
            </tr>
            <tr>
              <th>Mode</th>
              <th>Description</th>
              <th>Amount (₹)</th>
            </tr>

            ${day.debits.map((d: any) => `
              <tr>
                <td>${d.cheque_no ? `Cheque / ${d.cheque_no}` : d.payment_mode}</td>
                <td>${d.description || '-'}</td>
                <td class="right">${inr(d.amount)}</td>
              </tr>
            `).join('')}

            <tr class="total">
              <td colspan="2">Total Debit</td>
              <td class="right">${inr(day.debitTotal)}</td>
            </tr>
          </table>
        </div>

      </div>
    </div>
    `).join('')}


    <hr>

    <table>
      <tr><td>Opening Balance</td><td class="right">${inr(openingBalance)}</td></tr>
      <tr><td>Total Credit</td><td class="right">${inr(data.grandCredit)}</td></tr>
      <tr><td>Total Debit</td><td class="right">${inr(data.grandDebit)}</td></tr>
      <tr class="total">
        <td>Closing Balance</td>
        <td class="right">${inr(openingBalance + data.grandCredit - data.grandDebit)}</td>
      </tr>
    </table>

    </body>
    </html>
    `;
  }


  toggleRowEdit(index: number) {
    const row = this.workDetails.at(index);
    const editing = !row.get('isEditing')?.value;
    row.patchValue({ isEditing: editing });

    if (editing) {
      row.get('credit_date')?.enable();
      row.get('description')?.enable();
      row.get('amount')?.enable();
    } else {
      row.get('credit_date')?.disable();
      row.get('description')?.disable();
      row.get('amount')?.disable();
    }
  }





}
