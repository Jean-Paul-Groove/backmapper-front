import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-new-trip',
  templateUrl: './new-trip.component.html',
  styleUrls: ['./new-trip.component.scss'],
})
export class NewTripComponent implements OnInit {
  titleCtrl!: FormControl;
  dateCtrl!: FormControl;
  colorCtrl!: FormControl;
  tripFormGroup!: FormGroup;
  tripColorDictionary = Object.keys(TripColor);

  constructor(
    private formBuilder: FormBuilder,
    private tripService: TripService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.titleCtrl = this.formBuilder.control('', [Validators.required]);
    this.dateCtrl = this.formBuilder.control('', [Validators.required]);
    this.colorCtrl = this.formBuilder.control('vert', [Validators.required]);
    this.tripFormGroup = this.formBuilder.group({
      title: this.titleCtrl,
      createdDate: this.dateCtrl,
      color: this.colorCtrl,
    });
  }
  onAddTrip() {
    const trip: Trip = { ...this.tripFormGroup.value, id: 0, steps: [] };
    const newTripId = this.tripService.addANewTrip(trip);
    this.router.navigateByUrl(`trips/${newTripId}`);
  }
  onGoBackToTripList() {
    this.router.navigateByUrl('trips');
  }
}