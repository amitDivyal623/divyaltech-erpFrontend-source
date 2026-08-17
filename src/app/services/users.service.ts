import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { user } from '../models/user.model';
import { from, Observable } from 'rxjs';
import * as uuid from 'uuid';
import { environment } from 'src/environments/environment';



@Injectable({
  providedIn: 'root'
})

export class UsersService {
  users : user [] =
  [
   { 
    
    id : 1,
    fullname : "Deepesh Gupta",
    username: "firstuser",
    phone : 466512655,
    email : "exmple1@gmail.com"

   },

   
   { 
    id : 2,
    fullname : "amit Gupta",
    username: "seconduser",
    phone : 4561156655,
    email : "exmple2@gmail.com"

   }
]

  

  constructor( private http: HttpClient ) { }
  public apiurl = environment.APIEndpoint;
  User(id: number){
    return this.users.find(x=>x.id === id);
  }

  onget(){
    return this.users;
  }
    
 
  save(user : user){
    if(user.id){
      let olduser= this.users.find(x=>x.id === user.id);
      olduser =  user;
    }
    else{
    user.id = uuid.v4();
     this.users.push(user)
    }

  }

  delete(user: user){
    var index = this.users.indexOf(user);
    this.users.splice(index, 1);
  
  }

  ongetjson() : Observable<user> {
    return this.http.get<user>("assets/data.json");
  }

  public employeeadd(obj:any):Observable<any>{
    // let employeeData = new FormData(obj);
     // employeeData.append('Company',obj);
     return this.http.get(this.apiurl + 'hr.add_employee&reload=1',obj);
   }
}
