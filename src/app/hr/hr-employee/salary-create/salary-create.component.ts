import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import {debounceTime, distinctUntilChanged, map} from 'rxjs/operators';

const month=['January', 'February','March', 'April','May','June','July','August','September','October','November','December'];

@Component({
  selector: 'app-salary-create',
  templateUrl: './salary-create.component.html',
  styleUrls: ['./salary-create.component.css']
})
export class SalaryCreateComponent implements OnInit {

  constructor() { }
//search select code
public model: any;

months = (text$: Observable<string>) =>
  text$.pipe(
    debounceTime(200),
    distinctUntilChanged(),
    map(term => term.length < 2 ? []
      : month.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
)
//end of search select code
  ngOnInit(): void {
  }

}
