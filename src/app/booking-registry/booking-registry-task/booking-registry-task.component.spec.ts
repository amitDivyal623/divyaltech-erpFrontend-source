import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingRegistryTaskComponent } from './booking-registry-task.component';

describe('BookingRegistryTaskComponent', () => {
  let component: BookingRegistryTaskComponent;
  let fixture: ComponentFixture<BookingRegistryTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BookingRegistryTaskComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BookingRegistryTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
