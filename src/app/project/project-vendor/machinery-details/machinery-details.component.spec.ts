import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MachineryDetailsComponent } from './machinery-details.component';

describe('MachineryDetailsComponent', () => {
  let component: MachineryDetailsComponent;
  let fixture: ComponentFixture<MachineryDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MachineryDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MachineryDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
