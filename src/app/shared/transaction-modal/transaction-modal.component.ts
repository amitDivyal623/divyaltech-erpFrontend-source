import { Component, Injectable, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgbActiveModal, NgbDateAdapter, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';

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
  selector: 'app-transaction-modal',
  templateUrl: './transaction-modal.component.html',
  styleUrls: ['./transaction-modal.component.scss']
})
export class TransactionModalComponent implements OnInit {
  minDate = {year: 1900, month: 1, day: 1};
  maxDate = {year: 2099, month: 12, day: 31};
  transactionTitle!: string;
  dtOptions: DataTables.Settings = {};
  @Input() machineTitle!: string;
  @ViewChild('content') content: any;
  @ViewChild('ngbDatepicker') dte: any;
  dtTrigger: Subject<any> = new Subject<any>();
  addPaySelect:boolean=false;
  addExpenseSelect:boolean=false;
  addInterSelect:boolean=false;
  addChequeMode:boolean=false;
  addBankMode:boolean=false;
  // transactionTitle:any;

  addTranscform = new FormGroup({
    addtranscDate : new FormControl(),
    addtranscTime : new FormControl(),
    addtransType : new FormControl(),
    addpayMode : new FormControl(),
    addtransStatus : new FormControl(),
    addtransAmt : new FormControl(),
    // addtransSent : new FormControl(),
    addtransFromHead : new FormControl(),
    addtransaccSrc : new FormControl(),
    addTransReceived : new FormControl(),
    addTransHolder : new FormControl(),
    addaccHead : new FormControl(),
    addreceviedBy : new FormControl(),
    addTransParty : new FormControl(),
    addTransaccHold : new FormControl(),
    addTransHead : new FormControl(),
    addTranssendBy : new FormControl(),
    addtransReason : new FormControl(),
    addtransToHead: new FormControl(),
    addtranstoaccSrc: new FormControl(),
    addtransName: new FormControl(),
  })

  constructor(public modal: NgbActiveModal,) { }
  onAddSelectChange(value){
    let transType = typeof (value) == "object" ? value.target.value : value;
    if (transType == 1) {
      this.addPaySelect=true;
      this.addExpenseSelect=false;
      this.addInterSelect=false;
    }else if (transType == 2) {
      this.addPaySelect=false;
     this.addExpenseSelect=true;
     this.addInterSelect=false;
    } else {
      this.addPaySelect=false;
      this.addExpenseSelect=false;
      this.addInterSelect=true;
    }
  }
  onSelectPaymentMode(value){
    let modeType = typeof (value) == "object" ? value.target.value : value;
    if (modeType == 1) {
      this.addChequeMode=true;
      this.addBankMode=false
    }else if (modeType == 2) {
      this.addChequeMode=false;
      this.addBankMode=false;
    } else {
      this.addChequeMode=false;
      this.addBankMode=true;
    }
  }
  ngOnInit(): void {
    this.transactionTitle = 'Add Transaction Details';
  }

}
