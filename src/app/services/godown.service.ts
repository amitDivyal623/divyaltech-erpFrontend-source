import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable,from,of,Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GodownService {
  private subject = new Subject<any>();
  public apiurl = environment.APIEndpoint;
  constructor(private http: HttpClient) { }

  public addGodownMngmt(obj:any):Observable<any>{
    return this.http.post(this.apiurl+`godown.add_GodownDetail&reload=1`,obj);
  }
  sendClickEvent() {
    this.subject.next();
    
  }
  getClickEvent(): Observable<any>{ 
    return this.subject.asObservable();
  }
  // public Godowndata(obj:any):Observable<any>{
  //   let list = new FormData();
  //   list.append('entry_id',obj);
  //   return this.http.post(this.apiurl + 'godown.Godowndata&reload=1',list);
  // }
  get_godown_details():Observable<any>
  {
    return this.http.get(this.apiurl + 'godown.Godown_datalist&reload=1');
  }
  
  public Godowndata(obj:any):Observable<any>{
    
    let list = new FormData();
    list.append('GodownId',obj);
    return this.http.post(this.apiurl + 'godown.Godowndata&reload=1',list);
  }
  public Godown_datalist():Observable<any>{
    return this.http.post(this.apiurl + 'godown.Godowndata&reload=1', '');
  }

 delete_godown(obj:any):Observable<any>{
    
    let list = new FormData();
    list.append('godownId',obj);
    
    return this.http.post(this.apiurl + 'godown.godown_delete&reload=1',list);
    
    // return  this.http.get('https://jsonplaceholder.typicode.com/posts/1');
    
  }
}
