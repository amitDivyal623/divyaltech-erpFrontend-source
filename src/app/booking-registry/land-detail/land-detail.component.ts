import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild,AfterViewInit, OnDestroy, Injectable, Input } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbCalendar, NgbDateAdapter, NgbDate,NgbModule , NgbDateParserFormatter, NgbDateStruct, NgbInputDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { DataTableDirective } from 'angular-datatables';
import { BillingService } from 'src/app/services/billing.service';
import { ActivatedRoute, Router } from '@angular/router';
import { from, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
import { DatePipe } from '@angular/common';
import { HrService } from 'src/app/services/hr.service';
import { CrmService } from 'src/app/services/crm.service';

import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

class DataTablesResponse {
	data: any[];
	draw: number;
	recordsFiltered: number;
	recordsTotal: number;
}
class landlordLand {

	title: any;
  landlords_name: any;
  reg_area:  any;
  reg_address: any;
  reg_city: any;
  reg_tah : any;
  reg_state: any;
  reg_country : any;
  reg_pincode : any;
  reg_caste : any;
  mobile_number : any;
  alt_mobile_number : any;
  pan_number : any;
  adhar_number : any;
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

/**
 * This Service handles how the date is rendered and parsed from keyboard i.e. in the bound input field.
 */
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
  selector: 'app-land-detail',
  templateUrl: './land-detail.component.html',
  styleUrls: ['./land-detail.component.css']
})
export class LandDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  @Input() Landlord_id = "test"
  pipe = new DatePipe('en-US');
  date = new Date();
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  @ViewChild('closelandmodal') closelandmodal;
  @ViewChild('content') content;
  data: landlordLand[];
  productdata = [];
  productdataList = [];
  keyword = 'name';
  PopupTitle: string;
  landDetails = new FormGroup({
    reglandlord_Id: new FormControl(''),
    product_id : new FormControl(''),
    // landType:new FormControl('',Validators.required),
    khasraNumber:new FormControl('',Validators.required),
  });
  landlordtitle: string;
  DatatableParameters: { productCategory: any,landlordID:any};
  submitted: boolean;
  model: any;
  productSuggestion: any;
  product: any;
  constructor(private modalService: NgbModal, private cd: ChangeDetectorRef, private _fb: FormBuilder, private billingservice: BillingService, private route: Router, public http: HttpClient, private activatedRoute: ActivatedRoute, private hrservice: HrService, private CrmService:CrmService) {
    this.DatatableParameters = {productCategory:'' ,landlordID:''};
  }

  ngOnInit(): void {
    this.datatableCode();
  }
  datatableCode() {
    this.DatatableParameters.productCategory = '07E264FD-BC8B-48A5-82E0F2ED0B848EE6';
    this.DatatableParameters.landlordID = this.Landlord_id;

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
				Object.assign(dataTablesParameters, this.DatatableParameters);
        that.http.post<DataTablesResponse>(environment.APIEndpoint + 'reg_landdetails.fetch_product&reload=1', Object.assign(dataTablesParameters, this.DatatableParameters), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {
          that.data = resp.data;
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
	ngAfterViewInit(): void {
		this.dtTrigger.next();
  }
  selectEvent(e) {
    this.landDetails.get('product_id').setValue(e.id);
    this.productdataList = [];
  }
  onChangeSearch(e) {
    if(e.length >= 1) {
      this.productlistData(e);
    } else {
      this.productdataList = [];
    }
  }
  onFocused(e) {}
  productlistData(e) {
    let productlist = new FormData();
    productlist.append('value', e);
    productlist.append('type', 'RowLAND');
    this.CrmService.getproduct(productlist).pipe(takeUntil(this.destroy$)).subscribe((resp) => {
      console.log(resp);
			this.productdata = [];
      let i;
			this.product = resp.data;
      for (i = 0; i < this.product.length; i++) {
        this.productdata.push({
          id: this.product[i].ProductId,
          name: this.product[i].khasraNumber,
          productName: this.product[i].ProductName
        });
      }

      this.productdataList = [this.productdata];
      this.productdataList = this.productdataList[0];
    });
  }

  add_landDetails() {
    let landDetailsdata = new FormData();
     const id = this.activatedRoute.snapshot.paramMap.get('id');
    landDetailsdata.append('reglandlord_Id', id);
    landDetailsdata.append('product_id', this.landDetails.get('product_id').value);
    // stop here if form is invalid
    this.billingservice.add_landDetail(landDetailsdata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
      if (Response.CODE == 200) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: Response.MESSAGE,
          showConfirmButton: false,
          timer: 2000
        });
        // this.rerender();
        this.landDetails.reset();
        this.reload();
        this.model.close();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Field required!',
          showConfirmButton: false,
          timer: 3000
        });
      }
    });
  }

   update_landDetails(landDetailsId) {
    Swal.fire({
      title: 'Are You Sure ?',
      icon: 'question',      
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
      showCancelButton: true,
    }).then((result) => {
      if(result.isConfirmed){
        let landDetailsdata = new FormData();
        //const id = this.activatedRoute.snapshot.paramMap.get('id');
        landDetailsdata.append('landDetailsId', landDetailsId);
        this.billingservice.add_landDetail(landDetailsdata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
          if (Response.CODE == 200) {
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: Response.MESSAGE,
              showConfirmButton: false,
              timer: 2000
            });
            this.rerender();
            this.reload();
            this.landDetails.reset();
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Field required!',
              showConfirmButton: false,
              timer: 3000
            });
          }
        });
      }
    });

  }
  editLand(id){
    let patchData = new FormData();
    patchData.append('reglandlord_Id',id);

    this.billingservice.getAttorneydata(patchData).pipe(takeUntil(this.destroy$)).subscribe(Response => {
      if (Response.data) {
        this.landDetails.patchValue({
          attLandlordId: Response.data[0].attLandlordId,
          AttorneyId: Response.data[0].AttorneyId,
          landType: Response.data[0].poa_name,
          khasraNumber: Response.data[0].khasra_number,
        })
      }

    })
    this.PopupTitle = "Edit Land";
    this.closelandmodal.nativeElement.click();
  }
  viewLand(id){
    let patchData = new FormData();
    patchData.append('AttorneyId',id);
    this.billingservice.getAttorneydata(patchData).pipe(takeUntil(this.destroy$)).subscribe(Response => {
      if (Response.data) {
        this.landDetails.patchValue({
          attLandlordId: Response.data[0].attLandlordId,
          AttorneyId: Response.data[0].AttorneyId,
          landType: Response.data[0].poa_name,
          khasraNumber: Response.data[0].khasra_number,
        })
      }
    })
    this.landDetails.disable();
    this.PopupTitle = "View Land";
    this.closelandmodal.nativeElement.click();
  }
  openLandButton(){
    this.landDetails.reset();
    this.model = this.modalService.open(this.content);
    this.PopupTitle = "Add New Land";
  }
  rerender():void{
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
  public closeModal() {
    this.closelandmodal.nativeElement.click();
  }
}
