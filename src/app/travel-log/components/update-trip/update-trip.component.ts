import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { TripColor } from 'src/app/shared/enum/trip-color.enum';
import { Trip } from 'src/app/shared/models/trip.model';
import { TripService } from 'src/app/shared/services/trip.service';
import { CreateTripDto } from '../../dto/create-trip.dto';
import { tap } from 'rxjs';

@Component({
  selector: 'app-update-trip',
  templateUrl: './update-trip.component.html',
  styleUrls: ['./update-trip.component.scss'],
})
export class UpdateTripComponent implements OnInit {
  @Input() trip!: Trip;
  @Output() backToTrip = new EventEmitter<boolean>();
  @Output() tripUdated = new EventEmitter<boolean>();

  titleCtrl!: FormControl;
  dateCtrl!: FormControl;
  colorCtrl!: FormControl<
    'vert' | 'bleu' | 'jaune' | 'azur' | 'violet' | 'rose' | 'rouge' | null
  >;
  tripFormGroup!: FormGroup;
  tripColorDictionary = Object.keys(TripColor);
  tripColor = TripColor;
  tripDeletionModal = false;

  constructor(
    private formBuilder: FormBuilder,
    private tripService: TripService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.titleCtrl = this.formBuilder.control(this.trip.title, [
      Validators.required,
    ]);
    this.dateCtrl = this.formBuilder.control(this.trip.startDate, [
      Validators.required,
    ]);
    this.colorCtrl = this.formBuilder.control(this.trip.color, [
      Validators.required,
    ]);
    this.tripFormGroup = this.formBuilder.group({
      title: this.titleCtrl,
      startDate: this.dateCtrl,
      color: this.colorCtrl,
    });
  }
  onGoBackToTrip(event: Event) {
    event.preventDefault();
    this.backToTrip.emit(true);
  }
  onUpdateTrip(event: Event) {
    event.preventDefault();
    const newTripInfo: CreateTripDto = {
      ...this.tripFormGroup.value,
      startDate:
        this.trip.startDate === this.dateCtrl.value
          ? this.trip.startDate
          : new Date(this.dateCtrl.value).getTime(),
    };
    this.tripService
      .updateTrip(this.trip.id, newTripInfo)
      .pipe(
        tap(() => {
          this.tripUdated.emit(true);
          this.backToTrip.emit(true);
        })
      )
      .subscribe();
  }
  onDeleteTrip(event: Event) {
    event.preventDefault();
    this.tripDeletionModal = true;
  }
  onConfirmTripDeletion(event: Event) {
    event.preventDefault();
    this.tripService
      .deleteTrip(this.trip.id)
      .pipe(tap(() => this.router.navigateByUrl('trips')))
      .subscribe();
  }
  onCancelTripDeletion(event: Event) {
    event.preventDefault();
    this.tripDeletionModal = false;
  }
}
