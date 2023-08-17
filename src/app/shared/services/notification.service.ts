import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  errors: string[] = [];

  constructor() {}

  addNotif(type: 'error' | 'simpleNotif', message: string) {
    if (type === 'error') {
      this.errors.push(message);
      setTimeout(() => {
        const i = this.errors.indexOf(message);
        this.errors.splice(i, 1);
      }, 3000);
    }
  }
  clearAll() {
    this.errors = [];
  }
  clearOneError(index: number) {
    this.errors.splice(index, 1);
  }
}
