import {inject} from '@angular/core';
import {Router} from '@angular/router';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {switchMap, map, catchError, of, tap} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {SharedService} from './../../shared/services';
import {PlayService} from '../services/play.service';
import {playActions} from './actions';
import {PlayResponseInterface} from '../types';
import { BackendErrorsInterface } from '../../shared/types';

export const registerEffect = createEffect(
  (actions$ = inject(Actions), playService = inject(PlayService), sharedService = inject(SharedService)) => {
    return actions$.pipe(
      ofType(playActions.play),
      switchMap(() => {
        return playService.getPlayers().pipe(
          map((response: PlayResponseInterface) => {
            sharedService.showNotification(true, '', response.value.message);
            return playActions.playSuccess({play: response});
          }),
          catchError((errorResponse: HttpErrorResponse) => {
            let message;
            if (errorResponse.error && errorResponse.error.errors) {
              message = errorResponse.error.errors;
            } else {
              message = errorResponse.error;
            }
            const errorMessages: BackendErrorsInterface = {
              status: errorResponse.status,
              message: errorResponse.error,
            };           
            sharedService.showNotification(false, 'Restricted Area', 'Please Login.');
            return of(
              playActions.playFailure({
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

/** Auth Guard applied no need to have this effect **/

// export const redirectAfterPlayFailedEffect = createEffect(
//   (actions$ = inject(Actions), router = inject(Router)) => {
//     return actions$.pipe(
//       ofType(playActions.playFailure),
//       tap(() => {
//         router.navigateByUrl('/login');
//       })
//     );
//   },
//   {functional: true, dispatch: false}
// );