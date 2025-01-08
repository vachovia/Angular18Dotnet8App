import { Route } from '@angular/router';
import { HomeComponent } from './components/home.component';
import {AuthGuard} from './../shared/services';

export const homeRoutes: Route[] = [{ path: '', component: HomeComponent }];

// export const homeRoutes: Route[] = [
//   {
//     path: '',
//     component: HomeComponent,
//     runGuardsAndResolvers: 'always',
//     canActivate: [AuthGuard],
//     children: [
//       {
//         path: 'play',
//         loadChildren: () => import('./../play/play.routes').then((m) => m.playRoutes),
//       },
//       {
//         path: 'admin',
//         loadChildren: () => import('./../admin/admin.routes').then((m) => m.adminRoutes),
//       },
//     ],
//   },
// ];
