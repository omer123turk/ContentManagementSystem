import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-component',
  imports: [CommonModule],
  templateUrl: './loading-component.html',
  styleUrl: './loading-component.css',
})
export class LoadingComponent {

  @Input() isLoading: boolean = false;

  @Input() message: string = 'Please wait...';
}
