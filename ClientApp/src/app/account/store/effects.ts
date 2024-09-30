import {inject} from '@angular/core';
import {Router} from '@angular/router';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {switchMap, map, catchError, of, tap} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {BackendErrorsInterface, UserInterface} from './../../shared/types/';
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
            let errorMessages: BackendErrorsInterface = {
              [errorResponse.status]: [errorResponse.error],
            };
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
            let errorMessages: BackendErrorsInterface = {
              [errorResponse.status]: [errorResponse.error]
            };            
            return of(
              accountActions.loginFailure({
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

/** Login Component listens User existence if  **/
/** user exists then it navigates to home or by returnUrl **/
// export const redirectAfterLoginEffect = createEffect(
//   (actions$ = inject(Actions), router = inject(Router)) => {
//     return actions$.pipe(
//       ofType(accountActions.loginSuccess),
//       tap(() => {
//         router.navigateByUrl('/');
//       })
//     );
//   },
//   {functional: true, dispatch: false}
// );

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

export const logoutEffect = createEffect(
  (actions$ = inject(Actions), router = inject(Router), persistanceService = inject(PersistanceService)) => {
    return actions$.pipe(
      ofType(accountActions.logout),
      tap(() => {
        persistanceService.clear();
        router.navigateByUrl('/');
      })
    );
  },
  {functional: true, dispatch: false}
);