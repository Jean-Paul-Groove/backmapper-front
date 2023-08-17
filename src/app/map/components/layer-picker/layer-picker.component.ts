import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { take, tap } from 'rxjs';
import { MapService } from 'src/app/shared/services/map.service';

@Component({
  selector: 'app-layer-picker',
  templateUrl: './layer-picker.component.html',
  styleUrls: ['./layer-picker.component.scss'],
})
export class LayerPickerComponent implements OnInit {
  selectCtrl!: FormControl;
  currentBaseLayer!: string;
  layerEnum = this.mapService.baseLayersDictionary.map((layer) => layer.name);
  @Output() layerSelected = new EventEmitter<boolean>();

  constructor(
    public mapService: MapService,
    private formBuilder: FormBuilder
  ) {}
  ngOnInit(): void {
    this.mapService.baseLayerName$
      .pipe(
        take(1),
        tap((name) => {
          this.currentBaseLayer = name;
        })
      )
      .subscribe();
    this.selectCtrl = this.formBuilder.control(this.currentBaseLayer);
  }
  onLayerSelected() {
    this.mapService.setNewBaseLayer(this.selectCtrl.value);
    this.layerSelected.emit(true);
  }
}
