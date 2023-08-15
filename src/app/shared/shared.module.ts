import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditSvgComponent } from './components/edit-svg/edit-svg.component';
import { DeleteSvgComponent } from './components/delete-svg/delete-svg.component';

@NgModule({
  declarations: [EditSvgComponent, DeleteSvgComponent],
  imports: [CommonModule],
  exports: [EditSvgComponent, DeleteSvgComponent],
})
export class SharedModule {}
