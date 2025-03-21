import {Router} from '@angular/router';
import {inject, Injectable} from '@angular/core';
import {map, Observable} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AppJwtPayload, BackendResponseInterface, UserInterface} from './../../shared/types';
import {
  LoginInterface,
  RegisterInterface,
  ConfirmEmailInterface,
  ResetPasswordInterface,
  RegisterWithExternalClass,
  LoginWithExternalClass,
} from './../types';
import {PersistanceService, SharedService} from './../../shared/services';
import {environment} from './../../../environments/environment';
import {jwtDecode} from 'jwt-decode';
import {Store} from '@ngrx/store';
import {accountActions} from '../store/actions';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  appUrl: string = environment.appUrl;
  idleTimeout: number = environment.idleTimeout;

  timeoutId: any;
  refreshTokenTimeout: any;
  displayingExpiringSessionModal = false;

  store = inject(Store);
  router = inject(Router);
  http = inject(HttpClient);
  sharedService = inject(SharedService);
  persistanceService = inject(PersistanceService);

  register(data: RegisterInterface): Observable<BackendResponseInterface> {
    const url = `${this.appUrl}/api/account/register`;
    return this.http.post<BackendResponseInterface>(url, data);
  }

  registerWithThirdParty(data: RegisterWithExternalClass): Observable<UserInterface> {
    const url = `${this.appUrl}/api/account/register-with-third-party`;
    return this.http.post<UserInterface>(url, data).pipe(map(this.getUser));
  }

  login(data: LoginInterface): Observable<UserInterface> {
    const url = `${this.appUrl}/api/account/login`;
    return this.http.post<UserInterface>(url, data).pipe(map(this.getUser));
  }

  loginWithThirdParty(data: LoginWithExternalClass): Observable<UserInterface> {
    const url = `${this.appUrl}/api/account/login-with-third-party`;
    return this.http.post<UserInterface>(url, data).pipe(map(this.getUser));
  }

  getUser(response: UserInterface): UserInterface {
    return response;
  }

  confirmEmail(data: ConfirmEmailInterface): Observable<BackendResponseInterface> {
    const url = `${this.appUrl}/api/account/confirm-email`;
    return this.http.put<BackendResponseInterface>(url, data);
  }

  resendEmailConfirmationLink(email: string): Observable<BackendResponseInterface> {
    const url = `${this.appUrl}/api/account/resend-email-confirmation-link/${email}`;
    return this.http.post<BackendResponseInterface>(url, {});
  }

  forgotUsernameOrPassword(email: string): Observable<BackendResponseInterface> {
    const url = `${this.appUrl}/api/account/forgot-username-or-password/${email}`;
    return this.http.post<BackendResponseInterface>(url, {});
  }

  resetPassword(data: ResetPasswordInterface): Observable<BackendResponseInterface> {
    const url = `${this.appUrl}/api/account/reset-password`;
    return this.http.put<BackendResponseInterface>(url, data);
  }

  getCurrentUserDepricated(jwt: string): Observable<UserInterface> {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', 'Bearer ' + jwt);
    const url = `${this.appUrl}/api/account/refresh-user-token`;
    return this.http.get<UserInterface>(url, {headers}).pipe(map(this.getUser));
  }

  getCurrentUser(jwt: string): Observable<UserInterface> {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', 'Bearer ' + jwt);
    const url = `${this.appUrl}/api/account/refresh-page`;
    return this.http.get<UserInterface>(url, {headers}).pipe(map(this.getUser));
  }

  setCurrentUser(currentUser: UserInterface) {
    this.stopRefreshTokenTimer();
    this.persistanceService.set(currentUser);
    this.startRefreshTokenTimer(currentUser.jwt);

    this.displayingExpiringSessionModal = false;
    this.checkUserIdleTimeout(currentUser);
  }

  stopRefreshTokenTimer() {
    clearTimeout(this.refreshTokenTimeout);
  }

  startRefreshTokenTimer(jwt: string) {
    const decodedToken: AppJwtPayload = jwtDecode(jwt);
    const expires = new Date(decodedToken.exp! * 1000);
    // 30 secs before expiration
    const timeout = expires.getTime() - Date.now() - 30 * 1000;
    this.refreshTokenTimeout = setTimeout(() => this.dispatchRefreshToken(), timeout);
  }

  dispatchRefreshToken() {
    this.store.dispatch(accountActions.refreshUserToken());
  }

  createRefreshToken(jwt: string): Observable<UserInterface> {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', 'Bearer ' + jwt);
    const url = `${this.appUrl}/api/account/refresh-token`;
    return this.http.post<UserInterface>(url, {}, {headers}).pipe(map(this.getUser));
  }

  checkUserIdleTimeout(currentUser: UserInterface) {
    if (currentUser) {
      if (!this.displayingExpiringSessionModal) {
        this.timeoutId = setTimeout(() => {
          this.displayingExpiringSessionModal = true;
          this.sharedService.openExpiringSessionCountDown();
        }, this.idleTimeout);
      }
    }
  }

  logout() {
    this.persistanceService.clear();
    this.router.navigateByUrl('/');
    this.stopRefreshTokenTimer();
  }
}
