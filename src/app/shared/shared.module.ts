import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditSvgComponent } from './components/edit-svg/edit-svg.component';
import { DeleteSvgComponent } from './components/delete-svg/delete-svg.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NotificationComponent } from './components/notification/notification.component';
import { UserSvgComponent } from './components/user-svg/user-svg.component';
import { NotificationCardComponent } from './components/notification-card/notification-card.component';
import { LoaderSvgComponent } from './components/loader-svg/loader-svg.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    EditSvgComponent,
    DeleteSvgComponent,
    NotificationComponent,
    UserSvgComponent,
    NotificationCardComponent,
    LoaderSvgComponent,
  ],
  imports: [CommonModule],
  exports: [
    EditSvgComponent,
    DeleteSvgComponent,
    NotificationComponent,
    ReactiveFormsModule,
    UserSvgComponent,
    LoaderSvgComponent,
    BrowserAnimationsModule,
  ],
})
export class SharedModule {}
