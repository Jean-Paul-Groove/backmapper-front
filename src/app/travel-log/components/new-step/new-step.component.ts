import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, takeUntil, tap } from 'rxjs';
import { Coordinates } from 'src/app/shared/models/coordinates.model';
import { Step } from 'src/app/shared/models/step.model';
import { Trip } from 'src/app/shared/models/trip.model';
import { MapService } from 'src/app/shared/services/map.service';
import { TripService } from 'src/app/shared/services/trip.service';

@Component({
  selector: 'app-new-step',
  templateUrl: './new-step.component.html',
  styleUrls: ['./new-step.component.scss'],
})
export class NewStepComponent implements OnInit, OnDestroy {
  titleCtrl!: FormControl;
  dateCtrl!: FormControl;
  descriptionCtrl!: FormControl;
  coordinatesCtrl!: FormControl;
  trip!: Trip;
  newStepCoordinates$!: Observable<Coordinates | undefined>;
  private destroy$!: Subject<boolean>;
  stepFormGroup!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private tripService: TripService,
    private mapService: MapService
  ) {}
  ngOnInit(): void {
    const trip = this.tripService.getOneTripById(
      +this.route.snapshot.params['id']
    );
    if (trip) {
      this.trip = trip;
    } else {
      this.router.navigateByUrl('trips');
    }
    this.displayTripOnMap();
    this.newStepCoordinates$ = this.mapService.newPinCoordinates$;
    this.destroy$ = new Subject<boolean>();
    this.initializeForm();
    this.getCoordinates();
  }
  private initializeForm() {
    this.titleCtrl = this.formBuilder.control('', [Validators.required]);
    this.dateCtrl = this.formBuilder.control('', [Validators.required]);
    this.descriptionCtrl = this.formBuilder.control('');
    this.coordinatesCtrl = this.formBuilder.control('', [Validators.required]);
    this.stepFormGroup = this.formBuilder.group({
      title: this.titleCtrl,
      date: this.dateCtrl,
      coordinates: this.coordinatesCtrl,
      description: this.descriptionCtrl,
    });
  }
  private displayTripOnMap() {
    this.mapService.setNewTripLayers([this.trip]);
    if (this.trip.steps.length > 0) {
      this.mapService.defineCenterOfMap(this.trip.steps[0].coordinates, 5);
    }
  }
  onGoBackToTrip() {
    this.router.navigateByUrl('trips/' + this.trip.id);
  }
  onAddAStep(event: Event) {
    event.preventDefault();
    const stepContent = this.stepFormGroup.value;
    this.tripService.addAStepToATrip(stepContent, this.trip.id);
    this.onGoBackToTrip();
  }

  onPlacePinOnMap(event: Event) {
    event.preventDefault();
    const trip = this.tripService.getOneTripById(this.trip.id);
    if (trip) {
      this.mapService.drawOnMap(trip);
    }
  }
  private getCoordinates() {
    this.newStepCoordinates$
      .pipe(
        tap((coordinates) => {
          this.coordinatesCtrl.setValue(coordinates);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.mapService.resetNewStepPin();
  }
}
