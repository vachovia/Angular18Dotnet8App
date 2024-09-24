import {Component, OnDestroy, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {FooterComponent, NavbarComponent} from './shared/components';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { accountActions } from './account/store/actions';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store.dispatch(accountActions.getCurrentUser());
  }
}
