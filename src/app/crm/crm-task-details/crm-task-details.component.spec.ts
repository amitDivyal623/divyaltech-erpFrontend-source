import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrmTaskDetailsComponent } from './crm-task-details.component';

describe('CrmTaskDetailsComponent', () => {
  let component: CrmTaskDetailsComponent;
  let fixture: ComponentFixture<CrmTaskDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrmTaskDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrmTaskDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
