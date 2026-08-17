import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockGateEntryNumberComponent } from './stock-gate-entry-number.component';

describe('StockGateEntryNumberComponent', () => {
  let component: StockGateEntryNumberComponent;
  let fixture: ComponentFixture<StockGateEntryNumberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StockGateEntryNumberComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StockGateEntryNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


