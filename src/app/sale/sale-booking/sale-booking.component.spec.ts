import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaleBookingComponent } from './sale-booking.component';

describe('SaleBookingComponent', () => {
  let component: SaleBookingComponent;
  let fixture: ComponentFixture<SaleBookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SaleBookingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SaleBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
