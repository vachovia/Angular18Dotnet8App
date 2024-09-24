import { Injectable} from '@angular/core';
import {environment} from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class PersistanceService {
  userKey: string = environment.userKey;

  set(data: unknown): void {
    try {
      localStorage.setItem(this.userKey, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving to local storage', e);
    }
  }

  get(): unknown {
    try {
      const item = localStorage.getItem(this.userKey);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error('Error getting from local storage', e);
      return null;
    }
  }

  clear():void{
    localStorage.removeItem(this.userKey);
  }
}
