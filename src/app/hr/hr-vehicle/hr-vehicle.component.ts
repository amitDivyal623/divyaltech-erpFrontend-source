import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router ,ActivatedRoute  } from '@angular/router';
import {FormBuilder, FormControl, FormGroup, Validators, FormArray} from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HrService } from '../../services/hr.service';
@Component({
  selector: 'app-hr-vehicle',
  templateUrl: './hr-vehicle.component.html',
  styleUrls: ['./hr-vehicle.component.css'],
})
export class HrVehicleComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  addvehicleDetail = new FormGroup({
    vendorName : new FormControl('',Validators.required),
    vehicleNumber : new FormControl('',Validators.required),
    driverName : new FormControl('',Validators.required),
    vehicleType : new FormControl('',Validators.required),
  });
  respVehicleType = [];

  constructor(private router:Router,private hrservice:HrService,) {
    if(sessionStorage.getItem('token')==undefined && sessionStorage.getItem('UserName')==undefined){
      this.router.navigate(['/']);
    }
  }
  submitted : any;

  minDate = {year: 1900, month: 1, day: 1};
  maxDate = {year: 2099, month: 12, day: 31};

  ngOnInit(): void {
    this.lookupdatalist();
  }
  lookupdatalist(){
    let lookupVehicleType = "VehicleType";
    let VehicleTypedata = new FormData();
    VehicleTypedata.append('lookupname',lookupVehicleType);
    this.hrservice.fetch_lookupdata(VehicleTypedata).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
      this.respVehicleType = Response.data
    });


  }
  addVehicle(){
    if(this.addvehicleDetail.valid){
      let vehicleData = new FormData();
      //vehicleData.append('');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
