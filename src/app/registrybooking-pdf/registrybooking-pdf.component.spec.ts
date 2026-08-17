import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrybookingPdfComponent } from './registrybooking-pdf.component';

describe('RegistrybookingPdfComponent', () => {
  let component: RegistrybookingPdfComponent;
  let fixture: ComponentFixture<RegistrybookingPdfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegistrybookingPdfComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistrybookingPdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
