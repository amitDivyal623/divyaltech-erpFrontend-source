import { Component, OnInit,ViewChild,ElementRef, ChangeDetectorRef,OnDestroy ,Injectable,TemplateRef} from '@angular/core';
import { Router } from '@angular/router';
import {FormBuilder, FormControl, FormGroup, Validators, FormArray} from '@angular/forms';
import { Observable,from, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { HrService } from 'src/app/services/hr.service';
import { HttpClient ,HttpHeaders, HttpResponse } from '@angular/common/http';
import { DataTableDirective } from 'angular-datatables';
import { environment } from 'src/environments/environment';
import { ProductService } from '../../services/product.service';
import { AdminService } from '../../services/admin.service';
declare var $;

class DataTablesResponse {
	data: any[];
	draw: number;
	recordsFiltered: number;
	recordsTotal: number;
}

@Component({
  selector: 'app-product-type',
  templateUrl: './product-type.component.html',
  styleUrls: ['./product-type.component.css']
})
export class ProductTypeComponent implements OnInit, OnDestroy {
	submitted: boolean;
	activefield: string;
	productTypeFiled: FormGroup;
	FieldName = [];
	FieldLabel = [];
	FInputName = [];
	PDataType = [];
	prodstatus = [];
	[x: string]: any;
	constructor(private hrservice: HrService, private cd: ChangeDetectorRef, private _fb: FormBuilder, private router: Router, public http: HttpClient, private productService: ProductService,private adminservice:AdminService) { 
		this.productTypeFiled = this._fb.group({
			productArrayForm: this._fb.array([]) 
		});
	}

	ProductType = new FormGroup({
		ProdType:new FormControl('',Validators.required),
		ProdCode:new FormControl('',Validators.required),
		productTypeId:new FormControl('')
	});
	SearchProductType = new FormGroup({
		ProdTypeName:new FormControl('')
	});
	
	dtOptions: DataTables.Settings = {};
	dtTrigger: Subject<any> = new Subject<any>();
	private destroy$ = new Subject<void>();
	@ViewChild(DataTableDirective) dtElement: DataTableDirective;
	@ViewChild('modalbutton') modalbutton;
	@ViewChild('closebutton') closebutton;

	ngOnInit(): void {
		//this.addprod();	
		this.productTypeData();
		this.lookupList();
	}
	DatatableParameter = { CompanyId: '',productTypename : ''};
	AddProdType() {
		this.isButtonDisabled = false;
		this.closeModal();
		this.activefield = '';
		this.ModalHeading = "Add New Product Type";
		this.modalbutton.nativeElement.click();
		this.removeFormArray();
		this.AddFormArrya(1);
		this.ProductType.enable();
		this.activefield = '';
		this.Access = false;
		this.productViewTab = true;
	}
	saveProductType() {
		this.isButtonDisabled = false;
		this.submitted = true;
		if (this.ProductType.valid) {
			this.submitted = false;
			this.isButtonDisabled = true;
			this.FieldName = [];
			this.FieldLabel = [];
			this.FInputName = [];
			this.PDataType = [];
			this.prodstatus = [];
			this.orderBy = [];
			this.storeIn = [];
			this.productFielID = [];
			this.prodTypedata = [];
			for (let i = 0; i < this.productTypeFiled.value.productArrayForm.length; i++){
				this.FieldName.push($('#fieldname_'+i).val())
				this.FieldLabel.push($('#FieldLabel_'+i).val())
				this.FInputName.push($('#fieldinput_'+i).val())
				this.PDataType.push($('#datatype_' + i).val())
				this.orderBy.push($('#ProdOrder_' + i).val())
				this.storeIn.push($('#ProdStore_' + i).val())
				if ($('#ProdData_' + i).val() === undefined) {
					this.prodTypedata.push(' ');
				} else {
					this.prodTypedata.push($('#ProdData_' + i).val());
				}
				this.productFielID.push($('#productFielID_'+i).val())
				if (this.productTypeFiled.value.productArrayForm[i].prodstatus == '' && this.productTypeFiled.value.productArrayForm[i].prodstatus == false) {
					this.prodstatus.push(0)
				} else {
					this.prodstatus.push(1)
				}
			}
			this.FieldName1 = this.FieldName
			this.FieldLabel1 = this.FieldLabel
			this.FInputName1 = this.FInputName
			this.PDataType1 = this.PDataType
			this.prodstatus1 = this.prodstatus
			let PRODType = new FormData();
			PRODType.append('productTypeId',this.ProductType.controls.productTypeId.value);
			PRODType.append('ProdTypeName',this.ProductType.controls.ProdType.value);
			PRODType.append('ProdCode',this.ProductType.controls.ProdCode.value);
			PRODType.append('FieldName',this.FieldName1);
			PRODType.append('FieldLabel',this.FieldLabel1);
			PRODType.append('FInputName',this.FInputName1);
			PRODType.append('PDataType',this.PDataType1);
			PRODType.append('prodstatus',this.prodstatus1);
			PRODType.append('orderedBy',this.orderBy);
			PRODType.append('StoreIn',this.storeIn);
			PRODType.append('data',this.prodTypedata);
			PRODType.append('productFielID',this.productFielID);
			this.productService.addProductTypeData(PRODType).pipe(takeUntil(this.destroy$)).subscribe(Response => {
				if(Response.CODE == 200) {
					Swal.fire({
						icon:'success',
						title:'Success!',
						text:Response.MESSAGE,
						showConfirmButton:false,
						timer:2000
					});
					this.closeModal();
					this.reload();
				}else{
					Swal.fire({
						icon:'error',
						title:'Error!',
						text:'Task Creation Failed',
						showConfirmButton:false,
						timer:3000
					});
				}
			})
		} else {
			this.submitted = true;
			this.isButtonDisabled = false;
			Swal.fire({
				icon:'error',
				title:'Required fields empty',
				text:'Please enter the mandatory fields',
				showConfirmButton:false,
				timer:3000
			});
		}
	}

	productTypeData() {
		this.DatatableParameter.productTypename = this.SearchProductType.controls.ProdTypeName.value;
		const that = this;
		const headers = new HttpHeaders({ 'Content-Type': 'text/plain'});
		this.dtOptions = {      
			processing: true,
			serverSide: true,
			dom: 'lrtip',
			lengthMenu:[[5, 10, 25, 50], [5, 10, 25, 50]],
			// columnDefs: [
			//     { orderable: false, targets: 3 }
			// ],
			ajax: (dataTablesParameters: any,callback) => {
				Object.assign(dataTablesParameters, this.DatatableParameter);
				that.http.post<DataTablesResponse>(environment.APIEndpoint+'product.productTypeList&reload=1',Object.assign(dataTablesParameters,this.DatatableParameter), {responseType: 'json', headers}).pipe(takeUntil(this.destroy$)).subscribe(resp =>{
					that.dataa=resp.data;
					callback({recordsTotal: resp.recordsTotal,recordsFiltered: resp.recordsTotal,data: []});
				});
			}
		};
	}

	get productArray(){
		return this.productTypeFiled.get("productArrayForm") as FormArray
	}
	addprod() {
		if (this.productArray.length >= 7) {
			Swal.fire({
				icon:'warning',
				title:'warning',
				text:'Only 7 filed Allow',
				showConfirmButton:false,
				timer:3000
			});
		} else {
			this.productArray.push(this.newProductTypeFiled());
		}
		
	}
	newProductTypeFiled(): FormGroup {
		return this._fb.group({
		productFielID: ' ',
		FieldName: ' ',
		FieldLabel: ' ',
		FInputName:' ',
		PDataType:' ',
		prodstatus:'',
		ProdData:' ',
		ProdStore:' ',
		ProdOrder:' '
		})
	}
	ngAfterViewInit(): void {
		this.dtTrigger.next();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
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

	closeModal() {
		this.submitted = false;
		this.closebutton.nativeElement.click();
		this.ProductType.reset();
	}

	productTypeView(id) {
		this.removeFormArray();
		let PRODType = new FormData();
		PRODType.append('productTypeId',id);
		this.productService.ProductTypeUpdateData(PRODType).pipe(takeUntil(this.destroy$)).subscribe(Response => {
			this.ProductType.patchValue({
				ProdType:Response.PRODUCTTYPEDATA.DATA[0][3],
				ProdCode:Response.PRODUCTTYPEDATA.DATA[0][2]
			})
			this.AddFormArrya(Response.PRODUCTTYPEFIELDDATA.length);
			setTimeout(() => {
				for (let i = 0; i < Response.PRODUCTTYPEFIELDDATA.length; i++) {
					$('#ProdDataDiv_' + i).hide();
					$('#productFielID_'+i).val(Response.PRODUCTTYPEFIELDDATA[i].productTypeFieldID);
					$('#fieldname_'+i).val(Response.PRODUCTTYPEFIELDDATA[i].FieldName);
					$('#FieldLabel_'+i).val(Response.PRODUCTTYPEFIELDDATA[i].Fieldlabelname);
					$('#fieldinput_'+i).val(Response.PRODUCTTYPEFIELDDATA[i].Fieldinputname);
					$('#datatype_' + i).val(Response.PRODUCTTYPEFIELDDATA[i].dataType);
					$('#ProdData_' + i).val(Response.PRODUCTTYPEFIELDDATA[i].data);
					$('#ProdStore_' + i).val(Response.PRODUCTTYPEFIELDDATA[i].StoreIn);
					$('#ProdOrder_' + i).val(Response.PRODUCTTYPEFIELDDATA[i].orderedBy);
					if (Response.PRODUCTTYPEFIELDDATA[i].dataType == 'select') {
						$('#ProdDataDiv_' + i).show();
					}
					if (Response.PRODUCTTYPEFIELDDATA[i].Status == '1') {
						$('#status_' + i).click();
					}
				}
				this.Access = true;
			}, 500);
		})
		this.activefield = 'active';
		// this.ProductType.disable();
		// this.productTypeFiled.disable();
		this.productViewTab = false;
		this.modalbutton.nativeElement.click();
		this.ModalHeading = 'View Product Type';
	}
		
	productTypeEdit(id) {
		this.removeFormArray();
		let PRODType = new FormData();
		PRODType.append('productTypeId',id);
		this.productService.ProductTypeUpdateData(PRODType).pipe(takeUntil(this.destroy$)).subscribe(Response => {
			this.ProductType.patchValue({
				ProdType:Response.PRODUCTTYPEDATA.DATA[0][3],
				ProdCode: Response.PRODUCTTYPEDATA.DATA[0][2],
				productTypeId:Response.PRODUCTTYPEDATA.DATA[0][0]
			})
			this.AddFormArrya(Response.PRODUCTTYPEFIELDDATA.length);
			setTimeout(() => {
				for (let i = 0; i < Response.PRODUCTTYPEFIELDDATA.length; i++) {
					$('#ProdDataDiv_' + i).hide();
					$('#productFielID_'+i).val(Response.PRODUCTTYPEFIELDDATA[i].productTypeFieldID);
					$('#fieldname_'+i).val(Response.PRODUCTTYPEFIELDDATA[i].FieldName);
					$('#FieldLabel_'+i).val(Response.PRODUCTTYPEFIELDDATA[i].Fieldlabelname);
					$('#fieldinput_'+i).val(Response.PRODUCTTYPEFIELDDATA[i].Fieldinputname);
					$('#datatype_' + i).val(Response.PRODUCTTYPEFIELDDATA[i].dataType);
					$('#ProdData_' + i).val(Response.PRODUCTTYPEFIELDDATA[i].data);
					$('#ProdStore_' + i).val(Response.PRODUCTTYPEFIELDDATA[i].StoreIn);
					$('#ProdOrder_' + i).val(Response.PRODUCTTYPEFIELDDATA[i].orderedBy);
					if (Response.PRODUCTTYPEFIELDDATA[i].Status == '1'){
						$('#status_' + i).click();
					}
					if (Response.PRODUCTTYPEFIELDDATA[i].dataType == 'select') {
						$('#ProdDataDiv_' + i).show();
					}
				}
			}, 500);
		})
		this.Access = false;
		this.activefield = 'active';
		this.ProductType.enable();
		this.modalbutton.nativeElement.click();
		this.ModalHeading = 'Edit Product Type';
		this.productViewTab = true;
	}
	productTypeDelete(id) {
		Swal.fire({
			title: 'Are you sure?',
			text: 'You want to delete this.',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Yes',
			cancelButtonText: 'No'
		}).then((result) => {
			if (result.value) {
				let productTypeForm = new FormData();
				productTypeForm.append('productTypeId',id);
				this.productService.deleteproductType(productTypeForm).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
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
							text:'Employee Delete Failed',
							showConfirmButton:false,
							timer:3000
						});
					}
				});
			}
		})
	}
	removeFormArray() {
		for (let i = 0; i < this.productArray.length; i++){
			this.productArray.removeAt(i);
			i = 0
		}
		this.productArray.removeAt(0);
	}

	AddFormArrya(lenght) {
		for (let i = 1; i <= lenght; i++){
			this.addprod();
		}
	}

	searchProductType() {
		this.productTypeData();
		this.rerender();
	}

	dataTypeChange(e) {
		this.DataTab = false;
		this.divId = e.target.id.split('_');
		$('#ProdDataDiv_' + this.divId[1]).hide();
		if (e.target.value == 'select') {
			$('#ProdDataDiv_' + this.divId[1]).show();
		}
	}

	lookupList() {
		let LookUpData = new FormData();
		 this.adminservice.fetchLookUpTypeList(LookUpData).pipe(takeUntil(this.destroy$)).subscribe(Response => {
			 this.lookupDataList = Response.data;
		})
	}
}
