import { Component, OnInit, ViewChild, ElementRef, TemplateRef, ChangeDetectorRef, OnDestroy, Injectable, ViewChildren } from '@angular/core';
import { forkJoin, from, of, Subject } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { ProjectService } from '../../../services/project.service';
import { HrService } from 'src/app/services/hr.service';
import { GodownService } from '../../../services/godown.service';
import { FormControl, FormBuilder, FormControlName, FormGroup, Validators, FormArray, AbstractControl } from '@angular/forms';
import Swal from 'sweetalert2';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { ModuleResolutionKind, StringLiteralLike } from 'typescript';
import { DataTableDirective } from 'angular-datatables';
import { DatePipe } from '@angular/common';
import { environment } from 'src/environments/environment';
import { NgbCalendar, NgbDateAdapter, NgbDate, NgbDateParserFormatter, NgbDateStruct, NgbInputDatepickerConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { EmployeeModelComponent } from 'src/app/shared/employee-model/employee-model.component';
import { MachineReadingPopupComponent } from 'src/app/shared/machine-reading-popup/machine-reading-popup.component';
import { ProjectGodownModelComponent } from 'src/app/shared/project-godown-model/project-godown-model.component';
import { HistoryDetailsComponent } from '../history-details/history-details.component';
import { distinctUntilChanged, switchMap, map, takeUntil, catchError } from 'rxjs/operators';
import { CrmService } from 'src/app/services/crm.service';
import { AdminService } from 'src/app/services/admin.service';

declare var $;


class workmangment {
    Date: string;
    ProjectName: string;
    employeeName: string;
    Details: string;
    EmployeeId: string;
}
class DataTablesResponse {
    data: any[];
    draw: number;
    recordsFiltered: number;
    recordsTotal: number;
}


@Injectable()
export class CustomAdapter extends NgbDateAdapter<string> {

    readonly DELIMITER = '/';

    fromModel(value: string | null): NgbDateStruct | null {
        if (value) {
            const date = value.split(this.DELIMITER);
            return {
                day: parseInt(date[0], 10),
                month: parseInt(date[1], 10),
                year: parseInt(date[2], 10)
            };
        }
        return null;
    }

    toModel(date: NgbDateStruct | null): string | null {
        return date
            ? `${('0' + date.day).slice(-2)}${this.DELIMITER}${('0' + date.month).slice(-2)}${this.DELIMITER}${date.year}`
            : null;
    }
}

@Injectable()
export class CustomDateParserFormatter extends NgbDateParserFormatter {

    readonly DELIMITER = '/';

    parse(value: string): NgbDateStruct | null {
        if (value) {
            const date = value.split(this.DELIMITER);
            return {
                day: parseInt(date[0], 10),
                month: parseInt(date[1], 10),
                year: parseInt(date[2], 10)
            };
        }
        return null;
    }

    format(date: NgbDateStruct | null): string {
        return date
            ? `${('0' + date.day).slice(-2)}${this.DELIMITER}${('0' + date.month).slice(-2)}${this.DELIMITER}${date.year}`
            : '';
    }
}
declare var require: any;
var dateFormat = require('dateformat');
@Component({
    selector: 'app-add-new-project',
    templateUrl: './add-new-project.component.html',
    styleUrls: ['./add-new-project.component.css'],
    providers: [
        NgbInputDatepickerConfig,
        { provide: NgbDateAdapter, useClass: CustomAdapter },
        { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter }
    ]
})
export class AddNewProjectComponent implements OnInit, OnDestroy {

    // component_object = new ProjectGodownModelComponent(this.hrservice,this.router,this.http,this.formBuilder,this.chRef);
    [x: string]: any;
    dtOptions: DataTables.Settings = {};
    dtOptions1: DataTables.Settings = {};
    dtOptions2: DataTables.Settings = {};
    dtOptions3: DataTables.Settings = {};
    dtOptionsWork: DataTables.Settings = {};
    dtTrigger: Subject<any> = new Subject<any>();
    dtTrigger1: Subject<any> = new Subject<any>();
    dtTrigger2: Subject<any> = new Subject<any>();
    dtTrigger3: Subject<any> = new Subject<any>();
    dtOptions4: DataTables.Settings = {};
    dtTrigger4: Subject<any> = new Subject<any>();
    stocksData: any[] = [];
    godown_list: any;
    initialQuantities: number[] = [];

    workFilterForm!: FormGroup;
    machineFilterForm: FormGroup;

    isSaveDisabled: boolean = false;
    isConSaveDisabled: boolean = false;
    isQuantityValid: boolean = true;
    @ViewChild('modalbutton') modalbutton;
    @ViewChildren(DataTableDirective) dtElement: any;
    @ViewChild('workDetailsclosebutton') workDetailsclosebutton;
    @ViewChild('materialclosebutton') materialclosebutton;
    @ViewChild('closeMaterialConModal') closeMaterialConModal;
    @ViewChild('workModalButton') workModalButton: ElementRef;
    @ViewChild('closeMaterialModal') closeMaterialModal: ElementRef;
    @ViewChild(HistoryDetailsComponent) childComponent: HistoryDetailsComponent;
    @ViewChild('closeWorkModal') closeWorkModal: ElementRef;
    private destroy$ = new Subject<void>();
    keyword = 'combinedSearch';
    activeTab: string = 'work'; // default
    states: [];

    workDetailDatableParameter: { project_id: any, fromDate: any, toDate: any, employeeType: any, contractorName: any, employeeId: any };
    materialDatableParameter: { project_id: any, from: any, to: any, gate_pass: any, to_warehouse: any, category: any, subCategory: any, item: any };
    materialConsumedDatableParameter: { project_id: any };
    StocksDatatableParameter: { project_id: any };

    filteredSubcategoryListsMaterialUsed: any[] = [];
    filteredMaterialsListMaterialUsed: any[] = [];
    getMaterialUsedData: any[] = []; // ✅ NOT undefined

    // materialForm = new FormGroup({
    //    material_id : new FormControl(),
    //    projectName : new FormControl(),
    //    date: new FormControl('',Validators.required),
    // });

    workDatatableParameter = { project_id: '' };
    materialConsumptionData = [];

    materialsList = []
    unitsList: any[] = [];  // global units (for initial load)
    rowUnitsList: any[][] = []; // units per material row 
    DatatableParameter = { searchentrydate: '', searchproject: '', projectId: '', CompanyId: '', searchemployeetype: '', fromDate: '', toDate: '', vehicleName: '', gatePass: '' };
    constructor(private fb: FormBuilder, private hrservice: HrService, private crmservice: CrmService, private gdn_service: GodownService, private modalService: NgbModal, private router: Router, private http: HttpClient, private ProjectService: ProjectService, private chRef: ChangeDetectorRef, private activatedRoute: ActivatedRoute, private datePipe: DatePipe, private spinner: NgxSpinnerService, private adminservice: AdminService) {
        if (sessionStorage.getItem('token') == undefined && sessionStorage.getItem('UserName') == undefined) {
            this.router.navigate(['/']);
        }
        this.workDetailDatableParameter = { project_id: '', fromDate: '', toDate: '', employeeType: '', contractorName: '', employeeId: '' };
        this.materialDatableParameter = { project_id: '', from: '', to: '', gate_pass: '', to_warehouse: '', category: '', subCategory: '', item: '' };
        this.materialConsumedDatableParameter = { project_id: '' };
        this.StocksDatatableParameter = { project_id: '' };

    }
    //end of search select code
    minDate = { year: 1900, month: 1, day: 1 };
    maxDate = { year: 2099, month: 12, day: 31 };

    workDetailsdata: workmangment[]

    materialConsumedForm = new FormGroup({
        consumption_id: new FormControl(),
        consumedDate: new FormControl('', Validators.required),
        gatePass: new FormControl('', Validators.required),
        //   consumedMaterial: new FormControl(),
        //   balanceQuantity: new FormControl(),
        //   consumedUnit: new FormControl(),
        //   usedQuantity: new FormControl(),
        //   consumedScrap: new FormControl(),
        //   consumedRate: new FormControl(),
        //   consumedAmount: new FormControl(),
    });

    ngOnInit(): void {


        this.projectDetails = this.fb.group({
            customer_name: [''],
            godownlist: [''],
            persons_id: [''],
            projectName: ['', Validators.required],
            ProjectCo_ordinator: [''],
            projectmanager: [''],
            project_type: [''],
            Expected_Cost: [''],
            Status: [''],
            startDate: [null],
            endDate: [null],
            state: [''],
            Address: [''],
            project_dscription: [''],
            projectId: ['']
        });

        this.workDetails = this.fb.group({
            work_detail_id: [''],
            entryDate: ['', Validators.required],
            projectName: [''],
            EmployeeType: [''],
            EmployeeName: [''],
            working_notes: ['', Validators.required],
        });

        this.materialForm = this.fb.group({
            material_id: [''],
            projectName: [''],
            date: ['', Validators.required],
            materials: this.fb.array([this.createMaterial()], this.validateMaterialsArray.bind(this)),
            warehouse: [''],
            vehicleNameNo: [''],
            issuedTo: [''],
            issuedBy: [''],
            gatePass: [''],
            description: [''],
            balance: ['']
        });


        this.addMachineReading = this.fb.group({
            date: ['', Validators.required],
            startReading: ['', Validators.required],
            stopReading: ['', Validators.required],
            machineStart: ['', Validators.required],
            machineStop: ['', Validators.required],
            extendedTime: ['', Validators.pattern(/^[.\d]+$/)],
            vendertype: ['', Validators.required],
            vechiceltype: ['', Validators.required],
            reading: ['']
        });

        this.materialConsumedForm = this.fb.group({
            consumption_id: [''],
            consumedDate: [''],
            gatePass: [''],
            consumedMaterials: this.fb.array([])
        });

        this.workFilterForm = this.fb.group({
            fromDate: [''],
            toDate: [''],
            employeeType: [''],
            contractorName: [''],   // for LIKE
            employeeId: ['']        // for =
        });


        this.machineFilterForm = this.fb.group({
            fromDate: [''],
            toDate: [''],
            vehicleName: [''],
            gatePass: [''],

            totalTimeSpent: [{ value: '', disabled: true }],  // NEW
            totalRun: [{ value: '', disabled: true }]
        });


        this.searchMaterialUsedForm = this.fb.group({
            from: [null],
            to: [null],
            gate_pass: [null],
            to_warehouse: [null],
            category: [null],
            subCategory: [null],
            item: [null]
        });

        this.role = sessionStorage.getItem('UserRole');
        this.projectEditDiv = false;
        const id = this.activatedRoute.snapshot.paramMap.get('id');
        const method = this.activatedRoute.snapshot.paramMap.get('method');
        this.getStatesLists();
        if (method == 'view') {
            this.workDetails.disable();
            this.header = 'View Project';
            // this.taskDetails.disable();
            // this.noteDetails.disable();
            //this.attachmenDetails.disable();
            setTimeout(() => {
                $('.form-control').prop('disabled', true);
                $('.form-disable').hide();
            }, 1000);
        } else if (method == 'edit') {
            this.header = 'Edit Project';
        } else {
            this.header = 'Add Project';
        }
        if (method == 'edit' || method == 'view') {
            this.projectDetails.get('projectId').setValue(id);
            this.editData(id);
            // this.Workdatatabl();
            this.employeetypenamelis();
            this.machineDatatableCode();
            this.workDetailsEntryDatatablecode();
            this.materialUsedDatatablecode();
            this.materialConsumptionDatatablecode();
            this.projectlist();
            this.stocksDatatablecode();
            this.EmployeeTypeAccess = true;

        }
        this.lookuplist();
        this.contractorlist();
        this.getVehicleslists();
        this.getCategoryLists();
        this.getSubCategoryLists();
        this.getAllMaterialLists();
        this.getWarehouselists();


        this.workDetails.get('EmployeeType')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
            if (value === '07e8f83d-596e-11eb-b9f1-063127f6ced7') {
                // Contractor → reset EmployeeName for text input
                this.workDetails.get('EmployeeName')?.reset('');
            } else {
                // Other employee types → reset EmployeeName for dropdown
                this.workDetails.get('EmployeeName')?.reset('');
            }
        });

        this.loadMaterialsDropdown();



    }

    loadMaterialsDropdown() {
        // Only load if not already available
        if (!this.getMaterialUsedData || this.getMaterialUsedData.length === 0) {
            let formData = new FormData();
            const project_id = this.activatedRoute.snapshot.paramMap.get('id');
            formData.append('project_id', project_id);

            this.ProjectService.getMaterialsUsedLists(formData)
                .pipe(takeUntil(this.destroy$))
                .subscribe(resp => {
                    this.getMaterialUsedData = resp.data;
                });
        }
    }



    getVehicleslists() {
        let formData = new FormData();
        formData.append('status_enabled', '1');
        this.ProjectService.getVehicleslists(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
            this.vehicleList = resp.data;
        });
    }

    getWarehouselists() {
        let formData = new FormData();
        formData.append('statue_enabled', '1');
        this.ProjectService.getWarehouselists(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
            this.warehouseList = resp.data;
        });

    }

    employeetypenamelist() {
        let employeelist = new FormData();
        this.crmservice.getEmployee(employeelist).pipe(takeUntil(this.destroy$)).subscribe(resp => {
            this.employee = resp.data;
        });
    }



    btnReload() {
        this.childComponent.reload();
    }

    projectlist() {
        let projectlist = new FormData();
        this.hrservice.projectlist(projectlist).pipe(takeUntil(this.destroy$)).subscribe(Response => {
            this.respProject = Response.data
        });
    }

    fetchTotalRunAndTime() {
        const that = this;
        const headers = new HttpHeaders({ 'content-Type': 'text/plain' });

        const params = {
            ...this.DatatableParameter
        };


        that.http.post(
            environment.APIEndpoint + 'hr.fetchTotalRunAndTime&reload=1',
            params,
            { headers }
        ).pipe(takeUntil(this.destroy$)).subscribe((resp: any) => {
            that.machineFilterForm.patchValue({
                totalTimeSpent: resp?.total_time_spent ?? 0,
                totalRun: resp?.total_run ?? 0
            });

        }, error => {
            console.error('Summary API Error:', error);
        });
    }


    machineDatatableCode() {
        this.DatatableParameter.projectId = this.activatedRoute.snapshot.paramMap.get('id');
        this.DatatableParameter.fromDate = this.machineFilterForm.get('fromDate')?.value;
        this.DatatableParameter.toDate = this.machineFilterForm.get('toDate')?.value;
        this.DatatableParameter.vehicleName = this.machineFilterForm.get('vehicleName')?.value;
        this.DatatableParameter.gatePass = this.machineFilterForm.get('gatePass')?.value;
        // this.DatatableParameter.searchentrydate = '';
        // this.DatatableParameter.searchproject = '';
        // this.DatatableParameter.searchemployeetype = '';


        this.fetchTotalRunAndTime();

        const that = this;
        const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });
        this.dtOptions1 = {
            processing: true,
            serverSide: true,
            dom: 'lrtip',
            pageLength: 50,
            lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
            order: [[1, 'desc']],
            columnDefs: [
                { orderable: false, targets: 5 }
            ],
            ajax: (dataTablesParameters: any, callback) => {
                Object.assign(dataTablesParameters, this.DatatableParameter);
                that.http.post<DataTablesResponse>(environment.APIEndpoint + 'hr.fetchMachineReadingAndDailyDairy&reload=1', Object.assign(dataTablesParameters, this.DatatableParameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {
                    console.log(resp.data);
                    that.machineData = resp.data;
                    callback({ recordsTotal: resp.recordsTotal, recordsFiltered: resp.recordsTotal, data: [] });
                });
            }
        };
    }

    workDetailsEntryDatatablecode() {
        this.projectId = this.activatedRoute.snapshot.paramMap.get('id');
        this.workDetailDatableParameter.project_id = this.projectId;
        this.workDetailDatableParameter.fromDate = this.workFilterForm.get('fromDate')?.value;
        this.workDetailDatableParameter.toDate = this.workFilterForm.get('toDate')?.value;
        this.workDetailDatableParameter.employeeType = this.workFilterForm.get('employeeType')?.value;
        this.workDetailDatableParameter.contractorName = this.workFilterForm.get('contractorName')?.value;
        this.workDetailDatableParameter.employeeId = this.workFilterForm.get('employeeId')?.value;
        const that = this;
        const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });
        this.dtOptions = {
            processing: true,
            serverSide: true,
            dom: 'lrtip',
            pageLength: 25,
            lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
            columnDefs: [
                { orderable: false, targets: 0 }
            ],
            ajax: (DatatableParameter: any, callback) => {
                that.http.post<DataTablesResponse>(environment.APIEndpoint + 'project.fetchWorkDetailsEntry&reload=1', Object.assign(DatatableParameter, this.workDetailDatableParameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {
                    that.workDetailsData = resp.data
                    callback({ recordsTotal: resp.recordsTotal, recordsFiltered: resp.recordsFiltered, data: [] });
                });
            }
        }
    }

    materialUsedDatatablecode() {
        this.projectId = this.activatedRoute.snapshot.paramMap.get('id');
        this.materialDatableParameter.project_id = this.projectId;
        this.materialDatableParameter.from = this.searchMaterialUsedForm.get('from').value;
        this.materialDatableParameter.to = this.searchMaterialUsedForm.get('to').value;
        this.materialDatableParameter.gate_pass = this.searchMaterialUsedForm.get('gate_pass').value;
        this.materialDatableParameter.to_warehouse = this.searchMaterialUsedForm.get('to_warehouse').value;
        this.materialDatableParameter.category = this.searchMaterialUsedForm.get('category').value;
        this.materialDatableParameter.subCategory = this.searchMaterialUsedForm.get('subCategory').value;
        this.materialDatableParameter.item = this.searchMaterialUsedForm.get('item').value;
        const that = this;
        const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });
        this.dtOptions2 = {
            processing: true,
            serverSide: true,
            dom: 'lrtip',
            pageLength: 25,
            lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
            columnDefs: [
                { orderable: false, targets: 0 }
            ],
            ajax: (DatatableParameter: any, callback) => {
                that.http.post<DataTablesResponse>(environment.APIEndpoint + 'project.fetchMaterialUsed&reload=1', Object.assign(DatatableParameter, this.materialDatableParameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {
                    that.materialUsedData = resp.data;
                    callback({ recordsTotal: resp.recordsTotal, recordsFiltered: resp.recordsFiltered, data: [] });
                });
            }
        }
    }

    materialConsumptionDatatablecode() {
        this.projectId = this.activatedRoute.snapshot.paramMap.get('id');
        this.materialConsumedDatableParameter.project_id = this.projectId;
        const that = this;
        const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });
        this.dtOptions3 = {
            processing: true,
            serverSide: true,
            dom: 'lrtip',
            pageLength: 25,
            lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
            columnDefs: [
                { orderable: false, targets: 0 }
            ],
            ajax: (DatatableParameter: any, callback) => {
                that.http.post<DataTablesResponse>(environment.APIEndpoint + 'project.fetchMaterialConsumption&reload=1', Object.assign(DatatableParameter, this.materialConsumedDatableParameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {
                    this.materialConsumptionData = resp.data;
                    console.log(this.materialConsumptionData);
                    callback({ recordsTotal: resp.recordsTotal, recordsFiltered: resp.recordsFiltered, data: [] });
                });
            }
        }
    }

    stocksDatatablecode() {
        this.projectId = this.activatedRoute.snapshot.paramMap.get('id');
        this.StocksDatatableParameter.project_id = this.projectId;
        const that = this;
        const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });
        this.dtOptions4 = {
            processing: true,
            serverSide: true,
            dom: 'lrtip',
            pageLength: 25,
            lengthMenu: [[5, 10, 25, 50, 100], [5, 10, 25, 50, 100]],
            columnDefs: [
                { orderable: false, targets: 0 }
            ],
            ajax: (DatatableParameter: any, callback) => {
                that.http.post<DataTablesResponse>(environment.APIEndpoint + 'project.fetchStocksByProject&reload=1', Object.assign(DatatableParameter, this.StocksDatatableParameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {
                    this.stocksData = resp.data;
                    callback({ recordsTotal: resp.recordsTotal, recordsFiltered: resp.recordsFiltered, data: [] });
                });
            }
        }
    }



    addnewMachine() {
        this.submitted = false;
        this.fieldStatus = false;
        this.setData = false;
        this.addMachineReading.reset();
        this.machineTitle = 'Add new Entry';
        this.addMachineReading.enable();
        this.isButtonDisabled = false;
        this.saveButton1 = true;
        this.projectId = this.activatedRoute.snapshot.paramMap.get('id');
        this.openMachineReadingModel();
    }

    openMachineReadingModel() {
        const modalRef = this.modalService.open(MachineReadingPopupComponent, { size: 'lg', backdrop: 'static', keyboard: true });
        modalRef.componentInstance.machineTitle = this.machineTitle;
        modalRef.componentInstance.datetime = this.readingDate;
        modalRef.componentInstance.respcontractor = this.respcontractor;
        modalRef.componentInstance.vechicalList = this.vechicalList;
        modalRef.componentInstance.isButtonDisabled = this.isButtonDisabled;
        modalRef.componentInstance.submitted = this.submitted;
        modalRef.componentInstance.reading = this.reading;
        modalRef.componentInstance.startReading = this.startReading;
        modalRef.componentInstance.stopReading = this.stopReading;
        modalRef.componentInstance.machineStart = this.machineStart;
        modalRef.componentInstance.machineStop = this.machineStop;
        modalRef.componentInstance.extendedTime = this.extendedTime;
        modalRef.componentInstance.vendertype = this.vendertype;
        modalRef.componentInstance.vechiceltype = this.vechiceltype;
        modalRef.componentInstance.vendorId = this.vendorId;
        modalRef.componentInstance.VehicleNo = this.VehicleNo;
        modalRef.componentInstance.gate_pass_no = this.gate_pass_no;
        modalRef.componentInstance.total_run = this.total_run;
        modalRef.componentInstance.amount = this.amount;
        modalRef.componentInstance.MachineNotes = this.MachineNotes;
        modalRef.componentInstance.setData = this.setData;
        modalRef.componentInstance.fieldStatus = this.fieldStatus;
        modalRef.componentInstance.saveButton1 = this.saveButton1;
        modalRef.componentInstance.respProject = this.respProject;
        modalRef.componentInstance.projectId = this.projectId;
        modalRef.result.then((response: any) => {
            this.reload('machine_reading');
        }, () => { });
    }
    addGodownModal(event) {
        if (event === 'modal2') {

            let godown_mdl = this.modalService.open(ProjectGodownModelComponent, { size: 'lg', backdrop: 'static', keyboard: true });
            godown_mdl.componentInstance.heading = "Add new Godown";
            godown_mdl.componentInstance.gdn_mdl_inst = godown_mdl;
            godown_mdl.result.then((response: any) => {
                // this.reload();
            }, () => { });

        }
    }
    editData(id) {
        this.projectEditDiv = true;
        this.className = "active";

        this.ProjectService.project_edit_data(id).pipe(takeUntil(this.destroy$)).subscribe(Response => {

            const data = Response.data[0];

            this.projectDetails.controls['startDate']
                .setValue(this.datePipe.transform(data.project_start_date, "dd/MM/yyyy"));
            this.projectDetails.controls['endDate']
                .setValue(this.datePipe.transform(data.project_end_date, "dd/MM/yyyy"));
            this.projectDetails.controls['projectName'].setValue(data.project_name);
            this.projectDetails.controls['ProjectCo_ordinator'].setValue(data.ProjectCo_ordinator);
            this.projectDetails.controls['project_type'].setValue(data.project_type);
            this.projectDetails.controls['Expected_Cost'].setValue(data.Expected_Cost);
            this.projectDetails.controls['Address'].setValue(data.Address);
            this.projectDetails.controls['project_dscription'].setValue(data.project_dscription);
            this.projectDetails.controls['Status'].setValue(data.Status);
            this.projectDetails.controls['state'].setValue(data.state);
            this.projectDetails.controls['projectId'].setValue(data.project_id);
            this.projectDetails.controls['projectmanager'].setValue(data.project_manager);
            this.projectDetails.controls['customer_name'].setValue(data.customerName);

            const godownValue = data.godownlist == 1;
            const godownCtrl = this.projectDetails.get('godownlist');
            godownCtrl?.setValue(godownValue);
            godownValue ? godownCtrl?.disable() : godownCtrl?.enable();

            /*  REQUIRED LOGIC — hide Add buttons if Status = disabled */
            if (data.Status === 'disabled') {
                $('.form-disable').hide();
            }
        });

        $('.form-control')
            .parents(".md-outline")
            .find('label')
            .addClass('active');
    }





    showGodown(e) {
        if (e.target.checked) {
            this.godownDropdown = true;
        }
        else {
            this.godownDropdown = false;
        }
        this.gdn_service.get_godown_details().pipe(takeUntil(this.destroy$)).subscribe(Response => {

            this.godown_list = Response.DATA;


        });
    }


    lookuplist() {
        let lookupEmployeeType = "Employee Type";
        let EmployeeTypedata = new FormData();
        EmployeeTypedata.append('lookupname', lookupEmployeeType);
        this.hrservice.fetch_lookupdata(EmployeeTypedata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
            this.resplookupEmployeeType = Response.data
        });
        let lookupStatus = "Status";
        let Statusdata = new FormData();
        Statusdata.append('lookupname', lookupStatus);
        this.hrservice.fetch_lookupdata(Statusdata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
            this.respStatus = Response.data
        });
        let projectTypeData = new FormData();
        projectTypeData.append('lookupname', 'Project Type');
        this.hrservice.fetch_lookupdata(projectTypeData).pipe(takeUntil(this.destroy$)).subscribe(Response => {
            this.respType = Response.data
        });

        let employee2 = new FormData();
        this.hrservice.getEmployee(employee2).pipe(takeUntil(this.destroy$)).subscribe(resp => {
            this.employee = resp.data;
        });
        let projectCoordinator = new FormData();
        projectCoordinator.append('roleName', 'Project Coordinator');
        this.hrservice.getEmployeebyRole(projectCoordinator).pipe(takeUntil(this.destroy$)).subscribe(resp => {
            this.projectCoordinatorUsers = resp.data;
        });

        let projectManager = new FormData();
        projectManager.append('roleName', 'Project Manager');
        this.hrservice.getEmployeebyRole(projectManager).pipe(takeUntil(this.destroy$)).subscribe(resp => {
            this.projectManagerUsers = resp.data;
        });
    }
    employeetypenamelis() {

        let employee = new FormData();
        employee.append('EmployeeType', 'Temporary Employees');
        this.hrservice.employeelist(employee).pipe(takeUntil(this.destroy$)).subscribe(Response => {
            this.resptempEmployeeType = Response.data;
        });
        let employee1 = new FormData();
        employee1.append('EmployeeType', 'Permanent employee');
        this.hrservice.employeelist(employee1).pipe(takeUntil(this.destroy$)).subscribe(Response => {
            this.PermanentEmployeeType = Response.data
        });

    }


    // projectName(e){
    //     this.workDetails.get("project_Name").setValue(e.target.value);
    // }

    projectSubmit() {
        this.saveProjectDetails()
            .then((projectResponse) => {
                //  First project details are saved
                //  Save the current active section's data
                // if (this.activeTab === 'WorkDetail' && this.projectEditDiv) {
                //     this.saveWorkDetailSection();
                // } else if (this.activeTab === 'MaterialsUsed') {
                //     this.saveMaterialsUsedSection();
                // }
                // ... repeat for other tabs

                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Project and section saved successfully',
                    showConfirmButton: false,
                    timer: 2000
                });
                this.router.navigate(['/project-mgmt']);
            })
            .catch((err) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: err.error || 'Something went wrong',
                    showConfirmButton: false,
                    timer: 3000
                });
            });
    }

    saveProjectDetails(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.submitted = true;
            if (this.projectDetails.valid) {

                let project = new FormData();

                let cust_name_value = this.projectDetails.get('customer_name')?.value;
                let customerName =
                    typeof cust_name_value === 'object'
                        ? cust_name_value.combinedSearch
                        : cust_name_value;

                project.append('customerName', customerName);
                project.append('projectId', this.projectDetails.get('projectId').value);
                project.append('projectName', this.projectDetails.get('projectName').value);
                project.append('ProjectCo_ordinator', this.projectDetails.get('ProjectCo_ordinator').value);
                project.append('projectmanager', this.projectDetails.get('projectmanager').value);
                project.append('project_type', this.projectDetails.get('project_type').value);
                project.append('startDate', this.projectDetails.get("startDate").value);
                project.append('endDate', this.projectDetails.get("endDate").value);
                project.append('Expected_Cost', this.projectDetails.get('Expected_Cost').value);
                project.append('Status', this.projectDetails.get('Status').value);
                project.append('state', this.projectDetails.get('state').value);
                project.append('Address', this.projectDetails.get('Address').value);

                const godownChecked = this.projectDetails.get('godownlist').value ? '1' : '0';
                project.append('godownlist', godownChecked);
                project.append('project_dscription', this.projectDetails.get('project_dscription').value);

                this.ProjectService.addProject(project).pipe(takeUntil(this.destroy$)).subscribe(
                    (Response) => {
                        if (Response.code == 200) {
                            this.projectDetails.get('projectId').setValue(Response.prijectId);
                            resolve(Response);
                        } else if (Response.code == 409) {
                            reject({ error: 'Project name Already Exists in Warehouse', response: Response });
                        }
                    },
                    (error) => reject(error)
                );
            } else {
                reject({ error: 'Required fields empty' });
            }
        });
    }

    Newworkadd() {
        this.workDetails.reset();
        this.workDetails.get('project_Name').setValue(this.projectDetails.get('projectName').value)
        this.workModalHadding = 'Add New Work Details'
        this.workModalButton.nativeElement.click();
    }

    rerender(): void {
        this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
            dtInstance.destroy();
            this.dtTrigger.next();
        });
    }
    reload(tableType?: string) {
        if (tableType === 'work_details') {
            //Reload only state table
            this.dtElement.toArray()[0].dtInstance.then((dtInstance: DataTables.Api) => {
                dtInstance.destroy();
                this.dtTrigger.next(null);
            });
        } else if (tableType === 'machine_reading') {
            this.dtElement.toArray()[1].dtInstance.then((dtInstance: DataTables.Api) => {
                dtInstance.destroy();
                this.dtTrigger1.next(null);
            });
        } else if (tableType === 'material_details') {
            this.dtElement.toArray()[2].dtInstance.then((dtInstance: DataTables.Api) => {
                dtInstance.destroy();
                this.dtTrigger2.next(null);
            });
        } else if (tableType == 'material_consumed') {
            this.dtElement.toArray()[3].dtInstance.then((dtInstance: DataTables.Api) => {
                dtInstance.destroy();
                this.dtTrigger3.next(null);
            });
        } else if (tableType === 'stocks') {
            this.dtElement.toArray()[4].dtInstance.then(dt => {
                dt.destroy()
                this.dtTrigger4.next(null)
            })
        }
        else {
            // Reload all tables 
            this.dtElement.forEach((dtElement: DataTableDirective) => {
                dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
                    dtInstance.destroy();
                });
            });
            // Trigger all tables
            this.dtTrigger.next(null);
        }
    }
    ngAfterViewInit(): void {
        this.dtTrigger.next();
        this.dtTrigger1.next();
        this.dtTrigger2.next();
        this.dtTrigger3.next();
        this.dtTrigger4.next();
    }

    ngOnDestroy(): void {
        this.dtTrigger.unsubscribe();
        this.dtTrigger1.unsubscribe();
        this.dtTrigger2.unsubscribe();
        this.dtTrigger3.unsubscribe();
        this.dtTrigger4.unsubscribe();

        this.destroy$.next();
        this.destroy$.complete();

        if (this.dtElement && this.dtElement.dtInstance) {
            this.dtElement.dtInstance.then(dt => dt.destroy());
        }
    }

    contractorlist() {
        let projectlist = new FormData();
        this.hrservice.contractorList(projectlist).pipe(takeUntil(this.destroy$)).subscribe(Response => {
            this.respcontractor = Response.data
        });
    }

    deleteDiary(e, recordType) {

    }

    // start icm -> customer - > select customer
    onCustomerSearch(e) {
        if (e.length >= 0) {
            this.customerlistData(e);
        } else {
            this.customerdataList = [];
        }
    }

    customerlistData(e) {
        let customerlist = new FormData();
        customerlist.append('value', e);

        this.crmservice.getRegisteredCustomerLists(customerlist).pipe(takeUntil(this.destroy$)).subscribe((resp) => {
            this.customerSuggestion = resp.data;
            this.customerData = this.customerSuggestion.map(item => ({
                persons_id: item.persons_id,
                cust_name: item.cust_name,
                ProductCode: item.ProductCode,

                combinedSearch: `${item.cust_name}${item.ProductCode ? ', ' + item.ProductCode : ''}`
            }));
            this.customerdataList = this.customerData;
        });
    }
    // end icm -> customer - > select customer    

    setActiveTab(tabName: string) {
        this.activeTab = tabName;

        if (tabName === 'WorkDetail') {
            this.activeTab = 'work';
            if (!this.dtOptions) this.workDetailsEntryDatatablecode();
            else this.reload('work_details');
        }

        if (tabName === 'MaterialsUsed') {
            if (!this.dtOptions2) this.materialUsedDatatablecode();
            else this.reload('material_details');
        }

        if (tabName === 'materialConsumed') {
            if (!this.dtOptions3) this.materialConsumptionDatatablecode();
            else this.reload('material_consumed');
        }

        if (tabName === 'Stocks') {
            if (!this.dtOptions4) this.stocksDatatablecode();
            else this.reload('stocks');
        }
    }

    // Optional: Method to check if a tab is active (useful for additional logic)
    isTabActive(tabName: string): boolean {
        return this.activeTab === tabName;
    }

    openWorkDetailModal() {
        this.workDetails.enable();
        this.isHideWorkSave = true;

        this.workDetails.patchValue({
            projectName: this.projectDetails.get('projectName')?.value
        });

        this.workDetails.get('projectName')?.disable();
    }

    private formatToISODate(dateValue: any): string {

        if (!dateValue) return '';

        if (typeof dateValue === 'string') {

            // If already in yyyy-MM-dd format
            if (dateValue.includes('-') && dateValue.length === 10) {
                return dateValue;
            }

            // If in dd/MM/yyyy format
            if (dateValue.includes('/')) {
                const parts = dateValue.split('/');

                if (parts.length === 3) {
                    const day = parts[0].padStart(2, '0');
                    const month = parts[1].padStart(2, '0');
                    const year = parts[2];

                    return `${year}-${month}-${day}`;
                }
            }
        }

        return '';
    }

    saveWorkDetail() {
        this.submitted = true;
        const project_id = this.activatedRoute.snapshot.paramMap.get('id');
        if (this.workDetails.valid) {
            let formData = new FormData();
            const work_detail_id = this.workDetails.get('work_detail_id').value;
            if (work_detail_id) {
                formData.append('work_detail_id', work_detail_id);
            }
            formData.append('project_id', project_id);

            const rawDate = this.workDetails.get('entryDate')?.value;
            const formattedDate = this.formatToISODate(rawDate);

            formData.append('entryDate', formattedDate);
            formData.append('projectName', this.workDetails.get('projectName').value);
            formData.append('EmployeeType', this.workDetails.get('EmployeeType').value);
            formData.append('EmployeeName', this.workDetails.get('EmployeeName').value);
            formData.append('working_notes', this.workDetails.get('working_notes').value);

            this.ProjectService.saveWorkDetails(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {

                if (resp.data == true) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: 'Work Details saved successfully!',
                        timer: 2000,
                        showConfirmButton: false
                    });
                    this.closeWorkModal.nativeElement.click();
                    this.workDetails.reset();
                    this.reload('work_details');
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: 'Error While Saving the Data.',
                        confirmButtonText: 'OK'
                    });
                }
            });
        } else {
            Swal.fire('Alert', 'Some Fields are Missing', 'info');
        }

    }

    resetWorkDetail() {
        this.workDetails.reset();
    }

    viewWorkDetail(type, work_detail_id) {

        if (type == 'view_work') {
            this.workDetails.disable();
            this.isHideWorkSave = false;
        } else {
            this.workDetails.enable();
            this.isHideWorkSave = true;
        }
        let formData = new FormData();
        formData.append('work_detail_id', work_detail_id);
        this.ProjectService.fetchWorkDetails(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
            this.workDetails.patchValue({
                work_detail_id: resp.data[0].work_detail_id,
                entryDate: this.datePipe.transform(resp.data[0].entryDate, 'dd/MM/yyyy'),
                projectName: resp.data[0].projectName,
                EmployeeType: resp.data[0].employeetype,
                EmployeeName: resp.data[0].employeename,
                working_notes: resp.data[0].notes
            });
        }
        );

    }

    deleteWorkDetail(work_detail_id) {
        Swal.fire({
            title: 'Are you sure?',
            text: 'You want to delete this.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.value) {
                let formData = new FormData();
                formData.append('work_detail_id', work_detail_id);
                this.ProjectService.deleteWorkDetail(formData).pipe(takeUntil(this.destroy$)).subscribe(Response => {
                    if (Response.data == true) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Success!',
                            text: 'Work Deleted Successfully',
                            showConfirmButton: false,
                            timer: 2000
                        });
                        this.reload('work_details');
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error!',
                            text: 'Work Data Deletion Failed',
                            showConfirmButton: false,
                            timer: 3000
                        });
                    }
                });
            }
        });
    }

    viewMachine(type, readingid) {
        this.submitted = false;

        if (type === 'view_machine') {
            this.fieldStatus = true;
            this.machineTitle = 'View Entry';
        } else {
            this.fieldStatus = false;
            this.machineTitle = 'Add new Entry';
        }

        let formData = new FormData();
        formData.append('readingid', readingid);
        this.hrservice.fetchMachineDataById(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {

            const machineData = resp.data[0];
            const modalRef = this.modalService.open(MachineReadingPopupComponent, { size: 'lg', backdrop: 'static', keyboard: true });
            modalRef.componentInstance.fieldStatus = this.fieldStatus;
            modalRef.componentInstance.machineTitle = this.machineTitle;
            modalRef.componentInstance.machineData = machineData;

            modalRef.result.then((result) => {
                if (result?.success) {
                    this.reload('machine_reading');
                }
            }).catch(() => { });
        });

        // this.openMachineReadingModel();
    }

    deleteMachine(readingid: string) {
        Swal.fire({
            title: 'Are you sure?',
            text: 'This action cannot be undone!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes !',
            cancelButtonText: 'No',
        }).then((result) => {
            if (result.isConfirmed) {
                let formData = new FormData();
                formData.append('readingid', readingid);

                this.hrservice.DeletemachineByid(formData).pipe(takeUntil(this.destroy$)).subscribe(
                    (resp) => {
                        if (resp.data === true) {   //  Only show success if deletion was successful
                            Swal.fire('Deleted!', 'The material entry has been deleted.', 'success');
                            this.reload('machine_reading');
                        } else {
                            Swal.fire('Error!', 'Failed to delete the entry.', 'error');
                        }
                    },
                    (error) => {
                        Swal.fire('Error!', 'Something went wrong while deleting.', 'error');
                    }
                );
            } else {
                Swal.fire('Cancelled', 'The material entry is safe.', 'error');
            }
        });
    }



    // Get materials form array
    get materials(): FormArray {
        return this.materialForm.get('materials') as FormArray;
    }

    // Create a new material form group
    createMaterial(): FormGroup {
        return this.fb.group({
            materialUsed: ['', Validators.required],
            quantity: ['', [Validators.required, Validators.min(1)]],
            out_time: [''],
            unit: [''],
            showExtraFields: [false],
            used_quantity: [''],
            scrap: [''],
            rate: [''],
            amount: [{ value: '', disabled: true }],
            balance: ['']
        });
    }

    // Add material to array
    addMaterial() {
        this.materials.push(this.createMaterial());

    }

    // Remove material from array
    removeMaterial(index: number) {
        this.materials.removeAt(index);
    }


    openMaterialModal() {
        this.isHideWorkSave = true;
        const projectName = this.projectDetails.get('projectName').value;
        const projectNameControl = this.materialForm.get('projectName');

        if (!projectNameControl.value || projectNameControl.value.trim() === '') {
            projectNameControl.setValue(projectName);
        }
        projectNameControl.disable();

        this.getAllUnitsLists();
        // this.getVehicleslists();
    }

    openMaterialConsumptionModal() {
        //    this.getMaterialsUsedLists();
        this.materialConsumedForm.enable();
        this.getMaterialUsedData = [];
    }




    onMaterialUsedChange(event: any, index: number) {

        const selectedId = event.target.value;
        const selectedMaterial = this.getMaterialUsedData.find(
            (m: any) => m.material_id === selectedId
        );
        if (selectedMaterial) {
            const selectedGroup = this.consumedMaterials.at(index) as FormGroup;

            const rowBalance = Number(selectedMaterial.balance) || 0;
            selectedGroup.patchValue(
                {
                    balanceQuantity: rowBalance,
                    originalBalance: rowBalance,
                    consumedUnit: selectedMaterial.unit || '',
                    consumedWarehouse: selectedMaterial.warehouse_id || '',
                    usedQuantity: 0,
                    consumedScrap: 0,
                    category: selectedMaterial.groupname || '',
                    subCategory: selectedMaterial.subgroupname || ''
                },
                { emitEvent: false }
            );
            selectedGroup.get('balanceQuantity')?.disable();
            selectedGroup.get('consumedUnit')?.disable();

            this.isQuantityValid = true;
        }
    }




    onRateChange(index: number): void {
        const selectedGroup = this.consumedMaterials.at(index) as FormGroup;

        const usedQty = Number(selectedGroup.get('usedQuantity')?.value) || 0;
        const scrapQty = Number(selectedGroup.get('consumedScrap')?.value) || 0;
        const rate = Number(selectedGroup.get('consumedRate')?.value) || 0;

        const totalAmount = (usedQty + scrapQty) * rate;

        selectedGroup.patchValue(
            { consumedAmount: totalAmount },
            { emitEvent: false }
        );
    }


    saveMaterialForm() {
        this.submitted = true;
        const project_id = this.activatedRoute.snapshot.paramMap.get('id');
        const { material_id } = this.materialForm.value;

        if (this.materialForm.valid) {

            this.isSaveDisabled = true;

            const materialsArray = this.materialForm.getRawValue().materials;

            // Create a request for each material
            const saveRequests = materialsArray.map(m => {
                let formData = new FormData();

                formData.append('project_id', project_id);
                material_id && formData.append('material_id', material_id);
                formData.append('projectName', this.materialForm.get('projectName').value);
                formData.append('date', this.materialForm.get('date').value);
                formData.append('warehouse_id', this.materialForm.get('warehouse').value);
                formData.append('vehicle_id', this.materialForm.get('vehicleNameNo').value);
                formData.append('issued_to_id', this.materialForm.get('issuedTo').value);
                formData.append('issued_by_id', this.materialForm.get('issuedBy').value);
                formData.append('description', this.materialForm.get('description').value);
                formData.append('gatePass', this.materialForm.get('gatePass').value);

                const materialObj = this.materialsList.find(
                    mat => mat.master_item_id == m.materialUsed
                );

                // Material-specific fields
                formData.append('material_used_id', m.materialUsed);
                formData.append('material_used', materialObj?.itemname || '');
                formData.append('quantity', m.quantity);
                formData.append('unit', m.unit);
                formData.append('out_time', m.out_time);

                if (m.showExtraFields) {
                    formData.append('flag', '1');
                    formData.append('used_quantity', m.used_quantity);
                    formData.append('scrap', m.scrap);
                    formData.append('rate', m.rate);
                    formData.append('amount', m.amount);
                    if (m.used_quantity != null && m.scrap != null) {
                        const balance = Number(m.quantity || 0) - (Number(m.used_quantity || 0) + Number(m.scrap || 0));
                        formData.append('balance', balance.toString());
                    }
                }

                // Never let an individual request error out of the forkJoin - that would
                // hide which rows actually succeeded and block rollback of those rows.
                return this.ProjectService.saveMaterialDetails(formData).pipe(
                    catchError(() => of({ data: false, material_id: null }))
                );
            });

            // Run all save requests in parallel
            forkJoin(saveRequests)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (responses: any[]) => {
                        const allSucceeded = responses.every(resp => resp?.data === true);

                        if (allSucceeded) {
                            Swal.fire({
                                icon: 'success',
                                title: 'Success!',
                                text: 'Material details saved successfully!',
                                timer: 3000,
                                showConfirmButton: false
                            });

                            // Reset form
                            this.closeMaterialModal.nativeElement.click();
                            this.materialForm.reset();
                            this.materials.clear();
                            this.reload('material_details');
                        } else {
                            this.isSaveDisabled = false;

                            // Roll back rows that DID succeed so a partial failure never
                            // leaves orphaned project_material_used rows behind. Only
                            // applies to brand-new rows (create path returns material_id);
                            // an edit (material_id already known) has nothing to roll back.
                            const succeededIds = !material_id
                                ? responses.filter(resp => resp?.data === true && resp?.material_id).map(resp => resp.material_id)
                                : [];

                            const rollback$ = succeededIds.length
                                ? forkJoin(succeededIds.map(id => {
                                    const rollbackData = new FormData();
                                    rollbackData.append('material_id', id);
                                    rollbackData.append('project_id', project_id);
                                    rollbackData.append('materialUsed', '');
                                    rollbackData.append('quantity', '');
                                    return this.ProjectService.DeleteMaterialByid(rollbackData).pipe(
                                        catchError(() => of(null))
                                    );
                                }))
                                : of(null);

                            rollback$.pipe(takeUntil(this.destroy$)).subscribe(() => {
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Error!',
                                    text: 'Some materials could not be saved. Any rows that did save have been rolled back.',
                                    confirmButtonText: 'OK'
                                });
                                if (succeededIds.length) {
                                    this.reload('material_details');
                                }
                            });
                        }
                    },
                    error: () => {
                        this.isSaveDisabled = false;
                        Swal.fire({
                            icon: 'error',
                            title: 'Error!',
                            text: 'Error while saving the data.',
                            confirmButtonText: 'OK'
                        });
                    }
                });
        } else {
            Swal.fire('Alert', 'Some fields are missing', 'info');
        }
    }

    // viewMaterial(type,material_id){
    //     if(type == 'view_machine'){
    //         this.materialForm.disable();
    //         this.isHideWorkSave = false;
    //     } else {
    //         this.materialForm.enable();
    //         this.isHideWorkSave = true;
    //     }
    //     let formData = new FormData();
    //     formData.append('material_id', material_id);
    //     this.ProjectService.getMaterialById(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
    //     });
    // }



    viewMaterial(type: string, material_id: string) {

        if (type === 'view_material') {
            this.materialForm.disable();
            this.isHideWorkSave = false;
        } else {
            this.materialForm.enable();
            this.isHideWorkSave = true;
            this.materialForm.get('projectName')?.disable();
        }

        const formData = new FormData();
        formData.append('material_id', material_id);

        forkJoin({
            units: this.ProjectService.getAllUnitsLists(new FormData()),
            materials: this.ProjectService.getAllMaterialsLists(new FormData()),
            materialById: this.ProjectService.getMaterialById(formData),
            warehouses: this.ProjectService.getWarehouselists(new FormData()),
            vehicles: this.ProjectService.getVehicleslists(new FormData()),
        })
            .pipe(takeUntil(this.destroy$))
            .subscribe(result => {

                this.unitsList = result.units.data || [];
                this.materialsList = result.materials.data || [];
                this.warehouseList = result.warehouses.data || [];
                this.vehicleList = result.vehicles.data || [];

                if (!result.materialById?.data?.length) return;

                const materialData = result.materialById.data[0];

                this.materialForm.reset();
                this.materials.clear();

                this.materialForm.patchValue({
                    material_id: materialData.material_id || '',
                    projectName: materialData.project_name || '',
                    date: materialData.date
                        ? this.datePipe.transform(materialData.date, "yyyy-MM-dd'T'HH:mm")
                        : '',
                    warehouse: materialData.warehouse_id ? String(materialData.warehouse_id) : '',
                    vehicleNameNo: materialData.vehicle_id ? String(materialData.vehicle_id) : '',
                    issuedTo: materialData.issued_to_id || '',
                    issuedBy: materialData.issued_by_id || '',
                    description: materialData.description || '',
                    gatePass: materialData.gatePass || '',
                });

                // 🔴 CHANGED: now reading ID + NAME separately
                const idArr = materialData.material_used_id
                    ? materialData.material_used_id.split(',')
                    : [];

                const nameArr = materialData.material_used_name
                    ? materialData.material_used_name.split(',')
                    : [];

                const qtyArr = materialData.quantity ? materialData.quantity.split(',') : [];
                const unitArr = materialData.unit ? materialData.unit.split(',') : [];
                const outTimeArr = materialData.out_time ? materialData.out_time.split(',') : [];
                const usedQtyArr = materialData.used_quantity ? materialData.used_quantity.split(',') : [];
                const scrapArr = materialData.scrap ? materialData.scrap.split(',') : [];
                const rateArr = materialData.rate ? materialData.rate.split(',') : [];
                const amountArr = materialData.total_amount ? materialData.total_amount.split(',') : [];

                for (let i = 0; i < (idArr.length || nameArr.length); i++) {

                    let materialId = idArr[i]?.trim() || '';
                    const materialName = nameArr[i]?.trim() || '';

                    // 🔴 CHANGED: fallback resolve ID using name (legacy safety)
                    if (!materialId && materialName) {
                        const found = this.materialsList.find(
                            m => m.itemname.toLowerCase() === materialName.toLowerCase()
                        );
                        materialId = found?.master_item_id || '';
                    }

                    const materialGroup = this.createMaterial();

                    materialGroup.patchValue({
                        materialUsed: materialId, // 🔴 CHANGED: always patch ID (not name)
                        quantity: qtyArr[i] || '',
                        unit: unitArr[i] || '',
                        out_time: outTimeArr[i] || '',
                        used_quantity: usedQtyArr[i] || '',
                        scrap: scrapArr[i] || '',
                        rate: rateArr[i] || '',
                        amount: amountArr[i] || '',
                        showExtraFields: !!usedQtyArr[i]
                    });

                    this.materials.push(materialGroup);
                }

                // 🔴 CHANGED: fetch units using material ID → name lookup
                const unitRequests = this.materials.controls.map(ctrl => {
                    const matId = ctrl.get('materialUsed')?.value;
                    // const matObj = this.materialsList.find(m => m.master_item_id == matId);

                    const fd = new FormData();
                    fd.append('itemName', matId || '');
                    return this.ProjectService.getUnitsByMaterial(fd);
                });

                forkJoin(unitRequests).pipe(takeUntil(this.destroy$)).subscribe((unitResponses: any[]) => {
                    unitResponses.forEach((resp, i) => {
                        this.rowUnitsList[i] = resp?.data || [];
                    });
                });
            });
    }



    deleteMaterial(material_ids: string, project_id: string, materialUsed: string, quantity: string) {
        Swal.fire({
            title: 'Are you sure?',
            text: 'This action cannot be undone!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes!',
            cancelButtonText: 'No',
        }).then((result) => {
            if (result.isConfirmed) {
                let formData = new FormData();
                formData.append('material_id', material_ids);
                formData.append('project_id', project_id);
                formData.append('materialUsed', materialUsed);
                formData.append('quantity', quantity);

                this.ProjectService.DeleteMaterialByid(formData).pipe(takeUntil(this.destroy$)).subscribe(
                    (resp: any) => {
                        if (resp?.data === true) {
                            Swal.fire('Deleted!', 'The material(s) have been deleted.', 'success');
                            this.reload('material_details');
                        } else {
                            Swal.fire('Cannot Delete', resp?.message || 'Something went wrong while deleting.', 'error');
                        }
                    },
                    (error) => {
                        Swal.fire('Error!', 'Something went wrong while deleting.', 'error');
                    }
                );
            } else {
                Swal.fire('Cancelled', 'The material(s) are safe.', 'error');
            }
        });
    }




    clearMaterials() {
        this.materialForm.reset();
        this.materialForm.enable();

        this.materials.clear();
        this.isHideWorkSave = true;
        this.submit_btn = false;
        this.submitted = false;
        this.rowUnitsList = [];
        this.isSaveDisabled = false;

        this.materials.push(
            this.fb.group({
                materialUsed: ['', Validators.required],
                quantity: [''],
                out_time: [''],
                unit: [''],
                altUnit: [''],
                showExtraFields: [false],
                used_quantity: [''],
                scrap: [''],
                rate: [''],
                amount: [''],
            })
        );
        this.rowUnitsList.push([]);
    }

    getStatesLists() {
        let formData = new FormData();
        this.adminservice.getAllStates(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
            this.showAllStates = resp.data;
        });
    }



    getAllMaterialLists() {
        let formData = new FormData();
        this.ProjectService.getAllMaterialsLists(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
            this.materialsList = resp.data;
        });
    }

    getAllUnitsLists() {
        let formData = new FormData();
        this.ProjectService.getAllUnitsLists(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
            this.unitsList = resp.data;
        });
    }

    onMaterialChange(event: any, index: number) {
        const selectedMaterial = event.target.value;

        if (selectedMaterial) {
            let formData = new FormData();
            formData.append('itemName', selectedMaterial);

            this.ProjectService.getUnitsByMaterial(formData).pipe(takeUntil(this.destroy$)).subscribe((resp) => {
                const unitData = resp.data;

                if (unitData && unitData.length > 0) {
                    // Replace the row-specific unit list
                    this.rowUnitsList[index] = unitData;

                    // Default to first returned unit
                    (this.materials.at(index) as FormGroup).patchValue({
                        unit: unitData[0].unit_name
                    });
                }
            });
        }
    }

    clearMaterialsConsumed() {
        const formArray = this.materialConsumedForm.get('consumedMaterials') as FormArray;

        formArray.clear();
        this.addConsumedMaterial();
        this.materialConsumedForm.reset();
        this.isConSaveDisabled = false;
        // Explicitly reset dropdowns for safety
        setTimeout(() => {
            formArray.controls.forEach(ctrl => {
                ctrl.get('consumedMaterial')?.setValue('');
            });
        });
    }

    saveMaterialConsumption() {
        this.submitted = true;

        if (this.materialConsumedForm.valid) {
            this.isConSaveDisabled = true;
            const project_id = this.activatedRoute.snapshot.paramMap.get('id');
            const consumption_id = this.materialConsumedForm.get('consumption_id')?.value;
            const consumedDate = this.materialConsumedForm.get('consumedDate')?.value;
            const gatePass = this.materialConsumedForm.get('gatePass')?.value;

            const consumedMaterialsArray = this.consumedMaterials.controls;

            consumedMaterialsArray.forEach((group: FormGroup) => {
                let formData = new FormData();

                formData.append('project_id', project_id);
                // if (consumption_id) {
                //     formData.append('consumption_id', consumption_id);
                // }
                formData.append('date', consumedDate);
                formData.append('gatePass', gatePass);

                const materialId = group.get('consumedMaterial')?.value;
                formData.append('consumedMaterial', materialId);


                const selectedMaterial = this.getMaterialUsedData.find(
                    (m: any) => m.material_id == materialId
                );
                if (selectedMaterial) {
                    formData.append('item', selectedMaterial.material_used);
                }

                if (group.get('consumption_id')?.value) {
                    formData.append('consumption_id', group.get('consumption_id')?.value);
                }
                formData.append('balanceQuantity', group.get('balanceQuantity')?.value);
                formData.append('consumedUnit', group.get('consumedUnit')?.value);
                formData.append('usedQuantity', group.get('usedQuantity')?.value);
                formData.append('consumedScrap', group.get('consumedScrap')?.value);
                formData.append('consumedRate', group.get('consumedRate')?.value);
                formData.append('consumedAmount', group.get('consumedAmount')?.value);

                formData.append('consumedWarehouse', group.get('consumedWarehouse')?.value ?? '');


                this.ProjectService.saveMaterialConsumption(formData)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                        next: (resp: any) => {
                            if (resp.data == true) {
                                Swal.fire({
                                    icon: 'success',
                                    title: 'Saved Successfully',
                                    text: 'Material consumption data has been saved.',
                                    timer: 2000,
                                    showConfirmButton: false,
                                });

                                // Close modal & reload only after last iteration
                                if (group === consumedMaterialsArray[consumedMaterialsArray.length - 1]) {
                                    this.reload('material_consumed');
                                    this.closeMaterialConModal.nativeElement.click();
                                }
                            } else {
                                this.isConSaveDisabled = false;
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Save Failed',
                                    text: resp?.message || 'Something went wrong while saving.',
                                });
                            }
                        },
                        error: (err) => {
                            this.isConSaveDisabled = false;
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: 'Server error occurred. Please try again later.',
                            });
                        },
                    });
            });
        } else {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Form',
                text: 'Please fill all required fields before saving.',
            });
        }
    }

    editMaterialConsumed(type: 'view_consumed' | 'edit_consumed', consumption_id: any, index: number) {
        // Enable or disable the form based on mode
        if (type === 'view_consumed') {
            this.materialConsumedForm.disable();
            this.isQuantityValid = false;
        } else {
            this.materialConsumedForm.enable();
            this.isQuantityValid = true;
        }

        const formData = new FormData();
        formData.append('consumption_id', consumption_id);

        this.ProjectService.getConsumedMaterials(formData)
            .pipe(takeUntil(this.destroy$))
            .subscribe(resp => {
                const row = resp?.data?.[0];
                if (!row) return;

                const parsedDate = new Date(row.date);
                const formattedDate = parsedDate.toISOString().slice(0, 16);

                // Patch global form values
                this.materialConsumedForm.patchValue(
                    {
                        // consumption_id: row.consumption_id,
                        consumedDate: formattedDate,
                        gatePass: row.gatePass
                    },
                    { emitEvent: false }
                );


                this.consumedMaterials.clear();

                // Add a single FormGroup
                const materialGroup = this.createConsumedMaterial();
                this.consumedMaterials.push(materialGroup);

                const usedQty = Number(row.used_qauntity) || 0;
                const scrapQty = Number(row.scrap) || 0;
                const currBal = Number(row.balance_quantity) || 0;

                // Track this row's own original balance baseline
                const originalBalance = currBal + usedQty + scrapQty;

                // Patch data into this one group
                materialGroup.patchValue(
                    {
                        consumption_id: row.consumption_id,
                        consumedMaterial: row.material_id,
                        balanceQuantity: currBal,
                        originalBalance: originalBalance,
                        usedQuantity: usedQty,
                        consumedScrap: scrapQty,
                        consumedUnit: row.unit,
                        consumedRate: row.rate,
                        consumedAmount: row.total_amount
                    },
                    { emitEvent: false }
                );

                // Handle field disable logic
                if (type === 'view_consumed') {
                    materialGroup.disable();
                } else {
                    materialGroup.get('balanceQuantity')?.disable();
                    materialGroup.get('consumedUnit')?.disable();
                    materialGroup.get('consumedMaterial')?.disable();

                    if (row.updated_by && row.updated_dt) {
                        materialGroup.get('consumedMaterial')?.disable();
                        materialGroup.get('usedQuantity')?.disable();
                        materialGroup.get('consumedScrap')?.disable();
                    }
                }
            });
    }



    getMaterialsUsedLists() {
        let formData = new FormData();
        const project_id = this.activatedRoute.snapshot.paramMap.get('id')
        formData.append('project_id', project_id);
        formData.append('consumedDate', this.materialConsumedForm.get('consumedDate')?.value);
        this.ProjectService.getMaterialsUsedLists(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
            console.log(resp);
            this.getMaterialUsedData = resp.data;
        });
    }

    onQuantityChange(changedField: 'usedQuantity' | 'consumedScrap', index: number): void {
        const selectedGroup = this.consumedMaterials.at(index) as FormGroup;

        const usedQty = Number(selectedGroup.get('usedQuantity')?.value) || 0;
        const scrapQty = Number(selectedGroup.get('consumedScrap')?.value) || 0;
        const totalUsed = usedQty + scrapQty;

        // always compute from this row's own baseline, set on material select / edit load -
        // not a shared component field, so multiple rows don't clobber each other's baseline
        const materialBalance = Number(selectedGroup.get('originalBalance')?.value) || 0;

        if (totalUsed > materialBalance) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Quantity',
                text: 'Used Quantity + Scrap cannot be greater than Balance Quantity'
            });

            selectedGroup.patchValue(
                { balanceQuantity: materialBalance },
                { emitEvent: false }
            );
            this.isQuantityValid = false;
            return;
        } else {

            const updatedBalance = materialBalance - totalUsed;
            selectedGroup.patchValue(
                { balanceQuantity: updatedBalance },
                { emitEvent: false }
            );

            this.isQuantityValid = true;
        }
    }


    validateMaterialsArray(control: AbstractControl): { [key: string]: any } | null {
        const formArray = control as FormArray;

        if (!formArray || formArray.length === 0) {
            return { noMaterials: true };
        }

        const hasMaterialUsed = formArray.controls.some(
            group => group.get('materialUsed')?.value && group.get('materialUsed')?.value !== ''
        );

        if (!hasMaterialUsed) {
            return { noMaterialUsed: true };
        }

        return null;
    }

    onDateSelected(event: any) {
        event.target.blur(); // closes the picker once value is chosen
        this.getMaterialsUsedLists();
    }

    get consumedMaterials(): FormArray {
        return this.materialConsumedForm.get('consumedMaterials') as FormArray;
    }

    createConsumedMaterial(): FormGroup {
        return this.fb.group({
            consumedMaterial: ['', Validators.required],
            consumption_id: [''],
            balanceQuantity: [''],
            originalBalance: [''],
            usedQuantity: [''],
            consumedScrap: [''],
            consumedUnit: [''],
            consumedRate: [''],
            consumedAmount: [''],
            consumedWarehouse: [''],
            category: [''],
            subCategory: ['']
        });
    }

    addConsumedMaterial() {
        this.consumedMaterials.push(this.createConsumedMaterial());
    }

    removeConsumedMaterial(index: number) {
        this.consumedMaterials.removeAt(index);
    }

    getAvailableMaterials(index: number) {
        const selectedMaterials = this.consumedMaterials.controls
            .map((control, i) => i !== index ? control.get('consumedMaterial')?.value : null)
            .filter(val => val); // remove empty/null

        return this.getMaterialUsedData.filter(m =>
            !selectedMaterials.includes(m.material_id)
        );
    }

    deleteMaterialConsumed(consumption_id:any, project_id:any, item:any, used_quantity:any,scrap:any) {
        Swal.fire({
            title: 'Are you sure?',
            text: 'You want to delete this.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.value) {
                let formData = new FormData();
                formData.append('consumption_id', consumption_id);
                formData.append('project_id', project_id);
                formData.append('item', item);
                formData.append('used_quantity', Number(used_quantity).toString());
                formData.append('scrap',Number(scrap).toString());
                this.ProjectService.deleteMaterialConsume(formData).pipe(takeUntil(this.destroy$)).subscribe(Response => {
                    if (Response.data == true) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Balance Restored!',
                            text: 'Material Consumption Entry Deleted',
                            showConfirmButton: false,
                            timer: 2000
                        });
                        this.reload('material_consumed');
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error!',
                            text: 'Material Consumption Deletion Failed',
                            showConfirmButton: false,
                            timer: 3000
                        });
                    }
                });
            }
        });
    }




    updateQuantity(index: number) {
        const materialGroup = this.materials.at(index) as FormGroup;

        let quantity = Number(materialGroup.get('quantity')?.value) || 0;
        let used_quantity = Number(materialGroup.get('used_quantity')?.value) || 0;
        let scrap = Number(materialGroup.get('scrap')?.value) || 0;

        const totalUsed = used_quantity + scrap;

        // Case 1: User is typing quantity
        if (quantity > totalUsed) {
            // Quantity is greater than total used -> simply update the difference
            // Remaining balance will be quantity - totalUsed
            // No action needed for used_quantity/scrap here
        } else if (quantity < totalUsed) {
            //  Case 2: Quantity decreased -> adjust scrap first, then used_quantity
            let diff = totalUsed - quantity;

            if (scrap >= diff) {
                scrap -= diff;  // reduce scrap first
            } else {
                diff -= scrap;
                scrap = 0;
                used_quantity = Math.max(0, used_quantity - diff); // then reduce used_quantity
            }
        }

        //  Update values back to the form
        materialGroup.patchValue(
            {
                used_quantity: used_quantity,
                scrap: scrap
            },
            { emitEvent: false }
        );
    }

    updateAmount(index: number) {
        const group = this.materials.at(index) as FormGroup;
        const usedQty = group.get('used_quantity')?.value || 0;
        const rate = group.get('rate')?.value || 0;
        const amount = usedQty * rate;

        const formattedAmount = Number.isInteger(amount) ? amount : amount.toFixed(2);
        group.get('amount')?.setValue(formattedAmount, { emitEvent: false });
    }

    goToProjects(): void {

        if (this.dtElement && this.dtElement.length) {
            this.dtElement.forEach((dt: DataTableDirective) => {
                if (dt?.dtInstance) {
                    dt.dtInstance.then((instance: DataTables.Api) => {
                        instance.destroy(true);
                    }).catch(() => { });
                }
            });
        }

        [this.dtTrigger, this.dtTrigger1, this.dtTrigger2, this.dtTrigger3, this.dtTrigger4]
            .forEach(trigger => {
                if (trigger && !trigger.closed) {
                    trigger.unsubscribe();
                }
            });

        if (this.destroy$ && !this.destroy$.closed) {
            this.destroy$.next();
            this.destroy$.complete();
        }

        try {
            this.modalService.dismissAll();
        } catch { }

        this.projectDetails?.reset();
        this.workDetails?.reset();
        this.materialForm?.reset();
        this.materialConsumedForm?.reset();
        this.addMachineReading?.reset();

        (this.materialForm?.get('materials') as FormArray)?.clear();
        (this.materialConsumedForm?.get('consumedMaterials') as FormArray)?.clear();

        this.materialsList = [];
        this.unitsList = [];
        this.rowUnitsList = [];
        this.materialUsedData = [];
        this.materialConsumptionData = [];
        this.stocksData = [];
        this.machineData = [];
        this.workDetailsData = [];
        this.vehicleList = [];
        this.warehouseList = [];
        this.respProject = [];
        this.respcontractor = [];
        this.customerdataList = [];
        this.customerSuggestion = [];

        this.activeTab = '';
        this.projectId = null;
        this.isSaveDisabled = false;
        this.isConSaveDisabled = false;
        this.submitted = false;

        this.router.navigate(['/project-mgmt']);
    }


    onEmployeeTypeChange() {

        const type = this.workFilterForm.get('employeeType')?.value;

        if (type === '24D522FA-0426-4F82-96FBE33CF6B968E6') {
            this.workFilterForm.patchValue({ employeeId: '' });
        }

        if (type === '64294693-84BC-48D0-B0AD67468A685848') {
            this.workFilterForm.patchValue({ contractorName: '' });
        }

    }

    searchWorkDetails() {
        this.workDetailsEntryDatatablecode();
        this.reload('work_details');
    }


    resetWorkFilters() {
        this.workFilterForm.reset();

        this.workDetailsEntryDatatablecode();
        this.reload('work_details');
    }

    searchMachineData() {
        this.machineDatatableCode();
        this.reload('machine_reading');
    }

    resetMachineFilters() {
        this.machineFilterForm.reset();

        this.machineDatatableCode();
        this.reload('machine_reading');
    }



    onCategoryChangeMaterialUsed(event: any) {

        const selectedCategoryId = event.target.value;

        this.filteredSubcategoryListsMaterialUsed =
            this.subcategoryLists.filter(sub =>
                sub.group_id === selectedCategoryId
            );

        this.filteredMaterialsListMaterialUsed = [];

        this.searchMaterialUsedForm.patchValue({
            subCategory: '',
            item: ''
        });
    }


    onSubCategoryChangeMaterialUsed(event: any) {

        const selectedCategoryId =
            this.searchMaterialUsedForm.get('category')?.value;

        const selectedSubCategoryId = event.target.value;

        this.filteredMaterialsListMaterialUsed =
            this.materialsList.filter(item =>
                item.group_id === selectedCategoryId &&
                item.sub_group_id === selectedSubCategoryId
            );

        this.searchMaterialUsedForm.patchValue({ item: '' });
    }


    onMaterialChangeMaterialUsed(selectedMaterial: any) {

        if (selectedMaterial) {

            const selectedCategoryId = selectedMaterial.group_id;
            const selectedSubCategoryId = selectedMaterial.sub_group_id;

            this.searchMaterialUsedForm.patchValue({
                category: selectedCategoryId,
                subCategory: selectedSubCategoryId
            });

            this.filteredSubcategoryListsMaterialUsed =
                this.subcategoryLists.filter(sub =>
                    sub.group_id === selectedCategoryId
                );

            this.filteredMaterialsListMaterialUsed =
                this.materialsList.filter(item =>
                    item.group_id === selectedCategoryId &&
                    item.sub_group_id === selectedSubCategoryId
                );

        } else {

            this.searchMaterialUsedForm.patchValue({
                category: null,
                subCategory: null,
                item: null
            });

            this.filteredSubcategoryListsMaterialUsed = [];
            this.filteredMaterialsListMaterialUsed = [];
        }
    }


    getCategoryLists() {
        let formData = new FormData();
        this.ProjectService.getAllCategoryLists(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
            this.categoryLists = resp.data;
        });
    }

    getSubCategoryLists() {
        let formData = new FormData();
        this.ProjectService.getAllSubCategoryLists(formData).pipe(takeUntil(this.destroy$)).subscribe(resp => {
            this.subcategoryLists = resp.data;
            this.filteredSubcategoryLists = [...this.subcategoryLists];
        });
    }


    searchMaterialUsed() {
        this.materialUsedDatatablecode();
        this.reload('material_details');
    }

    resetMaterialUsed() {
        this.searchMaterialUsedForm.reset();

        this.materialUsedDatatablecode();
        this.reload('material_details');
    }
}
