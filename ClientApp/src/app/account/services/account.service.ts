import {Router} from '@angular/router';
import {Injectable} from '@angular/core';
import {map, Observable} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {UserInterface} from './../../shared/types';
import {LoginInterface, RegisterInterface, RegisterResponseInterface} from './../types';
import {PersistanceService} from './../../shared/services';
import {environment} from './../../../environments/environment.development';

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

  register(data: RegisterInterface): Observable<RegisterResponseInterface> {
    const url = `${this.appUrl}/api/account/register`;
    return this.http.post<RegisterResponseInterface>(url, data);
  }

  login(data: LoginInterface): Observable<UserInterface> {
    const url = `${this.appUrl}/api/account/login`;
    return this.http.post<UserInterface>(url, data).pipe(map(this.getUser));
  }

  getUser(response: UserInterface): UserInterface {
    return response;
  }

  logout() {
    this.persistanceService.clear();
    this.router.navigateByUrl('/');
  }
}
