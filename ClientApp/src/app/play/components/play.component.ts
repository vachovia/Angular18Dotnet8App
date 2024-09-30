import {Component, OnDestroy, OnInit} from '@angular/core';
import {combineLatest} from 'rxjs';
import {CommonModule} from '@angular/common';
import { Store } from '@ngrx/store';
import {selectPlay, selectValidationErrors} from '../store/reducers';
import { ValidationMessagesComponent } from '../../shared/components';
import { playActions } from '../store/actions';

@Component({
  selector: 'app-play',
  standalone: true,
  imports: [CommonModule, ValidationMessagesComponent],
  templateUrl: './play.component.html',
  styleUrl: './play.component.scss',
})
export class PlayComponent implements OnInit {
  data$ = combineLatest({
    play: this.store.select(selectPlay),
    backendErrors: this.store.select(selectValidationErrors),
  });

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store.dispatch(playActions.play());
  }
}
