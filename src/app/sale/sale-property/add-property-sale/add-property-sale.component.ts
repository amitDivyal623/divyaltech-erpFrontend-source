import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';

const projectname=['MR 1', 'MR 2','MR 3', 'MR 4'];

@Component({
  selector: 'app-add-property-sale',
  templateUrl: './add-property-sale.component.html',
  styleUrls: ['./add-property-sale.component.css']
})
export class AddPropertySaleComponent implements OnInit {

  minDate = {year: 1900, month: 1, day: 1};
  maxDate = {year: 2099, month: 12, day: 31};

  productList:FormGroup;
  
  constructor(private fb:FormBuilder) { 
    this.productList = fb.group({
      products : fb.array([])
    })
  }
  
  activeTab = 'Personal';
  result(tabName:any){
    this.activeTab = tabName;
  }

  ngOnInit(): void {
    this.addProduct();
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
      itemName:new FormControl(''),
      unit:new FormControl(''),
      quantity:new FormControl(''),
      rate:new FormControl(''),
      amount:new FormControl(''),
      gst:new FormControl(''),
      cgst:new FormControl(''),
      sgst:new FormControl(''),
      igst:new FormControl(''),
      tamount:new FormControl(''),
      reqDate:new FormControl('')
    });
  }

  removeProduct(i){
    this.products.removeAt(i);
  }
  setProductValue(i){
    
    this.products.at(i).setValue({itemId:this.products.at(i).value.itemName,itemName:this.products.at(i).value.itemName,unit:this.products.at(i).value.unit,quantity:this.products.at(i).value.quantity,reqDate:this.products.at(i).value.reqDate});
  }


public model: any;
projectname = (text$: Observable<string>) =>
  text$.pipe(
    debounceTime(200),
    distinctUntilChanged(),
    map(term => term.length < 2 ? []
      : projectname.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
)

}
