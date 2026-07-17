import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertData, AlertService } from '../../Services/alert';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-custom-alert-component',
  imports: [CommonModule],
  templateUrl: './custom-alert-component.html',
  styleUrl: './custom-alert-component.css',
})
export class CustomAlertComponent {

  alert$: Observable<AlertData | null>;

  constructor(private alertService: AlertService) {
    this.alert$ = this.alertService.alertState$;
  }

  close() {
    this.alertService.close();
  }
}
