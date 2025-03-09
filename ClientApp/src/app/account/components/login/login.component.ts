import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {ValidationMessagesComponent} from '../../../shared/components';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {Store} from '@ngrx/store';
import {combineLatest, Subscription} from 'rxjs';
import {selectCurrentUser, selectIsSubmitting, selectValidationErrors} from './../../store/reducers';
import {LoginInterface, LoginWithExternalClass} from './../../types';
import {accountActions} from '../../store/actions';
import {ActivatedRoute, Params, Router, RouterLink} from '@angular/router';
import {UserInterface} from './../../../shared/types';
import { SharedService } from './../../../shared/services';
declare const FB: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, ValidationMessagesComponent, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup = new FormGroup({});
  submitted = false;
  returnUrl: string | null = null;
  currentUserSubscription?: Subscription;

  data$ = combineLatest({
    isSubmitting: this.store.select(selectIsSubmitting),
    backendErrors: this.store.select(selectValidationErrors),
  });

  router = inject(Router);
  sharedService = inject(SharedService);
  activatedRoute = inject(ActivatedRoute);

  constructor(private formBuilder: FormBuilder, private store: Store) {}

  ngOnInit(): void {
    this.initializeForm();
    this.initBinding();
  }

  initializeForm() {
    this.loginForm = this.formBuilder.group({
      userName: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  initBinding(): void {
    this.currentUserSubscription = this.store
      .select(selectCurrentUser)
      .subscribe((currentUser: UserInterface | null | undefined) => {
        if (currentUser) {
          const url = this.returnUrl || '/';
          this.router.navigateByUrl(url);
        } else {
          this.returnUrl = this.activatedRoute.snapshot.queryParams['returnUrl'];
        }
      });
  }

  login() {
    this.submitted = true;
    if (this.loginForm.valid) {
      const request: LoginInterface = this.loginForm.getRawValue();
      this.store.dispatch(accountActions.login({request: request}));
    }
  }

  resendEmailConfirmationLink(): void {
    this.router.navigateByUrl('/send-email/resend-email-confirmation-link');
  }

  forgotUsernameOrPassword(): void {
    this.router.navigateByUrl('/send-email/forgot-username-or-password');
  }

  loginWithFacebook() {
    FB.login(async (fbResult: any) => {
      console.log(fbResult);
      if (fbResult.authResponse) {
        const accessToken = fbResult.authResponse.accessToken;
        const userId = fbResult.authResponse.userID;
        const model = new LoginWithExternalClass(userId, accessToken, 'facebook');
        this.store.dispatch(accountActions.loginWithThirdParty({request: model}));
      } else {
        this.sharedService.showNotification(false, 'Failed', 'Unable to login with your Facebook');
        console.log('User cancelled login or did not fully authorize.');
      }
    });
  }

  ngOnDestroy(): void {
    this.currentUserSubscription?.unsubscribe();
  }
}
