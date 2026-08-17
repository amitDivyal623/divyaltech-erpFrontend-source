import { Component, OnInit, OnDestroy,ViewChild, Input, ChangeDetectorRef,AfterViewInit } from '@angular/core';
// import {NgbActiveModal,NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { GodownService} from '../../services/godown.service';
import { FormBuilder,FormControl, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { HttpClient ,HttpHeaders, HttpResponse } from '@angular/common/http';
import { StringLiteralLike } from 'typescript';
import { DataTableDirective } from 'angular-datatables';
import { from, Subject,Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment'
import { HrService} from '../../services/hr.service'
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-project-godown-model',
  templateUrl: './project-godown-model.component.html',
  styleUrls: ['./project-godown-model.component.scss']
})
export class ProjectGodownModelComponent implements OnInit,AfterViewInit,OnDestroy {
  private destroy$ = new Subject<void>();
  @Input() heading: string;
  @Input() gdn_mdl_inst:any;
  @Input() isButtonDisabled:any;
  @Input() flg:any;
  @Input() godownId:any;
  // @ViewChild('date_inp')date_inp:any;

  [x: string]: any;
  PopupTitle = "Add New Godown";
  editView = "";
  date_inp_value:any;
  pipe = new DatePipe('en-US');





    addCrmGodown = this.formBuilder.group({
      inpt_godown_name: new FormControl('', Validators.required),
      inpt_date: new FormControl('', Validators.required),
      inpt_godown_code: new FormControl('',Validators.required),
      inpt_project_id: new FormControl(''),

      address: new FormControl('', Validators.required),
      dist: new FormControl('', Validators.required),
      state: new FormControl('', Validators.required),
      pincode: new FormControl('', Validators.required),


    });

  constructor(private hrservice?: HrService,private datePipe?: DatePipe,private router?: Router,private http?:HttpClient,private formBuilder?: FormBuilder,private chRef? : ChangeDetectorRef,private GodownService?:GodownService,) {


  }
  ngAfterViewInit(): void {
  
  }
  ngOnInit(): void {
    this.projectlist();

    if(this.flg == "edit" || this.flg == "view"){
      this.editView = "active";
      this.godown_service_reponse(this.godownId);

    }
  }

  godown_service_reponse(godownId){
    
	 this.GodownService.Godowndata(godownId).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
      
  

      this.addCrmGodown.controls['inpt_godown_code'].setValue(Response.DATA[0][1]);
      this.addCrmGodown.controls['inpt_godown_name'].setValue(Response.DATA[0][2]);
   
      this.addCrmGodown.controls['address'].setValue(Response.DATA[0][5]);
      this.addCrmGodown.controls['dist'].setValue(Response.DATA[0][6]);
      this.addCrmGodown.controls['state'].setValue( Response.DATA[0][7]);
      this.addCrmGodown.controls['pincode'].setValue(Response.DATA[0][8]);
  
      const date = new Date(Response.DATA[0][4]);

			this.addCrmGodown.controls['inpt_date'].setValue({
				year: date.getFullYear(),
				month: date.getMonth() + 1,
				day: date.getDate()
			});
    


    });

  }


  projectlist(){
    let projectlist = new FormData();
    projectlist.append('CompanyId',sessionStorage.getItem('CompanyId'));
    this.hrservice.projectlist(projectlist).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
      this.respProject = Response.data
     
    });
  }

  close_mdl()
  {
    this.gdn_mdl_inst.close();
  }
  insertgodownDetail(){

    if(this.addCrmGodown.valid){
        this.submitted = false;
        let godownData = new FormData();
      godownData.append('inpt_godown_name', this.addCrmGodown.get('inpt_godown_name').value);
      godownData.append('inpt_date', this.addCrmGodown.get('inpt_date').value);
      godownData.append('inpt_godown_code', this.addCrmGodown.get('inpt_godown_code').value);
      godownData.append('inpt_project_id', this.addCrmGodown.get('inpt_project_id').value);
      godownData.append('address', this.addCrmGodown.get('address').value);
      godownData.append('dist', this.addCrmGodown.get('dist').value);
      godownData.append('state',this.addCrmGodown.get('state').value);
      godownData.append('pincode', this.addCrmGodown.get('pincode').value);
     

        this.GodownService.addGodownMngmt(godownData).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
          
          if(Response.CODE == 200) {
            // this.custEnquiryEdit(Response.ID);
            // Swal.fire({
            //   icon:'success',
            //   title:'Success!',
            //   text:Response.MESSAGE,
            //   showConfirmButton:false,
            //   timer:2000
            // });
            this.addCrmGodown.reset();
            // this.closeModal();
            this.close_mdl();

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
                    this.close_mdl();
                    // this.closeModal();
                    this.custEnquiryEdit(Response.ID);
                  }
              });
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
      this.submitted = true;
      Swal.fire('Alert','Fill all required fields first','info');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
