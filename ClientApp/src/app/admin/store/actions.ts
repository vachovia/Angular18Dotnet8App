import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {MemberAddEditInterface, MemberViewInterface} from './../types';
import {BackendErrorsInterface} from './../../shared/types';

export const adminActions = createActionGroup({
  source: 'admin',
  events: {
    'Get Members': emptyProps(),
    'Get Members Success': props<{members: MemberViewInterface[]}>(),
    'Get Members Failure': props<{errors: BackendErrorsInterface}>(),

    'Get Member': props<{id: string}>(),
    'Get Member Success': props<{member: MemberAddEditInterface}>(),
    'Get Member Failure': props<{errors: BackendErrorsInterface}>(),

    'Get App Roles': emptyProps(),
    'Get App Roles Success': props<{roles: string[]}>(),
    'Get App Roles Failure': props<{errors: BackendErrorsInterface}>(),

    'Add Edit Member': props<{model: MemberAddEditInterface}>(),
    'Add Edit Member Success': emptyProps(),
    'Add Edit Member Failure': props<{errors: BackendErrorsInterface}>(),

    'Lock Member': props<{id: string}>(),
    'Lock Member Success': emptyProps(),
    'Lock Member Failure': props<{errors: BackendErrorsInterface}>(),

    'Unlock Member': props<{id: string}>(),
    'Unlock Member Success': emptyProps(),
    'Unlock Member Failure': props<{errors: BackendErrorsInterface}>(),

    'Delete Member': props<{id: string}>(),
    'Delete Member Success': emptyProps(),
    'Delete Member Failure': props<{errors: BackendErrorsInterface}>(),
  },
});
