import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, of } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
	providedIn: 'root'
})
export class ProductService {
	addProdData: any;

	addPRODData(PRODType: FormData) {
		throw new Error('Method not implemented.');
	}
	public apiurl = environment.APIEndpoint;
	constructor(private http: HttpClient) { }

	//.................item-masterservices.................//

	public fetch_khasradata(obj: any): Observable<any> {
		return this.http.post(this.apiurl + 'product.fetch_khasra&reload=1', obj);
	}

	public UpdateProductPrice(obj: any): Observable<any> {
		return this.http.post(this.apiurl + `product.UpdateProductPrice&reload=1`, obj);
	}

	public fetchitemList(): Observable<any> {
		return this.http.get<any>(this.apiurl + `product.fetch`);
	}

	public fetchitem(obj: any): Observable<any> {
		return this.http.post(this.apiurl + `product.get_item&reload=1`, JSON.stringify({ obj: obj }));
	}

	public addattachment(obj: any): Observable<any> {
		return this.http.post(this.apiurl + `product.add_attachment&reload=1`, obj);
	}
	public editSaveattachment(obj: any): Observable<any> {
		return this.http.post(this.apiurl + `product.edit_save_attachment&reload=1`, obj);
	}

	public deleteEnquiryattachment(obj: any): Observable<any> {
		return this.http.post(this.apiurl + `product.delete_reg_attachment&reload=1`, obj);
	}

	public additem(obj: any): Observable<any> {
		return this.http.post(this.apiurl + `product.add_item&reload=1`, obj);
	}

	public updateitem(obj: any): Observable<any> {
		return this.http.post(this.apiurl + `product.update_item&reload=1`, obj);
	}

	public searchitem(obj: any): Observable<any> {
		return this.http.post(this.apiurl + `product.fetch_item`, obj);
	}

	public deleteitem(itemgroupid: any): Observable<any> {
		return this.http.post(this.apiurl + `product.delete_item&reload=1`, JSON.stringify({ itemgroupid: itemgroupid }));
	}

	//.................End-item-masterservices.................//

	//.................product-masterservices.................//

	public getlookup(classify: any): Observable<any> {
		return this.http.post(this.apiurl + `product.get_Classifi&reload=1`, JSON.stringify({ classify }));
	}

	public getitemgroup(): Observable<any> {
		return this.http.get<any>(this.apiurl + `product.get_itemgroup&reload=1`);
	}

	public addproduct(obj: any): Observable<any> {
		return this.http.post(this.apiurl + `product.add_product&reload=1`, obj);
	}

	public addUnitOfMeasure(obj: any): Observable<any> {
		return this.http.post(this.apiurl + `product.addProductUnitOfMeasure&reload=1`, obj);
	}
	public deleteMeasure(obj: any): Observable<any> {
		return this.http.post(this.apiurl + `product.deleteProductUnitOfMeasure&reload=1`, obj);
	}

	public unitOfMeasureeditData(obj: any): Observable<any> {
		return this.http.post(this.apiurl + `product.UnitOfMeasureEditData&reload=1`, obj);
	}
	public addGSTData(obj: any): Observable<any> {
		return this.http.post(this.apiurl + `product.gsatSetupDataAdd&reload=1`, obj);
	}
	public GSTSetupData(obj: any): Observable<any> {
		return this.http.post(this.apiurl + `product.GSTSetupData&reload=1`, obj);
	}

	public deleteGST(obj: any): Observable<any> {
		return this.http.post(this.apiurl + `product.deleteGSTSetup&reload=1`, obj);
	}

	public fetchProductTypeList(obj: any): Observable<any> {
		return this.http.post(this.apiurl + `product.product_TypeList&reload=1`, obj);
	}

