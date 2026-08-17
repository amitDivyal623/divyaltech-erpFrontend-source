import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileMgmtComponent } from './file-mgmt.component';

describe('FileMgmtComponent', () => {
  let component: FileMgmtComponent;
  let fixture: ComponentFixture<FileMgmtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FileMgmtComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileMgmtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
