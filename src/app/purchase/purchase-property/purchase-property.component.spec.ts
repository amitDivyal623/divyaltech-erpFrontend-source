import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchasePropertyComponent } from './purchase-property.component';

describe('PurchasePropertyComponent', () => {
  let component: PurchasePropertyComponent;
  let fixture: ComponentFixture<PurchasePropertyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PurchasePropertyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchasePropertyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
