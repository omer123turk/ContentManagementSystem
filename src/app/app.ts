import { Component, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CustomAlertComponent } from './components/custom-alert-component/custom-alert-component';




@Component({
  selector: 'app-root',
  imports: [RouterOutlet,RouterLink,CustomAlertComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('ContentManagementSystem');
}
