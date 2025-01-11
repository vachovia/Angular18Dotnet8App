import {BackendErrorsInterface} from '../../shared/types';
import {MemberViewInterface, MemberAddEditInterface} from './';

export interface AdminStateInterface {
  isSubmitting: boolean;
  isLoading: boolean;
  member: MemberAddEditInterface | null;
  members: MemberViewInterface[];
  roles: string[];
  validationErrors: BackendErrorsInterface | null;
}
