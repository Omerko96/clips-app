import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { AuthService } from 'src/app/services/auth.service';

import { RegisterValidators } from '../validators/register-validators';
import { EmailTaken } from '../validators/email-taken';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  constructor(private auth: AuthService, private emailTaken: EmailTaken) {}

  public inSubmission: boolean = false;

  name = new FormControl('', [Validators.required, Validators.minLength(3)]);
  email = new FormControl(
    '',
    [Validators.required, Validators.email],
    [this.emailTaken.validate]
  );
  age = new FormControl('', [
    Validators.required,
    Validators.min(18),
    Validators.max(120),
  ]);
  password = new FormControl('', [
    Validators.required,
    Validators.pattern(/^(?=.*d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm),
  ]);
  confirmPassword = new FormControl('', [Validators.required]);
  phoneNumber = new FormControl('', [
    Validators.required,
    Validators.minLength(13),
    Validators.maxLength(13),
  ]);

  public registerForm: FormGroup = new FormGroup(
    {
      name: this.name,
      email: this.email,
      age: this.age,
      password: this.password,
      confirmPassword: this.confirmPassword,
      phoneNumber: this.phoneNumber,
    },
    [RegisterValidators.match('password', 'confirmPassword')]
  );

  public showAlert: boolean = false;
  public alertMessage: string = 'Please wait! Your account is being created.';
  public alertColor: string = 'blue';

  public async register(): Promise<void> {
    this.showAlert = true;
    this.alertMessage = 'Please wait! Your account is being created.';
    this.alertColor = 'blue';
    this.inSubmission = true;

    try {
      await this.auth.createUser(this.registerForm.value);
    } catch (e) {
      console.error(e);

      this.alertMessage =
        'An unexpected error occured. Please try again later.';
      this.alertColor = 'red';
      this.inSubmission = false;
      return;
    }

    this.alertMessage = 'Success! Your account has been created.';
    this.alertColor = 'green';
  }
}
