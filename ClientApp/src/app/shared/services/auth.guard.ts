import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {UserInterface} from './../types';
import {SharedService} from './shared.service.service';
import {PersistanceService} from './persistance.service';

export const AuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const sharedService = inject(SharedService);
  const persistanceService = inject(PersistanceService);
  const user = persistanceService.get();
  const jwt = user ? `Bearer ${(<UserInterface>user).jwt}` : '';

  if (user) {
    return true;
  } else {
    sharedService.showNotification(false, 'Restricted Area', 'Please Login.');
    router.navigate(['login'], {queryParams: {returnUrl: state.url}});
    return false;
  }
};
