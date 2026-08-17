import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GstSetupComponent } from './gst-setup.component';

describe('GstSetupComponent', () => {
  let component: GstSetupComponent;
  let fixture: ComponentFixture<GstSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GstSetupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GstSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
