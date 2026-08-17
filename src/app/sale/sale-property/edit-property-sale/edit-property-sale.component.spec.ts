import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPropertySaleComponent } from './edit-property-sale.component';

describe('EditPropertySaleComponent', () => {
  let component: EditPropertySaleComponent;
  let fixture: ComponentFixture<EditPropertySaleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditPropertySaleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditPropertySaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
