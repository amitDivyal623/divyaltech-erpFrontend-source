import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductStockmangComponent } from './product-stockmang.component';

describe('ProductStockmangComponent', () => {
  let component: ProductStockmangComponent;
  let fixture: ComponentFixture<ProductStockmangComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductStockmangComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductStockmangComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

