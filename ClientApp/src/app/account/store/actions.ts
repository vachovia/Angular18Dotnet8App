import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {RegisterInterface, LoginInterface, ConfirmEmailInterface, ResetPasswordInterface} from './../types';
import {UserInterface, BackendErrorsInterface} from './../../shared/types/';

export const accountActions = createActionGroup({
  source: 'account',
  events: {
    Register: props<{request: RegisterInterface}>(),
    'Register Success': emptyProps(),
    'Register Failure': props<{errors: BackendErrorsInterface}>(),

    Login: props<{request: LoginInterface}>(),
    'Login Success': props<{currentUser: UserInterface}>(),
    'Login Failure': props<{errors: BackendErrorsInterface}>(),

    'Confirm Email': props<{request: ConfirmEmailInterface}>(),
    'Confirm Email Success': emptyProps(),
    'Confirm Email Failure': props<{errors: BackendErrorsInterface}>(),

    'Resend Email Confiramtion': props<{request: string}>(),
    'Resend Email Confiramtion Success': emptyProps(),
    'Resend Email Confiramtion Failure': props<{errors: BackendErrorsInterface}>(),

    'Forgot Username Or Password': props<{request: string}>(),
    'Forgot Username Or Password Success': emptyProps(),
    'Forgot Username Or Password Failure': props<{errors: BackendErrorsInterface}>(),

    'Reset Password': props<{request: ResetPasswordInterface}>(),
    'Reset Password Success': emptyProps(),
    'Reset Password Failure': props<{errors: BackendErrorsInterface}>(),

    'Get Current User': emptyProps(),
    'Get Current User Success': props<{currentUser: UserInterface}>(),
    'Get Current User Failure': emptyProps(),

    'Refresh User Token': props<{currentUser: UserInterface}>(),

    'Logout': emptyProps(),
  },
});
