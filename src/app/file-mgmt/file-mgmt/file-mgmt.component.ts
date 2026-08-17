import { Component, ElementRef, Injectable, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroup ,FormBuilder} from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { NgbDateAdapter, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import Swal from 'sweetalert2';
import { CrmService } from '../../services/crm.service';
import {NgSelectModule, NgOption} from '@ng-select/ng-select';
import jwt_decode from 'jwt-decode';
import { CompanyService } from 'src/app/services/company.service';
import { HrService } from 'src/app/services/hr.service';
// import { SelectComponent } from 'ng-select'

class DataTablesResponse {
  [x: string]: any;
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}
@Injectable()
export class CustomAdapter extends NgbDateAdapter<string> {

  readonly DELIMITER = '/';

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
  selector: 'app-file-mgmt',
  templateUrl: './file-mgmt.component.html',
  styleUrls: ['./file-mgmt.component.scss'],
  providers: [{provide: NgbDateAdapter, useClass: CustomAdapter},
    {provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter},
    {provide : DatePipe}
   
]
})
export class FileMgmtComponent implements OnInit, OnDestroy {
  [x: string]: any;
  data: any[];
  deptdata:any[];
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  private destroy$ = new Subject<void>();
  @ViewChild('labelImport_doc')labelImport_doc: ElementRef;
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  @ViewChild('closebutton') closebutton;
  filecontent: any;
  attachmentimageName: any;
  attach_File: string;
  fileuploads: string;
  Isadmin:boolean = false
  jwttoken:any;
  SelectType :String = "User";
  SelectTypeList = [];
  selectedTypeIds: [];
  UserRole:string = sessionStorage.getItem('UserRole')
  
  myForm = new FormGroup({
    attach_File: new FormControl(''),
    selectTypeDropdown : new FormControl(''),
    SelectType :  new FormControl('User')
});
searchform= new FormGroup({
  file_name: new FormControl(''),
  file_uploadedtfrom:new FormControl(''),
  file_uploaded_dtto:new FormControl(''),
  department_type: new FormControl('')

});
DatatableParameter = { file_name: '', file_uploadedtfrom: '', file_uploaded_dtto: '',department_type:'',UserRoleID:'',UserID:'',Isadmin:''};

