import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {ValidationMessagesComponent} from '../../../shared/components';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {Store} from '@ngrx/store';
import {combineLatest, Subscription} from 'rxjs';
import {selectCurrentUser, selectIsSubmitting, selectValidationErrors} from './../../store/reducers';
import {LoginInterface} from '../../types';
import {accountActions} from '../../store/actions';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {UserInterface} from '../../../shared/types';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, ValidationMessagesComponent],
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

  ngOnDestroy(): void {
    this.currentUserSubscription?.unsubscribe();
  }
}
