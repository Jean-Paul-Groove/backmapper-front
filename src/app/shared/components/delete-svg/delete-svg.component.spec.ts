import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteSvgComponent } from './delete-svg.component';

describe('DeleteSvgComponent', () => {
  let component: DeleteSvgComponent;
  let fixture: ComponentFixture<DeleteSvgComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DeleteSvgComponent]
    });
    fixture = TestBed.createComponent(DeleteSvgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
