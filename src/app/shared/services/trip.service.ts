import { Injectable } from '@angular/core';
import { Trip } from '../models/trip.model';
import { Observable, of } from 'rxjs';
import { Coordinates } from '../models/coordinates.model';
import { Step } from '../models/step.model';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.development';
import { CreateTripDto } from 'src/app/travel-log/dto/create-trip.dto';

@Injectable({
  providedIn: 'root',
})
export class TripService {
  constructor(private http: HttpClient) {}
  dummyTrips: Trip[] = [
    {
      id: 1,
      title: 'AutoStop',
      startDate: Date.now().toString(),
      steps: [
        {
          id: 1,
          title: 'Montpellier',
          coordinates: '3.876734, 43.611242',
          date: Date.now().toString(),
        },
        {
          id: 2,
          title: 'Turin',
          coordinates: '7.682489, 45.067755',
          date: Date.now().toString(),
          description: "finalement on y est pas allé c'est pour de faux",
        },
        {
          id: 3,
          title: 'Zagreb',
          coordinates: '15.962232, 45.842641',
          date: Date.now().toString(),
        },
      ],
      color: 'azur',
    },
    {
      id: 2,
      title: 'Trip2',
      startDate: Date.now().toString(),
      steps: [
        {
          id: 1,
          title: 'Test',
          coordinates: '3.876734, 47.611242',
          date: Date.now().toString(),
        },
        {
          id: 2,
          title: '2',
          coordinates: '3.682489, 45.067755',
          date: Date.now().toString(),
          description: "finalement on y est pas allé c'est pour de faux",
        },
        {
          id: 3,
          title: '3',
          coordinates: '15.962232, 49.842641',
          date: Date.now().toString(),
        },
      ],
      color: 'jaune',
    },
  ];

  getAllTrips(): Observable<Trip[]> {
    return this.http.get<Trip[]>(`${environment.apiUrl}/trips`);
  }
  addANewTrip(tripInfo: CreateTripDto): Observable<Trip> {
    return this.http.post<Trip>(`${environment.apiUrl}/trips`, tripInfo);
  }
  getOneTripById(id: number): Observable<Trip | null> {
    return this.http.get<Trip | null>(`${environment.apiUrl}/trips/${id}`);
  }
  addAStepToATrip(
    stepContent: {
      title: string;
      description: string;
      coordinates: Coordinates;
      date: string;
    },
    tripId: number,
    fileList: File[]
  ): Observable<Step> {
    if (fileList.length === 0) {
      return this.http.post<Step>(
        `${environment.apiUrl}/trips/${tripId}/step`,
        stepContent
      );
    } else {
      const formData = new FormData();
      fileList.forEach((file) => {
        formData.append('files', file, file.name);
      });
      const body = JSON.stringify(stepContent);
      formData.append('stepInfo', body);
      return this.http.post<Step>(
        `${environment.apiUrl}/trips/${tripId}/step`,
        formData
      );
    }
  }
  removeAStep(id: number): Observable<Step> {
    return this.http.delete<Step>(`${environment.apiUrl}/trips/steps/${id}`);
  }
  updateStep(
    stepContent: {
      title: string;
      description: string;
      coordinates: Coordinates;
      date: string;
      picturesToDelete: string[];
    },
    stepId: number,
    fileList: File[]
  ): Observable<Step> {
    if (fileList.length === 0) {
      return this.http.put<Step>(
        `${environment.apiUrl}/trips/steps/${stepId}`,
        stepContent
      );
    } else {
      const formData = new FormData();
      fileList.forEach((file) => {
        formData.append('files', file, file.name);
      });
      const body = JSON.stringify(stepContent);
      formData.append('stepInfo', body);
      return this.http.post<Step>(
        `${environment.apiUrl}/trips/steps/${stepId}`,
        formData
      );
    }
  }
  transformCoordinateStringToArrayOfNumber(
    coordinateString: string
  ): Coordinates {
    return coordinateString.split(',').map(Number) as Coordinates;
  }
}
