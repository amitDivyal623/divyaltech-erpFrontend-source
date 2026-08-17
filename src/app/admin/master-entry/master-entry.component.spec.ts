import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterEntryComponent } from './master-entry.component';

describe('MasterEntryComponent', () => {
  let component: MasterEntryComponent;
  let fixture: ComponentFixture<MasterEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MasterEntryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MasterEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
