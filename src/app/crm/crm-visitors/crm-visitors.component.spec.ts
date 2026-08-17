import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrmVisitorsComponent } from './crm-visitors.component';

describe('CrmVisitorsComponent', () => {
  let component: CrmVisitorsComponent;
  let fixture: ComponentFixture<CrmVisitorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrmVisitorsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrmVisitorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
