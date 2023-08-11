import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from './components/map/map.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [MapComponent],
  imports: [CommonModule, ReactiveFormsModule],
  exports: [MapComponent],
})
export class MapModule {}
