import {inject} from '@angular/core';
import {Router} from '@angular/router';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {switchMap, map, catchError, of, tap} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {BackendErrorsInterface} from './../../shared/types/';
import {SharedService} from './../../shared/services';
import {AdminService} from './../services/admin.service';
import {adminActions} from './actions';
import {BackendResponseInterface} from './../../account/types';
import { MemberViewInterface } from '../types';

export const registerEffect = createEffect(
  (actions$ = inject(Actions), adminService = inject(AdminService), sharedService = inject(SharedService)) => {
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

