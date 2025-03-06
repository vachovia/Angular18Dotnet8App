import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {combineLatest, Subscription} from 'rxjs';
import {selectCurrentUser, selectIsSubmitting, selectValidationErrors} from './../../store/reducers';
import {UserInterface} from './../../../shared/types';
import {Store} from '@ngrx/store';
import {RegisterWithExternalClass} from '../../types';
import {ValidationMessagesComponent} from '../../../shared/components';
import {CommonModule} from '@angular/common';
import { accountActions } from '../../store/actions';

@Component({
  selector: 'app-register-with-third-party',
  standalone: true,
  imports: [ValidationMessagesComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './register-with-third-party.component.html',
  styleUrl: './register-with-third-party.component.scss',
})
export class RegisterWithThirdPartyComponent implements OnInit, OnDestroy {
  submitted = false;
  provider: string | null = null;
  access_token: string | null = null;
  userId: string | null = null;
  errorMessages: string[] = [];
  registerForm: FormGroup = new FormGroup({});
  currentUserSubscription?: Subscription;

  store = inject(Store);
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);
  fb = inject(FormBuilder);

  data$ = combineLatest({
    isSubmitting: this.store.select(selectIsSubmitting),
    currentUser: this.store.select(selectCurrentUser),
    backendErrors: this.store.select(selectValidationErrors),
  });

  ngOnInit() {
    this.initBinding();
  }

  initBinding(): void {
    this.currentUserSubscription = this.store
      .select(selectCurrentUser)
      .subscribe((currentUser: UserInterface | null | undefined) => {
        if (currentUser) {
          this.router.navigateByUrl('/');
        } else {
          this.activatedRoute.queryParams.subscribe((params: Params) => {
            this.provider = this.activatedRoute.snapshot.paramMap.get('provider');
            this.access_token = params['access_token'];
            this.userId = params['userId'];
            if (
              this.provider &&
              this.access_token &&
              this.userId &&
              (this.provider === 'google' || this.provider === 'facebook')
            ) {
              this.initializeForm();
            } else {
              this.router.navigateByUrl('/register');
            }
          });
        }
      });
  }

  initializeForm() {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]],
      lastName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]],
    });
  }

  register() {
    this.submitted = true;
    if (this.registerForm.valid && this.userId && this.access_token && this.provider) {
      const firstName = this.registerForm.get('firstName')?.value;
      const lastName = this.registerForm.get('lastName')?.value;
      const model = new RegisterWithExternalClass(firstName, lastName, this.userId, this.access_token, this.provider);
      this.store.dispatch(accountActions.registerWithThirdParty({request: model}));
    }
  }

  ngOnDestroy(): void {
    this.currentUserSubscription?.unsubscribe();
  }
}
