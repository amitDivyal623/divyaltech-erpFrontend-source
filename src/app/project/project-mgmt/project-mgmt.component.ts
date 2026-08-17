import { Component, OnInit, ViewChild, ElementRef, TemplateRef, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { NgbCalendar, NgbDate, NgbDateStruct, NgbInputDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { from, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProjectService } from '../../services/project.service';
import { HrService } from 'src/app/services/hr.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { StringLiteralLike } from 'typescript';
import { DataTableDirective } from 'angular-datatables';
import { environment } from 'src/environments/environment';

class DataTablesResponse {
    data: any[];
    draw: number;
    recordsFiltered: number;
    recordsTotal: number;
}
class projectmangment {
    ProjectType: string;
    Details: string;
}
@Component({
    selector: 'app-project-mgmt',
    templateUrl: './project-mgmt.component.html',
    styleUrls: ['./project-mgmt.component.css'],
    providers: [NgbInputDatepickerConfig]
})
export class ProjectMgmtComponent implements OnInit, OnDestroy {

    [x: string]: any;
    DatatableParameter = { customerName: '', project_name: '', project_type: '', Status: '', project_manager: '', ProjectCo_ordinator: '', Expected_Cost: '', user_role: '', user_id: '' };
    constructor(private router: Router, private http: HttpClient, private ProjectService: ProjectService, private hrservice: HrService, private fb: FormBuilder) { }
    dtOptions: DataTables.Settings = {};
    dtTrigger: Subject<any> = new Subject<any>();
    private destroy$ = new Subject<void>();
    @ViewChild(DataTableDirective) dtElement: DataTableDirective;
    minDate = { year: 1900, month: 1, day: 1 };
    maxDate = { year: 2099, month: 12, day: 31 };

    route(link: any) {
        this.router.navigate(['/' + link]);
    }
    data: projectmangment[];
    ngOnInit(): void {
        this.projectSearchForm = this.fb.group({
            project_manager: [null],
            project_coordinator: [null],
            customerName: [''],
            project_name: [''],
            project_type: [null],
            status: [null],
            expected_cost: ['']
        });
        this.Projectdatatabl();
        this.lookuplist();
        this.DatatableParameter.project_name = '';
        this.DatatableParameter.customerName = '';
        this.role = sessionStorage.getItem('UserRole');

    }
    addproject(id) {
        this.router.navigate(['/project-add']);
    }
    editproject(id) {
        this.router.navigate(['/project-edit', id, 'edit']);
    }
    viewProject(id) {
        this.router.navigate(['/project-view', id, 'view']);
    }
    Deleteproject(id) {
        Swal.fire({
            title: 'Are you sure?',
            text: 'You want to delete this.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.value) {
                this.ProjectService.deleteProject(id).pipe(takeUntil(this.destroy$)).subscribe(Response => {
                    if (Response.data == true) {
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
                            text: 'Employee Delete Failed',
                            showConfirmButton: false,
                            timer: 3000
                        });
                    }
                });
            }
        });
    }
    Projectdatatabl() {
        this.DatatableParameter.customerName = this.projectSearchForm.get('customerName').value;
        this.DatatableParameter.project_name = this.projectSearchForm.get('project_name').value;
        this.DatatableParameter.project_type = this.projectSearchForm.get('project_type').value;
        this.DatatableParameter.Status = this.projectSearchForm.get('status').value;
        this.DatatableParameter.project_manager = this.projectSearchForm.get('project_manager').value;
        this.DatatableParameter.ProjectCo_ordinator = this.projectSearchForm.get('project_coordinator').value;
        this.DatatableParameter.Expected_Cost = this.projectSearchForm.get('expected_cost').value;

        this.DatatableParameter.user_role = sessionStorage.getItem('UserRole');
        const that = this;
        const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });
        this.dtOptions = {
            processing: true,
            serverSide: true,
            dom: 'lrtip',
            pageLength: 25,
            lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
            // columnDefs: [
            //     { orderable: false, targets: 9 }
            // ],
            ajax: (dataTablesParameters: any, callback) => {
                Object.assign(dataTablesParameters, this.DatatableParameter);
                that.http.post<DataTablesResponse>(environment.APIEndpoint + 'project.fetch_ProjectList&reload=1', Object.assign(dataTablesParameters, this.DatatableParameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {
                    console.log(resp.data);
                    that.data = resp.data;
                    callback({ recordsTotal: resp.recordsTotal, recordsFiltered: resp.recordsTotal, data: [] });
                });
            }
        };
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
    ngOnDestroy(): void {
        this.dtTrigger.unsubscribe();
        this.destroy$.next();
        this.destroy$.complete();
    }
    searchProject() {
        this.Projectdatatabl();
        this.rerender();
    }

    resetProject() {

        // Reset entire form
        this.projectSearchForm.reset({
            customerName: '',
            project_name: '',
            project_type: null,
            status: null,
            project_manager: null,
            project_coordinator: null,
            expected_cost: ''
        });


        // Reload table
        this.Projectdatatabl();
        this.rerender();
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
            console.log(resp);
            this.projectCoordinatorUsers = resp.data;
        });

        let projectManager = new FormData();
        projectManager.append('roleName', 'Project Manager');
        this.hrservice.getEmployeebyRole(projectManager).pipe(takeUntil(this.destroy$)).subscribe(resp => {
            this.projectManagerUsers = resp.data;
        });
    }
}
