import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import {Router,ActivatedRoute} from '@angular/router';
import { DashboardService } from 'src/app/services/dashboard.service';
import { CountUp } from 'countup.js';
import { ChangeDetectorRef } from '@angular/core';
import { NgZone } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  countMonthlySubscription: any;
  countMonthlySalesSubscription: any;
  animatedMonthlyVisitCount: number;
  animatedIntervalMonthlyVisit: any;

  constructor(private router:Router, private dashboardservice: DashboardService,private fb:FormBuilder,private cdr: ChangeDetectorRef,private zone: NgZone) {
    if(sessionStorage.getItem('token')==undefined && sessionStorage.getItem('UserName')==undefined){
      this.router.navigate(['/']);
    }
  }
  animationInterval: any;
  countSubscription: Subscription; 
  totalAmountSubscription: Subscription;
  totalAreaSubscription: Subscription;
  countTodaysSubscription: Subscription; 
  countTodaySaleCountSubs: Subscription; 
  countDiversionSubscription: Subscription;
  countBalAmountSubscription: Subscription;
  countRegBalAmountSubscription: Subscription;
  countBookSubscription: Subscription;
  countParimaniSubscription: Subscription;
  countInProSubscription: Subscription;
  countTotCustsSubscription: Subscription; 
  dashBoardForm = new FormGroup({
    totVisitorsCount: new FormControl(),
    todayzVisitorsCount: new FormControl(),
    totCustzCount: new FormControl(),
    todayzSaleCountValue: new FormControl(),
    monthlyzSalesCount: new FormControl(),
    bookcomptedcount:new FormControl(),
    monthlyVisitzCountValue: new FormControl(),
    monthlyVisitzCountValue1: new FormControl(),
    totordamtCount:new FormControl(),
    totAreaCount:new FormControl(),
    inprogresscount:new FormControl(),
    parimanicount: new FormControl(),
    diversioncount: new FormControl(),
    balanceAomuntValue: new FormControl(),
    regBalAmntValue: new FormControl(),
  });

  animationIntervalVisitors: any;
  animationIntervalCustomers: any;
  animatedVisitorsCount: number = 0;
  animatedCustomersCount: number = 0;
  
  filteredData: any[] = [];
  startMonth: string = '';
  endMonth: string = '';
 


  monthData=new FormGroup({
 
    fromMonthname: new FormControl(),
    toMonthname: new FormControl(),
  });
 
 
  monthlyData = [
    { name: 'January', value: '55%', fillClass: 'bar-graph-bar-fill-january', year: null },
    { name: 'February', value: '35%', fillClass: 'bar-graph-bar-fill-february', year: null },
    { name: 'March', value: '85%', fillClass: 'bar-graph-bar-fill-march', year: null },
    { name: 'April', value: '70%', fillClass: 'bar-graph-bar-fill-april', year: null },
    { name: 'May', value: '10%', fillClass: 'bar-graph-bar-fill-may', year: null },
    { name: 'June', value: '45%', fillClass: 'bar-graph-bar-fill-june', year: null },
    { name: 'July', value: '75%', fillClass: 'bar-graph-bar-fill-july', year: null },
    { name: 'August', value: '65%', fillClass: 'bar-graph-bar-fill-august', year: null },
    { name: 'September', value: '50%', fillClass: 'bar-graph-bar-fill-september', year: null },
    { name: 'October', value: '80%', fillClass: 'bar-graph-bar-fill-october', year: null },
    { name: 'November', value: '40%', fillClass: 'bar-graph-bar-fill-november', year: null },
    { name: 'December', value: '90%', fillClass: 'bar-graph-bar-fill-december', year: null }
  ];
  
  ngOnInit(): void {
    this.dashBoardForm = this.fb.group({
      totVisitorsCount: [''],
      todayzVisitorsCount: [''],
      totCustzCount: [''],
      todayzSaleCountValue: [''],
      monthlyzSalesCount: [''],
      monthlyVisitzCountValue: [''],
      bookcomptedcount: [''],
      monthlyVisitzCountValue1: [''],
      totordamtCount: [''],
      totAreaCount: [''],
      inprogresscount: [''],
      parimanicount:[''],
      diversioncount:[''],
      balanceAomuntValue:[''],
      regBalAmntValue:[''],
    });
  
    this.getTotalVisitorsCount();
    this.getTodayVisitorsCount();
    this.getTotalCustomerCount();
    this.getTodaySaleCount();
    this.getMonthlyVisitCount();
    this.getMonthlySaleCount();
    this.getTotalOrderCount();
    this.getTotalAreaCount();
    this.getBookingCompleted();
    this.getInProgCount();
    this.getParimaniCount();
    this.getDiversionCount();
    this.getBalAmntCount();
    this.getRegBalAmntCount();
    // this.getRangeCount();


    const now = new Date();

    const toYear = now.getFullYear();
    const toMonth = now.getMonth() + 1; // JS months are 0-based, so +1 for human format
    this.endMonth = `${toYear}-${toMonth.toString().padStart(2, '0')}`;

    const fromDate = new Date(now);
    fromDate.setMonth(fromDate.getMonth() - 6); // subtract 6 months

    const fromYear = fromDate.getFullYear();
    const fromMonth = fromDate.getMonth() + 1;

    this.startMonth = `${fromYear}-${fromMonth.toString().padStart(2, '0')}`;

    // this.filteredData = [...this.monthlyData];

    this.monthData.get('fromMonthname')?.setValue(this.startMonth);
    this.monthData.get('toMonthname')?.setValue(this.endMonth);

    this.filterData();
  }

  getTotalOrderCount(){
    let formData = new FormData();
    if(this.totalAmountSubscription) {
      this.totalAmountSubscription.unsubscribe();
    }
    this.totalAmountSubscription = this.dashboardservice.getTotalOrderCount(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      const finalCount = Number(resp.DATA?.[0]?.[0] || 0);
      // this.dashBoardForm.patchValue({totordamtCount: finalCount });

      const formattedValue = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
      }).format(finalCount);
      this.dashBoardForm.get('totordamtCount').setValue(formattedValue);
    
    });
  }

  getTotalAreaCount(){
    let formData = new FormData();
    if(this.totalAreaSubscription){
      this.totalAreaSubscription.unsubscribe();
    }
    this.totalAreaSubscription = this.dashboardservice.getTotalAreaCount(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      const finalArea = Number(resp.DATA?.[0]?.[0] || 0);

      this.dashBoardForm.get('totAreaCount').setValue(finalArea);
    });
  }
  
  getTotalCustomerCount() {
    let formData = new FormData();
  
    if (this.countTotCustsSubscription) {
      this.countTotCustsSubscription.unsubscribe();
    }
  
    this.countTotCustsSubscription = this.dashboardservice.getTotCustsCount(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      const finalCount = Number(resp.DATA?.[0]?.[0]  || 0);
      this.animatedCustomersCount = 0;
  
      if (this.animationIntervalCustomers) {
        clearInterval(this.animationIntervalCustomers);
      }
  
      if (finalCount === 0) {
        this.dashBoardForm.patchValue({
          totCustzCount: 0
        });
        return;
      }
  
      const duration = 2000; 
      const frameRate = 60; 
      const totalSteps = Math.min(finalCount, frameRate * (duration / 1000)); 
      const stepValue = Math.ceil(finalCount / totalSteps);
      const intervalTime = duration / totalSteps;
  
      this.animationIntervalCustomers = setInterval(() => {
        this.animatedCustomersCount += stepValue;
  
        if (this.animatedCustomersCount >= finalCount) {
          this.animatedCustomersCount = finalCount;
          clearInterval(this.animationIntervalCustomers);
        }
  
        this.dashBoardForm.patchValue({
          totCustzCount: this.animatedCustomersCount
        });
      }, intervalTime);
    });
  }
  
  
  getTotalVisitorsCount() {
    let formData = new FormData();  
    if (this.countSubscription) {
      this.countSubscription.unsubscribe();
    }  
    this.countSubscription = this.dashboardservice.getVisitorsCount(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      const finalCount = Number(resp.DATA?.[0]?.[0]  || 0);
      this.animatedVisitorsCount = 0;
  
      if (this.animationIntervalVisitors) {
        clearInterval(this.animationIntervalVisitors);
      }  
      if (finalCount === 0) {
        this.dashBoardForm.patchValue({
          totVisitorsCount: 0
        });
        return;
      }  
      const duration = 2000; 
      const frameRate = 60; 
      const totalSteps = Math.min(finalCount, frameRate * (duration / 1000)); 
      const stepValue = Math.ceil(finalCount / totalSteps);
      const intervalTime = duration / totalSteps; 

      this.animationIntervalVisitors = setInterval(() => {
        this.animatedVisitorsCount += stepValue;
        if (this.animatedVisitorsCount >= finalCount) {
          this.animatedVisitorsCount = finalCount;
         clearInterval(this.animationIntervalVisitors);
        }
        this.dashBoardForm.patchValue({
          totVisitorsCount: this.animatedVisitorsCount
        });
      }, intervalTime);      
    });
  }

  getParimaniCount(){
    const formData = new FormData();

    if(this.countParimaniSubscription){
      this.countParimaniSubscription.unsubscribe();
    }
    this.countParimaniSubscription = this.dashboardservice.getParimaniCount(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      const finalCount = Number(resp.DATA?.[0]?.[0]  || 0);
      this.dashBoardForm.patchValue({parimanicount: finalCount });

    });
  }

  getBookingCompleted(){
    const formData = new FormData();
  
    if(this.countBookSubscription){
      this.countBookSubscription.unsubscribe();
    }
    this.countBookSubscription = this.dashboardservice.getBookingCompleted(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      const finalCount = Number(resp.DATA?.[0]?.[0]  || 0);
      this.dashBoardForm.patchValue({bookcomptedcount: finalCount });

  })
  }

  getTodayVisitorsCount(){
    const formData = new FormData();
    if(this.countTodaysSubscription){
      this.countTodaysSubscription.unsubscribe();
    }
    this.countTodaysSubscription = this.dashboardservice.getTodaysVisitorsCount(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      const finalCount = Number(resp.DATA?.[0]?.[0] || 0);
      this.dashBoardForm.patchValue({todayzVisitorsCount: finalCount });
    });
  }

  getTodaySaleCount(){
    const formData = new FormData();
    if(this.countTodaySaleCountSubs){
      this.countTodaySaleCountSubs.unsubscribe();
    }
    this.countTodaySaleCountSubs = this.dashboardservice.getTodaySalesCount(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
       const finalCount = Number(resp.DATA?.[0]?.[0] || 0);
       this.dashBoardForm.patchValue({todayzSaleCountValue: finalCount});
    });
  }

  getInProgCount(){
    const formData = new FormData();

    if(this.countInProSubscription){
      this.countInProSubscription.unsubscribe();
    }
    this.countInProSubscription = this.dashboardservice.getInProgCount(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      const finalCount = Number(resp.DATA?.[0]?.[0]  || 0);
      this.dashBoardForm.patchValue({ inprogresscount: finalCount });

    })
  }

  getDiversionCount(){
    const formData = new FormData();

    if(this.countDiversionSubscription){
      this.countDiversionSubscription.unsubscribe();
    }
    this.countDiversionSubscription = this.dashboardservice.getDiversionCount(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      const finalCount = Number(resp.DATA?.[0]?.[0]  || 0);
      this.dashBoardForm.patchValue({diversioncount: finalCount });

    })
  }

  getBalAmntCount(){
    const formData = new FormData();

    if(this.countBalAmountSubscription){
      this.countBalAmountSubscription.unsubscribe();
    }
    this.countBalAmountSubscription = this.dashboardservice.getBalAmntCount(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      const finalCount = Number(resp.DATA?.[0]?.[0] || 0);
      const formattedValue = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
      }).format(finalCount);
      this.dashBoardForm.patchValue({balanceAomuntValue: formattedValue});
    })
  }

  getRegBalAmntCount(){
    const formData = new FormData();

    if(this.countRegBalAmountSubscription){
      this.countRegBalAmountSubscription.unsubscribe();
    }
    this.countRegBalAmountSubscription = this.dashboardservice.getRegBalAmntCount(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      const finalCount = Number(resp.DATA?.[0]?.[0] || 0);
      const formattedValue = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
      }).format(finalCount);
      this.dashBoardForm.patchValue({regBalAmntValue: formattedValue});
    })
  }
  
  getMonthlyVisitCount(){
    const formData = new FormData();
    if(this.countMonthlySubscription){
      this.countMonthlySubscription.unsubscribe();
    }
    this.countMonthlySubscription = this.dashboardservice.getMonthlyVisitsCount(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
       const finalCount = Number(resp.DATA?.[0]?.[0] || 0);    
       this.dashBoardForm.patchValue({
        monthlyVisitzCountValue1: finalCount
       });      
       this.animatedMonthlyVisitCount = 0;

       if(this.animatedIntervalMonthlyVisit){
        clearInterval(this.animatedIntervalMonthlyVisit);
       }
       if(finalCount === 0){
        this.dashBoardForm.patchValue({
          monthlyVisitzCountValue:0
        });
        return;
       }

       const duration = 2000;
       const frameRate = 60;
       const totalSteps = Math.min(finalCount,frameRate * (duration / 1000));
       const stepValue = Math.ceil(finalCount / totalSteps);
       const intervalTime = duration / totalSteps;

       this.animatedIntervalMonthlyVisit = setInterval(() => {
        this.animatedMonthlyVisitCount += stepValue;
        if(this.animatedMonthlyVisitCount >= finalCount) {
          this.animatedMonthlyVisitCount = finalCount;
          clearInterval(this.animatedIntervalMonthlyVisit);
        }
        this.dashBoardForm.patchValue({
          monthlyVisitzCountValue: this.animatedMonthlyVisitCount
        });
       }, intervalTime)
    });
  }

  getMonthlySaleCount(){
    const formData = new FormData();
    if(this.countMonthlySalesSubscription){
      this.countMonthlySalesSubscription.unsubscribe();
    }
    this.countMonthlySalesSubscription = this.dashboardservice.getMonthlySalesCount(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      const finalCount = Number(resp.DATA?.[0]?.[0] || 0);
      const formattedValue = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
      }).format(finalCount);
      this.dashBoardForm.patchValue({monthlyzSalesCount: formattedValue});
    });
  }

  
  filterData() {
    const fromMonth = this.monthData.get('fromMonthname').value;
    const toMonth = this.monthData.get('toMonthname').value;

    if (!fromMonth || !toMonth) {
      this.filteredData = [...this.monthlyData];
      return;
    }

    const fromDate = new Date(fromMonth);
    const toDate = new Date(toMonth);

    if (fromDate > toDate) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Range',
        text: 'Please Enter a Valid Date Range.',
        confirmButtonText: 'OK'
      });
      return;
    }

    let formdata = new FormData();
    formdata.append('from_date', fromMonth);
    formdata.append('to_date', toMonth);

    this.dashboardservice.getAllMonthData(formdata).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      if (!resp.data || resp.data.length === 0) {
        this.filteredData = [];
        return;
      }

      const monthIndices = {
        'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
        'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11
      };

      resp.data.sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return monthIndices[a.monthname] - monthIndices[b.monthname];
      });

    
      // const maxCount = Math.max(...resp.data.map(item => item.count), 0);
      // const normalizedMax = maxCount === 0 ? 1 : maxCount; 

      this.filteredData = resp.data.map(item => ({
        name: item.monthname,
        value: `${item.count}`,
        fillClass: 'bar-graph-bar-fill-' + item.monthname.toLowerCase(),
        year: item.year
      }));
    });
  }
  
  ngOnDestroy() {

    if (this.animationInterval) {
      clearInterval(this.animationInterval);
    }
    if (this.countSubscription) {
      this.countSubscription.unsubscribe();
    }
    this.destroy$.next();
    this.destroy$.complete();
  }


  // getRangeCount() {
  //   let formData = new FormData();
    
  //   this.dashboardservice.getAllMonthData(formData).subscribe(resp => {
  //     console.log(resp.data); return;
  //     const responseData = resp.data;
      
  //     responseData.forEach(item => {
  //       const matchingMonth = this.monthlyData.find(month => month.name === item.monthname);
  //       if (matchingMonth) {
  //         matchingMonth.value = `${item.count}`; // Update value with count as percentage
  //         matchingMonth.year = item.year;         // Update year
  //       }
  //     });

  //     console.log(this.monthlyData); // Verify the update
  //   });
  // }
}
