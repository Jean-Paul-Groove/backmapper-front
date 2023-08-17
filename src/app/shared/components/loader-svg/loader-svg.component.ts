import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loader-svg',
  templateUrl: './loader-svg.component.html',
  styleUrls: ['./loader-svg.component.scss'],
})
export class LoaderSvgComponent {
  @Input() color!: string;
}
