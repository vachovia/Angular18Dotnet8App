import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {Store} from '@ngrx/store';
import {combineLatest, Subscription} from 'rxjs';
import {selectCurrentUser, selectIsSubmitting, selectValidationErrors} from './../../store/reducers';
import {UserInterface} from './../../../shared/types';
import {CommonModule} from '@angular/common';
import {ValidationMessagesComponent} from '../../../shared/components';
import {accountActions} from '../../store/actions';
import {ResetPasswordInterface} from '../../types';

@Component({
  selector: 'reset-password',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule, ValidationMessagesComponent],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  currentUserSubscription?: Subscription;
  resetPasswordForm: FormGroup = new FormGroup({});
  email: string = '';
  token: string = '';
  submitted: boolean = false;

  fb = inject(FormBuilder);
  store = inject(Store);
  router = inject(Router);
  route = inject(ActivatedRoute);

  data$ = combineLatest({
    isSubmitting: this.store.select(selectIsSubmitting),
    backendErrors: this.store.select(selectValidationErrors),
  });

  ngOnInit(): void {
    this.initBinding();
  }

  initBinding(): void {
    this.currentUserSubscription = this.store
      .select(selectCurrentUser)
      .subscribe((currentUser: UserInterface | null | undefined) => {
        if (currentUser) {
          this.router.navigateByUrl('/');
        } else {
          this.token = this.route.snapshot.queryParams['token'];
          this.email = this.route.snapshot.queryParams['email'];
          if (this.token && this.email) {
            this.initializeForm();
          } else {
            this.router.navigateByUrl('/login');
          }
        }
      });
  }

  initializeForm() {
    this.resetPasswordForm = this.fb.group({
      email: [{value: this.email, disabled: true}],
      newPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(15)]],
    });
  }

  resetPassword(): void {
    this.submitted = true;
    if (this.resetPasswordForm.valid && this.email && this.token) {
      const password = this.resetPasswordForm.get('newPassword')?.value;
      const model: ResetPasswordInterface = {
        token: this.token,
        email: this.email,
        newPassword: password,
      };
      this.store.dispatch(accountActions.resetPassword({request: model}));
    }
  }

  ngOnDestroy(): void {
    this.currentUserSubscription?.unsubscribe();
  }
}
