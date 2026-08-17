import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchasePropinfoComponent } from './purchase-propinfo.component';

describe('PurchasePropinfoComponent', () => {
  let component: PurchasePropinfoComponent;
  let fixture: ComponentFixture<PurchasePropinfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PurchasePropinfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchasePropinfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
