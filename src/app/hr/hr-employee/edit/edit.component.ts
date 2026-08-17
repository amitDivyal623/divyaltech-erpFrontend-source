import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef, Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { HrService } from 'src/app/services/hr.service';
import Swal from 'sweetalert2';
import { DatePipe } from '@angular/common';
declare var $;
import { NgbCalendar, NgbDateAdapter, NgbDate, NgbDateParserFormatter, NgbDateStruct, NgbInputDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import jwt_decode from 'jwt-decode';
import {NgxSpinnerService} from 'ngx-spinner';

const states = ['North Carolina', 'North Dakota',
    'Northern Mariana Islands', 'Ohio', 'Oklahoma', 'Oregon', 'Palau', 'Pennsylvania', 'Puerto Rico', 'Rhode Island',
    'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virgin Islands', 'Virginia'];
const month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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
    selector: 'app-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.css'],
    providers: [
        NgbInputDatepickerConfig,
        { provide: NgbDateAdapter, useClass: CustomAdapter },
        { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
        { provide: DatePipe }
    ]
})
export class EditComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    [x: string]: any;
    pipe = new DatePipe('en-US');
    @ViewChild('labelImport') labelImport: ElementRef;
    @ViewChild('labelImport1') labelImport1: ElementRef;
    @ViewChild('fileInput') el: ElementRef;
    @ViewChild("memberAge") memberAge: ElementRef;
    imageUrl: any = '';
    editFile: boolean = true;
    removeUpload: boolean = false;
    activeTab = 'Personal';
    educationDetail: FormGroup;
    employeeDetails = [];
    memberDetails = [];
    educationDetails = [];
    exprDetails = [];

    constructor(private hrservice: HrService, private cd: ChangeDetectorRef,private spinner: NgxSpinnerService, private _fb: FormBuilder, private router: Router, private activatedRoute: ActivatedRoute, private datePipe: DatePipe) {
        if (sessionStorage.getItem('token') == undefined && sessionStorage.getItem('UserName') == undefined) {
            this.router.navigate(['/']);
        }

        this.familyMembers = this._fb.group({
            members: this._fb.array([])
        });
        this.loanDetail = this._fb.group({
            loantaken: this._fb.array([])
        });
        this.workExperience = this._fb.group({
            experience: this._fb.array([])
        });
        this.educationDetail = this._fb.group({
            education: this._fb.array([])
        });
    }



    personalDetails = new FormGroup({
        AadharNumber: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]\d*$/), Validators.minLength(12), Validators.maxLength(12)]),
        PanNumber: new FormControl('', [Validators.required, Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}\d*$/), Validators.minLength(10), Validators.maxLength(10)]),
        EmployeeCode: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]\d*$/)]),
        title: new FormControl('', Validators.required),
        EmployeeName: new FormControl('', Validators.required),
        fathername: new FormControl(''),
        //dob:new FormControl('',Validators.required),
        gender: new FormControl(''),
        bloodgroup: new FormControl(''),
        maritalstatus: new FormControl(''),
        category: new FormControl(''),
        Religion: new FormControl(''),
        nationality: new FormControl(''),
        adharimage: new FormControl(''),
        panimage: new FormControl(''),
        Temporaryaddress: new FormControl(''),
        EmpTempCity: new FormControl(''),
        EmpTempState: new FormControl(''),
        EmpTempPin: new FormControl(''),
        MobileNoAlt: new FormControl('', [Validators.maxLength(10), Validators.pattern(/^[0-9]\d*$/), Validators.minLength(10)]),
        EmpPermAdd: new FormControl(''),
        EmpPermCity: new FormControl(''),
        EmpPermState: new FormControl(''),
        EmpPermPin: new FormControl('', [Validators.maxLength(6), Validators.pattern(/^[0-9]\d*$/), Validators.minLength(6)]),
        MobileNo: new FormControl('', [Validators.maxLength(10), Validators.pattern(/^[0-9]\d*$/), Validators.minLength(10)]),
        EmployeeId: new FormControl(''),
        QualificationId: new FormControl(''),
        family_detailsId: new FormControl(''),
        EmpsalaryId: new FormControl(''),
    });
    Profile = new FormGroup({
        //Joiningdate:new FormControl(' '),
        joiningDesignation: new FormControl(''),
        Joiningsalary: new FormControl(''),
        //confirmationdate:new FormControl(''),
        gradelevel: new FormControl(''),
        email: new FormControl('', [Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]),
        Department: new FormControl(''),
        currentdesignation: new FormControl(''),
        EmployeeType: new FormControl(''),
        WorkStatus: new FormControl(''),
        Remark: new FormControl(''),
        Image: new FormControl(''),
        ContractorName: new FormControl('')
    });
    Salarydetail = new FormGroup({
        BasicSalary: new FormControl('', [Validators.required, Validators.pattern(/^[.\d]+$/), Validators.maxLength(7)]),
        HRA: new FormControl('', [Validators.required, Validators.pattern(/^[.\d]+$/), Validators.maxLength(7)]),
        ConveyanceAllowance: new FormControl('', [Validators.required, Validators.pattern(/^[.\d]+$/), Validators.maxLength(7)]),
        OtherAllowance: new FormControl('', [Validators.maxLength(7), Validators.pattern(/^[.\d]+$/)]),
        PFdeduction: new FormControl(''),
        ESICdeduction: new FormControl(''),
        TotalCTC: new FormControl('', [Validators.maxLength(7), Validators.required, Validators.pattern(/^[.\d]+$/)]),
        TravellingAllowance: new FormControl('', [Validators.maxLength(7), Validators.pattern(/^[.\d]+$/)]),
        DearnessAllowance: new FormControl('', [Validators.maxLength(7), Validators.pattern(/^[.\d]+$/)]),
        OtherPay: new FormControl('', [Validators.maxLength(7), Validators.pattern(/^[.\d]+$/)]),
        GrossSalary: new FormControl('', [Validators.required, Validators.pattern(/^[.\d]+$/), Validators.maxLength(7)]),
        PaymentMode: new FormControl('', Validators.required),
        bank: new FormControl(''),
        Branch: new FormControl(''),
        Account: new FormControl('', [Validators.maxLength(7), Validators.pattern(/^[0-9]\d*$/)]),
        IFSC: new FormControl(''),
        PFAccount: new FormControl('',),
        UanNumber: new FormControl('', [Validators.maxLength(7), Validators.pattern(/^[0-9]\d*$/)]),
        ESIC: new FormControl(''),
        PFdeductionCheckBox: new FormControl(''),
        ESICdeductionCheckBox: new FormControl(''),
        Rate: new FormControl('', [Validators.maxLength(7), Validators.required, Validators.pattern(/^[.\d]+$/)]),
        RatedType: new FormControl('', Validators.required)
    });
   
    ngOnInit() {
        // this.addMembers();
        // this.addLoandetail();
        // this.addExperience();
        // this.addEducation();
        this.jwttoken = jwt_decode(sessionStorage.getItem('token'));
        this.employeeDiv = true;
        this.vendorDiv = false;
        this.validationNumber = true;
        this.contractorlist();
        this.getCompanyVariableValue();
        this.lookupdatalist();
        this.HRuserRole = false;
        if (sessionStorage.getItem('UserRole') == 'HR user') {
            this.HRuserRole = true;
        }

        $('.form-control').parents(".md-outline").find('label').addClass('active');
        const id = this.activatedRoute.snapshot.paramMap.get('id');
        const method = this.activatedRoute.snapshot.paramMap.get('method');

        let employeeData = new FormData();
        employeeData.append('EmployeeId', id);
        this.hrservice.getemployeeData(employeeData).pipe(takeUntil(this.destroy$)).subscribe(Response => {
            var employeeDetails = Response.EMPLOYEEDATA.DATA;
            let deprtmentdata = new FormData();
            deprtmentdata.append('department', employeeDetails[0][8]);
            this.hrservice.fetch_designation(deprtmentdata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
                this.respdesignation = Response.data
            });
            if (employeeDetails[0][72] == 'Contract Employee') {
                this.vendorDiv = true;
                this.employeeDiv = false;
                this.Type = "Contract Employee"
                this.Profile.controls.ContractorName.setValue(employeeDetails[0][73]);
                this.Salarydetail.controls.Rate.setValue(employeeDetails[0][74]);
                this.Salarydetail.controls.RatedType.setValue(employeeDetails[0][75]);
            } else {
                this.vendorDiv = false;
                this.employeeDiv = true;
            }
            this.dateOfBirth = this.pipe.transform(employeeDetails[0][48], 'MM/dd/yyyy');
            this.personalDetails.patchValue({
                EmployeeId: employeeDetails[0][0],
                AadharNumber: employeeDetails[0][25],
                PanNumber: employeeDetails[0][26],
                EmployeeCode: employeeDetails[0][2],
                title: employeeDetails[0][47],
                EmployeeName: employeeDetails[0][3],
                fathername: employeeDetails[0][5],
                gender: employeeDetails[0][23],
                bloodgroup: employeeDetails[0][24],
                maritalstatus: employeeDetails[0][38],
                category: employeeDetails[0][49],
                Religion: employeeDetails[0][6],
                nationality: employeeDetails[0][50],
                // adharimage : employeeDetails[0][],
                // panimage : employeeDetails[0][],
                Temporaryaddress: employeeDetails[0][15],
                EmpTempCity: employeeDetails[0][16],
                EmpTempState: employeeDetails[0][17],
                EmpTempPin: employeeDetails[0][18],
                MobileNoAlt: employeeDetails[0][20],
                EmpPermAdd: employeeDetails[0][10],
                EmpPermCity: employeeDetails[0][11],
                EmpPermState: employeeDetails[0][13],
                EmpPermPin: employeeDetails[0][12],
                MobileNo: employeeDetails[0][14],
            });
            $('#Joiningdate').val(this.pipe.transform(employeeDetails[0][21], 'MM/dd/yyyy'));
            $('#confirmationdate').val(this.pipe.transform(employeeDetails[0][36], 'MM/dd/yyyy'));
            this.Profile.patchValue({
                //Joiningdate : this.pipe.transform(employeeDetails[0][21], 'MM/dd/yyyy'),
                joiningDesignation: employeeDetails[0][34],
                Joiningsalary: employeeDetails[0][35],
                //confirmationdate : this.pipe.transform(employeeDetails[0][36], 'MM/dd/yyyy'),
                gradelevel: employeeDetails[0][9],
                email: employeeDetails[0][39],
                Department: employeeDetails[0][8],
                currentdesignation: employeeDetails[0][7],
                EmployeeType: employeeDetails[0][4],
                WorkStatus: employeeDetails[0][22],
                Remark: employeeDetails[0][41],
                //Image : employeeDetails[0][],
            });
            this.imageUrl = employeeDetails[0][55];
            this.editFile = false;
            this.removeUpload = true;
            this.image = { empimage: this.imageUrl }
            //this.imagedata(this.image);
            this.Salarydetail.patchValue({
                BasicSalary: employeeDetails[0][57],
                HRA: employeeDetails[0][58],
                ConveyanceAllowance: employeeDetails[0][61],
                OtherAllowance: employeeDetails[0][68],
                PFdeduction: employeeDetails[0][63],
                ESICdeduction: employeeDetails[0][64],
                TravellingAllowance: employeeDetails[0][59],
                DearnessAllowance: employeeDetails[0][60],
                OtherPay: employeeDetails[0][62],
                TotalCTC: employeeDetails[0][66],
                GrossSalary: employeeDetails[0][70],
                PaymentMode: employeeDetails[0][46],
                bank: employeeDetails[0][33],
                Branch: employeeDetails[0][31],
                Account: employeeDetails[0][30],
                IFSC: employeeDetails[0][32],
                PFAccount: employeeDetails[0][28],
                UanNumber: employeeDetails[0][29],
                ESIC: employeeDetails[0][27],
                // PFdeductionCheckBox : employeeDetails[0][],
                // ESICdeductionCheckBox : employeeDetails[0][]
            });
            if (employeeDetails[0][46] == 'Bybank') {
                this.Salarydetail.controls['bank'].enable();
                this.Salarydetail.controls['Branch'].enable();
                this.Salarydetail.controls['Account'].enable();
                this.Salarydetail.controls['IFSC'].enable();
            }

            if (employeeDetails[0][63] != '') {
                this.Salarydetail.controls['PFdeductionCheckBox'].setValue(1);
                this.Salarydetail.controls['PFdeduction'].enable();
                this.Salarydetail.controls['PFAccount'].enable();
                this.Salarydetail.controls['UanNumber'].enable()
            }
            if (employeeDetails[0][64] != '') {
                this.Salarydetail.controls['ESICdeductionCheckBox'].setValue(1);
                this.Salarydetail.controls['ESICdeduction'].enable();
                this.Salarydetail.controls['ESIC'].enable();
            }
            var i;
            var j;
            var k;
            for (i = 0; i < Response.QUALIFICATIONDATA.length; i++) {
                this.addEducation();
            }
            setTimeout(() => {
                for (i = 0; i < Response.QUALIFICATIONDATA.length; i++) {
                    $('#educationclass_' + i).val(Response.QUALIFICATIONDATA[i].Class);
                    $('#educationsubject_' + i).val(Response.QUALIFICATIONDATA[i].Subject);
                    $('#educationboard_' + i).val(Response.QUALIFICATIONDATA[i].BoardName);
                    $('#educationyear_' + i).val(Response.QUALIFICATIONDATA[i].PassingYear);
                    $('#educationpercent_' + i).val(Response.QUALIFICATIONDATA[i].Percentage);
                    $('#educationremark_' + i).val(Response.QUALIFICATIONDATA[i].Remarks);
                    if (Response.QUALIFICATIONDATA[i].PassingYear == '') {
                        $('#educationyear_' + i).val(" ");
                    }

                }
            }, 500);
            for (j = 0; j < Response.FAMILY_DETAILS.length; j++) {
                this.addMembers();
            }
            setTimeout(() => {
                for (j = 0; j < Response.FAMILY_DETAILS.length; j++) {
                    $('#memberName_' + j).val(Response.FAMILY_DETAILS[j].MemberName);
                    $('#memberAge_' + j).val(Response.FAMILY_DETAILS[j].Age);
                    $('#memberRelation_' + j).val(Response.FAMILY_DETAILS[j].Relation);
                    $('#memberOccupation_' + j).val(Response.FAMILY_DETAILS[j].Occupation);
                    if (Response.FAMILY_DETAILS[j].Age == '') {
                        $('#memberAge_' + j).val(' ');
                    }

                }
            }, 500);
            for (j = 0; j < Response.LOANDETAILS.length; j++) {
                this.addLoandetail();
            }
            setTimeout(() => {
                for (j = 0; j < Response.LOANDETAILS.length; j++) {
                    $('#loandeductedAmt_' + j).val(Response.LOANDETAILS[j].deductedAmt);
                    $('#loanlastDeductedEmi_' + j).val(Response.LOANDETAILS[j].lastDeductedEmi);
                    $('#loanAmount_' + j).val(Response.LOANDETAILS[j].loanAmount);
                    $('#remainigAmt_' + j).val(Response.LOANDETAILS[j].remainingEmi);
                    $('#loadTotalEmi_' + j).val(Response.LOANDETAILS[j].totalEmi);
                    $('#loanDate_' + j).val(this.datePipe.transform(Response.LOANDETAILS[j].Date, 'dd/MM/yyyy'));
                    $('#loadEmi_' + j).val(Response.LOANDETAILS[j].emiAmt);
                    if (Response.LOANDETAILS[j].deductedAmt == '') {
                        $('#loandeductedAmt_' + j).val(' ');
                    }
                    if (Response.LOANDETAILS[j].deductedAmt == '') {
                        $('#loanlastDeductedEmi_' + j).val(' ');
                    }
                    if (Response.LOANDETAILS[j].loanAmount == '') {
                        $('#loanAmount_' + j).val(' ');
                    }
                    if (Response.LOANDETAILS[j].remainingEmi == '') {
                        $('#remainigAmt_' + j).val(' ');
                    }
                    if (Response.LOANDETAILS[j].totalEmi == '') {
                        $('#loadTotalEmi_' + j).val(' ');
                    }
                    if (Response.LOANDETAILS[j].Date == '') {
                        $('#loanDate_' + j).val(' ');
                    }
                    if (Response.LOANDETAILS[j].emiAmt == '') {
                        $('#loadEmi_' + j).val(' ');
                    }
                }
            }, 500);
            for (k = 0; k < Response.EXPERIENCEDATA.length; k++) {
                this.addExperience();
            }
            setTimeout(() => {
                for (k = 0; k < Response.EXPERIENCEDATA.length; k++) {
                    $('#companyName_' + k).val(Response.EXPERIENCEDATA[k].PreCompName);
                    $('#companyAddress_' + k).val(Response.EXPERIENCEDATA[k].Address);
                    $('#OldjoiningDesignation_' + k).val(Response.EXPERIENCEDATA[k].DesgJoin);
                    $('#resignedDesignation_' + k).val(Response.EXPERIENCEDATA[k].DesgLeave);
                    $('#OldjoiningSalary_' + k).val(Response.EXPERIENCEDATA[k].JoiningSalary);
                    $('#resignationSalary_' + k).val(Response.EXPERIENCEDATA[k].LeavingSalary);
                    $('#resignationReason_' + k).val(Response.EXPERIENCEDATA[k].Reason);
                    $('#OldjoiningDate_' + k).val(this.datePipe.transform(Response.EXPERIENCEDATA[k].DurationFrom, 'dd/MM/yyyy'));
                    $('#resignedDate_' + k).val(this.datePipe.transform(Response.EXPERIENCEDATA[k].DurationTo, 'dd/MM/yyyy'));
                    if (Response.EXPERIENCEDATA[k].JoiningSalary == '') {
                        $('#OldjoiningSalary_' + k).val(' ');
                    }
                    if (Response.EXPERIENCEDATA[k].LeavingSalary == '') {
                        $('#resignationSalary_' + k).val(' ');
                    }
                    if (Response.EXPERIENCEDATA[k].DurationFrom == '') {
                        $('#OldjoiningDate_' + k).val(' ');
                    }
                    if (Response.EXPERIENCEDATA[k].DurationTo == '') {
                        $('#resignedDate_' + k).val(' ');
                    }
                }
            }, 500);
        });
        setTimeout(() => {
            if (method == 'view') {
                this.personalDetails.disable();
                this.Profile.disable();
                this.Salarydetail.disable();
                $('.form-control').prop("disabled", true);
                $("radio").prop('disabled', true);
                $(".employeeButton").hide();
                // $(".qualification").attr('disabled','disabled');
            }
        }, 2000);
    }
    onSubmit() {
       
        if (this.Type == '' || this.Type != "Contract Employee") {
            this.employeeCts = this.Salarydetail.controls.TotalCTC.valid;
            this.employeeGross = this.Salarydetail.controls.GrossSalary.valid;
            this.employeehra = this.Salarydetail.controls.HRA.valid;
            this.employeeBasic = this.Salarydetail.controls.BasicSalary.valid;
        } else {
            this.contractRate = this.Salarydetail.controls.Rate.valid;
            this.contractRateType = this.Salarydetail.controls.RatedType.valid;
        }
        if (this.HRuserRole == true) {
            this.salaryFormValid = true;
        } else {
            if ((this.employeeCts && this.employeeGross && this.employeehra && this.employeeBasic) || (this.contractRate && this.contractRateType)) {
                this.salaryFormValid = true;
            } else {
                this.salaryFormValid = false;
            }
        }
        if (this.personalDetails.valid && this.Profile.valid && this.salaryFormValid && this.validationNumber) {
            this.spinner.show();
            this.submitted = false;
            const form = document.querySelector('form');
            let employeeData = new FormData(form);
            employeeData.append('Adharimagename', this.Adharimagename);
            employeeData.append('panimagename', this.panimagename);
            employeeData.append('employeeImageName', this.employeeImageName);
            employeeData.append('EmployeeTypeName', this.Type);
            employeeData.append('USERID', this.jwttoken.USERID);
            employeeData.append('COMPANYID', this.jwttoken.COMPANYID);
            if (this.HRuserRole == true) {
                employeeData.append('HRuserRole', 'HRuser');
            }
            this.hrservice.Updateemployee(employeeData).pipe(takeUntil(this.destroy$)).subscribe(Response => {
                if (Response) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: Response.MESSAGE,
                        showConfirmButton: false,
                        timer: 2000
                    });
                    this.router.navigate(['/hr-employee']);
                    this.spinner.hide();
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: 'Task Creation Failed',
                        showConfirmButton: false,
                        timer: 3000
                    });
                    this.spinner.hide();
                }
            });
        } else {
            this.submitted = true;
            Swal.fire({
                icon: 'error',
                title: 'Required fields empty',
                text: 'Please enter the mandatory fields',
                showConfirmButton: false,
                timer: 3000
            });
        }
    }
    calculation() {
        if (this.basicPay.length == 1) {
            let basicPay = Math.round((this.Salarydetail.get('GrossSalary').value * this.basicPay[0].value) / 100);
            this.Salarydetail.controls['BasicSalary'].setValue(basicPay);
        }
        let pfAmount = 0
        if (this.pf.length == 1) {
            let basicPay = Math.round((this.Salarydetail.get('GrossSalary').value * this.basicPay[0].value) / 100);
            pfAmount = ((basicPay * this.pf[0].value) / 100);
            this.Salarydetail.controls['PFdeduction'].setValue(pfAmount);

        }
        let ESICAmount = 0;
        if (this.ESIC.length == 1) {
            ESICAmount = Math.round((this.Salarydetail.get('GrossSalary').value * this.ESIC[0].value) / 100);
            this.Salarydetail.controls['ESICdeduction'].setValue(ESICAmount);

        }
        if (this.Salarydetail.get('TotalCTC').value != '') {
            let basicPay = Math.round((this.Salarydetail.get('GrossSalary').value * this.basicPay[0].value) / 100);
            //Employeer ESI ammount
            let employeerESICAmount = Math.round((this.Salarydetail.get('GrossSalary').value * this.employeerESI[0].value) / 100);
            //Employeer PF ammount
            let EmployeerpfAmount = ((basicPay * this.employeerPF[0].value) / 100);
            let totalCtc = Math.round(this.Salarydetail.get('TotalCTC').value - (EmployeerpfAmount + employeerESICAmount));
            let bonus = totalCtc - this.Salarydetail.get('GrossSalary').value;
            if (bonus <= 0) {
                this.Salarydetail.controls['OtherPay'].setValue('00');
            } else {
                this.Salarydetail.controls['OtherPay'].setValue(bonus);
            }
        }
        if (this.HRA.length == 1) {
            let HRAAmount = Math.round((this.Salarydetail.get('GrossSalary').value * this.HRA[0].value) / 100);
            this.Salarydetail.controls['HRA'].setValue(HRAAmount);
        }
        if (this.CA.length == 1) {
            let CAAmount = Math.round((this.Salarydetail.get('GrossSalary').value * this.CA[0].value) / 100);
            this.Salarydetail.controls['ConveyanceAllowance'].setValue(CAAmount);
        }
        if (this.TA.length == 1) {
            let TAAmount = Math.round((this.Salarydetail.get('GrossSalary').value * this.TA[0].value) / 100);
            this.Salarydetail.controls['TravellingAllowance'].setValue(TAAmount);
        }
        if (this.DA.length == 1) {
            let DAAmount = Math.round((this.Salarydetail.get('GrossSalary').value * this.DA[0].value) / 100);
            this.Salarydetail.controls['DearnessAllowance'].setValue(DAAmount);
        }

    }

    ctcCalculation() {
        if (this.pf.length == 1) {
            let basicPay = Math.round((this.Salarydetail.get('GrossSalary').value * this.basicPay[0].value) / 100);
            //Employeer PF ammount
            let EmployeerpfAmount = Math.round((basicPay * this.employeerPF[0].value) / 100);
            //Employeer ESI ammount
            let employeerESICAmount = Math.round((this.Salarydetail.get('GrossSalary').value * this.employeerESI[0].value) / 100);
            let totalCtc = this.Salarydetail.get('TotalCTC').value - (EmployeerpfAmount - employeerESICAmount)
            let bonus = totalCtc - this.Salarydetail.get('GrossSalary').value;
            if (bonus <= 0) {
                this.Salarydetail.controls['OtherPay'].setValue('00');
            } else {
                this.Salarydetail.controls['OtherPay'].setValue(bonus);
            }
        } else {
            let bonus = this.Salarydetail.get('TotalCTC').value - this.Salarydetail.get('GrossSalary').value;
            if (bonus <= 0) {
                this.Salarydetail.controls['OtherPay'].setValue('00');
            } else {
                this.Salarydetail.controls['OtherPay'].setValue(bonus);
            }
        }
        this.calculation();
    }
    members(): FormArray {
        return this.familyMembers.get("members") as FormArray
    }
    loantaken(): FormArray {
        return this.loanDetail.get("loantaken") as FormArray
    }
    experience(): FormArray {
        return this.workExperience.get('experience') as FormArray
    }
    education(): FormArray {
        return this.educationDetail.get('education') as FormArray
    }
    addExperience() {
        this.experience().push(this.newExperience());
    }
    addMembers() {
        this.members().push(this.newMember());
    }
    addLoandetail() {
        this.loantaken().push(this.newLoan());
    }
    addEducation() {
        this.education().push(this.neweducation());
    }
    newExperience(): FormGroup {
        return this._fb.group({
            companyName: ' ',
            companyAddress: ' ',
            OldjoiningDate: ' ',
            resignedDate: ' ',
            OldjoiningDesignation: ' ',
            resignedDesignation: ' ',
            OldjoiningSalary: ' ',
            resignationSalary: ' ',
            resignationReason: ' '
        });
    }
    newMember(): FormGroup {
        return this._fb.group({
            memberName: ' ',
            memberAge: ' ',
            memberRelation: ' ',
            memberOccupation: ' '
        })
    }
    newLoan(): FormGroup {
        return this._fb.group({
            loadAmount: ' ',
            Date: ' ',
            emiAmount: ' ',
            totalEmi: ' ',
            deductedAmount: ' ',
            lastDeductedEmi: ' ',
            remainingAmount: ' '
        })
    }
    neweducation(): FormGroup {
        return this._fb.group({
            educationclass: ' ',
            educationsubject: ' ',
            educationboard: ' ',
            educationyear: ' ',
            educationpercent: ' ',
            educationremark: ' ',
        })
    }
    result(tabName: any) {
        this.activeTab = tabName;
    }
    lookupdatalist() {

        let lookupTitel = "Title";
        let Titledata = new FormData();
        Titledata.append('lookupname', lookupTitel);
        this.hrservice.fetch_lookupdata(Titledata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
            this.resplookupTitel = Response.data
        });
        let lookupgender = "Gender";
        let Genderdata = new FormData();
        Genderdata.append('lookupname', lookupgender);
        this.hrservice.fetch_lookupdata(Genderdata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
            this.resplookupgender = Response.data
        });
        let BloodGroup = "Blood Group";
        let blooddata = new FormData();
        blooddata.append('lookupname', BloodGroup);
        this.hrservice.fetch_lookupdata(blooddata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
            this.respBloodGroup = Response.data
        });
        let MaritalStatus = "Marital Status";
        let MaritalStatusdata = new FormData();
        MaritalStatusdata.append('lookupname', MaritalStatus);
        this.hrservice.fetch_lookupdata(MaritalStatusdata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
            this.respMaritalStatus = Response.data
        });
        let lookupCategory = "Category";
        let Categorydata = new FormData();
        Categorydata.append('lookupname', lookupCategory);
        this.hrservice.fetch_lookupdata(Categorydata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
            this.resplookupCategory = Response.data
        });
        let lookupNationality = "Nationality";
        let Nationalitydata = new FormData();
        Nationalitydata.append('lookupname', lookupNationality);
        this.hrservice.fetch_lookupdata(Nationalitydata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
            this.resplookupNationality = Response.data
        });
        let lookupReligion = "Religion";
        let ReligionData = new FormData();
        ReligionData.append('lookupname', lookupReligion);
        this.hrservice.fetch_lookupdata(ReligionData).pipe(takeUntil(this.destroy$)).subscribe(Response => {
            this.resplookupReligion = Response.data
        });

        let deprtmentdata = new FormData();
        this.hrservice.fetch_designation(deprtmentdata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
            this.resplookupDesignation = Response.data
        });
        let lookupGradeLevel = "Grade Level";
        let Gradedata = new FormData();
        Gradedata.append('lookupname', lookupGradeLevel);
        this.hrservice.fetch_lookupdata(Gradedata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
            this.resplookupGradeLevel = Response.data
        });
        let lookupDepartment = "Department";
        let departmentdata = new FormData();
        departmentdata.append('lookupname', lookupDepartment);
        this.hrservice.fetch_lookupdata(departmentdata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
            this.resplookupDepartment = Response.data
        });
        let lookupEmployeeType = "Employee Type";
        let employeetypedata = new FormData();
        employeetypedata.append('lookupname', lookupEmployeeType);
        this.hrservice.fetch_lookupdata(employeetypedata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
            this.resplookupEmployeeType = Response.data
        });
        let lookupClass = "Class";
        let classdata = new FormData();
        classdata.append('lookupname', lookupClass);
        this.hrservice.fetch_lookupdata(classdata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
            this.resplookupClass = Response.data
        });
        let lookupSubject = "Subject";
        let subjectdata = new FormData();
        subjectdata.append('lookupname', lookupSubject);
        this.hrservice.fetch_lookupdata(subjectdata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
            this.resplookupSubject = Response.data
        });
        let lookupBank = "Bank";
        let bankdata = new FormData();
        bankdata.append('lookupname', lookupBank);
        this.hrservice.fetch_lookupdata(bankdata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
            this.resplookupBank = Response.data
        });
        let lookupRelation = "Relation";
        let Relation = new FormData();
        Relation.append('lookupname', lookupRelation);
        this.hrservice.fetch_lookupdata(Relation).pipe(takeUntil(this.destroy$)).subscribe(Response => {
            this.resplookupRelation = Response.data
        });
        let lookupRateType = "RateType";
        let RateTypedata = new FormData();
        RateTypedata.append('lookupname', lookupRateType);
        this.hrservice.fetch_lookupdata(RateTypedata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
            this.respRateType = Response.data;
        });
        let lookupWorkStatus = "WorkStatus";
        let WorkStatus = new FormData();
        WorkStatus.append('lookupname', lookupWorkStatus);
        this.hrservice.fetch_lookupdata(WorkStatus).pipe(takeUntil(this.destroy$)).subscribe(Response => {
            this.lookupWorkStatus = Response.data
        });

    }
    changePaymentMode(e) {
        if (e.target.value == 'Bybank') {
            this.Salarydetail.controls['bank'].enable();
            this.Salarydetail.controls['Branch'].enable();
            this.Salarydetail.controls['Account'].enable();
            this.Salarydetail.controls['IFSC'].enable();
        } else {
            this.Salarydetail.controls['bank'].disable();
            this.Salarydetail.controls['Branch'].disable();
            this.Salarydetail.controls['Account'].disable();
            this.Salarydetail.controls['IFSC'].disable();
        }
    }
    PFdeduction(e) {
        if (e.target.checked) {
            this.Salarydetail.controls['PFdeduction'].enable();
            this.Salarydetail.controls['PFAccount'].enable();
            this.Salarydetail.controls['UanNumber'].enable();
        } else {
            this.Salarydetail.controls['PFdeduction'].disable();
            this.Salarydetail.controls['PFAccount'].disable();
            this.Salarydetail.controls['UanNumber'].disable();
        }
    }
    ESICdeduction(e) {
        if (e.target.checked) {
            this.Salarydetail.controls['ESICdeduction'].enable();
            this.Salarydetail.controls['ESIC'].enable();
        } else {
            this.Salarydetail.controls['ESICdeduction'].disable();
            this.Salarydetail.controls['ESIC'].disable();
        }
    }

    createsalary() {
        this.router.navigate(['/hr-employee-salary-create']);
    }
    getCompanyVariableValue() {
        this.hrservice.getCompanySetup('basicpay').pipe(takeUntil(this.destroy$)).subscribe(Response => {
            this.basicPay = Response.data
        });
        this.hrservice.getCompanySetupemployee('PF', 'employee').pipe(takeUntil(this.destroy$)).subscribe(Response => {
            this.pf = Response.data
        });
        this.hrservice.getCompanySetupemployee('ESIC', 'employee').pipe(takeUntil(this.destroy$)).subscribe(Response => {
            this.ESIC = Response.data
        });
        this.hrservice.getCompanySetup('HRA').pipe(takeUntil(this.destroy$)).subscribe(Response => {
            this.HRA = Response.data
        });
        this.hrservice.getCompanySetup('CA').pipe(takeUntil(this.destroy$)).subscribe(Response => {
            this.CA = Response.data
        });
        this.hrservice.getCompanySetup('TA').pipe(takeUntil(this.destroy$)).subscribe(Response => {
            this.TA = Response.data
        });
        this.hrservice.getCompanySetup('DA').pipe(takeUntil(this.destroy$)).subscribe(Response => {
            this.DA = Response.data
        });
        this.hrservice.getCompanySetup('bonus').pipe(takeUntil(this.destroy$)).subscribe(Response => {
            this.bonus = Response.data
        });
        this.hrservice.getCompanySetupemployee('PF', 'employeer').pipe(takeUntil(this.destroy$)).subscribe(Response => {
            this.employeerPF = Response.data
        });
        this.hrservice.getCompanySetupemployee('ESIC', 'employeer').pipe(takeUntil(this.destroy$)).subscribe(Response => {
            this.employeerESI = Response.data
        });
    }
    AdharImage(files: FileList, event) {
        this.labelImport.nativeElement.innerText = Array.from(files)
            .map(f => f.name)
            .join(', ');
        let filecontent = event.target.files[0];
        this.Adharimagename = filecontent.name;
    }
    PanImage(files: FileList, event) {
        this.labelImport1.nativeElement.innerText = Array.from(files)
            .map(f => f.name)
            .join(', ');
        let filecontent = event.target.files[0];
        this.panimagename = filecontent.name
    }
    import(): void {
    }
    employeeimage(event) {
        let reader = new FileReader(); // HTML5 FileReader API
        let file = event.target.files[0];
        this.employeeImageName = file.name
        if (event.target.files && event.target.files[0]) {
            reader.readAsDataURL(file);
            // When file uploads set it to file formcontrol
            reader.onload = () => {
                this.imageUrl = reader.result;
                this.editFile = false;
                this.removeUpload = true;
                this.image = { empimage: this.imageUrl }
                // this.imagedata(this.image)
            }
            // ChangeDetectorRef since file is loading outside the zone
            this.cd.markForCheck();
        }
    }
    departMentChanges(e) {
        //this.Depart = e.target.options[e.target.selectedIndex].text;
        this.Depart = e.target.value;
        let deprtmentdata = new FormData();
        deprtmentdata.append('department', this.Depart);
        this.hrservice.fetch_designation(deprtmentdata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
            this.respdesignation = Response.data
        });

    }
    employeeTypeChanges(e) {
        this.Type = e.target.options[e.target.selectedIndex].text;
        if (this.Type == 'Contract Employee') {
            this.vendorDiv = true;
            this.employeeDiv = false;
            this.Profile.get("ContractorName").setValue('');
            this.Salarydetail.get("Rate").setValue('');
            this.Salarydetail.get("RatedType").setValue('');
        } else {
            this.vendorDiv = false;
            this.employeeDiv = true;
            //this.Salarydetail.reset();
        }
    }
    contractorlist() {
        let projectlist = new FormData();
        this.hrservice.contractorList(projectlist).pipe(takeUntil(this.destroy$)).subscribe(Response => {
            this.respcontractor = Response.data
        });
    }
    //end of dynamic fields addition
    //search select code
    validationCheck(e) {
        if (e.target.value == '') {
            $('#' + e.target.name).addClass('is-invalid');
            this.isinvalid = true;
        } else {
            $('#' + e.target.name).removeClass('is-invalid');
            this.isinvalid = false;
        }

    }
    onchange(type, val) {
        let employee = new FormData();
        if (type == "Aadhaar") {
            employee.append("AdhaarNumber", val);
            employee.append('EmployeeCode', "");
            employee.append('PanNumber', "");
            this.hrservice.checkEmployeeCode(employee).pipe(takeUntil(this.destroy$)).subscribe(response => {
                if (response.CODE == 406) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: 'AdhaarNumber Already Exists',
                        showConfirmButton: false,
                        timer: 3000
                    });
                }
            });

        }
        else if (type == "PanNumber") {
            employee.append("PanNumber", val);
            employee.append('AdhaarNumber', "");
            employee.append('EmployeeCode', "");
            this.hrservice.checkEmployeeCode(employee).pipe(takeUntil(this.destroy$)).subscribe(response => {
                if (response.CODE == 406) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: 'PanNumber Already Exists',
                        showConfirmButton: false,
                        timer: 3000
                    });
                }
            });
        }
        else {
            employee.append('EmployeeCode', val);
            employee.append('AdhaarNumber', "");
            employee.append('PanNumber', "");
            this.hrservice.checkEmployeeCode(employee).pipe(takeUntil(this.destroy$)).subscribe(response => {
                if (response.CODE == 406) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: 'Employee Code Already Exists',
                        showConfirmButton: false,
                        timer: 3000
                    });
                }
            });
        }
    }

    public model: any;
    search = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            map(term => term.length < 2 ? []
                : states.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
        )
    months = (text$: Observable<string>) =>
        text$.pipe(
            debounceTime(200),
            distinctUntilChanged(),
            map(term => term.length < 2 ? []
                : month.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
        )

    validation(e) {
        if (isNaN(e.target.value)) {
            this.validationNumber = false;
            $('#' + e.target.id).addClass('is-invalid');
        } else {
            this.validationNumber = true;
            $('#' + e.target.id).removeClass('is-invalid');
        }
    }
    //end of search select code

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
