import {Route} from '@angular/router';
import {PlayComponent} from './components/play.component';
import { AuthGuard } from './../shared/services';

export const playRoutes: Route[] = [
  {
    path: '',
    runGuardsAndResolvers: 'always',
    canActivate: [AuthGuard],
    component: PlayComponent,
  },
];

