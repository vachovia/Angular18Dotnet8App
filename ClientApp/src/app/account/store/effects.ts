import {inject} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {switchMap, map, catchError, of, tap} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {UserInterface} from './../../shared/types/';
import {PersistanceService, SharedService} from './../../shared/services';
import {AccountService} from './../services/account.service';
import {accountActions} from './actions';
import {RegisterResponseInterface} from './../types';

export const registerEffect = createEffect(
  (actions$ = inject(Actions), accountService = inject(AccountService), sharedService = inject(SharedService)) => {
    return actions$.pipe(
      ofType(accountActions.register),
      switchMap(({request}) => {
        return accountService.register(request).pipe(
          map((response: RegisterResponseInterface) => {
            sharedService.showNotification(true, response.value.title, response.value.message);
            return accountActions.registerSuccess();
          }),
          catchError((errorResponse: HttpErrorResponse) => {
            let errorMessages = [];
            if (errorResponse.error.errors) {
              errorMessages = errorResponse.error.errors;
            } else {
              errorMessages.push(errorResponse.error);
            }
            return of(
              accountActions.registerFailure({
                errors: errorMessages,
              })
            );
          })
        );
      })
    );
  },
  {functional: true}
);

export const redirectAfterRegisterEffect = createEffect(
  (actions$ = inject(Actions), router = inject(Router)) => {
    return actions$.pipe(
      ofType(accountActions.registerSuccess),
      tap(() => {
        router.navigateByUrl('/login');
      })
    );
  },
  {functional: true, dispatch: false}
);

export const loginEffect = createEffect(
  (
    actions$ = inject(Actions),
    accountService = inject(AccountService),
    persistanceService = inject(PersistanceService)
  ) => {
    return actions$.pipe(
      ofType(accountActions.login),
      switchMap(({request}) => {
        return accountService.login(request).pipe(
          map((currentUser: UserInterface) => {
            persistanceService.set(currentUser);
            return accountActions.loginSuccess({currentUser});
          }),
          catchError((errorResponse: HttpErrorResponse) => {
            return of(
              accountActions.loginFailure({
                errors: errorResponse.error.errors,
              })
            );
          })
        );
      })
    );
  },
  {functional: true}
);

export const redirectAfterLoginEffect = createEffect(
  (actions$ = inject(Actions), router = inject(Router)) => {
    return actions$.pipe(
      ofType(accountActions.loginSuccess),
      tap(() => {
        router.navigateByUrl('/');
      })
    );
  },
  {functional: true, dispatch: false}
);

export const getCurrentUserEffect = createEffect(
  (
    actions$ = inject(Actions),
    accountService = inject(AccountService),
    persistanceService = inject(PersistanceService)
  ) => {
    return actions$.pipe(
      ofType(accountActions.getCurrentUser),
      switchMap(() => {
        const user = persistanceService.get();
        if (!user) {
          return of(accountActions.getCurrentUserFailure());
        }
        const jwt = (<UserInterface>user).jwt;
        return accountService.getCurrentUser(jwt).pipe(
          map((currentUser: UserInterface) => {
            return accountActions.getCurrentUserSuccess({currentUser});
          }),
          catchError(() => {
            return of(accountActions.getCurrentUserFailure());
          })
        );
      })
    );
  },
  {functional: true}
);

// export const redirectAfterGetCurrentUserFailedEffect = createEffect(
//   (actions$ = inject(Actions), router = inject(Router)) => {
//     return actions$.pipe(
//       ofType(accountActions.getCurrentUserFailure),
//       tap(() => {
//         router.navigateByUrl('/login');
//       })
//     );
//   },
//   {functional: true, dispatch: false}
// );
