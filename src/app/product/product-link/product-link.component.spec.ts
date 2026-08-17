import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductLinkComponent } from './product-link.component';

describe('ProductLinkComponent', () => {
  let component: ProductLinkComponent;
  let fixture: ComponentFixture<ProductLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductLinkComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
