import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

// Alert türlerini tanımlıyoruz
export type AlertType = 'success' | 'error' | 'info' | 'warning';

export interface AlertData {
  title: string;
  message: string;
  type: AlertType;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  private alertSubject = new Subject<AlertData | null>();
  alertState$ = this.alertSubject.asObservable();


  show(title: string, message: string, type: AlertType = 'info') {
    this.alertSubject.next({ title, message, type });
  }

  close() {
    this.alertSubject.next(null);
  }
}