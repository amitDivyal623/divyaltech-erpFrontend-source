import { Component, OnInit, ViewChild,TemplateRef,Injectable, ChangeDetectorRef, OnDestroy, ElementRef } from '@angular/core';
import { NgbCalendar, NgbDateAdapter, NgbDate, NgbDateParserFormatter, NgbDateStruct, NgbInputDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { from, Subject, Observable } from 'rxjs';
import {Router,ActivatedRoute} from '@angular/router';
import { CrmService } from '../../services/crm.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { HttpClient ,HttpHeaders, HttpResponse } from '@angular/common/http';
import { StringLiteralLike } from 'typescript';
import { DataTableDirective } from 'angular-datatables';
import { environment } from 'src/environments/environment';
import { HrService } from 'src/app/services/hr.service';
import { DatePipe } from '@angular/common';
import {map, startWith, takeUntil} from 'rxjs/operators';

class Tasks {
  TaskId: string;
  EmployeeId: string;
  UserId: string;
  TaskDescription: string;
  TaskTitle: string;
  TaskDt: string;
  Status: string;
  CreatedBy: string;
  CreatedDt: string;
  UpdatedBy: string;
  UpdatedDt: string;
}

class DataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}

@Injectable()
export class CustomAdapter extends NgbDateAdapter<string> {

  readonly DELIMITER = '-';

  fromModel(value: string | null): NgbDateStruct | null {
    if (value) {
      let date = value.split(this.DELIMITER);
      return {
        day : parseInt(date[0], 10),
        month : parseInt(date[1], 10),
        year : parseInt(date[2], 10)
      };
    }
    return null;
  }

  toModel(date: NgbDateStruct | null): string | null {
    return date ? date.day + this.DELIMITER + date.month + this.DELIMITER + date.year : null;
  }
}

/**
 * This Service handles how the date is rendered and parsed from keyboard i.e. in the bound input field.
 */
@Injectable()
export class CustomDateParserFormatter extends NgbDateParserFormatter {

  readonly DELIMITER = '/';

  parse(value: string): NgbDateStruct | null {
    if (value) {
      let date = value.split(this.DELIMITER);
      return {
        day : parseInt(date[0], 10),
        month : parseInt(date[1], 10),
        year : parseInt(date[2], 10)
      };
    }
    return null;
  }

  format(date: NgbDateStruct | null): string {
    return date ? ("0"+date.day).slice(-2) + this.DELIMITER + ("0"+date.month).slice(-2) + this.DELIMITER + date.year : '';
  }
}

