import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockAddGrnComponent } from './stock-add-grn.component';

describe('StockAddGrnComponent', () => {
  let component: StockAddGrnComponent;
  let fixture: ComponentFixture<StockAddGrnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StockAddGrnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StockAddGrnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
