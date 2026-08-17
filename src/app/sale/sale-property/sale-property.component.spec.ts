import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalePropertyComponent } from './sale-property.component';

describe('SalePropertyComponent', () => {
  let component: SalePropertyComponent;
  let fixture: ComponentFixture<SalePropertyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SalePropertyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SalePropertyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
