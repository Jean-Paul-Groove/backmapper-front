import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { tap } from 'rxjs';
import { Step } from 'src/app/shared/models/step.model';
import { MapService } from 'src/app/shared/services/map.service';
import { TripService } from 'src/app/shared/services/trip.service';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-step',
  templateUrl: './step.component.html',
  styleUrls: ['./step.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepComponent {
  @Input() step!: Step;
  @Input() stepNumber!: number;
  @Input() tripColor!: string;
  @Output() stepIsModified = new EventEmitter<boolean>();
  apiUrl = environment.apiUrl;
  deleteModal = false;
  editModal = false;
  editbuttonsVisible = false;

  constructor(
    private mapService: MapService,
    private tripService: TripService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  onClick() {
    this.mapService.defineCenterOfMap(
      this.tripService.transformCoordinateStringToArrayOfNumber(
        this.step.coordinates
      ),
      6
    );
    this.editbuttonsVisible = !this.editbuttonsVisible;
  }
  onDeleteStep(event: Event) {
    event.preventDefault();
    this.deleteModal = true;
  }
  onEditStep(event: Event) {
    event.preventDefault();
    this.editModal = true;
  }
  onCancelEditStep() {
    this.editModal = false;
  }
  onCancelDelete(event: Event) {
    event.preventDefault();
    this.deleteModal = false;
  }
  onConfirmDelete(event: Event) {
    this.tripService
      .removeAStep(this.step.id)
      .pipe(tap(() => this.stepIsModified.emit(true)))
      .subscribe();
  }
  onStepIsEdited() {
    this.stepIsModified.emit(true);
  }
}
