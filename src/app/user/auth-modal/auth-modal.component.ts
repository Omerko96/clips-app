import { Component, OnInit, OnDestroy } from '@angular/core';

import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-auth-modal',
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.css'],
})
export class AuthModalComponent implements OnInit, OnDestroy {
  constructor(private modalService: ModalService) {}

  ngOnInit(): void {
    this.modalService.register('auth');
  }

  ngOnDestroy(): void {
    this.modalService.unregister('auth');
  }
}
