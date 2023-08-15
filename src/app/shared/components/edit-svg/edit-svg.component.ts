import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-edit-svg',
  templateUrl: './edit-svg.component.html',
  styleUrls: ['./edit-svg.component.scss'],
})
export class EditSvgComponent {
  @Input() color!: string;
}
