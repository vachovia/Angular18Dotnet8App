import {Directive, inject, Input, OnInit, TemplateRef, ViewContainerRef} from '@angular/core';
import {jwtDecode} from 'jwt-decode';
import {PersistanceService} from '../services';
import {AppJwtPayload, UserInterface} from './../types';

@Directive({
  selector: '[appUserHasRole]',
  standalone: true,
})
export class UserHasRoleDirective implements OnInit {
  @Input() appUserHasRole: string[] = [];
  templateRef = inject(TemplateRef<any>);
  viewContainerRef = inject(ViewContainerRef);
  persistanceService = inject(PersistanceService);

  constructor() {}

  ngOnInit() {
    const user = this.persistanceService.get();
    if (!user) {
      this.viewContainerRef.clear();
      return;
    }

    const jwt = (<UserInterface>user).jwt;
    const decodedToken: AppJwtPayload = jwtDecode(jwt);
    console.log(decodedToken);

    if (!Array.isArray(decodedToken.role)) {
      decodedToken.role = [decodedToken.role];
    }
    const checkRole = decodedToken.role.some((role: any) => this.appUserHasRole.includes(role));
    if (checkRole) {
      this.viewContainerRef.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainerRef.clear();
    }
  }
}
