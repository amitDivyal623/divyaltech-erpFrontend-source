import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountBankAccountsComponent } from './account-bank-accounts.component';

describe('AccountBankAccountsComponent', () => {
  let component: AccountBankAccountsComponent;
  let fixture: ComponentFixture<AccountBankAccountsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountBankAccountsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountBankAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
