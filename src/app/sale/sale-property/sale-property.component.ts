import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {NgbCalendar,NgbDate,NgbDateStruct,NgbInputDatepickerConfig} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-sale-property',
  templateUrl: './sale-property.component.html',
  styleUrls: ['./sale-property.component.css'],
  providers: [NgbInputDatepickerConfig]
})
export class SalePropertyComponent implements OnInit {
  
  constructor(private router: Router) { }

  route(link:any){
    this.router.navigate(['/'+link]);
  }
  ngOnInit(): void {}  
  

}
