import { Component, OnInit } from '@angular/core';
import { NgbCalendar, NgbDateAdapter, NgbDate, NgbDateParserFormatter, NgbDateStruct, NgbInputDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup,FormControl} from '@angular/forms';
@Component({
  selector: 'app-machine-report',
  templateUrl: './machine-report.component.html',
  styleUrls: ['./machine-report.component.scss']
})
export class MachineReportComponent implements OnInit {
  MachineReport=new FormGroup({
    dateFrom: new FormControl(''),
    dateTo : new FormControl(''),
    Machinename: new FormControl(''),
    projectNames: new FormControl('')
  });
     minDate = { year: 1900, month: 1, day: 1 };
      maxDate = { year: 2099, month: 12, day: 31 };
  constructor() { }

  ngOnInit(): void {
  }

}
