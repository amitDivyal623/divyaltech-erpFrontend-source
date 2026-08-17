import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockGatePassComponent } from './stock-gate-pass.component';

describe('StockGatePassComponent', () => {
  let component: StockGatePassComponent;
  let fixture: ComponentFixture<StockGatePassComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StockGatePassComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StockGatePassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
