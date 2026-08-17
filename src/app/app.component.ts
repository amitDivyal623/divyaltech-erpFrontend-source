import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { UserActivityService } from './services/user-activity.service';
import { LoginSignupService } from './services/login-signup.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'my-app';
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private activityService: UserActivityService,
    // Injecting here (not just in login) forces this singleton to be created
    // on every app bootstrap, so the 7 PM auto-logout timer survives page
    // refreshes and direct route navigation, not just the initial login.
    private loginSignupService: LoginSignupService
  ) { }

  ngOnInit() {
    // Automatic Screen Tracking
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: NavigationEnd) => {
      const moduleName = this.getModuleName(event.urlAfterRedirects);
      if (moduleName) {
        this.activityService.logActivity('SCREEN_OPEN', moduleName, 'Viewed');
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  /**
 * Maps URL paths to Human Readable Module Names
 */
  private getModuleName(url: string): string {
    if (url === '/' || url === '/login') return ''; // Don't track login screen here (already tracked in login)
    if (url.includes('dashboard')) return 'Dashboard';
    if (url.includes('stock-gate-pass')) return 'Gate Pass';
    if (url.includes('vendor-management')) return 'Vendor Management';
    if (url.includes('reports')) return 'Reports';
    if (url.includes('stock-management')) return 'Stock Management';

    // Fallback: clean up the URL to make it readable
    const path = url.split('/').pop() || '';
    return path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
  }

  deccodeStringData = (Response) => {
    try {
      var splitted = Response.RESPONSE.split(".");
      // console.log(splitted);
      if (splitted.length == 3) {
        var input = splitted[1].replace("-", "+");
        input = input.replace("_", "/");
        //var length = (4 - (input.length)%4);
        //input = input;+"=".repeat(length);
        var jsonString = JSON.parse(atob(input));
        return jsonString;
      } else {
        return "login";
      }
    } catch (e) {
      return "login";
    }
  }

  // constructor(private inactivityService: InactivityService) { }
}

