import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from './components/map/map.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [MapComponent],
  imports: [CommonModule, ReactiveFormsModule, SharedModule],
  exports: [MapComponent],
})
export class MapModule {}
