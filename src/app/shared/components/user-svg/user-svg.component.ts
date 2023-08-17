import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-user-svg',
  templateUrl: './user-svg.component.html',
  styleUrls: ['./user-svg.component.scss'],
})
export class UserSvgComponent {
  @Input() color!: string;
}
