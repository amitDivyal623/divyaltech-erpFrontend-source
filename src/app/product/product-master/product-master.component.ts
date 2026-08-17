import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { from, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { StringLiteralLike } from 'typescript';
import { DataTableDirective } from 'angular-datatables';
import { environment } from 'src/environments/environment';



class productgroup {
	ProductId: string;
	CompanyId: string;
	ProductName: string;
	Status: string;
}


class DataTablesResponse {
	data: any[];
	draw: number;
	recordsFiltered: number;
	recordsTotal: number;
}

@Component({
	selector: 'app-product-master',
	templateUrl: './product-master.component.html',
	styleUrls: ['./product-master.component.css']
})
export class ProductMasterComponent implements OnInit, OnDestroy {

	isNameSelected: boolean;


	dtOptions: DataTables.Settings = {};
	dtTrigger: Subject<any> = new Subject<any>();
	private destroy$ = new Subject<void>();
	@ViewChild(DataTableDirective) dtElement: DataTableDirective;
	// @ViewChild('closebutton') closebutton;

	DatatableParameter = { ProductName: '', status: '', ProductType: '', block: '', productCategory: '', plotKhasra: '', rawKhasra: '' };
	dataa: productgroup[];
	modal: any;
	[x: string]: any;

	plotKhasraList: any[] = [];
	rawLandKhasraList: any[] = [];
	respKhasra: any[] = [];

	searchproduct = new FormGroup({
		productname: new FormControl('', Validators.required),
		status: new FormControl(null, Validators.required),
		ProductType: new FormControl(null, Validators.required),
		block: new FormControl(null, Validators.required),
		productCategory: new FormControl(null, Validators.required),
		khasra: new FormControl({ value: null, disabled: true }, Validators.required)

	});

	constructor(private router: Router, private http: HttpClient, private productService: ProductService, private chRef: ChangeDetectorRef) {
		if (sessionStorage.getItem('token') == undefined && sessionStorage.getItem('UserName') == undefined) {
			this.router.navigate(['/']);
		}
	}
	route(link: any) {
		this.router.navigate(['/' + link]);
	}

	ngOnInit(): void {
		this.productTypeList();
		this.datatableCode();
		this.isNameSelected = false;
		this.CrmUserRole = false;
		if (sessionStorage.getItem('UserRole') == 'CRM User') {
			this.CrmUserRole = true;
		}
		this.CRMAdmin = false;
		if (sessionStorage.getItem('UserRole') == 'CRM Admin') {
			this.CRMAdmin = true;
		}
		this.khasraList();
	}

	datatableCode() {

		const storedFormValues = JSON.parse(sessionStorage.getItem('productFormValues') || '{}');

		if (storedFormValues && Object.keys(storedFormValues).length > 0) {

			this.searchproduct.patchValue(storedFormValues);

			if (storedFormValues.ProductType) {

				const type = storedFormValues.ProductType;

				if (type === '3F6D5C9C-4D5E-4ABB-861E8E4842623019') {
					this.respKhasra = [...this.plotKhasraList];
				}
				else if (type === 'B6746D43-E68A-45D4-B8F890EDDEAF2499') {
					this.respKhasra = [...this.rawLandKhasraList];
				}

				this.searchproduct.get('khasra')?.enable();
			}

		} else {

			this.searchproduct.reset({
				productname: '',
				status: null,
				ProductType: null,
				block: null,
				productCategory: null,
				khasra: null
			});

			sessionStorage.setItem('productFormValues', JSON.stringify(this.searchproduct.getRawValue()));
		}

		//  Always take latest values from form (single source of truth)
		const formValues = this.searchproduct.getRawValue();
		console.log(formValues);
		const selectedType = formValues.ProductType;
		const selectedKhasra = formValues.khasra;

		//  Assign common params
		this.DatatableParameter.ProductName = formValues.productname;
		this.DatatableParameter.status = formValues.status;
		this.DatatableParameter.ProductType = formValues.ProductType;
		this.DatatableParameter.block = formValues.block;
		this.DatatableParameter.productCategory = formValues.productCategory;

		//  Reset khasra params
		this.DatatableParameter.plotKhasra = '';
		this.DatatableParameter.rawKhasra = '';

		//  Apply condition safely
		if (selectedType && selectedKhasra) {

			const typeName = selectedType.productType_name || selectedType;
			console.log(typeName);

			if (typeName === '3F6D5C9C-4D5E-4ABB-861E8E4842623019') { //Plot
				this.DatatableParameter.plotKhasra = selectedKhasra;
			}
			else if (typeName === 'B6746D43-E68A-45D4-B8F890EDDEAF2499') { //rawLand
				this.DatatableParameter.rawKhasra = selectedKhasra;
			}
		}

		// ---------------- DATATABLE ----------------
		const that = this;
		const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });

		this.dtOptions = {
			processing: true,
			serverSide: true,
			dom: 'lrtip',
			pageLength: 10,
			lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
			columnDefs: [{ orderable: false, targets: 7 }],
			ajax: (dataTablesParameters: any, callback) => {
				Object.assign(dataTablesParameters, this.DatatableParameter);

				that.http.post<DataTablesResponse>(
					environment.APIEndpoint + 'product.fetch_product_data&reload=1', Object.assign(dataTablesParameters, this.DatatableParameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {
						that.dataa = resp.data;
						callback({
							recordsTotal: resp.recordsTotal,
							recordsFiltered: resp.recordsTotal,
							data: []
						});
					});
			}
		};
	}

	productSearch() {
		sessionStorage.setItem('productFormValues', JSON.stringify(this.searchproduct.getRawValue()));
		sessionStorage.getItem(JSON.stringify(this.searchproduct.value));

		if (this.router.url == '/product-master') {

			const storedFormValues = JSON.parse(sessionStorage.getItem('productFormValues'));

			if (storedFormValues) {

				// this.searchproduct.get('productname').setValue(storedFormValues.productname);
				this.datatableCode();
				this.rerender();
			} else {
				console.log('No form values found in sessionStorage.');
			}
		}
	}

	productReset() {

		this.searchproduct.get('productname').setValue('');
		this.searchproduct.get('status').setValue(null);
		this.searchproduct.get('ProductType').setValue(null);
		this.searchproduct.get('block').setValue(null);
		this.searchproduct.get('productCategory').setValue(null);
		this.searchproduct.get('khasra').setValue(null);

		const khasraControl = this.searchproduct.get('khasra');
		khasraControl?.reset();
		khasraControl?.disable();
		this.respKhasra = [];

		sessionStorage.setItem('productFormValues', JSON.stringify(this.searchproduct.getRawValue()));
		this.datatableCode();
		this.rerender();
	}

	ngAfterViewInit(): void {
		this.dtTrigger.next();
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

	ngOnDestroy(): void {
		this.dtTrigger.unsubscribe();
		this.destroy$.next();
		this.destroy$.complete();
	}

	editProduct(id) {
		this.router.navigate(['/product-Details/' + id + '/edit']);
	}
	viewProduct(id) {
		this.router.navigate(['/product-Details/' + id + '/view']);
	}
	deleteproduct(id) {
		Swal.fire({
			title: 'Are you sure?',
			text: 'You want to delete this.',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Yes',
			cancelButtonText: 'No'
		}).then((result) => {
			if (result.value) {
				let ProductList = new FormData();
				ProductList.append('ProductId', id);
				this.productService.deleteProduct(ProductList).pipe(takeUntil(this.destroy$)).subscribe(Response => {
					if (Response) {
						Swal.fire({
							icon: 'success',
							title: 'Success!',
							text: Response.MESSAGE,
							showConfirmButton: false,
							timer: 2000
						});
						this.reload();
					} else {
						Swal.fire({
							icon: 'error',
							title: 'Error!',
							text: 'Product Delete Failed',
							showConfirmButton: false,
							timer: 3000
						});
					}
				});
			}
		})
	}

	productTypeList() {
		let productFormData = new FormData()
		this.productService.fetchProductTypeList(productFormData).pipe(takeUntil(this.destroy$)).subscribe(Response => {
			this.productTypeDataList = Response.data;
		})

		let productCategoryFormData = new FormData()
		this.productService.fetchProductCategoryList(productCategoryFormData).pipe(takeUntil(this.destroy$)).subscribe(Response => {
			this.productCategoryDataList = Response.data;

		})

		let LookUpData = new FormData();
		LookUpData.append('LookupTypeId', 'fc56062f-5974-11eb-b9f1-063127f6ced9')
		this.productService.fetchLookUpDataByID(LookUpData).pipe(takeUntil(this.destroy$)).subscribe(Res => {
			this.lookupDataList = Res.data;

		})


		let LookUpDataBlock = new FormData();
		LookUpDataBlock.append('LookupTypeId', '7a1d6240-cce9-11eb-9bcd-063127f6ced7')
		this.productService.fetchLookUpDataByID(LookUpDataBlock).pipe(takeUntil(this.destroy$)).subscribe(Res => {
			this.blockData = Res.data;
		})
	}

	productTypeData(event: any) {
		const khasraControl = this.searchproduct.get('khasra');

		//  Always clear previous value FIRST
		khasraControl?.reset();
		this.respKhasra = [];

		if (!event) {
			khasraControl?.disable();
			return;
		}

		//  Assign new list
		if (event.productType_name === 'Plot') {
			this.respKhasra = [...this.plotKhasraList];
		}
		else if (event.productType_name === 'RawLAND') {
			this.respKhasra = [...this.rawLandKhasraList];
		}

		//  Enable after setting data
		khasraControl?.enable();
	}

	khasraList() {
		let khasradata = new FormData();
		this.productService.fetch_khasradata(khasradata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
			const data = Response;
			this.plotKhasraList = data.plot || [];
			this.rawLandKhasraList = data.rawLand || [];

			// Initially empty
			this.respKhasra = [];
		});
	}
}
