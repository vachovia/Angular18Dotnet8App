import {Component, inject, OnInit} from '@angular/core';
import {ValidationMessagesComponent} from '../../../shared/components';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule} from '@angular/common';
import { Store } from '@ngrx/store';
import { combineLatest } from 'rxjs';
import { selectIsSubmitting, selectValidationErrors } from './../../store/reducers';
import { LoginInterface } from '../../types';
import { accountActions } from '../../store/actions';
import { ActivatedRoute, Params, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, ValidationMessagesComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup = new FormGroup({});
  submitted = false;

  data$ = combineLatest({
    isSubmitting: this.store.select(selectIsSubmitting),
    backendErrors: this.store.select(selectValidationErrors),
  });

  constructor(private formBuilder: FormBuilder, private store: Store) {}

  ngOnInit(): void {
    this.initializeForm();    
  }

  initializeForm() {
    this.loginForm = this.formBuilder.group({
      userName: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  login() {
    this.submitted = true;
    if (this.loginForm.valid) {
      const request: LoginInterface = this.loginForm.getRawValue();
      this.store.dispatch(accountActions.login({request: request}));
    }
  }
}
