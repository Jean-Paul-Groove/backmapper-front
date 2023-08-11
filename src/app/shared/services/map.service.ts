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

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private baseLayersDictionary = [
    { name: 'OSMStandard', value: new TileLayer({ source: new OSM() }) },
    {
      name: 'OSMHumanitarian',
      value: new TileLayer({
        source: new OSM({
          url: 'https://{a-c}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
          attributions:
            'donn&eacute;es &copy; <a href="//osm.org/copyright">OpenStreetMap</a>/ODbL - rendu <a href="//openstreetmap.fr">OSM France</a>',
        }),
        minZoom: 1,
        maxZoom: 20,
      }),
    },
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
  source = new VectorSource();

  private _baseLayer$ = new BehaviorSubject<BaseLayer>(
    this.provideLayer('StamenToner')
  );
  get baseLayer$(): Observable<BaseLayer> {
    return this._baseLayer$.asObservable();
  }
  private _view$ = new BehaviorSubject<{ center: Coordinates; zoom: number }>({
    center: [0, 0],
    zoom: 5,
  });
  get view$(): Observable<{ center: Coordinates; zoom: number }> {
    return this._view$.asObservable();
  }

  private _loading$ = new BehaviorSubject<boolean>(false);
  get loading$(): Observable<boolean> {
    return this._loading$.asObservable();
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

  private provideLayer(layerName: string) {
    return this.baseLayersDictionary
      .filter((layer) => layer.name === layerName)
      .map((layer) => layer.value)[0];
  }

  private addStepsFeatures(trip: Trip): Feature[] {
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
    return [...stepsFeatures, ...lineFeatures];
  }
  private generateLayerFromFeatures(
    trip: Trip,
    features: Feature[]
  ): BaseLayer {
    const tripLayer = new VectorLayer({
      source: new VectorSource({
        features: this.addStepsFeatures(trip),
      }),
      style: new Style({
        image: new Icon({
          src: trip.color
            ? `../../../../assets/pin-${trip.color}.png`
            : '../../../../assets/pin-green.png',
          anchor: [0.5, 1],
        }),
        stroke: new Stroke({
          color: trip.color ? TripColor[trip.color] : 'vert',
          width: 4,
          lineDash: [4, 20],
        }),
      }),
    });
    return tripLayer;
  }
  setNewTripLayers(trips: Trip[]) {
    const updatedTripLayers: BaseLayer[] = [];
    trips.forEach((trip) => {
      if (trip.steps.length > 0) {
        const features = this.addStepsFeatures(trip);
        const tripLayer = this.generateLayerFromFeatures(trip, features);
        updatedTripLayers.push(tripLayer);
      }
    });
    this._tripLayersOnMap$.next(updatedTripLayers);
  }
  defineCenterOfMap(coordinates: Coordinates, zoom: number = 4) {
    this._view$.next({ center: coordinates, zoom: zoom });
  }
  drawOnMap(trip: Trip) {
    const vector = new VectorLayer({
      source: this.source,
      style: new Style({
        image: new Icon({
          src: `../../../../assets/pin-${trip.color}.png`,
          anchor: [0.5, 1],
        }),
      }),
    });

    this._drawingForTrip$.next(vector);
  }
  stopDrowOnMap() {
    this._drawingForTrip$.next(undefined);
  }
  setNewPinCoordinates(coordinates: Coordinates) {
    this._newPinCoordinates$.next(coordinates);
  }
  resetNewStepPin() {
    this._newPinCoordinates$.next(undefined);
    this.source.clear();
  }
}
