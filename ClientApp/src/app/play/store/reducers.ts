import {createFeature, createReducer, on} from '@ngrx/store';
import {PlayStateInterface} from './../types/';
import {playActions} from './actions';
import {routerNavigatedAction} from '@ngrx/router-store';

const initialState: PlayStateInterface = {
  isLoading: false,
  play: undefined,
  validationErrors: null,
};

const playFeature = createFeature({
  name: 'play',
  reducer: createReducer(
    initialState,
    on(playActions.play, (state) => ({
      ...state,
      isLoading: true,
      validationErrors: null,
    })),
    on(playActions.playSuccess, (state, action) => ({
      ...state,
      play: action.play,
      isLoading: false,
    })),
    on(playActions.playFailure, (state, action) => ({
      ...state,
      isLoading: false,
      validationErrors: action.errors,
    })),
    on(routerNavigatedAction, (state) => {
      return {
        ...state,
        isLoading: false,
        validationErrors: null,
      };
    })
  ),
});

export const {name: playFeatureKey, reducer: playReducer, selectIsLoading, selectValidationErrors, selectPlay} = playFeature;
