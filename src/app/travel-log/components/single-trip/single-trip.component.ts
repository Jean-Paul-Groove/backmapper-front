import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { TripColor } from 'src/app/shared/enum/trip-color.enum';
import { Trip } from 'src/app/shared/models/trip.model';
import { MapService } from 'src/app/shared/services/map.service';
import { TripService } from 'src/app/shared/services/trip.service';

@Component({
  selector: 'app-single-trip',
  templateUrl: './single-trip.component.html',
  styleUrls: ['./single-trip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SingleTripComponent implements OnInit {
  trip$!: Observable<Trip | null>;
  tripId!: number;
  tripColor!: string;
  constructor(
    private tripsService: TripService,
    private route: ActivatedRoute,
    private router: Router,
    private mapService: MapService
  ) {}

  ngOnInit(): void {
    this.tripId = +this.route.snapshot.params['id'];
    this.initializeTrip();
  }
  private initializeTrip() {
    this.trip$ = this.tripsService.getOneTripById(this.tripId).pipe(
      tap((trip) => {
        if (trip) {
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
        } else {
          this.router.navigateByUrl('trips');
        }
      })
    );
  }

  onGoBackToTripList() {
    this.router.navigateByUrl('/trips');
  }
  onAddAStep() {
    this.router.navigateByUrl('/trips/' + this.tripId + '/new-step');
  }
  onStepGotModified() {
    this.initializeTrip();
  }
}
