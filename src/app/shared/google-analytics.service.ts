// src/app/shared/google-analytics.service.ts
import { Injectable } from '@angular/core';

declare let gtag: Function;

@Injectable({
  providedIn: 'root',
})
export class GoogleAnalyticsService {
  public sendEvent(eventName: string, params?: any) {
    if (typeof gtag === 'function') {
      gtag('event', eventName, params);
    }
  }
}
