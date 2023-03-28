import { Injectable } from '@angular/core';

import {
  AbstractControl,
  AsyncValidator,
  ValidationErrors,
} from '@angular/forms';

import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
  providedIn: 'root',
})
export class EmailTaken implements AsyncValidator {
  constructor(private authService: AngularFireAuth) {}

  validate = (control: AbstractControl): Promise<ValidationErrors | null> => {
    return this.authService
      .fetchSignInMethodsForEmail(control.value)
      .then((response) => (response.length ? { emailTaken: true } : null));
  };
}
