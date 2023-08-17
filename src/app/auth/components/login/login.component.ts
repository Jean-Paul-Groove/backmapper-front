import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../shared/services/auth.service';
import { tap } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  usernameCtrl!: FormControl;
  passwordCtrl!: FormControl;
  connexionFormGroup!: FormGroup;
  connectForm: boolean = false;
  connectAsUser: boolean = false;
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.usernameCtrl = this.formBuilder.control('', Validators.required);
    this.passwordCtrl = this.formBuilder.control('', Validators.required);
    this.connexionFormGroup = this.formBuilder.group({
      username: this.usernameCtrl,
      password: this.passwordCtrl,
    });
  }
  checkIfLogged() {
    if (this.authService.isLoggedAs()) {
      this.router.navigateByUrl('trips');
    }
  }
  onConnectAsUser() {
    this.connectAsUser = !this.connectAsUser;
  }
  onConnect(event: Event) {
    event.preventDefault();
    this.authService
      .login(this.connexionFormGroup.value)
      .pipe(
        tap(() => {
          this.connexionFormGroup.reset(), this.checkIfLogged();
        })
      )
      .subscribe();
  }
  onContinueAsGuest(event: Event) {
    event.preventDefault();
    this.authService.continueAsGuest();
    this.checkIfLogged();
  }
  onOpenConnectForm(event: Event) {
    event.preventDefault();
    this.connectForm = true;
  }
  onSeeTrips(event: Event) {
    event.preventDefault();
    this.authService.userIsAGuest = false;
    this.router.navigateByUrl('trips');
  }
  onGoBackToWelcome() {
    this.connectForm = false;
    this.connectAsUser = false;
  }
}
