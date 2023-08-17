import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapSvgComponent } from './map-svg.component';

describe('MapSvgComponent', () => {
  let component: MapSvgComponent;
  let fixture: ComponentFixture<MapSvgComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MapSvgComponent]
    });
    fixture = TestBed.createComponent(MapSvgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
