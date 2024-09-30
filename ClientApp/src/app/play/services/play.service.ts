import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from './../../../environments/environment.development';
import { PlayResponseInterface } from '../types';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PlayService {
  appUrl = environment.appUrl;

  constructor(private http: HttpClient) {}

  getPlayers(): Observable<PlayResponseInterface> {
    const url = `${this.appUrl}/api/play/get-players`;
    return this.http.get<PlayResponseInterface>(url);
  }
}
