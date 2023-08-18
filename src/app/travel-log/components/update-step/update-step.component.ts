import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subject, map, take, tap, takeUntil } from 'rxjs';
import { TripColor } from 'src/app/shared/enum/trip-color.enum';
import { Coordinates } from 'src/app/shared/models/coordinates.model';
import { Step } from 'src/app/shared/models/step.model';
import { AuthService } from 'src/app/shared/services/auth.service';
import { MapService } from 'src/app/shared/services/map.service';
import { TripService } from 'src/app/shared/services/trip.service';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-update-step',
  templateUrl: './update-step.component.html',
  styleUrls: ['./update-step.component.scss'],
})
export class UpdateStepComponent {
  @Input() step!: Step;
  @Input() tripColor!: string;
  @Input() tripId!: number;
  @Output() stepIsEdited = new EventEmitter<boolean>();
  @Output() goBackToStep = new EventEmitter<boolean>();
  newStepCoordinates$!: Observable<Coordinates | undefined>;
  titleCtrl!: FormControl;
  dateCtrl!: FormControl;
  descriptionCtrl!: FormControl;
  coordinatesCtrl!: FormControl;
  stepFormGroup!: FormGroup;
  tripColorKey!: string;
  apiUrl = environment.apiUrl;
  imgUrlPrefix = '';
  fileList: File[] = [];
  imgToDisplay: string[] = [];
  currentPictures: string[] = [];
  picturesToDelete: string[] = [];
  pictureCount!: number;
  private destroy$!: Subject<boolean>;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private tripService: TripService,
    private mapService: MapService,
    private authService: AuthService
  ) {}
  ngOnInit(): void {
    this.newStepCoordinates$ = this.mapService.newPinCoordinates$;
    this.destroy$ = new Subject<boolean>();
    this.initializeCurrentStepPin();
    this.initializeForm();
    this.getCoordinates();
    if (this.authService.isLoggedAs() !== 'guest') {
      this.imgUrlPrefix = this.apiUrl + '/';
    }
    this.tripColorKey =
      Object.keys(TripColor)[
        Object.values(TripColor).indexOf(this.tripColor as unknown as TripColor)
      ];
    if (this.step.pictures) {
      this.currentPictures = this.step.pictures.split(',');
    }
    this.updatePictureCount();
  }
  private initializeCurrentStepPin() {
    this.mapService.setSinglePin(this.step, this.tripColorKey);
    const initialCoordinates = this.step.coordinates
      .split(',')
      .map((coordinateString) => +coordinateString);
    this.mapService.setNewPinCoordinates(initialCoordinates as Coordinates);
  }
  private initializeForm() {
    this.titleCtrl = this.formBuilder.control(`${this.step.title}`, [
      Validators.required,
    ]);
    this.dateCtrl = this.formBuilder.control<Date>(new Date(+this.step.date), [
      Validators.required,
    ]);
    if (this.step.description) {
      this.descriptionCtrl = this.formBuilder.control(
        `${this.step.description}`
      );
    } else {
    }
    this.descriptionCtrl = this.formBuilder.control(``);
    this.coordinatesCtrl = this.formBuilder.control('', [Validators.required]);
    this.stepFormGroup = this.formBuilder.group({
      title: this.titleCtrl,
      date: this.dateCtrl,
      coordinates: this.coordinatesCtrl,
      description: this.descriptionCtrl,
    });
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
  onGoBackToStep(event: Event) {
    event.preventDefault();
    this.goBackToStep.emit(true);
  }
  onPlacePinOnMap(event: Event) {
    event.preventDefault();
    this.mapService.drawOnMap(this.tripColorKey);
  }
  private updatePictureCount() {
    this.pictureCount =
      this.currentPictures.length -
      this.picturesToDelete.length +
      this.fileList.length;
  }
  private checkIfChangesMade(formatedDate: number) {
    if (
      this.titleCtrl.value === this.step.title &&
      this.descriptionCtrl.value === this.step.description &&
      formatedDate.toString() === this.step.date &&
      this.coordinatesCtrl.value.toString() === this.step.coordinates &&
      this.fileList.length === 0 &&
      this.picturesToDelete.length === 0
    ) {
      return false;
    }
    return true;
  }
  onUpdateStep(event: Event) {
    event.preventDefault();
    const stepContent = this.stepFormGroup.value;
    if (this.picturesToDelete.length > 0) {
      stepContent.picturesToDelete = this.picturesToDelete;
    }
    const formatedDate = new Date(stepContent.date).getTime();
    if (this.checkIfChangesMade(formatedDate) === false) {
      this.goBackToStep.emit(true);
      return;
    }
    this.tripService
      .updateStep(
        { ...stepContent, date: formatedDate },
        this.step.id,
        this.fileList,
        this.tripId
      )
      .pipe(
        tap(() => {
          this.stepIsEdited.emit(true);
        })
      )
      .subscribe();
  }
  onFileSelectionChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files as FileList;

    if (files.length <= 4 - this.pictureCount) {
      Array.from(files).map((file) => {
        this.fileList.push(file);
      });
      this.updateImgToDisplay();
      this.updatePictureCount();
    }
    target.value = '';
  }
  onDeleteCurrentPicture(event: Event, index: number) {
    event.preventDefault();
    this.picturesToDelete.push(this.currentPictures[index]);
    this.updatePictureCount();
  }
  onCancelDeleteCurrentPicture(event: Event, picture: string) {
    event.preventDefault();
    if (this.pictureCount < 4) {
      const indexOfPicture = this.picturesToDelete.indexOf(picture);
      this.picturesToDelete.splice(indexOfPicture, 1);
      this.updatePictureCount();
    }
  }
  onDeleteUploadPicture(event: Event, index: number) {
    event.preventDefault();
    this.fileList.splice(index, 1);
    this.updateImgToDisplay();
    this.updatePictureCount();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.mapService.resetNewStepPin();
  }
}
