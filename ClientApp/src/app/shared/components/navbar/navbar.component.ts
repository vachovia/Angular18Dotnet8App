import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { selectCurrentUser, selectIsLoading } from '../../../account/store/reducers';
import { combineLatest } from 'rxjs';
import { Store } from '@ngrx/store';
import { accountActions } from '../../../account/store/actions';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  data$ = combineLatest({
    isLoading: this.store.select(selectIsLoading),
    currentUser: this.store.select(selectCurrentUser),
  });

  constructor(private store: Store) {}

  logout() {
    this.store.dispatch(accountActions.logout());
  }
}