@Component({
  selector: 'app-booking-registry-task',
  templateUrl: './booking-registry-task.component.html',
  styleUrls: ['./booking-registry-task.component.scss']
})
export class BookingRegistryTaskComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  selected = [
    {name: "Active"},
    {name: "Pending"},
  ];
  [x: string]: any;
  model: NgbDateStruct;
  model2: string;
  followupadd: boolean;
  filterWorking: boolean = true;

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  @ViewChild('closebutton') closebutton;
  @ViewChild('closebutton1') closebutton1;
  @ViewChild('taskaddModel')taskaddModel: ElementRef;
  @ViewChild('taskEditModel')taskEditModel: ElementRef;
  private dateToString = (date) => `${date.year}-${date.month}-${date.day}`;
  respStatus =[];
  categories = [];
  categories1 = [];

  respcusTags =[];
  custtags = [];
  custtags1 = [];
  minDate = {year: 1900, month: 1, day: 1};
  maxDate = {year: 2099, month: 12, day: 31};
  DatatableParameter = { Assignee: '', reporters : '',taskDate: '',tastStatus: '',Tasktype:'',username: '',Tasktagid:''};
  dataa:Tasks[];
  customerdataList = [];
  customerData= [];
  keyword = 'name';
  resp:any;
  employee : any;
  modal:any;
  taskselected = [];
  tempTaskSelected = [];
  employeetypenamelis(){
    let employeelist = new FormData();
    this.crmservice.getEmployee(employeelist).pipe(takeUntil(this.destroy$)).subscribe(resp =>{
      this.employee = resp.data;
      for (let i = 0; i < resp.data.length; i++)
      {
        if ('AMAR SONI' == resp.data[i].EmployeeName)
        {
          this.reporter = resp.data[i].EmployeeId;
        }
      }

    });
  }
  lookupdatalist(){
    let lookupStatus = "Status";
    let Statusdata = new FormData();
    Statusdata.append('lookupname',lookupStatus);
    this.crmservice.fetch_lookupdata(Statusdata).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
      this.respStatus = Response.data
    });
  }

  addTaskbookreg = new FormGroup({
    rb_status : new FormControl('',Validators.required),
    rb_date : new FormControl('',Validators.required),
    rb_reporter: new FormControl('',Validators.required),
    rb_assignee:new FormControl('',Validators.required),
    rb_task_title: new FormControl('',Validators.required),
    rb_task_description : new FormControl('',Validators.required),
    rb_task_completion: new FormControl(''),
    rb_taskAction : new FormControl(''),
    rb_task_response : new FormControl(''),
    visitor_name : new FormControl('',Validators.required),
    task_id : new FormControl(''),
    customer_id: new FormControl(''),
    rb_taskResult: new FormControl(''),
    tag_id: new FormControl(''),
    rb_task_tags: new FormControl(''),
    rb_Tasktype: new FormControl(''),
  });
  nextFollowup = new FormGroup({
    followup_date: new FormControl('', Validators.required),
    followup_Time: new FormControl('', Validators.required),
    followup_notes: new FormControl('', Validators.required),
  });
  nextFollowupedit = new FormGroup({
    editfollowup_date: new FormControl('', Validators.required),
    editfollowup_Time: new FormControl('', Validators.required),
    editfollowup_notes: new FormControl('', Validators.required),
  });
	task_status=new FormGroup({
		tstatus:new FormControl('')
	});

  taskActionFrom=new FormGroup({
		taskAction:new FormControl('')
	});
  task_Assignee= new FormGroup({
    TaskAssigne:new FormControl('',Validators.required)
  });
  taskDetails= new FormGroup({
		description:new FormControl('',Validators.required),
		title: new FormControl('',Validators.required),
    follwoupDetails: new FormControl(''),
    status: new FormControl('',Validators.required),
    taskAction:new FormControl(''),
    customer_name : new FormControl('',Validators.required)
	});
  searchTask = new FormGroup({
    regbook_task_status : new FormControl('',Validators.required),
    userName:new FormControl('',Validators.required),
    regbook_task_date:new FormControl('',Validators.required),
    customerName:new FormControl('',Validators.required),
    regbook_user_task: new FormControl('', Validators.required),
    filtertasktag:new FormControl(''),
    regbook_Tasktagid:new FormControl('')

  });
  constructor(private datePipe: DatePipe, private ngbCalendar: NgbCalendar, private dateAdapter: NgbDateAdapter<string>,private router:Router,private http:HttpClient,private crmservice:CrmService, private chRef : ChangeDetectorRef, private hrservice:HrService,private activatedRoute: ActivatedRoute) {
    if(sessionStorage.getItem('token')==undefined && sessionStorage.getItem('UserName')==undefined){
      this.router.navigate(['/']);
    }
  }

  myControl = new FormControl();
  options: string[] = ['One', 'Two', 'Three'];
  filteredOptions!: Observable<string[]>;

  ngOnInit(): void {
    this.assignee = sessionStorage.getItem('EMPLOYEEID');
    this.filteredOptions = this.myControl.valueChanges
    .pipe(
      startWith(''),
      map(value => this._filter(value))
    );

    this.datatableCode();
    this.employeetypenamelis();
    this.lookupdatalist();
    this.getTaskActionlist();
    this.taskStatus();
    this.taskTags();
    this.CrmUserRole = false;
    if(sessionStorage.getItem('UserRole') == 'CRM User'){
      this.CrmUserRole = true;
    }
    this.CRMAdmin = false;
    if (sessionStorage.getItem('UserRole') == 'CRM Admin') {
      this.CRMAdmin = true;
    }
  }

  taskStatus(){
    let lookupStatus = "Status";
    let Statusdata = new FormData();
    Statusdata.append('lookupname',lookupStatus);
    this.hrservice.fetch_lookupdata(Statusdata).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
        this.respTaskStatus = Response.data
        let i =0;
    for(i=0;i<this.respTaskStatus.length;i++){
      this.categories1.push({
        'id': this.respTaskStatus[i]['LookupDataId'],
        'name': this.respTaskStatus[i]['LookupValue']
      })
    }
    this.categories = [this.categories1];
    this.categories = this.categories[0];
      });
  }

  private _filter(value: string): string[] {
    //this.productlistData();
    const filterValue = value.toLowerCase();
    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }

  editTaskAssigne(){
		if(sessionStorage.getItem('UserRole') == 'Admin' || sessionStorage.getItem('UserRole') == 'HR Admin' || sessionStorage.getItem('UserRole') == 'CRM Admin'){
            this.AccessAssigne = false;
        }
	}

  selectCust(e){
    this.customerdataList = [];
  }

  onCustomerSearch(e){
    if(e.length > 2) {
      this.customerlistData(e);
    } else {
      this.customerdataList = [];
    }
  }

  customerlistData(e){
    let customerlist = new FormData();
    customerlist.append('value', e);
    this.crmservice.getCustomerDetail(customerlist).pipe(takeUntil(this.destroy$)).subscribe((resp) => {
      this.customerSuggestion = resp.data;
      for (let i = 0; i < this.customerSuggestion.length; i++) {
        this.customerData.push({
          id: this.customerSuggestion[i].CustomerId,
          name: this.customerSuggestion[i].Name,
        });
      }
    });
    this.customerdataList = [this.customerData];
    this.customerdataList = this.customerdataList[0];
  }

  editTaskAssigne1(){
		if(sessionStorage.getItem('UserRole') == 'Admin' || sessionStorage.getItem('UserRole') == 'HR Admin' || sessionStorage.getItem('UserRole') == 'CRM Admin'){
            this.AccessAssigne1 = false;
        }
	}

  public taskModalshow(){
    this.taskaddModel.nativeElement.click();
    this.nextFollowup.reset();
    this.followupadd = true;
  }

  openmodal(){
    this.taskaddModel.nativeElement.click();
    this.taskDetails.enable();
    this.addTaskbookreg.enable();
    this.addTaskbookreg.reset();
    // this.addTaskbookreg.controls['assignee'].setValue(this.assignee);
    // this.addTaskbookreg.controls['reporter'].setValue(this.reporter);
    this.taskHeading = "Add New Task";
		
    this.nextFollowup.reset();
    this.followupadd = true;

	}

  getTaskActionlist(){
    let actionData = new FormData();
    this.crmservice.getTaskAction(actionData).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
      this.taskAction = Response.data
    });
  }

  datatableCode() {

    // this.status = this.searchTask.get('task_status').value;
    // this.status_id = '';
    // this.taskStatusID = [];
    // for(let i=0;i<this.status.length;i++){
    //   this.taskStatusID.push(this.status[i].name);
    //   this.status_id = this.taskStatusID.join(',')
    // }
    this.DatatableParameter.Tasktype = 'CRMTask';
    // this.DatatableParameter.reporters = this.searchTask.get('userName').value;
    // this.DatatableParameter.Assignee = this.searchTask.get('customerName').value;
    // if(this.status_id != '' && this.status !='' || this.filterWorking == false){
    //   this.DatatableParameter.tastStatus = this.status_id;
    // }else{
    //   this.DatatableParameter.tastStatus = 'Active,Pending';
    // }
    // this.DatatableParameter.taskDate = this.searchTask.get('task_date').value;
    // this.DatatableParameter.username = this.searchTask.get('user_task').value;
    // this.DatatableParameter.Tasktagid = this.Tasktag_id
    const that = this;
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain'});
    this.dtOptions = {
      processing: true,
      serverSide: true,
      dom: 'lrtip',
      pageLength: 50,
      lengthMenu:[[5, 10, 25, 50], [5, 10, 25, 50]],
      columnDefs: [
        { orderable: false, targets: 5 }
      ],
      ajax: (dataTablesParameters: any, callback) => {
        Object.assign(dataTablesParameters, this.DatatableParameter);
        that.http.post<DataTablesResponse>(environment.APIEndpoint + 'tasks.fetch_task&reload=1', Object.assign(dataTablesParameters, this.DatatableParameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {
          that.dataa=resp.data;
          callback({recordsTotal: resp.recordsTotal,recordsFiltered: resp.recordsTotal,data: []});
        });
      }
    };
  }
  editTaskdesp(taskId) {
    // this.followupadd = true;
    // this.isButtonDisabled = false;
    // this.addTaskbookreg.enable();
    // this.crmservice.getTaskDetails(taskId).subscribe(Response => {
    //   this.addTaskbookreg.controls['date'].setValue(this.datePipe.transform(Response.DATA[0][4], 'dd-MM-yyyy'));
    //   if(Response.DATA) {
    //     if(Response.DATA[0][28] != ""){
    //       this.onOptionsSelected(Response.DATA[0][28], Response.DATA[0][27]);
    //     }
    //     this.addTaskbookreg.patchValue({
    //       visitor_name: Response.DATA[0][25],
    //       task_title: Response.DATA[0][2],
    //       task_description: Response.DATA[0][3],
    //       status: Response.DATA[0][8],
    //       reporter: Response.DATA[0][6],
    //       assignee: Response.DATA[0][5],
    //       taskAction: Response.DATA[0][28],
    //       taskResult: Response.DATA[0][27],
    //       task_completion: Response.DATA[0][21],
    //       task_id: Response.DATA[0][1],
    //       customer_id:Response.DATA[0][26],
    //       task_action_response:Response.DATA[0][29]
    //     });
    //     if(Response.DATA[0][24] != '') {
    //       this.nextFollowup.patchValue({
    //         followup_notes: Response.DATA[0][24]
    //       });
    //       this.nextFollowup.controls['followup_date'].setValue(this.datePipe.transform(Response.DATA[0][22], 'dd-MM-yyyy'));
    //       this.nextFollowup.controls['followup_Time'].setValue(this.datePipe.transform(Response.DATA[0][23], 'hh:mm'));
    //     }
    //     let taskids = Response.DATA[0][30].split(',');
    //     let tasknames = Response.DATA[0][31].split(',');
    //     for(var i=0;i<taskids.length;i++){
    //       this.tempTaskSelected.push({
    //         'id' : taskids[i],
    //         'name' : tasknames[i]
    //       })
    //     }
    //     this.taskselected = this.tempTaskSelected;
    //   }
    // });
    // this.activeTaskField='active';
    // this.taskHeading= "Edit Task Detail";
    // this.taskModalshow();
  }
  ViewTask(taskId) {
    // this.taskDetails.disable();
    // this.addTaskbookreg.disable();
    // this.followupadd = false;
    // this.addTaskbookreg.enable();
    // this.crmservice.getTaskDetails(taskId).subscribe(Response =>{
    //   this.addTaskbookreg.controls['date'].setValue(this.datePipe.transform(Response.DATA[0][4], 'dd-MM-yyyy'));
    //   if (Response.DATA) {
    //     if(Response.DATA[0][28] != ""){
    //       this.onOptionsSelected(Response.DATA[0][28], Response.DATA[0][27]);
    //     }
    //     this.addTaskbookreg.patchValue({
    //       visitor_name: Response.DATA[0][25],
    //       task_title: Response.DATA[0][2],
    //       task_description: Response.DATA[0][3],
    //       status: Response.DATA[0][8],
    //       reporter: Response.DATA[0][6],
    //       assignee: Response.DATA[0][5],
    //       taskAction: Response.DATA[0][28],
    //       task_completion: Response.DATA[0][21],
    //       task_id: Response.DATA[0][1],
    //       customer_id:Response.DATA[0][26],
    //       task_action_response: Response.DATA[0][29]
    //     });
    //     if(Response.DATA[0][24] != '') {
    //       this.nextFollowup.patchValue({
    //         followup_notes: Response.DATA[0][24]
    //       });
    //       this.nextFollowup.controls['followup_date'].setValue(this.datePipe.transform(Response.DATA[0][22], 'dd-MM-yyyy'));
    //       this.nextFollowup.controls['followup_Time'].setValue(this.datePipe.transform(Response.DATA[0][23], 'hh:mm'));
    //     }
    //     let taskids = Response.DATA[0][30].split(',');
    //     let tasknames = Response.DATA[0][31].split(',');
    //     for(var i=0;i<taskids.length;i++){
    //       this.tempTaskSelected.push({
    //         'id' : taskids[i],
    //         'name': tasknames[i]
    //       })
    //     }
    //     this.taskselected = this.tempTaskSelected;
    //   }
    // });
    // this.taskHeading= "View Task Detail";
    // this.addTaskbookreg.disable();
    // $('.enquryButton').hide();
    // this.activeTaskField='active';
    // $('#taskHeading').text('View Task Detail');
    // this.taskModalshow();
  }

  showFollowup(e){
		if(e.target.checked){
      this.additionalFollow = true;
    } else{
      this.additionalFollow = false;
    }
	}

  editFollowup(e){
    if(e.target.checked){
      this.editFollow = true;
    }else{
      this.editFollow = false;
    }
  }


  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  deletTask(taskID){
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.value) {
        this.crmservice.deleteitem(taskID).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
          if(Response) {
            Swal.fire({
              icon:'success',
              title:'Success!',
              text:Response.MESSAGE,
              showConfirmButton:false,
              timer:2000
            });
            this.reload();
          }else{
            Swal.fire({
              icon:'error',
              title:'Error!',
              text:'item Delete Failed',
              showConfirmButton:false,
              timer:3000
            });
          }
        });
      }
    })
  }

  public closeModal(){
    this.closebutton.nativeElement.click();
  }

  redirect(link){
    this.router.navigate(['/'+link]);
  }

  fetchTaskList(){
    this.crmservice.fetchTaskList().pipe(takeUntil(this.destroy$)).subscribe(Response =>{this.resp=Response});
  }

  taskSearch(){
    this.datatableCode();
    this.rerender();
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  insertTask(){
    // this.taskselected = [];
    // this.isButtonDisabled = false;
    // if($("#nextFollowCRM").is(':checked') == true ? this.addTaskbookreg.valid && this.nextFollowup.valid : this.addTaskbookreg.valid){
    //   this.followupadd = false;
    //   this.isButtonDisabled = true;
    //   this.submitted = false;
    //   let taskData = new FormData();
    //   taskData.append('task_title',this.addTaskbookreg.get('task_title').value);
    //   taskData.append('task_description',this.addTaskbookreg.get('task_description').value);
    //   taskData.append('status',this.addTaskbookreg.get('status').value);
    //   taskData.append('date',this.addTaskbookreg.get('date').value);
    //   taskData.append('reporter',this.addTaskbookreg.get('reporter').value);
    //   taskData.append('assignee',this.addTaskbookreg.get('assignee').value);
    //   taskData.append('Tasktype','CRMTask');
    //   taskData.append('taskAction', this.addTaskbookreg.get('taskAction').value);
    //   taskData.append('taskResult',this.addTaskbookreg.get('taskResult').value);
    //   taskData.append('task_action_response',this.addTaskbookreg.get('task_action_response').value);
    //   taskData.append('taskFollowup',this.addTaskbookreg.get('task_completion').value);
    //   taskData.append('followUpDate', this.nextFollowup.get('followup_date').value);
    //   taskData.append('followUpTime', this.nextFollowup.get('followup_Time').value);
    //   taskData.append('followup_notes', this.nextFollowup.get('followup_notes').value);
    //   taskData.append('followcheck', $("#nextFollowCRM").prop('checked'));
    //   if((typeof this.addTaskbookreg.get('visitor_name').value.id != 'undefined')){
    //     taskData.append('customerId', this.addTaskbookreg.get('visitor_name').value.id);
    //   }else{
    //     taskData.append('customerId', this.addTaskbookreg.get('customer_id').value);
    //   }
    //   taskData.append('TaskId', this.addTaskbookreg.get('task_id').value);
    //   taskData.append('task_tags',this.tag_id);

    //   if (this.addTaskbookreg.get('visitor_name').value.id || this.addTaskbookreg.get('customer_id').value) {

    //       this.crmservice.addTaskbookreg(taskData).subscribe(Response =>{
    //       if(Response.CODE == 200) {
    //         Swal.fire({
    //           icon:'success',
    //           title:'Success!',
    //           text:Response.MESSAGE,
    //           showConfirmButton:false,
    //           timer:2000
    //         });
    //         this.searchTask.reset();
    //         this.addTaskbookreg.reset();
    //         this.reload();
    //         this.closeModal();
    //       }else{
    //         Swal.fire({
    //           icon:'error',
    //           title:'Error!',
    //           text:'Task Creation Failed',
    //           showConfirmButton:false,
    //           timer:3000
    //         });
    //       }
    //     });
    //   } else {
    //      this.submitted = true;
    //      Swal.fire('Alert','Select valid customer','info');
    //   }
    // }else{
    //   this.isButtonDisabled = false;
    //   this.submitted = true;
    //   Swal.fire('Alert','Fill all required fields first','info');
    // }
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
    });
  }
  reload() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }
  taskSearchReset() {
    this.searchTask.controls['regbook_task_date'].setValue('');
    this.searchTask.controls['regbook_user_task'].setValue('');
    this.searchTask.controls['regbook_task_status'].setValue('');
    this.searchTask.controls['filtertasktag'].setValue('');
    this.searchTask.controls['regbook_Tasktagid'].setValue('');
    this.Tasktag_id = '';
    this.filterWorking = false;
    this.datatableCode();
    this.rerender();
  }

  onCustomerId() {
    this.addTaskbookreg.controls['customer_id'].reset();
  }
  public onOptionsSelected(value, result = "") {
    let action_id = typeof (value) == "object" ? value.target.value : value;
    let getaction_id = new FormData();
    getaction_id.append('action_id',action_id);
    this.crmservice.gettaskresult(getaction_id).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
      this.respresStatus = Response.data
      this.addTaskbookreg.patchValue({
        taskResult: result
      });
    });
  }

  public onTaskresultSelected(value) {
    let result_id = typeof (value) == "object" ? value.target.value : value;
    if (result_id != "") {
      this.addTaskbookreg.controls['status'].patchValue(this.respStatus[1]['LookupDataId']);
      this.ChangedStatus(value);
    } else {
      this.addTaskbookreg.controls['status'].reset();
    }
  }
  customerCategory(){
    let lookupStatus = "Category";
    let Statusdata = new FormData();
    Statusdata.append('lookupname',lookupStatus);
    this.hrservice.fetch_lookupdata(Statusdata).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
      this.respcustomerCategory = Response.data

    });
  }
  taskTags() {
    let lookupTags = "";
    let taskTagsdata = new FormData();
    taskTagsdata.append('lookupname',lookupTags);
    this.hrservice.fetchTaskTags(taskTagsdata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
      this.respcusTags = Response.data
      let i =0;
      for(i=0;i<this.respcusTags.length;i++){
        this.custtags1.push({
          'id': this.respcusTags[i]['id'],
          'name': this.respcusTags[i]['name']
        })
      }
    this.custtags = [this.custtags1];
    this.custtags = this.custtags[0];
    });
  }
  SelectedTagsValue(event) {
    this.tagid = event;
    this.tag_id = '';
    this.CustTagID = [];
    for(let i=0;i<this.tagid.length;i++){
      this.CustTagID.push(
        this.tagid[i].id
      );
      this.tag_id = this.CustTagID.join(',');
      this.Tasktag_id = this.CustTagID.join(',')
    }
  }

  ChangedStatus(selectedValue:string){
  }
}
