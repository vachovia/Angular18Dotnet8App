import {BackendErrorsInterface} from '../../shared/types';
import { PlayResponseInterface } from './playResponse.interface';

export interface PlayStateInterface {
  isLoading: boolean;
  play: PlayResponseInterface | null | undefined;
  validationErrors: BackendErrorsInterface | null;
}
