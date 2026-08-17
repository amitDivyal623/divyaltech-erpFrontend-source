import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private refreshFollowupSource = new BehaviorSubject<boolean>(false);

  refreshFollowup$ = this.refreshFollowupSource.asObservable();

  triggerFollowupRefresh() {
    this.refreshFollowupSource.next(true);
  }

}
