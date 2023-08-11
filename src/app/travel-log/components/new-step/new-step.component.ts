import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-new-step',
  templateUrl: './new-step.component.html',
  styleUrls: ['./new-step.component.scss'],
})
export class NewStepComponent implements OnInit {
  titleCtrl!: FormControl;
  dateCtrl!: FormControl;
  descriptionCtrl!: FormControl;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  ngOnInit(): void {
    this.titleCtrl = this.formBuilder.control('', [Validators.required]);
    this.dateCtrl = this.formBuilder.control('', [Validators.required]);
    this.descriptionCtrl = this.formBuilder.control('');
  }
  onGoBackToTrip() {
    const tripId = this.route.snapshot.params['id'];
    this.router.navigateByUrl('trips/' + tripId);
  }
  onAddAStep() {}
}
