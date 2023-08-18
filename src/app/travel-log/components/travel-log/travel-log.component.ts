import {
  animateChild,
  query,
  stagger,
  transition,
  trigger,
  useAnimation,
} from '@angular/animations';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, take, tap } from 'rxjs';
import { slideInAnimation } from 'src/app/shared/animations/slide-in.animation';
import { TripColor } from 'src/app/shared/enum/trip-color.enum';
import { Trip } from 'src/app/shared/models/trip.model';
import { AuthService } from 'src/app/shared/services/auth.service';
import { MapService } from 'src/app/shared/services/map.service';
import { TripService } from 'src/app/shared/services/trip.service';

@Component({
  selector: 'app-travel-log',
  templateUrl: './travel-log.component.html',
  styleUrls: ['./travel-log.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('tripList', [
      transition(':enter', [
        query('@tripItem', [stagger(50, [animateChild()])], {
          optional: true,
        }),
      ]),
    ]),
    trigger('tripItem', [
      transition(':enter', [useAnimation(slideInAnimation)]),
    ]),
  ],
})
export class TravelLogComponent implements OnInit {
  trips$!: Observable<Trip[] | null>;
  tripDisplayed: undefined | Trip = undefined;
  tripColor = TripColor;

  constructor(
    public tripService: TripService,
    private router: Router,
    private mapService: MapService,
    public authService: AuthService
  ) {}
  ngOnInit(): void {
    this.initializeObservables();
    this.displayAllTripsOnMap();
  }
  private initializeObservables() {
    this.trips$ = this.tripService.getAllTrips();
  }
  onTripSelection(trip: Trip) {
    this.router.navigateByUrl(`trips/${trip.id}`);
  }
  onGoBackToTripList() {
    this.tripDisplayed = undefined;
    this.displayAllTripsOnMap();
  }
  private displayAllTripsOnMap() {
    this.trips$
      .pipe(
        take(1),
        tap((trips) => {
          if (trips) {
            this.mapService.setNewTripLayers(trips);
            this.mapService.defineCenterOfMap(
              this.mapService.defaultView.center,
              2
            );
          }
        })
      )
      .subscribe();
  }
  onAddATrip() {
    this.router.navigateByUrl('trips/new');
  }
  onBackToConnect() {
    this.authService.token = '';
    this.authService.userIsAGuest = false;
    this.mapService.clearTripLayers();
    this.router.navigateByUrl('');
  }
}
