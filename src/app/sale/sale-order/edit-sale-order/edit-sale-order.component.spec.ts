import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSaleOrderComponent } from './edit-sale-order.component';

describe('EditSaleOrderComponent', () => {
  let component: EditSaleOrderComponent;
  let fixture: ComponentFixture<EditSaleOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditSaleOrderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditSaleOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
