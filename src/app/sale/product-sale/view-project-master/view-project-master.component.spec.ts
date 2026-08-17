import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewProjectMasterComponent } from './view-project-master.component';

describe('ViewProjectMasterComponent', () => {
  let component: ViewProjectMasterComponent;
  let fixture: ComponentFixture<ViewProjectMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewProjectMasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewProjectMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
