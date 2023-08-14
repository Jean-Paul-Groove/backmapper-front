import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StepComponent } from './components/step/step.component';
import { TravelLogComponent } from './components/travel-log/travel-log.component';
import { SingleTripComponent } from './components/single-trip/single-trip.component';
import { NewTripComponent } from './components/new-trip/new-trip.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NewStepComponent } from './components/new-step/new-step.component';
import { UpdateStepComponent } from './components/update-step/update-step.component';

@NgModule({
  declarations: [
    TravelLogComponent,
    StepComponent,
    SingleTripComponent,
    NewTripComponent,
    NewStepComponent,
    UpdateStepComponent,
  ],
  imports: [CommonModule, ReactiveFormsModule],
  exports: [
    TravelLogComponent,
    StepComponent,
    SingleTripComponent,
    NewTripComponent,
  ],
})
export class TravelLogModule {}
