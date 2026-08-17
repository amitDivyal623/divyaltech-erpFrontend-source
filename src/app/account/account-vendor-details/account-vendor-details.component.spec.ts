import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountVendorDetailsComponent } from './account-vendor-details.component';

describe('AccountVendorDetailsComponent', () => {
  let component: AccountVendorDetailsComponent;
  let fixture: ComponentFixture<AccountVendorDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountVendorDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountVendorDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
