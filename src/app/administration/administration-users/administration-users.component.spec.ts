import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministrationUsersComponent } from './administration-users.component';

describe('AdministrationUsersComponent', () => {
  let component: AdministrationUsersComponent;
  let fixture: ComponentFixture<AdministrationUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdministrationUsersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdministrationUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
