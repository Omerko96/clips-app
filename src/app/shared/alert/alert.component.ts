import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css'],
})
export class AlertComponent {
  @Input() public color: string = 'blue';

  public get bgColor(): string {
    return `bg-${this.color}-400`;
  }
}
