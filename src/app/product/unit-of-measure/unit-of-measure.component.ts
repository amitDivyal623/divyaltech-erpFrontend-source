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

class DataTablesResponse {
	data!: any[];
	draw!: number;
	recordsFiltered!: number;
	recordsTotal!: number;
}

@Component({
	selector: 'app-unit-of-measure',
	templateUrl: './unit-of-measure.component.html',
	styleUrls: ['./unit-of-measure.component.css']
})
export class UnitOfMeasureComponent implements OnInit, OnDestroy {
	private destroy$ = new Subject<void>();

	constructor(private hrservice: HrService, private cd: ChangeDetectorRef, private _fb: FormBuilder, private router: Router, public http: HttpClient, private productService: ProductService,) {
		if(sessionStorage.getItem('token')==undefined && sessionStorage.getItem('UserName')==undefined){
			this.router.navigate(['/']);
		}
	}
	[x: string]: any;
	DatatableParameter = {searchUOM:'',searchUOMCode:''};

	unitMeasure = new FormGroup({
		measureID:new FormControl(''),
		prod_id:new FormControl('',Validators.required),
		uomName:new FormControl('',Validators.required),
		uomCode:new FormControl('',Validators.required),
		baseUom:new FormControl(''),
		ParentUom:new FormControl(''),
		baseRelation:new FormControl(''),
		ParentRelation:new FormControl(''),
		txtstatus:new FormControl('')
	});

	searchuomForm = new FormGroup({
		searchUOM:new FormControl(''),
		searchUOMCode:new FormControl('')
	});

	dtOptions: DataTables.Settings = {};
	dtTrigger: Subject<any> = new Subject<any>();
	@ViewChild(DataTableDirective) dtElement!: DataTableDirective;
	@ViewChild('modalbutton') modalbutton!: ElementRef;
	@ViewChild('closebutton') closebutton!: ElementRef;
	
	ngOnInit(): void {
		this.uniOfMeasureDatatable();
		this.CrmUserRole = false;
		if(sessionStorage.getItem('UserRole') == 'CRM User'){
				this.CrmUserRole = true;
			}
		this.CRMAdmin = false;
		if (sessionStorage.getItem('UserRole') == 'CRM Admin') {
			this.CRMAdmin = true;
		}

	}

	uniOfMeasureDatatable() {
		this.DatatableParameter.searchUOM = this.searchuomForm.controls.searchUOM.value;
		this.DatatableParameter.searchUOMCode = this.searchuomForm.controls.searchUOMCode.value;
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
				that.http.post<DataTablesResponse>(environment.APIEndpoint+'product.unitOfMeasureList&reload=1',Object.assign(dataTablesParameters,this.DatatableParameter), {responseType: 'json', headers}).pipe(takeUntil(this.destroy$)).subscribe(resp =>{
					that.data = resp.data;
					callback({recordsTotal: resp.recordsTotal,recordsFiltered: resp.recordsTotal,data: []});
				});
			}
		}; 
	}
	
	addPopup() {
		this.save_btn = true;
		this.closeModal();
		this.activefiled = '';
		$("#heading").text('Add New Unit of Measure');
		this.modalbutton.nativeElement.click();
		this.unitMeasure.enable();
		this.UOMViewTAb = true;
	}
	
	SaveUnitMeasure() {
		this.save_btn = true;
		this.submitted = true;
		if (this.unitMeasure.valid) {
			this.save_btn = false;
			this.submitted = false;
			if (this.unitMeasure.controls.txtstatus.value) {
				this.status = '1'	
			} else {
				this.status = '0';
			}
			let UnitForm = new FormData();
			UnitForm.append('measureID',this.unitMeasure.controls.measureID.value);
			UnitForm.append('prod_id',this.unitMeasure.controls.prod_id.value);
			UnitForm.append('uomName',this.unitMeasure.controls.uomName.value);
			UnitForm.append('uomCode',this.unitMeasure.controls.uomCode.value);
			UnitForm.append('baseUom',this.unitMeasure.controls.baseUom.value);
			UnitForm.append('ParentUom',this.unitMeasure.controls.ParentUom.value);
			UnitForm.append('baseRelation',this.unitMeasure.controls.baseRelation.value);
			UnitForm.append('ParentRelation',this.unitMeasure.controls.ParentRelation.value);
			UnitForm.append('status',this.status);
			this.productService.addUnitOfMeasure(UnitForm).pipe(takeUntil(this.destroy$)).subscribe(Response => {
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
			this.save_btn = true;
			this.submitted = true;
			Swal.fire({
				icon:'error',
				title:'Required fields empty',
				text:'Please enter the mandatory fields',
				showConfirmButton:false,
				timer:3000
			});
		}
	}

	editPopup(id: any) {
		this.closeModal();
		this.activefiled = 'active';
		let UnitForm = new FormData();
		UnitForm.append('MeasureId',id);
		this.productService.unitOfMeasureeditData(UnitForm).pipe(takeUntil(this.destroy$)).subscribe(Response => {

			this.unitMeasure.patchValue({
				measureID:Response.DATA[0][0],
				prod_id:Response.DATA[0][2],
				uomName:Response.DATA[0][3],
				uomCode:Response.DATA[0][4],
				baseUom:Response.DATA[0][6],
				ParentUom:Response.DATA[0][7],
				baseRelation:Response.DATA[0][8],
				ParentRelation:Response.DATA[0][9],
				txtstatus:Response.DATA[0][5]
			});
		})
		$("#heading").text('Edit Unit of Measure');
		this.modalbutton.nativeElement.click();
		this.unitMeasure.enable();
		this.UOMViewTAb = true;
	}
	viewPopup(id:any) {
		this.closeModal();
		this.activefiled = 'active';
		let UnitForm = new FormData();
		UnitForm.append('MeasureId',id);
		this.productService.unitOfMeasureeditData(UnitForm).pipe(takeUntil(this.destroy$)).subscribe(Response => {
			this.unitMeasure.patchValue({
				measureID:Response.DATA[0][0],
				prod_id:Response.DATA[0][2],
				uomName:Response.DATA[0][3],
				uomCode: Response.DATA[0][4],
				baseUom:Response.DATA[0][6],
				ParentUom:Response.DATA[0][7],
				baseRelation:Response.DATA[0][8],
				ParentRelation:Response.DATA[0][9],
				txtstatus:Response.DATA[0][5]
			});
		})
		$("#heading").text('View Unit of Measure');
		this.modalbutton.nativeElement.click();
		this.unitMeasure.disable();
		this.UOMViewTAb = false;
	}

	deleteUnitMeasure(id:any) {
		Swal.fire({
			title: 'Are you sure?',
			text: 'You want to delete this.',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Yes',
			cancelButtonText: 'No'
			}).then((result) => {
				if (result.value) {
				let UnitForm = new FormData();
				UnitForm.append('MeasureId',id);
				this.productService.deleteMeasure(UnitForm).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
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

	closeModal() {
		this.submitted = false;
		this.closebutton.nativeElement.click();
		this.unitMeasure.reset();
	}

	searchUOM() {
		this.uniOfMeasureDatatable();
		this.rerender();
	}
}
