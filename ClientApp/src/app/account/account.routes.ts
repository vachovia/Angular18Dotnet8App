import {Route} from '@angular/router';
import {LoginComponent, RegisterComponent} from './components/';

export const registerRoutes: Route[] = [{path: '', component: RegisterComponent}];

export const loginRoutes: Route[] = [{path: '', component: LoginComponent}];
