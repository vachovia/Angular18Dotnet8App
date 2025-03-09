import {inject} from '@angular/core';
import {Router} from '@angular/router';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {switchMap, map, catchError, of, tap} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {BackendErrorsInterface, BackendResponseInterface, UserInterface} from './../../shared/types/';
import {PersistanceService, SharedService} from './../../shared/services';
import {AccountService} from './../services/account.service';
import {accountActions} from './actions';

export const registerEffect = createEffect(
  (actions$ = inject(Actions), accountService = inject(AccountService), sharedService = inject(SharedService)) => {
    return actions$.pipe(
      ofType(accountActions.register),
      switchMap(({request}) => {
        return accountService.register(request).pipe(
          map((response: BackendResponseInterface) => {
            sharedService.showNotification(true, response.value.title, response.value.message);
            return accountActions.registerSuccess();
          }),
          catchError((errorResponse: HttpErrorResponse) => {
            let errorMessages: BackendErrorsInterface = {
              status: errorResponse.status,
              message: errorResponse.error,
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
        router.navigateByUrl('/');
      })
    );
  },
  {functional: true, dispatch: false}
);

export const registerWithThirdPartyEffect = createEffect(
  (actions$ = inject(Actions), accountService = inject(AccountService), sharedService = inject(SharedService)) => {
    return actions$.pipe(
      ofType(accountActions.registerWithThirdParty),
      switchMap(({request}) => {
        return accountService.registerWithThirdParty(request).pipe(
          map((currentUser: UserInterface) => {
            accountService.setCurrentUser(currentUser);
            sharedService.showNotification(true, 'Account Registered', 'Welcome to our website');
            return accountActions.registerWithThirdPartySuccess({currentUser});
          }),
          catchError((errorResponse: HttpErrorResponse) => {
            let errorMessages: BackendErrorsInterface = {
              status: errorResponse.status,
              message: errorResponse.error,
            };
            return of(
              accountActions.registerWithThirdPartyFailure({
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

export const redirectAfterRegisterWithThirdPartyEffect = createEffect(
  (actions$ = inject(Actions), router = inject(Router)) => {
    return actions$.pipe(
      ofType(accountActions.registerWithThirdPartySuccess),
      tap(() => {
        router.navigateByUrl('/');
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
            // persistanceService.set(currentUser);
            accountService.setCurrentUser(currentUser);
            return accountActions.loginSuccess({currentUser});
          }),
          catchError((errorResponse: HttpErrorResponse) => {
            let errorMessages: BackendErrorsInterface = {
              status: errorResponse.status,
              message: errorResponse.error,
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

export const loginWithThirdpartyEffect = createEffect(
  (
    actions$ = inject(Actions),
    accountService = inject(AccountService),
  ) => {
    return actions$.pipe(
      ofType(accountActions.loginWithThirdParty),
      switchMap(({request}) => {
        return accountService.loginWithThirdParty(request).pipe(
          map((currentUser: UserInterface) => {
            accountService.setCurrentUser(currentUser);
            return accountActions.loginWithThirdPartySuccess({currentUser});
          }),
          catchError((errorResponse: HttpErrorResponse) => {
            let errorMessages: BackendErrorsInterface = {
              status: errorResponse.status,
              message: errorResponse.error,
            };
            return of(
              accountActions.loginWithThirdPartyFailure({
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

export const getCurrentUserEffect = createEffect(
  (
    actions$ = inject(Actions),
    accountService = inject(AccountService),
    sharedService = inject(SharedService),
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
            // persistanceService.set(currentUser);
            accountService.setCurrentUser(currentUser);
            return accountActions.getCurrentUserSuccess({currentUser});
          }),
          catchError((errorResponse: HttpErrorResponse) => {
            let message = errorResponse.error || '';
            if (message && message.Errors && Array.isArray(message.Errors)) {
              message = message.Errors.join(',');
            }
            sharedService.showNotification(false, 'Access Blocked', message);
            return of(accountActions.getCurrentUserFailure());
          })
        );
      })
    );
  },
  {functional: true}
);

export const confirmEmailEffect = createEffect(
  (actions$ = inject(Actions), accountService = inject(AccountService), sharedService = inject(SharedService)) => {
    return actions$.pipe(
      ofType(accountActions.confirmEmail),
      switchMap(({request}) => {
        return accountService.confirmEmail(request).pipe(
          map((response: BackendResponseInterface) => {
            sharedService.showNotification(true, response.value.title, response.value.message);
            return accountActions.confirmEmailSuccess();
          }),
          catchError((errorResponse: HttpErrorResponse) => {
            let errorMessages: BackendErrorsInterface = {
              status: errorResponse.status,
              message: errorResponse.error,
            };
            sharedService.showNotification(false, 'Failed', errorResponse.error);
            return of(
              accountActions.confirmEmailFailure({
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

export const resendEmailConfirmationEffect = createEffect(
  (actions$ = inject(Actions), accountService = inject(AccountService), sharedService = inject(SharedService)) => {
    return actions$.pipe(
      ofType(accountActions.resendEmailConfiramtion),
      switchMap(({request}) => {
        return accountService.resendEmailConfirmationLink(request).pipe(
          map((response: BackendResponseInterface) => {
            sharedService.showNotification(true, response.value.title, response.value.message);
            return accountActions.resendEmailConfiramtionSuccess();
          }),
          catchError((errorResponse: HttpErrorResponse) => {
            let errorMessages: BackendErrorsInterface = {
              status: errorResponse.status,
              message: errorResponse.error,
            };
            sharedService.showNotification(false, 'Failed', errorResponse.error);
            return of(
              accountActions.resendEmailConfiramtionFailure({
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

export const redirectAfterResendEmailConfirmationEffect = createEffect(
  (actions$ = inject(Actions), router = inject(Router)) => {
    return actions$.pipe(
      ofType(accountActions.resendEmailConfiramtionSuccess),
      tap(() => {
        router.navigateByUrl('/');
      })
    );
  },
  {functional: true, dispatch: false}
);

export const forgotUsernameOrPasswordEffect = createEffect(
  (actions$ = inject(Actions), accountService = inject(AccountService), sharedService = inject(SharedService)) => {
    return actions$.pipe(
      ofType(accountActions.forgotUsernameOrPassword),
      switchMap(({request}) => {
        return accountService.forgotUsernameOrPassword(request).pipe(
          map((response: BackendResponseInterface) => {
            sharedService.showNotification(true, response.value.title, response.value.message);
            return accountActions.forgotUsernameOrPasswordSuccess();
          }),
          catchError((errorResponse: HttpErrorResponse) => {
            let errorMessages: BackendErrorsInterface = {
              status: errorResponse.status,
              message: errorResponse.error,
            };
            sharedService.showNotification(false, 'Failed', errorResponse.error);
            return of(
              accountActions.forgotUsernameOrPasswordFailure({
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

export const redirectAfterForgotUsernameOrPasswordEffect = createEffect(
  (actions$ = inject(Actions), router = inject(Router)) => {
    return actions$.pipe(
      ofType(accountActions.forgotUsernameOrPasswordSuccess),
      tap(() => {
        router.navigateByUrl('/login');
      })
    );
  },
  {functional: true, dispatch: false}
);

export const resetPasswordEffect = createEffect(
  (actions$ = inject(Actions), accountService = inject(AccountService), sharedService = inject(SharedService)) => {
    return actions$.pipe(
      ofType(accountActions.resetPassword),
      switchMap(({request}) => {
        return accountService.resetPassword(request).pipe(
          map((response: BackendResponseInterface) => {
            sharedService.showNotification(true, response.value.title, response.value.message);
            return accountActions.resetPasswordSuccess();
          }),
          catchError((errorResponse: HttpErrorResponse) => {
            let errorMessages: BackendErrorsInterface = {
              status: errorResponse.status,
              message: errorResponse.error,
            };
            sharedService.showNotification(false, 'Failed', errorResponse.error);
            return of(
              accountActions.resetPasswordFailure({
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

export const redirectAfterResetPasswordEffect = createEffect(
  (actions$ = inject(Actions), router = inject(Router)) => {
    return actions$.pipe(
      ofType(accountActions.resetPasswordSuccess),
      tap(() => {
        router.navigateByUrl('/login');
      })
    );
  },
  {functional: true, dispatch: false}
);

export const createRefreshTokenEffect = createEffect(
  (
    actions$ = inject(Actions),
    accountService = inject(AccountService),
    sharedService = inject(SharedService),
    persistanceService = inject(PersistanceService)
  ) => {
    return actions$.pipe(
      ofType(accountActions.refreshUserToken),
      switchMap(() => {
        const user = persistanceService.get();
        if (!user) {
          return of(accountActions.refreshUserTokenFailure());
        }
        const jwt = (<UserInterface>user).jwt;
        return accountService.createRefreshToken(jwt).pipe(
          map((currentUser: UserInterface) => {
            accountService.setCurrentUser(currentUser);
            return accountActions.refreshUserTokenSuccess({currentUser});
          }),
          catchError((errorResponse: HttpErrorResponse) => {
            let message = errorResponse.error || '';
            if (message && message.Errors && Array.isArray(message.Errors)) {
              message = message.Errors.join(',');
            }
            sharedService.showNotification(false, 'Access Blocked', message);
            return of(accountActions.refreshUserTokenFailure());
          })
        );
      })
    );
  },
  {functional: true}
);

export const redirectAfterRefreshTokenFailureEffect = createEffect(
  (actions$ = inject(Actions), accountService = inject(AccountService)) => {
    return actions$.pipe(
      ofType(accountActions.refreshUserTokenFailure),
      tap(() => {
        accountService.logout();
      })
    );
  },
  {functional: true, dispatch: false}
);

export const logoutEffect = createEffect(
  (actions$ = inject(Actions), accountService = inject(AccountService)) => {
    return actions$.pipe(
      ofType(accountActions.logout),
      tap(() => {
        accountService.logout();
      })
    );
  },
  {functional: true, dispatch: false}
);
