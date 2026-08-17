import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddComponent } from './add.component';

describe('AddComponent', () => {
  let component: AddComponent;
  let fixture: ComponentFixture<AddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AddComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'angular-reactive-forms'`, () => {
    const fixture = TestBed.createComponent(AddComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('angular-reactive-forms');
  });

  it('should render title in a h1 tag', () => {
    const fixture = TestBed.createComponent(AddComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('Welcome to angular-reactive-forms!');
  });
});
