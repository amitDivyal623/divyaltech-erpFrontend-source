import { Component, OnInit, ViewChild, TemplateRef, Injectable, ChangeDetectorRef, OnDestroy, ElementRef } from '@angular/core';
import { NgbCalendar, NgbDateAdapter, NgbDate, NgbDateParserFormatter, NgbDateStruct, NgbInputDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { from, Subject, Observable, forkJoin } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { CrmService } from '../../services/crm.service';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { StringLiteralLike } from 'typescript';
import { DataTableDirective } from 'angular-datatables';
import { environment } from 'src/environments/environment';
import { HrService } from 'src/app/services/hr.service';
import { DatePipe } from '@angular/common';
import { map, startWith, takeUntil } from 'rxjs/operators';
import { AdminService } from 'src/app/services/admin.service';
import { NotificationService } from 'src/app/services/notification.service';

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
        day: parseInt(date[0], 10),
        month: parseInt(date[1], 10),
        year: parseInt(date[2], 10)
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
        day: parseInt(date[0], 10),
        month: parseInt(date[1], 10),
        year: parseInt(date[2], 10)
      };
    }
    return null;
  }

  format(date: NgbDateStruct | null): string {
    return date ? ("0" + date.day).slice(-2) + this.DELIMITER + ("0" + date.month).slice(-2) + this.DELIMITER + date.year : '';
  }
}

@Component({
  selector: 'app-crm-task',
  templateUrl: './crm-task.component.html',
  styleUrls: ['./crm-task.component.css'],
  providers: [
    NgbInputDatepickerConfig,
    { provide: NgbDateAdapter, useClass: CustomAdapter },
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter }
  ]
})
export class CrmTaskComponent implements OnInit, OnDestroy {
  selected = [
    { name: "Active" },
    { name: "Pending" },
  ];
  [x: string]: any;
  model: NgbDateStruct;
  model2: string;
  followupadd: boolean;
  hideTaskSaveButton: boolean = true;
  ishideForAddCase: boolean;
  isAddingTask: boolean = false;
  filterWorking: boolean = true;
  MoreFollowUps: FormGroup;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  private destroy$ = new Subject<void>();
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  @ViewChild('closebutton') closebutton;
  @ViewChild('closebutton1') closebutton1;
  @ViewChild('taskaddModel') taskaddModel: ElementRef;
  @ViewChild('taskEditModel') taskEditModel: ElementRef;
  isHideTaskSave: boolean = true;
  private dateToString = (date) => `${date.year}-${date.month}-${date.day}`;
  respStatus = [];
  categories = [];
  categories1 = [];
  respcusTags = [];
  custtags = [];
  custtags1 = [];
  minDate = { year: 1900, month: 1, day: 1 };
  maxDate = { year: 2099, month: 12, day: 31 };
  DatatableParameter = { Assignee: '', reporters: '', from_date: '', to_date: '', tastStatus: '', Tasktype: '', username: '', usercontact: '', Tasktagid: '', user_contact_person: '' };
  private readonly FILTER_STORAGE_KEY = 'crmTaskFilters';
  dataa: Tasks[];
  customerdataList = [];
  customerData = [];
  keyword = 'name';
  resp: any;
  employee: any;
  modal: any;
  taskselected = [];
  tempTaskSelected = [];
  Tagselected = [];
  visitedPlotsList: any[] = [];
  Tasktag_id: string = '';

