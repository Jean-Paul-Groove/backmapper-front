import { Component, Input } from '@angular/core';
import { NotificationService } from '../../services/notification.service';
import { trigger, transition, animate, style } from '@angular/animations';

@Component({
  selector: 'app-notification-card',
  templateUrl: './notification-card.component.html',
  styleUrls: ['./notification-card.component.scss'],
  animations: [
    trigger('notif', [
      transition('void => *', [
        style({
          transform: 'translatex(100%)',
          opacity: 0,
        }),
        animate(
          '500ms ease-out',
          style({
            transform: 'translatex(0)',
            opacity: 1,
          })
        ),
        animate('2000ms'),
        animate(
          '700ms ease-out',
          style({
            transform: 'translatex(-150%)',
            opacity: 0,
          })
        ),
      ]),
    ]),
  ],
})
export class NotificationCardComponent {
  constructor(public notificationService: NotificationService) {}
  @Input() error!: string;
  @Input() index!: number;
}
