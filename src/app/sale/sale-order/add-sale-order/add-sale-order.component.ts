import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CrmService } from 'src/app/services/crm.service';
import { HrService } from 'src/app/services/hr.service';
import {NgSelectModule, NgOption} from '@ng-select/ng-select';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-add-sale-order',
  templateUrl: './add-sale-order.component.html',
  styleUrls: ['./add-sale-order.component.css']
})
export class AddSaleOrderComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  @ViewChild('content') content;
  customerSuggestion: any;
  
  selectedCity:any;
  minDate = {year: 1900, month: 1, day: 1};
  maxDate = {year: 2099, month: 12, day: 31};
  productList:FormGroup;
  employee: [];
  customerdataList = [];
  customerData= [];
  productdataList=[];
  productdata = [];
  keyword = 'name';
  typeCGST : boolean;
  typeSGST : boolean;
  typeIGST : boolean;
  onerow: boolean;
  tworow: boolean;
  thridrow: boolean;
  model: any;
  PopupTitle: string;
  product: any;
  id: number;
  constructor(private fb:FormBuilder, private hrservice:HrService, private crmservice:CrmService,private modalService: NgbModal, private productService : ProductService) { 
    this.productList = fb.group({
      products : fb.array([])
    })
  }
  CreateNewCustomer(){
    this.model = this.modalService.open(this.content,{size: 'lg'});
    this.PopupTitle ="Add New Customer"
  }
  selectCust(e){
    this.customerdataList = [];
  }
  onCustomerSearch(e){
    if(e.length > 2) {
      this.customerlistData(e);
    } else {
      this.customerdataList = [];
    }
  }
  customerlistData(e){
    let customerlist = new FormData();
    customerlist.append('value', e);
    this.crmservice.getCustomerDetail(customerlist).pipe(takeUntil(this.destroy$)).subscribe((resp) => {
      this.customerSuggestion = resp.data;
      for (let i = 0; i < this.customerSuggestion.length; i++) {
        this.customerData.push({
          id: this.customerSuggestion[i].CustomerId,
          name: this.customerSuggestion[i].Name,
        });
      }
    });
    this.customerdataList = [this.customerData];
    this.customerdataList = this.customerdataList[0];
  }
  onChangeSearch(e){
    if(e.length > 2) {
      this.productlistData(e);
    } else {
      this.productdataList = [];
    }
  }
  selectEvent(item) {
    this.id = this.products.length - 1;
    let productData = new FormData();
    productData.append('productId', item.id);
    this.productdataList = [];
    this.productList.controls.products.get('0').get('dozan').setValue('1');
   
   }
  onFocused(e) {
  }
  productlistData(e) {
    let productlist = new FormData();
    productlist.append('value', e);
    productlist.append('type', 'Land');
    this.crmservice.getproduct(productlist).pipe(takeUntil(this.destroy$)).subscribe((resp) => {
      this.product = resp.data;
      let i;
      this.productdata = [];
      for (i = 0; i < this.product.length; i++) {
        this.productdata.push({
          id: this.product[i].ProductId,
          name: this.product[i].ProductName,
        });
      }
      this.productdataList = [this.productdata];
      this.productdataList = this.productdataList[0];
    });
  }
  ngOnInit(): void {
    this.addProduct();
    this.lookupdatalist();
    this.tworow = false;
    this.onerow = false;
    this.thridrow = false;
  }
  OnSelectValue(value){

    this.tworow = false;
    this.onerow = false;
    this.thridrow = false;
    let paymentMode = typeof (value) == "object" ? value.target.value : value;
    if(paymentMode==0){
      this.typeCGST =false;
      this.typeSGST =false;
      this.typeIGST =false;
      this.tworow = false;
      this.onerow = false;
      this.thridrow = false;
    }
    else if(paymentMode==1){
      this.typeCGST =false;
      this.typeSGST =false;
      this.typeIGST =true;
      this.tworow = true;
      this.onerow = false;
      this.thridrow = false;
    }
    else{
      this.typeCGST =true;
      this.typeSGST =true;
      this.typeIGST =false;
      this.tworow = true;
      this.onerow = true;
      this.thridrow = false;
    }
  }
  get products():FormArray{
    return this.productList.get("products") as FormArray
  }
  addProduct(){
    this.products.push(this.newProducts());
  }
  newProducts():FormGroup{
    return this.fb.group({
      itemId: new FormControl(''),
      itemsName: new FormControl(''),
      dozan:new FormControl(''),
      quantity:new FormControl(''),
      rate:new FormControl(''),
      amount:new FormControl(''),
      cgst:new FormControl(''),
      sgst:new FormControl(''),
      igst:new FormControl(''),
      discount:new FormControl(''),
      tamount:new FormControl(''),
    });
  }

  removeProduct(i){
    this.products.removeAt(i);
  }
  setProductValue(i){
    
    this.products.at(i).setValue({itemId:this.products.at(i).value.itemName,itemName:this.products.at(i).value.itemName,unit:this.products.at(i).value.unit,quantity:this.products.at(i).value.quantity,reqDate:this.products.at(i).value.reqDate});
  }
  lookupdatalist(){
		let employeelist = new FormData();
    this.crmservice.getEmployee(employeelist).pipe(takeUntil(this.destroy$)).subscribe(resp =>{
      this.employee = resp.data;
    });
	}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
