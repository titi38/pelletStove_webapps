import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorNavComponent } from './error-nav.component';

describe('ErrorNavComponent', () => {
  let component: ErrorNavComponent;
  let fixture: ComponentFixture<ErrorNavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ErrorNavComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
