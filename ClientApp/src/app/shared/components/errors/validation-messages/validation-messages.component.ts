import {Component, Input, OnInit} from '@angular/core';
import {BackendErrorsInterface} from '../../../types';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-validation-messages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './validation-messages.component.html',
  styleUrl: './validation-messages.component.scss',
})
export class ValidationMessagesComponent implements OnInit {
  @Input() backendErrors: BackendErrorsInterface | null = null;
  errorMessages: string[] = [];

  ngOnInit(): void {
    let message = this.backendErrors?.message || '';
    if (message && message.Errors && Array.isArray(message.Errors)) {
      message = message.Errors.join(',');
    }

    this.errorMessages.push(`Error: ${message}`);
    this.errorMessages.push(`Status: ${this.backendErrors?.status}`);
  }
}
