import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest } from 'rxjs';
import {CommonModule} from '@angular/common';
import { adminActions } from './../../store/actions';
import { ValidationMessagesComponent } from './../../../shared/components';
import { selectMembers, selectValidationErrors } from './../../store/reducers';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, ValidationMessagesComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent implements OnInit {
  data$ = combineLatest({
    members: this.store.select(selectMembers),
    backendErrors: this.store.select(selectValidationErrors),
  });

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store.dispatch(adminActions.getMembers());
  }
}
