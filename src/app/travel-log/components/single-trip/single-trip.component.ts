import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Trip } from 'src/app/shared/models/trip.model';
import { MapService } from 'src/app/shared/services/map.service';
import { TripService } from 'src/app/shared/services/trip.service';

@Component({
  selector: 'app-single-trip',
  templateUrl: './single-trip.component.html',
  styleUrls: ['./single-trip.component.scss'],
})
export class SingleTripComponent implements OnInit {
  trip!: Trip;
  constructor(
    private tripsService: TripService,
    private route: ActivatedRoute,
    private router: Router,
    private mapService: MapService
  ) {}

  ngOnInit(): void {
    this.initializeTrip();
  }
  private initializeTrip() {
    const tripId = this.route.snapshot.params['id'];
    const tripExist = this.tripsService.getOneTripById(+tripId);
    if (tripExist) {
      this.trip = tripExist;
    } else {
      this.router.navigateByUrl('trips');
    }

    this.mapService.setNewTripLayers([this.trip]);
    if (this.trip.steps.length > 0) {
      this.mapService.defineCenterOfMap(this.trip.steps[0].coordinates, 5);
    }
  }

  onGoBackToTripList() {
    this.router.navigateByUrl('/trips');
  }
  onAddAStep() {
    this.router.navigateByUrl('/trips/' + this.trip.id + '/new-step');
  }
}
