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
    on(adminActions.getMember, (state) => ({
      ...state,
      isLoading: true,
      validationErrors: null,
    })),
    on(adminActions.getMemberSuccess, (state, action) => ({
      ...state,
      isLoading: false,
      member: action.member,
      members: [],
    })),
    on(adminActions.getMemberFailure, (state, action) => ({
      ...state,
      isLoading: false,
      member: null,
      members: [],
      validationErrors: action.errors,
    })),
    on(adminActions.lockMember, (state) => ({
      ...state,
      isLoading: true,
      isSubmitting: true,
      validationErrors: null,
    })),
    on(adminActions.lockMemberSuccess, (state, action) => ({
      ...state,
      isLoading: false,
      isSubmitting: false,
      members: state.members.map((m) => {
        if (m.id === action.id) {
          m = {...m, isLocked: true};
        }
        return m;
      }),
    })),
    on(adminActions.lockMemberFailure, (state, action) => ({
      ...state,
      isLoading: false,
      isSubmitting: false,
      validationErrors: action.errors,
    })),
    on(adminActions.unlockMember, (state) => ({
      ...state,
      isLoading: true,
      isSubmitting: true,
      validationErrors: null,
    })),
    on(adminActions.unlockMemberSuccess, (state, action) => ({
      ...state,
      isLoading: false,
      isSubmitting: false,
      members: state.members.map((m) => {
        if (m.id === action.id) {
          m = {...m, isLocked: false};
        }
        return m;
      }),
    })),
    on(adminActions.unlockMemberFailure, (state, action) => ({
      ...state,
      isLoading: false,
      isSubmitting: false,
      validationErrors: action.errors,
    })),
    on(adminActions.deleteMember, (state) => ({
      ...state,
      isLoading: true,
      isSubmitting: true,
      validationErrors: null,
    })),
    on(adminActions.deleteMemberSuccess, (state, action) => ({
      ...state,
      isLoading: false,
      isSubmitting: false,
      members: state.members.filter((m) => m.id !== action.id),
    })),
    on(adminActions.deleteMemberFailure, (state, action) => ({
      ...state,
      isLoading: false,
      isSubmitting: false,
      validationErrors: action.errors,
    })),
    on(adminActions.getAppRoles, (state) => ({
      ...state,
      isLoading: true,
      isSubmitting: false,
      validationErrors: null,
    })),
    on(adminActions.getAppRolesSuccess, (state, action) => ({
      ...state,
      isLoading: false,
      roles: action.roles,
    })),
    on(adminActions.getAppRolesFailure, (state, action) => ({
      ...state,
      isLoading: false,
      roles: [],
      validationErrors: action.errors,
    })),
    on(adminActions.addEditMember, (state) => ({
      ...state,
      isLoading: true,
      isSubmitting: true,
      validationErrors: null,
    })),
    on(adminActions.addEditMemberSuccess, (state, action) => ({
      ...state,
      isLoading: false,
      isSubmitting: false,
      validationErrors: null,
    })),
    on(adminActions.addEditMemberFailure, (state, action) => ({
      ...state,
      isLoading: false,
      isSubmitting: false,
      validationErrors: action.errors,
    })),
    on(routerNavigatedAction, (state, action) => ({
      ...state,
      isLoading: false,
      isSubmitting: false,
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
