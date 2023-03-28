import { Component, OnInit, Input, ElementRef, OnDestroy } from '@angular/core';

import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input() public modalId: string = '';

  constructor(public modalService: ModalService, private el: ElementRef) {}

  ngOnInit(): void {
    document.body.appendChild(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    document.body.removeChild(this.el.nativeElement);
  }

  public closeModal(): void {
    this.modalService.toggleModal(this.modalId);
  }
}
