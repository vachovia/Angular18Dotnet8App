import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {interval, Subscription} from 'rxjs';
import {SharedService} from './../../../services';
import {accountActions} from './../../../../account/store/actions';
import {Store} from '@ngrx/store';
import {BsModalRef} from 'ngx-bootstrap/modal';
import { environment } from './../../../../../environments/environment';

@Component({
  selector: 'app-expiring-session-countdown',
  standalone: true,
  imports: [],
  templateUrl: './expiring-session-countdown.component.html',
  styleUrl: './expiring-session-countdown.component.scss',
})
export class ExpiringSessionCountdownComponent implements OnInit, OnDestroy {
  targetTime = environment.countDown; // countdown in secs
  remainingTime: number = this.targetTime;
  countDownSubscription?: Subscription;
  displayTime: string = this.formatTime(this.remainingTime);
  modalRef?: BsModalRef;

  store = inject(Store);
  bsModalRef = inject(BsModalRef);
  sharedService = inject(SharedService);

  ngOnInit() {
    this.startCountDown();
  }

  startCountDown() {
    this.countDownSubscription = interval(1000).subscribe(() => {
      if (this.remainingTime > 0) {
        this.remainingTime--;
        this.displayTime = this.formatTime(this.remainingTime);
      } else {
        this.stopCountDown();
        this.sharedService.showNotification(false, 'Logged out', 'You have been loged out due to inactivity');
        this.logout();
      }
    });
  }

  stopCountDown() {
    this.countDownSubscription?.unsubscribe();
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${this.pad(minutes)}:${this.pad(remainingSeconds)}`;
  }

  pad(value: number): string {
    return value < 10 ? `0${value}` : value.toString();
  }

  resumeSession() {
    this.bsModalRef.hide();
    this.store.dispatch(accountActions.refreshUserToken());
  }

  logout() {
    this.bsModalRef.hide();
    this.store.dispatch(accountActions.logout());
  }

  ngOnDestroy() {
    this.stopCountDown();
  }
}
