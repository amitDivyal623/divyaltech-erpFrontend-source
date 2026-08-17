import { Component, OnInit, ViewChild, ChangeDetectorRef, TemplateRef, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { CrmService } from '../../services/crm.service';
import { HrService } from '../../services/hr.service';
import { StringLiteralLike } from 'typescript';
import { Router } from '@angular/router';
import { from, Subject } from 'rxjs';
import { takeUntil, debounceTime, timeout } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
import { event, Event } from 'jquery';
import { BillingService } from 'src/app/services/billing.service';

class CustomerManagement {
  CompanyId: string;
  CustomerId: string;
  CustomerFirstName: string;
  CustomerLastName: string;
  CustomerType: string;
  ContactBy: string;
  PhoneNumber: string;
  EmialId: string;
  Address: string;
  CityId: string;
  StateId: string;
  CountryId: string;
  PostCode: string;
  Status: string;
  // cust_status: string;
}

class DataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}

declare var jQuery: any;

@Component({
  selector: 'app-crm-customer',
  templateUrl: './crm-customer.component.html',
  styleUrls: ['./crm-customer.component.css']
})

export class CrmCustomerComponent implements OnInit, OnDestroy {
  name = 'Angular';
  isButtonDisabled: boolean = false;
  save_btn: boolean = false;
  isSaving: boolean = false;
  isDeleting: boolean = false;
  private readonly CUSTOMER_DRAFT_KEY = 'crm_customer_add_draft';
  [x: string]: any;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  private destroy$ = new Subject<void>();
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  @ViewChild('cust_status') cust_status;
  @ViewChild('closebutton') closebutton;
  @ViewChild('removebutton') removebutton;
  @ViewChild('customermodal') customermodal;
  @ViewChild('Customerdata') Customerdata;
  modal: any;
  respcusTags = [];
  custtags = [];
  custtags1 = [];
  keyword = 'name';
  data: CustomerManagement[];
  selected;
  employeedataList = [];
  enquiryModeData: any[] = [];
  marketingTeamMembersData: any[] = [];

  showIntroducedBy = false;
  introduceByType: 'none' | 'dropdown' | 'text' = 'none';

  addCrmCustomer = this.form = this.formBuilder.group({
    cust_firstname: new FormControl('', Validators.required),
    cust_lastname: new FormControl(''),
    cust_email: new FormControl(''),
    cust_status: new FormControl('enabled'),
    cust_contprn: new FormControl('', Validators.required),
    cust_customertype: new FormControl('', Validators.required),
    cust_contactnumber: new FormControl('', [Validators.required, Validators.pattern(/^-?(0|[1-9]\d*)?$/), Validators.minLength(10), Validators.maxLength(10)]),
    cust_contactnumber1: new FormControl(''),
    cust_contactnumber2: new FormControl(''),
    cust_Address: new FormControl('', Validators.required),
    cust_Country: new FormControl(''),
    cust_State: new FormControl('', Validators.required),
    cust_City: new FormControl('', Validators.required),
    // cust_Postcode: new FormControl('',[Validators.required, Validators.pattern(/^-?(0|[1-9]\d*)?$/)]),
    CustomerId: new FormControl(''),
    enquiryId: new FormControl(''),
    cust_category: new FormControl(''),
    cust_tags: new FormControl(''),
    cust_title: new FormControl('', Validators.required),
    tag_id: new FormControl(''),
    enquiry_mode: new FormControl(''),
    introduce_by: new FormControl(''),
    txt_introduce_by: new FormControl('')
  });





  searchCrmCustomer = new FormGroup({
    filtercustomernm: new FormControl(''),
    filtercustomertype: new FormControl(''),
    filtercustomerno: new FormControl(''),
    filtercustomertag: new FormControl(''),
    customertag_id: new FormControl(''),
    enquiry_mode: new FormControl(''),
    introduced_by: new FormControl(''),
    stage: new FormControl(''),
  });

  removeCrmCustomer = new FormGroup({
    RemoveCustomerId: new FormControl('')
  });

