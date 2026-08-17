import { Component, OnInit, ViewChild, ChangeDetectorRef, TemplateRef, Injectable, OnDestroy, ElementRef } from '@angular/core';
import { NgbCalendar, NgbDateAdapter, NgbDate, NgbDateParserFormatter, NgbDateStruct, NgbInputDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { CrmService } from '../../services/crm.service';
import { DatePipe } from '@angular/common';
import { StringLiteralLike } from 'typescript';
import { Router } from '@angular/router';
import { from, Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
import { HrService } from 'src/app/services/hr.service';

@Component({
	selector: 'app-crm-visitors',
	templateUrl: './crm-visitors.component.html',
	styleUrls: ['./crm-visitors.component.css'],
	providers: []
})

export class CrmVisitorsComponent implements OnInit {
		
	constructor() {
	}

	ngOnInit(): void {
	}
	
}
