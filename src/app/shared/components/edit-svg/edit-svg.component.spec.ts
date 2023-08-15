import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSvgComponent } from './edit-svg.component';

describe('EditSvgComponent', () => {
  let component: EditSvgComponent;
  let fixture: ComponentFixture<EditSvgComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditSvgComponent]
    });
    fixture = TestBed.createComponent(EditSvgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
