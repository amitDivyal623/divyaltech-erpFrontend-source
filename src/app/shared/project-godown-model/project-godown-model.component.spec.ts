import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectGodownModelComponent } from './project-godown-model.component';

describe('ProjectGodownModelComponent', () => {
  let component: ProjectGodownModelComponent;
  let fixture: ComponentFixture<ProjectGodownModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectGodownModelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectGodownModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
