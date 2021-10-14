import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ShutdownComponent } from './shutdown.component';

describe('ShutdownComponent', () => {
  let component: ShutdownComponent;
  let fixture: ComponentFixture<ShutdownComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ShutdownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShutdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