  DatatableParameter = { customerName: '', customerType: '', customerNo: '', customertag: '', enquiry_mode: '', introduced_by: '', stage:'' };

  constructor(private router: Router, public http: HttpClient, private CrmService: CrmService, private chRef: ChangeDetectorRef, private formBuilder: FormBuilder, private hrservice: HrService, private crmservice: CrmService,private billingservice: BillingService) {
    if (sessionStorage.getItem('token') == undefined && sessionStorage.getItem('UserName') == undefined) {
      this.router.navigate(['/']);
    }
  }
  route(link: any) {
    this.router.navigate(['/' + link]);
  }
  ngOnInit(): void {
    this.isShown = false;
    this.isHide = false;
    this.setDate = false;
    this.addCrmCustomer.get('cust_Country').setValue('India');
    this.addCrmCustomer.get('cust_State').setValue('Chhattisgarh');
    this.searchCrmCustomer.get('filtercustomerno').setValue(localStorage.getItem('mobile'));
    this.searchCrmCustomer.get('filtercustomernm').setValue(localStorage.getItem('name'));
    this.searchCrmCustomer.get('filtercustomertype').setValue(localStorage.getItem('type'));

    this.searchCrmCustomer.get('customertag_id').setValue(localStorage.getItem('tagID'));
    this.datatableCode();
    this.customerCategory();
    this.customerTitle();
    this.employeetypenamelist();
    this.customerTags();
    this.employeelistData(event);
    this.CrmUserRole = false;
    if (sessionStorage.getItem('UserRole') == 'CRM User') {
      this.CrmUserRole = true;
    }
    this.CRMAdmin = false;
    if (sessionStorage.getItem('UserRole') == 'CRM Admin') {
      this.CRMAdmin = true;
    }

    this.enquiryModeList();
    this.getMarketingTeamsLists();
    this.StagesStatuslist();

    // Autosave the Add-Customer form to localStorage so a crashed tab / browser close
    // mid-form doesn't lose everything the user typed. Only saved while actively adding
    // (not edit/view) to avoid clobbering an in-progress edit of a different customer.
    this.addCrmCustomer.valueChanges.pipe(debounceTime(500), takeUntil(this.destroy$)).subscribe(value => {
      // Never persist an empty/reset form as a "draft" - guards against closeModal()'s
      // click bubbling back up to custmodalbackdropbtn() and re-flipping modalaction to
      // 'add' right after a successful save clears it.
      if (this.modalaction === 'add' && value.cust_firstname) {
        localStorage.setItem(this.CUSTOMER_DRAFT_KEY, JSON.stringify(value));
      }
    });
  }

  private checkForDraft() {
    const draftRaw = localStorage.getItem(this.CUSTOMER_DRAFT_KEY);
    if (!draftRaw) { return; }
    let draft: any;
    try {
      draft = JSON.parse(draftRaw);
    } catch (e) {
      localStorage.removeItem(this.CUSTOMER_DRAFT_KEY);
      return;
    }
    Swal.fire({
      title: 'Unsaved draft found',
      text: 'You have an unsaved customer form from earlier. Restore it?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Restore',
      cancelButtonText: 'Discard'
    }).then((result) => {
      if (result.value) {
        this.addCrmCustomer.patchValue(draft);
      } else {
        localStorage.removeItem(this.CUSTOMER_DRAFT_KEY);
      }
    });
  }



  StagesStatuslist() {
    let StagesStatus = "";
    let StagesStatusdata = new FormData();
    StagesStatusdata.append('StagesStatus', StagesStatus);
    this.billingservice.fetch_TopThreeStagesData(StagesStatusdata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
      this.respStages = Response.data;
    });
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


