import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MachineReadingPopupComponent } from './machine-reading-popup.component';

describe('MachineReadingPopupComponent', () => {
  let component: MachineReadingPopupComponent;
  let fixture: ComponentFixture<MachineReadingPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MachineReadingPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MachineReadingPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
