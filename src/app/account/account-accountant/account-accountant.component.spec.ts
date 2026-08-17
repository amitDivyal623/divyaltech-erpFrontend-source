import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountAccountantComponent } from './account-accountant.component';

describe('AccountAccountantComponent', () => {
  let component: AccountAccountantComponent;
  let fixture: ComponentFixture<AccountAccountantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountAccountantComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountAccountantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
