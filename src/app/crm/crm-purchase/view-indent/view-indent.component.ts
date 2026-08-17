import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-view-indent',
  templateUrl: './view-indent.component.html',
  styleUrls: ['./view-indent.component.css']
})
export class ViewIndentComponent implements OnInit {

  minDate = {year: 1900, month: 1, day: 1};
  maxDate = {year: 2099, month: 12, day: 31};
  productList:FormGroup;

  constructor(private fb:FormBuilder) { 
    this.productList = fb.group({
      products : fb.array([])
    })
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
      reqDate:new FormControl('')
    });
  }

  removeProduct(i){
    this.products.removeAt(i);
  }
  setProductValue(i){
    
    this.products.at(i).setValue({itemId:this.products.at(i).value.itemName,itemName:this.products.at(i).value.itemName,unit:this.products.at(i).value.unit,quantity:this.products.at(i).value.quantity,reqDate:this.products.at(i).value.reqDate});
  }

}
