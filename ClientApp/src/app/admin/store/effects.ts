import {inject} from '@angular/core';
import {Router} from '@angular/router';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {switchMap, map, catchError, of, tap} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {BackendErrorsInterface} from './../../shared/types/';
import {SharedService} from './../../shared/services';
import {AdminService} from './../services/admin.service';
import {adminActions} from './actions';
import { BackendResponseInterface } from './../../shared/types/';
import { MemberAddEditInterface, MemberViewInterface } from '../types';

export const getMembersEffect = createEffect(
  (actions$ = inject(Actions), adminService = inject(AdminService)) => {
    return actions$.pipe(
      ofType(adminActions.getMembers),
      switchMap(() => {
        return adminService.getMembers().pipe(
          map((response: MemberViewInterface[]) => {
            return adminActions.getMembersSuccess({members: response});
          }),
          catchError((errorResponse: HttpErrorResponse) => {
            let errorMessages: BackendErrorsInterface = {
              status: errorResponse.status,
              message: errorResponse.error,
            };
            return of(
              adminActions.getMembersFailure({
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

export const getMemberEffect = createEffect(
  (actions$ = inject(Actions), adminService = inject(AdminService)) => {
    return actions$.pipe(
      ofType(adminActions.getMember),
      switchMap(({id}) => {
        return adminService.getMember(id).pipe(
          map((response: MemberAddEditInterface) => {
            return adminActions.getMemberSuccess({member: response});
          }),
          catchError((errorResponse: HttpErrorResponse) => {
            let errorMessages: BackendErrorsInterface = {
              status: errorResponse.status,
              message: errorResponse.error,
            };
            return of(
              adminActions.getMemberFailure({
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

export const getAppRolesEffect = createEffect(
  (actions$ = inject(Actions), adminService = inject(AdminService)) => {
    return actions$.pipe(
      ofType(adminActions.getAppRoles),
      switchMap(() => {
        return adminService.getAppRoles().pipe(
          map((response: string[]) => {
            return adminActions.getAppRolesSuccess({roles: response});
          }),
          catchError((errorResponse: HttpErrorResponse) => {
            let errorMessages: BackendErrorsInterface = {
              status: errorResponse.status,
              message: errorResponse.error,
            };
            return of(
              adminActions.getAppRolesFailure({
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

export const addEditMemberEffect = createEffect(
  (actions$ = inject(Actions), adminService = inject(AdminService)) => {
    return actions$.pipe(
      ofType(adminActions.addEditMember),
      switchMap(({model}) => {
        return adminService.addEditMember(model).pipe(
          map((response: BackendResponseInterface) => {
            return adminActions.addEditMemberSuccess();
          }),
          catchError((errorResponse: HttpErrorResponse) => {
            let errorMessages: BackendErrorsInterface = {
              status: errorResponse.status,
              message: errorResponse.error,
            };
            return of(
              adminActions.addEditMemberFailure({
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

export const lockMemberEffect = createEffect(
  (actions$ = inject(Actions), adminService = inject(AdminService)) => {
    return actions$.pipe(
      ofType(adminActions.lockMember),
      switchMap(({id}) => {
        return adminService.lockMember(id).pipe(
          map(() => {
            return adminActions.lockMemberSuccess({id});
          }),
          catchError((errorResponse: HttpErrorResponse) => {
            let errorMessages: BackendErrorsInterface = {
              status: errorResponse.status,
              message: errorResponse.error,
            };
            return of(
              adminActions.lockMemberFailure({
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

export const unlockMemberEffect = createEffect(
  (actions$ = inject(Actions), adminService = inject(AdminService)) => {
    return actions$.pipe(
      ofType(adminActions.unlockMember),
      switchMap(({id}) => {
        return adminService.unlockMember(id).pipe(
          map(() => {
            return adminActions.unlockMemberSuccess({id});
          }),
          catchError((errorResponse: HttpErrorResponse) => {
            let errorMessages: BackendErrorsInterface = {
              status: errorResponse.status,
              message: errorResponse.error,
            };
            return of(
              adminActions.unlockMemberFailure({
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

export const deleteMemberEffect = createEffect(
  (actions$ = inject(Actions), adminService = inject(AdminService)) => {
    return actions$.pipe(
      ofType(adminActions.deleteMember),
      switchMap(({id}) => {
        return adminService.deleteMember(id).pipe(
          map(() => {
            return adminActions.deleteMemberSuccess({id});
          }),
          catchError((errorResponse: HttpErrorResponse) => {
            let errorMessages: BackendErrorsInterface = {
              status: errorResponse.status,
              message: errorResponse.error,
            };
            return of(
              adminActions.deleteMemberFailure({
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

export const redirectAfterDeleteMemberEffect = createEffect(
  (actions$ = inject(Actions), router = inject(Router)) => {
    return actions$.pipe(
      ofType(adminActions.deleteMemberSuccess),
      tap(() => {
        router.navigateByUrl('/admin');
      })
    );
  },
  {functional: true, dispatch: false}
);