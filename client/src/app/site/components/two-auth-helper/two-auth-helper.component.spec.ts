import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TwoAuthHelperComponent } from './two-auth-helper.component';

describe('TwoAuthHelperComponent', () => {
  let component: TwoAuthHelperComponent;
  let fixture: ComponentFixture<TwoAuthHelperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TwoAuthHelperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TwoAuthHelperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