  employeetypenamelist() {
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

  datatableCode() {
    this.DatatableParameter.customerName = this.searchCrmCustomer.get('filtercustomernm').value;
    this.DatatableParameter.customerType = this.searchCrmCustomer.get('filtercustomertype').value;
    this.DatatableParameter.customerNo = this.searchCrmCustomer.get('filtercustomerno').value;
    this.DatatableParameter.enquiry_mode = this.searchCrmCustomer.get('enquiry_mode').value;
    this.DatatableParameter.introduced_by = this.searchCrmCustomer.get('introduced_by').value;
    this.DatatableParameter.stage = this.searchCrmCustomer.get('stage').value;

    const selectedTags = this.searchCrmCustomer.get('filtercustomertag').value || [];
    this.DatatableParameter.customertag = selectedTags.length ? selectedTags.join(',') : '';
    if (this.setDate != false) {
      localStorage.setItem('mobile', this.searchCrmCustomer.get('filtercustomerno').value);
      localStorage.setItem('name', this.searchCrmCustomer.get('filtercustomernm').value);
      localStorage.setItem('type', this.searchCrmCustomer.get('filtercustomertype').value);
    }
    const that = this;
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });
    this.dtOptions = {
      processing: true,
      serverSide: true,
      dom: 'lrtip',
      pageLength: 50,
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
      columnDefs: [
        { orderable: false, targets: [0, 1, -1] } // checkbox, S.No., Action - none are real sortable DB columns
      ],
      order: [[0, 'desc']],
      ajax: (dataTablesParameters: any, callback) => {
        Object.assign(dataTablesParameters, this.DatatableParameter);
        that.http.post<DataTablesResponse>(environment.APIEndpoint + 'crm.fetch_CrmCustomerMngmt&reload=1', Object.assign(dataTablesParameters, this.DatatableParameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {


          that.data = resp.data;
          callback({
            recordsTotal: resp.recordsTotal,
            recordsFiltered: resp.recordsTotal,
            data: []
          });
        });
      }
    };
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  public closeModal() {
    this.closebutton.nativeElement.click();
  }

  public removeModal() {
    this.removebutton.nativeElement.click();
  }

  public customermodalshow() {
    this.customermodal.nativeElement.click();
  }

  private myValue;
  private modalaction;

  openModalButton() {
    this.PopupTitle = "Add New Customer";
    this.save_btn = true;
    this.submitted = false;
    // this.cust_status.nativeElement.value = '1';
    this.addCrmCustomer.reset();
    this.addCrmCustomer.get('cust_status')?.setValue('enabled');
    if (this.modalaction == 'add') {
      this.PopupTitle = "Add New Customer";
      this.addCrmCustomer.enable();
      this.isButtonDisabled = false;
      this.editView = ''
      this.checkForDraft();
    } else if (this.modalaction == 'edit') {
      this.PopupTitle = "Edit Customer";
      this.addCrmCustomer.enable();
      this.isButtonDisabled = false;
      this.editView = 'active'
    } else if (this.modalaction == 'view') {
      this.PopupTitle = "View Customer";
      this.addCrmCustomer.disable();
      this.isButtonDisabled = true;
      this.editView = 'active'
    }
    this.addCrmCustomer.get('cust_Country').setValue('India');
    this.addCrmCustomer.get('cust_State').setValue('Chhattisgarh');

  }

  custmodalbackdropbtn() {
    this.modalaction = 'add';
    this.PopupTitle = "Add New Customer";
  }

  // Backend now returns a plain named object (not a raw query dump), but CFML/Lucee JSON
  // serialization can vary in key casing - look up case-insensitively rather than assume
  // one casing, so this doesn't silently break if that ever changes.
  private normalizeCustomerRow(response: any): any {
    if (!response || typeof response !== 'object') { return null; }
    const get = (key: string) => {
      const foundKey = Object.keys(response).find(k => k.toLowerCase() === key.toLowerCase());
      return foundKey ? response[foundKey] : undefined;
    };
    if (get('CustomerId') === undefined) { return null; } // empty response - no such customer
    return {
      CustomerId: get('CustomerId'),
      CustomerFirstName: get('CustomerFirstName'),
      CustomerLastName: get('CustomerLastName'),
      EmialId: get('EmialId'),
      ContactBy: get('ContactBy'),
      CustomerType: get('CustomerType'),
      PhoneNumber: get('PhoneNumber'),
      PhoneNumber1: get('PhoneNumber1'),
      PhoneNumber2: get('PhoneNumber2'),
      Address: get('Address'),
      CountryId: get('CountryId'),
      StateId: get('StateId'),
      CityId: get('CityId'),
      customer_title: get('customer_title'),
      customer_category: get('customer_category'),
      EnquiryId: get('EnquiryId'),
      EnqType: get('EnqType'),
      introduce_by: get('introduce_by'),
      Status: get('Status'),
      TagIds: get('TagIds')
    };
  }

  view(CustomerId) {
    this.editView = 'active';
    let selecteds = [];

    const getCustomerId = new FormData();
    getCustomerId.append('CustomerId', CustomerId);

    this.CrmService.getCrmCustomerMngmt(getCustomerId).pipe(takeUntil(this.destroy$)).subscribe(Response => {
      const row = this.normalizeCustomerRow(Response);
      if (!row) { return; }

      /* 1 Patch basic fields */
      this.addCrmCustomer.patchValue({
        cust_firstname: row.CustomerFirstName,
        cust_lastname: row.CustomerLastName,
        cust_email: row.EmialId,
        cust_contprn: row.ContactBy,
        cust_customertype: row.CustomerType,
        cust_contactnumber: row.PhoneNumber,
        cust_Address: row.Address,
        cust_Country: row.CountryId,
        cust_State: row.StateId,
        cust_City: row.CityId,
        cust_contactnumber1: row.PhoneNumber1,
        cust_title: row.customer_title,
        cust_category: row.customer_category,
        enquiryId: row.EnquiryId,
        enquiry_mode: String(row.EnqType), // IMPORTANT
        cust_status: row.Status
      });

      /* 3 WAIT for enquiryModeData */
      const waitForModes = setInterval(() => {
        if (this.enquiryModeData?.length) {
          clearInterval(waitForModes);

          /* 4 Decide UI (dropdown/text/none) */
          this.OnSelectValue(String(row.EnqType));

          /* 5 Patch introduce_by AFTER UI exists */
          setTimeout(() => {
            this.addCrmCustomer
              .get('introduce_by')
              ?.setValue(String(row.introduce_by));
          }, 0);
        }
      }, 50);

      /* 6 Tags */
      if (row.TagIds && row.TagIds !== 'null') {
        this.addCrmCustomer.get('cust_tags').setValue(row.TagIds.split(','));
      } else {
        this.addCrmCustomer.get('cust_tags').setValue([]);
      }

      this.selected = selecteds;
    });

    this.modalaction = 'view';
    this.PopupTitle = "View Customer";
    this.isButtonDisabled = true;
    this.addCrmCustomer.disable();
    this.customermodalshow();
  }

  edit(CustomerId: string) {
    this.PopupTitle = "Edit Customer";
    this.editView = 'active';

    const formData = new FormData();
    formData.append('CustomerId', CustomerId);

    this.CrmService.getCrmCustomerMngmt(formData).pipe(takeUntil(this.destroy$)).subscribe(Response => {
      const row = this.normalizeCustomerRow(Response);
      if (!row) { return; }

      /* 1 Patch basic fields */
      this.addCrmCustomer.patchValue({
        cust_firstname: row.CustomerFirstName,
        cust_lastname: row.CustomerLastName,
        cust_email: row.EmialId,
        cust_contprn: row.ContactBy,
        cust_category: row.customer_category,
        cust_customertype: row.CustomerType,
        cust_contactnumber: row.PhoneNumber,
        cust_Address: row.Address,
        cust_Country: row.CountryId,
        cust_State: row.StateId,
        cust_City: row.CityId,
        CustomerId: row.CustomerId,
        cust_contactnumber1: row.PhoneNumber1,
        cust_contactnumber2: row.PhoneNumber2,
        cust_title: row.customer_title,
        enquiryId: row.EnquiryId,
        enquiry_mode: String(row.EnqType), //  force string
        cust_status: row.Status
      });

      /* 2 WAIT for enquiryModeData to exist */
      const waitForModes = setInterval(() => {
        if (this.enquiryModeData?.length) {
          clearInterval(waitForModes);

          this.OnSelectValue(String(row.EnqType));

          /* 3 Set Introduce By AFTER UI renders */
          setTimeout(() => {
            this.addCrmCustomer
              .get('introduce_by')
              ?.setValue(String(row.introduce_by));
          }, 0);
        }
      }, 50);

      /* 4 Tags */
      if (row.TagIds && row.TagIds !== 'null') {
        this.addCrmCustomer.get('cust_tags')?.setValue(row.TagIds.split(','));
      } else {
        this.addCrmCustomer.get('cust_tags')?.setValue([]);
      }
    });

    this.modalaction = 'edit';
    this.isButtonDisabled = false;
    this.addCrmCustomer.enable();
    this.customermodalshow();
  }



  delete(CustomerId) {
    if (this.isDeleting) { return; }
    let removeCustomerData = new FormData();
    removeCustomerData.append('CustomerId', CustomerId);

    let impactData = new FormData();
    impactData.append('CustomerId', CustomerId);
    this.CrmService.checkCustomerDeleteImpact(impactData).pipe(takeUntil(this.destroy$)).subscribe(
      impact => {
        const taskCount = Number(impact?.taskCount) || 0;
        const visitCount = Number(impact?.visitCount) || 0;
        let warningText = 'You want to delete this.';
        if (taskCount > 0 || visitCount > 0) {
          const parts = [];
          if (taskCount > 0) { parts.push(`${taskCount} task${taskCount > 1 ? 's' : ''}`); }
          if (visitCount > 0) { parts.push(`${visitCount} visit record${visitCount > 1 ? 's' : ''}`); }
          warningText = `This customer has ${parts.join(' and ')} linked to them. Deleting the customer will NOT delete those, but they will lose their customer reference. Continue?`;
        }
        this.confirmAndDelete(removeCustomerData, warningText);
      },
      error => {
        // If the impact check itself fails, still let the user delete - just with the generic warning.
        this.confirmAndDelete(removeCustomerData, 'You want to delete this.');
      }
    );
  }

  private confirmAndDelete(removeCustomerData: FormData, warningText: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: warningText,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.value) {
        this.isDeleting = true;
        this.CrmService.deleteCrmCustomerMngmt(removeCustomerData).pipe(timeout(30000), takeUntil(this.destroy$)).subscribe(Response => {
          this.isDeleting = false;
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
        }, error => {
          this.isDeleting = false;
          Swal.fire({
            icon: 'error',
            title: 'Delete Failed',
            text: 'Could not delete the customer — the server may be unavailable or slow to respond. Please try again.',
            showConfirmButton: true
          });
        });
      }
    })
  }

  CustomerSearch() {
    this.setDate = true;
    this.datatableCode();
    this.rerender();
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  insertcustomerDetail() {
    if (this.isSaving) { return; }
    this.selected = [];
    this.save_btn = true;
    if (this.addCrmCustomer.valid) {
      this.save_btn = false;
      this.submitted = false;
      let customerData = new FormData();
      let emp_name = typeof (this.addCrmCustomer.get('cust_contprn').value) == "object" ? this.addCrmCustomer.get('cust_contprn').value.name : this.addCrmCustomer.get('cust_contprn').value;
      customerData.append('CustomerId', this.addCrmCustomer.get('CustomerId').value);
      customerData.append('enquiryId', this.addCrmCustomer.get('enquiryId').value);
      customerData.append('cust_firstname', this.addCrmCustomer.get('cust_firstname').value);
      customerData.append('cust_lastname', this.addCrmCustomer.get('cust_lastname').value);
      customerData.append('cust_email', this.addCrmCustomer.get('cust_email').value);
      customerData.append('cust_status', this.addCrmCustomer.get('cust_status').value);
      customerData.append('cust_contprn', emp_name);
      customerData.append('cust_customertype', this.addCrmCustomer.get('cust_customertype').value);
      customerData.append('cust_contactnumber', this.addCrmCustomer.get('cust_contactnumber').value);
      customerData.append('cust_Address', this.addCrmCustomer.get('cust_Address').value);
      customerData.append('cust_Country', this.addCrmCustomer.get('cust_Country').value);
      customerData.append('cust_State', this.addCrmCustomer.get('cust_State').value);
      customerData.append('cust_City', this.addCrmCustomer.get('cust_City').value);
      customerData.append('cust_contactnumber1', this.addCrmCustomer.get('cust_contactnumber1').value);
      customerData.append('cust_contactnumber2', this.addCrmCustomer.get('cust_contactnumber2').value);
      customerData.append('cust_category', this.addCrmCustomer.get('cust_category').value);

      const selectedTagIds = this.addCrmCustomer.get('cust_tags').value || [];
      const tagIdsString = selectedTagIds.length ? selectedTagIds.join(',') : '';
      customerData.append('cust_tags', tagIdsString);

      customerData.append('cust_title', this.addCrmCustomer.get('cust_title').value);
      customerData.append('enquiry_mode', this.addCrmCustomer.get('enquiry_mode').value);
      this.introduce_by = this.addCrmCustomer.get('introduce_by').value;
      this.txt_introduce_by = this.addCrmCustomer.get('txt_introduce_by').value;

      if (this.introduce_by) {
        this.introduce_by = this.introduce_by;
      } else {
        this.introduce_by = this.txt_introduce_by;
      }
      customerData.append('introduce_by', this.introduce_by);

      this.isSaving = true;
      this.CrmService.addCrmCustomerMngmt(customerData).pipe(timeout(30000), takeUntil(this.destroy$)).subscribe(Response => {
        this.isSaving = false;
        if (Response.CODE == 200) {
          // this.custEnquiryEdit(Response.ID);
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: Response.MESSAGE,
            showConfirmButton: false,
            timer: 2000
          });
          this.addCrmCustomer.reset();
          localStorage.removeItem(this.CUSTOMER_DRAFT_KEY);
          this.closeModal();
          this.reload();
        } else if (Response.CODE == 201) {
          Swal.fire({
            title: 'Customer already exist',
            text: 'Would you like to open the customer detail',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'View',
            cancelButtonText: 'Cancel'
          }).then((result) => {
            if (result.value) {
              this.closeModal();
              this.custEnquiryEdit(Response.ID);
            }
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: Response.MESSAGE || 'Task Creation Failed',
            showConfirmButton: true,
            timer: 3000
          });
        }
      }, error => {
        this.isSaving = false;
        Swal.fire({
          icon: 'error',
          title: 'Save Failed',
          text: 'Could not save the customer — the server may be unavailable or slow to respond. Your entered data is still in the form; please try again.',
          showConfirmButton: true
        });
      });
    } else {
      this.submitted = true;
      this.save_btn = true;
      Swal.fire('Alert', 'Fill all required fields first', 'info');
    }
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first in the current context
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next();
    });
  }
  reload() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }
  isFieldValid(field: string) {
    return !this.form.get(field).valid && this.form.get(field).touched;
  }

  displayFieldCss(field: string) {
    return {
      'has-error': this.isFieldValid(field),
      'has-feedback': this.isFieldValid(field)
    };
  }

  custEnquiryEdit(custEnq) {

    let getCustEnquiry = new FormData();
    getCustEnquiry.append('CustomerId', custEnq);
    this.CrmService.getCustomerEnquiry(getCustEnquiry).pipe(takeUntil(this.destroy$)).subscribe(Respo => {


      if (Respo.SUCESS != '') {
        this.router.navigate(['/crm-enquiry-details/' + Respo.SUCESS + '/edit']);
      }
    })
  }
  resetSearch() {
    this.searchCrmCustomer.reset();
    this.searchCrmCustomer.get('filtercustomernm').setValue('');
    this.searchCrmCustomer.get('filtercustomertype').setValue('');
    this.searchCrmCustomer.get('filtercustomerno').setValue('');
    this.searchCrmCustomer.get('filtercustomertag').setValue('');
    this.searchCrmCustomer.get('customertag_id').setValue('');
    this.searchCrmCustomer.get('enquiry_mode').setValue('');
    this.searchCrmCustomer.get('stage').setValue('');

    this.showIntroducedBy = false;
    this.searchCrmCustomer.get('introduced_by')?.reset();
    this.customertag_id = ''
    localStorage.removeItem('mobile');
    localStorage.removeItem('name');
    localStorage.removeItem('type');
    localStorage.removeItem('tagID');
    this.datatableCode();
    this.rerender();
  }
  customerCategory() {
    let lookupStatus = "Category";
    let Statusdata = new FormData();
    Statusdata.append('lookupname', lookupStatus);
    this.hrservice.fetch_lookupdata(Statusdata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
      this.respcustomerCategory = Response.data
    });
  }
  customerTitle() {
    let lookupStatus = "title";
    let Statusdata = new FormData();
    Statusdata.append('lookupname', lookupStatus);
    this.hrservice.fetch_lookupdata(Statusdata).pipe(takeUntil(this.destroy$)).subscribe(Response => {


      this.respcustomerTitle = Response.data

    });
  }
  customerTags() {
    let lookupTags = "";
    let Tagsdata = new FormData();
    Tagsdata.append('lookupname', lookupTags);
    this.hrservice.fetchTagsLists(Tagsdata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
      this.respcusTags = Response.data;

      // let i =0;
      // for(i=0;i<this.respcusTags.length;i++){
      //   this.custtags1.push({
      //     'id': this.respcusTags[i]['id'],
      //     'name': this.respcusTags[i]['name']
      //   })
      // }
      // this.custtags = [this.custtags1];
      // this.custtags = this.custtags[0];
    });
  }
  // SelectedTagsValue(event) {
  //   this.tagid = event;
  //   this.tag_id = '';
  //   this.CustTagID = [];
  //   for(let i=0;i<this.tagid.length;i++){
  //     this.CustTagID.push(
  //       this.tagid[i].id
  //     );
  //     this.tag_id = this.CustTagID.join(',');
  //     // this.customertag_id =  this.CustTagID.join(',');
  //   }
  // }

  SelectedTagsValue(event) {
    this.CustTagID = event;
    this.tag_id = this.CustTagID.join(',');

    this.addCrmCustomer.get('tag_id').setValue(this.tag_id);
  }


  OnSelectValue(selectedLookupDataId: string) {
    this.addCrmCustomer.get('introduce_by')?.reset();
    this.introduceByType = 'none';

    const selectedMode = this.enquiryModeData.find(
      m => String(m.lookupdataid) === String(selectedLookupDataId)
    );

    if (!selectedMode) return;

    const mode = selectedMode.lookupvalue;

    if (mode === 'Marketing Team') {
      this.introduceByType = 'dropdown'; // use already-loaded data
    }
    else if (mode === 'Calling' || mode === 'Meeting') {
      this.introduceByType = 'none';
    }
    else {
      this.introduceByType = 'text';
    }
  }



  enquiryModeList() {
    let formData = new FormData();
    formData.append('lookupTypeId', '79ac32a7-ef7c-11f0-9534-065da37009bd');
    this.CrmService.getEnquiryModeList(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.enquiryModeData = resp.data;
    });
  }

  getMarketingTeamsLists() {
    let formData = new FormData();
    formData.append('lookupTypeId', 'b5c6adce-ef88-11f0-9534-065da37009bd');
    this.CrmService.getEnquiryModeList(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      this.marketingTeamMembersData = resp.data;
    });
  }

  onEnquiryModeChange(event: any) {
    const selectEl = event.target;
    const selectedIndex = selectEl.selectedIndex;

    // Get displayed text (name)
    const selectedName = selectEl.options[selectedIndex].text.trim();

    // Use ONLY name for logic
    this.showIntroducedBy = selectedName === 'Marketing Team';

    if (!this.showIntroducedBy) {
      this.searchCrmCustomer.get('introduced_by')?.reset();
    }
  }

}
