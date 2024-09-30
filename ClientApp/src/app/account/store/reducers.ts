import {createFeature, createReducer, on} from '@ngrx/store';
import {AccountStateInterface} from './../types/';
import {accountActions} from './actions';
import {routerNavigatedAction} from '@ngrx/router-store';

const initialState: AccountStateInterface = {
  isSubmitting: false,
  isLoading: false,
  currentUser: undefined,
  validationErrors: null,
};

const accountFeature = createFeature({
  name: 'account',
  reducer: createReducer(
    initialState,
    on(accountActions.register, (state) => ({
      ...state,
      isSubmitting: true,
      validationErrors: null,
    })),
    on(accountActions.registerSuccess, (state, action) => ({
      ...state,
      isSubmitting: false,
      currentUser: null,
    })),
    on(accountActions.registerFailure, (state, action) => ({
      ...state,
      isSubmitting: false,
      validationErrors: action.errors,
    })),
    on(accountActions.login, (state) => ({
      ...state,
      isSubmitting: true,
      validationErrors: null,
    })),
    on(accountActions.loginSuccess, (state, action) => ({
      ...state,
      isSubmitting: false,
      currentUser: action.currentUser,
    })),
    on(accountActions.loginFailure, (state, action) => ({
      ...state,
      isSubmitting: false,
      validationErrors: action.errors,
    })),
    on(accountActions.getCurrentUser, (state) => ({
      ...state,
      isLoading: true,
    })),
    on(accountActions.getCurrentUserSuccess, (state, action) => ({
      ...state,
      isLoading: false,
      currentUser: action.currentUser,
    })),
    on(accountActions.getCurrentUserFailure, (state, action) => ({
      ...state,
      isLoading: false,
      currentUser: null,
    })),
    on(routerNavigatedAction, (state, action) => ({
      ...state,
      validationErrors: null,
    })),
    on(accountActions.logout, (state) => ({
      ...state,
      ...initialState,
      currentUser: null,
    }))
  ),
});

export const {
  name: accountFeatureKey,
  reducer: accountReducer,
  selectIsSubmitting,
  selectIsLoading,
  selectCurrentUser,
  selectValidationErrors,
} = accountFeature;
