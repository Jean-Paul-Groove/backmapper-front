import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-delete-svg',
  templateUrl: './delete-svg.component.html',
  styleUrls: ['./delete-svg.component.scss'],
})
export class DeleteSvgComponent {
  @Input() color!: string;
}
