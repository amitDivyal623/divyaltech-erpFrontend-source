import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrMachineReadingComponent } from './hr-machine-reading.component';

describe('HrMachineReadingComponent', () => {
  let component: HrMachineReadingComponent;
  let fixture: ComponentFixture<HrMachineReadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HrMachineReadingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HrMachineReadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
