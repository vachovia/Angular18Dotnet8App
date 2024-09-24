import {UserInterface, BackendErrorsInterface} from '../../shared/types';

export interface AccountStateInterface{
    isSubmitting: boolean;
    currentUser: UserInterface | null | undefined,
    isLoading: boolean,
    validationErrors: BackendErrorsInterface | null
}