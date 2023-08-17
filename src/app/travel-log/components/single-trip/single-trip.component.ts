import {
  trigger,
  transition,
  query,
  stagger,
  animateChild,
  useAnimation,
} from '@angular/animations';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { slideInAnimation } from 'src/app/shared/animations/slide-in.animation';
import { TripColor } from 'src/app/shared/enum/trip-color.enum';
import { Trip } from 'src/app/shared/models/trip.model';
import { AuthService } from 'src/app/shared/services/auth.service';
import { MapService } from 'src/app/shared/services/map.service';
import { TripService } from 'src/app/shared/services/trip.service';

@Component({
  selector: 'app-single-trip',
  templateUrl: './single-trip.component.html',
  styleUrls: ['./single-trip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('stepList', [
      transition(':enter', [
        query('@stepItem', [stagger(50, [animateChild()])], {
          optional: true,
        }),
      ]),
    ]),
    trigger('stepItem', [
      transition(':enter', [useAnimation(slideInAnimation)]),
    ]),
  ],
})
export class SingleTripComponent implements OnInit {
  trip$!: Observable<Trip | null>;
  trip!: Trip;
  tripId!: number;
  tripColor!: string;
  tripInfo = { distance: 0, duration: 0, startedIn: '' };
  editTrip: boolean = false;
  constructor(
    public tripsService: TripService,
    private route: ActivatedRoute,
    private router: Router,
    private mapService: MapService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.tripId = +this.route.snapshot.params['id'];
    this.initializeTrip();
  }
  private initializeTrip() {
    this.trip$ = this.tripsService.getOneTripById(this.tripId).pipe(
      map((trip) => {
        if (!trip) {
          return null;
        } else {
          console.log(trip);
          return trip;
        }
      }),
      tap((trip) => {
        if (trip) {
          this.trip = trip;
          if (trip.steps && trip.steps.length > 0) {
            this.mapService.setNewTripLayers([trip]);
            this.mapService.defineCenterOfMap(
              this.tripsService.transformCoordinateStringToArrayOfNumber(
                trip.steps[trip.steps.length - 1].coordinates
              ),
              5
            );
          }
          if (trip.color) {
            this.tripColor = TripColor[trip.color];
          }
          this.tripInfo = this.mapService.tripsInfo[trip.title];
        } else {
          this.router.navigateByUrl('trips');
        }
      })
    );
    this.trip$.subscribe();
  }

  onGoBackToTripList() {
    this.router.navigateByUrl('/trips');
  }
  onEditTrip(event: Event) {
    event.preventDefault();
    this.editTrip = true;
  }
  onCancelEdit() {
    this.editTrip = false;
  }
  onAddAStep() {
    this.router.navigateByUrl('/trips/' + this.tripId + '/new-step');
  }
  onStepGotModified() {
    this.initializeTrip();
  }
  onTripGotUpdated() {
    this.initializeTrip();
  }
}
