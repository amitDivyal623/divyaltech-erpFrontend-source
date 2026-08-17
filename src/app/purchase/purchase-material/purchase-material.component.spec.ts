import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseMaterialComponent } from './purchase-material.component';

describe('PurchaseMaterialComponent', () => {
  let component: PurchaseMaterialComponent;
  let fixture: ComponentFixture<PurchaseMaterialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PurchaseMaterialComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PurchaseMaterialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
