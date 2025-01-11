import {inject, Injectable} from '@angular/core';
import {environment} from './../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {MemberAddEditInterface, MemberViewInterface} from './../types';
import {BackendResponseInterface} from './../../shared/types';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  appUrl: string = environment.appUrl;
  http: HttpClient = inject(HttpClient);

  getMembers(): Observable<MemberViewInterface[]> {
    const url = `${this.appUrl}/api/admin/get-members`;
    debugger;
    return this.http.get<MemberViewInterface[]>(url);
  }

  getMember(id: string): Observable<MemberAddEditInterface> {
    const url = `${this.appUrl}/api/admin/get-member/${id}`;
    return this.http.get<MemberAddEditInterface>(url);
  }

  getAppRoles(): Observable<string[]> {
    const url = `${this.appUrl}/api/admin/get-application-roles`;
    return this.http.get<string[]>(url);
  }

  addEditMember(model: MemberAddEditInterface): Observable<BackendResponseInterface> {
    const url = `${this.appUrl}/api/admin/add-edit-member`;
    return this.http.post<BackendResponseInterface>(url, model);
  }

  lockMember(id: string): Observable<Object> {
    const url = `${this.appUrl}/api/admin/lock-member/${id}`;
    return this.http.put(url, {});
  }

  unlockMember(id: string): Observable<Object> {
    const url = `${this.appUrl}/api/admin/unlock-member/${id}`;
    return this.http.put(url, {});
  }

  deleteMember(id: string): Observable<Object> {
    const url = `${this.appUrl}/api/admin/delete-member/${id}`;
    return this.http.delete(url);
  }
}
