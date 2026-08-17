import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { UserActivityService } from './user-activity.service';

@Injectable({
  providedIn: 'root'
})
export class LoginSignupService implements OnDestroy {
  public apiurl = environment.APIEndpoint;
  private destroy$ = new Subject<void>();
  private logoutCheckInterval: any;
  private logoutTime = { hour: 19, minute: 0 }; // Default 7:00 PM
  private lastLogoutKey: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private ngZone: NgZone,
    private activityService: UserActivityService
  ) {
    // Initialize from sessionStorage if available
    const savedTime = sessionStorage.getItem('logoutTimeConfig');
    if (savedTime) {
      this.logoutTime = JSON.parse(savedTime);
    }
    this.setupLogoutTimer();
  }

  user_login(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `login.login&reload=1`, obj);
  }

  verify_otp(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `login.verify_otp&reload=1`, obj);
  }

  user_email_verify(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `login.send_email&reload=1`, obj);
  }

  reset_password_with_otp(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `login.resetPasswordWithOtp&reload=1`, obj);
  }

  send_otp_email(obj: any): Observable<any> {
    return this.http.post(this.apiurl + `login.send_email_otp&reload=1`, obj);
  }

  user_signup(obj: any): Observable<any> {
    const data = JSON.stringify(obj);
    const re = /\./gi;
    const response = data.replace(re, "$@");
    return this.http.post(this.apiurl + `user.signup&reload=1`, response);
  }

  private setupLogoutTimer(): void {
    // Clear any existing interval
    if (this.logoutCheckInterval) {
      clearInterval(this.logoutCheckInterval);
    }
    
    // Save current configuration
    sessionStorage.setItem('logoutTimeConfig', JSON.stringify(this.logoutTime));
    
    // Run outside Angular zone
    this.ngZone.runOutsideAngular(() => {
      this.logoutCheckInterval = setInterval(() => {
        const now = new Date();
        
        // Create unique key for today's logout time
        const today = now.toISOString().split('T')[0];
        const timeKey = `${today}-${this.logoutTime.hour}-${this.logoutTime.minute}`;
        
        // Skip if we already logged out for this specific time today
        if (sessionStorage.getItem('lastLogoutKey') === timeKey) return;

        // Check if the logout time has passed (>= instead of exact match so a
        // missed tick, e.g. a throttled background tab, still triggers logout)
        const target = new Date(now);
        target.setHours(this.logoutTime.hour, this.logoutTime.minute, 0, 0);

        if (now >= target) {
          // Set the unique key to prevent future logouts
          sessionStorage.setItem('lastLogoutKey', timeKey);
          this.lastLogoutKey = timeKey;

          // Only actually log out if there's a session to end
          if (sessionStorage.getItem('token')) {
            this.ngZone.run(() => this.logoutAndReload());
          }
        }
      }, 5000); // Check every 5 seconds
    });
  }

  // Method to update logout time
  updateLogoutTime(hour: number, minute: number): void {
    this.logoutTime = { hour, minute };
    sessionStorage.setItem('logoutTimeConfig', JSON.stringify(this.logoutTime));
    
    // Clear the last logout key to allow new logout
    sessionStorage.removeItem('lastLogoutKey');
    this.lastLogoutKey = null;
  }

  private logoutAndReload(): void {
    console.log(`Logging out at ${this.logoutTime.hour}:${this.logoutTime.minute}`);
     this.activityService.logActivity('LOGOUT', 'System', 'Auto-Logout', 'Session Expired');
    this.logout();
    window.location.reload();
  }

  private logout(): void {
    // Log Activity: Logout
    this.activityService.logActivity('LOGOUT', 'System', 'Manual Logout');

    // Clear user-related session storage
    const preserveKeys = ['logoutTimeConfig', 'lastLogoutKey'];
    const preserveData: {[key: string]: string} = {};
    
    // Save important keys
    preserveKeys.forEach(key => {
      const value = sessionStorage.getItem(key);
      if (value) preserveData[key] = value;
    });
    
    // Clear all session storage
    sessionStorage.clear();
    // Clear activity tracking session
    this.activityService.clearSession();    
    
    // Restore important keys
    Object.keys(preserveData).forEach(key => {
      sessionStorage.setItem(key, preserveData[key]);
    });
    
    this.router.navigate(['/']);
  }

  ngOnDestroy(): void {
    if (this.logoutCheckInterval) {
      clearInterval(this.logoutCheckInterval);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }
}