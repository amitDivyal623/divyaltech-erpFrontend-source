import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockPoPrComponent } from './stock-po-pr.component';

describe('StockPoPrComponent', () => {
  let component: StockPoPrComponent;
  let fixture: ComponentFixture<StockPoPrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StockPoPrComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StockPoPrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

