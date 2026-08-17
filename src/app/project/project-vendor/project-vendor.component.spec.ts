import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectVendorComponent } from './project-vendor.component';

describe('ProjectVendorComponent', () => {
  let component: ProjectVendorComponent;
  let fixture: ComponentFixture<ProjectVendorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectVendorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectVendorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
