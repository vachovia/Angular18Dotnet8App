import {Route} from '@angular/router';
import {AdminComponent} from './components/admin/admin.component';
import {AuthGuard} from './../shared/services';

export const adminRoutes: Route[] = [
  {
    path: '',
    runGuardsAndResolvers: 'always',
    canActivate: [AuthGuard],
    component: AdminComponent,
  },
];
