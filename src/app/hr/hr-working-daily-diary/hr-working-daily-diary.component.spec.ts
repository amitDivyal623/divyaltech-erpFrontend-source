import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrWorkingDailyDiaryComponent } from './hr-working-daily-diary.component';

describe('HrWorkingDailyDiaryComponent', () => {
  let component: HrWorkingDailyDiaryComponent;
  let fixture: ComponentFixture<HrWorkingDailyDiaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HrWorkingDailyDiaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HrWorkingDailyDiaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
