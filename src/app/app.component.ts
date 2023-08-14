import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'backmapper';
  wrapperExtended = false;
  toggleExtendWrapper() {
    this.wrapperExtended = !this.wrapperExtended;
  }
}
