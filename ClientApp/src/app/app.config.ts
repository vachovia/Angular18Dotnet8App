import {ApplicationConfig, isDevMode, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';
import {routes} from './app.routes';

import {provideState, provideStore} from '@ngrx/store'; // installed with K
import {provideStoreDevtools} from '@ngrx/store-devtools'; // installed with K
import {provideHttpClient, withInterceptors} from '@angular/common/http'; // installed with K
import {provideEffects} from '@ngrx/effects'; // installed with K
import {provideRouterStore, routerReducer} from '@ngrx/router-store'; // installed with K
import * as accountEffects from './account/store/effects';
import {accountFeatureKey, accountReducer} from './account/store/reducers';

import {BsModalService} from 'ngx-bootstrap/modal'; // installed with SV
import {provideAnimations} from '@angular/platform-browser/animations'; // installed with SV
import {jwtInterceptor} from './shared/services/jwtInterceptor'; // installed with SV

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),

    provideHttpClient(withInterceptors([jwtInterceptor])),
    provideStore({
      router: routerReducer, // to clear Validation Errors after navigation
    }),
    provideRouterStore(),
    provideEffects(accountEffects),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true,
      trace: false,
      traceLimit: 75,
    }),
    provideState(accountFeatureKey, accountReducer),

    provideAnimations(),
    BsModalService,
  ],
};
