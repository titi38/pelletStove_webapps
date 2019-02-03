import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OldstyleComponent } from './oldstyle.component';

describe('OldstyleComponent', () => {
  let component: OldstyleComponent;
  let fixture: ComponentFixture<OldstyleComponent>;

  beforeEach(async(() => {
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
