import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPropertySaleComponent } from './add-property-sale.component';

describe('AddPropertySaleComponent', () => {
  let component: AddPropertySaleComponent;
  let fixture: ComponentFixture<AddPropertySaleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddPropertySaleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPropertySaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
