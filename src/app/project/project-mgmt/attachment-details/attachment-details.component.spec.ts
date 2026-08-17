import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttachmentDetailsComponent } from './attachment-details.component';

describe('AttachmentDetailsComponent', () => {
  let component: AttachmentDetailsComponent;
  let fixture: ComponentFixture<AttachmentDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AttachmentDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AttachmentDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
