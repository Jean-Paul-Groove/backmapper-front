import { Injectable } from '@angular/core';
import { Trip } from '../models/trip.model';
import { BehaviorSubject, Observable, catchError, of, tap } from 'rxjs';
import { Coordinates } from '../models/coordinates.model';
import { Step } from '../models/step.model';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { CreateTripDto } from 'src/app/travel-log/dto/create-trip.dto';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class TripService {
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}
  dummyTrips: Trip[] = [
    {
      id: 1,
      title: 'Croatie en Stop!',
      startDate: Date.now().toString(),
      steps: [
        {
          id: 1,
          title: 'Montpellier',
          coordinates: '3.876734, 43.611242',
          date: Date.now().toString(),
          description: 'Premier voyage éditable',
        },
        {
          id: 2,
          title: 'Turin',
          coordinates: '7.682489, 45.067755',
          date: Date.now().toString(),
          description:
            "Ahh l'Italie .... ou bien le Canada ? Où vous voulez en fait",
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
      title: 'Editez moi !',
      startDate: Date.now().toString(),
      steps: [
        {
          id: 1,
          title: 'Etape',
          coordinates: '3.876734, 47.611242',
          date: Date.now().toString(),
        },
        {
          id: 2,
          title: 'Etape 2',
          coordinates: '3.682489, 45.067755',
          date: Date.now().toString(),
          description:
            'Si vous me cliquez dessus vous pourrez soit me supprimer soit changer mon contenu et même rajouter des photos !! Essayez pour voir ;)',
        },
        {
          id: 3,
          title: 'Etape 3',
          coordinates: '15.962232, 49.842641',
          date: Date.now().toString(),
          description:
            'Si vous cliquez sur le petit crayon en haut à droite vous pourrez modifier le voyage: -titre; -date; -couleur;',
        },
      ],
      color: 'jaune',
    },
  ];
  private _loading$ = new BehaviorSubject<boolean>(false);
  get loading$(): Observable<boolean> {
    return this._loading$.asObservable();
  }
  getAllTrips(): Observable<Trip[] | null> {
    if (this.authService.isLoggedAs() === 'guest') {
      return of(this.dummyTrips);
    }
    this.setLoading(true);
    const trips = this.http.get<Trip[]>(`${environment.apiUrl}/trips`).pipe(
      tap(() => this.setLoading(false)),
      catchError((error: HttpErrorResponse) => {
        this.setLoading(false);
        this.errorHandler(error, 'getResource', 'les voyages');
        return of(null);
      })
    );
    return trips;
  }
  getOneTripById(id: number): Observable<Trip | null | null> {
    if (this.authService.isLoggedAs() === 'guest') {
      return of(this.getOneTripByIdAsGuest(id));
    }

    this.setLoading(true);
    const trip = this.http
      .get<Trip | null | null>(`${environment.apiUrl}/trips/${id}`)
      .pipe(
        tap(() => {
          this.setLoading(false);
        }),
        catchError((error: HttpErrorResponse) => {
          this.setLoading(false);
          this.errorHandler(error, 'getResource', 'ce voyage');
          return of(null);
        })
      );

    return trip;
  }
  addANewTrip(tripInfo: CreateTripDto): Observable<Trip | null> {
    if (this.authService.isLoggedAs() === 'guest') {
      return of(this.addNewTripASGuest(tripInfo));
    }
    const headers = this.createHeaders();
    this.setLoading(true);
    const newTrip = this.http
      .post<Trip>(`${environment.apiUrl}/trips`, tripInfo, {
        headers: headers,
      })
      .pipe(
        tap(() => this.setLoading(false)),
        catchError((error: HttpErrorResponse) => {
          this.setLoading(false);
          this.errorHandler(error, 'protectedRoute');
          return of(null);
        })
      );
    return newTrip;
  }

  updateTrip(id: number, newTripInfo: CreateTripDto): Observable<Trip | null> {
    if (this.authService.isLoggedAs() === 'guest') {
      return of(this.updateTripAsGuest(id, newTripInfo));
    }
    const headers = this.createHeaders();
    this.setLoading(true);
    const trip = this.http
      .put<Trip>(`${environment.apiUrl}/trips/${id}`, newTripInfo, { headers })
      .pipe(
        tap(() => this.setLoading(false)),
        catchError((error: HttpErrorResponse) => {
          this.setLoading(false);
          this.errorHandler(error, 'protectedRoute', 'ce voyage');
          return of(null);
        })
      );
    return trip;
  }
  deleteTrip(id: number): Observable<Trip | null> {
    if (this.authService.isLoggedAs() === 'guest') {
      return of(this.deleteTripAsGuest(id));
    }
    const headers = this.createHeaders();
    this.setLoading(true);
    const trip = this.http
      .delete<Trip>(`${environment.apiUrl}/trips/${id}`, {
        headers,
      })
      .pipe(
        tap(() => this.setLoading(false)),
        catchError((error: HttpErrorResponse) => {
          this.setLoading(false);
          this.errorHandler(error, 'protectedRoute', 'ce voyage');
          return of(null);
        })
      );
    return trip;
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
  ): Observable<Step | null> {
    if (this.authService.isLoggedAs() === 'guest') {
      return of(this.addAStepToATripAsGuest(stepContent, tripId, fileList));
    }
    const headers = this.createHeaders();
    this.setLoading(true);
    if (fileList.length === 0) {
      const step = this.http
        .post<Step>(
          `${environment.apiUrl}/trips/steps/${tripId}`,
          stepContent,
          { headers }
        )
        .pipe(
          tap(() => this.setLoading(false)),
          catchError((error: HttpErrorResponse) => {
            this.setLoading(false);
            this.errorHandler(error, 'protectedRoute', 'ce voyage');
            return of(null);
          })
        );
      return step;
    } else {
      const formData = new FormData();
      fileList.forEach((file) => {
        formData.append('files', file, file.name);
      });
      const body = JSON.stringify(stepContent);
      formData.append('stepInfo', body);
      const step = this.http
        .post<Step>(`${environment.apiUrl}/trips/steps/${tripId}`, formData, {
          headers,
        })
        .pipe(
          tap(() => this.setLoading(false)),
          catchError((error: HttpErrorResponse) => {
            this.setLoading(false);
            this.errorHandler(error, 'protectedRoute', 'ce voyage');
            return of(null);
          })
        );
      return step;
    }
  }
  removeAStep(id: number, tripId: number): Observable<Step | null> {
    if (this.authService.isLoggedAs() === 'guest') {
      return of(this.removeAStepAsGuest(id, tripId));
    }
    const headers = this.createHeaders();
    this.setLoading(true);
    const step = this.http
      .delete<Step>(`${environment.apiUrl}/trips/steps/${id}`, {
        headers,
      })
      .pipe(
        tap(() => this.setLoading(false)),
        catchError((error: HttpErrorResponse) => {
          this.setLoading(false);
          this.errorHandler(error, 'protectedRoute', 'cette étape');
          return of(null);
        })
      );
    return step;
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
    fileList: File[],
    tripId: number
  ): Observable<Step | null> {
    if (this.authService.isLoggedAs() === 'guest') {
      return of(this.updateStepAsGuest(stepContent, stepId, fileList, tripId));
    }
    this.setLoading(true);
    const headers = this.createHeaders();
    if (fileList.length === 0) {
      const step = this.http
        .put<Step>(`${environment.apiUrl}/trips/steps/${stepId}`, stepContent, {
          headers,
        })
        .pipe(
          tap(() => this.setLoading(false)),
          catchError((error: HttpErrorResponse) => {
            this.setLoading(false);
            this.errorHandler(error, 'protectedRoute', 'cette étape');
            return of(null);
          })
        );
      return step;
    } else {
      const formData = new FormData();
      fileList.forEach((file) => {
        formData.append('files', file, file.name);
      });
      const body = JSON.stringify(stepContent);
      formData.append('stepInfo', body);
      const step = this.http
        .put<Step>(`${environment.apiUrl}/trips/steps/${stepId}`, formData, {
          headers,
        })
        .pipe(
          tap(() => this.setLoading(false)),
          catchError((error: HttpErrorResponse) => {
            this.setLoading(false);
            this.errorHandler(error, 'protectedRoute', 'cette étape');
            return of(null);
          })
        );
      return step;
    }
  }

  private getOneTripByIdAsGuest(id: number) {
    return this.dummyTrips.filter((trip) => trip.id === id)[0];
  }
  private addNewTripASGuest(tripInfo: CreateTripDto): Trip {
    const newId =
      this.dummyTrips.map((trip) => trip.id).sort((a, b) => a - b)[
        this.dummyTrips.length - 1
      ] + 1;
    const newTrip: Trip = { ...tripInfo, id: newId, steps: [] };
    this.dummyTrips.push(newTrip);
    return newTrip;
  }
  private updateTripAsGuest(id: number, newTripInfo: CreateTripDto) {
    const tripToUpdate = this.getOneTripByIdAsGuest(id);
    Object.assign(tripToUpdate, newTripInfo);
    return tripToUpdate;
  }
  private deleteTripAsGuest(id: number) {
    const tripToDelete = this.getOneTripByIdAsGuest(id);
    const index = this.dummyTrips.indexOf(tripToDelete);
    this.dummyTrips.splice(index, 1);
    return tripToDelete;
  }
  private addAStepToATripAsGuest(
    stepContent: {
      title: string;
      description: string;
      coordinates: Coordinates;
      date: string;
    },
    tripId: number,
    fileList: File[]
  ): Step {
    const trip = this.getOneTripByIdAsGuest(tripId);
    const newId =
      trip.steps.length < 1
        ? 1
        : trip.steps.map((step) => step.id).sort((a, b) => a - b)[
            trip.steps.length - 1
          ] + 1;
    console.log('le nouvel id est ' + newId);
    const newStep = {
      ...stepContent,
      id: newId,
      coordinates: stepContent.coordinates.toString(),
      pictures: '',
    };
    if (fileList.length > 0) {
      const picturesArray = fileList.map((file) => URL.createObjectURL(file));
      newStep.pictures = picturesArray.toString();
    }
    trip.steps.push(newStep);
    return newStep;
  }
  private removeAStepAsGuest(id: number, tripId: number): Step {
    const trip = this.getOneTripByIdAsGuest(tripId);
    const stepToRemove = trip.steps.filter((step) => step.id === id)[0];
    const index = trip.steps.indexOf(stepToRemove);
    trip.steps.splice(index, 1);
    return stepToRemove;
  }
  private updateStepAsGuest(
    stepContent: {
      title: string;
      description: string;
      coordinates: Coordinates;
      date: string;
      picturesToDelete?: string[];
    },
    stepId: number,
    fileList: File[],
    tripId: number
  ): Step {
    const trip = this.getOneTripByIdAsGuest(tripId);
    console.log(trip);
    console.log('Le stepID est ' + stepId);
    const stepToUpdate = trip.steps.filter((step) => step.id === stepId)[0];
    if (
      stepContent.picturesToDelete &&
      stepContent.picturesToDelete.length > 0 &&
      stepToUpdate.pictures
    ) {
      const picturesToDelete = stepContent.picturesToDelete;
      let currentPictures: string[] = stepToUpdate.pictures?.split(',');
      const pictureArrayAfterDelete = currentPictures.filter(
        (picture) => !picturesToDelete.includes(picture)
      );
      stepToUpdate.pictures = pictureArrayAfterDelete.toString();
    }
    if (fileList.length > 0) {
      const newPictureArray = fileList.map((file) => URL.createObjectURL(file));
      const curentPictureArray = stepToUpdate.pictures?.split(',');
      const pictureArray = curentPictureArray
        ? [...curentPictureArray, ...newPictureArray]
        : newPictureArray;

      stepToUpdate.pictures = pictureArray.toString();
    }
    delete stepContent.picturesToDelete;
    const newStepContent = {
      ...stepContent,
      coordinates: stepContent.coordinates.toString(),
    };
    Object.assign(stepToUpdate, newStepContent);
    return stepToUpdate;
  }
  private createHeaders() {
    if (this.authService.isLoggedAs() === 'user') {
      return new HttpHeaders({
        Authorization: `Bearer ${this.authService.token}`,
      });
    }
    return;
  }
  transformCoordinateStringToArrayOfNumber(
    coordinateString: string
  ): Coordinates {
    return coordinateString.split(',').map(Number) as Coordinates;
  }
  private setLoading(value: boolean) {
    this._loading$.next(value);
  }
  private errorHandler(
    error: HttpErrorResponse,
    context: 'getResource' | 'protectedRoute',
    ressource?: string
  ) {
    if (context === 'getResource') {
      this.notificationService.addNotif(
        'error',
        `Malheureusement nous n'avons pas pu récupérer ${ressource} auprès du serveur ...`
      );
      return;
    }
    switch (error.status) {
      case 401:
        this.notificationService.addNotif(
          'error',
          "Vous n'êtes pas authorisé à effectuer cette action ! "
        );
        break;
      case 404:
        this.notificationService.addNotif(
          'error',
          "Nous n'avons pas trouvé " + ressource
        );
        break;
      default:
        this.notificationService.addNotif(
          'error',
          'Une erreur est survenue... Veuillez réessayer'
        );
        break;
    }
  }
}
