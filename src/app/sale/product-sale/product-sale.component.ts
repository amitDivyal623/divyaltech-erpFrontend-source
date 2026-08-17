import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-sale',
  templateUrl: './product-sale.component.html',
  styleUrls: ['./product-sale.component.css']
})
export class ProductSaleComponent implements OnInit {

  constructor(private router: Router) { }
  route(link:any){
    this.router.navigate(['/'+link]);
  }
  ngOnInit(): void {
  }

}
