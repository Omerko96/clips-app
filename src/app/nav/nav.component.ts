import { Component } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/compat/auth';

import { ModalService } from '../services/modal.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
})
export class NavComponent {
  public isAuthenticated: boolean = false;

  constructor(
    private modalService: ModalService,
    public auth: AuthService,
    private afAuth: AngularFireAuth
  ) {}

  public openModal(event: Event): void {
    event.preventDefault();

    this.modalService.toggleModal('auth');
  }
}
