import { NgbCalendar, NgbDateAdapter, NgbDate, NgbDateParserFormatter, NgbDateStruct, NgbInputDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnInit, ViewChild, ChangeDetectorRef, TemplateRef, Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CompanyService } from '../../services/company.service';
import { DataTableDirective } from 'angular-datatables';
import { StringLiteralLike } from 'typescript';
import { Router } from '@angular/router';
import { from, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';


class CompanyInfo {

  CompanyId: string;
  CompanyName: string;
  CompanyRefNo: string;
  Address: string;
  CityId: string;
  StateId: string;
  CountryId: string;
  MobileNo1: string;
  PostCode: string;
  MobileNo2: string;
  EmailId: string;
  GSTINNo: string;
  PanNumber: string;
  LicenceNo: string;
  RegistrationNo: string;
  Status: string;
  CreatedBy: string;
  CreatedDt: string;
}

class DataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}

@Component({
  selector: 'app-administration-company-info',
  templateUrl: './administration-company-info.component.html',
  styleUrls: ['./administration-company-info.component.css']
})
export class AdministrationCompanyInfoComponent implements OnInit,OnDestroy {

  private destroy$ = new Subject<void>();
  isButtonDisabled: boolean=false;

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();

  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  @ViewChild('closebutton') closebutton;
  @ViewChild('companyinfomodal') companyinfomodal;

  data: CompanyInfo[];


  addcompany = new FormGroup({
    company_ref_number :new FormControl('',Validators.required),
    company_name: new FormControl('',Validators.required),
    pan_number: new FormControl('',Validators.required),
    reg_number:new FormControl('',Validators.required),
    gst_number:new FormControl('',Validators.required),
    mobile_number:new FormControl('',Validators.required),
    email_id :new FormControl('',Validators.required),
    state :new FormControl('',Validators.required),
    city :new FormControl('',Validators.required),
    pincode :new FormControl('',Validators.required),
    address :new FormControl('',Validators.required),
    CompanyId: new FormControl('',)
  });

  filtercompany = new FormGroup({
    filter_company_name: new FormControl('',),
    filter_company_ref_number: new FormControl('',),
    filter_email_id: new FormControl('',)
  });

  DatatableParameter = { CompanyName: '', CompanyRefNo: '',EmailId: '' };

  constructor(private route:Router,private companyService:CompanyService,public http:HttpClient,private chRef : ChangeDetectorRef) { }
  
  ngOnInit(): void {
    this.datatableCode();
  }

  private myValue;
  private modalaction;

  opencompanyinfomodal(){
    this.addcompany.reset();
    if (this.modalaction == 'add') {
      $('#modaltextheader').text('Add Company Info');
      this.addcompany.enable();
      this.isButtonDisabled = false;
    }else if (this.modalaction == 'edit') {
      $('#modaltextheader').text('Edit Company Info');
      this.addcompany.enable();
      this.isButtonDisabled = false;
    }else if (this.modalaction == 'view') {
      $('#modaltextheader').text('View Company Info');
      this.addcompany.disable();
      this.isButtonDisabled = true;
    }
  }

