import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrLabourComponent } from './hr-labour.component';

describe('HrLabourComponent', () => {
  let component: HrLabourComponent;
  let fixture: ComponentFixture<HrLabourComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HrLabourComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HrLabourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
