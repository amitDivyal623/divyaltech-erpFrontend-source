import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministrationRoleComponent } from './administration-role.component';

describe('AdministrationRoleComponent', () => {
  let component: AdministrationRoleComponent;
  let fixture: ComponentFixture<AdministrationRoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdministrationRoleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdministrationRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
