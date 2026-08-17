
import { Component, OnInit, ViewChild,TemplateRef, ChangeDetectorRef, OnDestroy } from '@angular/core';
import {NgbCalendar,NgbDate,NgbDateStruct,NgbInputDatepickerConfig} from '@ng-bootstrap/ng-bootstrap';
import { from, Subject } from 'rxjs';
import {Router} from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { HttpClient ,HttpHeaders, HttpResponse } from '@angular/common/http';
import { StringLiteralLike } from 'typescript';
import { DataTableDirective } from 'angular-datatables';
import { takeUntil } from 'rxjs/operators';

class MasterEntry {
  CompanyId: string;
  CountryId: string;
  Country: string;
  Status: string;
  CreatedBy: string;
  CreatedDt: string;
  UpdatedBy: string;
  UpdatedDt: string;
}
class StateData {
  CompanyId: string;
  CountryId: string;
  Country: string;
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
  selector: 'app-admin-place',
  templateUrl: './admin-place.component.html',
  styleUrls: ['./admin-place.component.css'],
})
export class AdminPlaceComponent implements OnInit, OnDestroy {
  dtOptions: DataTables.Settings = {};
  dtStateOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  dtStateTrigger: Subject<any> = new Subject<any>();
  private destroy$ = new Subject<void>();
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  @ViewChild(DataTableDirective) dtElementState: DataTableDirective;
  @ViewChild('closebutton') closebutton;
  @ViewChild('closebuttonstate') closebuttonstate;
  @ViewChild('closebuttoneditCountryClose') closebuttoneditCountryClose;
  DatatableParameter = { CompanyId:''};
  modal:any;
  dataa:MasterEntry[];
  dataState:StateData[];
  myBooks: string[];
  addCountry = new FormGroup({
    country_name : new FormControl('',Validators.required),
    txtStatus : new FormControl('',Validators.required)
  });
  addState = new FormGroup({
    txtcountry_name : new FormControl('',Validators.required),
    state_name : new FormControl('',Validators.required),
    txtStatus : new FormControl('',Validators.required)
  });
  fetchItemCountry = new FormGroup({
    CountryId : new FormControl(''),
    country_name : new FormControl('',Validators.required),
    txtStatus : new FormControl('',Validators.required)
  });
  fetchItemState = new FormGroup({
    StateId : new FormControl(''),
    txtcountry_name : new FormControl('',Validators.required),
    state_name : new FormControl('',Validators.required),
    txtStatus : new FormControl('',Validators.required)
  });
  model: NgbDateStruct;
  model_add: NgbDateStruct;
  model_view: NgbDateStruct;
  model_edit: NgbDateStruct;
  constructor(private router:Router,private http:HttpClient,private adminservice:AdminService,private chRef : ChangeDetectorRef) {  }
  ngOnInit() {
    this.datatableCode();
    this.datatableCodeForState();
    let LookUpData = new FormData();
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain'});
    this.adminservice.fetchCountryList(LookUpData).pipe(takeUntil(this.destroy$)).subscribe(
      data => {
        var res = data.data
        this.myBooks = res as string [];		
      },
      
    );
  }
  datatableCode() {         
    const that = this;
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain'});
    this.dtOptions = {
      processing: true,
      serverSide: true,
      dom: 'lrtip',
      lengthMenu:[[5, 10, 25, 50], [5, 10, 25, 50]],
      columnDefs: [
        { orderable: false, targets: 0 }
      ],          
      ajax: (dataTablesParameters: any, callback) => {            
        Object.assign(dataTablesParameters, this.DatatableParameter);
        that.http.post<DataTablesResponse>('http://api.divyaltech.com/propertydealercrm_backend/index.cfm?action=admin.fetch_country&reload=1',Object.assign(dataTablesParameters,this.DatatableParameter), {responseType: 'json', headers}).pipe(takeUntil(this.destroy$)).subscribe(resp =>{
            that.dataa=resp.data;
            callback({recordsTotal: resp.recordsTotal,recordsFiltered: resp.recordsTotal,data: []});
        });              
      }
    };
  }
  datatableCodeForState(){
    const that = this;
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain'});
    this.dtStateOptions = {
        processing: true,
        serverSide: true,
        dom: 'lrtip',
        lengthMenu:[[5, 10, 25, 50], [5, 10, 25, 50]],
        columnDefs: [
          { orderable: false, targets: 0 }
        ],          
        ajax: (dataTablesParameters: any, callback) => {            
          Object.assign(dataTablesParameters, this.DatatableParameter);
          that.http.post<DataTablesResponse>('http://api.divyaltech.com/propertydealercrm_backend/index.cfm?action=admin.fetch_state&reload=1',Object.assign(dataTablesParameters,this.DatatableParameter), {responseType: 'json', headers}).pipe(takeUntil(this.destroy$)).subscribe(resp =>{
              that.dataState=resp.data;
              callback({recordsTotal: resp.recordsTotal,recordsFiltered: resp.recordsTotal,data: []});
          });              
        }
    };
  }
  InsertCountry(){
    if(this.addCountry.valid){
      let countryData = new FormData();
      countryData.append('Country',this.addCountry.get('country_name').value);
      countryData.append('Status',this.addCountry.get('txtStatus').value);
      this.adminservice.addCountryData(countryData).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
        if(Response.CODE == 200) {
            Swal.fire({
                icon:'success',
                title:'Success!',
                text:Response.MESSAGE,
                showConfirmButton:false,
                timer:2000
            });
            this.reload();
            this.addCountry.reset();
            this.closeModal();
        } else {
          Swal.fire({
            icon:'error',
            title:'Error!',
            text:'Task Creation Failed',
            showConfirmButton:false,
            timer:3000
          });
        }
      });  
    } else {
      Swal.fire('Alert','Fill all required fields first','info');
    }     
  }
  InsertState(){
    
    if(this.addState.valid){
      let stateData = new FormData();
      stateData.append('Country',this.addState.get('txtcountry_name').value);
      stateData.append('State',this.addState.get('state_name').value);
      stateData.append('Status',this.addState.get('txtStatus').value);
      this.adminservice.addStateData(stateData).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
        if(Response.CODE == 200) {
            Swal.fire({
                icon:'success',
                title:'Success!',
                text:Response.MESSAGE,
                showConfirmButton:false,
                timer:2000
            });
            this.reloadState();
            this.addState.reset();
            this.closeModalState();
        } else {
          Swal.fire({
            icon:'error',
            title:'Error!',
            text:'Task Creation Failed',
            showConfirmButton:false,
            timer:3000
          });
        }
      });  
    } else {
      Swal.fire('Alert','Fill all required fields first','info');
    }
  }
  deletcountryData(id){
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.value) {
        this.adminservice.deletecountry(id).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
         
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
  deletStateData(id){
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.value) {
        this.adminservice.deletestate(id).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
         
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
    
  getitemCountry(CountryId){
    let LookUpData = new FormData();
    LookUpData.append('CountryId',CountryId);
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain'});
    this.adminservice.fetchCountryList(LookUpData).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
      if(Response.data.length) {
        this.fetchItemCountry.patchValue({
          CountryId : Response.data[0].CountryId,
          country_name : Response.data[0].Country
        });
        let status = ""
        if(Response.data[0].Status == 1) {
          status = "true"
        } else {
          status = "false"
        }
        this.fetchItemCountry.controls.txtStatus.setValue(status)
      } else {
        Swal.fire({
            icon:'error',
            title:'Error!',
            text:'Item Creation Failed',
            showConfirmButton:false,
            timer:3000
        });
      }
    });
  }
  getStateData(StateId){
    let LookUpData = new FormData();
    LookUpData.append('StateId',StateId);
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain'});
    this.adminservice.fetchStateList(LookUpData).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
      
      if(Response.data.length) {
        
        this.fetchItemState.patchValue({
          StateId : Response.data[0].StateId,
          txtcountry_name : Response.data[0].Country,
          state_name : Response.data[0].State,

        });
        this.fetchItemState.controls.txtStatus.setValue(Response.data[0].Status);
      } else {
        Swal.fire({
            icon:'error',
            title:'Error!',
            text:'Item Creation Failed',
            showConfirmButton:false,
            timer:3000
        });
      }
    });
  }
  updateCountryData(){
    if(this.fetchItemCountry.valid){
      let LookUpData = new FormData();
      LookUpData.append('CountryId',this.fetchItemCountry.get('CountryId').value);
      LookUpData.append('Country',this.fetchItemCountry.get('country_name').value);
      if(this.fetchItemCountry.get('txtStatus').value == 'true' || this.fetchItemCountry.get('txtStatus').value == 1)
        LookUpData.append('Status','1');
      else
        LookUpData.append('Status','0');
      
      this.adminservice.updateCountryData(LookUpData).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
          if(Response.CODE == 200) {
              Swal.fire({
                  icon:'success',
                  title:'Success!',
                  text:Response.MESSAGE,
                  showConfirmButton:false,
                  timer:2000
              });
              this.reload();
              this.fetchItemCountry.reset();
              this.closebuttoneditCountryClose.nativeElement.click();
          }else{
            Swal.fire({
              icon:'error',
              title:'Error!',
              text:'Task Creation Failed',
              showConfirmButton:false,
              timer:3000
            });
          }
      });  
    }else{
      Swal.fire('Alert','Fill all required fields first','info');
    }
  }
  updateStateData(){
    if(this.fetchItemState.valid){
      let LookUpData = new FormData();
      LookUpData.append('CountryId',this.fetchItemState.get('CountryId').value);
      LookUpData.append('Country',this.fetchItemState.get('country_name').value);
      LookUpData.append('Status',this.fetchItemState.get('txtStatus').value);
      this.adminservice.updateStateData(LookUpData).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
          if(Response.CODE == 200) {
              Swal.fire({
                  icon:'success',
                  title:'Success!',
                  text:Response.MESSAGE,
                  showConfirmButton:false,
                  timer:2000
              });
              this.reload();
              this.fetchItemCountry.reset();
              this.closebuttoneditCountryClose.nativeElement.click();
          }else{
            Swal.fire({
              icon:'error',
              title:'Error!',
              text:'Task Creation Failed',
              showConfirmButton:false,
              timer:3000
            });
          }
      });  
    }else{
      Swal.fire('Alert','Fill all required fields first','info');
    }
  }
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.dtStateTrigger.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
  public closeModal(){
   
    this.closebutton.nativeElement.click();
  }
  public closeModalState(){
   
    this.closebuttonstate.nativeElement.click();
  }
  redirect(link){
    this.router.navigate(['/'+link]);
  }
  LookupSearch(){
    this.datatableCode();
    this.rerender();
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
    this.dtStateTrigger.next();
  }
  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        this.dtTrigger.next();
        this.dtStateTrigger.next();
    });
  } 
  reload() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.ajax.reload();
    });
  }
  reloadState() {
    this.dtElementState.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.ajax.reload();
    });
  }

}
