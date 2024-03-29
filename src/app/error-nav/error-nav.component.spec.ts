import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ErrorNavComponent } from './error-nav.component';

describe('ErrorNavComponent', () => {
  let component: ErrorNavComponent;
  let fixture: ComponentFixture<ErrorNavComponent>;

  beforeEach(waitForAsync(() => {
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
