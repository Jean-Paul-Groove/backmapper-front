import { Component, OnInit } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import * as olProj from 'ol/proj';
import {
  Observable,
  combineLatest,
  map,
  skip,
  take,
  takeUntil,
  takeWhile,
  tap,
} from 'rxjs';
import BaseLayer from 'ol/layer/Base';
import { MapService } from 'src/app/shared/services/map.service';
import { Coordinates } from 'src/app/shared/models/coordinates.model';
import { Draw, Modify } from 'ol/interaction.js';
import { Point } from 'ol/geom';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  map!: Map;
  baseLayer$!: Observable<BaseLayer>;
  tripLayers$!: Observable<BaseLayer[]>;
  view$!: Observable<{ center: Coordinates; zoom: number }>;
  drawingForTrip$!: Observable<undefined | BaseLayer>;

  constructor(private mapService: MapService) {}

  ngOnInit(): void {
    this.initializeObservables();
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

  private initializeMap() {
    const defaultView = this.mapService.defaultView;
    this.map = new Map({
      target: 'map-root',
      layers: [],
      view: new View({
        center: olProj.fromLonLat(defaultView.center),
        zoom: 2,
      }),
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
          this.map
            .getView()
            .animate(
              { center: view.center, duration: 500 },
              { zoom: view.zoom, duration: 1000 }
            );
        })
      )
      .subscribe();
  }

  private drawOnMap() {
    this.drawingForTrip$
      .pipe(
        tap((drawingForTrip) => {
          if (drawingForTrip) {
            const draw = new Draw({
              source: this.mapService.source,
              type: 'Point',
            });
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
          }
        })
      )
      .subscribe();
  }
}
