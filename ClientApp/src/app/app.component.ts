import {Component, HostListener, inject, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {FooterComponent, NavbarComponent} from './shared/components';
import {Store} from '@ngrx/store';
import {accountActions} from './account/store/actions';
import { PersistanceService } from './shared/services';
import { AccountService } from './account/services/account.service';
import { UserInterface } from './shared/types';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  store = inject(Store);
  accountService = inject(AccountService);
  persistanceService = inject(PersistanceService);

  ngOnInit(): void {
    this.store.dispatch(accountActions.getCurrentUser());
  }

  @HostListener('window:keydown')
  @HostListener('window:mousedown')
  checkUserActivity() {
    const user = this.persistanceService.get();
    if (user) {
      clearTimeout(this.accountService.timeoutId);
      this.accountService.checkUserIdleTimeout(<UserInterface>user);
    }
  }
}
