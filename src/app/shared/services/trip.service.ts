import { Injectable } from '@angular/core';
import { Trip } from '../models/trip.model';
import { Observable, of } from 'rxjs';
import { Coordinates } from '../models/coordinates.model';
import { Step } from '../models/step.model';

@Injectable({
  providedIn: 'root',
})
export class TripService {
  dummyTrips: Trip[] = [
    {
      id: 1,
      title: 'AutoStop',
      createdDate: Date.now().toString(),
      steps: [
        {
          id: 1,
          title: 'Montpellier',
          coordinates: [3.876734, 43.611242],
          date: Date.now().toString(),
        },
        {
          id: 2,
          title: 'Turin',
          coordinates: [7.682489, 45.067755],
          date: Date.now().toString(),
          description: "finalement on y est pas allé c'est pour de faux",
        },
        {
          id: 3,
          title: 'Zagreb',
          coordinates: [15.962232, 45.842641],
          date: Date.now().toString(),
        },
      ],
      color: 'azur',
    },
    {
      id: 2,
      title: 'Trip2',
      createdDate: Date.now().toString(),
      steps: [
        {
          id: 1,
          title: 'Test',
          coordinates: [3.876734, 47.611242],
          date: Date.now().toString(),
        },
        {
          id: 2,
          title: '2',
          coordinates: [3.682489, 45.067755],
          date: Date.now().toString(),
          description: "finalement on y est pas allé c'est pour de faux",
        },
        {
          id: 3,
          title: '3',
          coordinates: [15.962232, 49.842641],
          date: Date.now().toString(),
        },
      ],
      color: 'jaune',
    },
    {
      id: 3,
      title: 'AutoStop',
      createdDate: Date.now().toString(),
      steps: [
        {
          id: 1,
          title: 'Montpellier',
          coordinates: [3.876734, 43.611242],
          date: Date.now().toString(),
        },
        {
          id: 2,
          title: 'Turin',
          coordinates: [7.682489, 45.067755],
          date: Date.now().toString(),
          description: "finalement on y est pas allé c'est pour de faux",
        },
        {
          id: 3,
          title: 'Zagreb',
          coordinates: [15.962232, 45.842641],
          date: Date.now().toString(),
        },
      ],
      color: 'azur',
    },
    {
      id: 4,
      title: 'Trip2',
      createdDate: Date.now().toString(),
      steps: [
        {
          id: 1,
          title: 'Test',
          coordinates: [3.876734, 47.611242],
          date: Date.now().toString(),
        },
        {
          id: 2,
          title: '2',
          coordinates: [3.682489, 45.067755],
          date: Date.now().toString(),
          description: "finalement on y est pas allé c'est pour de faux",
        },
        {
          id: 3,
          title: '3',
          coordinates: [15.962232, 49.842641],
          date: Date.now().toString(),
        },
      ],
      color: 'jaune',
    },
    {
      id: 5,
      title: 'AutoStop',
      createdDate: Date.now().toString(),
      steps: [
        {
          id: 1,
          title: 'Montpellier',
          coordinates: [3.876734, 43.611242],
          date: Date.now().toString(),
        },
        {
          id: 2,
          title: 'Turin',
          coordinates: [7.682489, 45.067755],
          date: Date.now().toString(),
          description: "finalement on y est pas allé c'est pour de faux",
        },
        {
          id: 3,
          title: 'Zagreb',
          coordinates: [15.962232, 45.842641],
          date: Date.now().toString(),
        },
      ],
      color: 'azur',
    },
    {
      id: 6,
      title: 'Trip2',
      createdDate: Date.now().toString(),
      steps: [
        {
          id: 1,
          title: 'Test',
          coordinates: [3.876734, 47.611242],
          date: Date.now().toString(),
        },
        {
          id: 2,
          title: '2',
          coordinates: [3.682489, 45.067755],
          date: Date.now().toString(),
          description: "finalement on y est pas allé c'est pour de faux",
        },
        {
          id: 3,
          title: '3',
          coordinates: [15.962232, 49.842641],
          date: Date.now().toString(),
        },
      ],
      color: 'jaune',
    },
  ];

  getAllTrips(): Observable<Trip[]> {
    return of(this.dummyTrips);
  }
  addANewTrip(trip: Trip) {
    const lastId = this.dummyTrips.sort((a, b) => a.id - b.id)[
      this.dummyTrips.length - 1
    ].id;
    this.dummyTrips.push({ ...trip, id: lastId + 1 });
    return lastId + 1;
  }
  getOneTripById(id: number) {
    const trip = this.dummyTrips.filter((trip) => trip.id === id)[0];
    return trip ? trip : false;
  }
  addAStepToATrip(
    stepContent: {
      title: string;
      description: string;
      coordinates: Coordinates;
      date: string;
    },
    tripId: number
  ) {
    const trip = this.getOneTripById(tripId);
    if (!trip) {
      return;
    }
    const lastStepId = trip.steps[0]
      ? trip.steps.sort((a, b) => a.id - b.id)[trip.steps.length - 1].id
      : 0;
    const newStep: Step = {
      ...stepContent,
      id: lastStepId + 1,
    };
    trip.steps.push(newStep);
  }
}
