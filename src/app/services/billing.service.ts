import { Injectable } from '@angular/core';
import {HttpClient,HttpHeaders,HttpRequest} from '@angular/common/http';
import { Observable,from,of } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BillingService {


  public apiurl = environment.APIEndpoint;
  constructor(private http: HttpClient) { }



  public get_erpstageStatus(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `booking.fetch_erp_stages_status&reload=1`, obj);
  }
  
  public addlandlorddetails(obj: any): Observable<any> {
    
    return this.http.post(this.apiurl + `reg_landlords.add_landlordDetail&reload=1`, obj);
  }
  public addMoreNominee(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `reg_landlords.addmorenominee&reload=1`, obj);
  }
  public getlandlorddetails(obj: any): Observable<any> {
   
    return this.http.post(this.apiurl + `reg_landlords.getlandlordDetail&reload=1`, obj);
  }
  public export_to_excel(obj: any): Observable<any> {
   
    return this.http.post(this.apiurl + `reg_landlords.getlandlordDetail&reload=1`, obj);
  }

  public deletelandlorddetails(obj: any): Observable<any> {
 
    return this.http.post(this.apiurl + `reg_landlords.delete_landlordDetail&reload=1`, obj);
  }
  
  public addBankDetails(obj: any): Observable<any> {
  
    return this.http.post(this.apiurl + `reg_landlords.add_BankDetails&reload=1`, obj);
  }
  public add_attorneyDetails(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `reg_landlords.add_AttorneyDetail&reload=1`, obj);
  }
  public getAttorneydata(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `reg_landlords.getAttorneydata&reload=1`, obj);
  }

  public deleteAttorneydata(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `reg_landlords.delAttorneydata&reload=1`, obj);
  }
  public getbankdata(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `reg_landlords.getBankDetail&reload=1`, obj);
  }

  public deletebankdata(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `reg_landlords.delBankDetails&reload=1`, obj);
  }


  public add_BookingDetail(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `booking.addbooking&reload=1`, obj);
  }
  public updated_BookingDetail(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `booking.updatebooking&reload=1`, obj);
  }
  public update_PaidAmount(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `booking.updatePaidAmount&reload=1`, obj);
  }
  public setRegFncAmounts(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `booking.setRegFncAmounts&reload=1`, obj);
  }
  public getAllPaidAmntValue(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `booking.getAllPaidAmounts&reload=1`, obj);
  }


  public update_BookingDetail(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `booking.fetchPersonDetails&reload=1`, obj);
  }
  public add_landDetail(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `reg_landDetails.add_landdetails&reload=1`, obj);
  }
  public fetch_regdata(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `booking.fetch_booking&reload=1`, obj);
  }
  // public fetch_regdataToExcel(obj: any): Observable<any> {
  //   return this.http.post(this.apiurl + `booking.excel_bookingdata&reload=1`, obj);
  // }
  public getOnlySellerData(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `booking.getOnlySellerData&reload=1`, obj);
  }

  public deleteitem(obj:any):Observable<any>{
    
    return this.http.post(this.apiurl+`booking.delete_removeRegistryData&reload=1`,obj);
  }
  public deleteitemm(obj:any):Observable<any>{
    
    return this.http.post(this.apiurl+`booking.delete_removeRegistryPerson&reload=1`,obj);
  }

  public getCrmPLotData(obj:any):Observable<any>{
    
    return this.http.post(this.apiurl+`booking.fetch_regPlotsData&reload=1`,obj);
  }


  public addPaymentDetail(obj:any): Observable<any>{
    return this.http.post(this.apiurl + `transaction.add_transaction&reload=1`, obj);
  }
  public addDonePaymentDetail(obj:any): Observable<any>{
    return this.http.post(this.apiurl + `transaction.add_done_transaction&reload=1`, obj);
  }

  public deletePaymentDetail(obj:any): Observable<any>{
    return this.http.post(this.apiurl + `transaction.delete&reload=1`, obj);
  }
  public deleteExpenseDetail(obj:any): Observable<any>{
    return this.http.post(this.apiurl + `transaction.deleteExpense&reload=1`, obj);
  }
  public deleteLogDetail(obj:any): Observable<any>{
    return this.http.post(this.apiurl + `transaction.deleteLogbyId&reload=1`, obj);
  }
  public bulkDeleteLogDetails(obj:any): Observable<any>{
    return this.http.post(this.apiurl + `transaction.deleteMultipleLogs&reload=1`, obj);
  }
  public deleteICMDetail(obj:any): Observable<any>{
    return this.http.post(this.apiurl + `transaction.deleteICMValue&reload=1`, obj);
  }
  public deletePaymentPlan(transaction_id:any): Observable<any>{
    return this.http.post(this.apiurl + `regPayment.deletePlan&reload=1`, JSON.stringify({transaction_id: transaction_id}));
  }

  public wabridge(mob: any,visitProdID:any,visitDate:any): Observable<any>{
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { mob: mob, visitProdID:visitProdID ,visitDate:visitDate };
    return this.http.post(this.apiurl + 'regPayment.wabridge&reload=1', JSON.stringify(body), { headers });
  }

  public getTotaAmntFromIN(obj:any): Observable<any>{
    return this.http.post(this.apiurl + `transaction.getAmountDifference&reload=1`, obj);
  }
  public deductFromInAmnt(obj:any): Observable<any>{
    return this.http.post(this.apiurl + `transaction.deductFromInAmnt&reload=1`, obj);
  }
  public updateForCashOnly(obj:any): Observable<any>{
    return this.http.post(this.apiurl + `transaction.updateForCashOnly&reload=1`, obj);
  }


  public add_edit_buyer_seller_witness(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `booking.AddPersonDetails&reload=1`, obj);
  }
  public fetch_StagesData(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `booking.getStageslist&reload=1`, obj)
  }
  public fetch_TopThreeStagesData(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `booking.fetch_TopThreeStagesData&reload=1`, obj)
  }
  public fetch_StagesStatusData(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `booking.getStatuslist&reload=1`, obj)
  }
  public get_PaymentPlan(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `booking.getpaymentplanlist&reload=1`, obj)
  }
  public get_bookingListToExcel(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `booking.getBokkingListtoExcel&reload=1`, obj)
  }
  public getRegRecToExcel(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `booking.getRegRecListtoExcel&reload=1`, obj)
  }
  public getBalSheetlist(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `booking.getBalanceExcel&reload=1`, obj)
  }
  public fetch_PaymentStatus(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `booking.getpaymentstatuslist&reload=1`, obj)
  }

  public view_buyer_seller_witness(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `booking.fetchPersonDetails&reload=1`, obj)
  }
  public view_PaymentDetail(id:any):Observable<any>{
    return this.http.post(this.apiurl + `transaction.viewPaymentdetails&reload=1`, JSON.stringify({payDetailId:id }))
  }

  public AddTransationsDetails(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `reg_landlords.Add_regTransations&reload=1`, obj);
  }
  public addattachment(obj:any):Observable<any>{
		return this.http.post(this.apiurl+`project.add_attachment&reload=1`,obj);
	}

  public getBuyerInfo(obj:any):Observable<any>{
    return this.http.post(this.apiurl+`reg_landDetails.fetch_buyerDetails&reload=1`,obj)
  }
  public getSellerInfo(obj:any):Observable<any>{
    return this.http.post(this.apiurl+`reg_landDetails.fetch_buyerDetails&reload=1`,obj);
  }
  public getRegData(obj:any):Observable<any>{
    return this.http.post(this.apiurl+`booking.getData&reload=1`,obj);
  }
  public getBuyerData(obj:any):Observable<any>{
    return this.http.post(this.apiurl+`CrmTaskManagement.getBuyerData&reload=1`,obj);
  }

  public updatebookingBuyerSeller(obj:any):Observable<any>{
    return this.http.post(this.apiurl+`booking.updatebookingBuyerSeller&reload=1`,obj);
  }
  public addPaymentPlan(obj:any):Observable<any>{
    return this.http.post(this.apiurl+`.regPayment.addPaymentPlan&reload=1`,obj);
  }
  public updatePaymentFollowUp(obj:any):Observable<any>{
    return this.http.post(this.apiurl+`.regPayment.updatePaymentFollowUp&reload=1`,obj);
  }
  public fetchPaymentPlan(obj:any):Observable<any>{
    return this.http.post(this.apiurl+`.regPayment.fetch_paymentPlan&reload=1`,obj);
  }
  public view(obj:any):Observable<any>{
    return this.http.post(this.apiurl+`.regPayment.view&reload=1`,obj);
  }
  public checkview(obj:any):Observable<any>{
    return this.http.post(this.apiurl+`.regPayment.checkview&reload=1`,obj);
  }
  public viewBankDetails(obj:any):Observable<any>{
    return this.http.post(this.apiurl+`.accounts.view_fetch_bankAccounts&reload=1`,obj);
  }
  public deleteAccounts(obj:any):Observable<any>{
    return this.http.post(this.apiurl+`.accounts.delete_fetch_bankAccounts&reload=1`,obj);
  }
  public add_bankDetailsdata(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `booking.add_bankdataDetails&reload=1`, obj);
  }
  public edit_bankDetailsdata(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `booking.edit_bankdataDetails&reload=1`, obj);
  }
  public editcheque(obj: any):Observable<any> {
    return this.http.post(this.apiurl+'cheque_list.getedit&reload=1',obj);
  }
  public  updatecheque(obj: any):Observable<any> {
    return this.http.post(this.apiurl+'cheque_list.cheque_update&reload=1',obj);
  }
  public  getAvailableAmounts(obj: any):Observable<any> {
    return this.http.post(this.apiurl+'transaction.getAllTransAmounts&reload=1',obj);
  }
  public  getSelectedBankAmounts(obj: any):Observable<any> {
    return this.http.post(this.apiurl+'transaction.getSelectedBankAmnts&reload=1',obj);
  }
  public  SaveTransValues(obj: any):Observable<any> {
    return this.http.post(this.apiurl+'transaction.savetransLists&reload=1',obj);
  }
  public  SaveExpTransValue(obj: any):Observable<any> {
    return this.http.post(this.apiurl+'transaction.saveExptransLists&reload=1',obj);
  }
  public  SaveIcmDetails(obj: any):Observable<any> {
    return this.http.post(this.apiurl+'transaction.saveIcmDataLists&reload=1',obj);
  }
  public  updateStatusAmt(obj: any):Observable<any> {
    return this.http.post(this.apiurl+'transaction.saveStatusAmnt&reload=1',obj);
  }
  public checkAmountValidation(obj:any): Observable<any> {
    return this.http.post(this.apiurl+'transaction.checkAmountValidation&reload=1',obj);
  }
  public  getLogs(obj: any):Observable<any> {
    return this.http.post(this.apiurl+'transaction.getLogsData&reload=1',obj);
  }
  public getBlockPlotsLists(obj: any):Observable<any> {
    return this.http.post(this.apiurl+'transaction.getBlockPlotsLists&reload=1',obj);
  }
  public getAvailableCashValue(obj: any):Observable<any> {
    return this.http.post(this.apiurl+'transaction.getAvaCashByid&reload=1',obj);
  }
  public getCustCheqeList(obj:any): Observable<any> {
    return this.http.post(this.apiurl+'transaction.getCustChequeList&reload=1', obj);
  }
  public saveBankDetails(obj:any): Observable<any> {
    return this.http.post(this.apiurl+'transaction.saveBankDetails&reload=1', obj);
  }
  public savePartyToIN(obj:any): Observable<any> {
    return this.http.post(this.apiurl+'transaction.savePartyToIN&reload=1', obj);
  }
  public savePartyToOUT(obj:any): Observable<any> {
    return this.http.post(this.apiurl+'transaction.savePartyToOUT&reload=1', obj);
  }
  public addPartyAmountToAvaCash(obj:any): Observable<any> {
    return this.http.post(this.apiurl+'transaction.addPartyAmountToAvaCash&reload=1', obj);
  }
  public subtractPartyAmountFromAvaCash(obj:any): Observable<any> {
    return this.http.post(this.apiurl+'transaction.subtractPartyAmountFromAvaCash&reload=1', obj);
  }
  public getAllBankData(obj:any): Observable<any> {
    return this.http.post(this.apiurl+'transaction.gettingBanksData&reload=1', obj);
  }
  public getAllPaymentDetails(obj:any): Observable<any> {
    return this.http.post(this.apiurl+'transaction.fetchPaymentDetailsTLOnly&reload=1', obj);
  }
  public bulkDelete(obj:any): Observable<any> {
    return this.http.post(this.apiurl+'transaction.bulkDelete&reload=1', JSON.stringify({obj}));
  }
  public generateReport(obj:any): Observable<any> {
    return this.http.post(this.apiurl+`transaction.generateReport&reload=1`, obj);
  }
  public generateSeparateExpReport(obj:any): Observable<any> {
    return this.http.post(this.apiurl+`transaction.generateSeparateExpReport&reload=1`, obj);
  }
  public generateSeparateIncReport(obj:any): Observable<any> {
    return this.http.post(this.apiurl+`transaction.generateSeparateIncReport&reload=1`,obj);
  }
  public getINDataById(obj:any): Observable<any> {
    return this.http.post(this.apiurl+'transaction.getINDataById&reload=1',obj);
  }
}
