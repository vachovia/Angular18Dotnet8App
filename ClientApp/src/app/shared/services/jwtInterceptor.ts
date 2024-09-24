import {HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {PersistanceService} from '.';
import {UserInterface} from '../types';

export const jwtInterceptor: HttpInterceptorFn = (request, next) => {
  const persistanceService = inject(PersistanceService);
  const user = persistanceService.get();
  const jwt = user ? `Bearer ${(<UserInterface>user).jwt}` : '';

  request = request.clone({
    setHeaders: {
      Authorization: jwt,
    },
  });

  return next(request);
};
