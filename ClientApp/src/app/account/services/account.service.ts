import {Router} from '@angular/router';
import {Injectable} from '@angular/core';
import {map, Observable} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {UserInterface} from './../../shared/types';
import {
  LoginInterface,
  RegisterInterface,
  BackendResponseInterface,
  ConfirmEmailInterface,
  ResetPasswordInterface,
} from './../types';
import {PersistanceService} from './../../shared/services';
import {environment} from './../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  appUrl: string = environment.appUrl;

  constructor(private http: HttpClient, private router: Router, private persistanceService: PersistanceService) {}

  getCurrentUser(jwt: string): Observable<UserInterface> {
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', 'Bearer ' + jwt);
    const url = `${this.appUrl}/api/account/refresh-user-token`;
    return this.http.get<UserInterface>(url).pipe(map(this.getUser));
  }

  register(data: RegisterInterface): Observable<BackendResponseInterface> {
    const url = `${this.appUrl}/api/account/register`;
    return this.http.post<BackendResponseInterface>(url, data);
  }

  login(data: LoginInterface): Observable<UserInterface> {
    const url = `${this.appUrl}/api/account/login`;
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

  logout() {
    this.persistanceService.clear();
    this.router.navigateByUrl('/');
  }
}
