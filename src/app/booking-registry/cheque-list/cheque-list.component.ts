import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, Injectable, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import{DatePipe,formatDate } from '@angular/common'
import { CrmService } from 'src/app/services/crm.service';
import { HrService } from 'src/app/services/hr.service';
import { environment } from 'src/environments/environment';
import{BillingService} from 'src/app/services/billing.service';
import { NgbDateAdapter, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { MAT_DATE_LOCALE } from '@angular/material/core';

class DataTablesResponse {
  [x: string]: any;
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}
class ChequeManagement {
  add_payername: [];
    add_nameonCheq: [];
    add_amtpaid: [];
    add_payerBank: [];
    add_payeeBank: [];
    add_chequesubmit: [];
    add_chequeCleared: [];
    add_chequeDate: [];
    add_ChequeNumber: [];
    add_BankName: [];
    add_Remark: [];
    add_submittedby: [];
    add_transactiontype: [];
}
@Injectable()
export class CustomAdapter extends NgbDateAdapter<string> {

  readonly DELIMITER = '-';

  fromModel(value: string | null): NgbDateStruct | null {
    if (value) {
      let date = value.split(this.DELIMITER);
      return {
        day : parseInt(date[0], 10),
        month : parseInt(date[1], 10),
        year : parseInt(date[2], 10)
      };
    }
    return null;
  }

  toModel(date: NgbDateStruct | null): string | null {
    return date ? date.day + this.DELIMITER + date.month + this.DELIMITER + date.year : null;
  }
}
@Injectable()
export class CustomDateParserFormatter extends NgbDateParserFormatter {

  readonly DELIMITER = '/';

  parse(value: string): NgbDateStruct | null {
    if (value) {
      let date = value.split(this.DELIMITER);
      return {
        day : parseInt(date[0], 10),
        month : parseInt(date[1], 10),
        year : parseInt(date[2], 10)
      };
    }
    return null;
  }

  format(date: NgbDateStruct | null): string {
    return date ? ("0"+date.day).slice(-2) + this.DELIMITER + ("0"+date.month).slice(-2) + this.DELIMITER + date.year : '';
  }
}
@Component({
  selector: 'app-cheque-list',
  templateUrl: './cheque-list.component.html',
  styleUrls: ['./cheque-list.component.scss'],
  providers: [{provide: NgbDateAdapter, useClass: CustomAdapter},
    {provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter},
    {provide : DatePipe},
    {provide: MAT_DATE_LOCALE, useValue: 'en-GB'}
]
})
export class ChequeListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  status:any;
  [x:string]:any;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  @ViewChild('chequemodal') chequemodal;
  @ViewChild('closebutton') closebutton;
  searchCrmCheque = new FormGroup({
    filter_chequeDate: new FormControl(''),
    filter_chequesubmit: new FormControl(''),
    filter_Remark: new FormControl(''),
    filter_nameonCheq: new FormControl(''),
  });
  DatatableParameter = { filter_chequeDate: '', filter_chequesubmit: '', filter_Remark: '',filter_nameonCheq:''};
  transCond: boolean= false;
	transCond1: boolean= false;
	transCond2: boolean= false;
	transCond3: boolean= false;
  
  addChequeList = new FormGroup({
    transaction_id: new FormControl(''),
    // add_payername: new FormControl('',Validators.required),
    add_nameonCheq: new FormControl('',Validators.required),
    add_amtpaid: new FormControl('',Validators.required),
    // add_payerBank: new FormControl('',Validators.required),
    // add_payeeBank: new FormControl('',Validators.required),
    add_chequesubmit: new FormControl('',Validators.required),
    // add_chequeCleared: new FormControl('',Validators.required),
    add_chequeDate: new FormControl('',Validators.required),
    add_ChequeNumber: new FormControl('',Validators.required),
    // add_BankName: new FormControl('',Validators.required),
    add_Remark: new FormControl('',Validators.required),
    add_submittedby: new FormControl('',Validators.required),
    // add_transactiontype: new FormControl('',Validators.required),
  })
  
  flg: string= "Add";
  PopupTitle: string;
  // DatatableParameter = { };
  data:ChequeManagement[];
  employee: [];
  editdata: [];
  cheque_date:string;
  resplookupBank: [];
  resplookupstatus:any [];
  submitted: boolean;
  constructor(private router:Router,public http:HttpClient,private crmservice: CrmService,private chRef : ChangeDetectorRef,private formBuilder: FormBuilder,private hrservice:HrService,private activatedRoute: ActivatedRoute ,private billingservice :BillingService, private datePipe: DatePipe) { }


  datatableCode() {
    this.DatatableParameter.filter_chequeDate=(<HTMLInputElement>document.getElementById("filter_chequeDate")).value;
    this.DatatableParameter.filter_chequesubmit=(<HTMLInputElement>document.getElementById("filter_chequesubmit")).value;
    this.DatatableParameter.filter_Remark = this.searchCrmCheque.get('filter_Remark').value;
    this.DatatableParameter.filter_nameonCheq = this.searchCrmCheque.get('filter_nameonCheq').value;
    const that = this;
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain'});
    this.dtOptions = {
      processing: true,
      serverSide: true,
      dom: 'lrtip',
      pageLength: 50,
      lengthMenu:[[5, 10, 25, 50], [5, 10, 25, 50]],
      columnDefs: [
        { orderable: false, targets: -1 }
      ],
      order:[[0, 'desc']],
      ajax: (dataTablesParameters: any, callback) => {
        Object.assign(dataTablesParameters, this.DatatableParameter);
        that.http.post<DataTablesResponse>(environment.APIEndpoint+'cheque_list.cheque_fetch&reload=1',Object.assign(dataTablesParameters,this.DatatableParameter), {responseType: 'json', headers}).pipe(takeUntil(this.destroy$)).subscribe(resp =>{
          that.data=resp.data;
          callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsTotal,
            data: []
          });
        });
      }
    };
  }

  ngOnInit(): void {
    this.datatableCode();
    this.employeetypenamelis();
    this.Statusdata();
    this.lookupdatalist();
    this.getBuyerData();
    this.CrmUserRole = false;
    if(sessionStorage.getItem('UserRole') == 'CRM User'){
			this.CrmUserRole = true;
		}
    this.CRMAdmin = false;
    if (sessionStorage.getItem('UserRole') == 'CRM Admin') {
      this.CRMAdmin = true;
    }

  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  updateChequeDetail(){
    this.submitted = false;
    
    let updateChequeDetail = new FormData();

  updateChequeDetail.append('trans_status', this.addChequeList.get('add_Remark').value);

    updateChequeDetail.append('transaction_id', this.addChequeList.get('transaction_id').value);
    updateChequeDetail.append('add_ChequeNumber', this.addChequeList.get('add_ChequeNumber').value);
    updateChequeDetail.append('add_amtpaid', this.addChequeList.get('add_amtpaid').value);
    updateChequeDetail.append('add_nameonCheq', this.addChequeList.get('add_nameonCheq').value);
    updateChequeDetail.append('add_chequeDate', this.addChequeList.get('add_chequeDate').value);
    updateChequeDetail.append('add_chequesubmit', this.addChequeList.get('add_chequesubmit').value);
    updateChequeDetail.append('add_chequeReceivedById', this.addChequeList.get('add_submittedby').value);
   
   
if(this.addChequeList.valid){
    this.billingservice.updatecheque(updateChequeDetail).pipe(takeUntil(this.destroy$)).subscribe((Response) =>{
      if(Response == true) {

        Swal.fire({
          icon:'success',
          title:'Success!',
          text:Response.MESSAGE,
          showConfirmButton:false,
          timer:2000
        });
        this.closeModal();
        	this.reload();
        //this.Seller_form.reset();
        //this.regDetailForm.reset();
        //this.router.navigate(['/-record']);
      }else{
        Swal.fire({
          icon:'error',
          title:'Error!',
          text:'Updatation Failed',
          showConfirmButton:false,
          timer:3000
        });
      }
    })
  }
  else{
    Swal.fire({
      icon:'error',
      title:'Error!',
      text:'required all Fields',
      showConfirmButton:false,
      timer:3000
    });
  }
 }
  openModalButton(){
    if (this.flg == "Add") {
      this.PopupTitle = "Add New Cheque";
      this.addChequeList.enable();
   }
   else if (this.flg == "Edit")
   {
     this.PopupTitle = "Edit Cheque";
     this.addChequeList.enable();

   }
   else if (this.flg == "View")
   {
     this.PopupTitle = "View Cheque";
     this.addChequeList.disable();
   }

   this.flg = "Add"
   this.addChequeList.reset();
   const aChequeId = this.activatedRoute.snapshot.paramMap.get('id');
  }

  getBuyerData(){
    let data=new FormData();
    this.billingservice.getBuyerData(data).pipe(takeUntil(this.destroy$)).subscribe(res=>{
      this.Buyerdata=res.data;
    })
  }



  editCheque(id){
   
    let editForm = new FormData();
    editForm.append("transaction_id",id);
    this.billingservice.editcheque(editForm).pipe(takeUntil(this.destroy$)).subscribe((Response)=>{
    
       if(Response.data.DATA !=""){
       
        
        this.addChequeList.patchValue({
          transaction_id:Response.data.DATA[0][0],
          add_ChequeNumber: Response.data.DATA[0][13],  
          add_amtpaid:Response.data.DATA[0][3],
          add_nameonCheq:Response.data.DATA[0][12],
          add_chequeDate:this.datePipe.transform(Response.data.DATA[0][14],'dd-MM-yyyy'),
          add_chequesubmit:this.datePipe.transform(Response.data.DATA[0][15],'dd-MM-yyyy'),
           add_Remark:Response.data.DATA[0][5],
           add_submittedby:Response.data.DATA[0][4],
           add_payername:Response.data.DATA[0][19]
         
        })

        
      }
    });

    this.chequemodal.nativeElement.click();
    this.PopupTitle = "Edit Cheque";
    this.addChequeList.enable();
  }
 
  



  viewCheque(id){
    this.chequemodal.nativeElement.click();
    this.editCheque(id);
    this.PopupTitle = "View Cheque";
     this.addChequeList.disable();
  }
  employeetypenamelis(){
    let employeelist = new FormData();
    this.crmservice.getEmployee(employeelist).pipe(takeUntil(this.destroy$)).subscribe(resp =>{
      this.employee = resp.data;

    });
  }

  Statusdata(){
    let lookupStatus = "Status"
    let Statusdata= new FormData();
    Statusdata.append('lookupname',lookupStatus);
    this.crmservice.fetch_lookupdata(Statusdata).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
      this.resplookupstatus = Response.data;
 

    });
  }
  
  
  lookupdatalist(){
    let lookupBank = "Bank";
        let bankdata = new FormData();
        bankdata.append('lookupname',lookupBank);
        this.hrservice.fetch_lookupdata(bankdata).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
            this.resplookupBank = Response.data;
           
        });
  }
  ChequeSearch(){
    this.datatableCode();
    this.rerender();
  }
  resetSearch(){
    this.searchCrmCheque.reset();
    this.searchCrmCheque.get('filter_chequeDate').setValue('');
    this.searchCrmCheque.get('filter_chequesubmit').setValue('');
    this.searchCrmCheque.get('filter_Remark').setValue('');
    this.searchCrmCheque.get('filter_nameonCheq').setValue('');
    this.datatableCode();
    this.rerender();
   
  }
  rerender():void
  {
    this.dtElement.dtInstance.then((dtInstance : DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
    });
  }
  reload()
  {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  public closeModal(){
    this.closebutton.nativeElement.click();
  }

}
