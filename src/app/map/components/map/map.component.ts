import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import * as olProj from 'ol/proj';
import { Observable, combineLatest, map, skip, tap } from 'rxjs';
import BaseLayer from 'ol/layer/Base';
import { MapService } from 'src/app/shared/services/map.service';
import { Coordinates } from 'src/app/shared/models/coordinates.model';
import { Draw } from 'ol/interaction.js';
import { Point } from 'ol/geom';
import { defaults } from 'ol/control/defaults';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent implements OnInit {
  map!: Map;
  baseLayer$!: Observable<BaseLayer>;
  tripLayers$!: Observable<BaseLayer[]>;
  view$!: Observable<{ center: Coordinates; zoom: number }>;
  drawingForTrip$!: Observable<undefined | BaseLayer>;
  mapElement!: HTMLElement;
  mapWidthInPx!: number;
  mapRightPadding!: number;
  layerPickerOpen!: boolean;

  constructor(public mapService: MapService) {}

  ngOnInit(): void {
    this.initializeObservables();
    this.initializeMapwidthAndPadding();
    this.initializeMap();
    this.combineLayers();
    this.centerMap();
    this.drawOnMap();
  }

  private initializeObservables() {
    this.baseLayer$ = this.mapService.baseLayer$;
    this.tripLayers$ = this.mapService.tripLayersOnMap$;
    this.view$ = this.mapService.view$;
    this.drawingForTrip$ = this.mapService.drawingForTrip$;
  }

  private initializeMapwidthAndPadding() {
    const element = document.getElementById('map-root');
    if (element) {
      this.mapElement = document.getElementById('map-root') as HTMLElement;
      this.mapWidthInPx = +window
        .getComputedStyle(this.mapElement)
        .width.split('px')[0];
      this.mapRightPadding =
        this.mapWidthInPx > 650 ? this.mapWidthInPx * 0.3 : 0;
    }
  }

  private initializeMap() {
    const defaultView = this.mapService.defaultView;
    this.map = new Map({
      target: 'map-root',
      layers: [],
      view: new View({
        center: olProj.fromLonLat(defaultView.center),
        zoom: 2,
        padding: [0, this.mapRightPadding, 0, 0],
      }),
      controls: defaults({ rotate: false }),
    });
  }

  private combineLayers() {
    combineLatest([this.baseLayer$, this.tripLayers$, this.drawingForTrip$])
      .pipe(
        map(([baseLayer, tripLayer, drawingForTrip]) =>
          drawingForTrip
            ? [baseLayer, ...tripLayer, drawingForTrip]
            : [baseLayer, ...tripLayer]
        ),
        tap((layers) => {
          this.map.setLayers(layers);
        })
      )
      .subscribe();
  }
  private centerMap() {
    this.view$
      .pipe(
        skip(1),
        map((view) => {
          return { center: olProj.fromLonLat(view.center), zoom: view.zoom };
        }),
        tap((view) => {
          this.map.getView().animate(
            {
              center: view.center,
              duration: this.mapService.mapAnimationDuration,
            },
            {
              zoom: view.zoom,
              duration: this.mapService.mapAnimationDuration,
            }
          );
        })
      )
      .subscribe();
  }

  private drawOnMap() {
    this.drawingForTrip$
      .pipe(
        tap((drawingForTrip) => {
          const draw = new Draw({
            source: this.mapService.source,
            type: 'Point',
          });
          if (drawingForTrip) {
            draw.once('drawend', (evt) => {
              this.map.removeInteraction(draw);
              this.mapService.source.clear();
              const p = evt.feature.getGeometry() as Point;
              const coordinates = olProj.toLonLat(
                p.getCoordinates()
              ) as Coordinates;

              this.mapService.setNewPinCoordinates(coordinates);
            });
            this.map.addInteraction(draw);
          } else {
            draw.abortDrawing();
            this.map.removeInteraction(draw);
          }
        })
      )
      .subscribe();
  }
  onOpenLayerPicker() {
    this.layerPickerOpen = true;
  }
}
