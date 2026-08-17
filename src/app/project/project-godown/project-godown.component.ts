import { Component, OnInit, ViewChild, ChangeDetectorRef, TemplateRef, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import {NgbCalendar,NgbDate,NgbDateStruct,NgbInputDatepickerConfig,NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { GodownService } from '../../services/godown.service';
import { HrService} from '../../services/hr.service';
import { FormBuilder,FormControl, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { HttpClient ,HttpHeaders, HttpResponse } from '@angular/common/http';
import { StringLiteralLike } from 'typescript';
import { DataTableDirective } from 'angular-datatables';
import { from, Subject,Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ProjectGodownModelComponent } from 'src/app/shared/project-godown-model/project-godown-model.component';

class DataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}
class project_mangment {
  godown_name: string;
  showSuccess: string;
}
@Component({
  selector: 'app-project-godown',
  templateUrl: './project-godown.component.html',
  styleUrls: ['./project-godown.component.scss']
})
export class ProjectGodownComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  [x: string]: any;
    DatatableParameter = { ID:"", GodownName : '', GodownCode : '', Address : '', District : ''};
    constructor(private modelservice : NgbModal,private router: Router,private http:HttpClient,private GodownService:GodownService,private chRef : ChangeDetectorRef,private formBuilder: FormBuilder, private hrservice: HrService,public datepipe: DatePipe) {}
    dtOptions: DataTables.Settings = {};
    dtTrigger: Subject<any> = new Subject<any>();
    @ViewChild(DataTableDirective) dtElement: DataTableDirective;

    @ViewChild('closebutton') closebutton;
    @ViewChild('removebutton') removebutton;
    @ViewChild('godownmodal') godownmodal;
    @ViewChild('Godowndata') Godowndata;
    @ViewChild('gdn_mdl') gdn_mdl:any;
    // @ViewChild('tempvar') CustCountry;
    modal: any;
    gdn_mdl_ref:any;
    clickEventsubscription:Subscription;
    heading ="Add new Godown";
    isButtonDisabled = false;
    flg :any;


    route(link:any){
        this.router.navigate(['/'+link]);
    }
    data: project_mangment[];
    addCrmGodown = this.form = this.formBuilder.group({
      inpt_godown_name: new FormControl('', Validators.required),
      inpt_date: new FormControl('', Validators.required),
      inpt_godown_code: new FormControl(''),
      //inpt_project_id: new FormControl(''),
      address: new FormControl('', Validators.required),
      dist: new FormControl('', Validators.required),
      state: new FormControl('', Validators.required),
      pincode: new FormControl('', Validators.required),


    });
  searchCrmGodown = new FormGroup({
    search_godown_name: new FormControl(''),
    search_godown_code: new FormControl(''),
    search_address: new FormControl(''),
    search_dist: new FormControl('')

  });
  ngOnInit(): void {
        this.setDate = false;
        this.Godowndatatabl();
        this.projectlist();
    }
  Godowndatatabl() {
    this.DatatableParameter.ID = sessionStorage.getItem('UserId');
    
    this.DatatableParameter.GodownName = this.searchCrmGodown.get('search_godown_name').value;
    this.DatatableParameter.GodownCode = this.searchCrmGodown.get('search_godown_code').value;
    this.DatatableParameter.Address = this.searchCrmGodown.get('search_address').value;
    this.DatatableParameter.District = this.searchCrmGodown.get('search_dist').value;
    
        const that = this;
        const headers = new HttpHeaders({ 'Content-Type': 'text/plain'});
        this.dtOptions = {
            processing: true,
            serverSide: true,
            dom: 'lrtip',
            lengthMenu:[[5, 10, 25, 50], [5, 10, 25, 50]],
            // columnDefs: [
            //     { orderable: false, targets: 9 }
            // ],
            ajax: (dataTablesParameters: any, callback) => {
                Object.assign(dataTablesParameters, this.DatatableParameter);
              that.http.post<DataTablesResponse>(environment.APIEndpoint + 'godown.fetch_GodownList&reload=1', Object.assign(dataTablesParameters, this.DatatableParameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {
                    that.data=resp.data;
                    callback({recordsTotal: resp.recordsTotal,recordsFiltered: resp.recordsTotal,data: []});
                });
            }
        };
        
  }

  public closeModal(){
    this.closebutton.nativeElement.click();
  }

  public removeModal(){
    this.removebutton.nativeElement.click();
  }

  private myValue;
  private modalaction;

// godown_service_reponse(godownId){

//   this.inp_godown_name = "test name";

//   this.GodownService.Godowndata(godownId).subscribe(Response =>{

//     this.inpt_godown_code = Response.DATA[0][1];
//     // this.inp_godown_name = Response.DATA[0][2];


//     this.inp_project_id = Response.DATA[0][3];
//     this.inp_date = Response.DATA[0][4];
//     this.inp_address = Response.DATA[0][5];
//     this.inp_dist = Response.DATA[0][6];
//     this.inp_state = Response.DATA[0][7];
//     this.inp_pincode = Response.DATA[0][8];

//   });

// }
editGodown(GodownId) {
  this.saveButton=true;
  this.submitted = false
  this.addCrmGodown.enable();
  this.isButtonDisabled = false;
  this.heading ="Edit Godown";
  this.isButtonDisabled = false;
  this.flg = "edit";
  this.godownId_inp = GodownId;
  this.opn_mdl();



}

  viewGodown(GodownId){
    
        this.submitted = false
        this.saveButton=false;
        this.godownId_inp = GodownId;
        this.heading = "View Godown";
        this.isButtonDisabled = true;
        this.flg = "view";
        this.opn_mdl();
  }


  delete(godownId){
    Swal.fire({
        title: 'Are you sure?',
        text: 'You want to delete this.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      }).then((result) => {
        if (result.value) {
          this.GodownService.delete_godown(godownId).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
                
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


  add_mdl()
  {
    this.isButtonDisabled = false;
    this.heading = "Add new Godown";
    this.flg = "add";
    this.inp_godown_name="";
    this.inp_date="";
    this.inp_address="";
    this.inp_dist="";
    this.inp_state="";
    this.inp_pincode="";
    this.inpt_godown_code = "";
    this.godownId_inp="";

    this.opn_mdl();
  }
  opn_mdl()
  {
      let godown_mdl = this.modelservice.open(ProjectGodownModelComponent,{ size: 'lg', backdrop: 'static', keyboard: false });
            godown_mdl.componentInstance.heading = this.heading;
            godown_mdl.componentInstance.gdn_mdl_inst = godown_mdl;
            godown_mdl.componentInstance.isButtonDisabled = this.isButtonDisabled;
            godown_mdl.componentInstance.flg = this.flg;
            //values from api to modal component
            godown_mdl.componentInstance.godownId = this.godownId_inp;

            //fro reloading the datatable after model close
            godown_mdl.result.then((response: any) => {

                this.reload();

            },() => {});
  }

  opengodownModal() {
    this.submitted = false;
    this.addCrmGodown.reset();
    if (this.modalaction == 'add') {
      this.addCrmGodown.enable();
      this.isButtonDisabled = false;
      //this.editView = ''
    }else if (this.modalaction == 'edit') {
      this.heading = "Edit Godown";
      this.addCrmGodown.enable();
      this.isButtonDisabled = false;
      //this.editView = 'active'
    }else if (this.modalaction == 'view') {
      this.heading = "View Godown";
      this.addCrmGodown.disable();
      this.isButtonDisabled = true;
      //this.editView = 'active'
    }
  }

  godownmodalTitle(){
    this.modalaction = 'add';
    this.heading = "Add New Godown";
  }
  GodownSearch(){
    //this.setDate = true;
    this.Godowndatatabl();
    this.rerender();
  }

	reload(){
		this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
			dtInstance.ajax.reload();
		});
	}
  ngAfterViewInit(): void {
     this.dtTrigger.next();
  }
  ngOnDestroy():void {
    this.dtTrigger.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
  rerender() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api)=>{
      dtInstance.destroy();
      this.dtTrigger.next();
    });
  }

  insertgodownDetail(){

    if(this.addCrmGodown.valid){
        this.submitted = false;
        let godownData = new FormData();
      godownData.append('inpt_godown_name', this.addCrmGodown.get('inpt_godown_name').value);
      godownData.append('inpt_date', this.addCrmGodown.get('inpt_date').value);
      godownData.append('inpt_godown_code', this.addCrmGodown.get('inpt_godown_code').value);
      //godownData.append('inpt_project_id', this.addCrmGodown.get('inpt_project_id').value);
      godownData.append('address', this.addCrmGodown.get('address').value);
      godownData.append('dist', this.addCrmGodown.get('dist').value);
      godownData.append('state',this.addCrmGodown.get('state').value);
      godownData.append('pincode', this.addCrmGodown.get('pincode').value);
      

        this.GodownService.addGodownMngmt(godownData).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
         
          if (Response.MESSAGE) {
            
            this.showSuccess = Response.MESSAGE;
            this.godownmodal.nativeElement.click();
          } else {
            
            this.showSuccess = '';

          }
          
          if (Response.CODE == 200) {
           
            this.showSuccess = Response.MESSAGE;
            this.addCrmGodown.get('search_godown_name').setValue('');
            this.addCrmGodown.get('inpt_godown_code').setValue('');
            this.addCrmGodown.get('address').setValue('');
            this.addCrmGodown.get('dist').setValue('');
            this.addCrmGodown.get('state').setValue('');
            this.addCrmGodown.get('pincode').setValue('');
            this.godownmodal.nativeElement.click();
            //this.custEnquiryEdit(Response.ID);
            // Swal.fire({
            //   icon:'success',
            //   title:'Success!',
            //   text:Response.MESSAGE,
            //   showConfirmButton:false,
            //   timer:2000
            // });
            //this.addCrmGodown.reset();
            //this.closeModal();
            // this.reload();
          }else if(Response.CODE == 201){
              Swal.fire({
                title: 'Godown already exist',
                text: 'Would you like to open the godown detail',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'View',
                cancelButtonText: 'Cancel'
                }).then((result) => {
                  if(result.value){
                    this.closeModal();
                    //this.custEnquiryEdit(Response.ID);
                  }
              });
          }else{
            Swal.fire({
              icon:'error',
              title:'Error!',
              text:'Godown Creation Failed',
              showConfirmButton:false,
              timer:3000
            });
          }
        });
    }else{
      this.submitted = true;
      Swal.fire('Alert','Fill all required fields first','info');
    }

    this.Godowndatatabl();
   }
  // viewGodown(GodownId) {
  //       this.addCrmGodown.disable();
  //       this.editView = 'active';
  //       this.submitted = false
  //       this.saveButton=false;
  //      
  // this.GodownService.Godowndata(GodownId).subscribe(Response => {
  //   
  //   this.heading = "View Godown"
  //   this.created_date=Response.DATA[0][3];
  //   this.inpt_date =this.datepipe.transform(this.created_date, 'yyyy-MM-dd');
  //   this.inpt_godown_code = Response.DATA[0][1];
  //   this.inpt_godown_name = Response.DATA[0][2];
  //   //this.inpt_date = Response.DATA[0][3];
  //   this.address = Response.DATA[0][4];
  //   this.dist = Response.DATA[0][5];
  //   this.state = Response.DATA[0][6];
  //   this.pincode = Response.DATA[0][7];
  //   this.classname= "active";
  //   this.setData = true;
  //   this.fieldStatus = true;
  //   this.godownmodal.nativeElement.click();


  //       });
  // }
  // editGodown(GodownId) {
  //       this.addCrmGodown.enable();
  //       
  //       this.editView = 'active';
  //       this.saveButton=true;
  //       this.submitted = false

  //       this.GodownService.Godowndata(GodownId).subscribe(Response =>{
  //       
  //         this.heading = "Edit Godown";
  //               this.inpt_godown_id = Response.DATA[0][0];
  //               this.inpt_godown_code = Response.DATA[0][1];
  //               this.inpt_godown_name = Response.DATA[0][2];
  //               this.created_date=Response.DATA[0][3];
  //               this.inpt_date =this.datepipe.transform(this.created_date, 'yyyy-MM-dd');
  //               this.address = Response.DATA[0][4];
  //               this.dist = Response.DATA[0][5];
  //               this.state = Response.DATA[0][6];
  //               this.pincode = Response.DATA[0][7];

  //               this.classname= "active";
  //               this.setData = true;
  //               this.fieldStatus = false;
  //               this.godownmodal.nativeElement.click();
  //       });
  //   }
  projectlist(){
        let projectlist = new FormData();
        projectlist.append('CompanyId',sessionStorage.getItem('CompanyId'));
        this.hrservice.projectlist(projectlist).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
          this.respProject = Response.data
          
        });
    }
  resetSearch() {
    
    this.searchCrmGodown.reset();
    this.searchCrmGodown.get('search_godown_name').setValue('');
    this.searchCrmGodown.get('search_godown_code').setValue('');
    this.searchCrmGodown.get('search_address').setValue('');
    this.searchCrmGodown.get('search_dist').setValue('');
    //this.Godowndatatabl();
    this.rerender();
  }

}
