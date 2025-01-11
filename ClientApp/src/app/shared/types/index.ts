import {JwtPayload} from 'jwt-decode';
import {UserInterface} from './user.interface';
import {BackendErrorsInterface} from './backendErrors.interface';
import {BackendResponseInterface} from './backendResponse.interface';

type Nullable<T> = T | null | undefined;

type AppJwtPayload = JwtPayload & {role: string | string[]};

export type {UserInterface, BackendErrorsInterface, BackendResponseInterface, AppJwtPayload, Nullable};
