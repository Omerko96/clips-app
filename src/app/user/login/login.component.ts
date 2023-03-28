import { Component } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  constructor(private auth: AngularFireAuth) {}

  public credentials: {
    email: string;
    password: string;
  } = {
    email: '',
    password: '',
  };

  public showAlert: boolean = false;
  public alertMessage: string = 'Please wait! We are logging you in.';
  public alertColor: string = 'blue';
  public inSubmission: boolean = false;

  public async login(): Promise<void> {
    this.showAlert = true;
    this.alertMessage = 'Please wait! We are logging you in.';
    this.alertColor = 'blue';
    this.inSubmission = true;

    try {
      await this.auth.signInWithEmailAndPassword(
        this.credentials.email,
        this.credentials.password
      );
    } catch (e) {
      this.alertMessage =
        'An unexpected error occured. Please try again later.';
      this.alertColor = 'red';
      this.inSubmission = false;
      return;
    }
    this.alertMessage = 'Success! Your are now logged in.';
    this.alertColor = 'green';
  }
}
