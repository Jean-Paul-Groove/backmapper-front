import { Injectable } from '@angular/core';
import BaseLayer from 'ol/layer/Base';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import { BehaviorSubject, Observable, of, take } from 'rxjs';
import { Trip } from '../models/trip.model';
import { Feature } from 'ol';
import { LineString, Point } from 'ol/geom';
import * as olProj from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Icon from 'ol/style/Icon';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import { TripColor } from '../enum/trip-color.enum';
import { Coordinates } from '../models/coordinates.model';
import { TripService } from './trip.service';
import { Step } from '../models/step.model';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  constructor(private tripService: TripService) {}

  //Déclarations des variables liées au paramétrage de la carte
  mapAnimationDuration = 1500;
  source = new VectorSource();
  tripsInfo: { [key: string]: any } = {};
  private tripLines: [width: number, spacing: number] = [10, 10];
  baseLayersDictionary = [
    { name: 'OSMStandard', value: new TileLayer({ source: new OSM() }) },
    {
      name: 'StamenTerrain',
      value: new TileLayer({
        source: new XYZ({
          url: 'http://tile.stamen.com/terrain/{z}/{x}/{y}.jpg',
          attributions:
            'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/4.0">CC BY 4.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.',
        }),
      }),
    },
    {
      name: 'StamenToner',
      value: new TileLayer({
        source: new XYZ({
          url: 'http://tile.stamen.com/toner/{z}/{x}/{y}.jpg',
          attributions:
            'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/4.0">CC BY 4.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.',
        }),
      }),
    },
  ];

  defaultView: { center: Coordinates } = {
    center: [15, 50],
  };
  private mapIsAlreadyCentering = false;

  //Déclaration des béhaviour subjects pour le reactive state management
  private _baseLayer$ = new BehaviorSubject<BaseLayer>(
    this.provideLayer('OSMStandard')
  );
  get baseLayer$(): Observable<BaseLayer> {
    return this._baseLayer$.asObservable();
  }
  private _baseLayerName$ = new BehaviorSubject<string>('StamenToner');
  get baseLayerName$(): Observable<string> {
    return this._baseLayerName$.asObservable();
  }
  private _view$ = new BehaviorSubject<{ center: Coordinates; zoom: number }>({
    center: [0, 0],
    zoom: 5,
  });
  get view$(): Observable<{ center: Coordinates; zoom: number }> {
    return this._view$.asObservable();
  }
  private _newPinCoordinates$ = new BehaviorSubject<Coordinates | undefined>(
    undefined
  );
  get newPinCoordinates$(): Observable<Coordinates | undefined> {
    return this._newPinCoordinates$.asObservable();
  }

  private _drawingForTrip$ = new BehaviorSubject<undefined | BaseLayer>(
    undefined
  );
  get drawingForTrip$(): Observable<undefined | BaseLayer> {
    return this._drawingForTrip$.asObservable();
  }

  private _tripLayersOnMap$ = new BehaviorSubject<BaseLayer[]>([]);
  get tripLayersOnMap$(): Observable<BaseLayer[]> {
    return this._tripLayersOnMap$.asObservable();
  }
  private _loading$ = new BehaviorSubject<boolean>(false);
  get loading$(): Observable<boolean> {
    return this._loading$.asObservable();
  }

  //Déclaration de méthodes propres au service
  private provideLayer(layerName: string) {
    return this.baseLayersDictionary
      .filter((layer) => layer.name === layerName)
      .map((layer) => layer.value)[0];
  }
  private addStepsFeatures(trip: Trip): Feature[] {
    let tripDistance = 0;
    let tripDurationInMs = 0;
    const sortedTripSteps =
      trip.steps.length > 1
        ? trip.steps.sort((a, b) => +a.date - +b.date)
        : trip.steps;
    const stepsCoordinates = sortedTripSteps.map((step) =>
      this.tripService.transformCoordinateStringToArrayOfNumber(
        step.coordinates
      )
    );

    tripDurationInMs =
      +sortedTripSteps[sortedTripSteps.length - 1].date - +trip.startDate;
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
        const line = new LineString([previousValue, currentValue]);
        tripDistance = tripDistance + line.getLength();
        const feature = new Feature({
          geometry: line,
          name: 'Line',
        });
        lineFeatures.push(feature);
        return currentValue;
      });

    this.tripsInfo[`${trip.title}`] = {
      distance: tripDistance,
      duration: tripDurationInMs,
      startedIn: trip.startDate,
    };
    return [...stepsFeatures, ...lineFeatures];
  }
  private generateLayerFromFeatures(
    trip: Trip,
    features: Feature[]
  ): BaseLayer {
    const tripLayer = new VectorLayer({
      source: new VectorSource({
        features: features,
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
          lineDash: this.tripLines,
        }),
      }),
    });
    return tripLayer;
  }
  private setLoading(state: boolean) {
    this._loading$.next(state);
  }
  //Déclaration de méthodes destinées aux autres composants pour intéragir avec la carte
  setNewBaseLayer(layerName: string) {
    this._baseLayer$.next(this.provideLayer(layerName));
    this._baseLayerName$.next(layerName);
  }

  setNewTripLayers(trips: Trip[]) {
    this.setLoading(true);
    const updatedTripLayers: BaseLayer[] = [];
    for (const trip of trips) {
      if (trip.steps.length > 0) {
        const features = this.addStepsFeatures(trip);
        const tripLayer = this.generateLayerFromFeatures(trip, features);
        updatedTripLayers.push(tripLayer);
      }
    }
    this._tripLayersOnMap$.next(updatedTripLayers);
    this.setLoading(false);
  }
  clearTripLayers() {
    this._tripLayersOnMap$.next([]);
  }
  setSinglePin(step: Step, tripColor: string) {
    const feature = new Feature({
      geometry: new Point(
        olProj.fromLonLat(
          this.tripService.transformCoordinateStringToArrayOfNumber(
            step.coordinates
          )
        )
      ),
    });
    this.source.addFeature(feature);
    const pinLayer = new VectorLayer({
      source: this.source,
      style: new Style({
        image: new Icon({
          src: tripColor
            ? `../../../../assets/pin-${tripColor}.png`
            : '../../../../assets/pin-green.png',
          anchor: [0.5, 1],
        }),
      }),
    });
  }

  defineCenterOfMap(coordinates: Coordinates, zoom: number = 4) {
    if (this.mapIsAlreadyCentering) {
      return;
    }
    const actualView = this._view$.getValue();
    if (
      actualView.center[0] === coordinates[0] &&
      actualView.center[1] === coordinates[1] &&
      actualView.zoom == zoom
    ) {
      return;
    } else {
      const steps: any[] = Array.from(
        document.getElementsByClassName('travel-step')
      );
      setTimeout(() => {
        this.mapIsAlreadyCentering = false;
        for (const step of steps) {
          step.style.cursor = 'pointer';
        }
      }, this.mapAnimationDuration * 2);

      this._view$.next({ center: coordinates, zoom: zoom });
      this.mapIsAlreadyCentering = true;
      for (const step of steps) {
        step.style.cursor = 'wait';
      }
    }
  }

  drawOnMap(tripColor: string) {
    this.setLoading(true);
    const vector = new VectorLayer({
      source: this.source,
      style: new Style({
        image: new Icon({
          src: `../../../../assets/pin-${tripColor}.png`,
          anchor: [0.5, 1],
        }),
      }),
    });

    this._drawingForTrip$.next(vector);
    this.setLoading(false);
  }
  stopDrowOnMap() {
    this._drawingForTrip$.next(undefined);
  }
  setNewPinCoordinates(coordinates: Coordinates) {
    this._newPinCoordinates$.next(coordinates);
  }
  resetNewStepPin() {
    this._newPinCoordinates$.next(undefined);
    this.stopDrowOnMap();
    this.source = new VectorSource();
  }
}
