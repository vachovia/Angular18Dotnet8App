import {getRouterSelectors, RouterReducerState,} from '@ngrx/router-store';

// Other selectors are available:
// https://next.ngrx.io/guide/router-store/selectors
export const {selectQueryParam, selectRouteParam, selectRouteDataParam} = getRouterSelectors();
