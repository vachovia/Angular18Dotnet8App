import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PlayResponseInterface } from '../types';
import { Observable } from 'rxjs';
import { environment } from './../../../environments/environment.development';

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
