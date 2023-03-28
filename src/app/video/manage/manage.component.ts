import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { IClip } from 'src/app/models/clip.model';

import { ClipService } from 'src/app/services/clip.service';
import { ModalService } from 'src/app/services/modal.service';

import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css'],
})
export class ManageComponent implements OnInit {
  private sortDirection: BehaviorSubject<string>;

  public clips: IClip[] = [];
  public activeClip: IClip | null = null;

  public videoOrder: string = '1';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private clipService: ClipService,
    private modal: ModalService
  ) {
    this.sortDirection = new BehaviorSubject(this.videoOrder);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: Params) => {
      this.videoOrder = params['sort'] === '2' ? params['sort'] : '1';
      this.sortDirection.next(this.videoOrder);
    });

    this.clipService.getUserClips(this.sortDirection).subscribe((docs) => {
      this.clips = [];
      docs.forEach((doc) => {
        this.clips.push({
          docId: doc.id,
          ...doc.data(),
        });
      });
    });
  }

  public sort(event: Event): void {
    const { value } = event.target as HTMLSelectElement;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        sort: value,
      },
    });
  }

  public openModal(event: Event, clip: IClip): void {
    event.preventDefault();

    this.activeClip = clip;

    this.modal.toggleModal('editClip');
  }

  public update(clip: IClip): void {
    this.clips.forEach((element, index) => {
      if (element.docId === clip.docId) {
        this.clips[index].title = clip.title;
      }
    });
  }

  public deleteClip(event: Event, clip: IClip): void {
    event.preventDefault();

    this.clipService.deleteClip(clip);

    this.clips.forEach((element, index) => {
      if (element.docId == clip.docId) {
        this.clips.splice(index, 1);
      }
    });
  }

  public async copyToClipboard(
    event: MouseEvent,
    docId: string | undefined
  ): Promise<void> {
    event.preventDefault();

    if (!docId) {
      return;
    }

    const url = `${location.origin}/clip/${docId}`;

    await navigator.clipboard.writeText(url);

    alert('Copied to clipboard!');
  }
}
