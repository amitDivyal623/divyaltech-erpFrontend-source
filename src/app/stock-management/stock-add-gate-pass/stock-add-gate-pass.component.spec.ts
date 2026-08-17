import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockAddGatePassComponent } from './stock-add-gate-pass.component';

describe('StockAddGatePassComponent', () => {
  let component: StockAddGatePassComponent;
  let fixture: ComponentFixture<StockAddGatePassComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StockAddGatePassComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StockAddGatePassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
