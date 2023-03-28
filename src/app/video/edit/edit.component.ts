import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  EventEmitter,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IClip } from 'src/app/models/clip.model';

import { ModalService } from 'src/app/services/modal.service';
import { ClipService } from 'src/app/services/clip.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css'],
})
export class EditComponent implements OnInit, OnChanges, OnDestroy {
  @Input() public activeClip: IClip | null = null;
  @Output() public update = new EventEmitter();

  public clipId = new FormControl('', { nonNullable: true });
  public title: FormControl = new FormControl('', {
    validators: [Validators.required, Validators.minLength(3)],
    nonNullable: true,
  });
  public editForm: FormGroup = new FormGroup({
    title: this.title,
    clipId: this.clipId,
  });

  public alertColor: string = 'blue';
  public alertMessage: string = 'Please wait! Updating clip.';

  public inSubmission: boolean = false;
  public showAlert: boolean = false;

  constructor(private modal: ModalService, private clipService: ClipService) {}

  ngOnInit(): void {
    this.modal.register('editClip');
  }

  ngOnChanges(): void {
    if (!this.activeClip) {
      return;
    }

    this.clipId.setValue(this.activeClip.docId);
    this.title.setValue(this.activeClip.title);
  }

  ngOnDestroy(): void {
    this.inSubmission = false;
    this.showAlert = false;
    this.modal.unregister('editClip');
  }

  public async submit(): Promise<void> {
    if (!this.activeClip) {
      return;
    }

    this.alertColor = 'blue';
    this.alertMessage = 'Please wait! Updating clip.';
    this.inSubmission = true;
    this.showAlert = true;

    try {
      await this.clipService.updateClip(
        this.activeClip.docId,
        this.activeClip.title
      );
    } catch (e) {
      this.inSubmission = false;
      this.alertColor = 'red';
      this.alertMessage = 'Something went wrong. Try again later.';
      return;
    }

    this.activeClip.title = this.title.value;
    this.update.emit(this.activeClip);

    this.inSubmission = false;
    this.alertColor = 'green';
    this.alertMessage = 'Success!';
  }
}
