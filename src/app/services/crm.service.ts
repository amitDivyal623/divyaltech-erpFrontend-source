import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, of } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CrmService {
  public apiurl = environment.APIEndpoint;
  constructor(private http: HttpClient) { }

  public fetchTaskList(): Observable<any> {

    return this.http.get<any>(this.apiurl + `tasks.fetch`);
  }

  public searchTask(obj: any): Observable<any> {

    return this.http.post(this.apiurl + `tasks.search`, obj);
  }

  public addTaskbookreg(obj: any): Observable<any> {

    return this.http.post(this.apiurl + `tasks.search`, obj);
  }

  public fetchTaskComment(obj: any): Observable<any> {

    return this.http.post(this.apiurl + `comment.fetch`, obj);
  }

  public addCrmCustomerMngmt(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `crm.add_CrmCustomerDetail&reload=1`, obj);
  }

  public fetch_StagesStatusData(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `booking.getStatuslist&reload=1`, obj)
  }

  public UpdateCrmCustomerMngmt(obj: any): Observable<any> {

    return this.http.post(this.apiurl + `crm.update_crmCustomer`, obj);
  }

  public deleteCrmCustomerMngmt(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `crm.delete_crmCustomer&reload=1`, obj);
  }

  public checkCustomerDeleteImpact(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `crm.checkDeleteImpact&reload=1`, obj);
  }

  public getCrmCustomerMngmt(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `crm.CrmCustomer_details&reload=1`, obj);


  }
  public export_to_excel(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `crm.VisitExportData&reload=1`, obj);
  }

  public export_visitor_details(obj: any): Observable<any> {
    return this.http.post(this.apiurl + 'crm.export_visitor_details&reload=1', obj);
  }

  public getVisitedPlotsDetails(obj: FormData): Observable<any> {
    return this.http.post(this.apiurl + 'CrmTaskManagement.getVisitedPlotsDetails&reload=1', obj);
  }
  public fetchCrmCustomerMngmt(obj: any): Observable<any> {

    return this.http.post(this.apiurl + `crm.fetch_CrmCustomerMngmt&reload=1`, obj);
  }

  public searchCrmCustomerMngmt(obj: any): Observable<any> {

    return this.http.post(this.apiurl + `crm.fetch_CrmCustomerMngmt&reload=1`, obj);
  }

  public addCrmVisitorMngmt(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `CrmVisitorMangement.add_CrmVisitorDetail&reload=1`, obj);
  }

  public deleteCrmVisitorMngmt(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `CrmVisitorMangement.deleteVisitor&reload=1`, obj);
  }

  public getCrmVisitorMngmt(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `CrmVisitorMangement.get_crmVisitor&reload=1`, obj);
  }

  public addCrmNotes(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `CrmEnquiryDetails.add_Notes&reload=1`, obj);
  }

  public addCrmFiles(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `CrmEnquiryDetails.add_Files&reload=1`, obj);
  }

  public addCrmEnquiryMngmt(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `CrmEnquiryDetails.addenquiry&reload=1`, obj);
  }

  public deleteCrmEnquiryMngmt(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `CrmEnquiryDetails.deleteenquiry&reload=1`, obj);
  }

  public getCrmEnquiryMngmt(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `CrmEnquiryDetails.get_crmEnquiry&reload=1`, obj);
  }
  public getBookedPlotDetails(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `booking.getBookedPlotDetails&reload=1`, obj);
  }


  public getEmployee(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `CrmTaskManagement.getEmployee&reload=1`, obj);
  }

  public getEmployeeAndContact(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `CrmTaskManagement.getEmployeeAndContact&reload=1`, obj);
  }

  public fetch_lookupdata(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `CrmTaskManagement.getloockupdata&reload=1`, obj);
  }

  public getTaskAction(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `CrmTaskManagement.getTaskActions&reload=1`, obj);
  }

  public deleteitem(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `CrmTaskManagement.delete_task&reload=1`, JSON.stringify({ taskID: obj }));
  }
  public deleteFile(obj: any): Observable<any> {
    return this.http.post(this.apiurl + 'filemgmt.deleteFile&reload=1', JSON.stringify({ id: obj }));
  }

  public addTask(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `tasks.add_task&reload=1`, obj);
  }
  public saveTaskDetails(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `tasks.save_tasks&reload=1`, obj);
  }

  public updateTask(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `tasks.update_task_details&reload=1`, obj);
  }

  public getTaskDetails(id: any): Observable<any> {
    return this.http.post(this.apiurl + `CrmTaskManagement.taskDetails&reload=1`, JSON.stringify({ taskID: id }));
  }

  public getVisitedPlots(taskId: any, enquiryId?: any, selectedPlotShownBy?: any): Observable<any> {
    const payload: any = { taskID: taskId };

    if (enquiryId !== undefined && enquiryId !== null) {
      payload.enquiry_id = enquiryId;
    }

    if (selectedPlotShownBy !== undefined && selectedPlotShownBy !== null) {
      payload.selectedPlotShownBy = selectedPlotShownBy;
    }

    return this.http.post(this.apiurl + 'CrmTaskManagement.getVisitedPlots&reload=1', JSON.stringify(payload));
  }

  public updateDescription(obj: any, obj2: any): Observable<any> {
    return this.http.post(this.apiurl + `CrmTaskManagement.update_description&reload=1`, JSON.stringify({ taskID: obj2, description: obj }));
  }

  public updatefollowup(obj: any, obj2: any): Observable<any> {
    return this.http.post(this.apiurl + `CrmTaskManagement.update_followup&reload=1`, JSON.stringify({ taskID: obj2, follwoupDetails: obj }));
  }

  public updateTitle(obj: any, obj2: any): Observable<any> {
    return this.http.post(this.apiurl + `CrmTaskManagement.update_title&reload=1`, JSON.stringify({ taskID: obj2, title: obj }));
  }

  public addTaskComment(obj: any, obj2: any): Observable<any> {
    return this.http.post(this.apiurl + `CrmTaskManagement.addComment&reload=1`, JSON.stringify({ taskID: obj, comment: obj2 }));
  }

  public updateTaskComment(obj: any, obj2: any): Observable<any> {
    return this.http.post(this.apiurl + `CrmTaskManagement.updateComment&reload=1`, JSON.stringify({ commentDescription: obj, commentID: obj2 }));
  }

  public updateTaskStatus(obj: any, obj2: any): Observable<any> {
    return this.http.post(this.apiurl + `tasks.statusUpdate&reload=1`, JSON.stringify({ taskID: obj2, status: obj }));
  }
  public deleteEnquiryNotes(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `project.deltes_Notes&reload=1`, obj);
  }
  public deleteEnquiryattachment(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `project.delete_attachment&reload=1`, obj);
  }
  public getCustomerEnquiry(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `CrmEnquiryDetails.getCrmEnquiryId&reload=1`, obj);
  }
  public getproduct(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `CrmVisitorMangement.product_datalist&reload=1`, obj);
  }

  public getAllVisitedPlots(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `CrmVisitorMangement.get_all_visited_plots&reload=1`, obj);
  }
  public getregproduct(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `CrmVisitorMangement.reg_product_datalist&reload=1`, obj);
  }
  public getEmployeeDetail(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `CrmVisitorMangement.getAllEmpDataLists&reload=1`, obj);
  }
  public getCustomerDetail(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `CrmVisitorMangement.getCustomerDetail&reload=1`, obj);
  }
  public searchCustomerByNameOrPhone(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `CrmVisitorMangement.searchCustomerByNameOrPhone&reload=1`, obj);
  }
  public getRegisteredCustomerLists(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `CrmVisitorMangement.getRegCustomerLists&reload=1`, obj);
  }
  public gettaskresult(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `CrmTaskManagement.getTaskResult&reload=1`, obj);
  }
  public getBuyerData(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `CrmTaskManagement.getBuyerDetail&reload=1`, obj);
  }
  public getCustomerById(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `CrmVisitorMangement.getCustomerById&reload=1`, obj);
  }
  public getEnquiryModeList(obj: any): Observable<any> {
    return this.http.post(this.apiurl + 'crm.getEnquiryModeList&reload=1', obj);
  }
  public getMarketingteamsLists(obj: any): Observable<any> {
    return this.http.post(this.apiurl + 'crm.getMarketingteamsLists&reload=1', obj);
  }

  public generateFullReport(obj: any): Observable<any> {
    return this.http.post(this.apiurl + 'CrmEnquiryDetails.generateFullReport&reload=1', obj);
  }
  public getAllPaidCustomersLists(obj:any): Observable<any> {
    return this.http.post(this.apiurl + 'booking.getAllPaidCustomersLists&reload=1',obj);
  }
  public getEnquiryIdFromBuyerId(obj:any): Observable<any> {
    return this.http.post(this.apiurl + 'booking.getEnquiryIdFromBuyerId&reload=1',obj);
  }
}
