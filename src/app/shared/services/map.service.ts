import { Injectable } from '@angular/core';
import BaseLayer from 'ol/layer/Base';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import { BehaviorSubject, Observable } from 'rxjs';
import { Trip } from '../models/trip.model';
import { Feature, Overlay, View } from 'ol';
import { LineString, Point } from 'ol/geom';
import * as olProj from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Icon from 'ol/style/Icon';
import { TripColor } from '../enum/trip-color.enum';
import { Coordinates } from '../models/coordinates.model';
import { TripService } from './trip.service';
import { Step } from '../models/step.model';
import { Fill, Stroke, Style, Text } from 'ol/style';
import { FeatureLike } from 'ol/Feature';
import Map from 'ol/Map';
import { defaults } from 'ol/control/defaults';

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
      name: 'Humanitarian',
      value: new TileLayer({
        source: new XYZ({
          url: 'https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
          attributions:
            '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap Contributors.</a> Tile style by <a href="https://www.hotosm.org/">Humanitarian OpenStreetMap Team</a>',
        }),
      }),
    },
  ];

  defaultView: { center: Coordinates } = {
    center: [15, 50],
  };
  private mapIsAlreadyCentering = false;

  map = new Map({
    layers: [],
    view: new View({
      center: olProj.fromLonLat(this.defaultView.center),
      zoom: 2,
    }),
    controls: defaults({ rotate: false }),
  });

  popupOverlay = new Overlay({
    offset: [5, 10],
    className: 'popupoverlay',
  });
  //Déclaration des béhaviour subjects pour le reactive state management
  private _baseLayer$ = new BehaviorSubject<BaseLayer>(
    this.provideLayer('OSMStandard')
  );
  get baseLayer$(): Observable<BaseLayer> {
    return this._baseLayer$.asObservable();
  }
  private _baseLayerName$ = new BehaviorSubject<string>('OSMStandard');
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
    const stepsFeatures = sortedTripSteps.map((step, index) => {
      const featureCoordinates = olProj.fromLonLat(
        this.tripService.transformCoordinateStringToArrayOfNumber(
          step.coordinates
        )
      );
      const feature = new Feature({
        geometry: new Point(featureCoordinates),
        name: step.title,
        stepNumber: index + 1,
        id: 'step' + step.id,
        tripColor: trip.color ? TripColor[trip.color] : 'green',
        stepCoordinates: featureCoordinates,
      });
      return feature;
    });

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
    const tripLines = this.tripLines;
    const tripLayer = new VectorLayer({
      source: new VectorSource({
        features: features,
      }),
      style: function (feature: FeatureLike) {
        const style = new Style({
          text: new Text({
            text: feature.getProperties()['stepNumber']?.toString(),
            font: '15px flix',
            offsetY: -30,
            fill: new Fill({
              color: trip.color ? TripColor[trip.color] : 'green',
            }),
          }),
          image: new Icon({
            src: trip.color
              ? `../../../../assets/pin-${trip.color}.png`
              : '../../../../assets/pin-green.png',
            anchor: [0.5, 1],
          }),
          stroke: new Stroke({
            color: trip.color ? TripColor[trip.color] : 'green',
            width: 4,
            lineDash: tripLines,
          }),
        });
        return style;
      },
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
  }

  defineCenterOfMap(coordinates: Coordinates, zoom: number = 4) {
    if (this.mapIsAlreadyCentering) {
      return;
    }
    const actualView = this._view$.getValue();
    const currentZoom = this.map.getView().getZoom();
    if (
      actualView.center[0] === coordinates[0] &&
      actualView.center[1] === coordinates[1] &&
      currentZoom &&
      currentZoom >= zoom
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
      this._view$.next({
        center: coordinates,
        zoom: currentZoom && currentZoom > zoom ? currentZoom : zoom,
      });
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
  hidePopUpOverlay() {
    this.popupOverlay.setPosition(undefined);
    const listeners = this.map.getListeners('click');
    listeners?.forEach((listener) =>
      this.map.removeEventListener('click', listener)
    );
  }
}
