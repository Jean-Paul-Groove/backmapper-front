import { Injectable } from '@angular/core';
import { LoginDto } from '../../auth/dto/login.dto';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { TokenInfoDto } from 'src/app/auth/dto/token-info.dto';
import { environment } from 'src/environments/environment.development';
import { Observable, catchError, of, tap } from 'rxjs';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}
  token: string = '';
  tokenDateOfExpiration!: number;
  userIsAGuest: boolean = false;

  login(loginInfo: LoginDto): Observable<TokenInfoDto | never[]> {
    const answer = this.http.post<TokenInfoDto>(
      `${environment.apiUrl}/auth`,
      loginInfo
    );
    return answer.pipe(
      tap((tokenInfo) => {
        this.token = tokenInfo.access_token;
        this.userIsAGuest = false;

        const tokenExpiresIn = +tokenInfo.expiresIn.split('s')[0] * 1000;
        this.tokenDateOfExpiration = Date.now() + tokenExpiresIn;
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorHandler(error, 'login');
        return of([]);
      })
    );
  }

  continueAsGuest() {
    this.userIsAGuest = true;
  }

  private errorHandler(
    error: HttpErrorResponse,
    context: 'login' | 'badToken'
  ) {
    if (context === 'login') {
      switch (error.status) {
        case 401:
          this.notificationService.addNotif(
            'error',
            'Couple identifiant/mot-de-passe invalide !'
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
  isLoggedAs(): 'user' | 'guest' | null {
    if (this.userIsAGuest) {
      return 'guest';
    }
    const tokenValidity =
      this.tokenDateOfExpiration - Date.now() > 0 && this.token.length > 0;
    if (!tokenValidity) {
      this.token = '';
      return null;
    }
    return 'user';
  }
}
