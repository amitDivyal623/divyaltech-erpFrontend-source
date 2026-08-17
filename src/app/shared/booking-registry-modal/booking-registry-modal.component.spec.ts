import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingRegistryModalComponent } from './booking-registry-modal.component';

describe('BookingRegistryModalComponent', () => {
  let component: BookingRegistryModalComponent;
  let fixture: ComponentFixture<BookingRegistryModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BookingRegistryModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BookingRegistryModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
