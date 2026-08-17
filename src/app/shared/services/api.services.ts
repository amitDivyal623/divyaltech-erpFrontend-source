import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError,timeout,retry,map } from 'rxjs/operators';
import { Observable,throwError } from 'rxjs';
import { SecurityService } from './encrypt-decrypt';


@Injectable({providedIn: 'root'})
export class ApiService{
    timeCount = 30000;

    constructor(
        private http: HttpClient,
        private _security: SecurityService,
        private _router:Router,
    ){}

    get(...args:any[]):Observable<any>{

        const url = args[0]? `${args[0]}`: ''

        return this.http.get(url,{
            observe: 'body',
            responseType: 'text'
        }).pipe(
                map(res=>this._security.decrypt(res)),
                timeout(this.timeCount)
                
    )}


    post(...args:any[]):Observable<any>{
        const url = args[0]? `${args[0]}`: '';
        const cipherText = this._security.encrypt(args[1]);
        const payload = cipherText;
        return this.http.post(url,payload,{
            observe: 'body',
            responseType: 'text',
            reportProgress: true,
            headers: new HttpHeaders({
                'Content-Type': 'text/plain;charset=Utf-8',
                'Accept': 'text/plain;charset=Utf-8',
            })
        }).pipe(
            map(res=>this._security.decrypt(res)),
            timeout(this.timeCount)
        )}
        
}