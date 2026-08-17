import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectWorkContractComponent } from './project-work-contract.component';

describe('ProjectWorkContractComponent', () => {
  let component: ProjectWorkContractComponent;
  let fixture: ComponentFixture<ProjectWorkContractComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectWorkContractComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectWorkContractComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
