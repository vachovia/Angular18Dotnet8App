import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router, RouterLink} from '@angular/router';
import {Store} from '@ngrx/store';
import { combineLatest, Subscription } from 'rxjs';
import {UserInterface} from './../../../shared/types';
import { ConfirmEmailInterface } from './../../types';
import { SpinnerComponent, ValidationMessagesComponent } from './../../../shared/components';
import {selectCurrentUser, selectIsLoading, selectValidationErrors} from './../../store/reducers';
import { CommonModule } from '@angular/common';
import { accountActions } from '../../store/actions';

@Component({
  selector: 'confirm-email',
  standalone: true,
  imports: [CommonModule, RouterLink, ValidationMessagesComponent, SpinnerComponent],
  templateUrl: './confirm-email.component.html',
  styleUrl: './confirm-email.component.scss',
})
export class ConfirmEmailComponent implements OnInit, OnDestroy {
  currentUserSubscription?: Subscription;
  confirmEmail: ConfirmEmailInterface | null = null;

  store = inject(Store);
  router = inject(Router);
  route = inject(ActivatedRoute);

  data$ = combineLatest({
    isLoading: this.store.select(selectIsLoading),
    backendErrors: this.store.select(selectValidationErrors),
  });

  ngOnInit() {
    this.initBinding();
  }

  initBinding(): void {
    this.currentUserSubscription = this.store.select(selectCurrentUser).subscribe({
      next: (currentUser: UserInterface | null | undefined) => {
        if (currentUser) {
          this.router.navigateByUrl('/');
        } else {
          const token = this.route.snapshot.queryParams['token'];
          const email = this.route.snapshot.queryParams['email'];
          this.confirmEmail = {token, email};
          this.store.dispatch(accountActions.confirmEmail({request: this.confirmEmail}));
        }
      },
      error: (error: any) => {
        console.log(error);
      },
    });
  }

  resendEmailConfirmationLink(): void {
    this.router.navigateByUrl('/send-email/resend-email-confirmation-link');
  }

  ngOnDestroy(): void {
    this.currentUserSubscription?.unsubscribe();
  }
}