  employeetypenamelis() {
    let employeelist = new FormData();
    this.crmservice.getEmployee(employeelist).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.employee = resp.data;
      for (let i = 0; i < resp.data.length; i++) {
        if ('AMAR SONI' == resp.data[i].EmployeeName) {
          this.reporter = resp.data[i].EmployeeId;
        }
      }
    });
  }


  lookupdatalist() {
    let lookupStatus = "Status";
    let Statusdata = new FormData();
    Statusdata.append('lookupname', lookupStatus);
    this.crmservice.fetch_lookupdata(Statusdata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
      console.log(Response);
      const allowedStatuses = ['active', 'completed', 'pending'];
      this.respStatus = (Response?.data || []).filter((item: any) =>
        allowedStatuses.includes((item?.LookupValue || '').toString().trim().toLowerCase())
      );
    });
  }

  addTask = new FormGroup({
    status: new FormControl('', Validators.required),
    // date : new FormControl('',Validators.required),
    // reporter: new FormControl('',Validators.required),
    // assignee:new FormControl('',Validators.required),
    // task_title: new FormControl('',Validators.required),
    contact_no: new FormControl(),
    task_description: new FormControl('', Validators.required),
    visited_plot: new FormControl(''),
    // task_completion: new FormControl(''),
    taskAction: new FormControl('', Validators.required),
    // taskResult : new FormControl(''),
    task_action_response: new FormControl(''),
    task_action_response_logs: new FormControl(''),
    visitor_name: new FormControl('', Validators.required),
    last_followup_date: new FormControl('', Validators.required),
    task_id: new FormControl(''),
    customer_id: new FormControl(''),
    enquiry_id: new FormControl('')
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
  task_status = new FormGroup({
    tstatus: new FormControl('')
  });

  taskActionFrom = new FormGroup({
    taskAction: new FormControl('')
  });
  task_Assignee = new FormGroup({
    TaskAssigne: new FormControl('', Validators.required)
  });
  taskDetails = new FormGroup({
    description: new FormControl('', Validators.required),
    title: new FormControl('', Validators.required),
    follwoupDetails: new FormControl(''),
    status: new FormControl('', Validators.required),
    taskAction: new FormControl(''),
    customer_name: new FormControl('', Validators.required)
  });
  searchTask = new FormGroup({
    task_status: new FormControl('', Validators.required),
    userName: new FormControl('', Validators.required),
    from_date: new FormControl('', Validators.required),
    to_date: new FormControl('', Validators.required),
    customerName: new FormControl('', Validators.required),
    user_task: new FormControl('', Validators.required),
    user_contact: new FormControl('', Validators.required),
    filtertasktag: new FormControl(''),
    Tasktagid: new FormControl(''),
    user_contact_person: new FormControl(''),

  });

  OnlyPLotShownBY = new FormGroup({
    selectedPlotShownBy: new FormControl('', Validators.required),
  });


  constructor(private datePipe: DatePipe, private formBuilder: FormBuilder, private ngbCalendar: NgbCalendar, private dateAdapter: NgbDateAdapter<string>, private router: Router, private http: HttpClient, private crmservice: CrmService, private chRef: ChangeDetectorRef, private hrservice: HrService, private activatedRoute: ActivatedRoute, private adminService: AdminService, private notificationService: NotificationService) {
    if (sessionStorage.getItem('token') == undefined && sessionStorage.getItem('UserName') == undefined) {
      this.router.navigate(['/']);
    }
    this.MoreFollowUps = formBuilder.group({
      address: formBuilder.array([])
    });
  }

  myControl = new FormControl();
  options: string[] = ['One', 'Two', 'Three'];
  filteredOptions!: Observable<string[]>;
  isInitialLoad = true;

  ngOnInit(): void {
    this.assignee = sessionStorage.getItem('EMPLOYEEID');
    this.filteredOptions = this.myControl.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value))
      );

    this.loadFiltersFromSession();

    this.activatedRoute.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {

      // if (params.fromDate && params.toDate) {

      //   // convert incoming date to dd-MM-yyyy
      //   const formattedFromDate = this.datePipe.transform(
      //     params.fromDate,
      //     'dd-MM-yyyy'
      //   );

      //   const formattedToDate = this.datePipe.transform(
      //     params.toDate,
      //     'dd-MM-yyyy'
      //   );

      //   this.searchTask.patchValue({
      //     from_date: formattedFromDate,
      //     to_date: formattedToDate
      //   });

      //   // wait for form/data initialization
      //   setTimeout(() => {

      //     this.taskSearch();
      //     this.router.navigate([], {
      //       relativeTo: this.activatedRoute,
      //       queryParams: {},
      //       replaceUrl: true
      //     });

      //   }, 500);

      // }

    });

    this.datatableCode();
    this.employeetypenamelis();
    this.lookupdatalist();
    this.getTaskActionlist();
    this.taskStatus();

    this.CrmUserRole = false;
    if (sessionStorage.getItem('UserRole') == 'CRM User') {
      this.CrmUserRole = true;
    }
    this.CRMAdmin = false;
    if (sessionStorage.getItem('UserRole') == 'CRM Admin') {
      this.CRMAdmin = true;
    }
    this.employeelistData(event);
  }

  taskStatus() {
    let lookupStatus = "Status";
    let Statusdata = new FormData();
    Statusdata.append('lookupname', lookupStatus);

    this.hrservice.fetch_lookupdata(Statusdata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
      this.respTaskStatus = Response.data;

      this.categories1 = [];

      for (let i = 0; i < this.respTaskStatus.length; i++) {
        this.categories1.push({
          id: this.respTaskStatus[i]['LookupDataId'],
          name: this.respTaskStatus[i]['LookupValue']
        });
      }

      this.categories = this.categories1;

      // SET DEFAULT HERE
      const defaultStatuses = this.categories.filter(
        (s: any) => ['active', 'pending'].includes(s.name.toLowerCase())
      );

      // Only set if nothing already selected (important)
      const current = this.searchTask.get('task_status')?.value;

      // APPLY DEFAULT ONLY ON FIRST LOAD
      if (this.isInitialLoad && (!current || current.length === 0)) {
        this.searchTask.get('task_status')?.setValue(defaultStatuses);
      }

      this.isInitialLoad = false; //  VERY IMPORTANT
    });
  }

  private getSelectedTaskStatuses(): any[] {
    const formStatuses = this.searchTask.get('task_status')?.value;
    if (Array.isArray(formStatuses)) {
      return formStatuses;
    }

    return Array.isArray(this.selected) ? this.selected : [];
  }


  private _filter(value: string): string[] {
    //this.productlistData();
    const filterValue = value.toLowerCase();
    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }

  editTaskAssigne() {
    if (sessionStorage.getItem('UserRole') == 'Admin' || sessionStorage.getItem('UserRole') == 'HR Admin' || sessionStorage.getItem('UserRole') == 'CRM Admin') {
      this.AccessAssigne = false;
    }
  }

  selectCust(e: any) {
    this.addTask.controls['customer_id'].setValue(e.id);

    let formData = new FormData();
    formData.append('customer_id', e.id);

    this.crmservice.getCustomerById(formData).pipe(takeUntil(this.destroy$)).subscribe((resp: any) => {
      if (resp) {
        this.addTask.controls['contact_no'].setValue(resp);
      } else {
        this.addTask.controls['contact_no'].setValue(''); // clear if not found
      }
    });

    this.tryGetVisitedPlotsDetails();
  }

  onCustomerSearch(e) {
    if (e.length > 1) {
      this.customerlistData(e);
    } else {
      this.customerdataList = [];
    }
  }

  customerlistData(e) {
    let customerlist = new FormData();
    customerlist.append('value', e);

    this.crmservice.getCustomerDetail(customerlist).pipe(takeUntil(this.destroy$)).subscribe((resp) => {
      this.customerSuggestion = resp.data;

      // prepare array for autocomplete
      this.customerdataList = this.customerSuggestion.map(cust => ({
        id: cust.CustomerId,
        name: cust.Name
      }));
    });
  }

  editTaskAssigne1() {
    if (sessionStorage.getItem('UserRole') == 'Admin' || sessionStorage.getItem('UserRole') == 'HR Admin' || sessionStorage.getItem('UserRole') == 'CRM Admin') {
      this.AccessAssigne1 = false;
    }
  }

  public taskModalshow() {
    this.taskaddModel.nativeElement.click();
    this.nextFollowup.reset();
    this.followupadd = true;
  }

  openmodal() {
    this.isButtonDisabled = false;
    // this.taskDetails.enable();
    this.submitted = false;
    this.addTask.enable();
    this.addTask.reset();

    this.taskHeading = "Add New Task";
    this.taskaddModel.nativeElement.click();
    this.nextFollowup.reset();
    this.followupadd = true;
    this.additionalFollow = false;
    this.hideTaskSaveButton = true;
    this.isHideTaskSave = true;
    this.ishideForAddCase = false;
    this.isAddingTask = true;
    this.nextFollowup.get('followup_date').enable();
    this.nextFollowup.get('followup_notes').enable();
    this.nextFollowup.get('followup_Time').enable();
    this.applyDefaultTaskActionIfEmpty();
  }

  getTaskActionlist() {
    let actionData = new FormData();
    this.crmservice.getTaskAction(actionData).pipe(takeUntil(this.destroy$)).subscribe(Response => {
      this.taskAction = Response.data;
      this.applyDefaultTaskActionIfEmpty();
    });
  }

  private getDefaultCallTaskActionId(): string {
    if (!Array.isArray(this.taskAction)) {
      return '';
    }

    const callAction = this.taskAction.find((action: any) =>
      (action?.LookupValue || '').toString().trim().toLowerCase() === 'call'
    );

    return callAction?.LookupDataId ? String(callAction.LookupDataId) : '';
  }

  private applyDefaultTaskActionIfEmpty(): void {
    const taskActionControl = this.addTask.get('taskAction');
    if (!taskActionControl) {
      return;
    }

    const currentValue = taskActionControl.value;
    if (currentValue !== null && currentValue !== undefined && currentValue !== '') {
      return;
    }

    const defaultCallActionId = this.getDefaultCallTaskActionId();
    if (defaultCallActionId) {
      taskActionControl.setValue(defaultCallActionId);
    }
  }

  datatableCode() {

    this.status = this.getSelectedTaskStatuses();

    this.taskStatusID = [];

    for (let i = 0; i < this.status.length; i++) {
      this.taskStatusID.push(this.status[i].name);
    }
    this.status_id = this.taskStatusID.join(',');

    this.DatatableParameter.Tasktype = 'CRMTask';
    this.DatatableParameter.reporters = this.searchTask.get('userName').value;
    this.DatatableParameter.Assignee = this.searchTask.get('customerName').value;
    if (this.status_id && this.status_id.trim() !== '') {
      // user selected status
      this.DatatableParameter.tastStatus = this.status_id;
    } else if (this.filterWorking === false) {
      // after reset → send EMPTY (no filter)
      this.DatatableParameter.tastStatus = '';
    } else {
      // default case (initial load)
      this.DatatableParameter.tastStatus = 'Active,Pending';
    }

    this.DatatableParameter.from_date = this.searchTask.get('from_date').value;
    this.DatatableParameter.to_date = this.searchTask.get('to_date').value;

    this.DatatableParameter.username = this.searchTask.get('user_task').value;
    this.DatatableParameter.usercontact = this.searchTask.get('user_contact').value;
    this.DatatableParameter.Tasktagid = this.Tasktag_id,
      this.DatatableParameter.user_contact_person = this.searchTask.get('user_contact_person').value;
    const that = this;
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });
    this.dtOptions = {
      processing: true,
      serverSide: true,
      dom: 'lrtip',
      pageLength: 50,
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
      columnDefs: [
        { orderable: false, targets: 5 }
      ],
      ajax: (dataTablesParameters: any, callback) => {
        Object.assign(dataTablesParameters, this.DatatableParameter);
        that.http.post<DataTablesResponse>(environment.APIEndpoint + 'tasks.fetch_task&reload=1', Object.assign(dataTablesParameters, this.DatatableParameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {
          that.dataa = resp.data;
          callback({ recordsTotal: resp.recordsTotal, recordsFiltered: resp.recordsTotal, data: [] });
        });
      }
    };
  }


  editTaskdesp(type, taskId) {
    this.ishideForAddCase = true;
    this.isAddingTask = false;
    if (type === 'view_task') {
      // Disable main forms
      this.addTask.disable();
      this.nextFollowup.disable();
      this.MoreFollowUps.disable(); // Disable entire form group

      const addressArray = this.MoreFollowUps.get('address') as FormArray;

      addressArray.controls.forEach((group: FormGroup) => {
        group.get('fuDate').disable(); // Disable only fuDate
      });

      // Enable logs and set flags
      this.addTask.get('task_action_response_logs').enable();
      this.isHideTaskSave = false;
      this.hideAddMoreFollowUpButton = false;
    } else {
      // Enable everything in edit mode
      this.isHideTaskSave = true;
      this.hideAddMoreFollowUpButton = true;
      this.addTask.enable();
      this.nextFollowup.enable();
      this.MoreFollowUps.enable(); // Re-enable form group
    }

    this.followupadd = true;
    this.additionalFollow = false;
    const formArray = this.MoreFollowUps.get('address') as FormArray;

    forkJoin({
      taskDetails: this.crmservice.getTaskDetails(taskId),
      visitedPlots: this.crmservice.getVisitedPlots(taskId)
    }).pipe(takeUntil(this.destroy$)).subscribe(({ taskDetails, visitedPlots }) => {
      const Response = taskDetails;

      const visitedPlotText = this.extractVisitedPlotText(visitedPlots);
      this.addTask.patchValue({ visited_plot: visitedPlotText });
      console.log(Response);
      if (Response.DATA) {
        // const lastFollowupRaw = Response.DATA[0][4] ? Response.DATA[0][4] : Response.DATA[0][22];
        const taskDescp = Response.DATA[0][3];
        const nextFollowUp = Response.DATA[0][24];
        const moreFollowUp = Response.DATA[0][39];

        if (taskDescp && nextFollowUp && (!moreFollowUp || moreFollowUp === '[]')) {
          try {
            this.addTask.patchValue({
              // task_description: Response.DATA[0][24]
            })
          } catch (error) {
            console.error('Error parsing data:', error);
          }
        } else if (taskDescp && nextFollowUp && moreFollowUp && moreFollowUp !== '[]') {
          try {
            let rawData = JSON.parse(moreFollowUp);
            if (Array.isArray(rawData) && rawData.length > 0) {
              let lastValue = rawData[rawData.length - 1];
              this.addTask.patchValue({
                // task_description: lastValue
              });
            } else {
              console.warn('Parsed data is not a valid Data');
            }
          } catch (error) {
            console.error('Error parsing data:', error);
          }
        }
        else {
          this.addTask.patchValue({
            // task_description: Response.DATA[0][24],
          });
        }

        this.addTask.patchValue({
          visitor_name: Response.DATA[0][25],
          status: Response.DATA[0][8],
          contact_no: Response.DATA[0][35],
          // CHANGED: show stored value only, do not recalculate
          last_followup_date: Response.DATA[0][4] ? this.datePipe.transform(Response.DATA[0][4], 'yyyy-MM-dd') : '',
          taskAction: Response.DATA[0][40],
          task_id: Response.DATA[0][1],
          customer_id: Response.DATA[0][26],
          enquiry_id: Response.DATA[0][36],
          task_action_response_logs: Response.DATA[0][41],
          task_action_response: '',
          task_description: Response.DATA[0][3]
        });
        this.applyDefaultTaskActionIfEmpty();

        this.OnlyPLotShownBY.patchValue({
          selectedPlotShownBy: Response.DATA[0][42],
        });

        if (Response.DATA[0][24] != '') {
          this.nextFollowup.patchValue({
            followup_notes: Response.DATA[0][24]
          });
          this.nextFollowup.controls['followup_date'].setValue(this.datePipe.transform(Response.DATA[0][22], 'yyyy-MM-dd'));
          this.nextFollowup.controls['followup_Time'].setValue(this.datePipe.transform(Response.DATA[0][23], 'hh:mm'));
        }

        if (Response.DATA[0][37] && Response.DATA[0][38] && Response.DATA[0][39]) {

          let moreFollowupDate = Response.DATA[0][37];
          let moreFollowupTime = Response.DATA[0][38];
          let moreFollowupDesc = Response.DATA[0][39];

          if ((typeof moreFollowupDesc == 'string') && (typeof moreFollowupTime == 'string')) {
            try {
              moreFollowupDesc = JSON.parse(moreFollowupDesc);
              moreFollowupTime = JSON.parse(moreFollowupTime);
              moreFollowupDate = JSON.parse(moreFollowupDate);
            } catch (e) {
              console.error("Invalid JSON format in followup_notes:", moreFollowupTime);
            }
          }

          let responseStringDate = Array.isArray(moreFollowupDate) ? moreFollowupDate.join(',') : moreFollowupDate;
          let valueAfterCommasDate = responseStringDate.split(',');

          let responseStringTime = Array.isArray(moreFollowupTime) ? moreFollowupTime.join(',') : moreFollowupTime;
          let valueAfterCommasTime = responseStringTime.split(',');

          let responseStringDesc = Array.isArray(moreFollowupDesc) ? moreFollowupDesc.join(',') : moreFollowupDesc;
          let valueAfterCommasDesc = responseStringDesc.split(',');

          for (let i = 0; i < valueAfterCommasDesc.length; i++) {
            this.addNewFollowUpGroup();
            formArray.at(i).patchValue({ fuDesp: valueAfterCommasDesc[i].trim() });
            formArray.at(i).patchValue({ fuTime: valueAfterCommasTime[i].trim() });
            formArray.at(i).patchValue({ fuDate: valueAfterCommasDate[i].trim() });
          }

          formArray.controls.forEach(group => type === 'view_task' ? group.disable() : group.enable());
          this.isChangeDisableColor = type !== 'view_task';
        }

        /* ===== CHANGED: Clear old followups for fresh entry ===== */
        if (type !== 'view_task') {
          this.nextFollowup.reset(); // Clear next followup mini-form

          const formArrayClear = this.MoreFollowUps.get('address') as FormArray;
          while (formArrayClear.length !== 0) {
            formArrayClear.removeAt(0); // Remove all previously loaded followups
          }

          this.hideAddMoreFollowUpButton = true; // Keep "Add More Followup" button visible
          this.isHideFollowUps = true; // Keep followup section enabled for fresh entries
        }
        /* ======================================================= */

      }

      if (visitedPlots && visitedPlots.DATA) {
        this.visitedPlotsList = visitedPlots.DATA;
      }

      this.isHideFollowUps = false;
      this.taskHeading = "Edit Task";
      this.activeTaskField = 'active';
      $('#taskHeading').text('Edit Task Detail');
      this.taskModalshow();
    });
  }



  showFollowup(e) {
    if (e.target.checked) {
      this.additionalFollow = true;
    } else {
      this.additionalFollow = false;
    }
  }

  editFollowup(e) {
    if (e.target.checked) {
      this.editFollow = true;
    } else {
      this.editFollow = false;
    }
  }


  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  deletTask(taskID) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.value) {
        this.crmservice.deleteitem(taskID).pipe(takeUntil(this.destroy$)).subscribe(Response => {
          if (Response) {
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: Response.MESSAGE,
              showConfirmButton: false,
              timer: 2000
            });
            this.reload();
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: 'item Delete Failed',
              showConfirmButton: false,
              timer: 3000
            });
          }
        });
      }
    })
  }


  closeModal() {
    this.addTask.reset();
    this.closebutton.nativeElement.click();
    // this.addTask.reset();
    this.nextFollowup.reset();
  }

  redirect(link) {
    this.router.navigate(['/' + link]);
  }

  fetchTaskList() {
    this.crmservice.fetchTaskList().pipe(takeUntil(this.destroy$)).subscribe(Response => { this.resp = Response });
  }

  taskSearch() {

    const fromStr = this.searchTask.get('from_date').value;
    const toStr = this.searchTask.get('to_date').value;

    // If only one date selected → error
    if ((fromStr && !toStr) || (!fromStr && toStr)) {
      Swal.fire({ icon: 'warning', title: 'Date Required', text: 'Please select both From Date and To Date.' });
      return;
    }

    // If both filled → validate
    if (fromStr && toStr) {

      // Convert dd-MM-yyyy → JS Date
      const [fD, fM, fY] = fromStr.split('-');
      const [tD, tM, tY] = toStr.split('-');

      const from = new Date(+fY, +fM - 1, +fD);
      const to = new Date(+tY, +tM - 1, +tD);

      // To < From → error
      if (to < from) {
        Swal.fire({ icon: 'error', title: 'Invalid Date Range', text: 'To Date cannot be earlier than From Date.' });
        return;
      }
    }

    // All good
    this.filterWorking = false;
    this.persistFilters();
    this.datatableCode();
    this.rerender();
  }





  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  insertTask() {
    this.applyDefaultTaskActionIfEmpty();

    if (this.addTask.valid && this.OnlyPLotShownBY.valid) {

      let taskFormData = new FormData();
      taskFormData.append('task_id', this.addTask.get('task_id').value);

      const safeValue = (val: any) => (val !== null && val !== undefined && val !== '' ? val : '');
      taskFormData.append('customerId', safeValue(this.addTask.get('customer_id')?.value));

      taskFormData.append('contactNo', this.addTask.get('contact_no').value);
      taskFormData.append('taskAction', this.addTask.get('taskAction').value);
      taskFormData.append('status', this.addTask.get('status').value);
      taskFormData.append('task_action_response_logs', this.addTask.get('task_action_response_logs').value);

      const enquiry_id = this.addTask.get('enquiry_id').value;
      if (enquiry_id) {
        taskFormData.append('enquiry_id', enquiry_id);
      } else {
        taskFormData.append('enquiry_id', this.activatedRoute.snapshot.paramMap.get('id'));
      }

      let plotShowBy = typeof (this.OnlyPLotShownBY.get('selectedPlotShownBy').value) == "object" ? this.OnlyPLotShownBY.get('selectedPlotShownBy').value.name : this.OnlyPLotShownBY.get('selectedPlotShownBy').value;

      let plotShownByType = this.OnlyPLotShownBY.get('selectedPlotShownBy')?.value;

      if (typeof plotShownByType === 'object') {
        taskFormData.append('plotShownBy', plotShowBy);
      } else {
        taskFormData.append('plotShownBy', this.OnlyPLotShownBY.get('selectedPlotShownBy').value);
      }

      let existingLogs = this.addTask.get('task_action_response_logs').value || "";
      let newResponse = this.addTask.get('task_action_response').value;

      if (this.nextFollowup.get('followup_date').value) {
        const nextFollowupDescription = (newResponse && newResponse.trim() !== '')
          ? newResponse.trim()
          : (this.addTask.get('task_description').value || '');
        taskFormData.append('next_followup_date', this.nextFollowup.get('followup_date').value);
        taskFormData.append('next_followup_time', this.nextFollowup.get('followup_Time').value);
        taskFormData.append('next_followup_description', nextFollowupDescription);
      }

      const currentDate = new Date();
      const formattedDate = currentDate.getDate().toString().padStart(2, '0') + '-' + (currentDate.getMonth() + 1).toString().padStart(2, '0') + '-' + currentDate.getFullYear();

      // Append only if user entered new response
      if (newResponse && newResponse.trim() !== '') {

        let taskActionResponse = formattedDate + ' -> ' + newResponse.trim();

        if (existingLogs) {
          existingLogs = `${taskActionResponse}\n\n${existingLogs}`;
        } else {
          existingLogs = taskActionResponse;
        }
      }

      // Send logs (either updated or original)
      taskFormData.append('task_action_response', existingLogs);

      /* ===== FOLLOWUP LOGIC (OLD PRIORITY RESTORED) ===== */

      const addressArray = this.MoreFollowUps.get('address') as FormArray;
      let followUpDates = addressArray.controls.map(c => c.value.fuDate);
      let followUpTimes = addressArray.controls.map(c => c.value.fuTime);
      const latestTaskActionResponse = (newResponse && newResponse.trim() !== '')
        ? newResponse.trim()
        : (this.addTask.get('task_description').value || '');

      // Priority: More Followups → Next Followup → Existing
      if (followUpDates.length > 0) {
        taskFormData.append("last_followup_date", followUpDates[followUpDates.length - 1]);
      }
      else if (this.nextFollowup.get('followup_date').value) {
        taskFormData.append("last_followup_date", this.nextFollowup.get('followup_date').value);
      }
      else {
        taskFormData.append("last_followup_date", this.addTask.get("last_followup_date").value);
      }

      taskFormData.append("taskDescription", latestTaskActionResponse);

      // Append More Followups only if exist
      if (followUpDates.length > 0) {
        taskFormData.append(
          "moreFollowUpDate",
          followUpDates.length === 1 ? followUpDates[0] : JSON.stringify(followUpDates)
        );
        taskFormData.append("moreFollowUpTime", JSON.stringify(followUpTimes));
        taskFormData.append("moreFollowUpNotes", JSON.stringify(followUpDates.map(() => '')));
      }
      else {
        taskFormData.append("moreFollowUpDate", '');
        taskFormData.append("moreFollowUpTime", '[]');
        taskFormData.append("moreFollowUpNotes", '[]');
      }

      /* ================================= */

      this.crmservice.saveTaskDetails(taskFormData).pipe(takeUntil(this.destroy$)).subscribe(resp => {

        if (resp.CODE == 200) {
          Swal.fire({
            icon: 'success',
            title: 'Success !',
            text: resp.MESSAGE,
            showConfirmButton: false,
            timer: 2000,
          });
          this.closebutton.nativeElement.click();
          this.notificationService.triggerFollowupRefresh();
          // this.getFollowupDetails();
          this.taskModalClosed();
          this.datatableCode();
          this.rerender();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Field required!',
            showConfirmButton: false,
            timer: 3000
          });
        }
      });

    } else {
      this.submitted = true;
      Swal.fire('Alert', 'Fill all required fields first', 'info');
    }
  }


  // getFollowupDetails() {
  //   this.adminService.getFollowupDetails(new FormData()).subscribe(resp => {
  //     this.followupCount = resp;
  //   });
  // }

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
    this.searchTask.reset(); // better than manual clearing

    this.selected = []; //  IMPORTANT (ng-select binding)
    this.taskselected = [];

    this.Tasktag_id = '';
    this.filterWorking = false;

    this.persistFilters();
    this.datatableCode();
    this.rerender();
  }

  private persistFilters(): void {
    const currentStatuses = this.getSelectedTaskStatuses();
    const currentTags = this.searchTask.get('filtertasktag')?.value;
    const filters = {
      task_status: Array.isArray(currentStatuses) ? currentStatuses : [],
      userName: this.searchTask.get('userName')?.value || '',
      from_date: this.searchTask.get('from_date')?.value || '',
      to_date: this.searchTask.get('to_date')?.value || '',
      customerName: this.searchTask.get('customerName')?.value || '',
      user_task: this.searchTask.get('user_task')?.value || '',
      user_contact: this.searchTask.get('user_contact')?.value || '',
      filtertasktag: Array.isArray(currentTags) ? currentTags : [],
      Tasktagid: this.Tasktag_id || '',
      user_contact_person: this.searchTask.get('user_contact_person')?.value || ''
    };

    try {
      sessionStorage.setItem(this.FILTER_STORAGE_KEY, JSON.stringify(filters));
    } catch (error) {
      console.error('Unable to persist CRM task filters', error);
    }
  }

  private loadFiltersFromSession(): void {
    const stored = sessionStorage.getItem(this.FILTER_STORAGE_KEY);
    if (!stored) {
      return;
    }

    try {
      const filters = JSON.parse(stored);
      this.searchTask.patchValue({
        user_task: filters.user_task ?? '',
        user_contact: filters.user_contact ?? '',
        user_contact_person: filters.user_contact_person ?? '',
        from_date: filters.from_date ?? '',
        to_date: filters.to_date ?? '',
        customerName: filters.customerName ?? '',
        userName: filters.userName ?? ''
      });

      const storedStatuses = Array.isArray(filters.task_status) ? filters.task_status : [];
      if (storedStatuses.length) {
        this.searchTask.get('task_status')?.setValue(storedStatuses);
        this.selected = storedStatuses;
      }

      const storedTags = Array.isArray(filters.filtertasktag) ? filters.filtertasktag : [];
      if (storedTags.length) {
        this.searchTask.get('filtertasktag')?.setValue(storedTags);
        this.taskselected = storedTags;
        this.SelectedTagsValue(storedTags);
      } else {
        this.taskselected = [];
        this.SelectedTagsValue([]);
      }

      this.Tasktag_id = filters.Tasktagid ?? this.Tasktag_id;
    } catch (error) {
      console.error('Failed to restore CRM task filters', error);
    }
  }


  taskCustomerProfile(taskEnq) {
    let getCustEnquiry = new FormData();
    getCustEnquiry.append('CustomerId', taskEnq);
    this.crmservice.getCustomerEnquiry(getCustEnquiry).pipe(takeUntil(this.destroy$)).subscribe(Respo => {
      if (Respo.SUCESS != '') {
        this.router.navigate(['/crm-enquiry-details/' + Respo.SUCESS + '/edit']);
      }
    })
  }

  onCustomerId() {
    this.addTask.controls['customer_id'].reset();
  }
  onOptionsSelected(value, result = "") {
    let action_id = typeof (value) == "object" ? value.target.value : value;
    let getaction_id = new FormData();
    getaction_id.append('action_id', action_id);
    this.crmservice.gettaskresult(getaction_id).pipe(takeUntil(this.destroy$)).subscribe(Response => {
      this.respresStatus = Response.data;
      this.addTask.patchValue({
        taskResult: result
      });
    });
  }

  onTaskresultSelected(value) {
    let result_id = typeof (value) == "object" ? value.target.value : value;
    if (result_id != "") {
      this.addTask.controls['status'].patchValue(this.respStatus[1]['LookupDataId']);
      this.ChangedStatus(value);
    } else {
      this.addTask.controls['status'].reset();
    }
  }

  customerCategory() {
    let lookupStatus = "Category";
    let Statusdata = new FormData();
    Statusdata.append('lookupname', lookupStatus);
    this.hrservice.fetch_lookupdata(Statusdata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
      this.respcustomerCategory = Response.data

    });
  }


  SelectedTagsValue(event) {
    this.tagid = event || [];
    this.tag_id = '';
    this.CustTagID = [];
    this.Tasktag_id = '';
    for (let i = 0; i < this.tagid.length; i++) {
      this.CustTagID.push(
        this.tagid[i].id
      );
      this.tag_id = this.CustTagID.join(',');
      this.Tasktag_id = this.CustTagID.join(',');
    }
  }

  public taskModalClosed() {
    const addressArray = this.MoreFollowUps.get('address') as FormArray;
    addressArray.clear();

    this.addTask.reset();
    this.addTask.enable();
    this.OnlyPLotShownBY.reset();

    this.nextFollowup.reset();          // NEW: clear next followup mini-form
    this.additionalFollow = false;
    this.isAddingTask = false;
    this.submitted = false;             // NEW: hide validation errors
    this.isHideFollowUps = true;        // NEW: reset followup section state
    this.hideAddMoreFollowUpButton = true; // NEW: keep Add button ready
  }

  onEmployeeSearch(e) {
    if (e.length > 0) {
      this.employeelistData(e);
    } else {
      this.employeedataList = [];
    }
  }

  employeelistData(e) {
    let customerlist = new FormData();
    //  customerlist.append('value', e);

    this.hrservice.getEmployeeDetail(customerlist).pipe(takeUntil(this.destroy$)).subscribe((resp) => {
      this.customerSuggestion = resp.data;
      this.customerData = this.customerSuggestion.map(item => ({
        id: item.EmployeeId,
        name: item.EmployeeName
      }));
      this.employeedataList = this.customerData; // Assign directly
    });
  }

  onPlotShownBySelected(event: any) {
    this.OnlyPLotShownBY.get('selectedPlotShownBy')?.setValue(event);
    this.tryGetVisitedPlotsDetails();
  }

  private extractVisitedPlotText(visitedPlotsResponse: any): string {
    const rawList =
      visitedPlotsResponse?.DATA ||
      visitedPlotsResponse?.data ||
      visitedPlotsResponse?.visitedPlots ||
      (Array.isArray(visitedPlotsResponse) ? visitedPlotsResponse : []);

    if (!Array.isArray(rawList)) {
      this.visitedPlotsList = [];
      return '';
    }

    this.visitedPlotsList = rawList;

    const plotNames = rawList.map((item: any) => {
      if (!item) { return ''; }
      if (typeof item === 'string') { return item; }
      if (Array.isArray(item)) { return ''; }
      return item.ProductName || item.product_name || '';
    }).filter(name => !!name);

    return [...new Set(plotNames)].join(', ');
  }

  private tryGetVisitedPlotsDetails(): void {
    const visitorValue = this.addTask.get('visitor_name')?.value;
    const matchedCustomer = this.customerdataList.find((customer: any) => {
      if (!customer) {
        return false;
      }

      if (typeof visitorValue === 'object' && visitorValue !== null) {
        return customer.id === visitorValue.id || customer.name === visitorValue.name;
      }

      return customer.name === visitorValue;
    });

    const customerId =
      matchedCustomer?.id ||
      (typeof visitorValue === 'object' ? visitorValue?.id : '') ||
      this.addTask.get('customer_id')?.value;
    const selectedPlotShownByValue = this.OnlyPLotShownBY.get('selectedPlotShownBy')?.value;
    const selectedPlotShownBy =
      typeof selectedPlotShownByValue === 'object'
        ? selectedPlotShownByValue?.name
        : selectedPlotShownByValue;

    if (!customerId || !selectedPlotShownBy) {
      return;
    }

    const formData = new FormData();
    formData.append('customer_id', customerId);
    formData.append('selectedPlotShownBy', selectedPlotShownBy);

    this.crmservice.getVisitedPlotsDetails(formData).pipe(takeUntil(this.destroy$)).subscribe((resp) => {
      const visitedPlotText = this.extractVisitedPlotText(resp);
      this.addTask.patchValue({ visited_plot: visitedPlotText });
    });
  }

  deleteAddressGroup(index: number) {

    this.editMode = false;
    const addressArray = this.MoreFollowUps.get('address') as FormArray;

    if (index >= 0 && index < addressArray.length) {
      addressArray.removeAt(index);
    } else {
      console.warn('Invalid index:', index);
    }

    this.fuDesp[index] = false;
    this.fuDate[index] = false;
    this.fuTime[index] = false;

  }

  addNewFollowUpGroup() {
    this.isHideFollowUps = true;
    this.editMode = true;
    const add = this.MoreFollowUps.get('address') as FormArray;
    add.push(this.formBuilder.group({

      fuDesp: [],
      fuDate: [],
      fuTime: [],

    }));
  }
}
