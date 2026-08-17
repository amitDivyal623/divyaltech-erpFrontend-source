import { Component, OnInit, OnDestroy, ViewChild} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient ,HttpHeaders, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProductService } from '../../services/product.service';
class DataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}
class product_stk {
  search_product: string;
}
@Component({
  selector: 'app-product-stockmang',
  templateUrl: './product-stockmang.component.html',
  styleUrls: ['./product-stockmang.component.scss']
})
export class ProductStockmangComponent implements OnInit, OnDestroy {

  [x: string]: any;
    private destroy$ = new Subject<void>();
    DatatableParameter = { search_product : '',search_producttype : '',search_godown : ''};
    constructor(private http:HttpClient,private productservice: ProductService) {}
  dtOptions: DataTables.Settings = {};

   @ViewChild('stockModal') stockModal;
    data: product_stk[];

  addStockDetails = new FormGroup({
    add_product: new FormControl(''),
    add_ProductType: new FormControl(''),
    add_godown: new FormControl(''),
    stock_quantity: new FormControl(''),
    lastupdated_date: new FormControl(''),
  });
  searchStock = new FormGroup({
    search_product: new FormControl(''),
    search_producttype: new FormControl(''),
    search_godown: new FormControl(''),
  })

  minDate = {year: 1900, month: 1, day: 1};
  maxDate = {year: 2099, month: 12, day: 31};

  ngOnInit(): void {
    this.Stockdatatable();
    this.productlist();
    this.producttypelist();
    //this.godownDatalist();
    if(sessionStorage.getItem('UserRole') == 'CRM User'){
      this.CrmUserRole = true;
    }
    this.CRMAdmin = false;
    if (sessionStorage.getItem('UserRole') == 'CRM Admin') {
      this.CRMAdmin = true;
    }

  }
  public openstockmodal(){
    this.stockModal.nativeElement.click();

  }
  Stockdatatable() {
        
        this.DatatableParameter.search_product = this.searchStock.get('search_product').value;
        this.DatatableParameter.search_producttype = this.searchStock.get('search_producttype').value;
        this.DatatableParameter.search_godown = this.searchStock.get('search_godown').value;

        const that = this;
        const headers = new HttpHeaders({ 'Content-Type': 'text/plain'});
        this.dtOptions = {
            processing: true,
            serverSide: true,
            dom: 'lrtip',
            lengthMenu:[[5, 10, 25, 50], [5, 10, 25, 50]],
            // columnDefs: [
            //     { orderable: false, targets: 9 }
            // ],
            ajax: (dataTablesParameters: any, callback) => {
                Object.assign(dataTablesParameters, this.DatatableParameter);
              that.http.post<DataTablesResponse>(environment.APIEndpoint + 'stock.fetch_StockList&reload=1', Object.assign(dataTablesParameters, this.DatatableParameter), { responseType: 'json', headers }).pipe(takeUntil(this.destroy$)).subscribe(resp => {
                 
                    that.data=resp.data;
                    
                    callback({recordsTotal: resp.recordsTotal,recordsFiltered: resp.recordsTotal,data: []});
                });
            }
        };
  }

  editStock(productId) {
        
        //this.addCrmGodown.controls['add_product'].disable();
        this.addStockDetails.get('add_product').disable();
        this.addStockDetails.get('add_ProductType').disable();
        this.addStockDetails.get('add_godown').disable();
        this.addStockDetails.get('lastupdated_date').disable();
        this.productservice.Stockdata(productId).pipe(takeUntil(this.destroy$)).subscribe((Response) =>{
                this.heading = "Edit Stock"
                
                
                this.stock_quantity = Response.DATA[0][0];
                this.openstockmodal();
        });
  }
  productlist(){
      let productlist = new FormData();
      productlist.append('CompanyId',sessionStorage.getItem('CompanyId'));
      this.productservice.productlist(productlist).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
        this.resProduct = Response.data
        
      });
  }
  producttypelist(){
      let producttypelist = new FormData();
      producttypelist.append('CompanyId',sessionStorage.getItem('CompanyId'));
      this.productservice.producttypelist(producttypelist).pipe(takeUntil(this.destroy$)).subscribe(Response =>{
        this.resProductType = Response.data
        
      });
  }
  // godownDatalist(){
  //     let godownDatalist = new FormData();
  //     godownDatalist.append('CompanyId',sessionStorage.getItem('CompanyId'));
  //     this.productservice.godownDatalist(godownDatalist).subscribe(Response =>{
  //     this.resgodownData = Response.data

  //     });
  // }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}

