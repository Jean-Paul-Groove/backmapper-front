import { Component, Input } from '@angular/core';
import { Step } from 'src/app/shared/models/step.model';
import { MapService } from 'src/app/shared/services/map.service';

@Component({
  selector: 'app-step',
  templateUrl: './step.component.html',
  styleUrls: ['./step.component.scss'],
})
export class StepComponent {
  @Input() step!: Step;
  @Input() stepNumber!: number;
  constructor(private mapService: MapService) {}

  onClick() {
    this.mapService.defineCenterOfMap(this.step.coordinates, 6);
  }
}
