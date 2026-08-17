import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HrContractorComponent } from './hr-contractor.component';

describe('HrContractorComponent', () => {
  let component: HrContractorComponent;
  let fixture: ComponentFixture<HrContractorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HrContractorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HrContractorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
