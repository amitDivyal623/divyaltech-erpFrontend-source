import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, OnDestroy, Injectable, TemplateRef, ViewChildren } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { Observable, from, Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { HrService } from 'src/app/services/hr.service';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { DataTableDirective } from 'angular-datatables';
import { environment } from 'src/environments/environment';
import { ProductService } from '../../../services/product.service';
import { takeUntil } from 'rxjs/operators';


@Component({
	selector: 'app-add-product-master',
	templateUrl: './add-product-master.component.html',
	styleUrls: ['./add-product-master.component.css']
})
export class AddProductMasterComponent implements OnInit, OnDestroy {
	private destroy$ = new Subject<void>();
	@ViewChildren('data') data: ElementRef;
	private pendingEditProductData: any = null;
	private masterDataLoaded = {
		productType: false,
		productCategory: false,
		uom: false
	};
	constructor(private hrservice: HrService, private cd: ChangeDetectorRef, private _fb: FormBuilder, private router: Router, public http: HttpClient, private productService: ProductService, private activatedRoute: ActivatedRoute) {
		if (sessionStorage.getItem('UserId') == undefined && sessionStorage.getItem('UserName') == undefined && sessionStorage.getItem('CompanyId') == undefined) {
			this.router.navigate(['/']);
		}
	}
	[x: string]: any;
	isPlotSelected: boolean = false;
	landlordsData: any[] = [];
	isEditMode: boolean = false;
	rawKhasraList: any[] = [];
	productForm = new FormGroup({
		productCode: new FormControl('', Validators.required),
		productName: new FormControl('', Validators.required),
		GSTCODE: new FormControl(''),
		uom: new FormControl(''),
		//produc  tgroup:new FormControl(''),
		product_id: new FormControl(''),
		productCategory: new FormControl(''),
		ProductType: new FormControl(''),
		purchaseRate: new FormControl(''),
		salesRate: new FormControl('', [Validators.pattern(/^\d+$/)]),
		Quantity: new FormControl(''),
		productDescription: new FormControl(''),
		plotName: new FormControl(''),
		ownerName: new FormControl(''),
		isNonRectangular: new FormControl(false),
		// Facing:new FormControl(''),
		// Block:new FormControl(''),
		// LandUse:new FormControl(''),
		// FrontLength:new FormControl(''),
		// DepthLength:new FormControl(''),
		// Status:new FormControl(''),
		// KhasraNo:new FormControl(''),
		// SizeAcre:new FormControl('',[Validators.required,Validators.pattern(/^[.\d]+$/)]),
		// SizeHect:new FormControl(''),
		// RinPustika:new FormControl(''),
		// LandDetail:new FormControl('')
		custom1: new FormControl(''),  // Facing
		custom2: new FormControl(''),  // Block
		custom3: new FormControl(''),  // Raw Land Khasra No
		custom4: new FormControl(''),  // Front Length
		custom5: new FormControl(''),  // Depth Length
		custom6: new FormControl(''),  // Mouja
		custom7: new FormControl(''),  // Plot Khasra No
		custom8: new FormControl(''),  // Size in Acre
		custom9: new FormControl(''),  // Size in Hectare
		custom10: new FormControl(''), // Land Use
		custom11: new FormControl(''), // Rin Pustika
		custom12: new FormControl(''), // Status
		custom13: new FormControl(''),  // Size in Sq Ft
		custom14: new FormControl('') // Enter all sides
	});

	ngOnInit(): void {

		this.productTypeList();
		this.getRawKhasraList();
		this.productSubmitButton = true;
		const id = this.activatedRoute.snapshot.paramMap.get('id');
		const method = this.activatedRoute.snapshot.paramMap.get('method');
		this.heading = "Add Product";
		if (method == "edit" || method == "view") {
			this.isEditMode = true;
			this.heading = "Edit Product";
			this.activefield = "active";
			$('.form-control').parents(".md-outline").find('label').addClass('active');
			let productData = new FormData()
			productData.append('CompanyId', sessionStorage.getItem('CompanyId'));
			productData.append('productId', id);
			this.productService.getProductsAllData(productData).pipe(takeUntil(this.destroy$)).subscribe(Response => {

				this.pendingEditProductData = Response?.[0] || null;
				this.tryPatchEditProductData();
			})
			if (method == "view") {
				this.heading = "View Product";
				this.productForm.disable();
				this.productSubmitButton = false;
			}
		}
		this.getLandlordsLists();


		this.productForm.get('custom2').valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
			this.setProductNameFromPlot();
		});

		this.productForm.get('plotName').valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
			this.setProductNameFromPlot();
		});

		this.productForm.get('ownerName').valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
			this.setProductForRawLand();
		});

		this.productForm.get('custom3').valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
			this.setProductForRawLand();
		});

		this.productForm.get('custom4').valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
			this.calculateTotalQuantity();
		});

		this.productForm.get('custom5').valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
			this.calculateTotalQuantity();
		});

		this.productForm.get('custom8').valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => {
			const acre = parseFloat(value) || 0;

			const hectare = acre * 0.404686;
			const sqft = acre * 43560;

			this.productForm.patchValue({
				custom9: hectare ? hectare.toFixed(6) : '',
				custom13: sqft ? sqft.toFixed(2) : '',
				Quantity: sqft ? sqft.toFixed(2) : ''
			}, { emitEvent: false });
		});
	}

	private tryPatchEditProductData() {
		if (!this.pendingEditProductData) {
			return;
		}

		if (!this.masterDataLoaded.productType || !this.masterDataLoaded.productCategory || !this.masterDataLoaded.uom) {
			return;
		}

		const productData = this.pendingEditProductData;

		this.productTypeData(productData.ProductType, {
			resetIdentityFields: false,
			autoAssignCategory: false,
			autoAssignUom: false
		});

		// Derive checkbox state from actual data: if Length or Depth values are present
		// the plot is rectangular regardless of what the stored flag says.
		// This guards against the flag being stale (e.g. DB returns 1 while dimensions exist).
		const hasLengthOrDepth = !!(productData.custom4 || productData.custom5);
		const hasSidesOnly = !!productData.custom14 && !hasLengthOrDepth;
		const resolvedIsNonRect = hasLengthOrDepth
			? false
			: (hasSidesOnly ? true : !!productData.isNonRectangular);

		this.productForm.patchValue({
			product_id: productData.ProductId || productData.product_id || '',
			ProductType: productData.ProductType || '',
			productCategory: productData.ProductCategory || this.productForm.get('productCategory')?.value || '',
			uom: productData.UOM || this.productForm.get('uom')?.value || '',
			Quantity: productData.TotalAvailableQuantity || productData.Quantity || '',
			plotName: productData.plotName || productData.plotName || '',
			custom1: productData.custom1,   // Facing
			custom2: productData.custom2,   // Block
			custom3: productData.custom3,   // Raw Land Khasra No
			custom4: productData.custom4,   // Front Length
			custom5: productData.custom5,   // Depth Length
			custom6: productData.custom6,   // Mouja
			custom7: productData.custom7,   // Plot Khasra No
			custom8: productData.custom8,   // Size in Acre
			custom9: productData.custom9,   // Size in Hectare
			custom10: productData.custom10, // Land Use
			custom11: productData.custom11, // Rin Pustika
			custom12: productData.custom12, // Status
			custom13: productData.custom13, // Size in Sq Ft
			custom14: productData.custom14, // enter all sides
			isNonRectangular: resolvedIsNonRect,

			productCode: productData.ProductCode,
			productName: productData.ProductName,
			salesRate: productData.SalesRate ? String(Math.floor(Number(productData.SalesRate))) : '',
			productDescription: productData.ProductDescription,
			ownerName: productData.ownerName || ''
		}, { emitEvent: false });

		if (resolvedIsNonRect) {
			this.productForm.get('custom4')?.disable({ emitEvent: false }); // Front Length
			this.productForm.get('custom5')?.disable({ emitEvent: false }); // Depth Length
		} else {
			this.productForm.get('custom4')?.enable({ emitEvent: false });
			this.productForm.get('custom5')?.enable({ emitEvent: false });
		}

		if (this.isEditMode) {
			this.productForm.get('ownerName')?.disable({ emitEvent: false });
		}

		this.pendingEditProductData = null;
	}

	// setProductNameFromPlot() {
	// 	const blockId = this.productForm.get('custom2').value;
	// 	const plotName = this.productForm.get('plotName').value;

	// 	const selectedBlock = this.lookupDataList2?.find(
	// 		x => x.LookupDataId === blockId
	// 	);

	// 	const blockName = selectedBlock?.LookupValue;

	// 	if (blockName && plotName) {
	// 		//  Product Name
	// 		const productName = `${blockName} ${plotName}`;

	// 		//  Extract "A" from "Block-A"
	// 		const blockCodePart = blockName.split('-')[1] || blockName;

	// 		//  Product Code => A-34
	// 		const productCode = `${blockCodePart}-${plotName}`;

	// 		this.productForm.patchValue({
	// 			productName: productName,
	// 			productCode: productCode
	// 		}, { emitEvent: false });
	// 	}
	// }

	setProductNameFromPlot() {

		const blockId = this.productForm.get('custom2').value;
		const plotName = this.productForm.get('plotName').value;

		const selectedBlock = this.lookupDataList2?.find(
			x => x.LookupDataId === blockId
		);

		const blockName = selectedBlock?.LookupValue;

		if (blockName && plotName) {

			// Extract H from Block-H
			const blockCodePart = blockName.split('-')[1] || blockName;

			// Product Name => Block H-329
			const productName = `Block ${blockCodePart}-${plotName}`;

			// Product Code => H-329
			const productCode = `${blockCodePart}-${plotName}`;

			this.productForm.patchValue({
				productName: productName,
				productCode: productCode
			}, { emitEvent: false });
		}
	}


	setProductForRawLand() {
		// Only apply when RawLand is selected
		if (!this.isRawLandSelected) return;

		const ownerId = this.productForm.get('ownerName').value;
		const khasraNo = this.productForm.get('custom3').value;

		// Get Owner Name from list
		const selectedOwner = this.landlordsData?.find(
			x => x.landlord_id === ownerId
		);

		const ownerName = selectedOwner?.landlord_name;

		if (ownerName && khasraNo) {
			const productName = `${khasraNo}_${ownerName}`;
			const productCode = `Land_${khasraNo}`;

			this.productForm.patchValue({
				productName: productName,
				productCode: productCode
			}, { emitEvent: false });
		}
	}


	getLandlordsLists() {
		let formData = new FormData();
		this.productService.getLandLordsLists(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
			this.landlordsData = resp;
		})
	}



	productSubmit() {
		//this.isButtonDisabled = false;
		this.submitted = true;
		if (this.productForm.valid) {
			this.isButtonDisabled = true;
			this.submitted = false;
			const form = document.querySelector('form');

			let productFormData = new FormData(form)
			productFormData.append('CompanyId', sessionStorage.getItem('CompanyId'));
			productFormData.append('UserId', sessionStorage.getItem('UserId'));
			productFormData.append('product_id', this.productForm.get('product_id')?.value || '');
			productFormData.append('productCode', this.productForm.get('productCode')?.value || '');
			productFormData.append('productName', this.productForm.get('productName')?.value || '');
			productFormData.append('GSTCODE', this.productForm.get('GSTCODE')?.value || '');
			productFormData.append('uom', this.productForm.get('uom')?.value || '');
			productFormData.append('productCategory', this.productForm.get('productCategory')?.value || '');
			productFormData.append('ProductType', this.productForm.get('ProductType')?.value || '');
			productFormData.append('purchaseRate', this.productForm.get('purchaseRate')?.value || '');
			productFormData.append('salesRate', this.productForm.get('salesRate')?.value || '');
			productFormData.append('Quantity', this.productForm.get('Quantity')?.value || '');
			productFormData.append('productDescription', this.productForm.get('productDescription')?.value || '');
			productFormData.append('plotName', this.productForm.get('plotName')?.value || '');
			productFormData.append('ownerName', this.productForm.get('ownerName')?.value || '');
			productFormData.append('custom1', this.productForm.get('custom1')?.value || '');   // Facing
			productFormData.append('custom2', this.productForm.get('custom2')?.value || '');   // Block
			productFormData.append('custom3', this.productForm.get('custom3')?.value || '');   // Raw Land Khasra No
			productFormData.append('custom4', this.productForm.get('custom4')?.value || '');   // Front Length
			productFormData.append('custom5', this.productForm.get('custom5')?.value || '');   // Depth Length
			productFormData.append('custom6', this.productForm.get('custom6')?.value || '');   // Mouja
			productFormData.append('custom7', this.productForm.get('custom7')?.value || '');   // Plot Khasra No
			productFormData.append('custom8', this.productForm.get('custom8')?.value || '');   // Size in Acre
			productFormData.append('custom9', this.productForm.get('custom9')?.value || '');   // Size in Hectare
			productFormData.append('custom10', this.productForm.get('custom10')?.value || ''); // Land Use
			productFormData.append('custom11', this.productForm.get('custom11')?.value || ''); // Rin Pustika
			productFormData.append('custom12', this.productForm.get('custom12')?.value || ''); // Status
			productFormData.append('custom13', this.productForm.get('custom13')?.value || ''); // Size in Sq Ft
			productFormData.append('isNonRectangular', this.productForm.get('isNonRectangular')?.value || false);
			productFormData.append('custom14', this.productForm.get('custom14')?.value || ''); // Enter all sides

			this.productService.addproduct(productFormData).pipe(takeUntil(this.destroy$)).subscribe(Response => {
				if (Response.CODE == 200) {
					Swal.fire({
						icon: 'success',
						title: 'Success!',
						text: Response.MESSAGE,
						showConfirmButton: false,
						timer: 2000
					});
					this.router.navigate(['/product-master']);
				} else {
					Swal.fire({
						icon: 'error',
						title: 'Error!',
						text: 'Task Creation Failed',
						showConfirmButton: false,
						timer: 3000
					});
				}
			})
		} else {
			this.submitted = true;
			this.isButtonDisabled = false;
			Swal.fire({
				icon: 'error',
				title: 'Required fields empty',
				text: 'Please enter the mandatory fields',
				showConfirmButton: false,
				timer: 3000
			});
		}
	}

	productTypeData(e, options: any = {}) {
		const {
			resetIdentityFields = true,
			autoAssignCategory = true,
			autoAssignUom = true
		} = options;

		if (resetIdentityFields) {
			this.productForm.controls['productCode'].reset();
			this.productForm.controls['productName'].reset();
		}

		this.AdditionalDetails = true;

		if (e == 'B6746D43-E68A-45D4-B8F890EDDEAF2499') {
			this.Condition1 = true;
			this.Condition2 = false;
		}
		else if (e == '3F6D5C9C-4D5E-4ABB-861E8E4842623019') {
			this.Condition2 = true;
			this.Condition1 = false;
		}
		else {
			this.AdditionalDetails = false;
		}

		// reset flags every time (important)
		this.isPlotSelected = false;
		this.isRawLandSelected = false;

		this.productForm.patchValue({
			isNonRectangular: false
		});
		this.productForm.get('custom4')?.enable();
		this.productForm.get('custom5')?.enable();


		//  Get selected Product Type name from list
		const selectedType = this.productTypeDataList?.find(
			x => x.productTypeId === e
		);

		if (selectedType) {
			const typeName = selectedType.productType_name?.replace(/\s+/g, '').toLowerCase();

			//  Show/hide Block/Plot field
			this.isPlotSelected = (typeName === 'plot');
			// RawLand logic
			this.isRawLandSelected = (typeName === 'rawland');


			// Khasra No (Plot) is mandatory only when Plot is selected
			const custom7Control = this.productForm.get('custom7');
			if (this.isPlotSelected) {
				custom7Control?.setValidators([Validators.required]);
			} else {
				custom7Control?.clearValidators();
				custom7Control?.setValue('', { emitEvent: false });
			}
			custom7Control?.updateValueAndValidity({ emitEvent: false });

			if (this.isRawLandSelected) {
				this.getLandlordsLists();
			} else {
				// reset owner field when not RawLand
				// this.productForm.patchValue({
				// 	ownerName: ''
				// });
			}


			// existing category logic
			const finishedGoods = this.productCategoryDataList?.find(
				x => x.productCategoryName?.trim().toLowerCase() === 'finished goods'
			);

			const rawMaterial = this.productCategoryDataList?.find(
				x => x.productCategoryName?.trim().toLowerCase() === 'raw material'
			);

			if (autoAssignCategory) {
				if (typeName === 'plot' && finishedGoods) {
					this.productForm.patchValue({
						productCategory: finishedGoods.productCategoryId
					});
				} else if (typeName === 'rawland' && rawMaterial) {
					this.productForm.patchValue({
						productCategory: rawMaterial.productCategoryId
					});
				}
			}

			// ✅ UOM AUTO-SELECTION LOGIC
			if (autoAssignUom && this.productUOMDataList && this.productUOMDataList.length > 0) {
				let selectedUOM = null;

				if (typeName === 'plot') {
					selectedUOM = this.productUOMDataList.find(
						u => u.uom_name?.toLowerCase() === 'square feet' || u.uom_name?.toLowerCase() === 'sq ft'
					);
				}

				if (typeName === 'rawland') {
					selectedUOM = this.productUOMDataList.find(
						u => u.uom_name?.toLowerCase() === 'acres' || u.uom_name?.toLowerCase() === 'acre'
					);
				}

				if (selectedUOM) {
					this.productForm.patchValue({
						uom: selectedUOM.Unit_of_MeasureId
					});
				}
			}
		}



		this.Facing = 'e544bd3f-caa1-11eb-9bcd-063127f6ced7';
		this.block = '7a1d6240-cce9-11eb-9bcd-063127f6ced7';
		this.status = 'fc56062f-5974-11eb-b9f1-063127f6ced9';
		this.landUse = 'fc56062f-5974-11eb-b9f1-063127f6ced8';




		let LookUpData = new FormData();
		LookUpData.append('CompanyId', sessionStorage.getItem('CompanyId'));
		LookUpData.append('LookupTypeId', this.landUse);
		this.productService.fetchLookUpDataByID(LookUpData).pipe(takeUntil(this.destroy$)).subscribe(Res => {
			this.lookupDataList = Res.data;
		});

		let LookUpData1 = new FormData();
		LookUpData1.append('CompanyId', sessionStorage.getItem('CompanyId'));
		LookUpData1.append('LookupTypeId', this.Facing);
		this.productService.fetchLookUpDataByID(LookUpData1).pipe(takeUntil(this.destroy$)).subscribe(Res => {
			this.lookupDataList1 = Res.data;
		});

		let LookUpData2 = new FormData();
		LookUpData2.append('CompanyId', sessionStorage.getItem('CompanyId'));
		LookUpData2.append('LookupTypeId', this.block);
		this.productService.fetchLookUpDataByID(LookUpData2).pipe(takeUntil(this.destroy$)).subscribe(Res => {
			this.lookupDataList2 = Res.data;
		});

		let LookUpData3 = new FormData();
		LookUpData3.append('CompanyId', sessionStorage.getItem('CompanyId'));
		LookUpData3.append('LookupTypeId', this.status);
		this.productService.fetchLookUpDataByID(LookUpData3).pipe(takeUntil(this.destroy$)).subscribe(Res => {
			this.lookupDataList3 = Res.data;
		});

	}

	productTypeList() {
		let productFormData = new FormData()
		productFormData.append('CompanyId', sessionStorage.getItem('CompanyId'));
		this.productService.fetchProductTypeList(productFormData).pipe(takeUntil(this.destroy$)).subscribe(Response => {
			this.productTypeDataList = Response.data;
			this.masterDataLoaded.productType = true;
			this.tryPatchEditProductData();
		})

		let productUOMFormData = new FormData()
		productUOMFormData.append('CompanyId', sessionStorage.getItem('CompanyId'));
		this.productService.fetchProductUOMList(productUOMFormData).pipe(takeUntil(this.destroy$)).subscribe(Response => {
			this.productUOMDataList = Response.data;
			this.masterDataLoaded.uom = true;
			this.tryPatchEditProductData();
		})
		// let productGroupFormData = new FormData()
		// productGroupFormData.append('CompanyId',sessionStorage.getItem('CompanyId'));
		// this.productService.fetchProductGroupList(productGroupFormData).subscribe(Response => {
		// 	this.productGroupDataList = Response.data;
		// })
		let productCategoryFormData = new FormData()
		productCategoryFormData.append('CompanyId', sessionStorage.getItem('CompanyId'));
		this.productService.fetchProductCategoryList(productCategoryFormData).pipe(takeUntil(this.destroy$)).subscribe(Response => {
			this.productCategoryDataList = Response.data;
			this.masterDataLoaded.productCategory = true;
			this.tryPatchEditProductData();
		})
	}
	oncheckProductName(value) {
		let productnameFormData = new FormData()
		productnameFormData.append('ProductName', value);
		productnameFormData.append('ProductCode', '');
		this.productService.fetchProductname(productnameFormData).pipe(takeUntil(this.destroy$)).subscribe(Response => {
			if (Response.data == true) {
				Swal.fire({
					icon: 'error',
					title: 'Error!',
					text: 'Product Name already exists!',
					showConfirmButton: false,
					timer: 2000
				});
			}
		})
	}
	oncheckProductCode(value) {
		let productCodeFormData = new FormData()
		productCodeFormData.append('ProductName', '');
		productCodeFormData.append('ProductCode', value);
		this.productService.fetchProductname(productCodeFormData).pipe(takeUntil(this.destroy$)).subscribe(Response => {
			if (Response.data == true) {
				Swal.fire({
					icon: 'error',
					title: 'Error!',
					text: 'Product Code already exists!',
					showConfirmButton: false,
					timer: 2000
				});
			}
		})
	}

	onNonRectangularChange(event: any) {
		const isChecked = event.target.checked;

		if (isChecked) {
			this.productForm.get('custom4')?.disable();
			this.productForm.get('custom5')?.disable();
		} else {
			this.productForm.get('custom4')?.enable();
			this.productForm.get('custom5')?.enable();
		}
	}

	onSalesRateInput(event: any) {
		const input = event.target;
		const intOnly = input.value.replace(/[^\d]/g, '');
		input.value = intOnly;
		this.productForm.get('salesRate')?.setValue(intOnly, { emitEvent: false });
	}

	calculateTotalQuantity() {
		//  Skip calculation if Non-Rectangular
		if (this.productForm.get('isNonRectangular')?.value) {
			return;
		}

		const frontLength = parseFloat(this.productForm.get('custom4').value) || 0;
		const depthLength = parseFloat(this.productForm.get('custom5').value) || 0;

		const total = frontLength * depthLength;

		this.productForm.patchValue({
			Quantity: total
		}, { emitEvent: false });
	}

	getRawKhasraList() {
		this.productService.getRawKhasraList(new FormData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
			console.log(resp);
			this.rawKhasraList = resp;
		});
	}

	ngOnDestroy() {
		this.destroy$.next();
		this.destroy$.complete();
	}

}

