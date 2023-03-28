import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';

import {
  AngularFirestore,
  AngularFirestoreCollection,
  DocumentReference,
  QuerySnapshot,
} from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';

import { of, switchMap, map, BehaviorSubject, combineLatest } from 'rxjs';

import { IClip } from '../models/clip.model';

@Injectable({
  providedIn: 'root',
})
export class ClipService implements Resolve<IClip | null> {
  public clipsCollection: AngularFirestoreCollection<IClip> = null;

  public pageClips: IClip[] = [];

  private pendingRequests: boolean = false;

  constructor(
    private db: AngularFirestore,
    private auth: AngularFireAuth,
    private storage: AngularFireStorage,
    private router: Router
  ) {
    this.clipsCollection = this.db.collection('clips');
  }

  public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.clipsCollection
      .doc(route.params['id'])
      .get()
      .pipe(
        map((snapshot) => {
          const data = snapshot.data();

          if (!data) {
            this.router.navigate(['/']);
            return null;
          }

          return data;
        })
      );
  }

  public createClip(data: IClip): Promise<DocumentReference<IClip>> {
    return this.clipsCollection.add(data);
  }

  public getUserClips(sortDirection: BehaviorSubject<string>) {
    return combineLatest([this.auth.user, sortDirection]).pipe(
      switchMap((values) => {
        const [user, sort] = values;

        if (!user) {
          return of([]);
        }

        const query = this.clipsCollection.ref
          .where('uid', '==', user.uid)
          .orderBy('timestamp', sort === '1' ? 'desc' : 'asc');

        return query.get();
      }),
      map((snapshot) => (snapshot as QuerySnapshot<IClip>).docs)
    );
  }

  public updateClip(id: string, title: string) {
    return this.clipsCollection.doc(id).update({ title: title });
  }

  public async deleteClip(clip: IClip): Promise<void> {
    const clipRef = this.storage.ref(`clips/${clip.fileName}`);
    const screenshotRef = this.storage.ref(
      `screenshots/${clip.screenshotFileName}`
    );

    clipRef.delete();
    screenshotRef.delete();

    await this.clipsCollection.doc(clip.docId).delete();
  }

  public async getClips(): Promise<void> {
    if (this.pendingRequests) {
      return;
    }

    this.pendingRequests = true;

    let query = this.clipsCollection.ref.orderBy('timestamp', 'desc').limit(6);

    const { length } = this.pageClips;

    if (length) {
      const lastDocID = this.pageClips[length - 1].docId;
      const lastDoc = await this.clipsCollection
        .doc(lastDocID)
        .get()
        .toPromise();

      query = query.startAfter(lastDoc);
    }

    const snapshot = await query.get();

    snapshot.forEach((doc) => {
      this.pageClips.push({
        docId: doc.id,
        ...doc.data(),
      });
    });

    this.pendingRequests = false;
  }
}
