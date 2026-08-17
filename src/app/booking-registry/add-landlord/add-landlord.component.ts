import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild,AfterViewInit, OnDestroy, Injectable, ViewChildren } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbCalendar, NgbDateAdapter, NgbDate,NgbModule , NgbDateParserFormatter, NgbDateStruct, NgbInputDatepickerConfig , NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { DataTableDirective } from 'angular-datatables';
import { BillingService } from 'src/app/services/billing.service';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { from, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
import { DatePipe } from '@angular/common';
import { HrService } from 'src/app/services/hr.service';
import { TransactionModalComponent } from 'src/app/shared/transaction-modal/transaction-modal.component';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { saveAs } from 'file-saver';


pdfMake.vfs = pdfFonts.pdfMake.vfs;
class landlordInfo {

	title: any[];
  landlords_name: any[];
  reg_area:  any[];
  reg_address: any[];
  reg_city: any[];
  reg_district: any[];
  reg_tah : any[];
  reg_state: any[];
  reg_country : any[];
  reg_pincode : any[];
  reg_caste : any[];
  mobile_number : any[];
  alt_mobile_number : any[];
  pan_number : any[];
  adhar_number : any[];
}

class DataTablesResponse {
	data: any[];
	draw: number;
	recordsFiltered: number;
	recordsTotal: number;
}
class DataTablesResponse1 {
	nomineedata: any[];
	draw: number;
	recordsFiltered: number;
	recordsTotal: number;
}
class landlordAttorney {
  bank_id :  any;
  bankBranch:  any;
  bankHolder:  any;
  accountNo:  any;
  bankIfsc:  any;
  ownedDetail:  any;
  cardDetail:  any;
  cardNumber:  any;
}
@Injectable()
export class CustomAdapter extends NgbDateAdapter<string> {

  readonly DELIMITER = '/';

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
  selector: 'app-add-landlord',
  templateUrl: './add-landlord.component.html',
  styleUrls: ['./add-landlord.component.css'],
  providers: [
    NgbInputDatepickerConfig,
    {provide: NgbDateAdapter, useClass: CustomAdapter},
    {provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter}
  ]

})
export class AddLandlordComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  pipe = new DatePipe('en-US');
  date = new Date();
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  dtOptions1: DataTables.Settings = {};
  dtOptions2: DataTables.Settings = {};
  dtOptions3: DataTables.Settings = {};
  dtTrigger1: Subject<any> = new Subject<any>();
  dtTrigger2: Subject<any> = new Subject<any>();
  dtTrigger3: Subject<any> = new Subject<any>();
  @ViewChild('closebutton') closebutton;
  @ViewChildren(DataTableDirective) dtElement: any;
  @ViewChild('customermodal') customermodal;
   @ViewChild('Nomineemodal') Nomineemodal;
  @ViewChild('landmodal') landmodal;
  @ViewChild('bankmodal')bankmodal: ElementRef;
  @ViewChild('attachmentModalButton')attachmentModalButton: ElementRef;
  @ViewChild('attachmentclosebutton') attachmentclosebutton;
  activeTab = 'Personal';
  searchTab:boolean=true;
  tableTab:boolean=true;
  detailTab: boolean = false;
  IsOwned: boolean = false;
  isChecked: boolean = false;
  @ViewChild('labelImport')labelImport: ElementRef;
  @ViewChild('labelImport1')labelImport1: ElementRef;
  @ViewChild('fileInput') el: ElementRef;



  editFile: boolean = true;
  removeUpload: boolean = false;
  PersonalDetails: FormGroup;
  isButtonVisible: string;
  landlordId: any;
  title: any;
  landlords_name: any;
  reg_area: any;
  reg_address: any;
  reg_city: any;
  reg_district: any;
  reg_tah: any;
  reg_state: any;
  reg_country: any;
  reg_pincode: any;
  uploadMode: Boolean = false;
  reg_caste: any;
  mobile_number: any;
  alt_mobile_number: any;
  pan_number: any;
  adhar_number: any;
  classActive: string;
  submitted: boolean;
  // customermodal: any;
  // landmodal: any;
  PopupTitle: string;
  bankTitle: string;
  flgbnk: string= "Add";
  modalaction: string;
  data: landlordAttorney[];
  dataa: landlordInfo[];
  DatatableParameters: {};
  DatatableParameter: { parentId: any;};

  modalTitle: string;
  newPersonalDetail= new FormGroup({
    flandlordId:new FormControl(''),
    fetchtitle:new FormControl(''),
    fetchlandlord_name:new FormControl(''),
    fetchreg_area: new FormControl(''),
    fetchreg_caste: new FormControl(''),
    fetchadhar_number: new FormControl(''),
    fetch_adharimage: new FormControl(''),
    fetchpan_number: new FormControl(''),
    fetchpancard_img: new FormControl(''),
    fetchmobile_no: new FormControl(''),
    fetchalt_mobile_no: new FormControl(''),
    fetchreg_country: new FormControl(''),
    fetchreg_state: new FormControl(''),
    fetchreg_city: new FormControl(''),
    fetchreg_district: new FormControl(''),
    fetchreg_tah: new FormControl(''),
    fetchreg_pincode: new FormControl(''),
    fetchreg_address: new FormControl(''),
  });
  PersonalDetailsForm = new FormGroup({
    PlandlordId:new FormControl(''),
    adhar_number:new FormControl('',[Validators.required,Validators.pattern('^[0-9]{12}$')]),
    pan_number:new FormControl('',[Validators.required,Validators.pattern('^[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}$')]),
    title:new FormControl('',Validators.required),
    landlords_name:new FormControl('',Validators.required),
    reg_address:new FormControl(''),
    reg_city:new FormControl(''),
    reg_district:new FormControl(''),
    reg_tah:new FormControl(''),
    reg_state:new FormControl(''),
    reg_country:new FormControl(''),
    reg_pincode:new FormControl('',[Validators.required,Validators.pattern('[0-9]{6}$')]),
    reg_caste:new FormControl('',Validators.required),
    mobile_number:new FormControl('',Validators.required),
    alt_mobile_number:new FormControl(''),
    reg_area:new FormControl('',Validators.required),
    pancard_img:new FormControl(''),
    adharimage:new FormControl(''),
  });
  landlordBank= new FormGroup({
    bank_id:new FormControl(''),
    bankLandlordId:new FormControl(''),
    bankName: new FormControl(''),
    bankBranch: new FormControl(''),
    bankHolder: new FormControl(''),
    accountNo: new FormControl(''),
    bankIfsc: new FormControl(''),
    cardNumber: new FormControl(''),
    ownedDetail: new FormControl(''),
    cardDetail: new FormControl(''),
    ownedDetail_chk: new FormControl(''),
    cardDetail_chk : new FormControl(''),
    // expiryDate: new FormControl(' '),
    // cbankName: new FormControl(' '),
  });
  landlordInfo = new FormGroup({
    form_landlord:new FormControl(''),
    form_amount:new FormControl(''),
    form_balamt:new FormControl(''),
    lastPaidDate:new FormControl(''),
    form_khasra:new FormControl(''),
    // form_rakba:new FormControl(' '),
    // form_block:new FormControl(' '),
  });
  landAttachment = new FormGroup({
    attachmentstatus:new FormControl(''),
    landattachmentimg:new FormControl(''),
    attachmeid_id:new FormControl('')
  })
  Transations_form = new FormGroup({
    regTransactionID : new FormControl(''),
    Id : new FormControl(''),
    BankName : new FormControl(''),
    ChequeNumber :new FormControl(''),
    ChequeDate : new FormControl(''),
    AmountPaid : new FormControl(''),
    Recipient_Ac : new FormControl(''),
    EmployeeName : new FormControl(''),
    DepoBankName : new FormControl(''),
    PaymentStatus : new FormControl(''),
    TransactionId : new FormControl(''),
    RemarkStatus : new FormControl(''),
  });
  filterform: any;
  showcardNumberfield: boolean;
  landlordtitle: string;
  resplookupBank: any;
  respPStatus: any;
  employee: any;
  ownedDetail: any;
  cardDetail: any;
  cardNumber: any;
  respcustomerTitle: any;
  resplookupCategory: any;
  attachmentModalHadding: string;
  attachmentimageName: any;
  filecontent: any;
  resplookupremark: any;
  fileuploads: string;
  dataattach: any[];
  id: string;
  method: string;
  nominee_title: any;
  attachmentSubmitted: boolean;
  transactionTitle: string;
  bank_id: string;
  attorneyId: string;
