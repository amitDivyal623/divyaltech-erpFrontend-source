import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistryRecordComponent } from './registry-record.component';

describe('RegistryRecordComponent', () => {
  let component: RegistryRecordComponent;
  let fixture: ComponentFixture<RegistryRecordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegistryRecordComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistryRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
