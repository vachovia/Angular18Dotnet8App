import {Route} from '@angular/router';
import {AdminComponent} from './components/admin/admin.component';
import {AdminGuard} from './../shared/services';

export const adminRoutes: Route[] = [
  {
    path: '',
    runGuardsAndResolvers: 'always',
    canActivate: [AdminGuard],
    component: AdminComponent,
  },
];
