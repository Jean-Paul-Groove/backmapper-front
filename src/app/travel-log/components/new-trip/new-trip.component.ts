import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { TripColor } from 'src/app/shared/enum/trip-color.enum';
import { TripService } from 'src/app/shared/services/trip.service';
import { CreateTripDto } from '../../dto/create-trip.dto';
import { tap } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Trip } from 'src/app/shared/models/trip.model';

@Component({
  selector: 'app-new-trip',
  templateUrl: './new-trip.component.html',
  styleUrls: ['./new-trip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewTripComponent implements OnInit {
  titleCtrl!: FormControl;
  dateCtrl!: FormControl;
  colorCtrl!: FormControl<
    'vert' | 'bleu' | 'jaune' | 'azur' | 'violet' | 'rose' | 'rouge' | null
  >;
  tripFormGroup!: FormGroup;
  tripColorDictionary = Object.keys(TripColor);
  tripColor = TripColor;

  constructor(
    private formBuilder: FormBuilder,
    public tripService: TripService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedAs() === null) {
      this.router.navigateByUrl('trips');
    }
    this.titleCtrl = this.formBuilder.control('', [Validators.required]);
    this.dateCtrl = this.formBuilder.control('', [Validators.required]);
    this.colorCtrl = this.formBuilder.control('vert', [Validators.required]);
    this.tripFormGroup = this.formBuilder.group({
      title: this.titleCtrl,
      startDate: this.dateCtrl,
      color: this.colorCtrl,
    });
  }
  onAddTrip(event: Event) {
    event.preventDefault();
    const newTripInfo: CreateTripDto = {
      ...this.tripFormGroup.value,
      startDate: new Date(this.dateCtrl.value).getTime(),
    };

    this.tripService
      .addANewTrip(newTripInfo)
      .pipe(
        tap((newTrip) => {
          if (!newTrip) {
            this.router.navigateByUrl('trips');
          } else {
            this.router.navigateByUrl('trips/' + newTrip.id);
          }
        })
      )
      .subscribe();
  }
  onGoBackToTripList() {
    this.router.navigateByUrl('trips');
  }
}
