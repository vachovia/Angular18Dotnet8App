import {Component, inject, OnDestroy, OnInit, TemplateRef} from '@angular/core';
import {Store} from '@ngrx/store';
import {combineLatest, Subscription} from 'rxjs';
import {CommonModule} from '@angular/common';
import {adminActions} from './../../store/actions';
import {ValidationMessagesComponent} from './../../../shared/components';
import {selectIsLoading, selectIsSubmitting, selectMembers, selectValidationErrors} from './../../store/reducers';
import {RouterLink} from '@angular/router';
import {SharedService} from './../../../shared/services';
import {BsModalRef, BsModalService} from 'ngx-bootstrap/modal';
import {MemberViewInterface} from './../../types';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, ValidationMessagesComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent implements OnInit, OnDestroy {
  membersSubscription?: Subscription;
  store = inject(Store);
  sharedService = inject(SharedService);
  modalService = inject(BsModalService);

  modalRef?: BsModalRef;
  members: MemberViewInterface[] = [];
  memberToDelete: MemberViewInterface | null = null;

  members$ = this.store.select(selectMembers);
  data$ = combineLatest({
    isLoading: this.store.select(selectIsLoading),
    isSubmitting: this.store.select(selectIsSubmitting),
    backendErrors: this.store.select(selectValidationErrors),
  });

  ngOnInit(): void {
    this.loadMembers();
    this.store.dispatch(adminActions.getMembers());
  }

  loadMembers() {
    this.membersSubscription = this.members$.subscribe({
      next: (members) => {
        this.members = JSON.parse(JSON.stringify(members));
      },
    });
  }

  lockMember(id: string) {
    this.store.dispatch(adminActions.lockMember({id}));
    this.handleLockUnlockFilterAndMessage(id, true);
  }

  unlockMember(id: string) {
    this.store.dispatch(adminActions.unlockMember({id}));
    this.handleLockUnlockFilterAndMessage(id, false);
  }

  handleLockUnlockFilterAndMessage(id: string, locking: boolean) {
    const member = this.findMember(id);
    if (member) {
      // works because of copy of members
      // member.isLocked = !member.isLocked;
      if (locking) {
        this.sharedService.showNotification(true, 'Locked', `${member?.userName} member has been locked.`);
      } else {
        this.sharedService.showNotification(true, 'Unlocked', `${member?.userName} member has been unlocked.`);
      }
    }
  }

  findMember(id: string): MemberViewInterface | undefined {
    return this.members.find((m) => m.id === id);
  }

  deleteMember(id: string, template: TemplateRef<any>) {
    const member = this.findMember(id);
    if (member) {
      this.memberToDelete = member;
      this.modalRef = this.modalService.show(template, {class: 'modal-sm'});
    }
  }

  confirm() {
    if (this.memberToDelete) {
      const id = this.memberToDelete.id;
      this.store.dispatch(adminActions.deleteMember({id}));
      this.sharedService.showNotification(
        true,
        'Unlocked',
        `Member of ${this.memberToDelete?.userName} has been deleted.`
      );
      this.memberToDelete = null;
      this.modalRef?.hide();
    }
  }

  decline() {
    this.memberToDelete = null;
    this.modalRef?.hide();
  }

  ngOnDestroy(): void {
    this.membersSubscription?.unsubscribe();
  }
}
