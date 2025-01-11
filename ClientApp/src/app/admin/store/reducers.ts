import {createFeature, createReducer, on} from '@ngrx/store';
import {AdminStateInterface} from './../types/';
import {adminActions} from './actions';
import {routerNavigatedAction} from '@ngrx/router-store';

const initialState: AdminStateInterface = {
  isSubmitting: false,
  isLoading: false,
  member: null,
  members: [],
  roles: [],
  validationErrors: null,
};

const adminFeature = createFeature({
  name: 'admin',
  reducer: createReducer(
    initialState,
    on(adminActions.getMembers, (state) => ({
      ...state,
      isLoading: true,
      validationErrors: null,
    })),
    on(adminActions.getMembersSuccess, (state, action) => ({
      ...state,
      isLoading: false,
      member: null,
      members: action.members,
    })),
    on(adminActions.getMembersFailure, (state, action) => ({
      ...state,
      isLoading: false,
      member: null,
      members: [],
      validationErrors: action.errors,
    })),    
    on(routerNavigatedAction, (state, action) => ({
      ...state,
      validationErrors: null,
    }))
  ),
});

export const {
  name: adminFeatureKey,
  reducer: adminReducer,
  selectIsSubmitting,
  selectIsLoading,
  selectMember,
  selectMembers,
  selectRoles,
  selectValidationErrors,
} = adminFeature;
