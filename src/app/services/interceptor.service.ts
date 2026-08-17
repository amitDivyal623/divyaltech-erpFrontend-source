import {HttpEvent, HttpInterceptor,HttpHandler,HttpRequest,HttpResponse,HttpErrorResponse } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';

import { map, retry, catchError,filter } from 'rxjs/operators';
import { Router ,ActivatedRoute  } from '@angular/router';
import { environment } from 'src/environments/environment';
import { SecurityService } from '../shared/services/encrypt-decrypt';
import { Injectable } from '@angular/core';

@Injectable()
export class InterceptorService implements HttpInterceptor {
	public apiurl = environment.APIEndpoint;
	url;
	constructor(
        private _security: SecurityService
    ){}

	writeContents(content, __filename, contentType) {
		
		var a = document.createElement('a');
		var file = new Blob([content], {type: contentType});
		window.open(URL.createObjectURL(file)) ;
		a.href = URL.createObjectURL(file);
		a.download = __filename;
		a.click();
	
	  }

	intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		let token = sessionStorage.getItem('token');
		let chk_flg = true;
		if (request.url !== this.apiurl+'login.login&reload=1')
		{
			request = request.clone({ headers: request.headers.set('Authorization', `Bearer ${ (token != null )? token : '' }`)});
		}
		
		 request = request.clone({ headers: request.headers.set('Access-Control-Allow-Origin', "*")});
		 request = request.clone({ headers: request.headers.set('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')});
		 request = request.clone({ headers: request.headers.set('Access-Control-Allow-Headers', "*")});
		 request = request.clone({responseType: "text"});
		 
		if (request.body instanceof FormData){
			var formdata:any = request.body;
			for (var value of formdata.values()) {
				if (value instanceof File){
					chk_flg = false;
				}
			}
		}
		if (chk_flg == true){
			request = request.clone({ body: this._security.encrypt(request.body)});
		}
		
		
	  	return next.handle(request).pipe(
			//filter(event => event instanceof HttpResponse && request.url.includes('format')),
			map((event: HttpEvent<any>) => {
                if (event instanceof HttpResponse) {
					try {
						// console.log("event",event); image/png;charset=UTF-8
						//let blobresponse = new Blob([event.blob()], {type: '.xlsx'});
						// const blob = new Blob([event.blob()], { type: '.xlsx' });
						//console.log(blobresponse);
						var response;
                       	if(event.headers.get('Content-Type') != "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" &&
						   event.headers.get('Content-Type') != "application/pdf" && event.headers.get('Content-Type') != "image/png;charset=UTF-8"){
							 response = this._security.decrypt(event.body.trim());
						}
						else{
							var respdata = {
								"Content": event.headers.get('Content-Type'),
								"Size": event.headers.get('Content-Length')              
							}
							response = respdata;
						
						}

						
						
						if((response instanceof Array && response[0].RESPONSELOGIN == 500) || response.RESPONSELOGIN == 500){
							// sessionStorage.clear();
							// window.location.href=environment.Error;
						} else {
							return (new HttpResponse({ status: 200, body: response}));
						}
					} catch (e) {
						console.log(e);
					}
				}
            }),
		  	retry(1),
		  	catchError((error: HttpErrorResponse) => {   
				let errorMessage = '';
   
				if (error.error instanceof ErrorEvent) {
				// client-side error
					errorMessage = `Error: ${error.error.message}`;
				} else {
				// server-side error
					errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
				}
				//window.alert(errorMessage);

				// if(this.url[0] == 'http://erp.divyaltech.com'){
				// 	window.location.href='http://erp.divyaltech.com/#/error';
				// }else{
				// 	window.location.href ='http://localhost:4200/#/error'
				// }

				 return throwError(errorMessage);
   
		  	})
   
		)
   
	}
   
}