  datatableCode() {

    this.DatatableParameter.CompanyName = this.filtercompany.get('filter_company_name').value;
    this.DatatableParameter.CompanyRefNo = this.filtercompany.get('filter_company_ref_number').value;
    this.DatatableParameter.EmailId = this.filtercompany.get('filter_email_id').value; 
    
    const that = this;
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain'});
    this.dtOptions = {
      processing: true,
      serverSide: true,
      dom: 'lrtip',
      lengthMenu:[[5, 10, 25, 50], [5, 10, 25, 50]],
      columnDefs: [
        { orderable: false, targets: -1 }
      ],
      ajax: (dataTablesParameters: any, callback) => {
        Object.assign(dataTablesParameters, this.DatatableParameter);
        that.http.post<DataTablesResponse>(environment.APIEndpoint+'company.getcompanydata&reload=1',Object.assign(dataTablesParameters,this.DatatableParameter), {responseType: 'json', headers}).pipe(takeUntil(this.destroy$)).subscribe(resp =>{
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

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  companyinfoSearch(){
    this.datatableCode();
    this.rerender();
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  companyinfomodalbackdropbtn(){
    this.modalaction = 'add'
  }

  public closeModal(){
    this.closebutton.nativeElement.click();
  }

  public companyinfomodalshow(){
    this.companyinfomodal.nativeElement.click();
  }

  view(CompanyId){

    let getCompanyId = new FormData();
    getCompanyId.append('CompanyId',CompanyId);

    this.companyService.ViewCompanyinfo(getCompanyId).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
      if(Response.data.length) {
        this.addcompany.patchValue({
          CompanyId : Response.data[0].CompanyId,
          company_ref_number : Response.data[0].CompanyRefNo,
          company_name : Response.data[0].CompanyName,
          pan_number : Response.data[0].PanNumber,
          reg_number : Response.data[0].RegistrationNo,
          gst_number : Response.data[0].GSTINNo,
          mobile_number : Response.data[0].MobileNo1,
          email_id : Response.data[0].EmailId,
          state : Response.data[0].StateId,
          city : Response.data[0].CityId,
          pincode : Response.data[0].PostCode,
          address : Response.data[0].Address
        });
      }
    });

    this.modalaction = 'view'
    this.isButtonDisabled = true;
    this.addcompany.disable();
    this.companyinfomodalshow();

  }
  edit(CompanyId){

    let getCompanyId = new FormData();
    getCompanyId.append('CompanyId',CompanyId);

    this.companyService.ViewCompanyinfo(getCompanyId).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
      if(Response.data.length) {
        this.addcompany.patchValue({
          CompanyId : Response.data[0].CompanyId,
          company_ref_number : Response.data[0].CompanyRefNo,
          company_name : Response.data[0].CompanyName,
          pan_number : Response.data[0].PanNumber,
          reg_number : Response.data[0].RegistrationNo,
          gst_number : Response.data[0].GSTINNo,
          mobile_number : Response.data[0].MobileNo1,
          email_id : Response.data[0].EmailId,
          state : Response.data[0].StateId,
          city : Response.data[0].CityId,
          pincode : Response.data[0].PostCode,
          address : Response.data[0].Address
        });
      }
    });

    this.modalaction = 'edit'
    this.isButtonDisabled = false;
    this.addcompany.enable();
    this.companyinfomodalshow();

  }
  remove(CompanyId){
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.value) {
        this.companyService.RemoveCompanyinfo(CompanyId).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
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
  
  onSubmit(){
    if(this.addcompany.valid){
      let companyData = new FormData();
          
      companyData.append('company_ref_number',this.addcompany.get('company_ref_number').value);
      companyData.append('CompanyId',this.addcompany.get('CompanyId').value);
      companyData.append('company_name',this.addcompany.get('company_name').value);
      companyData.append('pan_number',this.addcompany.get('pan_number').value);
      companyData.append('gst_number',this.addcompany.get('gst_number').value);
      companyData.append('reg_number',this.addcompany.get('reg_number').value);
      companyData.append('mobile_number',this.addcompany.get('mobile_number').value);
      companyData.append('email_id',this.addcompany.get('email_id').value);
      companyData.append('state',this.addcompany.get('state').value);
      companyData.append('city',this.addcompany.get('city').value);
      companyData.append('pincode',this.addcompany.get('pincode').value);
      companyData.append('address',this.addcompany.get('address').value);

      this.companyService.addcompany(companyData).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
        if (Response.CODE == 200) {
          Swal.fire({
            icon:'success',
            title:'Success!',
            text:Response.MESSAGE,
            showConfirmButton:false,
            timer:2000
          });
          this.reload();
          this.addcompany.reset();
          this.closeModal();
        }else{
          Swal.fire({
            icon:'error',
            title:'Invalid Id/Password!',
            text:'Enter valid Email and Password',
            showConfirmButton:false,
            timer:3000
          });
        }
      });
    }else{
      Swal.fire({
        icon:'error',
        title:'Field required!',
        text:'Please enter Email and Password to login',
        showConfirmButton:false,
        timer:3000
      });
    }
  }

  rerender():void
  {
    this.dtElement.dtInstance.then((dtInstance : DataTables.Api) => {
      // Destroy the table first in the current context
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next();
    });
  }
  reload() 
  {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

}
