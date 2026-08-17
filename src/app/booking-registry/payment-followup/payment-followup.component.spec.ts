import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentFollowupComponent } from './payment-followup.component';

describe('PaymentFollowupComponent', () => {
  let component: PaymentFollowupComponent;
  let fixture: ComponentFixture<PaymentFollowupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaymentFollowupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentFollowupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
