import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserActivityService {

  private apiurl = environment.APIEndpoint;
  private sessionIdKey = 'erp_session_id';

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  public getSessionId(): string {
    let sessionId = sessionStorage.getItem(this.sessionIdKey);

    if (!sessionId) {
      sessionId = this.generateUUID();
      sessionStorage.setItem(this.sessionIdKey, sessionId);
    }

    return sessionId;
  }

  public clearSession(): void {
    sessionStorage.removeItem(this.sessionIdKey);
  }

  public logActivity(
    activityType: string,
    moduleName: string = '',
    action: string = '',
    recordInfo: string = '',
    status: string = 'SUCCESS',
    errorMessage: string = ''
  ): void {

    const employeeId = sessionStorage.getItem('EMPLOYEEID') || '0';
    const userName = sessionStorage.getItem('UserName') || 'Unknown';

    const activityData = {

      session_id: this.getSessionId(),

      user_id: employeeId,
      user_name: userName,

      activity_type: activityType,
      module_name: moduleName,
      action_performed: action,

      record_info: recordInfo,

      page_url: window.location.href,
      current_route: this.router.url,

      browser_info: navigator.userAgent,

      device_type: /Mobi|Android/i.test(navigator.userAgent)
        ? 'Mobile'
        : 'Desktop',

      status: status,

      error_message: errorMessage

    };

    this.http.post(
      this.apiurl + 'activity.log_activity&reload=1',
      activityData
    ).pipe(
      catchError((err) => {
        console.error('Activity Tracking Error:', err);
        return EMPTY;
      })
    ).subscribe();
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
      .replace(/[xy]/g, (c) => {

        const r = Math.random() * 16 | 0;

        const v = c === 'x'
          ? r
          : (r & 0x3 | 0x8);

        return v.toString(16);

      });
  }
}
