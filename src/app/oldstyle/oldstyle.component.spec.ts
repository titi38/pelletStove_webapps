import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OldstyleComponent } from './oldstyle.component';

describe('OldstyleComponent', () => {
  let component: OldstyleComponent;
  let fixture: ComponentFixture<OldstyleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OldstyleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OldstyleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
