import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, map, take, takeUntil, tap } from 'rxjs';
import { Coordinates } from 'src/app/shared/models/coordinates.model';
import { Trip } from 'src/app/shared/models/trip.model';
import { AuthService } from 'src/app/shared/services/auth.service';
import { MapService } from 'src/app/shared/services/map.service';
import { TripService } from 'src/app/shared/services/trip.service';

@Component({
  selector: 'app-new-step',
  templateUrl: './new-step.component.html',
  styleUrls: ['./new-step.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewStepComponent implements OnInit, OnDestroy {
  titleCtrl!: FormControl;
  dateCtrl!: FormControl;
  descriptionCtrl!: FormControl;
  coordinatesCtrl!: FormControl;
  tripId!: number;
  trip$!: Observable<Trip | null>;
  newStepCoordinates$!: Observable<Coordinates | undefined>;
  private destroy$!: Subject<boolean>;
  stepFormGroup!: FormGroup;
  fileList: File[] = [];
  imgToDisplay: string[] = [];
  tripColor!: string;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    public tripService: TripService,
    private mapService: MapService,
    private authService: AuthService
  ) {}
  ngOnInit(): void {
    this.tripId = +this.route.snapshot.params['id'];
    if (this.authService.isLoggedAs() === null) {
      this.router.navigateByUrl('trips/' + this.tripId);
    }
    this.trip$ = this.tripService.getOneTripById(this.tripId).pipe(
      map((trip) => {
        if (!trip) {
          this.router.navigateByUrl('trips');
          return null;
        } else {
          return trip;
        }
      })
    );
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
    this.trip$
      .pipe(
        take(1),
        tap((trip) => {
          if (trip) {
            this.tripColor = trip.color;
            this.mapService.setNewTripLayers([trip]);
            if (trip.steps.length > 0) {
              this.mapService.defineCenterOfMap(
                this.tripService.transformCoordinateStringToArrayOfNumber(
                  trip.steps[trip.steps.length - 1].coordinates
                ),
                5
              );
            }
          }
        })
      )
      .subscribe();
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
  private updateImgToDisplay() {
    this.imgToDisplay = this.fileList.map((file) => URL.createObjectURL(file));
  }
  onGoBackToTrip() {
    this.router.navigateByUrl('trips/' + this.tripId);
  }
  onPlacePinOnMap(event: Event) {
    event.preventDefault();
    this.trip$
      .pipe(
        tap((trip) => {
          if (trip) {
            this.mapService.drawOnMap(trip.color);
          }
        })
      )
      .subscribe();
  }
  onAddAStep(event: Event) {
    event.preventDefault();
    const stepContent = this.stepFormGroup.value;
    const formatedDate = new Date(stepContent.date).getTime();
    this.tripService
      .addAStepToATrip(
        { ...stepContent, date: formatedDate },
        this.tripId,
        this.fileList
      )
      .pipe(
        tap(() => {
          this.mapService.resetNewStepPin();
          this.onGoBackToTrip();
        })
      )
      .subscribe();
  }
  onFileSelectionChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files as FileList;

    if (files.length <= 4 - this.fileList.length) {
      Array.from(files).map((file) => {
        this.fileList.push(file);
      });
      this.updateImgToDisplay();
    }
    target.value = '';
  }
  onDeletePicture(event: Event, index: number) {
    event.preventDefault();
    this.fileList.splice(index, 1);
    this.updateImgToDisplay();
  }
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.mapService.resetNewStepPin();
  }
}
