import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {PersistanceService, SharedService} from './';
import {AppJwtPayload, UserInterface} from './../types';
import {jwtDecode} from 'jwt-decode';
import {environment} from './../../../environments/environment';

export const AdminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const sharedService = inject(SharedService);
  const persistanceService = inject(PersistanceService);
  const adminRole = environment.adminRole;

  const user = persistanceService.get();

  if (user) {
    const jwt = (<UserInterface>user).jwt;
    const decodedToken: AppJwtPayload = jwtDecode(jwt);
    if (!Array.isArray(decodedToken.role)) {
      decodedToken.role = [decodedToken.role];
    }
    const checkRole = decodedToken.role.some((role: any) => role == adminRole);
    if (checkRole) {
      return true;
    }
  }

  sharedService.showNotification(false, 'Admin Area', 'Leave Now.');
  
  router.navigateByUrl('/');

  return false;
};
