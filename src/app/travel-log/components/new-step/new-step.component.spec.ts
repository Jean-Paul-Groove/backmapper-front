import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewStepComponent } from './new-step.component';

describe('NewStepComponent', () => {
  let component: NewStepComponent;
  let fixture: ComponentFixture<NewStepComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NewStepComponent]
    });
    fixture = TestBed.createComponent(NewStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
