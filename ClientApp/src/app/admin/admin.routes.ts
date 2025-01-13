import {Route} from '@angular/router';
import {AdminComponent, AddEditMemberComponent} from './components';
import { AdminGuard } from './services/admin.guard'; 

export const adminRoutes: Route[] = [
  {
    path: '',
    runGuardsAndResolvers: 'always',
    canActivate: [AdminGuard],
    children: [
      {path: '', component: AdminComponent},
      {path: 'add-member', component: AddEditMemberComponent},
      {path: 'edit-member/:id', component: AddEditMemberComponent},
    ],
  },
];
