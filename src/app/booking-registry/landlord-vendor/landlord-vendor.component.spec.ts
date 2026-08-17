import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandlordVendorComponent } from './landlord-vendor.component';

describe('LandlordVendorComponent', () => {
  let component: LandlordVendorComponent;
  let fixture: ComponentFixture<LandlordVendorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LandlordVendorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LandlordVendorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
