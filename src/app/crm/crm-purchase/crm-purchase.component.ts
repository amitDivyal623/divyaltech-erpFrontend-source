import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-crm-purchase',
  templateUrl: './crm-purchase.component.html',
  styleUrls: ['./crm-purchase.component.css']
})
export class CrmPurchaseComponent implements OnInit {

  minDate = {year: 1900, month: 1, day: 1};
  maxDate = {year: 2099, month: 12, day: 31};
  constructor(private router:Router) { }
 
  ngOnInit(): void {
  }
  route(link:any){
    this.router.navigate(['/'+link]);
  }

}
