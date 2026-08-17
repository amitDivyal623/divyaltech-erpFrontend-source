import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBookingRegistryComponent } from './add-booking-registry.component';

describe('AddBookingRegistryComponent', () => {
  let component: AddBookingRegistryComponent;
  let fixture: ComponentFixture<AddBookingRegistryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddBookingRegistryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddBookingRegistryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
