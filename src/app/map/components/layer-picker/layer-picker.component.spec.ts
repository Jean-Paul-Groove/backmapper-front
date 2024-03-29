import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayerPickerComponent } from './layer-picker.component';

describe('LayerPickerComponent', () => {
  let component: LayerPickerComponent;
  let fixture: ComponentFixture<LayerPickerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LayerPickerComponent]
    });
    fixture = TestBed.createComponent(LayerPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
