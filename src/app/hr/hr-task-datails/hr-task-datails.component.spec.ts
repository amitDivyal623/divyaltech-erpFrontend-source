import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrTaskDatailsComponent } from './hr-task-datails.component';

describe('HrTaskDatailsComponent', () => {
  let component: HrTaskDatailsComponent;
  let fixture: ComponentFixture<HrTaskDatailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HrTaskDatailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HrTaskDatailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
