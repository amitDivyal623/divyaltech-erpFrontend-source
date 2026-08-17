import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrmTaskComponent } from './crm-task.component';

describe('CrmTaskComponent', () => {
  let component: CrmTaskComponent;
  let fixture: ComponentFixture<CrmTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrmTaskComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrmTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
