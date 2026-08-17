import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrmCustomerComponent } from './crm-customer.component';

describe('CrmCustomerComponent', () => {
  let component: CrmCustomerComponent;
  let fixture: ComponentFixture<CrmCustomerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrmCustomerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrmCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