  constructor(public http:HttpClient,private crmservice:CrmService,private companyService:CompanyService,private hrservice : HrService) {  
    if(sessionStorage.getItem('token')==undefined && sessionStorage.getItem('UserName')==undefined){
      this.router.navigate(['/']);
  }
   }
  ngOnInit(): void { 
    this.jwttoken = jwt_decode(sessionStorage.getItem('token'));
    this.role = sessionStorage.getItem('UserRole'); 
    sessionStorage.getItem('UserRole')=="Admin"?(this.Isadmin = true, this.SelectionToggle()):"";
    this.datatableCode() ; 
    this.departmentList();
    
    
    
    
    
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  AttachmentImage(files: FileList, event) {
    this.labelImport_doc.nativeElement.innerText = Array.from(files)
    .map(f => f.name)
    .join(', ');
    this.filecontent = event.target.files[0];
    this.attachmentimageName = this.filecontent.name;
    this.fileuploads="changeed";
    
  }
  Uplodefile(){
    if ((!this.selectedTypeIds  || this.selectedTypeIds.length == 0) && this.Isadmin)
    { 
      Swal.fire({
        icon:'error',
        title:'Error!',
        text:'Please select options from dropdown',
        showConfirmButton:false,
        timer:3000
      });
      return
    }
    if (this.myForm.get('attach_File').value.length==0)
    {
      Swal.fire({
        icon:'error',
        title:'Error!',
        text:'Please select file to upload',
        showConfirmButton:false,
        timer:3000
      });
      return;
    }
    let file:any = new FormData();
    file.append('file',this.myForm.get('attach_File').value);
    file.append('attachmentimage',this.filecontent);
    file.append('attachmentimagename',this.attachmentimageName);
    file.append('USERID',this.jwttoken.USERID);
    file.append('SelectionType',this.myForm.get('SelectType').value)
    let selectedTypeIds = this.selectedTypeIds ? this.selectedTypeIds.toString() : ""
    file.append('SelectedIds', selectedTypeIds)
    file.append('Isadmin',JSON.stringify(this.Isadmin))
    file.append('fileuploads','changeed')
    for (var pair of file.entries()) {
      // console.log(pair[0]+ ', ' + pair[1]); 
    }
    this.http.post(environment.APIEndpoint + 'filemgmt.save&reload=1',file).pipe(takeUntil(this.destroy$)).subscribe((response) => {
      if(response == true) {

        Swal.fire({
          icon:'success',
          title:'Success!',
          
          showConfirmButton:false,
          timer:2000
        });
        this.closeModal();
        	this.reload();
          this.filecontent ="";
          this.attachmentimageName ="";
        //this.Seller_form.reset();
        //this.regDetailForm.reset();
        //this.router.navigate(['/-record']);
      }else{
        Swal.fire({
          icon:'error',
          title:'Error!',
          text:' Creation Failed',
          showConfirmButton:false,
          timer:3000
        });
      }
      
    })  
  }
 

  datatableCode() {
    this.DatatableParameter.file_name=this.searchform.get('file_name').value;
    this.DatatableParameter.file_uploadedtfrom=this.searchform.get('file_uploadedtfrom').value;
    this.DatatableParameter.file_uploaded_dtto = this.searchform.get('file_uploaded_dtto').value;
    this.DatatableParameter.department_type =this.searchform.get('department_type').value;
    this.DatatableParameter.UserRoleID=sessionStorage.getItem('UserRoleID');
    this.DatatableParameter.UserID=this.jwttoken.USERID;
    this.DatatableParameter.Isadmin = JSON.stringify(this.Isadmin);
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
        that.http.post<DataTablesResponse>(environment.APIEndpoint+'filemgmt.fetch_fileData&reload=1',Object.assign(dataTablesParameters,this.DatatableParameter), {responseType: 'json', headers}).pipe(takeUntil(this.destroy$)).subscribe(resp =>{
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
  viewAttchement(path,type){
    window.open(environment.APIEndpoint+'project.download&path='+path+'&type='+type+'&token='+sessionStorage.getItem('token')+'&reload=1', "_blank");
}

deletTask(id){
  Swal.fire({
    title: 'Are you sure?',
    text: 'You want to delete this.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes',
    cancelButtonText: 'No'
  }).then((result) => {
    if (result.value) {
       this.crmservice.deleteFile(id).pipe(takeUntil(this.destroy$)).subscribe(Response=>{
        if(Response) {
          Swal.fire({
            icon:'success',
            title:'Success!',
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



  fileSearch(){
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
 departmentList(){ 
   let list  = [];
   let userdata = new FormData();
   userdata.append('company_Id',this.jwttoken.COMPANYID);
   this.companyService.getUserdetailbycompanyid(userdata).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      for (let i = 0; i < resp.data.length; i++) {
        list.push(resp.data[i])
      }
      this.deptdata = list
    });
 
  }
  public closeModal(){
    this.filecontent ="";
    this.attachmentimageName ="";
    this.labelImport_doc.nativeElement.innerText = "Upload File";
    this.myForm.reset();
    this.myForm.get('attach_File').setValue('');
    this.myForm.get('SelectType').setValue('User');
    this.SelectionToggle();
    this.closebutton.nativeElement.click();
    
  }
  resetSearch(){
    this.searchform.reset();
    this.searchform.get('file_name').setValue('');
    this.searchform.get('file_uploadedtfrom').setValue('');
    this.searchform.get('file_uploaded_dtto').setValue('');
    this.searchform.get('department_type').setValue('');
    this.datatableCode();
    this.rerender();
   
  }

  SelectionToggle(type="User")
  {
    this.myForm.controls.selectTypeDropdown.setValue('');
    this.SelectType = type;
    this.SelectTypeList = [];
    let list = [];
    if (type == "User")
    {
      
      let userdata = new FormData();
      userdata.append('roleName','')
      this.hrservice.getUserData(userdata).pipe(takeUntil(this.destroy$)).subscribe(resp=>{
        resp.DATA.forEach(function (item, index) {
          list.push({
            'RoleId':item[resp.COLUMNS.indexOf("UserId")],
            'userRole':item[resp.COLUMNS.indexOf("UserName")]
          })
        });
        this.SelectTypeList = list
      })
    } 
    else if ( type == "Role")
    {
      let userdata = new FormData();
        userdata.append('company_Id',this.jwttoken.COMPANYID);
        this.companyService.getUserdetailbycompanyid(userdata).pipe(takeUntil(this.destroy$)).subscribe(resp => {
          for (let i = 0; i < resp.data.length; i++) {
            list.push(resp.data[i])
          }
          this.SelectTypeList = list
        });
    }
    
  }

}