	public fetchProductUOMList(obj: any): Observable<any> {
		return this.http.post(this.apiurl + `product.product_UOMList&reload=1`, obj);
	}
	public fetchProductGroupList(obj: any): Observable<any> {
		return this.http.post(this.apiurl + `product.product_UOMList&reload=1`, obj);
	}
	public fetchProductCategoryList(obj: any): Observable<any> {
		return this.http.post(this.apiurl + `product.product_CategoryList&reload=1`, obj);
	}
	public addProductTypeData(obj: any): Observable<any> {
		return this.http.post(this.apiurl + `product.addProductType&reload=1`, obj);
	}
	public productData(obj: any): Observable<any> {
		return this.http.post(this.apiurl + `product.productGetAllsData&reload=1`, obj);
	}
	public getProductsAllData(obj: any): Observable<any> {
		return this.http.post(this.apiurl + 'product.getProductsAllData&reload=1',obj);
	}
	public visitorproductDetails(obj: any): Observable<any> {
		return this.http.post(this.apiurl + `CrmVisitorMangement.productlist&reload=1`, obj);
	}
	public deleteProduct(obj: any): Observable<any> {
		return this.http.post(this.apiurl + `product.deleteProductData&reload=1`, obj);
	}
	public addProdCategory(obj: any): Observable<any> {
		return this.http.post(this.apiurl + `product.addProductCategory&reload=1`, obj);
	}
	public editviewProdCategory(obj: any): Observable<any> {
		return this.http.post(this.apiurl + `product.fetch_EditCategoryData&reload=1`, obj);
	}
	public deleteProdCategory(obj: any): Observable<any> {
		return this.http.post(this.apiurl + `product.deleteproductCategory&reload=1`, obj);
	}
	public ProductTypeUpdateData(obj: any): Observable<any> {
		return this.http.post(this.apiurl + `product.ProductTypeUpdateData&reload=1`, obj);
	}
	public fetchProductTypeFiledList(obj: any): Observable<any> {
		return this.http.post(this.apiurl + `product.productAdditionalFiledList&reload=1`, obj);
	}
	public deleteproductType(obj: any): Observable<any> {
		return this.http.post(this.apiurl + `product.deleteProductTypeData&reload=1`, obj);
	}
	public fetchLookUpDataByID(obj: any): Observable<any> {
		return this.http.post(this.apiurl + `product.fetch_lookupDataByTypeID&reload=1`, obj);
	}
	public Stockdata(obj: any): Observable<any> {

		let list = new FormData();
		list.append('productId', obj);
		return this.http.post(this.apiurl + `stock.Stockdata&reload=1`, list);
	}
	public fetchProductname(obj: any): Observable<any> {
		return this.http.post(this.apiurl + `product.fetchproductname&reload=1`, obj);
	}
	public productlist(obj: any): Observable<any> {

		return this.http.post(this.apiurl + 'stock.productData&reload=1', obj);
	}
	public producttypelist(obj: any): Observable<any> {

		return this.http.post(this.apiurl + 'stock.productTypeData&reload=1', obj);
	}
	public addMore(obj: any): Observable<any> {

		return this.http.post(this.apiurl + 'product.addmore&reload=1', obj);
	}
	public updateMeasuredPlotDetails(obj: any): Observable<any> {

		return this.http.post(this.apiurl + 'product.updateMeasurePlots&reload=1', obj);
	}
	public getLandLordsLists(obj:any): Observable<any> {
		return this.http.post(this.apiurl + 'reg_landlords.getLandLordsLists&reload=1', obj);
	}
	// public godownDatalist(obj: any): Observable<any>{

	//   return this.http.post(this.apiurl + 'stock.godownDatalist&reload=1', obj);
	// }
	public updatePlotRate(obj:any): Observable<any> {
		return this.http.post(this.apiurl+ 'product.updatePlotRate&reload=1',obj);
	}

	public updatePlot(obj:any): Observable<any> {
		return this.http.post(this.apiurl + 'product.updatePlot&reload=1',obj);
	}

	public getRawKhasraList(obj: any): Observable<any> {
		return this.http.post(this.apiurl + 'product.getRawKhasraLists&reload=1',obj);
	}


}
