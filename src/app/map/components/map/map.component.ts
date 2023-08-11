import { Component, OnInit } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import * as olProj from 'ol/proj';
import { Observable, combineLatest, map, skip, tap } from 'rxjs';
import { TripService } from 'src/app/shared/services/trip.service';
import BaseLayer from 'ol/layer/Base';
import { MapService } from 'src/app/shared/services/map.service';
import { Coordinates } from 'src/app/shared/models/coordinates.model';
import { Collection } from 'ol';

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

  constructor(
    private tripService: TripService,
    private mapService: MapService
  ) {}

  ngOnInit(): void {
    this.initializeObservables();
    this.initializeMap();
    this.displayTrips();
    this.centerMap();
  }

  private initializeObservables() {
    this.baseLayer$ = this.mapService.baseLayer$;
    this.tripLayers$ = this.mapService.tripLayersOnMap$;
    this.view$ = this.mapService.view$;
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

  private displayTrips() {
    combineLatest([this.baseLayer$, this.tripLayers$])
      .pipe(
        map(([baseLayer, tripLayer]) => [baseLayer, ...tripLayer]),
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
  /* private addTripMarkersToLayerGroup(trip: Trip) {
    const stepsCoordinates = trip.steps.map((step) => step.coordinates);
    const stepsFeatures = stepsCoordinates.map(
      (coordinates) =>
        new Feature({
          geometry: new Point(olProj.fromLonLat(coordinates)),
        })
    );
    const lineFeatures: Feature[] = [];
    [...stepsCoordinates]
      .map((coordinate) => olProj.fromLonLat(coordinate))
      .reduce((previousValue, currentValue, index) => {
        if (index == 0) {
          return currentValue;
        }
        const feature = new Feature({
          geometry: new LineString([previousValue, currentValue]),
          name: 'Line',
        });
        lineFeatures.push(feature);
        return currentValue;
      });

    const tripLayer = new VectorLayer({
      source: new VectorSource({
        features: [...stepsFeatures, ...lineFeatures],
      }),
      style: new Style({
        image: new Icon({
          src: trip.color
            ? `../../../../assets/pin-${trip.color}.png`
            : '../../../../assets/pin-green.png',
          anchor: [0.5, 1],
        }),
        stroke: new Stroke({
          color: trip.color ? TripColor[trip.color] : 'green',
          width: 4,
          lineDash: [4, 20],
        }),
      }),
    });

    this.layerCollection.push(tripLayer);
  } */
}
