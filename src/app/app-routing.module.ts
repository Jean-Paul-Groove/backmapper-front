import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TravelLogComponent } from './travel-log/components/travel-log/travel-log.component';
import { SingleTripComponent } from './travel-log/components/single-trip/single-trip.component';
import { NewTripComponent } from './travel-log/components/new-trip/new-trip.component';
import { NewStepComponent } from './travel-log/components/new-step/new-step.component';
import { LoginComponent } from './auth/components/login/login.component';

const routes: Routes = [
  { path: 'trips', component: TravelLogComponent },
  { path: 'trips/new', component: NewTripComponent },
  { path: 'trips/:id/new-step', component: NewStepComponent },
  { path: 'trips/:id', component: SingleTripComponent },
  { path: '', component: LoginComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
