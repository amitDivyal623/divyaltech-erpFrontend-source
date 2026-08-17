import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddProjectMasterComponent } from './add-project-master.component';

describe('AddProjectMasterComponent', () => {
  let component: AddProjectMasterComponent;
  let fixture: ComponentFixture<AddProjectMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddProjectMasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddProjectMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
