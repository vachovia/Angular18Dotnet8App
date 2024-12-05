import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {combineLatest, Subscription} from 'rxjs';
import {selectCurrentUser, selectIsSubmitting, selectValidationErrors} from './../../store/reducers';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {ValidationMessagesComponent} from './../../../shared/components';
import {UserInterface} from '../../../shared/types';
import {accountActions} from '../../store/actions';

@Component({
  selector: 'send-email',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, ValidationMessagesComponent],
  templateUrl: './send-email.component.html',
  styleUrl: './send-email.component.scss',
})
export class SendEmailComponent implements OnInit, OnDestroy {
  submitted = false;
  mode: string | undefined;
  currentUserSubscription?: Subscription;
  emailForm: FormGroup = new FormGroup({});

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
          const mode = this.route.snapshot.paramMap.get('mode');
          if (mode) {
            this.mode = mode;
            this.initializeForm();
          }
        }
      });
  }

  initializeForm() {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern('^\\w+@[a-zA-Z_]+?\\.[a-zA-Z]{2,3}$')]],
    });
  }

  sendEmail(): void {
    if (this.emailForm.valid && this.mode) {
      const email: string = this.emailForm.get('email')?.value;
      if (this.mode === 'resend-email-confirmation-link') {
        this.submitted = true;
        this.store.dispatch(accountActions.resendEmailConfiramtion({request: email}));
      }
    }
  }

  cancel(): void {
    this.router.navigateByUrl('/login');
  }

  ngOnDestroy(): void {
    this.currentUserSubscription?.unsubscribe();
  }
}
