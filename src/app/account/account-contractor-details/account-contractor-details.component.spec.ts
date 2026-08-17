import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountContractorDetailsComponent } from './account-contractor-details.component';

describe('AccountContractorDetailsComponent', () => {
  let component: AccountContractorDetailsComponent;
  let fixture: ComponentFixture<AccountContractorDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountContractorDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountContractorDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
