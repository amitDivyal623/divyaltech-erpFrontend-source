import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import Swal from 'sweetalert2';
import { HrService } from 'src/app/services/hr.service';
import { DatePipe } from '@angular/common';
import { NgbCalendar, NgbDateAdapter, NgbDate, NgbDateParserFormatter, NgbDateStruct, NgbInputDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import jwt_decode from 'jwt-decode';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
    selector: 'app-add',
    templateUrl: './add.component.html',
    styleUrls: ['./add.component.css'],
    providers: [
        NgbInputDatepickerConfig,
        { provide: NgbDateAdapter, useClass: CustomAdapter },
        { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
        { provide: DatePipe }
    ]
})
export class AddComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    [x: string]: any;
    selectedAdd: string = "";
    minDate = { year: 1900, month: 1, day: 1 };
    maxDate = { year: 2099, month: 12, day: 31 };
    @ViewChild('labelImport') labelImport: ElementRef;
    @ViewChild('labelImport1') labelImport1: ElementRef;
    @ViewChild('fileInput') el: ElementRef;

    imageUrl: any = '';
    editFile: boolean = true;
    removeUpload: boolean = false;
    Depart: any = '';

    constructor(private hrservice: HrService, private cd: ChangeDetectorRef, private spinner: NgxSpinnerService, private _fb: FormBuilder, private router: Router) {
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
        // this.personalDetails = _fb.group({
        //     MobileNoAlt: ['', [Validators.required, Validators.pattern("^[0-9]*$")]]
        // })
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
        FillAddress: new FormControl(false),
        EmpPermCity: new FormControl(''),
        EmpPermState: new FormControl(''),
        EmpPermPin: new FormControl('', [Validators.maxLength(6), Validators.pattern(/^[0-9]\d*$/), Validators.minLength(6)]),
        MobileNo: new FormControl('', [Validators.maxLength(10), Validators.pattern(/^[0-9]\d*$/), Validators.minLength(10)]),

    });
    Profile = new FormGroup({

        // Joiningdate:new FormControl(' '),
        joiningDesignation: new FormControl(''),
        Joiningsalary: new FormControl(''),
        confirmationdate: new FormControl(''),
        gradelevel: new FormControl(''),
        email: new FormControl('', [Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]),
        Department: new FormControl('', Validators.required),
        currentdesignation: new FormControl(''),
        EmployeeType: new FormControl('', Validators.required),
        WorkStatus: new FormControl(''),
        Remark: new FormControl(''),
        Image: new FormControl(''),
        ContractorName: new FormControl('')
    });
    Salarydetail = new FormGroup({
        BasicSalary: new FormControl('', [Validators.required, Validators.pattern(/^[.\d]+$/), Validators.maxLength(7)]),
        HRA: new FormControl('', [Validators.required, Validators.pattern(/^[.\d]+$/), Validators.maxLength(7)]),
        ConveyanceAllowance: new FormControl('', [Validators.required, Validators.pattern(/^[.\d]+$/), Validators.maxLength(7)]),
        Medical: new FormControl('', [Validators.required, Validators.pattern(/^[.\d]+$/), Validators.maxLength(7)]),
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
        Account: new FormControl('', [Validators.pattern(/^[0-9]\d*$/)]),
        IFSC: new FormControl(''),
        PFAccount: new FormControl('',),
        UanNumber: new FormControl('', [Validators.maxLength(7), Validators.pattern(/^[0-9]\d*$/)]),
        ESIC: new FormControl(''),
        PFdeductionCheckBox: new FormControl(''),
        ESICdeductionCheckBox: new FormControl(''),
        Rate: new FormControl('', [Validators.maxLength(7), Validators.required, Validators.pattern(/^[.\d]+$/)]),
        RatedType: new FormControl('', Validators.required)
    });

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
    onSubmit() {

        this.isButtonDisabled = false;
        if (this.Type == '' || this.Type != "Contract Employee") {
            this.employeeCts = this.Salarydetail.controls.TotalCTC.valid;
            this.employeeGross = this.Salarydetail.controls.GrossSalary.valid;
            this.employeehra = this.Salarydetail.controls.HRA.valid;
            this.employeeBasic = this.Salarydetail.controls.BasicSalary.valid;
        } else {
            this.contractRate = this.Salarydetail.controls.Rate.valid;
            this.contractRateType = this.Salarydetail.controls.RatedType.valid;
        }
        this.PaymentModeValid = this.Salarydetail.controls.PaymentMode.valid;
        if (this.HRuserRole == true) {
            this.salaryFormValid = true;
        } else {
            if ((this.employeeCts && this.employeeGross && this.employeehra && this.employeeBasic && this.PaymentModeValid) || (this.contractRate && this.contractRateType && this.PaymentModeValid)) {
                this.salaryFormValid = true;
            } else {
                this.salaryFormValid = false;
            }
        }

        if (this.personalDetails.valid && this.Profile.valid && this.salaryFormValid && this.familyMembers.valid && this.workExperience.valid && this.educationDetail.valid && this.validationNumber) {
            this.spinner.show();
            this.isButtonDisabled = true;
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
            this.hrservice.employeeadd(employeeData).pipe(takeUntil(this.destroy$)).subscribe(Response => {
                if (Response.CODE == 200) {
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
            this.isButtonDisabled = false;
            Swal.fire({
                icon: 'error',
                title: 'Required fields empty',
                text: 'Please enter the mandatory fields',
                showConfirmButton: false,
                timer: 3000
            });
        }
    }
    activeTab = 'Personal';
    formImport: FormGroup;
    Adharimage;
    panimage
    employeeImage
    selectedValue: string = "";
    familyMembers: FormGroup;
    loanDetail: FormGroup;

    workExperience: FormGroup;
    educationDetail: FormGroup;

    ngOnInit() {
        this.jwttoken = jwt_decode(sessionStorage.getItem('token'));
        this.employeeDiv = true;
        this.vendorDiv = false;
        this.validationNumber = true;
        this.HRuserRole = false;
        this.addMembers();
        this.addLoandetail();
        this.addExperience();
        this.addEducation();
        this.lookupdatalist();
        this.getCompanyVariableValue();
        this.contractorlist();

        if (sessionStorage.getItem('UserRole') == 'HR user') {
            this.HRuserRole = true;
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
        if (this.bonus.length == 1) {
            if (this.Salarydetail.get('TotalCTC').value != '') {
                let totalCtc = Math.round(this.Salarydetail.get('TotalCTC').value - (pfAmount + ESICAmount));
                let bonus = totalCtc - this.Salarydetail.get('GrossSalary').value;
                if (bonus <= 0) {
                    this.Salarydetail.controls['OtherPay'].setValue('00');
                } else {
                    this.Salarydetail.controls['OtherPay'].setValue(bonus);
                }
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
        if (this.bonus.length == 1) {
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
            this.Salarydetail.controls['UanNumber'].enable()
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
    createsalary() { this.router.navigate(['/hr-employee-salary-create']); }

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
    // removeMembers(i:number) {
    //   this.members().removeAt(i);
    // }
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
        let lookupWorkStatus = "WorkStatus";
        let WorkStatus = new FormData();
        WorkStatus.append('lookupname', lookupWorkStatus);
        this.hrservice.fetch_lookupdata(WorkStatus).pipe(takeUntil(this.destroy$)).subscribe(Response => {
            this.lookupWorkStatus = Response.data
        });
        let lookupRateType = "RateType";
        let RateTypedata = new FormData();
        RateTypedata.append('lookupname', lookupRateType);
        this.hrservice.fetch_lookupdata(RateTypedata).pipe(takeUntil(this.destroy$)).subscribe(Response => {
            this.respRateType = Response.data;
        });

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
        this.hrservice.getCompanySetup('Medical').pipe(takeUntil(this.destroy$)).subscribe(Response => {
            this.Medical = Response.data
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
        this.Adharimagename = filecontent.name
        let reader = new FileReader(); 
        let file = event.target.files[0];
        if (event.target.files && event.target.files[0]) {
            reader.readAsDataURL(file);

            reader.onload = () => {
                this.image = { adharimage: reader.result }
                this.imagedata(this.image)
                this.editFile = false;
                this.removeUpload = true;

            }
            // ChangeDetectorRef since file is loading outside the zone
            this.cd.markForCheck();
        }

    }
    public imagedata(data: any) {

        if (data.empimage) {
            this.empimagedata = data.empimage
        }
        if (data.adharimage) {
            this.adharimagedata = data.adharimage
        }
        if (data.panimage) {
            this.panimagedata = data.panimage
        }
    }

    PanImage(files: FileList, event) {

        this.labelImport1.nativeElement.innerText = Array.from(files)
            .map(f => f.name)
            .join(', ');
        let filecontent = event.target.files[0];
        this.panimagename = filecontent.name
        let reader = new FileReader(); 
        let file = event.target.files[0];
        if (event.target.files && event.target.files[0]) {
            reader.readAsDataURL(file);

           
            reader.onload = () => {
                this.image = { panimage: reader.result }
                this.imagedata(this.image)

                this.editFile = false;
                this.removeUpload = true;

            }
            // ChangeDetectorRef since file is loading outside the zone
            this.cd.markForCheck();
        }
    }
    employeeimage(event) {

        let reader = new FileReader(); 
        let file = event.target.files[0];
        this.employeeImageName = file.name
        if (event.target.files && event.target.files[0]) {
            reader.readAsDataURL(file);

          
            reader.onload = () => {
                this.imageUrl = reader.result;
                this.editFile = false;
                this.removeUpload = true;
                this.image = { empimage: this.imageUrl }
                this.imagedata(this.image)
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
    onFillAddressChanged(event: any) {
        if (event.target.checked) {
            this.selectedAdd = "Active";
            this.personalDetails.controls['EmpPermAdd'].setValue(this.personalDetails.get('Temporaryaddress').value);
            this.personalDetails.controls['EmpPermCity'].setValue(this.personalDetails.get('EmpTempCity').value);
            this.personalDetails.controls['EmpPermState'].setValue(this.personalDetails.get('EmpTempState').value);
            this.personalDetails.controls['EmpPermPin'].setValue(this.personalDetails.get('EmpTempPin').value);
            this.personalDetails.controls['MobileNo'].setValue(this.personalDetails.get('MobileNoAlt').value);
        } else {
            this.selectedAdd = "";
            this.personalDetails.controls['EmpPermAdd'].setValue('');
            this.personalDetails.controls['EmpPermCity'].setValue('');
            this.personalDetails.controls['EmpPermState'].setValue('');
            this.personalDetails.controls['EmpPermPin'].setValue('');
            this.personalDetails.controls['MobileNo'].setValue('');
        }
    }
    employeeTypeChanges(e) {
        this.Type = e.target.options[e.target.selectedIndex].text;
        if (this.Type == 'Contract Employee') {
            this.vendorDiv = true;
            this.employeeDiv = false;
            this.Profile.get("ContractorName").setValue('');
            this.Salarydetail.get("RatedType").setValue('');
        } else {
            this.vendorDiv = false;
            this.employeeDiv = true;
            this.Salarydetail.updateValueAndValidity();
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

    public model: any;

    validation(e) {
        if (isNaN(e.target.value)) {
            this.validationNumber = false;
            $('#' + e.target.id).addClass('is-invalid');
        } else {
            this.validationNumber = true;
            $('#' + e.target.id).removeClass('is-invalid');
        }
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
