import {
  trigger,
  transition,
  query,
  stagger,
  style,
  animate,
  animateChild,
} from '@angular/animations';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('title', [
      transition('void => *', [
        query('@letter', [stagger(50, [animateChild()])], {
          optional: true,
        }),
      ]),
    ]),
    trigger('letter', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate('600ms ease-out', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class AppComponent {
  title = 'backmapper';
  wrapperExtended = false;
  toggleExtendWrapper() {
    this.wrapperExtended = !this.wrapperExtended;
  }
}
