import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css'],
})
export class InputComponent {
  @Input() public control: FormControl = new FormControl();
  @Input() public type: string = 'text';
  @Input() public placeholder: string = '';
  @Input() public format: string = '';
}
