import {Routes} from '@angular/router';
import {NotFoundComponent} from './shared/components';

export const routes: Routes = [
  {
    path: 'register',
    loadChildren: () => import('./account/account.routes').then((m) => m.registerRoutes),
  },
  {
    path: 'login',
    loadChildren: () => import('./account/account.routes').then((m) => m.loginRoutes),
  },
  {
    path: 'confirm-email',
    loadChildren: () => import('./account/account.routes').then((m) => m.confirmEmailRoutes),
  },
  {
    path: 'send-email/:mode',
    loadChildren: () => import('./account/account.routes').then((m) => m.sendEmailRoutes),
  },
  {
    path: '',
    loadChildren: () => import('./home/home.routes').then((m) => m.homeRoutes),
  },
  {
    path: 'play',
    loadChildren: () => import('./play/play.routes').then((m) => m.playRoutes),
  },
  {
    path: 'not-found',
    loadChildren: () => import('./shared/components/errors/not-found/not-found.routes').then((m) => m.notFoundRoutes),
  },
  {path: '**', component: NotFoundComponent, pathMatch: 'full'},
];
