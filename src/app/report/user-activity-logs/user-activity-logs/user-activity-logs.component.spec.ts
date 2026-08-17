import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserActivityLogsComponent } from './user-activity-logs.component';

describe('UserActivityLogsComponent', () => {
  let component: UserActivityLogsComponent;
  let fixture: ComponentFixture<UserActivityLogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserActivityLogsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserActivityLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
