import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, OnDestroy, QueryList, ViewChildren, ViewChild, Injectable,NgModule } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { FormBuilder, FormGroup, Validators,ReactiveFormsModule,FormsModule, FormControl  } from '@angular/forms';
import { NgbDateAdapter, NgbDateParserFormatter, NgbDateStruct, NgbInputDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { BillingService } from 'src/app/services/billing.service';
import { HrService } from 'src/app/services/hr.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';



class DataTablesResponse {
	data: any[]; 
	draw: number;
	recordsFiltered: number;
	recordsTotal: number;
}
@Component({
  selector: 'app-account-bank-accounts',
  templateUrl: './account-bank-accounts.component.html',
  styleUrls: ['./account-bank-accounts.component.scss']
})
export class AccountBankAccountsComponent implements OnInit, OnDestroy {

  paymentDatatableParameter: { id: any; };
  id: any = '';
  resplookupBank: any;
  dtOptions: DataTables.Settings = {};


  DatatableParameter = { BankCategory:'',BankCategoryName:''};



  dtTrigger: Subject<any> = new Subject<any>();
  private destroy$ = new Subject<void>();
 
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  @ViewChildren('closebutton') closebutton;

  isView: boolean;
  modalTitle: string;
  submit_btn: boolean = false;
  paymentplan: any[];
  customerID: string;
  prsn_id: string;
  type: string;

  constructor(private Activatedroute: ActivatedRoute,private hrservice: HrService,private fb: FormBuilder,private billingservice: BillingService,public http: HttpClient) {
    this.paymentDatatableParameter = { id: '' };  

  }

  bankformGroup = new FormGroup({
    bankCategory: new FormControl('', [Validators.required]),
    bankCatName: new FormControl('', [Validators.required]),
    bankName: new FormControl('', [Validators.required]),
    bankAccNo: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d{10,18}$/), 
    ]),
    bankIfsc: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/) 
    ]),

    bankBranchAdd: new FormControl('', [Validators.required]),
    accountId: new FormControl(''),
  });

  ngOnInit(): void {
 
    this.id = this.Activatedroute.snapshot.paramMap.get('customerID');
    this.lookupdatalist();
      
    const storedCategory = sessionStorage.getItem('BankCategory');
    const storedCategoryName = sessionStorage.getItem('BankCategoryName');
    if (storedCategory || storedCategoryName) {
      this.bankformGroup.get('bankCategory').setValue(storedCategory || '');
      this.bankformGroup.get('bankCatName').setValue(storedCategoryName || '');
    }  
    this.datatablecode();

  }


  public preventClose(event: MouseEvent) {


  }

  public closeModal() {

    this.bankformGroup.reset();
    this.closebutton.forEach(item => {
      item.nativeElement.click()
    });
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();

    // var tst = this.datatable_directive.toArray()[4].dtOptions;
   
  }



  submitBankDetails(){
    let bankDetaildata = new FormData();

    
    this.submit_btn = true;
    if(this.bankformGroup.valid){

      bankDetaildata.append('bankCategory', this.bankformGroup.value.bankCategory);
      bankDetaildata.append('bankCatName', this.bankformGroup.value.bankCatName);
      bankDetaildata.append('bankName', this.bankformGroup.value.bankName);
      bankDetaildata.append('bankIfsc', this.bankformGroup.value.bankIfsc);
      bankDetaildata.append('bankAccNo', this.bankformGroup.value.bankAccNo);
      bankDetaildata.append('bankBranchAdd', this.bankformGroup.value.bankBranchAdd);
  
      
      this.billingservice.add_bankDetailsdata(bankDetaildata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
  
       
  
        if(Response) {
            Swal.fire({
                icon:'success',
                title:'Successfully Added!',
                text:Response.MESSAGE,
                showConfirmButton:false,
                timer:2000
            });
            this.bankformGroup.reset();
            this.reload();
            this.closeModal();
        }
        else{
          Swal.fire({
            icon:'error',
            title:'Error!',
            text:'Bank account Creation Failed',
            showConfirmButton:false,
            timer:3000
          });
        }
      })
    }else{
      this.submit_btn = true; 
      Swal.fire("Some Fields are Missing!")
    }



  }

  edit_submitBankDetails(){

   
    let bankDetaildata = new FormData();
    
    bankDetaildata.append('bankCategory', this.bankformGroup.value.bankCategory);
    bankDetaildata.append('bankCatName', this.bankformGroup.value.bankCatName);
    bankDetaildata.append('bankName', this.bankformGroup.value.bankName);
    bankDetaildata.append('bankIfsc', this.bankformGroup.value.bankIfsc);
    bankDetaildata.append('bankAccNo', this.bankformGroup.value.bankAccNo);
    bankDetaildata.append('bankBranchAdd', this.bankformGroup.value.bankBranchAdd);
    bankDetaildata.append('accountsId', this.bankformGroup.value.accountId);

    this.billingservice.edit_bankDetailsdata(bankDetaildata).pipe(takeUntil(this.destroy$)).subscribe(Response => {

      
      if(Response) {
          Swal.fire({
              icon:'success',
              title:'Successfully Added!',
              text:Response.MESSAGE,
              showConfirmButton:false,
              timer:2000
          });
          this.bankformGroup.reset();
          this.reload();
          this.closeModal();
      }
      else{
        Swal.fire({
          icon:'error',
          title:'Error!',
          text:'Bank account Creation Failed',
          showConfirmButton:false,
          timer:3000
        });
      }
    })


  }

  
  lookupdatalist(){

    let lookupBank = "Bank";
    let bankdata = new FormData();
    bankdata.append('lookupname', lookupBank);
    this.hrservice.fetch_lookupdata(bankdata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
      this.resplookupBank = Response.data
    });
  }



  datatablecode(){
    
    this.DatatableParameter.BankCategory = this.bankformGroup.get('bankCategory').value;
    this.DatatableParameter.BankCategoryName = this.bankformGroup.get('bankCatName').value;
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


        
        Object.assign(dataTablesParameters,this.DatatableParameter);
        that.http.post<DataTablesResponse>(environment.APIEndpoint + 'accounts.fetch_bankAccounts&reload=1', Object.assign(dataTablesParameters,this.DatatableParameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {
          console.log(resp);

          that.paymentplan = resp.data;

             
          callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsFiltered,
            data: []
          });

        
        });
      }

    }
  }


  registrySearch() {
    const category = this.bankformGroup.get('bankCategory').value;
    const categoryName = this.bankformGroup.get('bankCatName').value;
  
    sessionStorage.setItem('BankCategory', category);
    sessionStorage.setItem('BankCategoryName', categoryName);
  
    this.datatablecode();
    this.rerender();
  }

  resetSearch(){
    this.bankformGroup.reset();
    this.bankformGroup.get('bankCategory').setValue('');
    this.bankformGroup.get('bankCatName').setValue('');  
    
    sessionStorage.removeItem('BankCategory');
    sessionStorage.removeItem('BankCategoryName');
  
    this.datatablecode();
    this.rerender();
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        this.dtTrigger.next();
    });
  }

  reload() {
    
    // this.dtElement.forEach(item =>
    //   Object.keys(item.dtInstance).length ?
    //     item.dtInstance.then((dtInstance: DataTables.Api) => {
    //       dtInstance.ajax.reload();
    //     }) : ''

    // );
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }


  resetformbutton(){
    this.bankformGroup.reset();
    // this.reload();
    this.closeModal();
    this.bankformGroup.enable()
  }

  openModalPayPlan(type,id){

  
    this.modalTitle = type;
    this.submit_btn = false;
    this.bankformGroup.reset();
    this.isView = false;
    type.includes('View') ? (this.bankformGroup.disable()) : (this.bankformGroup.enable(), this.isView = true);
    if (id && (type.includes('Edit') || type.includes('View'))) {
      let formData = new FormData();
      formData.append("id", id);
      this.billingservice.viewBankDetails(formData).pipe(takeUntil(this.destroy$)).subscribe((resp) => {

        this.bankformGroup.patchValue({
          bankCategory: resp.data[0]['bank_category'],
          bankCatName: resp.data[0]['bank_cat_name'],
          bankName: resp.data[0]['bank_name'],
          bankAccNo: resp.data[0]['bank_acc_no'],
          bankIfsc: resp.data[0]['bank_ifsc'],
          bankBranchAdd: resp.data[0]['bank_branch_add'],
          accountId: resp.data[0]['accounts_id'],

        });
      });
    }


  }

  deleteAccounts(accounts_id){
    
    let removeEnquiryData = new FormData();
    removeEnquiryData.append('accounts_id',accounts_id);
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.value) {
        this.billingservice.deleteAccounts(removeEnquiryData).pipe(takeUntil(this.destroy$)).subscribe(Response =>{

          if(Response) {
            Swal.fire({
              icon:'success',
              title:'Success!',
              text:Response.MESSAGE,
              showConfirmButton:false,
              timer:2000
            });
          this.reload();
          }else{
            Swal.fire({
            icon:'error',
            title:'Error!',
            text:'item Delete Failed',
            showConfirmButton:false,
            timer:3000
            });
          }
        });
      }
    })
  }

}
