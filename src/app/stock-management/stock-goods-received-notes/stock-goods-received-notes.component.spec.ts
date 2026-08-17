import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockGoodsReceivedNotesComponent } from './stock-goods-received-notes.component';

describe('StockGoodsReceivedNotesComponent', () => {
  let component: StockGoodsReceivedNotesComponent;
  let fixture: ComponentFixture<StockGoodsReceivedNotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StockGoodsReceivedNotesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StockGoodsReceivedNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
