import { Injectable } from '@angular/core';

import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

@Injectable({
  providedIn: 'root',
})
export class FfmpegService {
  public isReady: boolean = false;
  public isRunning: boolean = false;

  private ffmpeg;

  constructor() {
    this.ffmpeg = createFFmpeg({ log: true });
  }

  public async init(): Promise<void> {
    if (this.isReady) {
      return;
    }

    await this.ffmpeg.load();

    this.isReady = true;
  }

  public async getScreenshots(file: File): Promise<string[]> {
    this.isRunning = true;

    const data = await fetchFile(file);

    this.ffmpeg.FS('writeFile', file.name, data);

    const seconds = [1, 2, 3];
    const commands: string[] = [];

    seconds.forEach((second) => {
      commands.push(
        '-i',
        file.name,
        '-ss',
        `00:00:0${second}`,
        '-frames:v',
        '1',
        '-filter:v',
        'scale=510:-1',
        `output_0${second}.png`
      );
    });

    await this.ffmpeg.run(...commands);

    const screenshots: string[] = [];

    seconds.forEach((second) => {
      const screenshotFile = this.ffmpeg.FS(
        'readFile',
        `output_0${second}.png`
      );

      const screenshotBlog = new Blob([screenshotFile.buffer], {
        type: 'image/png',
      });

      const screenshotURL = URL.createObjectURL(screenshotBlog);

      screenshots.push(screenshotURL);
    });

    this.isRunning = false;
    return screenshots;
  }

  public async blogFromURL(url: string): Promise<Blob> {
    const response = await fetch(url);
    const blob = await response.blob();

    return blob;
  }
}
