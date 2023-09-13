import {
  trigger,
  transition,
  useAnimation,
  query,
  animateChild,
  stagger,
  style,
  animate,
} from '@angular/animations';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { tap } from 'rxjs';
import { slideInAnimation } from 'src/app/shared/animations/slide-in.animation';
import { Step } from 'src/app/shared/models/step.model';
import { AuthService } from 'src/app/shared/services/auth.service';
import { MapService } from 'src/app/shared/services/map.service';
import { TripService } from 'src/app/shared/services/trip.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-step',
  templateUrl: './step.component.html',
  styleUrls: ['./step.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('stepItem', [
      transition(':enter', [useAnimation(slideInAnimation)]),
    ]),
    trigger('imgList', [
      transition(':enter', [
        query('@stepImg', [stagger(50, [animateChild()])], {
          optional: true,
        }),
      ]),
    ]),
    trigger('stepImg', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('700ms ease-out', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class StepComponent implements OnInit {
  @Input() step!: Step;
  @Input() stepNumber!: number;
  @Input() tripColor!: string;
  @Input() tripId!: number;
  @Output() stepIsModified = new EventEmitter<boolean>();
  apiUrl = environment.apiUrl;
  deleteModal = false;
  editModal = false;
  editbuttonsVisible = false;
  guestFileList!: File[];
  imgUrlPrefix = '';

  constructor(
    private mapService: MapService,
    private tripService: TripService,
    public authService: AuthService
  ) {}
  ngOnInit(): void {
    if (this.authService.isLoggedAs() !== 'guest') {
      this.imgUrlPrefix = this.apiUrl + '/';
    }
  }
  onClick() {
    this.mapService.defineCenterOfMap(
      this.tripService.transformCoordinateStringToArrayOfNumber(
        this.step.coordinates
      ),
      6
    );
    this.editbuttonsVisible = !this.editbuttonsVisible;
  }
  onDeleteStep(event: Event) {
    event.preventDefault();
    this.deleteModal = true;
  }
  onEditStep(event: Event) {
    event.preventDefault();
    this.editModal = true;
  }
  onCancelEditStep() {
    this.editModal = false;
  }
  onCancelDelete(event: Event) {
    event.preventDefault();
    this.deleteModal = false;
  }
  onConfirmDelete(event: Event) {
    this.tripService
      .removeAStep(this.step.id, this.tripId)
      .pipe(tap(() => this.stepIsModified.emit(true)))
      .subscribe();
  }
  onStepIsEdited() {
    this.editModal = false;
    this.stepIsModified.emit(true);
  }
}
