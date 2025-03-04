import {Routes} from '@angular/router';
import {NotFoundComponent} from './shared/components';
import {AuthGuard} from './shared/services';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./home/home.routes').then((m) => m.homeRoutes),
  },
  // {
  //   path: '',
  //   runGuardsAndResolvers: 'always',
  //   canActivate: [AuthGuard],
  //   children: [
  //     {
  //       path: 'play',
  //       loadChildren: () => import('./play/play.routes').then((m) => m.playRoutes),
  //     },
  //     {
  //       path: 'admin',
  //       loadChildren: () => import('./admin/admin.routes').then((m) => m.adminRoutes),
  //     },
  //   ],
  // },
  {
    path: 'play',
    loadChildren: () => import('./play/play.routes').then((m) => m.playRoutes),
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then((m) => m.adminRoutes),
  },
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
    path: 'reset-password',
    loadChildren: () => import('./account/account.routes').then((m) => m.resetPasswordRoutes),
  },
  {
    path: 'third-party/:provider',
    loadChildren: () => import('./account/account.routes').then((m) => m.thirdPartyRoutes),
  },
  {
    path: 'not-found',
    loadChildren: () => import('./shared/components/errors/not-found/not-found.routes').then((m) => m.notFoundRoutes),
  },
  {path: '**', component: NotFoundComponent, pathMatch: 'full'},
];
