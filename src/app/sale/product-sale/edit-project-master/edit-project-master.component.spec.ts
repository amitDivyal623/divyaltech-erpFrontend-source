import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditProjectMasterComponent } from './edit-project-master.component';

describe('EditProjectMasterComponent', () => {
  let component: EditProjectMasterComponent;
  let fixture: ComponentFixture<EditProjectMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditProjectMasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditProjectMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
