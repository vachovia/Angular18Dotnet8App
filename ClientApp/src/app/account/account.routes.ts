import {Route} from '@angular/router';
import {
  ConfirmEmailComponent,
  LoginComponent,
  RegisterComponent,
  ResetPasswordComponent,
  SendEmailComponent,
} from './components/';

export const registerRoutes: Route[] = [{path: '', component: RegisterComponent}];

export const loginRoutes: Route[] = [{path: '', component: LoginComponent}];

export const confirmEmailRoutes: Route[] = [{path: '', component: ConfirmEmailComponent}];

export const sendEmailRoutes: Route[] = [{path: '', component: SendEmailComponent}];

export const resetPasswordRoutes: Route[] = [{path: '', component: ResetPasswordComponent}];
