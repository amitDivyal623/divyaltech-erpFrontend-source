import { Component, OnInit } from '@angular/core';
import {NgbCalendar,NgbDate,NgbDateStruct,NgbInputDatepickerConfig} from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder,FormControl, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-sale-booking',
  templateUrl: './sale-booking.component.html',
  styleUrls: ['./sale-booking.component.css'],
  providers: [NgbInputDatepickerConfig]
})
export class SaleBookingComponent implements OnInit {
	submitted: boolean;


	constructor(config: NgbInputDatepickerConfig, calendar: NgbCalendar) {
		// customize default values of datepickers used by this component tree
		config.minDate = {year: 1900, month: 1, day: 1};
		config.maxDate = {year: 2099, month: 12, day: 31};

		// days that don't belong to current month are not visible
		config.outsideDays = 'hidden';

		// weekends are disabled
		config.markDisabled = (date: NgbDate) => calendar.getWeekday(date) >= 6;

		// setting datepicker popup to close only on click outside
		config.autoClose = 'outside';

		// setting datepicker popup to open above the input
		config.placement = ['bottom-left', 'bottom-right'];

		
	}

	saleBooking = new FormGroup({
		date:new FormControl('',Validators.required),
		property:new FormControl('',Validators.required),
		Customer:new FormControl('',Validators.required),
		bookingAmt:new FormControl('',Validators.required),
		bookingDoneBy:new FormControl('',Validators.required),
		Description:new FormControl('',Validators.required),
	});

	ngOnInit(): void {
	}

	insertBooking(){
		if(this.saleBooking.valid){
			this.submitted = false;
		}else{
			this.submitted = true;
		}
	}

}
