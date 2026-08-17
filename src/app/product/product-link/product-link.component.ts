import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-product-link',
  templateUrl: './product-link.component.html',
  styleUrls: ['./product-link.component.css']
})
export class ProductLinkComponent implements OnInit {
  activeTab = 'Unit';
  

  ngOnInit(): void {
  }
  result(tabName:any){
    this.activeTab = tabName;
}
}
