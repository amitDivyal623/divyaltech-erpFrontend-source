import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { stringify } from '@angular/compiler/src/util';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class HrService {
  updateVehicle(updvehicleData: FormData) {
    throw new Error('Method not implemented.');
  }
  public apiurl = environment.APIEndpoint;
  constructor(private http: HttpClient) { }

  public fetchTaskList(): Observable<any> {
    
    return this.http.get<any>(this.apiurl + `tasks.fetch_task&reload=1`);
  }

  public updateDescription(obj: any, obj2: any): Observable<any> {
    return this.http.post(this.apiurl + `tasks.update_description&reload=1`, JSON.stringify({ taskID: obj2, description: obj }));
  }

  public updateTitle(obj: any, obj2: any): Observable<any> {
    return this.http.post(this.apiurl + `tasks.update_title&reload=1`, JSON.stringify({ taskID: obj2, title: obj }));
  }

  public updateTaskStatus(obj: any, obj2: any): Observable<any> {
    return this.http.post(this.apiurl + `tasks.statusUpdate&reload=1`, JSON.stringify({ taskID: obj2, status: obj }));
  }

  public addTask(obj: any): Observable<any> {
   
    return this.http.post(this.apiurl + `tasks.add_task&reload=1`, obj);
  }

  public searchTask(obj: any): Observable<any> {
   
    return this.http.post(this.apiurl + `tasks.fetch_task&reload=1`, obj);
  }

  public fetchTaskComment(obj: any): Observable<any> {

    return this.http.post(this.apiurl + `comment.fetch`, obj);

  }

  public addTaskComment(obj: any, obj2: any): Observable<any> {
    return this.http.post(this.apiurl + `tasks.addComment&reload=1`, JSON.stringify({ taskID: obj, comment: obj2 }));
  }

  public updateTaskComment(obj: any, obj2: any): Observable<any> {
    return this.http.post(this.apiurl + `tasks.updateComment&reload=1`, JSON.stringify({ commentDescription: obj, commentID: obj2 }));
  }

  public addMachineReading(obj: any): Observable<any> {
    
    return this.http.post(this.apiurl + `machine.setMachineReadingData&reload=1`, obj);
  }

  public DeletemachineByid(obj: any): Observable<any> {
    return this.http.post(this.apiurl+ 'machine.deletemachineByid&reload=1', obj);
  }

  public adddesignation(obj: any): Observable<any> {
    // let employeeData = new FormData(obj);
    // employeeData.append('Company',obj);
    return this.http.post(this.apiurl + 'hr.add_designation&reload=1', obj);
  }
  public checkEmployeeCode(obj: any): Observable<any> {
    return this.http.post(this.apiurl + 'hr.checkEmployeeCode&reload=1', obj);
  }

  public employeeadd(obj: any): Observable<any> {
    // let employeeData = new FormData(obj);
    // employeeData.append('Company',obj);
    return this.http.post(this.apiurl + 'hr.add_employee&reload=1', obj);
  }
  public fetchemployee(): Observable<any> {

    return this.http.get<any>(this.apiurl + `hr.fetch_employee&reload=1`);
  }
  public getUserData(obj: any): Observable<any> {
    return this.http.post<any>(this.apiurl + `main.getUserData&reload=1`, obj);
  }
  public searchemployees(obj: any): Observable<any> {

    return this.http.post(this.apiurl + `hr.fetch_employee&reload=1`, obj);
  }

  public fetch_lookupdata(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `hr.getloockupdata&reload=1`, obj);
  }
  public fetch_headData(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `hr.getheadData&reload=1`, obj);
  }
  public fetch_bankName(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `hr.getBankName&reload=1`, obj);
  }
  public fetch_subheadData(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `hr.getsubheadData&reload=1`, obj);
  }
  public fetch_AllSubheadData(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `hr.getAllsubheaddata&reload=1`, obj);
  }
  public onGetSelectedBankName(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `hr.onGetSelectedBankName&reload=1`, obj);
  }
  public fetch_AllBankDetails(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `hr.getAllbankdata&reload=1`, obj);
  }
  public fetch_designation(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `hr.fetch_designation&reload=1`, obj);
  }

  public getEmployeeDetail(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `hr.getEmployee&reload=1`, obj);
  }

  public searchEmployeeByName(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `hr.searchEmployeeByName&reload=1`, obj);
  }

  public loadUsersData(obj: any): Observable<any> {
    return this.http.post(this.apiurl+ 'user_role.getUsersData&reload=1', obj);
  }
  public getEmployeeSelectedData(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `hr.getEmployeeSelectedData&reload=1`, obj);
  }
  public deleteemployee(obj: any): Observable<any> {
    let employeeData = new FormData();
    employeeData.append('EmployeeId', obj);
    return this.http.post(this.apiurl + `hr.delete_employee&reload=1`, employeeData);
  }
  public Updateemployee(obj: any): Observable<any> {
    // let employeeData = new FormData(obj);
    // employeeData.append('Company',obj);
    return this.http.post(this.apiurl + 'hr.update_employee&reload=1', obj);
  }

  public getEmployee(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `hr.getEmployee&reload=1`, obj);
  }

  public getTaskDetails(id: any): Observable<any> {
    return this.http.post(this.apiurl + `tasks.taskDetails&reload=1`, JSON.stringify({ taskID: id }));
  }

  public deleteitem(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `tasks.delete_task&reload=1`, JSON.stringify({ taskID: obj }));
  }
  public addImportFile(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `hr_attendance.importFile&reload=1`, obj)
  }
  public addWorkDiary(obj: any): Observable<any> {
    return this.http.post(this.apiurl + 'hr.add_daily_working&reload=1', obj);
  }
  public workdailydairydata(obj: any): Observable<any> {
    let list = new FormData();
    list.append('entry_id', obj);
    return this.http.post(this.apiurl + 'hr.Diarydata&reload=1', list);
  }
  public taskdata(obj: any): Observable<any> {
    let list = new FormData();
    list.append('taskId', obj);
    return this.http.post(this.apiurl + 'hr.taskdata&reload=1', list);
  }
  public notesdata(obj: any): Observable<any> {
    let list = new FormData();
    list.append('notes_id', obj);
    return this.http.post(this.apiurl + 'hr.notesdata&reload=1', list);
  }
  public visitordata(obj: any): Observable<any> {
    let list = new FormData();
    list.append('visitor_id', obj);
    return this.http.post(this.apiurl + 'hr.visitordata&reload=1', list);
  }
  public attachmentsdata(obj: any): Observable<any> {
    let list = new FormData();
    list.append('attachmeid_id', obj);
    return this.http.post(this.apiurl + 'hr.attachmentsdata&reload=1', list);
  }
  public reg_attachmentsdata(obj: any): Observable<any> {
    let list = new FormData();
    list.append('attachmeid_id', obj);
    return this.http.post(this.apiurl + 'hr.reg_attachmentsdata&reload=1', list);
  }
  public employeelist(obj: any): Observable<any> {
    return this.http.post(this.apiurl + 'hr.emplist&reload=1', obj);
  }
  public projectlist(obj: any): Observable<any> {
    return this.http.post(this.apiurl + 'hr.projectData&reload=1', obj);
  }
  public deleteDiary(obj: any): Observable<any> {
    let diaryId = new FormData();
    diaryId.append('entry_id', obj);
    return this.http.post(this.apiurl + 'hr.delete_daily_working&reload=1', diaryId);
  }
  public contractorList(obj: any): Observable<any> {
    return this.http.post(this.apiurl + 'hr.fetch_contractor&reload=1', obj);
  }
  public getAllVehiclesList(obj: any): Observable<any> {
    return this.http.post(this.apiurl + 'machine.getAllVehiclesList&reload=1', obj);
  }
  public getuserRole(obj: any): Observable<any> {
    return this.http.post(this.apiurl + 'hr.fetchuserRole&reload=1', obj);
  }
  public getMachineDetails(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `machine.getMachine&reload=1`, JSON.stringify({ readingID: obj }));
  }

  public deleteMachine(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `machine.deleteMachine&reload=1`, JSON.stringify({ readingID: obj }));
  }

  public getlookuptype(): Observable<any> {
    return this.http.get(this.apiurl + `machine.getlookuptype&reload=1`);
  }

  public getvechicalList(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `machine.getvechicalList&reload=1`, obj);
  }
  public getVehicleName(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `machine.getVehiclename&reload=1`, obj);
  }

  public getCompanySetup(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `hr.getCompanySetupDetails&reload=1`, JSON.stringify({ setupVariable: obj }));
  }
  public getCompanySetupemployee(obj: any, obj3: any): Observable<any> {
    return this.http.post(this.apiurl + `hr.getCompanySetupemployeeDetails&reload=1`, JSON.stringify({ setupVariable: obj, applicableVariable: obj3 }));
  }
  public getemployeeData(obj: any): Observable<any> {
    return this.http.post(this.apiurl + 'hr.edit_employee&reload=1', obj);
  }
  public getsalaryhitory(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `salary.Salary_historyDetails&reload=1`, obj);
  }
  public addsalaryhitory(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `salary.Salary_historyAdd&reload=1`, obj);
  }
  public getcalander(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `salary.getcalandersetup&reload=1`, obj);
  }

  public addvendorsalaryhitory(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `salary.vendorSalary_historyAdd&reload=1`, obj);
  }
  public addvehicleDetail(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `vehicle.add_vehicle&reload=1`, obj);
  }
  public getvendorsalaryDetails(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `salary.vendorSalaryDetails&reload=1`, obj);
  }

  public labousDetailsData(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `salary.LabourList&reload=1`, obj);
  }

  public MachinDetailsData(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `salary.MachinData&reload=1`, obj);
  }
  public fetchMachineDataById(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `machine.fetchMachineDataById&reload=1`, obj);
  }

  public getvendorList(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `salary.vendorList&reload=1`, obj);
  }
  public getVendorListReport(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `report.vendorList&reload=0`, obj);
  }
  public addAttendance(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `hr_attendance.add_attendance&reload=1`, obj)
  }
  public editAttendance(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `hr_attendance.editAttendance&reload=1`, obj)
  }

  public updateAssignee(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `tasks.update_Assigne&reload=1`, obj);
  }

  public updatetaskaction(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `tasks.update_task&reload=1`, obj);
  }

  public fetchTags(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `tasks.fetch_tags&reload=1`, obj);
  }
  public fetchTagsLists(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `tasks.fetchTagsLists&reload=1`, obj);
  }
  public fetchTaskTags(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `tasks.fetch_task_tags&reload=1`, obj);
  }
  public getEmployeebyRole(obj: any): Observable<any> {
    return this.http.post(this.apiurl + 'hr.getEmployeebyRole&reload=1', obj);
  }

  public getLabourPdf(obj: any): Observable<Blob> {
    //   const params= new HttpParams({
    //      fromObject:{
    //       DateFrom:'dateFrom',
    //       DateTo:'dateTo',
    //       VendorId:'vendorId',
    //       projectID:'projectID'

    //     }
    //   });
    //   const headers = new HttpHeaders(
    //     { 'Content-Type': 'text/plain',
    //     'token':sessionStorage.getItem('token')
    //   });
    //    const url="http://dev-api.divyaltech.com/dev-backend/index.cfm?action=report.reportpdf&reload=1"
    //   return this.http.post("",{params:params});
    // }

    return this.http.post(this.apiurl + 'report.reportpdf&reload=1', obj, { responseType: 'blob' });

  }
}
