import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, take, tap } from 'rxjs';
import { Trip } from 'src/app/shared/models/trip.model';
import { MapService } from 'src/app/shared/services/map.service';
import { TripService } from 'src/app/shared/services/trip.service';

@Component({
  selector: 'app-travel-log',
  templateUrl: './travel-log.component.html',
  styleUrls: ['./travel-log.component.scss'],
})
export class TravelLogComponent implements OnInit {
  trips$!: Observable<Trip[]>;
  tripDisplayed: undefined | Trip = undefined;

  constructor(
    private tripService: TripService,
    private router: Router,
    private mapService: MapService
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
          this.mapService.setNewTripLayers(trips);
          this.mapService.defineCenterOfMap(this.mapService.defaultView.center);
        })
      )
      .subscribe();
  }
  onAddATrip() {
    this.router.navigateByUrl('trips/new');
  }
}
