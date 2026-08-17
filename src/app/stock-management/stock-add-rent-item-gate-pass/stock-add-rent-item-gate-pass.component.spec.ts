import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockAddRentItemGatePassComponent } from './stock-add-rent-item-gate-pass.component';

describe('StockAddRentItemGatePassComponent', () => {
  let component: StockAddRentItemGatePassComponent;
  let fixture: ComponentFixture<StockAddRentItemGatePassComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StockAddRentItemGatePassComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StockAddRentItemGatePassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
