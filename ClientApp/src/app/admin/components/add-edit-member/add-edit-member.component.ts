import {CommonModule} from '@angular/common';
import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {combineLatest, Subscription} from 'rxjs';
import {Store} from '@ngrx/store';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ValidationMessagesComponent} from './../../../shared/components';
import {
  selectIsLoading,
  selectIsSubmitting,
  selectMember,
  selectRoles,
  selectValidationErrors,
} from './../../store/reducers';
import {adminActions} from './../../store/actions';
import {SharedService} from './../../../shared/services';
import {MemberAddEditInterface} from './../../types';

@Component({
  selector: 'app-add-edit-member',
  standalone: true,
  imports: [CommonModule, RouterLink, ValidationMessagesComponent],
  templateUrl: './add-edit-member.component.html',
  styleUrl: './add-edit-member.component.scss',
})
export class AddEditMemberComponent implements OnInit, OnDestroy {
  store = inject(Store);
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);
  formBuilder = inject(FormBuilder);
  sharedService = inject(SharedService);

  addNew = true;
  submitted = false;
  formInitialized = false;
  appRoles: string[] = [];
  existingMemberRoles: string[] = [];
  memberForm: FormGroup = new FormGroup({});
  rolesSubscription?: Subscription;
  memberSubscription?: Subscription;
  existingMember: MemberAddEditInterface | null = null;

  roles$ = this.store.select(selectRoles);
  member$ = this.store.select(selectMember);

  data$ = combineLatest({
    isLoading: this.store.select(selectIsLoading),
    isSubmitting: this.store.select(selectIsSubmitting),
    backendErrors: this.store.select(selectValidationErrors),
  });

  ngOnInit(): void {
    this.loadMemberAndRoles();
    this.store.dispatch(adminActions.getAppRoles());

    const id = this.activatedRoute.snapshot.paramMap.get('id');

    if (id) {
      this.addNew = false;
      this.store.dispatch(adminActions.getMember({id}));
    } else {
      this.initializeForm(null);
    }
  }

  initializeForm(member: MemberAddEditInterface | null) {
    if (member) {
      this.memberForm = this.formBuilder.group({
        id: [member.id],
        firstName: [member.firstName, Validators.required],
        lastName: [member.lastName, Validators.required],
        userName: [member.userName, Validators.required],
        password: [''],
        roles: [member.roles, Validators.required],
      });

      this.existingMemberRoles = member.roles.split(',');
      
    } else {
      this.memberForm = this.formBuilder.group({
        id: [''],
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        userName: ['', Validators.required],
        password: ['', Validators.required, Validators.minLength(8), Validators.maxLength(15)],
        roles: ['', Validators.required],
      });
    }

    this.formInitialized = true;
  }

  loadMemberAndRoles() {
    this.rolesSubscription = this.roles$.subscribe({
      next: (roles) => {
        this.appRoles = JSON.parse(JSON.stringify(roles));
      },
    });
    this.memberSubscription = this.member$.subscribe({
      next: (member) => {
        this.existingMember = JSON.parse(JSON.stringify(member));
        this.initializeForm(this.existingMember);
      },
    });
  }

  ngOnDestroy(): void {
    this.rolesSubscription?.unsubscribe();
    this.memberSubscription?.unsubscribe();
  }
}
