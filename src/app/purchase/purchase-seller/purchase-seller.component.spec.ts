import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseSellerComponent } from './purchase-seller.component';

describe('PurchaseSellerComponent', () => {
  let component: PurchaseSellerComponent;
  let fixture: ComponentFixture<PurchaseSellerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PurchaseSellerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseSellerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
