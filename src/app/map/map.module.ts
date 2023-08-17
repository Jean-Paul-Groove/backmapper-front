import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from './components/map/map.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { MapSvgComponent } from './components/map-svg/map-svg.component';
import { LayerPickerComponent } from './components/layer-picker/layer-picker.component';

@NgModule({
  declarations: [MapComponent, MapSvgComponent, LayerPickerComponent],
  imports: [CommonModule, ReactiveFormsModule, SharedModule],
  exports: [MapComponent],
})
export class MapModule {}
