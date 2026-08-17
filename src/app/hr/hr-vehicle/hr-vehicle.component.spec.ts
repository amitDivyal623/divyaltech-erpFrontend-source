import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrVehicleComponent } from './hr-vehicle.component';

describe('HrVehicleComponent', () => {
  let component: HrVehicleComponent;
  let fixture: ComponentFixture<HrVehicleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HrVehicleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HrVehicleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