// for comit
  constructor(private cd: ChangeDetectorRef, private _fb: FormBuilder, private billingservice: BillingService, private route: Router, public http: HttpClient, private activatedRoute: ActivatedRoute, private hrservice: HrService, private modalService: NgbModal) {
  this.DatatableParameter = { parentId: '',};
    this.PersonalDetails = this._fb.group({
      DetailPersonal: this._fb.array([])
      });
    }
  ngOnInit(): void {
      this.landlordInfo.disable();
      this.id = this.activatedRoute.snapshot.paramMap.get('id');

      this.activatedRoute.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params: Params) => {
      });


      // this.attorneyDetails.get('attLandlordId').setValue(id);

      this.landlordBank.get('bankLandlordId').setValue(this.id);
      this.method = this.activatedRoute.snapshot.paramMap.get('method');
        if(this.method == 'view'){
          this.landlordtitle = "View Landlord Details"
          this.view(this.id);

        }else{
          this.landlordtitle="Edit Landlord Details"
          this.edit(this.id);

        }
      this.detailTab=true;
      //this.addPersonalDetail();
      this.datatableCode();
      // this.datatableCode();
      this.landlorddatatableCode();
      this.lookupdatalist();
      this.transactionTitle = 'Add Transaction Details';
  }
  openTransactions(){
    const modalRef = this.modalService.open(TransactionModalComponent, { size: 'lg', backdrop: 'static', keyboard: true });
    modalRef.componentInstance.transactionTitle = this.transactionTitle;
    
  }

  Newattachmentadd(){
    // this.reload();
    this.uploadMode = false;
    this.attachmentModalHadding='Add New Attachment'
    this.attachmentModalButton.nativeElement.click();
  }
  lookupData(){
    let lookupStatus = "title";
    let Statusdata = new FormData();
    Statusdata.append('lookupname',lookupStatus);
    this.hrservice.fetch_lookupdata(Statusdata).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
      this.respcustomerTitle = Response.data
    });
    let lookupCategory = "Category";
    let Categorydata = new FormData();
    Categorydata.append('lookupname',lookupCategory);
    this.hrservice.fetch_lookupdata(Categorydata).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
        this.resplookupCategory = Response.data
    });
  }
  edit(id) {
    this.newPersonalDetail.enable();
    let getlandlord = new FormData();
    getlandlord.append('landlord_Id',id);
    this.billingservice.getlandlorddetails(getlandlord).pipe(takeUntil(this.destroy$)).subscribe(Response => {
      if (Response.landlord_data) {
        this.newPersonalDetail.patchValue({
          flandlordId: Response.landlord_data[0].id,
          fetchtitle: Response.landlord_data[0].title,
          fetchlandlord_name: Response.landlord_data[0].landlords_name,
          fetchreg_area: Response.landlord_data[0].area_ward,
          fetchreg_caste: Response.landlord_data[0].caste,
          fetchadhar_number: Response.landlord_data[0].adhar_number,
          fetchpan_number: Response.landlord_data[0].pan_number,
          fetchmobile_no: Response.landlord_data[0].mobile_number,
          fetchalt_mobile_no: Response.landlord_data[0].alt_mobile_number,
          fetchreg_country: Response.landlord_data[0].country,
          fetchreg_state: Response.landlord_data[0].state,
          fetchreg_city: Response.landlord_data[0].city,
          fetchreg_district: Response.landlord_data[0].district,
          fetchreg_tah: Response.landlord_data[0].tah,
          fetchreg_pincode: Response.landlord_data[0].pincode,
          fetchreg_address: Response.landlord_data[0].address
        });

        this.landlordInfo.patchValue({
          form_landlord: Response.landlord_data[0].landlords_name
        });
      }
    });
  }
  view(id) {
    this.newPersonalDetail.disable();
    let getlandlord = new FormData();
    getlandlord.append('landlord_Id',id);
     this.billingservice.getlandlorddetails(getlandlord).pipe(takeUntil(this.destroy$)).subscribe(Response => {
       if (Response.landlord_data) {
        this.newPersonalDetail.patchValue({
          flandlordId: Response.landlord_data[0].id,
          fetchtitle: Response.landlord_data[0].title,
          fetchlandlord_name: Response.landlord_data[0].landlords_name,
          fetchreg_area: Response.landlord_data[0].area_ward,
          fetchreg_caste: Response.landlord_data[0].caste,
          fetchadhar_number: Response.landlord_data[0].adhar_number,
          fetchpan_number: Response.landlord_data[0].pan_number,
          fetchmobile_no: Response.landlord_data[0].mobile_number,
          fetchalt_mobile_no: Response.landlord_data[0].alt_mobile_number,
          fetchreg_country: Response.landlord_data[0].country,
          fetchreg_state: Response.landlord_data[0].state,
          fetchreg_city: Response.landlord_data[0].city,
          fetchreg_district: Response.landlord_data[0].district,
          fetchreg_tah: Response.landlord_data[0].tah,
          fetchreg_pincode: Response.landlord_data[0].pincode,
          fetchreg_address: Response.landlord_data[0].address
        });
        this.landlordInfo.patchValue({
          form_landlord: Response.landlord_data[0].landlords_name
        });
       }
    });
  }
  editNominee(id) {
    this.PersonalDetailsForm.enable();
    this.Nomineemodal.nativeElement.click();
    this.nominee_title = "Edit Nominee Details"
    //this.Nomineemodal.click(this.edit)
    let getlandlord = new FormData();
    getlandlord.append('landlord_Id',id);
    this.billingservice.getlandlorddetails(getlandlord).pipe(takeUntil(this.destroy$)).subscribe(Response => {
      if (Response.landlord_data) {
        this.PersonalDetailsForm.patchValue({
          PlandlordId: Response.landlord_data[0].id,
          title: Response.landlord_data[0].title,
          landlords_name: Response.landlord_data[0].landlords_name,
          reg_area: Response.landlord_data[0].area_ward,
          reg_caste: Response.landlord_data[0].caste,
          adhar_number: Response.landlord_data[0].adhar_number,
          pan_number: Response.landlord_data[0].pan_number,
          mobile_number: Response.landlord_data[0].mobile_number,
          alt_mobile_number: Response.landlord_data[0].alt_mobile_number,
          reg_country: Response.landlord_data[0].country,
          reg_state: Response.landlord_data[0].state,
          reg_city: Response.landlord_data[0].city,
          reg_district: Response.landlord_data[0].district,
          reg_tah: Response.landlord_data[0].tah,
          reg_pincode: Response.landlord_data[0].pincode,
          reg_address: Response.landlord_data[0].address
        });
       }
    });
  }
  viewNominee(id) {

    this.Nomineemodal.nativeElement.click();
    this.PersonalDetailsForm.disable();
    this.nominee_title = "View Nominee Details";
    let getlandlord = new FormData();
    getlandlord.append('landlord_Id',id);
     this.billingservice.getlandlorddetails(getlandlord).pipe(takeUntil(this.destroy$)).subscribe(Response => {
       if (Response.landlord_data) {
        this.PersonalDetailsForm.patchValue({
          plandlordId: Response.landlord_data[0].id,
          title: Response.landlord_data[0].title,
          landlords_name: Response.landlord_data[0].landlords_name,
          reg_area: Response.landlord_data[0].area_ward,
          reg_caste: Response.landlord_data[0].caste,
          adhar_number: Response.landlord_data[0].adhar_number,
          pan_number: Response.landlord_data[0].pan_number,
          mobile_number: Response.landlord_data[0].mobile_number,
          alt_mobile_number: Response.landlord_data[0].alt_mobile_number,
          reg_country: Response.landlord_data[0].country,
          reg_state: Response.landlord_data[0].state,
          reg_city: Response.landlord_data[0].city,
          reg_district: Response.landlord_data[0].district,
          reg_tah: Response.landlord_data[0].tah,
          reg_pincode: Response.landlord_data[0].pincode,
          reg_address: Response.landlord_data[0].address
        });
       }
    });
  }
  datatableCode() {
		const that = this;
		const headers = new HttpHeaders({ 'Content-Type': 'text/plain'});
		this.dtOptions = {
      searching: false,
      processing: true,
      serverSide: true,
      dom: 'lrtip',
      pageLength: 50,
      lengthMenu:[[5, 10, 25, 50], [5, 10, 25, 50]],
      columnDefs: [
        { orderable: false, targets: -1 }
      ],
      order:[[0, 'desc']],
      ajax: (dataTablesParameters: any, callback) => {
				Object.assign(dataTablesParameters, {'id': this.id});

        that.http.post<DataTablesResponse>(environment.APIEndpoint + 'reg_landlords.get_BankDetail&reload=1',dataTablesParameters, { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {
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
  attachdatatableCode() {
		const that = this;
		const headers = new HttpHeaders({ 'Content-Type': 'text/plain'});
		this.dtOptions2 = {
      searching: false,
      processing: true,
      serverSide: true,
      dom: 'lrtip',
      pageLength: 50,
      lengthMenu:[[5, 10, 25, 50], [5, 10, 25, 50]],
      columnDefs: [
        { orderable: false, targets: -1 }
      ],
      order:[[0, 'desc']],
      ajax: (dataTablesParameters: any, callback) => {
				Object.assign(dataTablesParameters, this.DatatableParameters);
        that.http.post<DataTablesResponse>(environment.APIEndpoint + 'reg_landlords.get_BankDetail&reload=1', Object.assign(dataTablesParameters, this.DatatableParameters), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {
          that.dataattach = resp.data;
					callback({
						recordsTotal: resp.recordsTotal,
						recordsFiltered: resp.recordsTotal,
						data: []
					});
				});
			}
		};
  }
  AttachmentImage(files: FileList, event) {
    this.uploadMode = true;
    this.labelImport.nativeElement.innerText = Array.from(files)
    .map(f => f.name)
    .join(', ');
    this.filecontent = event.target.files[0];
    this.attachmentimageName = this.filecontent.name;
    this.fileuploads="changeed";
    this.reload();
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
    this.dtTrigger1.unsubscribe();
    this.dtTrigger2.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
	ngAfterViewInit(): void {
    this.dtTrigger.next();
    this.dtTrigger1.next();
    this.dtTrigger2.next();
  }
  updatelandlorddetails_fun() {
    if(this.newPersonalDetail.valid){
      this.submitted = false;
      let landlorddata = new FormData();
      landlorddata.append('fetchtitle', this.newPersonalDetail.get('fetchtitle').value);
      landlorddata.append('fetchlandlord_name', this.newPersonalDetail.get('fetchlandlord_name').value);
      landlorddata.append('fetchreg_address' ,this.newPersonalDetail.get('fetchreg_address').value);
      landlorddata.append('fetchreg_city', this.newPersonalDetail.get('fetchreg_city').value);
      landlorddata.append('fetchreg_district' ,this.newPersonalDetail.get('fetchreg_district').value);
      landlorddata.append('fetchreg_tah' ,this.newPersonalDetail.get('fetchreg_tah').value);
      landlorddata.append('fetchreg_state' ,this.newPersonalDetail.get('fetchreg_state').value);
      landlorddata.append('fetchreg_country' ,this.newPersonalDetail.get('fetchreg_country').value);
      landlorddata.append('fetchreg_pincode' ,this.newPersonalDetail.get('fetchreg_pincode').value);
      landlorddata.append('fetchreg_caste',this.newPersonalDetail.get('fetchreg_caste').value);
      landlorddata.append('fetchmobile_number',this.newPersonalDetail.get('fetchmobile_no').value);
      landlorddata.append('fetchalt_mobile_number',this.newPersonalDetail.get('fetchalt_mobile_no').value);
      landlorddata.append('fetchpan_number',this.newPersonalDetail.get('fetchpan_number').value);
      landlorddata.append('fetchadhar_number',this.newPersonalDetail.get('fetchadhar_number').value);
      landlorddata.append('fetchreg_area',this.newPersonalDetail.get('fetchreg_area').value);
      landlorddata.append('landlordId',this.newPersonalDetail.get('flandlordId').value);
      this.billingservice.addlandlorddetails(landlorddata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
        if (Response.CODE == 200) {
            Swal.fire({
              icon:'success',
              title:'Success!',
              text:Response.MESSAGE,
              showConfirmButton:false,
              timer:2000
            });
            this.reload();
            // this.rerender();
            this.newPersonalDetail.reset();
            if(this.method == 'view'){
              this.landlordtitle = "View Landlord Details"
              this.view(this.id);

            }else{
              this.landlordtitle="Edit Landlord Details"
              this.edit(this.id);

            }
            // this.closeModal();
            //this.router.navigate(['/add-landlord/'+Response.landlordId+'/edit']);
          } else {
              Swal.fire({
              icon:'error',
              title:'Field required!',
              showConfirmButton:false,
              timer:3000
            });
          }
        });
      }else{
        this.submitted = true;
        // this.save_btn = true;
        Swal.fire('Alert','Fill all required fields first','info');
      }
  }
  landlorddatatableCode() {
    this.DatatableParameter.parentId = this.activatedRoute.snapshot.paramMap.get('id');
		const that = this;
		const headers = new HttpHeaders({ 'Content-Type': 'text/plain'});
		this.dtOptions1 = {
      searching: false,
      processing: false,
      serverSide: true,
      dom: 'lrtip',
      pageLength: 50,
      lengthMenu:[[5, 10, 25, 50], [5, 10, 25, 50]],
      columnDefs: [
        { orderable: false, targets: -1 }
      ],
      order:[[0, 'desc']],
      ajax: (dataTablesParameters: any, callback) => {
				Object.assign(dataTablesParameters, this.DatatableParameter);
        that.http.post<DataTablesResponse1>(environment.APIEndpoint + 'reg_landlords.getnomineedata&reload=1', Object.assign(dataTablesParameters, this.DatatableParameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {
          that.dataa = resp.nomineedata;
					callback({
						recordsTotal: resp.recordsTotal,
						recordsFiltered: resp.recordsTotal,
						dataa: []
					});
				});
			}
		};
  }
  addlandlorddetails_fun() {
    if (this.PersonalDetailsForm.valid) {
      this.submitted = false;
      let landlorddata = new FormData();
      landlorddata.append('parent_id',this.id);
      landlorddata.append('title', this.PersonalDetailsForm.get('title').value);
      landlorddata.append('landlords_name', this.PersonalDetailsForm.get('landlords_name').value);
      landlorddata.append('reg_address', this.PersonalDetailsForm.get('reg_address').value);
      landlorddata.append('reg_area', this.PersonalDetailsForm.get('reg_area').value);
      landlorddata.append('reg_city', this.PersonalDetailsForm.get('reg_city').value);
      landlorddata.append('reg_district', this.PersonalDetailsForm.get('reg_district').value);
      landlorddata.append('reg_tah', this.PersonalDetailsForm.get('reg_tah').value);
      landlorddata.append('reg_state', this.PersonalDetailsForm.get('reg_state').value);
      landlorddata.append('reg_country', this.PersonalDetailsForm.get('reg_country').value);
      landlorddata.append('reg_pincode', this.PersonalDetailsForm.get('reg_pincode').value);
      landlorddata.append('reg_caste', this.PersonalDetailsForm.get('reg_caste').value);
      landlorddata.append('mobile_number', this.PersonalDetailsForm.get('mobile_number').value);
      landlorddata.append('alt_mobile_number', this.PersonalDetailsForm.get('alt_mobile_number').value);
      landlorddata.append('pan_number', this.PersonalDetailsForm.get('pan_number').value);
      landlorddata.append('adhar_number', this.PersonalDetailsForm.get('adhar_number').value);
      landlorddata.append('PlandlordId', this.PersonalDetailsForm.get('PlandlordId').value);

      this.billingservice.addMoreNominee(landlorddata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
        if (Response.CODE == 200) {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: Response.MESSAGE,
            showConfirmButton: false,
            timer: 2000
          });
          this.Nomineemodal.nativeElement.click();
          this.closeModal();
          this.reload();

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
      // this.save_btn = true;
      Swal.fire('Alert','Fill all required fields first','info');
    }
  }

  addBankDetails() {
        if ($("#ownedDetail").is(':checked')== true){
          this.ownedDetail = 1;
        } else {
          this.ownedDetail = 0;
        }
        if ($("#cardDetail").is(':checked')== true){
          this.cardDetail = 1;
          this.cardNumber = this.landlordBank.get('cardNumber').value;
        } else {
          this.cardDetail = 0;
          this.cardNumber = '';
        }
        let bankDetaildata = new FormData();
        bankDetaildata.append('bank_id', this.landlordBank.get('bank_id').value);
        bankDetaildata.append('bankLandlordId', this.landlordBank.get('bankLandlordId').value);
        bankDetaildata.append('bankName',  this.landlordBank.get('bankName').value);
        bankDetaildata.append('bankBranch',  this.landlordBank.get('bankBranch').value);
        bankDetaildata.append('bankHolder',  this.landlordBank.get('bankHolder').value);
        bankDetaildata.append('accountNo' ,  this.landlordBank.get('accountNo').value);
        bankDetaildata.append('bankIfsc' ,  this.landlordBank.get('bankIfsc').value);
        bankDetaildata.append('cardNumber' , this.cardNumber );
        bankDetaildata.append('cardDetail' ,  this.cardDetail);
        bankDetaildata.append('ownedDetail' ,  this.ownedDetail);
        bankDetaildata.append('bankLandlordId' ,  this.id);

        this.billingservice.addBankDetails(bankDetaildata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
          if (Response.CODE == '200') {
            Swal.fire({
              icon:'success',
              title:'Success!',
              text:Response.MESSAGE,
              showConfirmButton:false,
              timer:2000
            });
            this.reload();
            // this.rerender();
            this.landlordBank.reset();
            this.closeModal();
          } else {
              Swal.fire({
              icon:'error',
              title:'Field required!',
              showConfirmButton:false,
              timer:3000
            });
          }
        });
  }
  editBank(bank_id) {
        //this.bankTitle = "Edit Bank detail ";
        this.bankmodal.nativeElement.click();
        let patchbData = new FormData();
        this.landlordBank.enable();
        patchbData.append('bank_id',bank_id);
        this.billingservice.getbankdata(patchbData).pipe(takeUntil(this.destroy$)).subscribe(Response => {
          if (Response.data) {
            this.landlordBank.patchValue({
              bankLandlordId: Response.data[0].bankLandlordId,
              bank_id: Response.data[0].bank_id,
              bankName: Response.data[0].bank_name,
              bankBranch: Response.data[0].branch_name,
              bankHolder: Response.data[0].acc_holder_name,
              accountNo: Response.data[0].account_number,
              bankIfsc: Response.data[0].ifsc_code,
              cardNumber: Response.data[0].card_number

            });
            if (Response.data[0].isCompany_own == 1) {
              this.IsOwned = true;
            } else {
              this.IsOwned = false;
            }
            if (Response.data[0].card_type == 1) {
              this.isChecked = true;
              this.showcardNumberfield = true;
            } else {
              this.isChecked = false;
              this.showcardNumberfield = false;
            }
          }
       
        })
      this.flgbnk = "Edit";

  }



  downloadBankDetails(attorneyId: string,bank_name: string) {


    let bankData = new FormData();

    bankData.append('attorneyId',attorneyId);

    this.attorneyId = attorneyId;
    
    const formData = new FormData();
    if(this.attorneyId){
      formData.append('attorneyId',this.attorneyId);
    }

    const xhr = new XMLHttpRequest();
      xhr.open('POST', environment.APIEndpoint + `reg_landlords.Bank_pdfData&reload=1`, true);
      xhr.responseType = 'blob'; 
      xhr.onload = function () {
        if (xhr.status === 200) {

          
          const blob = new Blob([xhr.response], { type: 'application/pdf' });
          saveAs(blob, 'AttorneyDetails.pdf');
          
        } else {
          console.error('Unexpected response status:', xhr.status);
        }
      };
  
      xhr.onerror = function () {
        console.error('An error occurred during the transaction');
      };
  
      xhr.send(formData);
  


    // let patchbData = new FormData();
    // patchbData.append('bank_id', bank_id);
    // this.landlordBank.disable();
    
    // this.billingservice.getbankdata(patchbData).subscribe(Response => {
    //   if (Response.data) {
    //     const bankData = Response.data[0];
  
    //     this.landlordBank.patchValue({
    //       bankLandlordId: bankData.bankLandlordId,
    //       bank_id: bankData.bank_id,
    //       bankName: bankData.bank_name,
    //       bankBranch: bankData.branch_name,
    //       bankHolder: bankData.acc_holder_name,
    //       accountNo: bankData.account_number,
    //       bankIfsc: bankData.ifsc_code,
    //       cardNumber: bankData.card_number
    //     });
  
    //     this.IsOwned = bankData.isCompany_own == 1;
    //     this.isChecked = bankData.card_type == 1;
    //     this.showcardNumberfield = this.isChecked;
  
        
    //     const documentDefinition = {
    //       content: [
    //         { text: 'Bank Details', style: 'header' },
    //         { text: `Account Holder Name: ${bankData.acc_holder_name}`, margin: [0, 10] },
    //         { text: `Account Number: ${bankData.account_number}`, margin: [0, 10] },
    //         { text: `Bank Name: ${bank_name}`, margin: [0, 10] },
    //         { text: `Branch Name: ${bankData.branch_name}`, margin: [0, 10] },
    //         { text: `Card Number: ${bankData.card_number}`, margin: [0, 10] },
    //         { text: `Card Type: ${bankData.card_type}`, margin: [0, 10] },
    //         { text: `IFSC Code: ${bankData.ifsc_code}`, margin: [0, 10] },
    //       ],
    //       styles: {
    //         header: {
    //           fontSize: 18,
    //           bold: true,
    //           margin: [0, 0, 0, 10]
    //         }
    //       }
    //     };
  
    //     const accountHolderText = documentDefinition.content[1].text;
    //     const accountHolderName = accountHolderText.split(': ')[1];
    //     
    //     pdfMake.createPdf(documentDefinition).download(accountHolderName+'-bank-details');
    //   }
  
    //   // Console logs
    //   console.log("bank data", Response.data[0]);
    //   console.log('acc holder Name', Response.data[0].acc_holder_name);
    //   console.log('Account Number', Response.data[0].account_number);
    //   console.log('Bank Name', Response.data[0].bank_name);
    //   console.log('Branch Name', Response.data[0].branch_name);
    //   console.log('Card Number', Response.data[0].card_number);
    //   console.log('Card Type', Response.data[0].card_type);
    //   console.log('IFSC code', Response.data[0].ifsc_code);
  
    //   this.landlordBank.disable();
    // });
  }
  



  viewBank(bank_id){
        let patchbData = new FormData();
        patchbData.append('bank_id',bank_id);
        this.landlordBank.disable();
        this.billingservice.getbankdata(patchbData).pipe(takeUntil(this.destroy$)).subscribe(Response => {
          if (Response.data) {
            this.landlordBank.patchValue({
              bankLandlordId: Response.data[0].bankLandlordId,
              bank_id: Response.data[0].bank_id,
              bankName: Response.data[0].bank_name,
              bankBranch: Response.data[0].branch_name,
              bankHolder: Response.data[0].acc_holder_name,
              accountNo: Response.data[0].account_number,
              bankIfsc: Response.data[0].ifsc_code,
              cardNumber: Response.data[0].card_number

            });
            if (Response.data[0].isCompany_own == 1) {
              this.IsOwned = true;
            } else {
              this.IsOwned = false;
            }
            if (Response.data[0].card_type == 1) {
              this.isChecked = true;
              this.showcardNumberfield = true;
            } else {
              this.isChecked = false;
              this.showcardNumberfield = false;
            }
          }
          
        })
          
        this.landlordBank.disable();
        this.flgbnk = "View";
        this.bankmodal.nativeElement.click();
  }

  deleteBank(bank_id){
    let delBankData =new FormData();
    delBankData.append('bank_id',bank_id);

    this.billingservice.deletebankdata(delBankData).pipe(takeUntil(this.destroy$)).subscribe(Response => {

   
      if (Response) {
        Swal.fire({
          icon:'success',
          title:'Successfully Deleted!',
          text:Response.MESSAGE,
          showConfirmButton:false,
          timer:2000
        });
        this.reload();
        // this.rerender();
        this.landlordBank.reset();
        this.closeModal();
      } else {
          Swal.fire({
          icon:'error',
          title:'Field required!',
          showConfirmButton:false,
          timer:3000
        });
      }
    })
  }

  // Personal Details
  DetailPersonal() : FormArray {
    return this.PersonalDetails.get("DetailPersonal") as FormArray
  }
  public customermodalshow(){
    this.customermodal.nativeElement.click();
  }
  public landModalShow(){
    this.landmodal.nativeElement.click();
  }

  // More Nominee Modal
  openModalButton() {
    this.PersonalDetailsForm.enable();
    this.labelImport1.nativeElement.innerText = "Upload PAN Photo";
    this.labelImport.nativeElement.innerText = 'Upload Aadhar Photo';
    this.modalTitle = "Add New Bank";
    this.nominee_title = "Add New Nominee";
    if (this.modalaction == 'add') {
      this.modalTitle = "Add New Bank";
    }

    this.PersonalDetailsForm.reset();

  }

  // Attorney Detail Modal
  openAttorButton(){
    this.PopupTitle = "Add New Attorney";
    // if (this.modalaction == 'add') {
    //   this.PopupTitle = "Add New Attorney";
    // }
    // else if(this.modalaction == 'edit'){
    //   this.PopupTitle = "Edit Attorney";
    // }
    // else{
    //   this.PopupTitle = "View Attorney";
    // }
  }

  //
  openLandModal() {
    this.PopupTitle = "Add New ";
    if (this.modalaction == 'add') {
      this.PopupTitle = "Add New ";
    }
  }
  openBankButton(){
    //this.bankTitle = "Add New Bank detail ";
    // if (this.modalaction == 'add') {
    //   this.PopupTitle = "Add New Bank detail";
    // }
    this.landlordBank.enable();

    if (this.flgbnk == "Add") {
      this.bankTitle = "Add New Bank detail";
    }
    else if (this.flgbnk == "Edit")
    {
      this.bankTitle = "Edit Bank detail";
    }
    else if (this.flgbnk == "View")
    {
      this.landlordBank.disable();
      this.bankTitle = "View Bank detail";
    }

    this.flgbnk = "Add"
    this.IsOwned = false;
    this.isChecked = false;
    this.landlordBank.reset();

  }
  custmodalbackdropbtn(){
    this.modalaction= 'add';
    this.modalTitle = "Add New Bank";
  }
  landmodalbtn(){
    this.modalaction = 'add';
    this.PopupTitle = "Add New";
  }
  // attormodalbtn(){
  //   this.modalaction = 'add';
  //   this.PopupTitle = "Add New Attorney" ;
  // }
  // bankmodalbtn(){
  //   this.modalaction = 'add';
  //   this.PopupTitle = "Add New Bank detail";
  // }
  openaddrow()
  {
    if (this.isButtonVisible=="expanded-row-content d-none"){
      this.isButtonVisible="expanded-row-content d-block";
    }
    else{
      this.isButtonVisible="expanded-row-content d-none";
    }
  }
  showCardDetail(e){
    if(e.target.checked){
      this.showcardNumberfield = true;
    }
    else{
      this.showcardNumberfield = false;
    }
  }
  addPersonalDetail() {
    this.DetailPersonal().push(this.newPerdetail());
  }
  newPerdetail(): FormGroup {
    return this._fb.group({
      title: '',
      landlordId: '',
      landlords_name: '',
      reg_area: '',
      reg_caste: '',
      Aadhar_img:'',
      adhar_number: '',
      pancard_img:'',
      pan_number: '',
      mobile_number: '',
      alt_mobile_number: '',
      reg_country: '',
      reg_state: '',
      reg_city: '',
      reg_district: '',
      reg_tah: '',
      reg_pincode: '',
      reg_address:'',
    })
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
  result(tabName:any){
    this.activeTab = tabName;
  }
  lookupdatalist(){
    let lookupBank = "Bank";
    let bankdata = new FormData();
    bankdata.append('lookupname',lookupBank);
    this.hrservice.fetch_lookupdata(bankdata).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
      this.resplookupBank = Response.data
    });

    let employeelist = new FormData();
		this.hrservice.getEmployee(employeelist).pipe(takeUntil(this.destroy$)).subscribe(resp =>{
			this.employee = resp.data;
		});

    // let lookupPaymentStatus = "";
    // let PaymentStatusdata = new FormData();
    // PaymentStatusdata.append('StagesStatus',lookupPaymentStatus);
    // this.billingservice.fetch_PaymentStatus(PaymentStatusdata).subscribe(Response => {
    //   this.respPStatus = Response.data;
    // });

    let PaymentStatus = "";
    let PaymentStatusdata = new FormData();
    PaymentStatusdata.append('StagesStatus',PaymentStatus);
    this.billingservice.fetch_PaymentStatus(PaymentStatusdata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
      this.respPStatus = Response.data;
    });

    let lookupRemark = "Remark";
    let remarkdata = new FormData();
    remarkdata.append('lookupname',lookupRemark);
    this.hrservice.fetch_lookupdata(remarkdata).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
        this.resplookupremark = Response.data
    });


    let lookupStatus = "title";
    let Statusdata = new FormData();
    Statusdata.append('lookupname',lookupStatus);
    this.hrservice.fetch_lookupdata(Statusdata).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
      this.respcustomerTitle = Response.data
    });


    let lookupCategory = "Category";
    let Categorydata = new FormData();
    Categorydata.append('lookupname',lookupCategory);
    this.hrservice.fetch_lookupdata(Categorydata).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
        this.resplookupCategory = Response.data
    });
  }
  rerender():void{
    this.dtElement.dtInstance.then((dtInstance : DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
        this.dtTrigger1.next();
        this.dtTrigger2.next();
    });
  }

  public closeModal() {
    this.closebutton.nativeElement.click();
    // this.Nomineemodal.nativeElement.click();
  }
  reload()
  {
    // this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
    //   dtInstance.ajax.reload();
    // });
    this.dtElement.forEach(item =>
      Object.keys(item.dtOptions).length ?
      item.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.ajax.reload();
      }) : ''
    );
  }


  add_edit_transation ()
  {
    let transationDetaildata= new FormData();
    transationDetaildata.append('regTransactionID',this.Transations_form.value.regTransactionID);
    transationDetaildata.append('Id',this.id);
    transationDetaildata.append('BankName',this.Transations_form.value.BankName);
    transationDetaildata.append('ChequeNumber',this.Transations_form.value.ChequeNumber);
    transationDetaildata.append('ChequeDate',this.Transations_form.value.ChequeDate);
    transationDetaildata.append('AmountPaid',this.Transations_form.value.AmountPaid);
    transationDetaildata.append('Recipient_Ac',this.Transations_form.value.Recipient_Ac);
    transationDetaildata.append('EmployeeName',this.Transations_form.value.EmployeeName);
    transationDetaildata.append('DepoBankName',this.Transations_form.value.DepoBankName);
    transationDetaildata.append('PaymentStatus',this.Transations_form.value.PaymentStatus);
    transationDetaildata.append('TransactionId',this.Transations_form.value.TransactionId);
    transationDetaildata.append('RemarkStatus',this.Transations_form.value.RemarkStatus);

    this.billingservice.AddTransationsDetails(transationDetaildata).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
      
      if (Response.CODE == '200') {
            Swal.fire({
              icon:'success',
              title:'Success!',
              text:Response.MESSAGE,
              showConfirmButton:false,
              timer:2000
            });
            this.reload();
            // this.rerender();
            this.landlordBank.reset();
            this.closeModal();
          } else {
              Swal.fire({
              icon:'error',
              title:'Field required!',
              showConfirmButton:false,
              timer:3000
            });
          }
    });
  }


  attachmentSubmit(){
    if(this.landAttachment.valid){
      this.attachmentSubmitted = false;
      let attachment = new FormData();

      attachment.append('attachmeid_id',this.landAttachment.get('attachmeid_id').value);
      attachment.append('attachmentimage',this.filecontent);
      attachment.append('attachmentimagename',this.attachmentimageName);
      attachment.append('attachmentstatus',this.landAttachment.get('attachmentstatus').value);
      attachment.append('fileuploads',this.fileuploads);
      attachment.append('Customer_id',this.id);
      attachment.append('attachment_type', 'Landlord');
      this.billingservice.addattachment(attachment).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
        if(Response) {
            Swal.fire({
                icon:'success',
                title:'Success!',
                text:Response.MESSAGE,
                showConfirmButton:false,
                timer:2000
            });
            this.landAttachment.reset();
            this.reload();
            this.attachmentclosebutton.nativeElement.click();
        }else{
            Swal.fire({
              icon:'error',
              title:'Error!',
              text:'File upload Failed',
              showConfirmButton:false,
              timer:3000
            });
          }
      });
    }else{
        this.attachmentSubmitted = true;
        Swal.fire({
            icon:'error',
            title:'Required fields empty',
            text:'Please enter the mandatory fields',
            showConfirmButton:false,
            timer:3000
        });
    }
  }
}
