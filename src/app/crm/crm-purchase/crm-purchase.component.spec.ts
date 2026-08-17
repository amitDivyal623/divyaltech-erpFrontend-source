import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrmPurchaseComponent } from './crm-purchase.component';

describe('CrmPurchaseComponent', () => {
  let component: CrmPurchaseComponent;
  let fixture: ComponentFixture<CrmPurchaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrmPurchaseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrmPurchaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
