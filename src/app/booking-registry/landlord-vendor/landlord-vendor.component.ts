import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { DataTableDirective } from 'angular-datatables';
import { BillingService } from 'src/app/services/billing.service';
import { Router } from '@angular/router';
import { from, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
import { HrService } from 'src/app/services/hr.service';
import { LabourService } from 'src/app/services/labour.service';

declare var $;


class landlordInfo {

  title: any[];
  landlords_name: any[];
  reg_area: any[];
  reg_address: any[];
  reg_city: any[];
  reg_district: any[];
  reg_tah: any[];
  reg_state: any[];
  reg_country: any[];
  reg_pincode: any[];
  reg_caste: any[];
  mobile_number: any[];
  alt_mobile_number: any[];
  pan_number: any[];
  adhar_number: any[];
}
class DataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}
@Component({
  selector: 'app-landlord-vendor',
  templateUrl: './landlord-vendor.component.html',
  styleUrls: ['./landlord-vendor.component.css']
})
export class LandlordVendorComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  filterform = this.formBuilder.group({
    src_landlords_name: new FormControl(''),
    src_mobile_number: new FormControl(''),
    khasra_no: new FormControl('')

  });
  data: landlordInfo[];
  // [x: string]: any;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  @ViewChild('landmodal') landmodal;
  @ViewChild('labelImport') labelImport: ElementRef;
  @ViewChild('labelImport1') labelImport1: ElementRef;
  @ViewChild('fileInput') el: ElementRef;
  @ViewChild('closebutton') closebutton;
  @ViewChild('regCountryLabel', { static: true }) regCountryLabel: ElementRef;
  @ViewChild('regStateLabel', { static: true }) regStateLabel: ElementRef;
  editFile: boolean = true;
  removeUpload: boolean = false;
  private modalaction;
  PopupTitle: string;
  DatatableParameter: { src_parent_id: any; src_landlords_name: any; src_mobile_number: any; khasra_no: any};
  submitted = false;
  activeTab: any;
  khasraLists: any[] = [];

  respcustomerTitle: any;
  resplookupCategory: any;
  // parent_id: any;
  PersonalDetails = new FormGroup({
    landlordId: new FormControl(''),

    title: new FormControl('', Validators.required),

    landlords_name: new FormControl('', Validators.required),

    reg_area: new FormControl('', Validators.required),

    reg_caste: new FormControl('', Validators.required),

    adhar_number: new FormControl('', [
      Validators.required,
      Validators.pattern("^[0-9]{12}$")
    ]),

    mobile_number: new FormControl('', [
      Validators.required,
      Validators.pattern("^[0-9]{10}$")
    ]),

    reg_pincode: new FormControl('', [
      Validators.required,
      Validators.pattern("^[0-9]{6}$")
    ]),

    // other fields without validation
    pan_number: new FormControl(''),
    reg_address: new FormControl(''),
    reg_city: new FormControl(''),
    reg_district: new FormControl(''),
    reg_tah: new FormControl(''),
    reg_state: new FormControl(''),
    reg_country: new FormControl(''),
    alt_mobile_number: new FormControl(''),
    pancard_img: new FormControl(''),
    adharimage: new FormControl('')
  });
  CrmUserRole: boolean;
  CRMAdmin: boolean = false;
  constructor(private cd: ChangeDetectorRef, private formBuilder: FormBuilder, private billingservice: BillingService, private route: Router, public http: HttpClient, private router: Router, private hrservice: HrService, private labourService: LabourService) {
    this.DatatableParameter = { src_parent_id: 'null', src_landlords_name: '', src_mobile_number: '', khasra_no: '' };
  }
  ngOnInit(): void {
    this.datatableCode();
    this.lookupData();
    this.getRawKhasraLists();
    this.CrmUserRole = false;
    if (sessionStorage.getItem('UserRole') == 'CRM User') {
      this.CrmUserRole = true;
    }
    if (sessionStorage.getItem('UserRole') == 'CRM Admin') {
      this.CRMAdmin = true;
    }
  }

  getRawKhasraLists() {
    let formData = new FormData();

    this.labourService.getRawKhasraLists(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
      console.log(resp);

      this.khasraLists = resp.map((item: any) => ({
        label: item.raw_khasra,
        value: item.raw_khasra
      }));
    });
  }


  openModalButton() {
    this.submitted = false;
    this.PersonalDetails.reset();
    this.PersonalDetails.controls["reg_country"].setValue("India");
    this.PersonalDetails.controls["reg_state"].setValue("Chhattisgarh");
    this.regCountryLabel.nativeElement.classList.add('active');
    this.regStateLabel.nativeElement.classList.add('active');
  }
  datatableCode() {

    const storedFormValues = JSON.parse(sessionStorage.getItem('landlordFormValues') || '{}');


    this.filterform.get('src_landlords_name')?.setValue(storedFormValues.src_landlords_name);
    this.filterform.get('src_mobile_number')?.setValue(storedFormValues.src_mobile_number);
    this.filterform.get('khasra_no')?.setValue(storedFormValues.khasra_no);


    if (storedFormValues && Object.keys(storedFormValues).length > 0) {
      this.DatatableParameter.src_landlords_name = storedFormValues.src_landlords_name;
      this.DatatableParameter.src_mobile_number = storedFormValues.src_mobile_number;
      this.DatatableParameter.khasra_no = storedFormValues.khasra_no;
    } else {
      this.filterform.reset();
      this.filterform.get('src_landlords_name').setValue('');
      this.filterform.get('src_mobile_number').setValue('');
      this.filterform.get('khasra_no').setValue('');
      sessionStorage.setItem('landlordFormValues', JSON.stringify(this.filterform.value));
      this.DatatableParameter.src_landlords_name = this.filterform.get('src_landlords_name').value;
      this.DatatableParameter.src_mobile_number = this.filterform.get('src_mobile_number').value;
      this.DatatableParameter.khasra_no = this.filterform.get('khasra_no').value;
    }

    this.DatatableParameter.src_parent_id = "null";
    const that = this;
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });
    this.dtOptions = {
      processing: true,
      serverSide: true,
      dom: 'lrtip',
      pageLength: 50,
      lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
      columnDefs: [
        { orderable: false, targets: -1 }
      ],
      ajax: (dataTablesParameters: any, callback) => {
        Object.assign(dataTablesParameters, this.DatatableParameter);
        that.http.post<DataTablesResponse>(environment.APIEndpoint + 'reg_landlords.getlandlorddata&reload=1', Object.assign(dataTablesParameters, this.DatatableParameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {
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
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  searchlandlorddata() {
    sessionStorage.setItem('landlordFormValues', JSON.stringify(this.filterform.value));
    sessionStorage.getItem(JSON.stringify(this.filterform.value));

    if (this.router.url == '/reg-landlord') {
      const storedFormValues = JSON.parse(sessionStorage.getItem('landlordFormValues'));

      if (storedFormValues) {
        this.datatableCode();
        this.rerender();
      }
      else {
        console.log('no values are being set in session')
      }
    }

  }
  resetlandlorddata() {
    // this.PersonalDetails.reset();
    this.filterform.get('src_landlords_name').setValue('');
    this.filterform.get('src_mobile_number').setValue('');
    this.filterform.get('khasra_no').setValue('');
    sessionStorage.setItem('landlordFormValues', JSON.stringify(this.filterform.value));
    this.datatableCode();
    this.rerender();

  }
  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
    });
  }
  addlandlorddetails_fun() {


    this.submitted = true;

    if (this.PersonalDetails.invalid) {
      this.PersonalDetails.markAllAsTouched(); //  IMPORTANT
      Swal.fire('Alert', 'Fill all required fields first', 'info');
      return;
    }

    let landlorddata = new FormData();
    landlorddata.append('title', this.PersonalDetails.get('title').value);
    landlorddata.append('landlords_name', this.PersonalDetails.get('landlords_name').value);
    landlorddata.append('reg_address', this.PersonalDetails.get('reg_address').value);
    landlorddata.append('reg_city', this.PersonalDetails.get('reg_city').value);
    landlorddata.append('reg_tah', this.PersonalDetails.get('reg_tah').value);
    landlorddata.append('reg_district', this.PersonalDetails.get('reg_district').value);
    landlorddata.append('reg_state', this.PersonalDetails.get('reg_state').value);
    landlorddata.append('reg_country', this.PersonalDetails.get('reg_country').value);
    landlorddata.append('reg_pincode', this.PersonalDetails.get('reg_pincode').value);
    landlorddata.append('reg_caste', this.PersonalDetails.get('reg_caste').value);
    landlorddata.append('mobile_number', this.PersonalDetails.get('mobile_number').value);
    landlorddata.append('alt_mobile_number', this.PersonalDetails.get('alt_mobile_number').value);
    landlorddata.append('pan_number', this.PersonalDetails.get('pan_number').value);
    landlorddata.append('adhar_number', this.PersonalDetails.get('adhar_number').value);
    landlorddata.append('reg_area', this.PersonalDetails.get('reg_area').value);
    landlorddata.append('landlordId', this.PersonalDetails.get('landlordId').value);
    this.billingservice.addlandlorddetails(landlorddata).pipe(takeUntil(this.destroy$)).subscribe(Response => {

      if (Response.CODE == 200) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: Response.MESSAGE,
          showConfirmButton: false,
          timer: 2000
        });
        this.reload();
        // this.rerender();
        this.PersonalDetails.reset();
        this.closeModal();
        //this.router.navigate(['/add-landlord/'+Response.landlordId+'/edit']);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Field required!',
          showConfirmButton: false,
          timer: 3000
        });
      }
    });
  }

  view(id) {
    this.router.navigate(['/add-landlord', id, 'view']);
  }
  edit(id) {
    this.router.navigate(['/add-landlord', id, 'edit']);
  }
  remove(id) {
    let removeVendorData = new FormData();
    removeVendorData.append('landlordId', id);
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.value) {
        this.billingservice.deletelandlorddetails(removeVendorData).pipe(takeUntil(this.destroy$)).subscribe(response => {

          if (response) {
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: response.MESSAGE,
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
  landlordTab() {
    this.router.navigate(['/add-landlord']);
  }
  lookupData() {
    let lookupStatus = "title";
    let Statusdata = new FormData();
    Statusdata.append('lookupname', lookupStatus);
    this.hrservice.fetch_lookupdata(Statusdata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
      this.respcustomerTitle = Response.data
    });
    let lookupCategory = "Category";
    let Categorydata = new FormData();
    Categorydata.append('lookupname', lookupCategory);
    this.hrservice.fetch_lookupdata(Categorydata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
      this.resplookupCategory = Response.data
    });
  }
  AdharImage(files: FileList, event) {

    this.labelImport.nativeElement.innerText = Array.from(files)
      .map(f => f.name)
      .join(', ');
    let filecontent = event.target.files[0];
    // this.Adharimagename = filecontent.name
    let reader = new FileReader(); // HTML5 FileReader API
    let file = event.target.files[0];
    if (event.target.files && event.target.files[0]) {
      reader.readAsDataURL(file);

      // When file uploads set it to file formcontrol
      reader.onload = () => {
        // this.image= { adharimage : reader.result}
        // this.imagedata(this.image)
        this.editFile = false;
        this.removeUpload = true;

      }
      // ChangeDetectorRef since file is loading outside the zone
      this.cd.markForCheck();
    }

  }
  PanImage(files: FileList, event) {

    this.labelImport1.nativeElement.innerText = Array.from(files)
      .map(f => f.name)
      .join(', ');
    let filecontent = event.target.files[0];
    // this.panimagename = filecontent.name
    let reader = new FileReader(); // HTML5 FileReader API
    let file = event.target.files[0];
    if (event.target.files && event.target.files[0]) {
      reader.readAsDataURL(file);

      // When file uploads set it to file formcontrol
      reader.onload = () => {
        // this.image= { panimage : reader.result}
        // this.imagedata(this.image)

        this.editFile = false;
        this.removeUpload = true;

      }
      // ChangeDetectorRef since file is loading outside the zone
      this.cd.markForCheck();
    }
  }
  result(tabName: any) {
    this.activeTab = tabName;
  }

  reload() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }
  public closeModal() {
    this.closebutton.nativeElement.click();
  }
}
