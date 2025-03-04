import {Component, inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ValidationMessagesComponent} from './../../../shared/components';
import {CommonModule} from '@angular/common';
import {combineLatest} from 'rxjs';
import {RegisterInterface} from '../../types';
import {Store} from '@ngrx/store';
import {accountActions} from './../../store/actions';
import {selectIsSubmitting, selectValidationErrors} from './../../store/reducers';
import { SharedService } from './../../../shared/services';
import { Router } from '@angular/router';
declare const FB: any;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ValidationMessagesComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent implements OnInit {
  // replace by is Submitting if possible
  submitted: boolean = false;
  registerForm: FormGroup = new FormGroup({});

  router = inject(Router);
  sharedService = inject(SharedService);

  data$ = combineLatest({
    isSubmitting: this.store.select(selectIsSubmitting),
    backendErrors: this.store.select(selectValidationErrors),
  });

  constructor(private fb: FormBuilder, private store: Store) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm() {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]],
      lastName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]],
      email: ['', [Validators.required, Validators.pattern('^\\w+@[a-zA-Z_]+?\\.[a-zA-Z]{2,3}$')]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(15)]],
    });
  }

  register() {
    this.submitted = true;
    if (this.registerForm.valid) {
      const request: RegisterInterface = this.registerForm.getRawValue();
      this.store.dispatch(accountActions.register({request: request}));
    }
  }

  registerWithFacebook() {
    FB.login(async (fbResult: any) => {
      console.log(fbResult);
      if (fbResult.authResponse) {
        const accessToken = fbResult.authResponse.accessToken;
        const userId = fbResult.authResponse.userID;
        this.router.navigateByUrl(`/third-party/facebook?access_token=${accessToken}&userId=${userId}`);
      } else {
        this.sharedService.showNotification(false, 'Failed', "Unable to register with your Facebook");
        console.log('User cancelled login or did not fully authorize.');
      }
    });
  }
}
