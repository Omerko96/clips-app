import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import firebase from 'firebase/compat/app';
import {
  AngularFireStorage,
  AngularFireUploadTask,
} from '@angular/fire/compat/storage';
import { AngularFireAuth } from '@angular/fire/compat/auth';

import { v4 as uuid } from 'uuid';

import { switchMap } from 'rxjs/operators';

import { ClipService } from 'src/app/services/clip.service';
import { FfmpegService } from 'src/app/services/ffmpeg.service';
import { combineLatest, forkJoin } from 'rxjs';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'],
})
export class UploadComponent implements OnDestroy {
  public isDragover: boolean = false;
  public file: File | null = null;
  public nextStep: boolean = false;
  public showAlert: boolean = false;
  public alertColor: string = 'blue';
  public alertMessage: string = 'Please wait. Your clip is being uploaded.';
  public inSubmission: boolean = false;
  public percentage: number = 0;
  public showPercentage: boolean = false;
  public task: AngularFireUploadTask = null;
  public screenshots: string[] = [];
  public selectedScreenshot: string = '';
  public screenshotTask: AngularFireUploadTask = null;

  public user: firebase.User | null = null;

  public title: FormControl = new FormControl('', {
    validators: [Validators.required, Validators.minLength(3)],
    nonNullable: true,
  });
  public uploadForm: FormGroup = new FormGroup({
    title: this.title,
  });

  constructor(
    private storage: AngularFireStorage,
    private auth: AngularFireAuth,
    private clipService: ClipService,
    private router: Router,
    public ffmpegService: FfmpegService
  ) {
    auth.user.subscribe((user) => (this.user = user));
    this.ffmpegService.init();
  }

  ngOnDestroy(): void {
    if (this.task) {
      this.task.cancel();
    }
  }

  public async storeFile(event: Event): Promise<void> {
    if (this.ffmpegService.isRunning) {
      return;
    }

    this.isDragover = false;

    this.file = (event as DragEvent).dataTransfer
      ? (event as DragEvent).dataTransfer.files.item(0) ?? null
      : (event.target as HTMLInputElement).files.item(0) ?? null;

    if (!this.file || this.file.type !== 'video/mp4') {
      return;
    }

    this.screenshots = await this.ffmpegService.getScreenshots(this.file);

    this.selectedScreenshot = this.screenshots[0];

    this.title.setValue(this.file.name.replace(/\.[^/.]+$/, ''));
    this.nextStep = true;
  }

  public async uploadFile(): Promise<void> {
    this.uploadForm.disable();

    this.showAlert = true;
    this.alertColor = 'blue';
    this.alertMessage = 'Please wait. Your clip is being uploaded.';
    this.inSubmission = true;
    this.showPercentage = true;

    const clipFileName = uuid();
    const clipPath = `clips/${clipFileName}.mp4`;

    const screenshotBlob = await this.ffmpegService.blogFromURL(
      this.selectedScreenshot
    );
    const screenshotPath = `screenshots/${clipFileName}.png`;

    this.task = this.storage.upload(clipPath, this.file);
    const clipRef = this.storage.ref(clipPath);

    this.screenshotTask = this.storage.upload(screenshotPath, screenshotBlob);
    const screenshotRef = this.storage.ref(screenshotPath);

    combineLatest([
      this.task.percentageChanges(),
      this.screenshotTask.percentageChanges(),
    ]).subscribe((progress) => {
      const [clipProgress, screenshotProgress] = progress;

      if (!clipProgress || !screenshotProgress) {
        return;
      }

      const total = clipProgress + screenshotProgress;

      this.percentage = total / 200;
    });

    forkJoin([
      this.task.snapshotChanges(),
      this.screenshotTask.snapshotChanges(),
    ])
      .pipe(
        switchMap(() =>
          forkJoin([clipRef.getDownloadURL(), screenshotRef.getDownloadURL()])
        )
      )
      .subscribe({
        next: async (urls) => {
          const [clipUrl, screenshotUrl] = urls;

          const clip = {
            uid: this.user?.uid,
            displayName: this.user?.displayName,
            title: this.title.value,
            fileName: `${clipFileName}.mp4`,
            url: clipUrl,
            screenshotUrl,
            screenshotFileName: `${clipFileName}.png`,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          };

          const clipDocRef = await this.clipService.createClip(clip);

          this.alertColor = 'green';
          this.alertMessage =
            'Success! Your clip is now ready to share with the world.';
          this.showPercentage = false;

          setTimeout(() => {
            this.router.navigate(['clip', clipDocRef.id]);
          }, 1000);
        },
        error: (error) => {
          this.uploadForm.enable();

          this.alertColor = 'red';
          this.alertMessage = 'Upload failed! Please try again later.';
          this.inSubmission = true;
          this.showPercentage = false;
        },
      });
  }
}
