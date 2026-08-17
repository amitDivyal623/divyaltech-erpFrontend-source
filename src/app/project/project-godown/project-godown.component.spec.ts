import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectGodownComponent } from './project-godown.component';

describe('ProjectGodownComponent', () => {
  let component: ProjectGodownComponent;
  let fixture: ComponentFixture<ProjectGodownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectGodownComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectGodownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
