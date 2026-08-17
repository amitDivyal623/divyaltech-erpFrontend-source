import { Component, OnInit, ViewChild,ElementRef,TemplateRef, ChangeDetectorRef, OnDestroy,Injectable } from '@angular/core';
import { from, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {Router,ActivatedRoute} from '@angular/router';
import { ProjectService} from '../../../services/project.service';
import { HrService } from 'src/app/services/hr.service';
import { FormControl, FormControlName, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { HttpClient ,HttpHeaders, HttpResponse } from '@angular/common/http';
import { StringLiteralLike } from 'typescript';
import { DataTableDirective } from 'angular-datatables';
import { DatePipe } from '@angular/common';
import { environment } from 'src/environments/environment';
import { NgbCalendar, NgbDateAdapter, NgbDate, NgbDateParserFormatter, NgbDateStruct, NgbInputDatepickerConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {NgxSpinnerService} from 'ngx-spinner';
import { EmployeeModelComponent } from 'src/app/shared/employee-model/employee-model.component';
import {MachineReadingPopupComponent} from 'src/app/shared/machine-reading-popup/machine-reading-popup.component';
declare var $;


class DataTablesResponse {
    data: any[];
    draw: number;
    recordsFiltered: number;
    recordsTotal: number;
}

@Component({
    selector: 'app-history-details',
    templateUrl: './history-details.component.html',
    styleUrls: ['./history-details.component.css']
})
export class HistoryDetailsComponent implements OnInit, OnDestroy {

    private destroy$ = new Subject<void>();
    [x: string]: any;
    dtOptions: DataTables.Settings = {};
    dtTrigger: Subject<any> = new Subject<any>();
    @ViewChild(DataTableDirective) dtElement: DataTableDirective;
    @ViewChild('attachmentclosebutton') attachmentclosebutton;
    @ViewChild('labelImport')labelImport: ElementRef;
    @ViewChild('attachmentModalButton')attachmentModalButton: ElementRef;

    constructor(private router:Router,private http:HttpClient,private ProjectService:ProjectService,private hrservice:HrService,private chRef : ChangeDetectorRef,private activatedRoute: ActivatedRoute,private datePipe: DatePipe,private spinner: NgxSpinnerService) {
        if(sessionStorage.getItem('token')==undefined && sessionStorage.getItem('UserName')==undefined){
            this.router.navigate(['/']);
        }
    }

    historyDatatableParameter = { projectId: ''};
    ngOnInit(): void {
        this.historyTable();
    }

    historyTable() {
        this.historyDatatableParameter.projectId = this.activatedRoute.snapshot.paramMap.get('id');
        const that = this;
        const headers = new HttpHeaders({ 'Content-Type': 'text/plain'});
        this.dtOptions = {
            processing: true,
            serverSide: true,
            dom: 'lrtip',
            lengthMenu:[[5, 10, 25, 50], [5, 10, 25, 50]],
            order:[[0, 'desc']],
            ajax: (dataTablesParameters: any, callback) => {
                Object.assign(dataTablesParameters, this.historyDatatableParameter);
                that.http.post<DataTablesResponse>(environment.APIEndpoint+'project.fetchHistory&reload=1',Object.assign(dataTablesParameters,this.historyDatatableParameter), {responseType: 'json', headers}).pipe(takeUntil(this.destroy$)).subscribe(resp =>{
                    that.historyData=resp.data;
                    callback({recordsTotal: resp.recordsTotal,recordsFiltered: resp.recordsTotal,data: []});
                });
            }
        };
    }

    ngOnDestroy(): void {
        this.dtTrigger.unsubscribe();
        this.destroy$.next();
        this.destroy$.complete();
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
    ngAfterViewInit(): void {
        this.dtTrigger.next();
    }

}
