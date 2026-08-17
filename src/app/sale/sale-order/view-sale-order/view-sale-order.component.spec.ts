import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSaleOrderComponent } from './view-sale-order.component';

describe('ViewSaleOrderComponent', () => {
  let component: ViewSaleOrderComponent;
  let fixture: ComponentFixture<ViewSaleOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewSaleOrderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewSaleOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
