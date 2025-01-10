import {CommonModule} from '@angular/common';
import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {selectCurrentUser, selectIsLoading} from '../../../account/store/reducers';
import {combineLatest, map, Subscription} from 'rxjs';
import {Store} from '@ngrx/store';
import {accountActions} from './../../../account/store/actions';
import {jwtDecode} from 'jwt-decode';
import {AppJwtPayload, UserInterface, Nullable} from './../../types';
import {environment} from './../../../../environments/environment';

// import {UserHasRoleDirective} from './../../directives';
// UserHasRoleDirective] //  *appUserHasRole="['Admin']"

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit, OnDestroy {
  isAdmin = false;
  userSubscription?: Subscription;
  adminRole = environment.adminRole;

  store = inject(Store);

  isAdmin$ = this.store
    .select(selectCurrentUser)
    .pipe(map((currentUser: Nullable<UserInterface>) => this.checkRole(currentUser)));

  data$ = combineLatest({
    isLoading: this.store.select(selectIsLoading),
    currentUser: this.store.select(selectCurrentUser),
  });

  ngOnInit() {
    this.userSubscription = this.isAdmin$.subscribe((isAdmin: boolean) => {
      this.isAdmin = isAdmin;
    });
  }

  logout() {
    this.store.dispatch(accountActions.logout());
  }

  checkRole(currentUser: Nullable<UserInterface>) {
    let checkRole = false;
    if (currentUser && currentUser.jwt) {
      const decodedToken: AppJwtPayload = jwtDecode(currentUser.jwt);
      if (!Array.isArray(decodedToken.role)) {
        decodedToken.role = [decodedToken.role];
      }
      checkRole = decodedToken.role.some((role: any) => role == this.adminRole);
    }
    return checkRole;
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }
}
