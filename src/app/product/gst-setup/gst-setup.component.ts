import { Component, OnInit,ViewChild,ElementRef, ChangeDetectorRef,OnDestroy ,Injectable,TemplateRef} from '@angular/core';
import { Router } from '@angular/router';
import {FormBuilder, FormControl, FormGroup, Validators, FormArray} from '@angular/forms';
import { Observable,from, Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { HrService } from 'src/app/services/hr.service';
import { HttpClient ,HttpHeaders, HttpResponse } from '@angular/common/http';
import { DataTableDirective } from 'angular-datatables';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ProductService } from '../../services/product.service';

class DataTablesResponse {
	data: any[];
	draw: number;
	recordsFiltered: number;
	recordsTotal: number;
}

@Component({
  selector: 'app-gst-setup',
  templateUrl: './gst-setup.component.html',
  styleUrls: ['./gst-setup.component.css']
})
  
export class GstSetupComponent implements OnInit, OnDestroy {

  constructor(private hrservice: HrService, private cd: ChangeDetectorRef, private _fb: FormBuilder, private router: Router, public http: HttpClient, private productService: ProductService,) {
		if(sessionStorage.getItem('token')==undefined && sessionStorage.getItem('UserName')==undefined){
			this.router.navigate(['/']);
		}
	}
	[x: string]: any;
	DatatableParameter = {searchGSTCode: '',searchparentGSTCode:''};
	
	GSTSetup = new FormGroup({
		GSTsetuID:new FormControl(''),
		GSTCODE:new FormControl('',Validators.required),
		parentGSTCode:new FormControl('',Validators.required),
		IGST:new FormControl('',Validators.required),
		SGST:new FormControl('',Validators.required),
		CGST:new FormControl('',Validators.required)
	});
	searchGSTSetup = new FormGroup({
		searchparentGSTCode:new FormControl(''),
		searchGSTCODE:new FormControl('')
	});
  
  	dtOptions: DataTables.Settings = {};
	dtTrigger: Subject<any> = new Subject<any>();
	private destroy$ = new Subject<void>();
	@ViewChild(DataTableDirective) dtElement: DataTableDirective;
	@ViewChild('modalbutton') modalbutton;
	@ViewChild('closebutton') closebutton;

	ngOnInit(): void {
		this.GSTDatatable();
	}
	AddGSTPopup() {
		this.save_btn = true;
		this.closeModal();
		this.activefiled = '';
		$("#heading").text('Add New GST Code');
		this.modalbutton.nativeElement.click();
		this.GSTSetup.enable();
		this.GSTViewTAb = true;
	}
	saveGstSetup() {
		this.save_btn = true;
		this.submitted = true;
		if (this.GSTSetup.valid) {
			this.submitted = false;
			this.save_btn = false;
			let GSTForm = new FormData();
			GSTForm.append('GSTsetuID',this.GSTSetup.controls.GSTsetuID.value);
			GSTForm.append('GSTCODE',this.GSTSetup.controls.GSTCODE.value);
			GSTForm.append('parentGSTCode',this.GSTSetup.controls.parentGSTCode.value);
			GSTForm.append('IGST',this.GSTSetup.controls.IGST.value);
			GSTForm.append('SGST',this.GSTSetup.controls.SGST.value);
			GSTForm.append('CGST',this.GSTSetup.controls.CGST.value);
			this.productService.addGSTData(GSTForm).pipe(takeUntil(this.destroy$)).subscribe(Response => {
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
	editGSTPopup(id) {
		this.closeModal();
		this.activefiled = 'active';
		let GSTForm = new FormData();
		GSTForm.append('gstSetupId',id);
		this.productService.GSTSetupData(GSTForm).pipe(takeUntil(this.destroy$)).subscribe(Response => {
			this.GSTSetup.patchValue({
				GSTsetuID:Response.DATA[0][0],
				GSTCODE:Response.DATA[0][2],
				parentGSTCode:Response.DATA[0][3],
				IGST:Response.DATA[0][4],
				SGST:Response.DATA[0][5],
				CGST:Response.DATA[0][6]
			});
		})
		$("#heading").text('Edit GST Code');
		this.modalbutton.nativeElement.click();
		this.GSTSetup.enable();
		this.GSTViewTAb = true;
	}
	viewGSTPopup(id) {
		this.closeModal();
		this.activefiled = 'active';
		let GSTForm = new FormData();
		GSTForm.append('gstSetupId',id);
		this.productService.GSTSetupData(GSTForm).pipe(takeUntil(this.destroy$)).subscribe(Response => {
			this.GSTSetup.patchValue({
				GSTsetuID:Response.DATA[0][0],
				GSTCODE:Response.DATA[0][2],
				parentGSTCode:Response.DATA[0][3],
				IGST:Response.DATA[0][4],
				SGST:Response.DATA[0][5],
				CGST:Response.DATA[0][6]
			});
		})
		$("#heading").text('View GST Code');
		this.modalbutton.nativeElement.click();
		this.GSTSetup.disable();
		this.GSTViewTAb = false;
	}

	GSTDatatable() {
		this.DatatableParameter.searchGSTCode = this.searchGSTSetup.controls.searchGSTCODE.value;
		this.DatatableParameter.searchparentGSTCode = this.searchGSTSetup.controls.searchparentGSTCode.value;
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
				that.http.post<DataTablesResponse>(environment.APIEndpoint+'product.gstSetupList&reload=1',Object.assign(dataTablesParameters,this.DatatableParameter), {responseType: 'json', headers}).pipe(takeUntil(this.destroy$)).subscribe(resp =>{
					that.data = resp.data;
					callback({recordsTotal: resp.recordsTotal,recordsFiltered: resp.recordsTotal,data: []});
				});
			}
		}; 
	}

	deleteGST(id) {
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
				UnitForm.append('gstSetupID',id);
				this.productService.deleteGST(UnitForm).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
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
		this.GSTSetup.reset();
	}
	SearchGST() {
		this.GSTDatatable();
		this.rerender();
	}
}
