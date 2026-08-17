import { Component,ViewChild, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable,from, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { HrService } from 'src/app/services/hr.service';
import { HttpClient ,HttpHeaders, HttpResponse } from '@angular/common/http';
import { DataTableDirective } from 'angular-datatables';
import { environment } from 'src/environments/environment';
import { ProductService } from '../../services/product.service';
import { Router } from '@angular/router';

class DataTablesResponse {
	data: any[];
	draw: number;
	recordsFiltered: number;
	recordsTotal: number;
}

@Component({
	selector: 'app-product-category',
	templateUrl: './product-category.component.html',
	styleUrls: ['./product-category.component.css']
})
export class ProductCategoryComponent implements OnInit, OnDestroy {
	private destroy$ = new Subject<void>();
	submitted: boolean;
	activefiled: string;
	[x: string]: any;
	DatatableParameter = { ProdCategoryName: '' };
	
	constructor(private hrservice: HrService, private cd: ChangeDetectorRef, private _fb: FormBuilder, private router: Router, public http: HttpClient, private productService: ProductService,) { }

	ProdCategoryForm = new FormGroup({
		prodCategoryCode:new FormControl(''),
		prodCategoryName:new FormControl('',Validators.required),
		prodSubCategory:new FormControl(''),
		prodCategorystatus:new FormControl(''),
		prodCategoryCodeid:new FormControl('')
	});
	SearchProdCategory = new FormGroup({
		SearchCateforyName:new FormControl('')
	});
	dtOptions: DataTables.Settings = {};
	dtTrigger: Subject<any> = new Subject<any>();
	@ViewChild(DataTableDirective) dtElement: DataTableDirective;
	@ViewChild('modalbutton') modalbutton;
	@ViewChild('closebutton') closebutton;

	ngOnInit(): void {
		this.cateGoryDatatable();
	}

	AddProdCategory() {
		this.save_btn = true;
		this.closeModal();
		this.activefiled = '';
		$("#heading").text('Add New Product Category');
		this.modalbutton.nativeElement.click();
		this.ProdCategoryForm.enable();
		this.cateGoryiewTAb = true;
	}

  	saveProdCategory() {
		this.save_btn = true;
		this.submitted = true;
		if (this.ProdCategoryForm.valid) {
			this.submitted = false;
			this.save_btn = false;
			if (this.ProdCategoryForm.controls.prodCategorystatus.value === true){
				this.categoryStatus = 1;
			} else {
				this.categoryStatus = 0;
			}
			let CategoryForm = new FormData();
			CategoryForm.append('prodCategoryCode',this.ProdCategoryForm.controls.prodCategoryCode.value);
			CategoryForm.append('prodCategoryName',this.ProdCategoryForm.controls.prodCategoryName.value);
			CategoryForm.append('prodSubCategory',this.ProdCategoryForm.controls.prodSubCategory.value);
			CategoryForm.append('prodCategoryCodeid',this.ProdCategoryForm.controls.prodCategoryCodeid.value);
			CategoryForm.append('status',this.categoryStatus);
			this.productService.addProdCategory(CategoryForm).pipe(takeUntil(this.destroy$)).subscribe(Response => {
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
			this.save_btn = true;
			Swal.fire({
				icon:'error',
				title:'Required fields empty',
				text:'Please enter the mandatory fields',
				showConfirmButton:false,
				timer:3000
			});
		}
	}
  	editCategory(id) {
		this.closeModal();
		this.activefiled = 'active';
		let CategoryForm = new FormData();
		CategoryForm.append('productCategoryId',id);
		this.productService.editviewProdCategory(CategoryForm).pipe(takeUntil(this.destroy$)).subscribe(Response => {
			this.ProdCategoryForm.patchValue({
				prodCategoryCodeid:Response.DATA[0][0],
				prodCategoryCode:Response.DATA[0][2],
				prodCategoryName:Response.DATA[0][3],
				prodSubCategory: Response.DATA[0][4],
				prodCategorystatus:Response.DATA[0][5]
			});
		})
		$("#heading").text('Edit Product Category');
		this.modalbutton.nativeElement.click();
		this.ProdCategoryForm.enable();
		this.cateGoryiewTAb = true;
	}

	viewCategory(id) {
		this.closeModal();
		this.activefiled = 'active';
		let CategoryForm = new FormData();
		CategoryForm.append('productCategoryId',id);
		this.productService.editviewProdCategory(CategoryForm).pipe(takeUntil(this.destroy$)).subscribe(Response => {
			this.ProdCategoryForm.patchValue({
				prodCategoryCode:Response.DATA[0][2],
				prodCategoryName:Response.DATA[0][3],
				prodSubCategory: Response.DATA[0][4],
				prodCategorystatus:Response.DATA[0][5]
			});
		})
		$("#heading").text('View Product Category');
		this.modalbutton.nativeElement.click();
		this.ProdCategoryForm.disable();
		this.cateGoryiewTAb = false;
	}
	
  	deleteCategory(id) {
		Swal.fire({
			title: 'Are you sure?',
			text: 'You want to delete this.',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Yes',
			cancelButtonText: 'No'
			}).then((result) => {
				if (result.value) {
				let ProdCategoryForm = new FormData();
				ProdCategoryForm.append('productCategoryId',id);
				this.productService.deleteProdCategory(ProdCategoryForm).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
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
							text:'Product Category Delete Failed',
							showConfirmButton:false,
							timer:3000
						});
					}
				});
			} 
		})
	}

	cateGoryDatatable() {
		this.DatatableParameter.ProdCategoryName = this.SearchProdCategory.controls.SearchCateforyName.value;
		const that = this;
		const headers = new HttpHeaders({ 'Content-Type': 'text/plain'});
		this.dtOptions = {
			processing: true,
			serverSide: true,
			dom: 'lrtip',
			lengthMenu:[[5, 10, 25, 50], [5, 10, 25, 50]],
			columnDefs: [
				{ orderable: false, targets: 5 }
			],
			ajax: (dataTablesParameters: any, callback) => {
				Object.assign(dataTablesParameters, this.DatatableParameter);
				that.http.post<DataTablesResponse>(environment.APIEndpoint+'product.fetch_productCategory&reload=1',Object.assign(dataTablesParameters,this.DatatableParameter), {responseType: 'json', headers}).pipe(takeUntil(this.destroy$)).subscribe(resp =>{
					that.data = resp.data;
					callback({recordsTotal: resp.recordsTotal,recordsFiltered: resp.recordsTotal,data: []});
				});
			}
		};
	}

	closeModal() {
		this.submitted = false;
		this.closebutton.nativeElement.click();
		this.ProdCategoryForm.reset();
	}
	
	ngOnDestroy(): void {
		this.dtTrigger.unsubscribe();
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
	ngAfterViewInit(): void {
		this.dtTrigger.next();
	}

	SearchCetgory() {
		this.cateGoryDatatable();
		this.rerender();
	}
}
