import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentFollowupComponent } from './document-followup.component';

describe('DocumentFollowupComponent', () => {
  let component: DocumentFollowupComponent;
  let fixture: ComponentFixture<DocumentFollowupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DocumentFollowupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentFollowupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
