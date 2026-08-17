import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseExpenseComponent } from './purchase-expense.component';

describe('PurchaseExpenseComponent', () => {
  let component: PurchaseExpenseComponent;
  let fixture: ComponentFixture<PurchaseExpenseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PurchaseExpenseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseExpenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
