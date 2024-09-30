import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {BackendErrorsInterface} from './../../shared/types/';
import { PlayResponseInterface } from '../types';

export const playActions = createActionGroup({
  source: 'play',
  events: {
    Play: emptyProps(),
    'Play Success': props<{play: PlayResponseInterface}>(),
    'Play Failure': props<{errors: BackendErrorsInterface}>(),
  },
});
