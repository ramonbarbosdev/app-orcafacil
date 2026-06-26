import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  getOnline(): Observable<unknown[]> {
    return of([]);
  }

  sendMessage(_destination: string, _payload: unknown): void {}
}
