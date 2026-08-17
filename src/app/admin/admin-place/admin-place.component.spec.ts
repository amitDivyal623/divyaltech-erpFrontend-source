import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPlaceComponent } from './admin-place.component';

describe('AdminPlaceComponent', () => {
  let component: AdminPlaceComponent;
  let fixture: ComponentFixture<AdminPlaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminPlaceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminPlaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
