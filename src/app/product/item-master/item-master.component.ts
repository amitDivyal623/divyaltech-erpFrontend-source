import { Component, OnInit, ViewChild,TemplateRef, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { from, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {Router} from '@angular/router';
import { ProductService } from '../../services/product.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { HttpClient ,HttpHeaders, HttpResponse } from '@angular/common/http';
import { StringLiteralLike } from 'typescript';
import { DataTableDirective } from 'angular-datatables';

class Itemgroup {
    ItemGropuId: string;
    CompanyId: string;
    GroupName: string;
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
  selector: 'app-item-master',
  templateUrl: './item-master.component.html',
  styleUrls: ['./item-master.component.css']
})
export class ItemMasterComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

    dtOptions: DataTables.Settings = {};
    dtTrigger: Subject<any> = new Subject<any>();
    @ViewChild(DataTableDirective) dtElement: DataTableDirective;
    @ViewChild('closebutton') closebutton;
  
    DatatableParameter = { itemname: ''};
    dataa:Itemgroup[];
    modal:any;
    additem = new FormGroup({
      itemgroup : new FormControl('',Validators.required)       
    });

    searchitem = new FormGroup({
      itemname : new FormControl('',Validators.required)
    });

    fetchitem = new FormGroup({
        itemgroupname : new FormControl(''),
        itemgroupgid : new FormControl(''),
        itemgroupcid : new FormControl(''),
        itemgroupstatus : new FormControl('')
    });
  
  constructor(private router:Router,private http:HttpClient,private productService:ProductService,private chRef : ChangeDetectorRef) {
    if(sessionStorage.getItem('token')==undefined && sessionStorage.getItem('UserName')==undefined){
        this.router.navigate(['/']);
      }
   }
    ngOnInit() {
        this.datatableCode();
    }
    datatableCode() {
        this.DatatableParameter.itemname = this.searchitem.get('itemname').value;
        const that = this;
        const headers = new HttpHeaders({ 'Content-Type': 'text/plain'});
        this.dtOptions = {
            processing: true,
            serverSide: true,
            dom: 'lrtip',
            lengthMenu:[[5, 10, 25, 50], [5, 10, 25, 50]],
            columnDefs: [
                { orderable: false, targets: 3 }
            ],
            ajax: (dataTablesParameters: any, callback) => {
                Object.assign(dataTablesParameters, this.DatatableParameter);
                that.http.post<DataTablesResponse>('http://api.divyaltech.com/propertydealercrm_backend/index.cfm?action=product.fetch_item&reload=1',Object.assign(dataTablesParameters,this.DatatableParameter), {responseType: 'json', headers}).pipe(takeUntil(this.destroy$)).subscribe(resp =>{
                    that.dataa=resp.data;
                    callback({recordsTotal: resp.recordsTotal,recordsFiltered: resp.recordsTotal,data: []});
                });
            }
        };
        
    }
    ngOnDestroy(): void {
        this.dtTrigger.unsubscribe();
        this.destroy$.next();
        this.destroy$.complete();
    }
    public closeModal(){
        this.closebutton.nativeElement.click();
    }
    redirect(link){
        this.router.navigate(['/'+link]);
    }
    getitem(itemgroupid){
        this.productService.fetchitem(itemgroupid).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
            if(Response.data.length) {
                this.fetchitem.patchValue({
                    itemgroupname : Response.data[0].GroupName,
                    itemgroupgid : Response.data[0].ItemGropuId,
                    itemgroupcid : Response.data[0].companyId
                });
                let status = ""
                if(Response.data[0].status == 1){
                   status = "Enable"
                }else{
                    status = "Disable"
                }
                this.fetchitem.controls.itemgroupstatus.setValue(status)
            }else{
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
    itemSearch(){
        this.datatableCode();
        this.rerender();
    }
    ngAfterViewInit(): void {
        this.dtTrigger.next();
    }
    insertItem(){
        if(this.additem.valid){
            let itemData = new FormData();
            itemData.append('itemgroup',this.additem.get('itemgroup').value);
            this.productService.additem(itemData).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
                if(Response.CODE == 200) {
                    Swal.fire({
                        icon:'success',
                        title:'Success!',
                        text:Response.MESSAGE,
                        showConfirmButton:false,
                        timer:2000
                    });
                    this.reload();
                    this.additem.reset();
                    this.closeModal();
                }else{
                    Swal.fire({
                        icon:'error',
                        title:'Error!',
                        text:'Item Creation Failed',
                        showConfirmButton:false,
                        timer:3000
                    });
                }
            });  
        }else{
            Swal.fire('Alert','Fill all required fields first','info');
        }
    }
    
    updateItem(){
        if(this.fetchitem.valid){
            let itemDatas = new FormData();
            itemDatas.append('itemgroupgid',this.fetchitem.get('itemgroupgid').value);
            itemDatas.append('itemgroupname',this.fetchitem.get('itemgroupname').value);
            itemDatas.append('itemgroupstatus',this.fetchitem.get('itemgroupstatus').value);
            this.productService.updateitem(itemDatas).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
                if(Response.CODE == 200) {
                    Swal.fire({
                        icon:'success',
                        title:'Success!',
                        text:Response.MESSAGE,
                        showConfirmButton:false,
                        timer:2000
                    });
                    this.reload();
                    this.fetchitem.reset();
                    this.closeModal();
                }else{
                    Swal.fire({
                        icon:'error',
                        title:'Error!',
                        text:'Item Updation Failed',
                        showConfirmButton:false,
                        timer:3000
                    });
                }
            });  
        }else{
            Swal.fire('Alert','Fill all required fields first','info');
        }
    }

    deletemployee(itemgroupid){
        Swal.fire({
            title: 'Are you sure?',
            text: 'You want to delete this.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
          }).then((result) => {
            if (result.value) {
                this.productService.deleteitem(itemgroupid).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
                    
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
   
}
