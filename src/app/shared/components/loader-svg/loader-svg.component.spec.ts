import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoaderSvgComponent } from './loader-svg.component';

describe('LoaderSvgComponent', () => {
  let component: LoaderSvgComponent;
  let fixture: ComponentFixture<LoaderSvgComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoaderSvgComponent]
    });
    fixture = TestBed.createComponent(LoaderSvgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
